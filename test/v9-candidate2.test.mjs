import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshState,ensurePlayer,activeTurnId,submitSequentialAction,endTurn,rollMovement,
 move,claimLoot,voteFinishQuest,returnToCamp,enterQuest,buyFromShop,
 resetTestAdventure,effectiveStats,ROOM_DATA,SHOP_STOCK,publicState
} from '../src/engine.mjs';
const T=1_900_000_000_000;
function game(ids=['one','two']){
 const s=freshState(T);
 for(const id of ids)ensurePlayer(s,id,'Player '+id);
 return s;
}
function setupFight(ids=['one','two']){
 const s=game(ids),b=s.rooms.clearing.battle;
 b.status='active';b.round=1;b.deadline=T+60_000;b.actions={};b.turnEnded={};b.eligibleRound={};b.participated={};b.damageBy={};
 b.enemies=[{id:'foe',name:'Test D30',faces:30,x:7,y:3,hp:500,maxHp:500,armourDie:4,atk:2,variant:'normal'}];
 for(const [i,id] of ids.entries()){
  const p=s.players[id];p.room='clearing';p.x=1;p.y=1+i;b.eligibleRound[id]=1;
 }
 return s;
}
test('only first eligible player may submit actions or roll in sequential combat',()=>{
 const s=setupFight();
 assert.equal(activeTurnId(s,'clearing'),'one');
 assert.throws(()=>submitSequentialAction(s,'two',{type:'attack',target:'foe'},T),/Waiting for/i);
 assert.throws(()=>rollMovement(s,'two',T),/Waiting for/i);
 rollMovement(s,'one',T,()=>.5);
 assert.equal(submitSequentialAction(s,'one',{type:'defend'},T).saved,null);
 assert.equal(activeTurnId(s,'clearing'),'one','an action alone does not end the turn');
 assert.throws(()=>submitSequentialAction(s,'one',{type:'attack',target:'foe'},T),/already locked/i);
});
test('End Turn applies a queued action, hands control to player two, then triggers enemy phase',()=>{
 const s=setupFight(),b=s.rooms.clearing.battle;
 s.players.one.x=6;s.players.one.y=3;
 const enemyHp=b.enemies[0].hp;
 rollMovement(s,'one',T+1,()=>.5);
 submitSequentialAction(s,'one',{type:'attack',target:'foe'},T+1);
 assert.equal(b.enemies[0].hp,enemyHp,'queued attacks do not resolve until End Turn');
 endTurn(s,'one',T+2,()=>.99999);
 assert(b.enemies[0].hp<enemyHp,'End Turn applies dice damage immediately');
 assert.equal(activeTurnId(s,'clearing'),'two');
 assert.equal(b.round,1,'enemy phase waits for every connected player');
 assert.throws(()=>endTurn(s,'one',T+3),/Waiting for/i);
 const after=b.enemies[0].hp;
 rollMovement(s,'two',T+4,()=>.5);
 endTurn(s,'two',T+4,()=>.5);
 assert.equal(b.round,2);
 assert.equal(activeTurnId(s,'clearing'),'one');
 assert.equal(b.enemies[0].hp,after);
 assert.equal(b.turnEnded.one,undefined);
});
test('four player order follows 1 2 3 4 and a disconnected player is skipped',()=>{
 const s=setupFight(['one','two','three','four']);
 assert.equal(activeTurnId(s,'clearing'),'one');
 rollMovement(s,'one',T,()=>.5);endTurn(s,'one',T,()=>.5);assert.equal(activeTurnId(s,'clearing'),'two');
 s.players.two.connected=false;
 assert.equal(activeTurnId(s,'clearing'),'three');
 rollMovement(s,'three',T+1,()=>.5);endTurn(s,'three',T+1,()=>.5);assert.equal(activeTurnId(s,'clearing'),'four');
 rollMovement(s,'four',T+2,()=>.5);endTurn(s,'four',T+2,()=>.5);
 assert.equal(s.rooms.clearing.battle.round,2);
 assert.equal(activeTurnId(s,'clearing'),'one');
});
test('the other player can move and fight in a different quest without affecting turn order',()=>{
 const s=setupFight();s.unlockedQuest=3;
 // They cannot flee a fight; after a room clears they can take a different quest.
 assert.throws(()=>enterQuest(s,'two',3,T),/combat/i);
 s.rooms.clearing.battle.status='cleared';
 enterQuest(s,'two',3,T);
 assert.equal(s.players.two.room,'q3r1');
 assert.equal(s.players.one.room,'clearing');
 assert.equal(s.rooms.q3r1.battle.status,'active');
 assert.equal(activeTurnId(s,'q3r1'),'one','global turn belongs to Player One even in different quests');
});
test('quest boss exit moves each adventurer individually and unblocks the door',()=>{
 const s=game();s.rooms.watchpost.battle.status='cleared';
 s.players.one.room='watchpost';s.players.one.x=8;s.players.one.y=3;
 s.players.two.room='watchpost';s.players.two.x=7;s.players.two.y=3;
 assert.equal(voteFinishQuest(s,'one',T).saved,'quest-exit');
 assert.equal(s.players.one.room,'camp');
 assert.equal(s.players.two.room,'watchpost');
 assert.equal(voteFinishQuest(s,'two',T).saved,'quest-exit');
 assert.equal(s.players.two.room,'camp');
 assert.notDeepEqual([s.players.one.x,s.players.one.y],[s.players.two.x,s.players.two.y]);
});
test('camp merchant is reachable before quest completion when no fight is active',()=>{
 const s=game();s.players.one.gold=50;
 const old=s.players.two.room;
 const r=returnToCamp(s,'one',T);
 assert.equal(r.saved,'room-entry');assert.equal(s.players.one.room,'camp');
 assert.equal(s.players.two.room,old);
 assert.equal(buyFromShop(s,'one','potion',T).saved,'merchant');
 assert.equal(s.players.one.gold,40);
});
test('return to camp refuses escape during active combat',()=>{
 const s=setupFight();assert.throws(()=>returnToCamp(s,'one',T),/combat/i);
});
test('each room search has exactly a 50-percent empty outcome and stays used',()=>{
 for(const slot of ['coin','potion','equipment','enchantment']){
  const s=game(['one']);
  assert.equal(claimLoot(s,'one',slot,T,()=>.499999999).item,null);
  assert.equal(s.players.one.lootClaimed.woodland[slot],true);
  assert.equal(s.players.one.gold,0);
  assert.equal(s.players.one.inventory.equipment.length,0);
  assert.throws(()=>claimLoot(s,'one',slot,T,()=>.99),/already searched/i);
  const another=game(['one']);
  assert(claimLoot(another,'one',slot,T,()=>.5).item,'at .5 a find is guaranteed');
 }
});
test('unarmed outlaw range is one, so a diagonal enemy is out of reach',()=>{
 const s=game();assert.equal(effectiveStats(s.players.two).mainRange,1);
 const p=s.players.two;p.inventory.equipment.push({id:'bow',category:'Bow',rarity:'Common',name:'Bow'});
 p.equipped.weapon='bow';assert.equal(effectiveStats(p).mainRange,3);
});
test('unarmed diagonal target cannot take damage: range 1 requires cardinal adjacency',()=>{
 const s=setupFight(['two']),p=s.players.two,b=s.rooms.clearing.battle;
 p.x=6;p.y=2;  // Diagonal to enemy (7,3): Manhattan distance 2.
 const before=b.enemies[0].hp;
 rollMovement(s,'two',T+1,()=>.5);
 submitSequentialAction(s,'two',{type:'attack',target:'foe'},T+1);
 endTurn(s,'two',T+2,()=>.99);
 assert.equal(b.enemies[0].hp,before);
 assert(s.log.some(x=>/no enemy in range|cannot reach/i.test(x.text)));
});
test('sequential game state broadcasts turn owner, without exposing teammate private loot',()=>{
 const s=setupFight(),publicView=publicState(s,'two');
 assert.equal(publicView.rooms.clearing.battle.activePlayer,'one');
 assert.equal(publicView.players.one.inventory,undefined);
 assert.equal(publicView.players.one.lootClaimed,undefined);
});
test('a reset in the balance trial stays in balance-trial mode',()=>{
 const s=game();s.balanceTrial=true;
 const reset=resetTestAdventure(s,T+1);
 assert.equal(reset.balanceTrial,true);
});
test('the worker routes player actions through sequential authorization and End Turn',async()=>{
 const fs=await import('node:fs');
 const worker=fs.readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert(worker.includes('submitSequentialAction(this.game,id,packet.action)'));
 assert(worker.includes("packet.type==='end-turn'"));
 assert(worker.includes("packet.type==='return-camp'"));
 assert(worker.includes("isTrial?'quest-v9-balance-trial':'quest-01-two-player-prototype'"));
});

