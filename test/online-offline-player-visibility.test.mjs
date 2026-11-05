import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshState, ensurePlayer, markDisconnected, rollMovement, move, publicState } from '../src/engine.mjs';

const start = 1_800_000_000_000;
function world() {
  const s=freshState(start);
  ensurePlayer(s,'one','Player One');
  ensurePlayer(s,'two','Player Two');
  return s;
}

test('disconnect retains the character save and marks the second player offline for viewers', () => {
  const s=world();
  const before={...s.players.two};
  markDisconnected(s,'two',start);
  assert.equal(s.players.two.connected,false);
  assert.deepEqual([s.players.two.room,s.players.two.x,s.players.two.y,s.players.two.hp],[before.room,before.x,before.y,before.hp]);
  assert.equal(publicState(s,'one').players.two.connected,false);
});

test('offline players no longer block connected players, while rejoin restores valid positions', () => {
  const s=world();
  const oldSecondPosition=[s.players.two.x,s.players.two.y];
  markDisconnected(s,'two',start);
  rollMovement(s,'one',start,()=>0.999);
  move(s,'one','S',start);
  assert.deepEqual([s.players.one.x,s.players.one.y],oldSecondPosition);
  ensurePlayer(s,'two','Player Two');
  assert.equal(s.players.two.connected,true);
  assert.notDeepEqual([s.players.one.x,s.players.one.y],[s.players.two.x,s.players.two.y]);
  assert.equal(s.players.two.room,'woodland');
});

test('board, room count, and maze arena show connected heroes only; roster retains offline status',()=>{
  const client=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  const engine=readFileSync(new URL('../src/engine.mjs',import.meta.url),'utf8');
  const maze=readFileSync(new URL('../src/maze-play.mjs',import.meta.url),'utf8');
  assert.match(client,/filter\(p=>p\.connected&&p\.room===me\.room\)\.map\(p=>\(\{p,kind:p\.id\}\)\)/);
  assert.match(client,/filter\(p=>p\.connected&&p\.room===id\)\.length/);
  assert.match(client,/p\.connected\?'● Online · ':'○ Offline · '/);
  assert.match(client,/filter\(p=>p\.connected&&p\.mazeSlot===run\.slot/);
  assert.match(engine,/p\.id!==ignorePlayer&&p\.connected&&p\.room===roomId/);
  assert.match(maze,/s\.players\[id\]\?\.connected/);
});
