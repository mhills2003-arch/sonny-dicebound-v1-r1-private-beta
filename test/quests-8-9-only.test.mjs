import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROOM_DATA,ROOM_IDS,ROOM_WALLS,roomSize,doorRow,isWall,QUEST_MAX_RARITY,equipmentRarity,freshState,ensurePlayer,ensureWorld,enterQuest,move,resolveRound,submitSequentialAction,endTurn,publicState} from '../src/engine.mjs';
import {MEDIUM_BRIDGE_BLUEPRINTS} from '../src/level-designs.mjs';
import {PLAYABLE_QUESTS} from '../src/campaign.mjs';
const T=1800000000000;
const catalog=JSON.parse(readFileSync(new URL('../public/campaign-catalog.json',import.meta.url))).quests;
const setup=(quest=8)=>{const s=freshState(T);ensurePlayer(s,'one','Tester');s.unlockedQuest=quest;s.completedQuests=Array.from({length:quest-1},(_,i)=>i+1);s.players.one.room='camp';return s;};
const walkable=id=>{const {width:w,height:h}=roomSize(id),sy=doorRow(id),q=[[0,sy]],visited=new Set([`0,${sy}`]);for(let i=0;i<q.length;i++){const [x,y]=q[i];for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]){const key=nx+','+ny;if(nx>=0&&nx<w&&ny>=0&&ny<h&&!isWall(id,nx,ny)&&!visited.has(key)){visited.add(key);q.push([nx,ny]);}}}return visited;};
const findAdjacent=(s,id,nest)=>{for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){const x=nest.x+dx,y=nest.y+dy;if(x<0||x>=13||y<0||y>=9||isWall(id,x,y))continue;if(s.rooms[id].battle.enemies.some(e=>e.hp>0&&e.x===x&&e.y===y))continue;return [x,y];}throw new Error('Nest has no usable adjacent square in '+id);};
test('Quests 8 and 9 retain their Medium designs as Hard campaign expands',()=>{
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>0).length,133);
 assert(ROOM_DATA.q10r1);assert(PLAYABLE_QUESTS[10]);
 const s=setup(9);assert.throws(()=>enterQuest(s,'one',10,T),/not unlocked/);
 for(const number of [8,9]){assert.equal(PLAYABLE_QUESTS[number].name,catalog[number-1].name);assert.equal(PLAYABLE_QUESTS[number].difficulty,'Medium');}
});
test('sixteen bespoke maps preserve exits, accessible floors and distinct names, tactics, formations',()=>{
 const ids=Object.keys(MEDIUM_BRIDGE_BLUEPRINTS);assert.equal(ids.length,16);
 assert.equal(new Set(ids.map(k=>MEDIUM_BRIDGE_BLUEPRINTS[k].join('|'))).size,16);
 assert.equal(new Set(ids.map(k=>ROOM_DATA[k].challenge)).size,16);
 for(const id of ids){const room=ROOM_DATA[id],rows=MEDIUM_BRIDGE_BLUEPRINTS[id],{width,height}=roomSize(id),mid=doorRow(id);
  assert.equal(width,13);assert.equal(height,9);assert.equal(rows.length,9);assert(rows.every(row=>row.length===13));
  assert.equal(rows[mid][0],'.');assert.equal(rows[mid][12],'.');
  const reachable=walkable(id);assert(reachable.has('12,4'),id+' door blocked');
  assert.equal(reachable.size,width*height-ROOM_WALLS[id].length,id+' isolated floor');
  assert(room.foes.length>=7,id+' needs large enemy force');
 }
});
test('all sixteen real encounters spawn every foe without overlapping a wall or player',()=>{
 for(let quest=8;quest<=9;quest++){
  const s=setup(quest),p=s.players.one;enterQuest(s,'one',quest,T);
  for(let i=1;i<=8;i++){
   const id=`q${quest}r${i}`,b=s.rooms[id].battle;
   assert.equal(p.room,id);assert.equal(b.status,'active');
   assert.equal(b.enemies.length,ROOM_DATA[id].foes.length,id+' spawn');
   const occupied=new Set();for(const e of b.enemies){assert(!isWall(id,e.x,e.y),id);const key=e.x+','+e.y;assert(!occupied.has(key),id);occupied.add(key);}
   if(quest===9){assert(b.nests.length>=1);for(const nest of b.nests){assert(nest.active);assert(!isWall(id,nest.x,nest.y));assert(!occupied.has(nest.x+','+nest.y));}}
   if(i===8)continue;
   b.status='cleared';p.x=12;p.y=4;p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;p.moveRemaining=2;
   move(s,'one','E',T);
  }
 }
});
test('Medium legendary cap remains exactly 5 percent for both quests, without Mythic/Exotic',()=>{
 for(const quest of [8,9]){assert.equal(QUEST_MAX_RARITY[quest],'Legendary');
 const counts={};for(let i=0;i<10000;i++){const r=equipmentRarity(quest,()=>(i+.5)/10000);counts[r]=(counts[r]||0)+1;}
 assert.equal(counts.Legendary,500);assert.equal(counts.Mythic||0,0);assert.equal(counts.Exotic||0,0);}
});
test('existing saves acquire the sixteen new rooms without losing loot, coins or completed quests',()=>{
 const s=setup(8),p=s.players.one;p.gold=612;p.level=9;p.xp=71;p.inventory.equipment.push({id:'old-weapon',name:'Veteran Sword',rarity:'Rare',category:'Sword'});
 for(const id of Object.keys(s.rooms).filter(id=>/^q[89]r/.test(id)))delete s.rooms[id];
 ensureWorld(s);assert.equal(Object.keys(s.rooms).length,134);assert.equal(p.gold,612);assert.equal(p.level,9);assert.equal(p.xp,71);assert.equal(p.inventory.equipment.at(-1).id,'old-weapon');assert.equal(s.unlockedQuest,8);
});
test('Warrens nest action requires adjacent player and completed movement roll',()=>{
 const s=setup(9);enterQuest(s,'one',9,T);const nest=s.rooms.q9r1.battle.nests[0],p=s.players.one;
 p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;
 assert.throws(()=>submitSequentialAction(s,'one',{type:'nest'},T),/Stand beside/);
 [p.x,p.y]=findAdjacent(s,'q9r1',nest);
 const queued=submitSequentialAction(s,'one',{type:'nest'},T);assert.equal(queued.saved,null);assert.equal(s.rooms.q9r1.battle.actions.one.type,'nest');
});
test('D6 5 or 6 disables a nest; D6 1 through 4 releases room-number reinforcements',()=>{
 for(const [dice,shouldDisable] of [[.8,true],[.99,true],[0,false],[.65,false]]){
  const s=setup(9);enterQuest(s,'one',9,T);
  const p=s.players.one,b=s.rooms.q9r1.battle,nest=b.nests[0];[p.x,p.y]=findAdjacent(s,'q9r1',nest);
  p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;
  submitSequentialAction(s,'one',{type:'nest'},T);
  const original=b.enemies.length;endTurn(s,'one',T+1,()=>dice);
  assert.equal(nest.active,!shouldDisable);
  assert.equal(b.enemies.filter(e=>e.parentId==='nest').length,shouldDisable?0:1);
  if(!shouldDisable)assert.equal(b.enemies.length,original+1);
 }
});
test('Warrens room 8 failed nest roll spawns eight scouts only after the current enemy phase',()=>{
 const s=setup(9),p=s.players.one;enterQuest(s,'one',9,T);
 for(let i=1;i<=7;i++){
  const id=`q9r${i}`;s.rooms[id].battle.status='cleared';p.x=12;p.y=4;
  p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;p.moveRemaining=2;
  move(s,'one','E',T);
 }
 assert.equal(p.room,'q9r8');const b=s.rooms.q9r8.battle,nest=b.nests[0];
 [p.x,p.y]=findAdjacent(s,'q9r8',nest);p.maxHp=p.hp=100000;
 p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;
 submitSequentialAction(s,'one',{type:'nest'},T);
 endTurn(s,'one',T+1,()=>0);
 assert.equal(nest.active,true);
 assert.equal(b.enemies.filter(e=>e.parentId==='nest').length,8);
 assert(b.enemies.filter(e=>e.parentId==='nest').every(e=>e.hp===e.maxHp), 'new arrivals did not attack or suffer attacks on their spawning phase');
});
test('the exceptionally rare double nest can occur in the first two Warrens rooms',()=>{
 const previous=Math.random;Math.random=()=>0;
 try{const s=setup(9);enterQuest(s,'one',9,T);assert.equal(s.rooms.q9r1.battle.nests.length,2);}
 finally{Math.random=previous;}
});
test('active nest prevents accidental room completion even when all enemies are defeated',()=>{
 const s=setup(9);enterQuest(s,'one',9,T);const b=s.rooms.q9r1.battle,p=s.players.one;
 for(const e of b.enemies)e.hp=0;
 p.hp=p.maxHp=100000;
 resolveRound(s,'q9r1',T,()=>.5);
 assert.equal(b.status,'active');assert(b.nests.some(n=>n.active));
});
test('private player inventory and nest state remain correctly exposed in public state',()=>{
 const s=setup(9);ensurePlayer(s,'two','Teammate');s.players.two.room='camp';enterQuest(s,'one',9,T);
 const snapshot=publicState(s,'two');assert(snapshot.rooms.q9r1.battle.nests[0].active);assert.equal(snapshot.players.one.inventory,undefined);
});
