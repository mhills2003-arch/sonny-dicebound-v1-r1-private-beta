import test from 'node:test';
import assert from 'node:assert/strict';
import {ENDGAME_BOSSES} from '../src/endgame-maze.mjs';
import {mazeBossHazardTiles} from '../src/maze-play.mjs';
test('all six endgame bosses have unique telegraphed hazard footprints in each phase',()=>{
 assert.equal(ENDGAME_BOSSES.length,6);
 for(let phase=0;phase<3;phase++){
  const patterns=ENDGAME_BOSSES.map(b=>mazeBossHazardTiles(b.id,phase,4));
  assert.equal(new Set(patterns.map(p=>JSON.stringify(p))).size,6);
  for(const tiles of patterns){
   assert(tiles.length>=1);
   assert(tiles.every(t=>Number.isInteger(t.x)&&Number.isInteger(t.y)&&t.x>=0&&t.x<=6&&t.y>=0&&t.y<=6));
   assert.equal(new Set(tiles.map(t=>`${t.x},${t.y}`)).size,tiles.length);
  }
 }
});
test('boss hazard patterns vary by round and phase, never depend on client randomness',()=>{
 for(const boss of ENDGAME_BOSSES){
  const a=mazeBossHazardTiles(boss.id,0,1),b=mazeBossHazardTiles(boss.id,2,3);
  assert.deepEqual(mazeBossHazardTiles(boss.id,0,1),a);
  assert.notDeepEqual(a,b);
 }
});
