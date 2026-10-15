import type { Game } from './types';
import { classifyGenres } from './genres';
export const EDITION = 'sale_nextfest_october_2026';
export const OFFICIAL_URL = 'https://store.steampowered.com/sale/nextfest?l=schinese';
export const PREVIEW_URL = 'https://store.steampowered.com/sale/nextfest_oct26_press/?l=schinese';
export const DOC_URL = 'https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026october';
// Formal festival dates from DOC_URL; the preview event has a different window.
export const FEST_START = '2026-10-19T17:00:00.000Z';
export const FEST_END = '2026-10-26T17:00:00.000Z';
const decode = (s:string) => s.replaceAll('&quot;','"').replaceAll('&amp;','&').replaceAll('&#039;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
export function extractEvent(html:string): {appIds:number[]; eventId:string; title:string; start:string; end:string} {
  const match=html.match(/data-partnereventstore="([^"]*)"/);
  if(!match) throw new Error('Official event configuration unavailable');
  const events=JSON.parse(decode(match[1]));
  for(const event of events) {
    const config=JSON.parse(event.jsondata);
    if(config.sale_opt_in_page_name!==EDITION) continue;
    // Registration pool from this edition, rather than a generic Steam search or recommendations.
    const capsules = config.tagged_items?.length ? config.tagged_items.map((t:any)=>t.capsule) : config.sale_sections.flatMap((s:any)=>s.capsules??[]);
    const appIds:number[]=[...new Set<number>(capsules.filter((c:any)=>c.type==='game'&&Number.isSafeInteger(c.id)&&c.id>0).map((c:any)=>c.id))];
    if(!appIds.length) throw new Error('Official edition returned an empty registration pool; keep previous snapshot');
    return {appIds,eventId:String(event.gid),title:event.event_name,start:new Date(event.rtime32_start_time*1000).toISOString(),end:new Date(event.rtime32_end_time*1000).toISOString()};
  }
  throw new Error('Official edition mismatch; keep previous snapshot');
}
export function normalizeGame(item:any,tags:Record<string,string>,at:string):Game|null {
  if(item.success!==1||item.type!==0||!item.name||!item.visible) return null;
  const id=item.appid??item.id;
  const tagids:number[]=item.tagids??item.tags?.map((t:any)=>t.tagid)??[];
  const tagNames=tagids.map(id=>tags[String(id)]).filter(Boolean);
  const asset=item.assets;
  const filename=asset?.main_capsule??asset?.header;
  const cover=asset?.asset_url_format&&filename?'https://shared.fastly.steamstatic.com/store_item_assets/'+asset.asset_url_format.replace('${FILENAME}',filename):null;
  const languages=item.supported_languages;
  return {appId:id,name:decode(item.name),cover,storeUrl:`https://store.steampowered.com/app/${id}/?l=schinese`,genres:classifyGenres(tagNames),tags:tagNames,
    chinese:!Array.isArray(languages)?'unknown':languages.some((l:any)=>l.elanguage===6&&l.supported)?'supported':'unsupported',
    platforms:['windows','mac','steamos_linux'].filter(p=>item.platforms?.[p]).map(p=>p==='steamos_linux'?'linux':p),
    demoIds:[...new Set<number>(item.related_items?.demo_appid??[])],releaseDate:item.release?.steam_release_date??null,comingSoon:!!(item.is_coming_soon||item.release?.is_coming_soon),
    description:decode((item.basic_info?.short_description??'').replace(/<[^>]*>/g,'')),developer:item.basic_info?.developers?.[0]?.name??'',
    registration:item.optin_registration_tags?.some((o:any)=>o.optin_name===EDITION)?'verified':'preview',updatedAt:at};
}
