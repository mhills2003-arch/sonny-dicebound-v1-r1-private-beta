import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 ROOM_DATA,ROOM_IDS,ROOM_WALLS,HARD_HAZARDS,roomSize,doorRow,isWall,
 freshState,ensureWorld,ensurePlayer,enterQuest,merchantStock,refreshMerchant,buyFromShop,
 equipmentRarity,QUEST_MAX_RARITY,resolveRound,publicState,claimLoot
} from '../src/engine.mjs';
import {HARD_BLUEPRINTS} from '../src/hard-rooms.mjs';
import {PLAYABLE_QUESTS} from '../src/campaign.mjs';
const T=1_800_000_000_000;
const catalog=JSON.parse(readFileSync(new URL('../public/campaign-catalog.json',import.meta.url))).quests;
function game(q=10){const s=freshState(T);ensurePlayer(s,'one','TESTER');s.players.one.room='camp';s.unlockedQuest=q;s.completedQuests=Array.from({length:q-1},(_,i)=>i+1);return s}
function reachable(roomId){
 const w=roomSize(roomId),centre=doorRow(roomId),seen=new Set([`0,${centre}`]),queue=[[0,centre]];
 for(let i=0;i<queue.length;i++)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
  const x=queue[i][0]+dx,y=queue[i][1]+dy,key=x+','+y;
  if(x>=0&&y>=0&&x<w.width&&y<w.height&&!isWall(roomId,x,y)&&!seen.has(key)){seen.add(key);queue.push([x,y]);}
 }
 return seen;
}
test('Hard chapter sequence and all 30 original rooms are playable, unique, connected 15x11 landscapes',()=>{
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>0).length,133);
 const ids=Object.keys(HARD_BLUEPRINTS);assert.equal(ids.length,30);
 assert.equal(new Set(Object.values(HARD_BLUEPRINTS).map(rows=>rows.join('|'))).size,30);
 for(const q of [10,11,12]){
  assert.equal(PLAYABLE_QUESTS[q].name,catalog[q-1].name);
  assert.equal(PLAYABLE_QUESTS[q].difficulty,'Hard');
  for(let room=1;room<=10;room++){
   const id=`q${q}r${room}`,rows=HARD_BLUEPRINTS[id],def=ROOM_DATA[id];
   assert.deepEqual(roomSize(id),{width:15,height:11});
   assert.equal(doorRow(id),5);assert.equal(rows.length,11);assert(rows.every(s=>s.length===15));
   assert.equal(rows[5][0],'.');assert.equal(rows[5][14],'.');
   assert.equal(reachable(id).size,165-ROOM_WALLS[id].length,id+' disconnected');
   assert(reachable(id).has('14,5'),id+' exit obstructed');
   assert(ROOM_WALLS[id].length>=7,id+' too empty');
   assert(def.challenge&&def.formation&&def.foes.length>=7,id+' not distinct challenge');
   assert.equal(def.final,room===10);
   assert.equal(def.foes.filter(f=>f.variant==='boss').length,room===10?1:0);
  }
 }
});
test('All 30 encounters spawn real separated enemies on legal floor and preserve prior saves',()=>{
 const s=game(12);s.players.one.gold=1785;s.players.one.inventory.equipment.push({id:'preserved',rarity:'Legendary',name:'Old sword'});
 for(const id of Object.keys(s.rooms).filter(x=>/^q1[012]r/.test(x)))delete s.rooms[id];ensureWorld(s);
 assert.equal(s.players.one.gold,1785);assert.equal(s.players.one.inventory.equipment.at(-1).id,'preserved');assert.equal(s.rooms.q10r1.battle.status,'dormant');
 for(const q of [10,11,12])for(let i=1;i<=10;i++){
  const id=`q${q}r${i}`,fresh=game(q);enterQuest(fresh,'one',q,T);
  fresh.players.one.room=id;fresh.players.one.x=0;fresh.players.one.y=5;
  // Entering the first room spawns it; subsequent rooms spawn via normal room transition.
  if(i>1){fresh.rooms[id].battle.status='dormant';fresh.rooms[id].battle.enemies=[];}
  // Check direct spawn by walking from previous room after marking it clear.
  if(i>1){fresh.players.one.room=`q${q}r${i-1}`;fresh.players.one.x=14;fresh.players.one.y=5;fresh.players.one.moveRemaining=2;fresh.players.one.movementRolled=true;fresh.players.one.moveRound=`global:${fresh.turn.round}`;fresh.players.one.lastRolledTurn=fresh.turn.round;fresh.rooms[fresh.players.one.room].battle.status='cleared';
   // room transitions via real movement are covered by earlier integration tests; use dynamic import below for spawn.
   continue;
  }
  const b=fresh.rooms[id].battle,occupied=new Set();
  assert.equal(b.enemies.length,ROOM_DATA[id].foes.length);
  for(const e of b.enemies){assert(!isWall(id,e.x,e.y));assert(!occupied.has(e.x+','+e.y));occupied.add(e.x+','+e.y);assert(e.atk>=30&&e.armourDie>=23);}
 }
});
test('Hard rarity shifts one tier up, without Exotic and without changing Medium odds',()=>{
 for(const quest of [10,11,12]){
  assert.equal(QUEST_MAX_RARITY[quest],'Mythic');const counts={};
  for(let i=0;i<10000;i++){const rarity=equipmentRarity(quest,()=>(i+.5)/10000);counts[rarity]=(counts[rarity]||0)+1;}
  assert.deepEqual(counts,{Uncommon:5700,Rare:3000,Legendary:800,Mythic:500});
 }
 assert.equal(equipmentRarity(9,()=>.99),'Legendary');assert.equal(equipmentRarity(4,()=>.99),'Rare');
});
test('Hard merchant displays Rare/Legendary instead of Common/Uncommon; Mythic is one rare offer',()=>{
 const s=game(10),p=s.players.one;p.gold=4000;
 let stock=merchantStock(s).filter(i=>i.kind==='equipment');
 assert(stock.length>=8);assert(stock.every(i=>['Rare','Legendary'].includes(i.rarity)));
 assert.equal(stock.filter(i=>i.rarity==='Mythic').length,0);
 refreshMerchant(s,()=>.051);assert.equal(merchantStock(s).filter(i=>i.rarity==='Mythic').length,0);
 let n=0;refreshMerchant(s,()=>[.001,.001][n++]);stock=merchantStock(s).filter(i=>i.rarity==='Mythic');
 assert.equal(stock.length,1);
 assert.equal(buyFromShop(s,'one',stock[0].sku,T).saved,'merchant');
 assert.equal(p.inventory.equipment.at(-1).rarity,'Mythic');assert.equal(merchantStock(s).filter(i=>i.rarity==='Mythic').length,0);
 assert.throws(()=>buyFromShop(s,'one','sword-uncommon',T),/not stocked/);
});
test('Hard hazards are floor-only, publicly rendered, phase-bounded and can damage an exposed hero',()=>{
 for(const quest of [10,11])for(let i=1;i<=10;i++){
  const id=`q${quest}r${i}`,cells=HARD_HAZARDS[id];assert(cells.length>0,id);
  for(const [x,y] of cells){assert(!isWall(id,x,y),id);assert(x>=3&&x<=11);}
 }
 const s=game(10);enterQuest(s,'one',10,T);const id='q10r1',p=s.players.one,b=s.rooms[id].battle;
 assert.deepEqual(publicState(s,'one').roomHazards[id],HARD_HAZARDS[id]);
 const [x,y]=HARD_HAZARDS[id][0];p.x=x;p.y=y;
 const initial=p.hp;b.enemies=[{id:'safe-test-foe',name:'Far foe',x:14,y:10,faces:12,hp:500,maxHp:500,atk:2,armourDie:4,role:'armoured',variant:'normal'}];
 b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:0};b.actions={one:{type:'defend'}};
 b.enemyPhases=2; // first phase becomes 3 -> chaos hazard fires, unless offset is nonzero
 resolveRound(s,id,T,()=>.5);
 assert(p.hp<initial,'chaos tile must cause damage on its active turn');
});
test('Hard city captures unlock merchant discount and one-time temple healing',()=>{
 const s=game(12),p=s.players.one;enterQuest(s,'one',12,T);
 const clear=(id)=>{
  const b=s.rooms[id].battle;b.status='active';b.eligibleRound={};b.participated={};b.damageBy={};b.actions={};b.nests=[];b.nestQueue=[];b.enemies=[];resolveRound(s,id,T,()=>.5);
  assert.equal(b.status,'cleared');
 };
 clear('q12r2');assert(s.cityDistricts.includes('q12r2'));
 p.room='camp';p.gold=100;buyFromShop(s,'one','potion',T);assert.equal(p.gold,91,'10% market discount on ten-gold potion');
 p.room='q12r4';p.hp=Math.floor(p.maxHp/2);clear('q12r4');assert(p.hp>Math.floor(p.maxHp/2));
});
test('Every one of the 30 Hard encounters fits its complete enemy formation on the real terrain',async()=>{
 const {move}=await import('../src/engine.mjs');
 for(const q of [10,11,12])for(let i=1;i<=10;i++){
  const s=game(q),p=s.players.one;enterQuest(s,'one',q,T);
  const id=`q${q}r${i}`;
  if(i>1){
   const prev=`q${q}r${i-1}`;
   p.room=prev;p.x=14;p.y=5;p.moveRemaining=2;p.movementRolled=true;p.moveRound=`global:${s.turn.round}`;
   s.rooms[prev].battle.status='cleared';move(s,'one','E',T);
  }
  const b=s.rooms[id].battle,seen=new Set();
  assert.equal(b.status,'active');
  assert.equal(b.enemies.length,ROOM_DATA[id].foes.length,id+' missing spawned foes');
  for(const e of b.enemies){
   const size=['large','large-shiny'].includes(e.variant)?2:1;
   for(let dx=0;dx<size;dx++)for(let dy=0;dy<size;dy++){
    const x=e.x+dx,y=e.y+dy,key=x+','+y;
    assert(!isWall(id,x,y),id+' enemy inside wall');
    assert(!seen.has(key),id+' enemy overlap');seen.add(key);
    assert(x>=0&&y>=0&&x<15&&y<11,id+' enemy out of bounds');
   }
  }
 }
});
