import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshState,ensurePlayer,ROOM_DATA,ROOM_IDS,ROOM_WALLS,isWall,roomSize,doorRow,clearLine,rollMovement,move,
 claimLoot,equipmentRarity,QUEST_MAX_RARITY,enterQuest,resolveRound,publicState,
 voteFinishQuest,buyFromShop,SHOP_STOCK,claimTrainingRack,xpRequiredForLevel,endTurn
} from '../src/engine.mjs';
const T=1_800_000_000_000;
function game(ids=['one']){const s=freshState(T);for(const id of ids)ensurePlayer(s,id,id);return s}
test('all campaign rooms have authored obstacles with 130 distinct non-tutorial layouts',()=>{
 const campaign=ROOM_IDS.filter(id=>ROOM_DATA[id].quest>=1);
 assert.equal(campaign.length,133);
 assert.equal(new Set(campaign.filter(id=>ROOM_DATA[id].quest>1).map(id=>JSON.stringify(ROOM_WALLS[id]))).size,130);
 for(const id of campaign){const w=roomSize(id),row=doorRow(id);
  assert(ROOM_WALLS[id].length>=2,id);
  assert(!isWall(id,0,row));assert(!isWall(id,w.width-1,row));
 }
});
test('ranged line of sight stops a wall between shooter and target',()=>{
 assert.equal(clearLine('woodland',2,2,4,2),false);
 assert.equal(clearLine('woodland',1,3,8,3),true);
});
test('D6 movement roll respects 1 and 6, cannot reroll before spending, and cannot move without rolling',()=>{
 const s=game(),p=s.players.one;
 assert.throws(()=>move(s,'one','N',T),/Roll D6/i);
 assert.equal(rollMovement(s,'one',T,()=>0).roll,1);
 assert.throws(()=>rollMovement(s,'one',T,()=>.999),/Already rolled/i);
 move(s,'one','N',T);assert.equal(p.moveRemaining,0);
 assert.throws(()=>rollMovement(s,'one',T,()=>.999),/Already rolled/i);
 endTurn(s,'one',T,()=>0);
 assert.equal(rollMovement(s,'one',T,()=>.999).roll,6);
 move(s,'one','S',T);assert.equal(p.moveRemaining,5);
});
test('walls reject spent movement and preserve movement points',()=>{
 const s=game();s.players.one.x=2;s.players.one.y=1;
 rollMovement(s,'one',T,()=>.999);
 assert.throws(()=>move(s,'one','E',T),/wall/i);
 assert.equal(s.players.one.moveRemaining,6);
});
test('combat movement D6 is independent of combat action and is rolled once per round',()=>{
 const s=game(),p=s.players.one,b=s.rooms.woodland.battle;
 b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={one:s.turn.round};
 b.enemies=[{id:'practice',x:7,y:3,faces:8,atk:5,armourDie:4,hp:80,maxHp:80,variant:'normal',name:'Practice D8'}];
 assert.equal(rollMovement(s,'one',T,()=>.5).roll,4);
 assert.throws(()=>rollMovement(s,'one',T,()=>.5),/Already rolled/i);
 move(s,'one','N',T);assert.equal(p.y,2);assert.equal(p.moveRemaining,3);
});
test('abandoned mine starts with real enemies, not an empty contradictory encounter',()=>{
 assert.equal(ROOM_DATA.q2r1.foes.length,2);
 const s=game();s.unlockedQuest=2;enterQuest(s,'one',2,T);
 assert.equal(s.rooms.q2r1.battle.status,'active');assert.equal(s.rooms.q2r1.battle.enemies.length,2);
});
test('quest-specific rarity ceilings exclude every Legendary in first four quests',()=>{
 assert.deepEqual(Object.fromEntries(Object.entries(QUEST_MAX_RARITY).filter(([q])=>Number(q)<=7)),{1:'Common',2:'Uncommon',3:'Uncommon',4:'Rare',5:'Legendary',6:'Legendary',7:'Legendary'});
 for(const q of [1,2,3,4])for(let i=0;i<100;i++){
  const r=equipmentRarity(q,()=>i/100);
  assert(!['Legendary','Mythic','Exotic'].includes(r));
  if(q===1)assert.equal(r,'Common');
  if(q<4)assert.notEqual(r,'Rare');
 }
});
test('Quest 4 Rare is actually rare: only 3 percent of equipment rolls',()=>{
 const tally={};for(let i=0;i<10000;i++){const rarity=equipmentRarity(4,()=>(i+.5)/10000);tally[rarity]=(tally[rarity]||0)+1;}
 assert.equal(tally.Rare,300);assert.equal(tally.Uncommon,2300);assert.equal(tally.Common,7400);
});
test('ordinary loot generation is limited by the current quest and keeps personal ownership',()=>{
 const s=game(['one','two']);
 for(const [q,id] of [[1,'woodland'],[2,'q2r1'],[3,'q3r1'],[4,'q4r1']]){
  s.players.one.room=id;s.rooms[id].battle.status='cleared';
  const item=claimLoot(s,'one','equipment',T,()=>.999).item;
  assert.equal(item.rarity,QUEST_MAX_RARITY[q]);
  assert.throws(()=>claimLoot(s,'one','equipment',T,()=>0),/already searched/i);
 }
 assert.equal(s.players.two.inventory.equipment.length,0);
});
test('participant XP follows damage contribution instead of blindly matching teammate levels',()=>{
 const s=game(['one','two']);const b=s.rooms.clearing.battle;
 b.status='active';b.round=1;b.actions={};b.participated={one:true,two:true};b.damageBy={one:90,two:10};
 b.eligibleRound={one:1,two:1};b.enemies=[{id:'e',hp:0,maxHp:6}];
 resolveRound(s,'clearing',T,()=>.5);
 assert(s.players.one.xp>s.players.two.xp*3);
 assert(s.players.two.xp>0);
});
test('overlevelled veterans receive reduced rewards for farming early quests',()=>{
 const s=game(),b=s.rooms.clearing.battle;s.players.one.level=8;
 b.status='active';b.round=1;b.actions={};b.participated={one:true};b.damageBy={one:20};b.eligibleRound={one:1};b.enemies=[{id:'e',hp:0,maxHp:6}];
 resolveRound(s,'clearing',T,()=>.5);
 assert(s.players.one.xp<=6);
});
test('levelling is a dedicated achievement event with new stats instead of only a log entry',()=>{
 const s=game(),b=s.rooms.clearing.battle;s.players.one.xp=95;
 b.status='active';b.round=1;b.actions={};b.participated={one:true};b.damageBy={one:20};b.eligibleRound={one:1};b.enemies=[{id:'e',hp:0,maxHp:6}];
 resolveRound(s,'clearing',T,()=>.5);
 const notice=s.events.find(e=>e.type==='level-up');assert(notice);
 assert.equal(notice.player,'one');assert.equal(notice.level,2);assert.equal(notice.hp,60);
 assert.equal(s.players.one.level,2);
});
test('four quests only advance a fresh solo character to roughly level four or five',()=>{
 const s=game(),p=s.players.one;
 for(let q=1;q<=4;q++)for(const [id,d] of Object.entries(ROOM_DATA)){
  if(d.quest!==q||!d.foes.length)continue;
  const b=s.rooms[id].battle;b.status='active';b.round=1;b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:200};b.wave=d.stageTwo?1:0;
  b.enemies=d.foes.map((e,i)=>({id:String(i),hp:0,maxHp:1}));b.actions={};
  resolveRound(s,id,T,()=>.5)
 }
 assert(p.level>=3&&p.level<=4,`End-of-quest character Level ${p.level}`);
});
test('quest victory produces a milestone and unlocks the next quest',()=>{
 const s=game(),b=s.rooms.watchpost.battle;b.status='active';b.round=1;b.participated={one:true};b.damageBy={one:8};b.eligibleRound={one:1};b.enemies=[{id:'d8',hp:0,maxHp:8}];
 resolveRound(s,'watchpost',T,()=>.5);
 const event=s.events.find(e=>e.type==='quest-complete');
 assert.equal(event.quest,1);assert.equal(event.next,2);assert.equal(s.unlockedQuest,2);
});
test('quest exit requires defeated boss and actual physical proximity to east exit',()=>{
 const s=game(),p=s.players.one;p.room='watchpost';
 assert.throws(()=>voteFinishQuest(s,'one',T),/Defeat/i);
 s.rooms.watchpost.battle.status='cleared';
 assert.throws(()=>voteFinishQuest(s,'one',T),/east exit/i);
 p.x=8;p.y=3;const r=voteFinishQuest(s,'one',T);
 assert.equal(r.saved,'quest-exit');assert.equal(p.room,'camp');
});
test('players independently leave cleared quest; earlier exit never blocks doorway',()=>{
 const s=game(['one','two']);s.rooms.watchpost.battle.status='cleared';
 for(const [id,x] of [['one',8],['two',7]]){const p=s.players[id];p.room='watchpost';p.x=x;p.y=3;}
 assert.equal(voteFinishQuest(s,'one',T).saved,'quest-exit');
 assert.equal(s.players.one.room,'camp');
 assert.equal(s.players.two.room,'watchpost');
 assert.equal(voteFinishQuest(s,'two',T).saved,'quest-exit');
 assert.equal(s.players.one.room,'camp');assert.equal(s.players.two.room,'camp');
 assert.notDeepEqual([s.players.one.x,s.players.one.y],[s.players.two.x,s.players.two.y]);
});
test('camp merchant sells equipment and one-use potions with authoritative gold and unlock checks',()=>{
 const s=game(),p=s.players.one;p.room='camp';p.gold=105;
 assert.throws(()=>buyFromShop(s,'one','sword-rare',T),/not unlocked/i);
 assert.equal(buyFromShop(s,'one','potion',T).saved,'merchant');
 assert.equal(p.gold,95);assert.equal(p.inventory.potions[0].charges,1);
 assert.equal(buyFromShop(s,'one','sword-common',T).saved,'merchant');
 assert.equal(p.gold,50);assert.equal(p.inventory.equipment.at(-1).category,'Sword');
 assert.equal(buyFromShop(s,'one','sword-common',T).saved,'merchant');
 assert.equal(p.gold,5);
 assert.throws(()=>buyFromShop(s,'one','sword-common',T),/Not enough gold/i);
 assert.equal(p.gold,5);
});
test('merchant refuses out-of-camp purchases and unknown products',()=>{
 const s=game();s.players.one.gold=10000;
 assert.throws(()=>buyFromShop(s,'one','potion',T),/camp/i);
 s.players.one.room='camp';assert.throws(()=>buyFromShop(s,'one','mythic-dice',T),/Unknown/i);
});
test('fresh balance trial disables the power-level-skipping training rack',()=>{
 const s=game();s.balanceTrial=true;
 assert.throws(()=>claimTrainingRack(s,'one',T),/disabled/i);
});
test('previously level 9 characters survive migration without being silently reset',()=>{
 const s=game(),p=s.players.one;p.level=9;p.xp=123;p.gold=456;
 p.inventory.equipment.push({id:'retained',name:'Old Legendary Sword',category:'Sword',rarity:'Legendary',level:8});
 ensurePlayer(s,'one','one');
 assert.equal(p.level,9);assert.equal(p.xp,123);assert.equal(p.gold,456);assert.equal(p.inventory.equipment[0].id,'retained');
});
test('new shop data is client-visible, teammates private inventory stays redacted',()=>{
 const s=game(['one','two']);const view=publicState(s,'one');
 assert(view.shopStock.some(i=>i.sku==='potion'));
 assert(view.roomWalls.q4r5.length>0);
 assert.equal(view.players.two.inventory,undefined);
});
test('separate balance-test Durable Object and authenticated base live world remain distinct in worker routing',async()=>{
 const fs=await import('node:fs');const worker=fs.readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert(worker.includes("isTrial?'quest-v9-balance-trial':'quest-01-two-player-prototype'"));
 assert(worker.includes("headers.set('x-dicebound-trial','balance-v9')"));
 assert(worker.includes("packet.type==='roll-move'"));
});

