import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,ensurePlayer,createCharacter,publicState} from '../src/engine.mjs';
const time=1980000000000;
test('four individual characters can choose names and all four permanent classes',()=>{
 const world=freshState(time);
 for(const [id,name,klass] of [['one','Joe','knight'],['two','Isla','outlaw'],['three','Ash','warlock'],['four','Sam','tinker']]){
   ensurePlayer(world,id,'Temporary '+id);
   const result=createCharacter(world,id,name,klass,time);
   assert.equal(result.saved,'character-identity');
   assert.equal(world.players[id].name,name);
   assert.equal(world.players[id].klass,klass);
   assert.equal(world.players[id].classChosen,true);
   assert.equal(world.players[id].nameConfirmed,true);
 }
 assert.equal(Object.keys(world.players).length,4);
 for(const id of Object.keys(world.players)){
   assert.throws(()=>createCharacter(world,id,'Overwrite','knight',time),/already been registered/);
   const current=world.players[id].name;
   ensurePlayer(world,id,'Temporary overwritten');
   assert.equal(world.players[id].name,current,'reconnect must never erase a confirmed name');
   assert.equal(publicState(world,id).players[id].name,current);
 }
});
test('bad names and class choices cannot partially register a character',()=>{
 const world=freshState(time);ensurePlayer(world,'one','Guest');
 for(const name of ['', '!', '<script>', 'a'.repeat(25)]){
   assert.throws(()=>createCharacter(world,'one',name,'knight',time),/Name must/);
   assert.equal(world.players.one.nameConfirmed,undefined);
   assert.equal(world.players.one.classChosen,false);
 }
 assert.throws(()=>createCharacter(world,'one','Valid','invalid',time),/valid character class/);
 assert.equal(world.players.one.classChosen,false);
});
test('legacy class is retained when choosing a name; cannot change class during name registration',async()=>{
 const {selectClass}=await import('../src/engine.mjs');
 const world=freshState(time);ensurePlayer(world,'one','OldName');
 selectClass(world,'one','outlaw',time);
 assert.throws(()=>createCharacter(world,'one','Legacy Player','knight',time),/permanent class/);
 createCharacter(world,'one','Legacy Player','outlaw',time);
 assert.equal(world.players.one.klass,'outlaw');
 assert.equal(world.players.one.name,'Legacy Player');
});
test('beta routes isolate local and online games and protect local seat overrides',()=>{
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert.match(worker,/const roomKey=mode==='local'\?'v1-local-four-seat-test'/);
 assert.match(worker,/mode==='local'&&\(identity\.id!=='one'/);
 assert.match(worker,/headers\.set\('x-dicebound-player',activeId\)/);
 assert.match(worker,/if\(u\.pathname===ROOT\+'\/play'&&u\.searchParams\.get\('mode'\)==='local'/);
 assert.match(worker,/if\(req\.method==='GET'&&u\.pathname===ROOT\+'\/'\)return reply\(landingScreen/);
});
test('local browser connects up to four separate websocket seats and uses one character-creation form',()=>{
 const ui=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 assert.match(ui,/for\(const seat of seatIds\)connectSeat\(seat\)/);
 assert.match(ui,/u\.searchParams\.set\('seat',id\)/);
 assert.match(ui,/send\(\{type:'character-create',name:/);
 assert.match(html,/id="characterForm"/);
 assert.match(html,/id="seatButtons"/);
 assert.match(html,/value="warlock"/);
 assert.match(html,/value="tinker"/);
});
