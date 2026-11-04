import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,ensurePlayer,ensureWorld,ROOM_DATA,ROOM_IDS,ROOM_WALLS,roomSize,doorRow,enterQuest,rollMovement,endTurn,resolveRound,equipmentRarity,QUEST_MAX_RARITY,claimLoot,usePotion,buyFromShop,move,globalActivePlayer} from '../src/engine.mjs';
import {PLAYABLE_QUESTS} from '../src/campaign.mjs';
const T=1_800_000_000_000;
const catalog=JSON.parse(readFileSync(new URL('../public/campaign-catalog.json',import.meta.url),'utf8'));
const world=(ids=['one'])=>{const s=freshState(T);for(const id of ids)ensurePlayer(s,id,id.toUpperCase());return s};
const en=(role,{hp=35,faces=8,atk=12,x=5,y=3,variant='normal'}={})=>({id:`enemy-${role}`,name:`${role} D${faces}`,role,variant,faces,atk,armourDie:4,hp,maxHp:hp,x,y,revived:false,awaitRevival:0,clone:false});
function fight(room,foes,hero={x:1,y:3}){
 const s=world();s.players.one.room=room;s.players.one.x=hero.x;s.players.one.y=hero.y;
 const b=s.rooms[room].battle;b.status='active';b.round=1;b.enemies=foes;b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:0};b.actions={};return {s,b,p:s.players.one};
}
const next=(s,room)=>resolveRound(s,room,T,()=>0.5);
test('Medium Quests 5, 6, 7 add exactly 24 original rooms with correct sequence and final bosses',()=>{
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>0).length,133);
 for(const q of [5,6,7]){const rooms=Object.values(ROOM_DATA).filter(r=>r.quest===q);
  assert.equal(rooms.length,8);assert.deepEqual(rooms.map(r=>r.name),catalog.quests[q-1].rooms.map(r=>r.name));
  assert.equal(PLAYABLE_QUESTS[q].difficulty,'Medium');assert(rooms.at(-1).final);assert(rooms.at(-1).foes.some(f=>f.variant==='boss'));
  for(const [i,r] of rooms.entries()){assert.equal(r.foes.length>=2,true,`${r.name} contains real enemies`);assert.equal(r.left,i===0?null:`q${q}r${i}`);assert.equal(r.right,i===7?null:`q${q}r${i+2}`);}
 }
});
test('all nine specialist roles are introduced in the original Quest 5–7 order; Trappers are absent',()=>{
 const roster=new Set(Object.values(ROOM_DATA).filter(r=>r.quest>=5&&r.quest<=7).flatMap(r=>r.foes.map(f=>f.role)).filter(x=>x!=='normal'));
 assert.deepEqual([...roster].sort(),['armoured','cloner','ghost','healer','ninja','ranged','swift','teleporter','zombie']);
 assert(![...roster].includes('trapper'));
});
test('players can unlock each Medium quest sequentially without discarding earlier saved characters',()=>{
 const s=world();const p=s.players.one;p.gold=409;p.level=3;p.xp=31;
 s.completedQuests=[1,2,3,4,5,6];s.unlockedQuest=7;p.room='camp';
 const r=enterQuest(s,'one',7,T);assert.equal(r.saved,'room-entry');assert.equal(p.room,'q7r1');
 assert.equal(s.rooms.q7r1.battle.status,'active');assert.equal(p.gold,409);assert.equal(p.level,3);
 assert.equal(ROOM_DATA.q7r8.foes[0].variant,'boss');
});
test('existing Level 2–3 characters retain their inventories while Quest 5–7 rooms migrate',()=>{
 const s=world();const p=s.players.one;p.xp=58;p.level=3;p.gold=532;
 p.inventory.equipment.push({id:'sword-x',kind:'equipment',name:'Rare sword',rarity:'Rare',category:'Sword',level:3});
 for(const id of ROOM_IDS.filter(x=>ROOM_DATA[x].quest>=5))delete s.rooms[id];ensureWorld(s);
 assert.equal(Object.keys(s.rooms).length,134);assert.equal(p.level,3);assert.equal(p.xp,58);assert.equal(p.gold,532);
 assert.equal(p.inventory.equipment[0].id,'sword-x');
});
test('Medium equipment has 5% Legendary and 8% Rare on successful finds',()=>{
 for(const q of [5,6,7]){assert.equal(QUEST_MAX_RARITY[q],'Legendary');
  const rolls=Array.from({length:10000},(_,i)=>equipmentRarity(q,()=>(i+.5)/10000));
  assert.equal(rolls.filter(r=>r==='Rare').length,800);
  assert.equal(rolls.filter(r=>r==='Legendary').length,500);
  assert(!rolls.some(r=>['Mythic','Exotic'].includes(r)));
 }
});
test('one potion means one use; legacy potion stacks preserve every earned use',()=>{
 const s=world(),p=s.players.one;p.inventory.potions=[{id:'old-7',name:'Healing Potion',kind:'potion',charges:7}];
 ensurePlayer(s,'one','Player 1');assert.equal(p.inventory.potions.length,7);
 assert.equal(new Set(p.inventory.potions.map(x=>x.id)).size,7);
 assert(p.inventory.potions.every(x=>x.charges===1));
 p.hp=10;usePotion(s,'one','one',T);assert.equal(p.inventory.potions.length,6);
 ensurePlayer(s,'one','Player 1');assert.equal(p.inventory.potions.length,6);
});
test('all Medium room encounters spawn their scripted roles with bounded enemy coordinates',()=>{
 for(const q of [5,6,7]){
  const s=world();s.completedQuests=[1,2,3,4,5,6];s.unlockedQuest=7;s.players.one.room='camp';
  enterQuest(s,'one',q,T);assert.equal(s.rooms[`q${q}r1`].battle.enemies.length,ROOM_DATA[`q${q}r1`].foes.length);
  const p=s.players.one;p.lastRolledTurn=s.turn.round;p.moveRound=`global:${s.turn.round}`;p.movementRolled=true;
  for(let i=1;i<=8;i++){
    const id=`q${q}r${i}`,b=s.rooms[id].battle;
    assert.equal(b.status,'active',`${id} must start a real encounter`);
    assert.equal(b.enemies.length,ROOM_DATA[id].foes.length);
    assert.deepEqual(b.enemies.map(x=>x.role),ROOM_DATA[id].foes.map(x=>x.role));
    for(const enemy of b.enemies){assert(enemy.x>=0&&enemy.x<roomSize(id).width&&enemy.y>=0&&enemy.y<roomSize(id).height);assert(!ROOM_WALLS[id].some(([x,y])=>x===enemy.x&&y===enemy.y));}
    if(i===8)break;
    b.status='cleared';p.x=roomSize(id).width-1;p.y=doorRow(id);p.moveRemaining=2;
    move(s,'one','E',T);assert.equal(p.room,`q${q}r${i+1}`);
  }
 }
});
test('a Swift enemy advances two squares in a single shared enemy phase when path is open',()=>{
 const {s,b}=fight('q5r1',[en('swift',{x:7,y:6})],{x:4,y:6});const before=b.enemies[0].x;
 next(s,'q5r1');assert.equal(before-b.enemies[0].x,2);
});
test('ranged enemies strike from two squares while ordinary enemies must close to one',()=>{
 const a=fight('q5r1',[en('ranged',{x:3,y:3,atk:25})],{x:1,y:3});const h=a.p.hp;
 next(a.s,'q5r1');assert(a.p.hp<h,'ranged should attack from distance two');
 const b=fight('q5r1',[en('normal',{x:3,y:3,atk:25})],{x:1,y:3});const h2=b.p.hp;
 next(b.s,'q5r1');assert(b.b.enemies[0].x===2,'normal should move to range one');
 // Ordinary enemy is permitted to attack after moving.
});
test('a Cloner makes weaker copies on its third enemy phase and cannot produce unlimited copies',()=>{
 const {s,b}=fight('q7r3',[en('cloner',{x:5,y:3})]);
 for(let i=0;i<3;i++)next(s,'q7r3');
 assert.equal(b.enemies.filter(x=>x.clone).length,1);
 assert(b.enemies.find(x=>x.clone).maxHp < b.enemies[0].maxHp);
 for(let i=0;i<18;i++)next(s,'q7r3');
 assert(b.enemies.filter(x=>x.clone&&x.hp>0).length<=2);
});
test('a Group Healer restores nearby wounded allies in the enemy phase',()=>{
 const healer=en('healer',{x:5,y:3});const ally=en('normal',{x:6,y:3,hp:35});ally.id='ally';ally.maxHp=50;
 const {s,b}=fight('q7r4',[healer,ally]);for(let i=0;i<2;i++)next(s,'q7r4');
 b.enemies[1].x=b.enemies[0].x+1;b.enemies[1].y=b.enemies[0].y;
 next(s,'q7r4');
 assert(b.enemies[1].hp>35,'healer must restore its ally');
});
test('a Zombie cannot be fully defeated before its one-time revival resolves',()=>{
 const zombie=en('zombie',{hp:2,x:2,y:3});zombie.maxHp=20;
 const {s,b,p}=fight('q6r2',[zombie],{x:1,y:3});
 p.equipped.weapon=null;rollMovement(s,'one',T,()=>0);
 // direct combat attack via global turn; a high roll defeats the zombie
 b.enemies[0].hp=0;b.enemies[0].awaitRevival=2;
 next(s,'q6r2');assert.equal(b.status,'active');assert.equal(zombie.hp,0);assert.equal(zombie.awaitRevival,1);
 next(s,'q6r2');assert(zombie.hp>0);assert(zombie.revived);
 zombie.hp=0;next(s,'q6r2');assert.equal(b.status,'cleared');
});
test('chat emoji buttons and one-use potions are visible and no Trapper labels added',()=>{
 const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
 const app=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert(html.includes('chatEmojiBar'));assert(app.includes('🎲'));assert(app.includes('chat-emoji'));
 assert(html.includes('Quests 1–15'));assert(!html.includes('Trapper'));
});
test('Ghosts cross the solid crypt wing while ordinary enemies must walk around',()=>{
 assert(ROOM_WALLS.q6r3.some(([x,y])=>x===4&&y===4));
 const g=fight('q6r3',[en('ghost',{x:5,y:4})],{x:2,y:4});
 next(g.s,'q6r3');assert.deepEqual([g.b.enemies[0].x,g.b.enemies[0].y],[4,4]);
 const n=fight('q6r3',[en('normal',{x:5,y:4})],{x:2,y:4});
 next(n.s,'q6r3');assert.notDeepEqual([n.b.enemies[0].x,n.b.enemies[0].y],[4,4]);
 ensureWorld(g.s);assert.deepEqual([g.b.enemies[0].x,g.b.enemies[0].y],[4,4]);
});
test('Teleporters blink at most four squares during their third enemy phase',()=>{
 const t=fight('q6r4',[en('teleporter',{x:6,y:3})],{x:1,y:3});
 next(t.s,'q6r4');next(t.s,'q6r4');const before={x:t.b.enemies[0].x,y:t.b.enemies[0].y};
 next(t.s,'q6r4');const after=t.b.enemies[0];
 assert(Math.abs(after.x-before.x)+Math.abs(after.y-before.y)<=4);
 assert(t.s.log.some(x=>x.text.includes('blinks across the room')));
});
test('a wounded Ninja can withdraw to regroup instead of blindly attacking',()=>{
 const ninja=en('ninja',{x:4,y:6,hp:5});ninja.maxHp=40;
 const {s,b}=fight('q7r2',[ninja],{x:2,y:6});next(s,'q7r2');
 assert.equal(b.enemies[0].x,5);assert(s.log.some(x=>x.text.includes('withdraws to regroup')));
});
test('Armoured enemy reduces incoming hits rather than gaining unrestricted HP',()=>{
 const run=(role)=>{
  const e=en(role,{x:2,y:3,hp:60,atk:1});const {s,b}=fight('q5r4',[e],{x:1,y:3});
  rollMovement(s,'one',T,()=>.5);
  // All combat actions are queued until End Turn, then a single server dice roll resolves them.
  s.rooms.q5r4.battle.actions.one={type:'attack',target:e.id};
  endTurn(s,'one',T+1,()=>.5);
  return 60-b.enemies[0].hp;
 };
 const regular=run('normal'),armoured=run('armoured');
 assert(regular>armoured,`normal takes ${regular}, armoured ${armoured}`);
 assert(armoured>=1);
});
test('Quest 5 and 6 final battles unlock exactly the next Medium quest, not future quests',()=>{
 for(const [completed,unlock] of [[5,6],[6,7]]){
  const s=world();const p=s.players.one;s.unlockedQuest=completed;s.completedQuests=[1,2,3,4,...(completed===6?[5]:[])];
  const room=`q${completed}r8`;p.room=room;
  const b=s.rooms[room].battle;b.status='active';b.round=1;b.enemies=[en('normal',{hp:0})];
  b.actions={};b.participated={one:true};b.damageBy={one:20};
  const beforeGold=p.gold;const result=resolveRound(s,room,T,()=>.5);
  assert.equal(b.status,'cleared');assert.equal(result.saved,'boss-completed');
  assert(s.completedQuests.includes(completed));assert.equal(s.unlockedQuest,unlock);
  assert(p.gold>beforeGold);
 }
});
test('Unicode emoji chat remains subject to the existing authenticated chat filtering',async()=>{
 const {initialChat,postChat,validateMessage}=await import('../src/chat.mjs');
 const chat=initialChat();const m=postChat(chat,{id:'one',name:'Tester',text:'Great battle! 🎲 😀 ❤️',now:T});
 assert.equal(m.text,'Great battle! 🎲 😀 ❤️');
 assert.throws(()=>validateMessage('visit https://example.com 😀'),/Links/);
});
