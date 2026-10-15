import {test} from 'node:test';
import assert from 'node:assert/strict';
import config from '../next.config';
test('static export targets the supplied GitHub Pages repository path',()=>{
  assert.equal(config.output,'export');
  assert.equal(config.basePath,'/steam_new_atlas');
  assert.equal(config.images?.unoptimized,true);
});
