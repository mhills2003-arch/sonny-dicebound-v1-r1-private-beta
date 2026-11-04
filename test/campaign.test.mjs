import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_DATA,ROOM_IDS} from '../src/engine.mjs';
import {PLAYABLE_QUESTS} from '../src/campaign.mjs';
const catalog = JSON.parse(readFileSync(new URL('../public/campaign-catalog.json',import.meta.url), 'utf8'));

test('catalogue is the original 15 quests with exactly 133 original rooms',()=>{
  assert.equal(catalog.quests.length,15);
  assert.equal(catalog.quests.reduce((n,q)=>n+q.rooms.length,0),133);
  assert.deepEqual(catalog.quests.map(q=>q.number),Array.from({length:15},(_,i)=>i+1));
});
test('Quest 1 catalogue matches current multiplayer room sequence',()=>{
  const q=catalog.quests[0];
  assert.equal(q.name,'A Roll in the Woods');
  assert.deepEqual(q.rooms.map(x=>x.name),[ROOM_DATA.woodland.name,ROOM_DATA.clearing.name,ROOM_DATA.watchpost.name]);
});
test('quest room count and metadata is consistent',()=>{
  for (const quest of catalog.quests){
    assert.equal(quest.roomCount,quest.rooms.length);
    assert.ok(quest.name && quest.difficulty && quest.environment);
    for(const room of quest.rooms){assert.ok(room.name && room.description)}
  }
});
test('advanced quests retain their original structures and names',()=>{
  assert.equal(catalog.quests[12].name,'No Dice');
  assert.equal(catalog.quests[13].name,'The Abyss of Fortune');
  assert.equal(catalog.quests[14].name,'The Last Roll');
  assert.deepEqual(catalog.quests.slice(12).map(q=>q.roomCount),[15,15,15]);
});

test('playable campaign metadata is an exact room-name projection of original quests 1–4',()=>{
 const playable=catalog.quests.slice(0,4);
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>=1&&ROOM_DATA[id].quest<=4).length,18);
 for(const q of playable){
   const actual=Object.values(ROOM_DATA).filter(r=>r.quest===q.number);
   assert.deepEqual(actual.map(r=>r.name),q.rooms.map(r=>r.name));
   assert.deepEqual(PLAYABLE_QUESTS[q.number].rooms.map(r=>r.description),q.rooms.map(r=>r.description));
   assert.equal(actual.at(-1).final,true);
 }
});
