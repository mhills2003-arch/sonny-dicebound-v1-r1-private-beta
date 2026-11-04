import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,rollMovement,move,endTurn,globalActivePlayer,
 submitSequentialAction,enterQuest,publicState} from '../src/engine.mjs';
const T=1_910_000_000_000;
const g=()=>{const s=freshState(T);ensurePlayer(s,'one','Player 1');ensurePlayer(s,'two','Player 2');return s;};
const roll=(s,id,n=6,now=T)=>rollMovement(s,id,now,()=>Math.min(.9999,(n-.0001)/6));

test('live failure reproduction: P2 enters fight, enemies act, then P1 enters mid-turn and can move and End Turn',()=>{
 const s=g();s.players.one.x=7;s.players.one.y=3;s.players.two.x=8;s.players.two.y=3;
 // Initial global round: P1 finishes peacefully, then P2 opens the combat room.
 roll(s,'one');endTurn(s,'one',T+1,()=>.5);
 roll(s,'two');move(s,'two','E',T+2);
 assert.equal(s.players.two.room,'clearing');assert.equal(s.rooms.clearing.battle.status,'active');
 endTurn(s,'two',T+3,()=>.5); // Enemy phase has occurred.
 assert.equal(s.turn.round,2);assert.equal(globalActivePlayer(s),'one');
 roll(s,'one');move(s,'one','E',T+4);move(s,'one','E',T+5);
 const p=s.players.one,b=s.rooms.clearing.battle;
 assert.equal(p.room,'clearing');assert.equal(p.moveRemaining,4);
 assert.equal(b.eligibleRound.one,s.turn.round,'P1 joins current global turn, not next round');
 const before=p.moveRemaining;
 move(s,'one','E',T+6);
 assert.equal(p.moveRemaining,before-1,'movement continues after entering room with enemies');
 assert.equal(publicState(s,'one').turn.activePlayer,'one');
 // Optional action and End Turn both remain available.
 submitSequentialAction(s,'one',{type:'defend'},T+7);
 endTurn(s,'one',T+8,()=>.5);
 assert.equal(globalActivePlayer(s),'two','P2 is unblocked immediately, no timeout');
});

test('entering an active battle by quest board while holding the current global turn allows an action and End Turn',()=>{
 const s=g();s.unlockedQuest=3;
 s.players.two.room='q3r1';const b=s.rooms.q3r1.battle;
 b.status='active';b.round=s.turn.round;b.eligibleRound={two:1};b.participated={};b.damageBy={};b.actions={};
 b.enemies=[{id:'foe',name:'D30',faces:30,variant:'normal',x:6,y:3,hp:100,maxHp:100,armourDie:4,atk:2}];
 roll(s,'one');enterQuest(s,'one',3,T+1);
 assert.equal(b.eligibleRound.one,1);
 submitSequentialAction(s,'one',{type:'defend'},T+2);
 endTurn(s,'one',T+3,()=>.5);
 assert.equal(globalActivePlayer(s),'two');
});

test('old persisted next-round eligibility is repaired for current actor without a second D6 roll',()=>{
 const s=g(),p=s.players.one,b=s.rooms.clearing.battle;
 p.room='clearing';p.x=0;p.y=3;
 b.status='active';b.round=1;b.actions={};b.participated={};b.damageBy={};b.eligibleRound={one:2};
 b.enemies=[{id:'foe',name:'D30',faces:30,variant:'normal',x:7,y:3,hp:100,maxHp:100,armourDie:4,atk:2}];
 roll(s,'one');
 assert.throws(()=>roll(s,'one'),/Already rolled/);
 submitSequentialAction(s,'one',{type:'defend'},T+1);
 assert.equal(b.eligibleRound.one,1);
 endTurn(s,'one',T+2,()=>.5);
 assert.equal(globalActivePlayer(s),'two');
});

test('entry into an already active fight does not let a waiting player take an early global turn',()=>{
 const s=g();s.unlockedQuest=3;
 s.players.one.room='q3r1';const b=s.rooms.q3r1.battle;
 b.status='active';b.round=1;b.actions={};b.eligibleRound={one:1};
 b.enemies=[{id:'foe',name:'D30',faces:30,variant:'normal',x:6,y:3,hp:100,maxHp:100,armourDie:4,atk:2}];
 enterQuest(s,'two',3,T);
 assert.equal(b.eligibleRound.two,2,'future player remains gated by global order');
 assert.throws(()=>roll(s,'two'),/Waiting for/i);
 assert.equal(globalActivePlayer(s),'one');
});

test('joining current battle after reconnect fixes stale eligibility without erasing rolled movement',()=>{
 const s=g(),p=s.players.one,b=s.rooms.clearing.battle;
 p.room='clearing';p.x=0;p.y=3;b.status='active';b.round=1;b.eligibleRound={one:2};
 roll(s,'one');const remaining=p.moveRemaining;
 ensurePlayer(s,'one','Player 1');
 assert.equal(b.eligibleRound.one,1);
 assert.equal(p.moveRemaining,remaining);
 assert.throws(()=>roll(s,'one'),/Already rolled/);
});
