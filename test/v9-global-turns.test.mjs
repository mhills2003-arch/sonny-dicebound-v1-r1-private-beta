import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshState,ensurePlayer,rollMovement,move,endTurn,globalActivePlayer,
 submitSequentialAction,markDisconnected,tick,publicState,enterQuest,
} from '../src/engine.mjs';
const T=1_900_000_001_000;
function game(ids=['one','two']){const s=freshState(T);for(const id of ids)ensurePlayer(s,id,id);s.turn.deadline=T+60_000;return s}
function roll(s,id,at=T,random=()=>.5){return rollMovement(s,id,at,random)}
function turn(s,id,at=T){roll(s,id,at);return endTurn(s,id,at,()=>0)}
function foe(s,room='woodland'){
 const b=s.rooms[room].battle;b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={one:s.turn.round,two:s.turn.round};b.participated={};b.damageBy={};
 b.enemies=[{id:room+'-foe',name:'D100',faces:100,variant:'normal',x:7,y:3,hp:1000,maxHp:1000,atk:2,armourDie:4}];
 return b;
}
test('only Player One rolls first, and can never roll twice in a global round',()=>{
 const s=game();assert.equal(globalActivePlayer(s),'one');
 assert.throws(()=>roll(s,'two'),/Waiting for one/i);
 assert.equal(roll(s,'one').roll,4);
 assert.throws(()=>roll(s,'one'),/Already rolled/);
 assert.throws(()=>move(s,'two','N',T),/Waiting for one/i);
 assert.equal(endTurn(s,'one',T+1).saved,null);
 assert.equal(globalActivePlayer(s),'two');
 assert.throws(()=>roll(s,'one'),/Waiting for two/i);
 assert.equal(roll(s,'two',T+2).roll,4);
 endTurn(s,'two',T+3,()=>0);
 assert.equal(s.turn.round,2);assert.equal(globalActivePlayer(s),'one');
});
test('unspent movement is lost at End Turn and another room does not grant a reroll',()=>{
 const s=game(['one']);roll(s,'one',T,()=>.999);
 assert.equal(s.players.one.moveRemaining,6);move(s,'one','E',T);
 assert.equal(s.players.one.moveRemaining,5);
 s.unlockedQuest=2;enterQuest(s,'one',2,T);
 assert.throws(()=>roll(s,'one',T),/Already rolled/);
 endTurn(s,'one',T+1,()=>0);
 assert.equal(s.players.one.moveRemaining,0);
 assert.equal(roll(s,'one',T+2,()=>0).roll,1);
});
test('a player in another quest still waits for the same global turn',()=>{
 const s=game();s.unlockedQuest=2;enterQuest(s,'two',2,T);
 const b=foe(s,'q2r1');s.players.two.x=6;s.players.two.y=3;
 assert.equal(globalActivePlayer(s),'one');
 assert.throws(()=>roll(s,'two'),/Waiting for one/i);
 turn(s,'one',T+1);
 assert.equal(globalActivePlayer(s),'two');
 assert.equal(roll(s,'two',T+2).roll,4);
 const enemyHp=b.enemies[0].hp;
 submitSequentialAction(s,'two',{type:'attack',target:b.enemies[0].id},T+3);
 endTurn(s,'two',T+4,()=>.9999);
 assert(b.enemies[0].hp<enemyHp);
 assert.equal(s.turn.round,2);
});
test('enemies in two different rooms act only AFTER all player turns have ended',()=>{
 const s=game();const a=foe(s,'woodland');const b=foe(s,'clearing');
 s.players.one.x=6;s.players.one.y=3;
 s.players.two.room='clearing';s.players.two.x=6;s.players.two.y=3;
 roll(s,'one');submitSequentialAction(s,'one',{type:'defend'},T);
 const hp=s.players.one.hp;endTurn(s,'one',T+1,()=>.999);
 assert.equal(s.players.one.hp,hp,'no enemy phase after P1');
 roll(s,'two',T+2);submitSequentialAction(s,'two',{type:'defend'},T+2);
 endTurn(s,'two',T+3,()=>.999);
 assert.equal(s.turn.round,2);
 assert.equal(a.round,2);assert.equal(b.round,2);
 assert(s.log.filter(e=>e.text.includes('strikes')).length>=2,'both encountered rooms had one enemy phase');
});
test('four connected players act 1 → 2 → 3 → 4; then next round starts',()=>{
 const s=game(['one','two','three','four']);
 for(const id of ['one','two','three','four']){
   assert.equal(globalActivePlayer(s),id);
   roll(s,id);endTurn(s,id,T,()=>0);
 }
 assert.equal(s.turn.round,2);assert.equal(globalActivePlayer(s),'one');
});
test('turn times out at 60 seconds and advances; non-current player cannot act',()=>{
 const s=game();assert.equal(tick(s,T+59_999).length,0);
 assert.equal(tick(s,T+60_000).length,1);
 assert.equal(globalActivePlayer(s),'two');
 assert.throws(()=>roll(s,'one'),/Waiting for two/i);
 assert.equal(tick(s,T+119_999).length,0);
 assert.equal(tick(s,T+120_000).length,1);
 assert.equal(s.turn.round,2);
});
test('a disconnected current player is skipped, reconnecting cannot take an earlier turn',()=>{
 const s=game();turn(s,'one',T);assert.equal(globalActivePlayer(s),'two');
 markDisconnected(s,'two',T+1);
 assert.equal(s.turn.round,2);assert.equal(globalActivePlayer(s),'one');
 ensurePlayer(s,'two','two');
 assert.equal(globalActivePlayer(s),'one');
 assert.equal(s.turn.eligibleRound.two,2);
});
test('global turn, wait owner and deadline are visible to each client; inventory remains private',()=>{
 const s=game();const p=publicState(s,'two');
 assert.equal(p.turn.round,1);assert.equal(p.turn.activePlayer,'one');
 assert.equal(p.turn.deadline,T+60_000);
 assert.equal(p.players.one.inventory,undefined);
});
test('worker uses a global alarm and authenticates gameplay commands',async()=>{
 const {readFileSync}=await import('node:fs');
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert(worker.includes('const nextTime=Math.min(ordinary,nextMazeDeadline(this.game))')); 
 assert(worker.includes('assertGlobalTurn(this.game,id)'));
 assert(worker.includes("packet.type==='end-turn'"));
});