test('all eighteen campaign rooms have increasing real wall density without trapping single-tile players', async()=>{
 const {ROOM_WALLS,WIDTH,HEIGHT,isWall,roomSize,doorRow}=await import('../src/engine.mjs');
 const counts={};
 for(const [id,room] of Object.entries(ROOM_DATA)){
  if(!room.quest)continue;
  const walls=ROOM_WALLS[id];counts[id]=walls.length;
  assert(walls.length>=(room.quest===1?7:4),`${id} needs meaningful physical obstacles`);
  const {width,height}=roomSize(id),centre=doorRow(id);const seen=new Set([`0,${centre}`]), queue=[[0,centre]];
  while(queue.length){
   const [x,y]=queue.shift();
   for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
    const key=`${nx},${ny}`;
    if(nx>=0&&nx<width&&ny>=0&&ny<height&&!isWall(id,nx,ny)&&!seen.has(key)){seen.add(key);queue.push([nx,ny]);}
   }
  }
  assert.equal(seen.size,width*height-walls.length,`${id} must have no inaccessible dead zones`);
  for(let x=0;x<width;x++)if(room.quest===1)assert(!isWall(id,x,centre),`${id} must preserve the tutorial doorway route`);
 }
 assert.equal(Object.keys(counts).length,133);
 assert(counts.q4r5>=5,`Quest 4 boss should include cover despite its open-arena design`);
 assert(counts.q2r1>counts.clearing,`mines should offer tighter terrain than clearing`);
});

