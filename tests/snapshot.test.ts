import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import type {Catalog} from '../lib/types';
import {classifyGenres} from '../lib/genres';
test('delivered snapshot is an exact partition of official candidates with consistent public export',()=>{
  const catalog:Catalog=JSON.parse(fs.readFileSync('data/catalog.json','utf8'));
  const membership=JSON.parse(fs.readFileSync('data/membership.json','utf8'));
  const candidates=new Set<number>(membership.appIds);
  assert.equal(catalog.eventStart,'2026-10-19T17:00:00.000Z','festival dates must not use the press-preview window');
  assert.equal(catalog.eventEnd,'2026-10-26T17:00:00.000Z');
  const ids=catalog.games.map(g=>g.appId);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(candidates.size,catalog.candidateCount);
  assert.equal(catalog.games.length,catalog.retrievedCount);
  assert.equal(catalog.registrationVerifiedCount,catalog.games.filter(g=>g.registration==='verified').length);
  assert.equal(catalog.retrievedCount+catalog.missingAppIds.length,catalog.candidateCount);
  assert.deepEqual(new Set([...ids,...catalog.missingAppIds]),candidates);
  assert.deepEqual(new Set([...catalog.failedAppIds,...catalog.metadataUnavailableAppIds]),new Set(catalog.missingAppIds));
  for(const game of catalog.games){
    assert.ok(candidates.has(game.appId));
    assert.equal(new URL(game.storeUrl).pathname,`/app/${game.appId}/`);
    assert.equal(new URL(game.storeUrl).hostname,'store.steampowered.com');
    if(game.cover)assert.equal(new URL(game.cover).hostname,'shared.fastly.steamstatic.com');
    assert.ok(['supported','unsupported','unknown'].includes(game.chinese));
    assert.ok(game.genres.length>0);
    assert.deepEqual(game.genres,classifyGenres(game.tags),`stale genres for App ${game.appId}`);
  }
  assert.deepEqual(JSON.parse(fs.readFileSync('public/catalog.json','utf8')),catalog);
});