test('room treasure cannot be farmed from the merchant camp',()=>{
 const s=game(),p=s.players.one;p.room='camp';
 assert.throws(()=>claimLoot(s,'one','coin',T,()=>.5),/no room treasure/i);
 assert.equal(p.gold,0);
});
test('explicit quest replay resets room enemies and personal treasure but preserves character XP',async()=>{
 const {replayQuest}=await import('../src/engine.mjs');
 const s=game(),p=s.players.one;s.completedQuests=[1];s.unlockedQuest=2;
 s.rooms.clearing.battle.status='cleared';s.rooms.watchpost.battle.status='cleared';
 p.room='camp';p.x=1;p.y=3;p.level=3;p.xp=73;p.gold=200;
 p.lootClaimed.woodland={equipment:true};p.lootClaimed.clearing={coin:true};
 const outcome=replayQuest(s,'one',1,T);
 assert.equal(outcome.saved,'room-entry');
 assert.equal(p.room,'woodland');assert.equal(s.rooms.clearing.battle.status,'dormant');
 assert.equal(s.rooms.watchpost.battle.status,'dormant');
 assert.equal(p.lootClaimed.woodland,undefined);assert.equal(p.lootClaimed.clearing,undefined);
 assert.equal(p.level,3);assert.equal(p.xp,73);assert.equal(p.gold,200);
 assert(s.completedQuests.includes(1));assert.equal(s.unlockedQuest,2);
});
test('replaying a quest cannot delete an active teammate encounter',async()=>{
 const {replayQuest}=await import('../src/engine.mjs');
 const s=game(['one','two']);s.completedQuests=[1];s.unlockedQuest=2;
 s.players.one.room='camp';s.players.two.room='clearing';
 assert.throws(()=>replayQuest(s,'one',1,T),/All adventurers must leave/i);
});
test('two-level death loss sacrifices equipped item, reduces gold and restores 80 percent HP',async()=>{
 const {applyDeathPenalty}=await import('../src/engine.mjs');
 const s=game(),p=s.players.one;p.level=6;p.gold=300;p.hp=0;p.xp=200;
 p.inventory.equipment.push({id:'steel',kind:'equipment',rarity:'Rare',category:'Sword',name:'Rare Sword',level:1});
 p.equipped.weapon='steel';applyDeathPenalty(s,p,T);
 assert.equal(p.level,4);assert.equal(p.xp,0);assert(p.gold<300);
 assert.equal(p.equipped.weapon,null);assert.equal(p.inventory.equipment.length,0);
 assert.equal(p.hp,Math.ceil(p.maxHp*.8));
 assert(s.events.some(x=>x.type==='death'&&x.player==='one'));
});
test('level-up celebration carries the amount each attribute increased',()=>{
 const s=game(),b=s.rooms.clearing.battle;s.players.one.xp=95;
 b.status='active';b.eligibleRound={one:1};b.participated={one:true};b.damageBy={one:12};b.enemies=[{id:'e',hp:0,maxHp:6}];
 resolveRound(s,'clearing',T,()=>.5);
 const e=s.events.find(x=>x.type==='level-up');
 assert.equal(e.hpGain,10);assert(e.attackGain>0);assert(e.armourGain>0);
 assert(s.players.one.gold>0,'level income must be added');
});
test('Quest 4 finale has enhanced Large-Shiny defence and a real second boss wave',()=>{
 const s=game();s.unlockedQuest=4;enterQuest(s,'one',4,T);
 const p=s.players.one;p.room='q4r4';p.x=8;p.y=3;s.rooms.q4r4.battle.status='cleared';
 rollMovement(s,'one',T,()=>.999);move(s,'one','E',T);
 const b=s.rooms.q4r5.battle;
 assert.equal(b.enemies[0].variant,'large-shiny');assert.equal(b.enemies[0].faces,4);
 assert.equal(b.enemies[0].armourDie,8);
 b.enemies[0].hp=0;resolveRound(s,'q4r5',T+10,()=>.5);
 assert.equal(b.enemies[0].faces,12);assert.equal(b.enemies[0].armourDie,8);
 assert(s.events.some(event=>event.type==='boss-wave'));
});
