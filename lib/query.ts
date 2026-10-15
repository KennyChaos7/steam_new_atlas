import type { Game } from './types';
export const DEFAULT_SORT = 'release';
export interface Query { search:string; genres:string[]; chinese:string; platform:string; demoOnly:boolean; sort:string; page:number; pageSize:number }
export function queryGames(games:Game[],q:Query) {
  const words=q.search.toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtered=games.filter(g=>g.registration==='verified'&&words.every(w=>[g.name,g.appId.toString(),...g.tags,g.developer].join(' ').toLocaleLowerCase().includes(w))&&(!q.genres.length||q.genres.some(genre=>g.genres.includes(genre)))&&(q.chinese==='all'||g.chinese===q.chinese)&&(q.platform==='all'||g.platforms.includes(q.platform))&&(!q.demoOnly||g.demoIds.length>0));
  filtered.sort((a,b)=>q.sort==='name'?a.name.localeCompare(b.name,'zh-CN'):q.sort==='release'?(a.releaseDate??Infinity)-(b.releaseDate??Infinity)||a.appId-b.appId:q.sort==='appid'?b.appId-a.appId:Number(b.chinese==='supported')-Number(a.chinese==='supported')||a.name.localeCompare(b.name,'zh-CN'));
  const total=filtered.length;const pages=Math.max(1,Math.ceil(total/q.pageSize));const page=Math.max(1,Math.min(q.page,pages));
  return {games:filtered.slice((page-1)*q.pageSize,page*q.pageSize),total,pages,page};
}
