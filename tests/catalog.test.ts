import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractEvent, normalizeGame } from '../lib/steam';
import { queryGames } from '../lib/query';

test('official event parser deduplicates only game capsules and validates edition', () => {
  const event = {gid:'test-event',event_name:'October 2026',rtime32_start_time:1792429200,rtime32_end_time:1793034000,jsondata:JSON.stringify({sale_opt_in_page_name:'sale_nextfest_october_2026',sale_sections:[{capsules:[{id:100,type:'game'},{id:100,type:'game'},{id:999,type:'bundle'}]}],tagged_items:[]})};
  const html=`<div data-partnereventstore="${JSON.stringify([event]).replaceAll('"','&quot;')}"></div>`;
  assert.deepEqual(extractEvent(html).appIds,[100]);
  assert.throws(()=>extractEvent(html.replaceAll('sale_nextfest_october_2026','sale_nextfest_june_2026')),/edition/i);
});

const item = {appid:100,success:1,visible:true,type:0,name:'官方中文名',tagids:[19,1667],assets:{asset_url_format:'steam/apps/100/${FILENAME}?t=1',header:'official/header.jpg'},supported_languages:[{elanguage:6,supported:true}],platforms:{windows:true},related_items:{demo_appid:[101]},optin_registration_tags:[{optin_name:'sale_nextfest_october_2026',values:[]}]};
test('normalization keeps official metadata and distinguishes unknown language from unsupported', () => {
  const g=normalizeGame(item,{'19':'动作','1667':'恐怖'},'2026-10-15T00:00:00Z');
  assert.equal(g?.name,'官方中文名'); assert.equal(g?.chinese,'supported');
  assert.equal(g?.cover,'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/100/official/header.jpg?t=1');
  assert.deepEqual(g?.genres,['动作','恐怖']); assert.equal(g?.registration,'verified');
  assert.equal(normalizeGame({...item,supported_languages:undefined},{},'')?.chinese,'unknown');
  assert.equal(normalizeGame({...item,supported_languages:[{elanguage:0,supported:true}]},{},'')?.chinese,'unsupported');
  assert.equal(normalizeGame({...item,success:2},{},''),null);
});
test('search, genre OR, cross-filter AND, sorting and pagination compose correctly', () => {
  const a=normalizeGame(item,{},'')!;
  const b={...a,appId:200,name:'Beta',chinese:'unsupported' as const,genres:['策略'],platforms:['mac'],demoIds:[]};
  const c={...a,appId:300,name:'Alpha',genres:['恐怖']};
  assert.deepEqual(queryGames([a,b,c],{search:'100',genres:[],chinese:'all',platform:'all',demoOnly:false,sort:'name',page:1,pageSize:24}).games.map(g=>g.appId),[100]);
  const q={search:'',genres:['动作','策略'],chinese:'supported',platform:'windows',demoOnly:true,sort:'name',page:1,pageSize:24};
  assert.deepEqual(queryGames([a,b,c],q).games.map(g=>g.appId),[100]);
  const r=queryGames([a,b,c],{...q,genres:[],chinese:'all',platform:'all',demoOnly:false,page:9,pageSize:2});
  assert.equal(r.page,2);assert.equal(r.games.length,1);assert.equal(r.total,3);
});
