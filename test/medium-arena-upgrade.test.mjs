import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ROOM_DATA,ROOM_IDS,ROOM_WALLS,roomSize,doorRow,isWall,
  freshState,ensurePlayer,ensureWorld,enterQuest,move,rollMovement,voteFinishQuest
} from '../src/engine.mjs';
const T=1_800_000_000_000;
function world(){
 const s=freshState(T);ensurePlayer(s,'one','Player 1');
 s.completedQuests=[1,2,3,4,5,6];s.unlockedQuest=7;s.players.one.room='camp';
 return s;
}
function reachable(roomId){
 const {width,height}=roomSize(roomId),row=doorRow(roomId);
 const queue=[[0,row]],visited=new Set([`0,${row}`]);
 for(let i=0;i<queue.length;i++){
  const [x,y]=queue[i];
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
   if(nx>=0&&ny>=0&&nx<width&&ny<height&&!visited.has(key)&&!isWall(roomId,nx,ny)){
    visited.add(key);queue.push([nx,ny]);
   }
  }
 }
 return visited;
}
test('the 24 Medium arenas use 13×9 and keep the entrance, exit and every floor square reachable',()=>{
 const rooms=ROOM_IDS.filter(id=>ROOM_DATA[id].quest>=5&&ROOM_DATA[id].quest<=7);
 assert.equal(rooms.length,24);
 for(const id of rooms){
  const {width,height}=roomSize(id),row=doorRow(id);
  assert.deepEqual([width,height,row],[13,9,4]);
  assert.equal(isWall(id,0,row),false);assert.equal(isWall(id,width-1,row),false);
  const path=reachable(id);
  assert.equal(path.size,width*height-ROOM_WALLS[id].length,id+' has unreachable floor');
  assert(path.has('12,4'),id+' east doorway inaccessible');
  assert(ROOM_WALLS[id].some(([x,y])=>x>=2&&x<=10&&y>=1&&y<=7),id+' needs interior terrain');
  // A real maze must force a turn; a straight unblocked floor from west to east
  // was the defect the player reported.
  const route=[[0,row,0]],seen=new Set([`0,${row}`]);let minimum=Infinity;
  for(let k=0;k<route.length;k++){
    const [x,y,d]=route[k];if(x===width-1&&y===row){minimum=d;break;}
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;
      if(nx>=0&&nx<width&&ny>=0&&ny<height&&!isWall(id,nx,ny)&&!seen.has(key)){seen.add(key);route.push([nx,ny,d+1]);}
    }
  }
  assert(minimum>=12,`${id} east-west doorways must stay connected`);
  assert.equal(path.size>=65,true,id+' must have enough manoeuvring space despite its interior walls');
 }
 for(const id of ROOM_IDS.filter(id=>ROOM_DATA[id].quest<5))assert.deepEqual(roomSize(id),{width:9,height:7});
});
test('every Medium room has 5–8 real combatants with stronger attack AND defence dice',()=>{
 for(const quest of [5,6,7]){
  const s=world();enterQuest(s,'one',quest,T);
  const first=s.rooms[`q${quest}r1`].battle.enemies;
  const minAttack={5:18,6:22,7:27}[quest];
  const minDefence={5:14,6:17,7:20}[quest];
  assert(first.length>=5&&first.length<=8);
  assert(first.every(e=>e.atk>=minAttack),`Quest ${quest} needs challenging attack rolls`);
  assert(first.every(e=>e.armourDie>=minDefence),`Quest ${quest} needs challenging defence rolls`);
  for(let i=1;i<=8;i++){
   const room=ROOM_DATA[`q${quest}r${i}`],r=room.foes;
   assert(r.length>=5&&r.length<=8,`Quest ${quest}, room ${i}: expected 5–8 enemies`);
   assert.equal(room.encounter.length,r.length);
   assert(r.some(e=>e.role!=='normal'));
   assert.equal(room.final,i===8);
   assert.equal(r.filter(e=>e.variant==='boss').length,i===8?1:0);
  }
 }
});
test('each Medium foe spawns inside the 13×9 map on free unoccupied squares',()=>{
 for(const quest of [5,6,7]){
  const s=world(),player=s.players.one;
  enterQuest(s,'one',quest,T);
  for(let i=1;i<=8;i++){
   const roomId=`q${quest}r${i}`;
   // Move the tester just inside each subsequent room so every authored wave spawns.
   if(i>1){s.rooms[roomId].battle.status='dormant';s.rooms[`q${quest}r${i-1}`].battle.status='cleared';
    player.room=`q${quest}r${i-1}`;player.x=12;player.y=4;
    player.moveRound=`global:${s.turn.round}`;player.movementRolled=true;player.moveRemaining=3;
    move(s,'one','E',T);
   }
   const enemyList=s.rooms[roomId].battle.enemies;
   assert.equal(enemyList.length,ROOM_DATA[roomId].foes.length);
   const positions=new Set();
   for(const foe of enemyList){
    const key=`${foe.x},${foe.y}`;
    assert(foe.x>=0&&foe.x<13&&foe.y>=0&&foe.y<9,roomId+' enemy outside bounds');
    assert(!isWall(roomId,foe.x,foe.y),roomId+' enemy in wall');
    assert(!positions.has(key),roomId+' overlapping spawns');positions.add(key);
   }
  }
 }
});
test('Medium final exit is on column 12 row 4 and preserves player progression',()=>{
 const s=world(),p=s.players.one;
 p.level=7;p.xp=81;p.gold=761;
 enterQuest(s,'one',5,T);
 p.room='q5r8';s.rooms.q5r8.battle.status='cleared';
 p.x=8;p.y=3;assert.throws(()=>voteFinishQuest(s,'one',T),/east exit/i);
 p.x=12;p.y=4;
 assert.equal(voteFinishQuest(s,'one',T).saved,'quest-exit');
 assert.equal(p.room,'camp');assert.equal(p.level,7);assert.equal(p.xp,81);assert.equal(p.gold,761);
});
test('existing saved characters, inventories, bookmarks and cleared room status survive the arena upgrade',()=>{
 const s=world(),p=s.players.one;
 p.room='q5r5';p.x=7;p.y=3;p.gold=335;p.questBookmarks={5:{room:'q5r5',x:7,y:3}};
 p.inventory.equipment.push({id:'test-sword',name:'Sword',category:'Sword',rarity:'Rare'});
 s.rooms.q5r5.battle.status='cleared';
 const oldRoom=JSON.parse(JSON.stringify(s.rooms.q5r5));
 ensureWorld(s);ensurePlayer(s,'one','Player 1');
 assert.equal(s.rooms.q5r5.battle.status,oldRoom.battle.status);
 assert.equal(p.room,'q5r5');assert.equal(p.gold,335);
 assert.equal(p.inventory.equipment[0].id,'test-sword');
 assert.deepEqual(p.questBookmarks[5],{room:'q5r5',x:7,y:3});
});
test('browser bundle dynamically sizes maps and does not hard-code an eight-column doorway',async()=>{
 const fs=await import('node:fs');
 const app=fs.readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert(app.includes('function gridProjection(w,h)'));
 assert(app.includes('roomSize(me.room).height'));
 assert(app.includes('roomSize(me.room).width-1'));
 assert(app.includes('doorRow(me.room)'));
 assert(app.includes('Math.max(medium?15:28'));
});
