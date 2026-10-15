import fs from 'node:fs/promises';
import path from 'node:path';
import { extractEvent, normalizeGame, PREVIEW_URL, OFFICIAL_URL, DOC_URL, FEST_START, FEST_END } from '../lib/steam';
import type { Catalog } from '../lib/types';

const root=process.cwd();const cacheDir=path.join(root,'.cache');const refresh=process.argv.includes('--refresh');
const TTL=24*60*60*1000;
await fs.mkdir(cacheDir,{recursive:true});await fs.mkdir(path.join(root,'data'),{recursive:true});
async function get(url:string,key:string,json=true):Promise<{value:any;at:string}> {
  const file=path.join(cacheDir,key+'.json');
  if(!refresh) {try{const c=JSON.parse(await fs.readFile(file,'utf8'));if(Date.now()-Date.parse(c.at)<TTL)return c;}catch{}}
  const response=await fetch(url,{headers:{'User-Agent':'NextFestAtlas/1.0 (public Steam catalogue reader)'},signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw new Error(`HTTP ${response.status}: ${new URL(url).pathname}`);
  const value=json?await response.json():await response.text();const c={value,at:new Date().toISOString()};
  await fs.writeFile(file,JSON.stringify(c));return c;
}
const input=(obj:any)=>encodeURIComponent(JSON.stringify(obj));
const eventResponse=await get(PREVIEW_URL,'event',false);
const event=extractEvent(eventResponse.value);
await fs.writeFile(path.join(root,'data/membership.json'),JSON.stringify({...event,sourceUrl:PREVIEW_URL,checkedAt:eventResponse.at},null,2));
const tagsResponse=await get('https://api.steampowered.com/IStoreService/GetTagList/v1/?input_json='+input({language:'schinese'}),'tags');
if(!tagsResponse.value.response?.tags?.length) throw new Error('Official tag dictionary unavailable');
const tags=Object.fromEntries(tagsResponse.value.response.tags.map((t:any)=>[String(t.tagid),t.name]));
const dataRequest={include_assets:true,include_tag_count:20,include_release:true,include_platforms:true,include_basic_info:true,include_supported_languages:true,include_optin_registration_tags:true,include_best_purchase_option:false};
const results=new Map<number,any>();const failedAppIds:number[]=[];
const chunks:number[][]=[];for(let i=0;i<event.appIds.length;i+=80) chunks.push(event.appIds.slice(i,i+80));
console.log(`Official preview pool: ${event.appIds.length} unique App IDs. ${chunks.length} batches.`);
// Two bounded workers avoid flooding the public endpoint; successful batches are cached for resumption.
let cursor=0;
async function worker(){while(cursor<chunks.length){const index=cursor++;const ids=chunks[index];try{
  const url='https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json='+input({ids:ids.map(appid=>({appid})),context:{language:'schinese',country_code:'US'},data_request:dataRequest});
  const response=await get(url,`items-${index}-${ids[0]}`);
  if(!Array.isArray(response.value.response?.store_items))throw new Error('Missing store_items');
  for(const item of response.value.response.store_items){if(ids.includes(item.appid??item.id))results.set(item.appid??item.id,{item,at:response.at});}
  console.log(`Batch ${index+1}/${chunks.length}: ${response.value.response.store_items.length} responses`);
}catch(error){console.error(`Batch ${index+1} failed: ${String(error)}`);failedAppIds.push(...ids);}await new Promise(resolve=>setTimeout(resolve,300));}}
await Promise.all([worker(),worker()]);
// Observed large-batch timeouts: make one bounded pass with smaller requests.
// Keep successful original batches; never re-query the entire pool to recover a few IDs.
const remainingFailures=[...failedAppIds];failedAppIds.length=0;
for(let i=0;i<remainingFailures.length;i+=20){const ids=remainingFailures.slice(i,i+20);try{
  const url='https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json='+input({ids:ids.map(appid=>({appid})),context:{language:'schinese',country_code:'US'},data_request:dataRequest});
  const response=await get(url,`recovery-${ids[0]}-${ids.length}`);
  if(!Array.isArray(response.value.response?.store_items))throw new Error('Missing store_items');
  for(const item of response.value.response.store_items){if(ids.includes(item.appid??item.id))results.set(item.appid??item.id,{item,at:response.at});}
  console.log(`Recovery ${i+1}–${i+ids.length}: ${response.value.response.store_items.length} responses`);
}catch(error){failedAppIds.push(...ids);console.error(`Recovery for ${ids[0]} failed: ${String(error)}`);}}
if(!results.size)throw new Error('No metadata received; previous catalogue retained');
const games=event.appIds.map(id=>results.get(id)).filter(Boolean).map(r=>normalizeGame(r.item,tags,r.at)).filter(g=>g!==null);
const missingAppIds=event.appIds.filter(id=>!games.some(g=>g.appId===id));
const catalog:Catalog={edition:'2026-10',updatedAt:new Date().toISOString(),eventStart:FEST_START,eventEnd:FEST_END,previewStart:event.start,previewEnd:event.end,scheduleSourceUrl:DOC_URL,eventId:event.eventId,status:'preview',region:'US',sourceTitle:event.title,sourceUrl:PREVIEW_URL,publicUrl:OFFICIAL_URL,candidateCount:event.appIds.length,retrievedCount:games.length,registrationVerifiedCount:games.filter(g=>g.registration==='verified').length,missingAppIds,failedAppIds,metadataUnavailableAppIds:missingAppIds.filter(id=>!failedAppIds.includes(id)),games};
// Publish one coherent snapshot. Interrupted runs never truncate the last usable catalogue.
const target=path.join(root,'data/catalog.json');await fs.writeFile(target+'.tmp',JSON.stringify(catalog));await fs.rename(target+'.tmp',target);
await fs.writeFile(path.join(root,'public/catalog.json'),JSON.stringify(catalog));
console.log(JSON.stringify({candidateCount:catalog.candidateCount,retrievedCount:catalog.retrievedCount,registered:catalog.registrationVerifiedCount,missing:missingAppIds.length,failed:failedAppIds.length},null,2));
