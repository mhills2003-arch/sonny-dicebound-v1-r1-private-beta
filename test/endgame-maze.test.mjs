import test from 'node:test';import assert from 'node:assert/strict';
import {generateEndgameMaze,validateEndgameMaze,shortestPath,ENDGAME_BOSSES,chooseBoss,seededRandom} from '../src/endgame-maze.mjs';
test('deterministic seeded generation and no immediate repeat boss',()=>{
 const a=generateEndgameMaze({seed:'parent-approved-test'}),b=generateEndgameMaze({seed:'parent-approved-test'});
 assert.deepEqual(a,b);assert.notEqual(chooseBoss('parent-approved-test',a.bossId).id,a.bossId);
});
test('all six bosses have unique identities and phase mechanics',()=>{
 assert.equal(ENDGAME_BOSSES.length,6);assert.equal(new Set(ENDGAME_BOSSES.map(b=>b.id)).size,6);
 assert.equal(new Set(ENDGAME_BOSSES.map(b=>b.hazard)).size,6);
 for(const b of ENDGAME_BOSSES){assert.equal(b.phases.length,3);assert.ok(b.phases[0].at>b.phases[1].at&&b.phases[1].at>b.phases[2].at);assert.ok(b.warningRounds>=1)}
});
test('maze invariants survive 100 seeded replays for minimum and maximum lengths',()=>{
 for(let i=0;i<100;i++){
  const m=generateEndgameMaze({seed:'expedition-'+i,roomCount:i%2?50:30});
  assert.ok(validateEndgameMaze(m));assert.ok(m.loops>=1);assert.ok(shortestPath(m.rooms,m.entrance,m.bossRoomId).length-1>=15);
  assert.ok(m.bonusRoomIds.some(id=>m.rooms[id].hidden));
 }
});
test('tampering with truthful clue or side chamber depth is rejected',()=>{
 const m=generateEndgameMaze({seed:'tamper'});let nav=m.clues.find(c=>c.kind==='navigation');
 const save=nav.direction;nav.direction=save==='N'?'S':'N';assert.throws(()=>validateEndgameMaze(m),/false navigation clue/);
 nav.direction=save;m.rooms[m.bonusRoomIds[0]].depth=-1;
 // Validator relies on actual graph distance, not a client-controlled "depth" label.
 assert.ok(validateEndgameMaze(m));
});
test('invalid room counts rejected and random values deterministic',()=>{
 assert.throws(()=>generateEndgameMaze({seed:'a',roomCount:29}),/30–50/);
 assert.throws(()=>generateEndgameMaze({seed:'a',roomCount:51}),/30–50/);
 const a=seededRandom('same');const b=seededRandom('same');assert.deepEqual(Array.from({length:10},a),Array.from({length:10},b));
});
