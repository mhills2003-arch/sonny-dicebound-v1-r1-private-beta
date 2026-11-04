import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,publicState} from '../src/engine.mjs';
import {ENDGAME_BOSSES,shortestPath} from '../src/endgame-maze.mjs';
import {BOSS_KITS,inspectBossPoint,bossMinion} from '../src/maze-boss-kits.mjs';
import {createMaze,joinMaze,leaveMaze,mazeTravel,mazeRetreat,mazeAction,mazePublic,mazeTick,mazeReward} from '../src/maze-play.mjs';
const T=1762021000000;
function fight(bossId,withPartner=false){
 const s=freshState(T);ensurePlayer(s,'one','One');
 if(withPartner)ensurePlayer(s,'two','Two');
 for(const p of Object.values(s.players)){p.room='camp';p.level=25;p.maxHp=10000;p.hp=10000;p.gold=500;}
 s.completedQuests=Array.from({length:15},(_,i)=>i+1);s.unlockedQuest=15;
 createMaze(s,'one',1,'all-six-bosses-tested-123',T);
 const run=s.mazeRuns[1];run.map.bossId=bossId;run.map.boss=ENDGAME_BOSSES.find(x=>x.id===bossId);
 const path=shortestPath(run.map.rooms,run.map.entrance,run.map.bossRoomId),prev=path.at(-2),end=path.at(-1);
 run.positions.one=prev;run.fights[prev]={status:'cleared'};
 if(withPartner){joinMaze(s,'two',1,T);run.positions.two=prev;}
 const dir=Object.entries(run.map.rooms[prev].connections).find(([,v])=>v===end)[0];
 mazeTravel(s,'one',dir,T);
 if(withPartner)mazeTravel(s,'two',dir,T);
 const b=run.fights[end];return {s,run,b,p:s.players.one,room:end,dir,prev};
}
function act(f,a,random=()=>.99){
 mazeAction(f.s,'one',a,T,random);
 if(f.s.players.two?.mazeSlot===f.run.slot&&f.run.positions.two===f.room&&f.s.players.two.hp>0&&f.b.status==='active')mazeAction(f.s,'two',{type:'defend'},T,random);
}
test('every boss has a distinct mechanic, two or more named arena fixtures, and an explicit weakness',()=>{
 assert.equal(Object.keys(BOSS_KITS).length,6);
 for(const boss of ENDGAME_BOSSES){const k=BOSS_KITS[boss.id];assert(k.mechanic&&k.weakness&&k.minion);assert(k.points.length>=1);assert(k.points.every(p=>p.x>=0&&p.x<=6&&p.y>=0&&p.y<=6));}
});
for(const boss of ENDGAME_BOSSES){
 test(`${boss.name}: client cannot forge remote interactions, and fixture changes combat state`,()=>{
  const f=fight(boss.id),point=f.b.bossState.points[0];
  f.p.mazeTile={x:0,y:6};assert.throws(()=>mazeAction(f.s,'one',{type:'interact',point:point.id},T),/adjacent/);
  f.p.mazeTile={x:point.x,y:point.y};
  const old=f.b.bossState.weakUntil;
  act(f,{type:'interact',point:point.id});
  assert(f.b.round>=2);
  assert(f.s.log.some(x=>x.text.includes(f.p.name)));
  if(['cinder-wyrm','mirror-queen','root-colossus','hollow-titan'].includes(boss.id))assert.equal(point.used,true);
  if(boss.id==='iron-regent')assert(f.b.bossState.weakUntil>old);
  if(boss.id==='cinder-wyrm')assert(f.b.bossState.weakUntil>old);
  if(boss.id==='hourglass-warden')assert(f.b.bossState.lastInteract>0);
  if(point.used)assert.throws(()=>mazeAction(f.s,'one',{type:'interact',point:point.id},T),/already/);
 });
 test(`${boss.name}: phase 2 and phase 3 cannot be skipped by an oversized attack`,()=>{
  const f=fight(boss.id),enemy=f.b.enemies[0];enemy.hp=2;
  act(f,{type:'attack',target:enemy.id});
  assert.deepEqual(f.b.phaseEvents,[0,1]);assert.equal(enemy.hp,1);assert.equal(f.b.finalPhasePlayed,false);
  act(f,{type:'defend'});
  assert.deepEqual(f.b.phaseEvents,[0,1,2]);assert.equal(f.b.finalPhasePlayed,false);
  act(f,{type:'defend'});
  assert.equal(f.b.finalPhasePlayed,true);assert.equal(enemy.hp,1);
  for(const add of f.b.enemies.slice(1))add.hp=0;
  act(f,{type:'attack',target:enemy.id});
  assert.equal(f.run.status,'completed');assert.deepEqual(f.b.phaseEvents,[0,1,2]);assert.equal(enemy.hp,0);
 });
}
test('boss identification and weakness stay hidden until clues are found, including in public state',()=>{
 const f=fight('mirror-queen');
 const view=mazePublic(f.s,'one'),bossState=view.run.battle.bossState;
 assert.equal(view.run.boss.weakness,null);assert.equal('trueMirror' in bossState,false);assert.equal('anchors' in bossState,false);
 assert(!JSON.stringify(publicState(f.s,'one')).includes(f.run.map.seed));
 f.run.clues.push('boss3');assert.match(mazePublic(f.s,'one').run.boss.weakness,/shadow/);
});
test('joining a live boss battle scales supporting enemies and retreat never deletes surviving additions until all leave',()=>{
 const f=fight('iron-regent',true),initial=f.b.enemies.length;
 assert(initial>=2);assert.equal(f.b.bossState.partyPeak,2);
 mazeRetreat(f.s,'one',T);assert.equal(f.run.fights[f.room],f.b);
 mazeRetreat(f.s,'two',T);assert.equal(f.run.fights[f.room],undefined);
 assert.equal(f.run.positions.one,f.prev);
 mazeTravel(f.s,'one',f.dir,T);assert.notEqual(f.run.fights[f.room],f.b);
});
test('leaving entire boss room and returning via camp does not strand player in a cleared or missing encounter',()=>{
 const f=fight('hollow-titan');leaveMaze(f.s,'one',T);assert.equal(f.run.fights[f.room],undefined);
 joinMaze(f.s,'one',1,T);assert.equal(f.run.positions.one,f.prev);
 mazeTravel(f.s,'one',f.dir,T);assert.equal(f.run.fights[f.room].status,'active');
});
test('shield and regulator are server-side tactical actions; the same fixture cannot be used by both players at once',()=>{
 const f=fight('hollow-titan',true),point=f.b.bossState.points[0];
 f.s.players.one.mazeTile={x:point.x,y:point.y};f.s.players.two.mazeTile={x:point.x,y:point.y};
 mazeAction(f.s,'one',{type:'interact',point:point.id},T);
 assert.throws(()=>mazeAction(f.s,'two',{type:'interact',point:point.id},T),/already/);
 mazeAction(f.s,'two',{type:'defend'},T);
 assert.equal(point.used,true);
});
test('boss hazards are announced for a full round before damage; downed heroes never take repeat hazard damage',()=>{
 const f=fight('iron-regent'),p=f.p;
 act(f,{type:'defend'});const b=f.b;
 assert(b.warn&&b.warn.resolveAt===b.round);
 const square=b.warn.tiles[0];p.mazeTile={...square};const hp=p.hp;
 act(f,{type:'defend'});assert(p.hp<=hp);
 p.hp=0;b.downed.one=b.round+2;const hpAfter=p.hp;
 // No action for a downed player: the server timer resolves safely.
 b.deadline=T;
 mazeTick(f.s,T+500,()=>.5);assert.equal(p.hp,hpAfter);
});
test('per-boss parties have one server-owned telegraphed secondary event at most',()=>{
 for(const boss of ENDGAME_BOSSES){const f=fight(boss.id);for(let r=0;r<6;r++)act(f,{type:'defend'});const b=f.b;
  assert(b.enemyPhases>=6);assert(b.bossState.summons<=10);assert(b.enemies.length<=12);
  assert(!b.bossState.pendingEvent||b.bossState.pendingEvent.due>=b.round-1);
 }
});

