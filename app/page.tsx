import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Atlas from '@/components/Atlas';
import { queryGames } from '@/lib/query';
import type { Catalog } from '@/lib/types';
export default async function Page(){
  const catalog:Catalog=JSON.parse(await readFile(path.join(process.cwd(),'data/catalog.json'),'utf8'));
  const initial=queryGames(catalog.games,{search:'',genres:[],chinese:'all',platform:'all',demoOnly:false,sort:'chinese',page:1,pageSize:24}).games;
  const {games,...summary}=catalog;
  const genreCounts=Object.fromEntries(['动作','RPG','策略','模拟经营','冒险解谜','恐怖','卡牌','生存','其他'].map(genre=>[genre,games.filter(g=>g.genres.includes(genre)).length]));
  return <Atlas initialGames={initial} summary={summary} genreCounts={genreCounts} chineseCount={games.filter(g=>g.chinese==='supported').length} demoCount={games.filter(g=>g.demoIds.length>0).length}/>;
}
