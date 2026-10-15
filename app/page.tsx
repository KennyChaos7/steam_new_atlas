import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Atlas from '@/components/Atlas';
import { DEFAULT_SORT, queryGames } from '@/lib/query';
import { GENRES, type Catalog } from '@/lib/types';
export default async function Page(){
  const catalog:Catalog=JSON.parse(await readFile(path.join(process.cwd(),'data/catalog.json'),'utf8'));
  const games=queryGames(catalog.games,{search:'',genres:[],chinese:'all',platform:'all',demoOnly:false,sort:DEFAULT_SORT,page:1,pageSize:catalog.games.length}).games;
  const initial=games.slice(0,24);
  const {games:allCandidates,...summary}=catalog;
  const genreCounts=Object.fromEntries(GENRES.map(genre=>[genre,games.filter(g=>g.genres.includes(genre)).length]));
  return <Atlas initialGames={initial} summary={summary} genreCounts={genreCounts} chineseCount={games.filter(g=>g.chinese==='supported').length} demoCount={games.filter(g=>g.demoIds.length>0).length}/>;
}