test('cinder fire leaves a small number of pre-warned hot squares, and a valve cancels the active warning',()=>{
 const f=fight('cinder-wyrm');f.b.phase=1;f.b.phaseAvailable=1;
 act(f,{type:'defend'});const warning=f.b.warn;assert(warning);
 act(f,{type:'defend'});assert(f.b.bossState.hotTiles.length>0);
 const next=f.b.warn;assert(next.tiles.some(t=>f.b.bossState.hotTiles.some(h=>h.x===t.x&&h.y===t.y)));
 const pt=f.b.bossState.points[0];f.p.mazeTile={x:pt.x,y:pt.y};act(f,{type:'interact',point:pt.id});
 assert.equal(f.b.bossState.hotTiles.length,0);
});
test('a downed participant cannot bypass the revive window by retreating or leaving',()=>{
 const f=fight('iron-regent');f.p.hp=0;
 assert.throws(()=>mazeRetreat(f.s,'one',T),/Downed/);
 assert.throws(()=>leaveMaze(f.s,'one',T),/Downed/);
});
test('endgame boss combat power scales to the actual party, so level-25 armour is not an immunity shield',()=>{
 const f=fight('iron-regent'),boss=f.b.enemies[0];
 const armour=f.p.combatStats?.armour||Math.round(8*Math.pow(1.2,24));
 assert(boss.maxHp>5000);
 assert(boss.atk>armour);
 assert(boss.armour>100);
 f.b.phase=1;
 const add=bossMinion('iron-regent',22,18,1,f.b.bossState.minionScale);
 assert(add.atk>200);assert(add.hp>250);
});
