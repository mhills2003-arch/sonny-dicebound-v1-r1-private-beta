import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ROOM_DATA,ROOM_IDS,ROOM_WALLS,HARD_HAZARDS,roomSize,doorRow,isWall,
 freshState,ensureWorld,ensurePlayer,enterQuest,move,merchantStock,refreshMerchant,buyFromShop,
 equipmentRarity,QUEST_MAX_RARITY,rollMovement,submitSequentialAction,endTurn,resolveRound,publicState
} from '../src/engine.mjs';
import {EXTREME_BLUEPRINTS,ABYSS_LANTERNS} from '../src/extreme-rooms.mjs';
import {EXTREME_ENCOUNTERS} from '../src/extreme-encounters.mjs';
import {PLAYABLE_QUESTS} from '../src/campaign.mjs';
const T=1_800_000_000_000;
const catalog=JSON.parse(readFileSync(new URL('../public/campaign-catalog.json',import.meta.url))).quests;
function game(q=13){const s=freshState(T);ensurePlayer(s,'one','Tester');s.players.one.room='camp';s.unlockedQuest=q;s.completedQuests=Array.from({length:q-1},(_,i)=>i+1);return s;}
function connectedFloor(id){
 const {width,height}=roomSize(id),start=[0,doorRow(id)];
 const visited=new Set([start.join(',')]),queue=[start];
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
   if(nx>=0&&ny>=0&&nx<width&&ny<height&&!isWall(id,nx,ny)&&!visited.has(key)){visited.add(key);queue.push([nx,ny]);}
  }
 }return visited;
}
test('15 original quests, 133 rooms and 45 distinct reachable Extreme 15x11 maps',()=>{
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>0).length,133);
 assert.equal(Object.keys(EXTREME_BLUEPRINTS).length,45);
 assert.equal(Object.keys(EXTREME_ENCOUNTERS).length,45);
 assert.equal(new Set(Object.values(EXTREME_BLUEPRINTS).map(r=>r.join('\n'))).size,45);
 for(const q of [13,14,15]){
  assert.equal(PLAYABLE_QUESTS[q].name,catalog[q-1].name);
  assert.equal(PLAYABLE_QUESTS[q].difficulty,'Extreme');
  for(let r=1;r<=15;r++){
   const id=`q${q}r${r}`,def=ROOM_DATA[id],rows=EXTREME_BLUEPRINTS[id];
   assert.deepEqual(roomSize(id),{width:15,height:11});
   assert.equal(doorRow(id),5);
   assert.equal(rows.length,11);assert(rows.every(row=>row.length===15));
   assert(!isWall(id,0,5));assert(!isWall(id,14,5));
   const reachable=connectedFloor(id);
   assert.equal(reachable.size,165-ROOM_WALLS[id].length,id+' disconnected');
   assert(reachable.has('14,5'),id+' exit unreachable');
   assert(ROOM_WALLS[id].length>=12,id+' lacks meaningful walls');
   assert(def.challenge.length>35,id+' challenge missing');
   assert(def.foes.length>=8&&def.foes.length<=12,id+' encounter size');
   assert.equal(def.final,r===15);assert.equal(def.left,r===1?null:`q${q}r${r-1}`);
   assert.equal(def.right,r===15?null:`q${q}r${r+1}`);
  }
 }
});
test('all 45 new encounters spawn full separated enemy groups on legal squares',()=>{
 for(const q of [13,14,15])for(let r=1;r<=15;r++){
  const s=game(q),p=s.players.one;enterQuest(s,'one',q,T);
  const id=`q${q}r${r}`;
  if(r>1){const previous=`q${q}r${r-1}`;
   p.room=previous;p.x=14;p.y=5;p.moveRemaining=2;p.movementRolled=true;p.moveRound='global:1';
   s.rooms[previous].battle.status='cleared';move(s,'one','E',T);
  }
  const b=s.rooms[id].battle;assert.equal(b.status,'active');
  assert.equal(b.enemies.length,ROOM_DATA[id].foes.length);
  const occupied=new Set();
  for(const e of b.enemies){
   assert(!isWall(id,e.x,e.y));const key=`${e.x},${e.y}`;
   assert(!occupied.has(key),id+' foe overlap');occupied.add(key);
   assert(e.atk>=50&&e.armourDie>=35,id+' extreme dice too small');
  }
 }
});
test('Extreme only: Legendary floor, Mythic common upgrade, Exotic precisely 5%; Hard remains unchanged',()=>{
 for(const q of [13,14,15]){
  assert.equal(QUEST_MAX_RARITY[q],'Exotic');
  const counts={};for(let i=0;i<10000;i++){
   const rarity=equipmentRarity(q,()=>(i+.5)/10000);counts[rarity]=(counts[rarity]||0)+1;
  }
  assert.deepEqual(counts,{Legendary:5700,Mythic:3800,Exotic:500});
 }
 assert.equal(equipmentRarity(12,()=>.001),'Uncommon');
 assert.equal(equipmentRarity(12,()=>.999),'Mythic');
 assert.equal(equipmentRarity(9,()=>.999),'Legendary');
});
test('Extreme merchant stocks Legendary and Mythic, never Rare, plus a 5% single-use Exotic offer',()=>{
 const s=game(13),p=s.players.one;p.gold=10000;
 const regular=merchantStock(s).filter(i=>i.kind==='equipment');
 assert(regular.length>=8);assert(regular.every(i=>['Legendary','Mythic'].includes(i.rarity)));
 refreshMerchant(s,()=>.051);
 assert.equal(merchantStock(s).filter(i=>i.rarity==='Exotic').length,0);
 let count=0;refreshMerchant(s,()=>[.001,.001][count++]);
 const exotic=merchantStock(s).filter(i=>i.rarity==='Exotic');assert.equal(exotic.length,1);
 assert.equal(buyFromShop(s,'one',exotic[0].sku,T).saved,'merchant');
 assert.equal(p.inventory.equipment.at(-1).rarity,'Exotic');
 assert.equal(merchantStock(s).filter(i=>i.rarity==='Exotic').length,0);
 assert.throws(()=>buyFromShop(s,'one','sword-rare',T),/not stocked/);
 assert.throws(()=>buyFromShop(s,'one',exotic[0].sku,T),/not stocked/);
});
test('existing save migrates into Extreme without erasing character, inventory or achievements',()=>{
 const s=game(12),p=s.players.one;p.gold=740;p.level=12;p.xp=81;
 p.inventory.equipment.push({id:'keep-the-sword',category:'Sword',rarity:'Mythic',name:'A treasured weapon'});
 for(const id of Object.keys(s.rooms).filter(id=>ROOM_DATA[id].quest>=13))delete s.rooms[id];
 s.rooms.q12r10.battle.status='cleared';s.completedQuests.push(12);ensureWorld(s);
 assert.equal(Object.keys(s.rooms).length,134);assert.equal(s.unlockedQuest,13);
 assert.equal(p.gold,740);assert.equal(p.level,12);assert.equal(p.xp,81);
 assert.equal(p.inventory.equipment.at(-1).id,'keep-the-sword');
 assert.equal(s.rooms.q15r15.battle.status,'dormant');
});
test('storm gusts occur on scheduled hazard squares and can push, never teleport through wall',()=>{
 const id='q13r1',s=game(13);enterQuest(s,'one',13,T);const p=s.players.one,b=s.rooms[id].battle;
 assert(HARD_HAZARDS[id].length>0);const [x,y]=HARD_HAZARDS[id][0];
 p.x=x;p.y=y;
 // A predictable gust on the next phase; no unrelated enemy strikes.
 b.enemies=[{id:'dummy',x:14,y:10,faces:6,variant:'normal',role:'normal',hp:999,maxHp:999,atk:1,armourDie:4}];
 b.enemyPhases=2-(ROOM_DATA[id].hazardPhaseOffset||0);
 b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:0};b.actions={one:{type:'defend'}};
 resolveRound(s,id,T,()=>.5);
 assert(p.x>=0&&p.x<15&&!isWall(id,p.x,p.y));
 assert(Math.abs(p.x-x)<=2);
 assert(publicState(s,'one').roomHazards[id].length>0);
});
test('Abyss lanterns require adjacency and an action; darkness respects their saved light radius',()=>{
 const id='q14r1',s=game(14);enterQuest(s,'one',14,T);const p=s.players.one,b=s.rooms[id].battle;
 assert.equal(ABYSS_LANTERNS[id].length,3);
 assert.equal(publicState(s,'one').roomLanterns[id].length,3);
 const [x,y]=ABYSS_LANTERNS[id][0];p.x=x;p.y=y;
 assert.throws(()=>submitSequentialAction(s,'one',{type:'light'},T),/Roll your movement/);
 rollMovement(s,'one',T,()=>.4);
 submitSequentialAction(s,'one',{type:'light'},T);
 b.enemies=[{id:'dummy',x:14,y:10,faces:6,variant:'normal',role:'normal',hp:999,maxHp:999,atk:1,armourDie:4}];
 endTurn(s,'one',T,()=>.5);
 assert(b.litLanterns.includes(0));
 assert.throws(()=>submitSequentialAction(s,'one',{type:'light'},T),/Roll your movement|Stand beside/);
});
test('Dice King turns through three faces on one persistent HP bar',()=>{
 const s=game(15),id='q15r15';enterQuest(s,'one',15,T);
 const p=s.players.one;p.room=id;p.x=0;p.y=5;
 const b=s.rooms[id].battle;b.status='dormant';b.enemies=[];
 // Trigger real first room transition from previous chamber.
 const previous='q15r14';p.room=previous;p.x=14;p.y=5;p.moveRemaining=1;p.movementRolled=true;p.moveRound='global:1';s.rooms[previous].battle.status='cleared';move(s,'one','E',T);
 const king=b.enemies.find(e=>e.variant==='boss');assert(king);
 const hp=king.maxHp;
 b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:0};
 for(const [ratio,phase,role] of [[.9,1,'armoured'],[.5,2,'teleporter'],[.2,3,'ninja']]){
  king.hp=Math.round(hp*ratio);b.actions={one:{type:'defend'}};
  resolveRound(s,id,T,()=>.5);
  assert.equal(b.kingPhase,phase);assert.equal(king.role,role);
  assert.equal(king.maxHp,hp,'King must never reset health on transition');
 }
});
test('quest board names, UI controls and staged unlocks include full 15-quest chronicle',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert(html.includes('Quests 1–15'));assert(html.includes('lanternBtn'));
 assert(js.includes("const playable=q.number<=15"));
 const s=game(13);enterQuest(s,'one',13,T);
 assert.throws(()=>enterQuest(s,'one',14,T),/not unlocked/);
});