test('2×2 enemies spawn in a west-entrance-connected component in every authored encounter',async()=>{
 const {isWall,roomSize,doorRow,enterQuest,ensurePlayer,freshState,move}=await import('../src/engine.mjs');
 for(const [roomId,room] of Object.entries(ROOM_DATA)){
  if(room.quest<3||!room.foes.some(f=>['large','large-shiny'].includes(f.variant)))continue;
  const {width,height}=roomSize(roomId),row=doorRow(roomId);
  const legal=(x,y)=>x>=0&&y>=0&&x+1<width&&y+1<height&&
   ![[0,0],[0,1],[1,0],[1,1]].some(([dx,dy])=>isWall(roomId,x+dx,y+dy));
  const queue=[[0,row-1],[0,row],[1,row-1],[1,row]].filter(([x,y])=>legal(x,y));
  const reached=new Set(queue.map(v=>v.join(',')));
  for(let k=0;k<queue.length;k++){
   const [x,y]=queue[k];for(const [nx,ny] of [[x+1,y],[x-1,y],[x,y+1],[x,y-1]]){
    const key=`${nx},${ny}`;
    if(legal(nx,ny)&&!reached.has(key)){reached.add(key);queue.push([nx,ny]);}
   }
  }
  assert(reached.size>=6,`${roomId} has no useable Large approach`);
  const s=freshState(T);ensurePlayer(s,'one','Hero');const p=s.players.one;
  s.unlockedQuest=Math.max(s.unlockedQuest,room.quest);
  if(roomId.endsWith('r1')){p.room='camp';enterQuest(s,'one',room.quest,T);}
  else {
   const prev=room.left;p.room=prev;p.x=roomSize(prev).width-1;p.y=doorRow(prev);
   s.rooms[prev].battle.status='cleared';p.moveRound=`global:${s.turn.round}`;
   p.movementRolled=true;p.moveRemaining=3;
   move(s,'one','E',T);
  }
  for(const e of s.rooms[roomId].battle.enemies.filter(f=>['large','large-shiny'].includes(f.variant)))
   assert(reached.has(`${e.x},${e.y}`),`${roomId} Large at ${e.x},${e.y} is stranded`);
 }
});
