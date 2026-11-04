import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,move as actualMove,rollMovement,submitAction,resolveRound,tick,CLASS_DATA,ROOM_DATA,publicState,claimLoot,resetTestAdventure,LOOT_SLOTS,xpRequiredForLevel,effectiveStats,LEVEL_CAP,equipItem,unequipItem,bindEnchantment,usePotion,LAB_HEAL_FRACTION,claimTrainingRack,rollDie,RARITY_DICE,ROOM_IDS,enterQuest,ensureWorld,voteFinishQuest,buyFromShop,SHOP_STOCK,QUEST_MAX_RARITY,equipmentRarity,isWall,clearLine,endTurn,globalActivePlayer} from '../src/engine.mjs';
const t0=1_800_000_000_000;
// Navigation regressions still exercise real movement rules; the harness advances
// whole-party turns when a path takes more than a single D6 roll.
function move(s,id,dir,now=t0){
 for(let i=0;i<80;i++){
  const actor=globalActivePlayer(s);
  if(!actor)throw new Error('No active turn owner');
  if(actor!==id){
   if(s.players[actor].lastRolledTurn!==s.turn.round)rollMovement(s,actor,now,()=>.999);
   endTurn(s,actor,now,()=>0);continue;
  }
  const p=s.players[id];
  if(p.lastRolledTurn!==s.turn.round)rollMovement(s,id,now,()=>.999);
  else if(p.moveRemaining<=0){endTurn(s,id,now,()=>0);continue;}
  return actualMove(s,id,dir,now);
 }
 throw new Error('Navigation test stuck');
}
function game(){const s=freshState(t0);ensurePlayer(s,'one','Joe');ensurePlayer(s,'two','Friend');s.turn.deadline=t0+60_000;return s}
function enter(s,id='one',room='clearing'){let p=s.players[id];if(p.y!==3){move(s,id,'N',t0);p=s.players[id]};while(p.x<8)move(s,id,'E',t0);move(s,id,'E',t0);assert.equal(p.room,room);return p}
test('two player slots have independently preserved classic class stats',()=>{
 const s=game();assert.equal(s.players.one.maxHp,CLASS_DATA.knight.hp);assert.equal(s.players.two.maxHp,CLASS_DATA.outlaw.hp);
 assert.equal(s.players.one.room,'woodland');assert.equal(s.players.two.room,'woodland');
});
test('wall blocking and navigation constraints are enforced by the server',()=>{
 const s=game();move(s,'one','W',t0);assert.throws(()=>move(s,'one','W',t0),/wall|door/i);
 for(let i=0;i<3;i++)move(s,'one','N',t0);
 assert.equal(s.players.one.y,0);assert.throws(()=>move(s,'one','N',t0),/wall/i);
});
test('first player triggers combat in new room; friend can explore independently',()=>{
 const s=game();const p=enter(s);const b=s.rooms.clearing.battle;
 assert.equal(b.status,'active');assert.equal(b.enemies.length,2);assert.deepEqual(b.enemies.map(e=>e.hp),[6,6]);
 assert.equal(s.players.two.room,'woodland');assert.equal(s.rooms.clearing.discovered,true);
 assert.equal(p.x,0);assert.equal(b.deadline,null);assert(s.turn.deadline>0);
});
test('a player waiting for their global turn cannot attack early',()=>{
 const s=game();enter(s);
 assert.equal(globalActivePlayer(s),'one');
 assert.throws(()=>rollMovement(s,'two',t0),/Waiting for Joe/i);
 const b=s.rooms.clearing.battle;
 assert.equal(b.status,'active');assert(b.enemies.length>0);
});
test('timeout advances the global owner rather than running a room-specific clock',()=>{
 const s=game();s.turn.deadline=t0+60_000;
 assert.equal(tick(s,t0+59_999).length,0);
 assert.equal(tick(s,t0+60_000).length,1);
 assert.equal(globalActivePlayer(s),'two');
});
test('disconnect skips an absent participant without losing their room or HP',()=>{
 const s=game();const saved={...s.players.two};
 s.players.two.connected=false;
 assert.equal(s.players.two.hp,saved.hp);assert.equal(s.players.two.room,saved.room);
 rollMovement(s,'one',t0,()=>0);
 endTurn(s,'one',t0,()=>0);
 assert.equal(s.turn.round,2);
});
test('server rejects illegal combat actions and two actions in one turn',()=>{
 const s=game();const b=s.rooms.clearing.battle;
 s.players.one.room='clearing';b.status='active';b.round=s.turn.round;
 b.actions={};b.enemies=[{id:'x',x:7,y:3,hp:50,maxHp:50,faces:12,armourDie:4}];
 b.eligibleRound={one:s.turn.round};
 assert.throws(()=>submitAction(s,'one',{type:'teleport'},t0),/Invalid combat action/);
 submitAction(s,'one',{type:'defend'},t0,true);
 assert.throws(()=>submitAction(s,'one',{type:'attack'},t0,true),/already locked/);
});
test('boss room remains separate and D8 guardian has 8 HP',()=>{
 const s=game();enter(s);const b=s.rooms.clearing.battle;
 b.status='cleared';b.actions={};
 while(s.players.one.x<8)move(s,'one','E',t0);
 const res=move(s,'one','E',t0);
 assert.equal(res.saved,'room-entry');assert.equal(s.players.one.room,'watchpost');
 assert.equal(s.rooms.watchpost.battle.enemies[0].hp,8);
});
test('four supported players have distinct identities; fifth is rejected',()=>{
 const s=game();ensurePlayer(s,'three','Adult Three');ensurePlayer(s,'four','Adult Four');
 assert.throws(()=>ensurePlayer(s,'five','Stranger'),/Unrecognised player/);
 assert.equal(new Set(Object.values(s.players).map(p=>p.x+','+p.y)).size,4);
 assert.equal(publicState(s,'two').me,'two');assert.equal(publicState(s,'one').me,'one');
});
test('team defeat returns to Woodland Path checkpoint with restored HP',()=>{
 const s=game();enter(s);enter(s,'two');
 s.players.one.hp=0;s.players.two.hp=0;
 const response=resolveRound(s,'clearing',t0+200);
 assert.equal(response.saved,'checkpoint');
 assert.equal(s.players.one.room,'woodland');assert.equal(s.players.two.room,'woodland');
 assert.equal(s.players.one.hp,Math.ceil(s.players.one.maxHp*.8));
 assert.equal(s.rooms.clearing.battle.status,'dormant');
});

// Regression tests from the first live two-browser session.
test('players cannot enter another player’s square while exploring',()=>{
 const s=game();
 assert.throws(()=>move(s,'two','N',t0),/occupied/i);
 assert.deepEqual([s.players.two.x,s.players.two.y],[1,4]);
});
test('combat movement cannot overlap an enemy',()=>{
 const s=game();enter(s);
 s.players.one.x=4;s.players.one.y=3;
 submitAction(s,'one',{type:'move',dir:'E'},t0+100);
 assert.deepEqual([s.players.one.x,s.players.one.y],[4,3]);
 assert(s.log.some(e=>/square is (occupied|blocked)/.test(e.text)));
});
test('second player entering occupied doorway receives adjacent safe landing',()=>{
 const s=game();enter(s);
 const first=s.players.one;assert.deepEqual([first.x,first.y],[0,3]);
 const second=enter(s,'two');
 assert.notDeepEqual([second.x,second.y],[first.x,first.y]);
 assert.equal(second.room,'clearing');
});
test('enemy approach cannot step onto another occupied square',()=>{
 const s=game();enter(s);
 const b=s.rooms.clearing.battle;
 // Move first enemy behind the second along a row; neither can occupy the same tile.
 b.enemies[0].x=4;b.enemies[0].y=3;
 b.enemies[1].x=3;b.enemies[1].y=3;
 s.players.one.x=0;s.players.one.y=3;
 submitAction(s,'one',{type:'defend'},t0+100);
 assert.notDeepEqual([b.enemies[0].x,b.enemies[0].y],[b.enemies[1].x,b.enemies[1].y]);
});

test('reconnecting a player clears pre-existing player/enemy tile overlaps',()=>{
 const s=game();enter(s);
 s.players.one.x=5;s.players.one.y=3; // overlap the first D6 from old build
 const b=s.rooms.clearing.battle;
 ensurePlayer(s,'one','Joe');
 assert.notDeepEqual([s.players.one.x,s.players.one.y],[b.enemies[0].x,b.enemies[0].y]);
 assert.equal(s.players.one.room,'clearing');
});

// Tests for real-world bugs reported in the two-browser Cloudflare session.
test('two players never start or remain on the same square after reconnect',()=>{
  const s=game();s.players.two.x=1;s.players.two.y=3;
  ensurePlayer(s,'two','Friend');
  assert.notDeepEqual([s.players.one.x,s.players.one.y],[s.players.two.x,s.players.two.y]);
  assert.equal(s.version,8);
});
test('encounter spawn does not place a newly summoned enemy onto a player',()=>{
  const s=game();
  // Persisted state from the old build may have a character at the enemy spawn.
  s.players.two.room='clearing';s.players.two.x=5;s.players.two.y=3;
  enter(s,'one');
  const enemy=s.rooms.clearing.battle.enemies[0];
  assert.notDeepEqual([enemy.x,enemy.y],[5,3]);
});
test('fallback entry position for returning defeated companion is unoccupied',()=>{
  const s=game();
  s.players.two.room='woodland';s.players.two.x=3;s.players.two.y=4;
  s.players.two.hp=0;s.players.two.downedUntil=null;
  enter(s,'one');
  assert.equal(s.players.two.room,'clearing');
  assert.equal(s.players.two.hp,Math.ceil(s.players.two.maxHp*.8));
  assert.notDeepEqual([s.players.two.x,s.players.two.y],[s.players.one.x,s.players.one.y]);
});
test('reconnecting repairs persisted overlapping enemy positions as well as players',()=>{
  const s=game();enter(s);
  const b=s.rooms.clearing.battle;
  b.enemies[1].x=b.enemies[0].x;b.enemies[1].y=b.enemies[0].y;
  ensurePlayer(s,'two','Friend');
  assert.notDeepEqual([b.enemies[0].x,b.enemies[0].y],[b.enemies[1].x,b.enemies[1].y]);
});

// Stage 2B: active Durable Object battle state is persistent; only explicit lab reset renews it.
test('defeated watchpost guardian remains cleared until an explicit reset',()=>{
 const s=game();enter(s);s.rooms.clearing.battle.status='cleared';s.rooms.clearing.battle.actions={};
 while(s.players.one.x<8)move(s,'one','E',t0);
 move(s,'one','E',t0);
 assert.equal(s.rooms.watchpost.battle.status,'active');
 s.rooms.watchpost.battle.enemies[0].hp=0;
 const result=resolveRound(s,'watchpost',t0+100);
 assert.equal(result.saved,'boss-completed');
 assert.equal(s.rooms.watchpost.battle.status,'cleared');
 s.players.one.x=0;s.players.one.y=3;move(s,'one','W',t0+200);
 while(s.players.one.x<8)move(s,'one','E',t0+250);
 move(s,'one','E',t0+260);
 assert.equal(s.rooms.watchpost.battle.status,'cleared');
 assert.equal(s.rooms.watchpost.battle.enemies[0].hp,0);
});
test('explicit reset restores fresh dormant encounters and initial positions',()=>{
 const s=game();enter(s);s.rooms.clearing.battle.status='cleared';s.players.one.gold=900;
 const reset=resetTestAdventure(s,t0+200);
 assert.equal(reset.rooms.clearing.battle.status,'dormant');
 assert.equal(reset.rooms.watchpost.battle.status,'dormant');
 assert.equal(reset.players.one.room,'woodland');
 assert.equal(reset.players.one.gold,0);
 assert.equal(reset.players.one.connected,true);
 assert.equal(reset.players.two.connected,true);
 assert(reset.log.some(e=>e.text.includes('LAB RESET')));
});
test('each player can independently claim each of four room treasure types once',()=>{
 const s=game();for(const slot of LOOT_SLOTS)claimLoot(s,'one',slot,t0,()=>.99);
 assert.deepEqual(Object.keys(s.players.one.lootClaimed.woodland).sort(),LOOT_SLOTS.slice().sort());
 assert.equal(s.players.two.gold,0);
 assert.equal(s.players.one.gold,100);
 assert.equal(s.players.one.inventory.potions.length,1);
 assert.equal(s.players.one.inventory.equipment.length,1);
 assert.equal(s.players.one.inventory.enchantments.length,1);
 assert.throws(()=>claimLoot(s,'one','coin',t0,()=>.99),/already searched/i);
 const r=claimLoot(s,'two','coin',t0,()=>.99);
 assert.equal(r.item.gold,100);
 assert.equal(s.players.one.gold,100);
});
test('cannot claim treasure in active battle',()=>{
 const s=game();enter(s);
 assert.throws(()=>claimLoot(s,'one','coin',t0),/defeat the enemies/i);
 assert.equal(s.players.one.gold,0);
});
test('claims for separate rooms are independent but returning cannot reroll',()=>{
 const s=game();claimLoot(s,'one','coin',t0,()=>.99);
 enter(s);s.rooms.clearing.battle.status='cleared';claimLoot(s,'one','coin',t0,()=>.99);
 s.players.one.x=0;s.players.one.y=3;move(s,'one','W',t0);
 assert.throws(()=>claimLoot(s,'one','coin',t0,()=>.99),/already searched/);
 assert.equal(s.players.one.gold,200);
});
test('returning an existing saved player adds inventory fields without resetting cleared encounters',()=>{
 const s=game();delete s.players.one.lootClaimed;delete s.players.one.inventory;delete s.players.one.gold;
 s.rooms.watchpost.battle.status='cleared';ensurePlayer(s,'one','Joe');
 assert.deepEqual(s.players.one.inventory,{potions:[],equipment:[],enchantments:[],consumables:[]});
 assert.equal(s.rooms.watchpost.battle.status,'cleared');
});
test('Coin of Ages is only in its exact 1/500 coin sample band and Multishot V only in 1/1500 band',()=>{
 const s=game();
 const ages=claimLoot(s,'one','coin',t0,()=>1-.0002).item;
 assert.equal(ages.name,'Coin of Ages');
 s.unlockedQuest=4;enterQuest(s,'one',4,t0);s.rooms.q4r1.battle.status='cleared';
 const sequence=[.99,0];const multishot=claimLoot(s,'one','enchantment',t0,()=>sequence.shift()??0).item;
 assert.equal(multishot.name,'Multishot V');
 const ordinary=claimLoot(s,'two','enchantment',t0,()=>.5).item;
 assert.notEqual(ordinary.name,'Multishot V');
});
test('invalid loot slots cannot mutate inventory',()=>{
 const s=game();assert.throws(()=>claimLoot(s,'one','something',t0),/invalid treasure/i);
 assert.equal(s.players.one.inventory.equipment.length,0);
});

// Stage 2C — character HUD must be based on real, server-tracked stats and XP.
test('level thresholds follow 100 XP then 1.4 growth, capped at 30',()=>{
 assert.equal(xpRequiredForLevel(1),100);
 assert.equal(xpRequiredForLevel(2),140);
 assert.equal(xpRequiredForLevel(3),196);
 assert.equal(xpRequiredForLevel(30),0);
});
test('class-specific attack, armour and max HP match real combat stats at each level',()=>{
 const s=game();assert.equal(effectiveStats(s.players.one).attack,12);
 assert.equal(effectiveStats(s.players.one).armour,8);
 s.players.one.level=2;const st=effectiveStats(s.players.one);
 assert.equal(st.attack,14);assert.equal(st.armour,10);assert.equal(st.maxHp,60);
});
test('solo room XP is restrained and absent player receives none',()=>{
 const s=game();enter(s);
 const b=s.rooms.clearing.battle;
 submitAction(s,'one',{type:'defend'},t0+1);
 b.enemies.forEach(enemy=>enemy.hp=0);
 resolveRound(s,'clearing',t0+2);
 assert.equal(s.players.one.xp,16);
 assert.equal(s.players.one.level,1);
 assert.equal(s.players.two.xp,0);
});
test('support-only participants split their modest XP award',()=>{
 const s=game(),b=s.rooms.clearing.battle;
 s.players.one.room='clearing';s.players.two.room='clearing';
 b.status='active';b.round=s.turn.round;b.actions={};b.turnEnded={};
 b.eligibleRound={one:s.turn.round,two:s.turn.round};
 b.participated={one:true,two:true};b.damageBy={one:0,two:0};
 b.enemies=[{id:'done',hp:0,maxHp:6}];
 resolveRound(s,'clearing',t0+4);
 assert.equal(s.players.one.xp,8);
 assert.equal(s.players.two.xp,8);
});
test('two early rooms do not catapult a character through levels',()=>{
 const s=game();enter(s);
 const b=s.rooms.clearing.battle;submitAction(s,'one',{type:'defend'},t0+1);
 b.enemies.forEach(e=>e.hp=0);resolveRound(s,'clearing',t0+2);
 while(s.players.one.x<8)move(s,'one','E',t0+3);move(s,'one','E',t0+4);
 submitAction(s,'one',{type:'defend'},t0+5);
 s.rooms.watchpost.battle.enemies.forEach(e=>e.hp=0);resolveRound(s,'watchpost',t0+6);
 assert.equal(s.players.one.level,1);assert(s.players.one.xp<100);
 assert.equal(s.players.one.maxHp,50);assert.equal(effectiveStats(s.players.one).attack,12);
});
test('older saved characters retain level and XP during migration',()=>{
 const s=game();s.players.one.level=2;s.players.one.xp=70;
 ensurePlayer(s,'one','Joe');
 assert.equal(s.players.one.level,2);assert.equal(s.players.one.xp,70);
 assert.equal(s.players.one.maxHp,60);
});
test('no XP is awarded again for already cleared enemies',()=>{
 const s=game();enter(s);submitAction(s,'one',{type:'defend'},t0);
 s.rooms.clearing.battle.enemies.forEach(e=>e.hp=0);resolveRound(s,'clearing',t0+1);
 const xp=s.players.one.xp;resolveRound(s,'clearing',t0+2);
 assert.equal(s.players.one.xp,xp);
});

// Phase 3A tests — authoritative gear, permanent enchantments, healing actions.
function equipSample(s,id,category='Sword',rarity='Rare',level=1){
 const p=s.players[id],item={id:`${id}-sample-${p.inventory.equipment.length}`,category,rarity,level,name:`${rarity} ${category} · L${level}`,enchantments:[]};
 p.inventory.equipment.push(item);return item;
}
function potionSample(s,id,charges=2){
 const p=s.players[id],item={id:`${id}-pot-${p.inventory.potions.length}`,kind:'potion',name:'Healing Potion',charges};p.inventory.potions.push(item);return item;
}
test('equipping and unequipping a weapon changes actual server attack and range',()=>{
 const s=game(),p=s.players.one,weapon=equipSample(s,'one','Bow','Legendary');
 const before=effectiveStats(p);
 equipItem(s,'one',weapon.id,t0);
 assert.equal(p.equipped.weapon,weapon.id);
 assert.equal(effectiveStats(p).attack,before.attack+12);
 assert.equal(effectiveStats(p).range,3);
 assert.equal(publicState(s,'one').players.one.combatStats.attack,effectiveStats(p).attack);
 unequipItem(s,'one','weapon',t0);
 assert.equal(effectiveStats(p).attack,before.attack);
 assert.equal(effectiveStats(p).range,before.range);
});
test('equipped armour increases real protection, one item per slot',()=>{
 const s=game(),p=s.players.one;const first=equipSample(s,'one','Armour','Rare');const second=equipSample(s,'one','Armour','Exotic');
 equipItem(s,'one',first.id);assert.equal(effectiveStats(p).armour,13);
 equipItem(s,'one',second.id);assert.equal(effectiveStats(p).armour,26);
 assert.equal(p.equipped.armour,second.id);
});
test('equipment ownership and real-level requirement enforced by server',()=>{
 const s=game();const high=equipSample(s,'one','Mace','Mythic',3);
 assert.throws(()=>equipItem(s,'one',high.id),/real character level/i);
 assert.throws(()=>equipItem(s,'two',high.id),/not in your backpack/i);
 assert.equal(s.players.one.equipped.weapon,null);
});
test('equipment cannot change during an active tactical encounter',()=>{
 const s=game(),weapon=equipSample(s,'one','Sword');enter(s,'one');
 assert.throws(()=>equipItem(s,'one',weapon.id),/unavailable during combat/);
});
test('Sharpness binding is permanent, increases damage, and consumes unused enchantment',()=>{
 const s=game(),p=s.players.one,item=equipSample(s,'one','Sword');
 p.inventory.enchantments.push({id:'sharpen-2',name:'Sharpness II',school:'Sharpness',level:2});
 equipItem(s,'one',item.id);const before=effectiveStats(p).attack;
 bindEnchantment(s,'one','sharpen-2',item.id);
 assert.equal(effectiveStats(p).attack,before+6);
 assert.equal(p.inventory.enchantments.length,0);
 assert.equal(item.enchantments.length,1);
 assert.throws(()=>bindEnchantment(s,'one','sharpen-2',item.id),/must belong/);
});
test('Fortification binds only to armour; duplicate school cannot stack on one item',()=>{
 const s=game(),p=s.players.one,armour=equipSample(s,'one','Armour');const bow=equipSample(s,'one','Bow');
 p.inventory.enchantments.push({id:'fort-1',name:'Fortification I',school:'Fortification',level:1});
 assert.throws(()=>bindEnchantment(s,'one','fort-1',bow.id),/needs armour/i);
 equipItem(s,'one',armour.id);const before=effectiveStats(p).armour;
 bindEnchantment(s,'one','fort-1',armour.id);assert.equal(effectiveStats(p).armour,before+2);
 p.inventory.enchantments.push({id:'fort-2',name:'Fortification II',school:'Fortification',level:2});
 assert.throws(()=>bindEnchantment(s,'one','fort-2',armour.id),/already has this enchantment/);
 assert.equal(p.inventory.enchantments.length,1);
});
test('Multishot V now binds only to bows, permanently',()=>{
 const s=game(),p=s.players.one,item=equipSample(s,'one','Bow'),sword=equipSample(s,'one','Sword');
 p.inventory.enchantments.push({id:'m5',name:'Multishot V',school:'Multishot',level:5});
 assert.throws(()=>bindEnchantment(s,'one','m5',sword.id),/needs a Bow/);
 bindEnchantment(s,'one','m5',item.id);
 equipItem(s,'one',item.id);
 assert.equal(effectiveStats(p).multishot,5);
 assert.equal(p.inventory.enchantments.length,0);assert.equal(item.enchantments.length,1);
});
test('legacy saved items receive stable server IDs without losing equipment or progress',()=>{
 const s=game(),p=s.players.one;
 p.inventory.equipment.push({kind:'equipment',category:'Sword',rarity:'Rare',level:1,name:'Old Sword'});
 p.inventory.potions.push({kind:'potion',name:'Healing Potion',charges:2});
 p.xp=57;p.gold=250;
 ensurePlayer(s,'one','Joe');
 const id=p.inventory.equipment[0].id;
 ensurePlayer(s,'one','Joe');
 assert.equal(p.inventory.equipment[0].id,id);
 assert.ok(p.inventory.potions[0].id);
 assert.equal(p.xp,57);assert.equal(p.gold,250);
});
test('healing self outside combat consumes exactly one charge and respects max HP',()=>{
 const s=game(),p=s.players.one,pot=potionSample(s,'one');p.hp=30;
 usePotion(s,'one','one',t0);
 assert.equal(p.hp,45);assert.equal(p.inventory.potions.length,1);
 assert.equal(p.inventory.potions[0].charges,1);
 p.hp=48;usePotion(s,'one','one',t0);
 assert.equal(p.hp,50);assert.equal(p.inventory.potions.length,0);
 assert.throws(()=>usePotion(s,'one','one',t0),/full health/);
});
test('adjacent teammate can receive healing from player-owned potion',()=>{
 const s=game();potionSample(s,'one');s.players.two.hp=25;
 usePotion(s,'one','two',t0);
 assert.equal(s.players.two.hp,25+Math.ceil(s.players.two.maxHp*LAB_HEAL_FRACTION));
 assert.equal(s.players.one.inventory.potions[0].charges,1);
 s.players.two.x=8;
 assert.throws(()=>usePotion(s,'one','two',t0),/stand next to/i);
});
test('potion cannot heal downed teammate or use another player’s inventory',()=>{
 const s=game();potionSample(s,'one');s.players.two.hp=0;
 assert.throws(()=>usePotion(s,'one','two',t0),/Revive/);
 s.players.two.hp=20;
 assert.throws(()=>usePotion(s,'two','two',t0),/No healing-potion charges/);
});
test('combat healing queues until that player explicitly ends their global turn',()=>{
 const s=game(),b=s.rooms.clearing.battle;
 potionSample(s,'one',2);s.players.one.room='clearing';s.players.one.hp=28;
 b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={one:s.turn.round};
 b.enemies=[{id:'foe',name:'Test',hp:60,maxHp:60,x:7,y:3,faces:20,atk:1,armourDie:4}];
 rollMovement(s,'one',t0,()=>.5);
 usePotion(s,'one','one',t0);
 assert.equal(s.players.one.hp,28);assert.equal(s.players.one.inventory.potions.length,2);
 endTurn(s,'one',t0+1,()=>0);
 assert(s.players.one.hp>28);assert.equal(s.players.one.inventory.potions.length,1);
});
test('a queued potion takes the single action for the player turn',()=>{
 const s=game(),b=s.rooms.clearing.battle;
 potionSample(s,'one',2);s.players.one.room='clearing';s.players.one.hp=25;
 b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={one:s.turn.round};
 b.enemies=[{id:'foe',name:'Test',hp:60,maxHp:60,x:7,y:3,faces:20,atk:1,armourDie:4}];
 rollMovement(s,'one',t0,()=>.5);
 usePotion(s,'one','one',t0);
 assert.throws(()=>submitAction(s,'one',{type:'attack'},t0,true),/already locked/);
});
test('invalid potion action does not consume inventory or allow multiple charge claims',()=>{
 const s=game(),p=s.players.one,pot=potionSample(s,'one',1);
 assert.throws(()=>usePotion(s,'one','one'),/full health/);
 assert.equal(pot.charges,1);assert.equal(p.inventory.potions.length,1);
});

// Phase 3B — combat rules and training rack exercised against server state.
test('classic tier-to-die progression remains exact',()=>{
 assert.deepEqual(RARITY_DICE,{Common:4,Uncommon:6,Rare:8,Legendary:12,Mythic:20,Exotic:30});
 assert.equal(rollDie(8,()=>0),1);assert.equal(rollDie(8,()=>.99999),8);
});
test('main and off-hand are distinct slots, one sword never occupies both',()=>{
 const s=game(),p=s.players.one,first=equipSample(s,'one','Sword','Rare'),second=equipSample(s,'one','Mace','Rare');
 equipItem(s,'one',first.id,'weapon');equipItem(s,'one',second.id,'offhand');
 assert.equal(p.equipped.weapon,first.id);assert.equal(p.equipped.offhand,second.id);
 assert.equal(effectiveStats(p).offhand,8);assert.equal(effectiveStats(p).offhandMax,4);
 equipItem(s,'one',first.id,'offhand');
 assert.equal(p.equipped.weapon,null);assert.equal(p.equipped.offhand,first.id);
 assert.throws(()=>equipItem(s,'one',second.id,'armour'),/weapon cannot/);
 assert.throws(()=>equipItem(s,'one',first.id,'hat'),/Invalid equipment slot/);
 unequipItem(s,'one','offhand');assert.equal(p.equipped.offhand,null);
});
test('off-hand receives half a second independent die roll on real server attack',()=>{
 const s=game(),p=enter(s),e=s.rooms.clearing.battle.enemies[0];
 e.hp=100;e.maxHp=100;e.armourDie=4;p.x=4;p.y=3;
 const off=equipSample(s,'one','Sword','Rare');p.equipped.offhand=off.id;
 const b=s.rooms.clearing.battle;b.actions.one={type:'attack',target:e.id};
 resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(e.hp,88); // D12 main + ceil(D8 / 2) - D4 enemy armour = 12
 assert(s.log.some(x=>/off-hand/.test(x.text)));
});
test('chosen target receives the hit rather than the closest enemy',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,[a,c]=b.enemies;
 p.x=3;p.y=3;a.x=4;a.y=3;c.x=4;c.y=4;
 const bow=equipSample(s,'one','Bow','Uncommon');p.equipped.weapon=bow.id;
 b.actions.one={type:'attack',target:c.id};
 resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(a.hp,a.maxHp);assert(c.hp<c.maxHp);
});
test('normal mace sweep can hit two nearby dice in the same attack',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,[a,c]=b.enemies;
 p.x=3;p.y=3;a.x=4;a.y=3;c.x=4;c.y=4;
 p.equipped.weapon=equipSample(s,'one','Mace','Rare').id;
 b.actions.one={type:'attack',target:a.id};resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(a.hp,0);assert.equal(c.hp,0);
});
test('bound Multishot strikes two foes along same bow firing line',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,[a,c]=b.enemies;
 p.x=1;p.y=3;a.x=2;a.y=3;c.x=3;c.y=3;
 const bow=equipSample(s,'one','Bow','Rare');bow.enchantments=[{id:'x',school:'Multishot',level:2}];
 p.equipped.weapon=bow.id;b.actions.one={type:'attack',target:a.id};
 resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(a.hp,0);assert.equal(c.hp,0);
});
test('Legendary sword SPECIAL is a D30 attack and respects cross-room turn cooldown',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,e=b.enemies[0];
 p.x=4;p.y=3;e.hp=500;e.maxHp=500;
 const blade=equipSample(s,'one','Sword','Legendary');p.equipped.weapon=blade.id;
 assert.deepEqual(effectiveStats(p).special,{dice:[30],cooldown:3});
 b.actions.one={type:'special',target:e.id};resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(e.hp,474);assert.equal(p.combatTurns,1);
 assert.throws(()=>submitAction(s,'one',{type:'special',target:e.id},t0+200),/recharging/);
 // Two further resolved turns complete the 3-turn interval.
 b.actions.one={type:'defend'};resolveRound(s,'clearing',t0+200,()=>0);
 b.actions.one={type:'defend'};resolveRound(s,'clearing',t0+300,()=>0);
 assert.equal(p.combatTurns,3);
 assert.doesNotThrow(()=>submitAction(s,'one',{type:'special',target:e.id},t0+400));
});
test('Exotic sword special rolls 2D100 rather than a normal strike',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,e=b.enemies[0];
 p.x=4;p.y=3;e.hp=500;e.maxHp=500;p.equipped.weapon=equipSample(s,'one','Sword','Exotic').id;
 b.actions.one={type:'special',target:e.id};resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(e.hp,304); // 200 minus D4 defence
 assert.equal(effectiveStats(p).special.cooldown,5);
});
test('Mythic mace special rolls D20 against up to five dice',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,[a,c]=b.enemies;
 p.x=3;p.y=3;a.x=4;a.y=3;c.x=4;c.y=4;
 p.equipped.weapon=equipSample(s,'one','Mace','Mythic').id;
 b.actions.one={type:'special',target:a.id};resolveRound(s,'clearing',t0+100,()=>.999999);
 assert.equal(a.hp,0);assert.equal(c.hp,0);
 assert.equal(effectiveStats(p).special.cooldown,2);
});
test('training rack grants controlled test gear once and preserves room drop odds',()=>{
 const s=game(),p=s.players.one;
 const countBefore=p.inventory.equipment.length;
 claimTrainingRack(s,'one',t0);assert.equal(p.inventory.equipment.length,countBefore+7);
 assert.equal(p.inventory.enchantments[0].school,'Multishot');
 assert.equal(p.trainingRackClaimed,true);
 assert.deepEqual(p.lootClaimed,{});
 assert.throws(()=>claimTrainingRack(s,'one',t0),/already collected/);
 assert.equal(s.players.two.inventory.equipment.length,0);
 claimTrainingRack(s,'two',t0);assert.equal(s.players.two.inventory.equipment.length,7);
 const reset=resetTestAdventure(s,t0);assert.equal(reset.players.one.trainingRackClaimed,false);
});
test('training rack rejected during combat or away from Woodland',()=>{
 const s=game();enter(s);
 assert.throws(()=>claimTrainingRack(s,'one'),/combat|Woodland/);
 assert.equal(s.players.one.trainingRackClaimed,false);
});
test('old equipped saved items preserve their ID and acquire optional offhand slot',()=>{
 const s=game(),p=s.players.one,item=equipSample(s,'one','Sword','Rare');
 p.equipped={weapon:item.id,armour:null};delete p.specialUsedAt;delete p.combatTurns;
 ensurePlayer(s,'one','Joe');
 assert.equal(p.equipped.weapon,item.id);assert.equal(p.equipped.offhand,null);
 assert.deepEqual(p.specialUsedAt,{});assert.equal(p.combatTurns,0);
});

test('broadcast shows allies without exposing their private inventory or treasure claims',()=>{
 const s=game();claimTrainingRack(s,'two');
 const mine=publicState(s,'two'),theirs=publicState(s,'one');
 assert.equal(mine.players.two.inventory.equipment.length,7);
 assert.equal(theirs.players.two.inventory,undefined);
 assert.equal(theirs.players.two.lootClaimed,undefined);
 assert.equal(theirs.players.two.equipped,undefined);
 assert.equal(theirs.players.two.combatStats.attack,14);
 assert.equal(theirs.players.two.hp,s.players.two.hp);
});


test('Phase 4 has exactly eighteen server-backed rooms across first four original quests',()=>{
 assert.equal(ROOM_IDS.filter(id=>ROOM_DATA[id].quest>=1&&ROOM_DATA[id].quest<=4).length,18);
 assert.deepEqual(Object.entries(ROOM_DATA).filter(([id,d])=>d.quest===2).map(([id,d])=>d.name),
   ['Abandoned Mine','Crystal Hollow','Glittering Gallery','Miners’ Vault','Crystal Heart']);
 assert.equal(ROOM_DATA.q4r5.stageTwo,true);
});
test('legacy Quest 1 success migrates as completion without wiping player items',()=>{
 const s=game();const p=s.players.one;
 p.gold=100;p.xp=37;p.inventory.equipment=[{id:'legacy',name:'Old sword',category:'Sword',rarity:'Common',level:1}];
 s.rooms.watchpost.battle.status='cleared';delete s.unlockedQuest;delete s.completedQuests;
 for(const id of ROOM_IDS.filter(r=>!['woodland','clearing','watchpost'].includes(r)))delete s.rooms[id];
 ensurePlayer(s,'one','Joe');
 assert.equal(s.unlockedQuest,2);assert(s.completedQuests.includes(1));
 assert.equal(p.gold,100);assert.equal(p.xp,37);assert.equal(p.inventory.equipment[0].id,'legacy');
 assert(s.rooms.q4r5);
});
test('locked quest rejected; entering an unlocked quest preserves the old world',()=>{
 const s=game();
 assert.throws(()=>enterQuest(s,'one',2,t0),/not unlocked/);
 assert.throws(()=>enterQuest(s,'one',5,t0),/not unlocked/);
 s.rooms.watchpost.battle.status='cleared';ensureWorld(s);
 const result=enterQuest(s,'one',2,t0);
 assert.equal(result.saved,'room-entry');assert.equal(s.players.one.room,'q2r1');
 assert.equal(s.rooms.q2r1.discovered,true);assert.equal(s.rooms.clearing.battle.status,'dormant');
});
test('Quest 2 guaranteed shiny encounter is double HP and collision-safe',()=>{
 const s=game();s.rooms.watchpost.battle.status='cleared';enterQuest(s,'one',2,t0);
 s.rooms.q2r1.battle.status='cleared';s.players.one.x=8;s.players.one.y=3;move(s,'one','E',t0);
 const enemy=s.rooms.q2r2.battle.enemies[0];assert.equal(enemy.variant,'shiny');
 assert.equal(enemy.faces,4);assert.equal(enemy.hp,8);
});
test('Quest 3 Large dice are true two-by-two obstacles',()=>{
 const s=game();s.unlockedQuest=3;enterQuest(s,'one',3,t0);
 s.rooms.q3r1.battle.status='cleared';s.players.one.x=8;s.players.one.y=3;
 move(s,'one','E',t0);
 const b=s.rooms.q3r2.battle,e=b.enemies[0];assert.equal(e.variant,'large');assert.equal(e.hp,12);
 s.players.one.x=e.x-1;s.players.one.y=e.y;
 submitAction(s,'one',{type:'move',dir:'E'},t0+10);
 assert.equal(s.players.one.x,e.x-1);
 assert(s.log.some(x=>/square is (occupied|blocked)/.test(x.text)));
});
test('Quest 4 final room has Large Shiny D4 then D12 boss before unlocking completion',()=>{
 const s=game();s.unlockedQuest=4;enterQuest(s,'one',4,t0);
 // Navigate test adventure by marking previous rooms cleared, then passing east doors.
 for(let i=1;i<5;i++){
   const id=`q4r${i}`;s.rooms[id].battle.status='cleared';
   s.players.one.x=8;s.players.one.y=3;move(s,'one','E',t0);
 }
 const b=s.rooms.q4r5.battle;
 assert.equal(b.enemies.length,1);assert.equal(b.enemies[0].variant,'large-shiny');
 assert.equal(b.enemies[0].hp,24);
 b.enemies[0].hp=0;resolveRound(s,'q4r5',t0+10,()=>.5);
 assert.equal(b.status,'active');assert.equal(b.wave,1);
 assert.equal(b.enemies[0].faces,12);assert.equal(b.enemies[0].variant,'boss');
 assert(!s.completedQuests.includes(4));
 b.enemies[0].hp=0;resolveRound(s,'q4r5',t0+20,()=>.5);
 assert.equal(b.status,'cleared');assert(s.completedQuests.includes(4));
});
test('quest 2 final boss completion unlocks quest 3 without resetting progression',()=>{
 const s=game();s.unlockedQuest=2;enterQuest(s,'one',2,t0);
 for(let i=1;i<5;i++){
   const id=`q2r${i}`;s.rooms[id].battle.status='cleared';
   s.players.one.x=8;s.players.one.y=3;move(s,'one','E',t0);
 }
 const b=s.rooms.q2r5.battle;s.players.one.gold=77;b.participated.one=true;
 for(const e of b.enemies)e.hp=0;
 resolveRound(s,'q2r5',t0+100,()=>.5);
 assert.equal(s.unlockedQuest,3);assert(s.completedQuests.includes(2));
 assert.equal(s.players.one.gold,99);
});
test('four players are independently present in shared room tactical round',()=>{
 const s=game();ensurePlayer(s,'three','Adult Three');ensurePlayer(s,'four','Adult Four');
 for(const [i,id] of ['one','two','three','four'].entries()){
   s.players[id].room='clearing';s.players[id].x=i;s.players[id].y=2;
 }
 // Trigger encounter by entering from dormant with an alternate player in the room.
 const b=s.rooms.clearing.battle;
 b.status='active';b.round=1;b.eligibleRound={one:1,two:1,three:1,four:1};
 b.enemies=[{id:'sample',name:'D6',faces:6,hp:6,maxHp:6,atk:4,armourDie:4,x:7,y:3}];b.actions={};
 submitAction(s,'one',{type:'defend'},t0);
 submitAction(s,'two',{type:'defend'},t0);
 submitAction(s,'three',{type:'defend'},t0);
 assert.equal(b.round,1);
 submitAction(s,'four',{type:'defend'},t0);
 assert.equal(b.round,2);
});
test('sword main with bow off attacks at bow-only range with half bow roll',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,e=b.enemies[0];
 p.x=1;p.y=3;e.x=4;e.y=3;e.hp=100;e.maxHp=100;e.armourDie=2;
 const main=equipSample(s,'one','Sword','Rare'),off=equipSample(s,'one','Bow','Exotic');
 p.equipped.weapon=main.id;p.equipped.offhand=off.id;
 assert.equal(effectiveStats(p).mainRange,1);assert.equal(effectiveStats(p).offhandRange,3);
 b.actions.one={type:'attack',target:e.id};resolveRound(s,'clearing',t0+1,()=>.99999);
 assert.equal(e.hp,87); // half D30 (15) minus D2 (2); no main roll
 assert(s.log.some(x=>/no main in range \+15 half off-hand/.test(x.text)));
});
test('bow main with sword off attacks at range and adds half sword damage only adjacent',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,e=b.enemies[0];
 const main=equipSample(s,'one','Bow','Rare'),off=equipSample(s,'one','Sword','Rare');
 p.equipped.weapon=main.id;p.equipped.offhand=off.id;e.hp=200;e.maxHp=200;e.armourDie=2;
 p.x=1;p.y=3;e.x=4;e.y=3;
 b.actions.one={type:'attack',target:e.id};resolveRound(s,'clearing',t0+1,()=>.99999);
 assert.equal(e.hp,182); // D20 main - D2, sword out of range
 p.x=3;p.y=3;
 b.actions.one={type:'attack',target:e.id};resolveRound(s,'clearing',t0+2,()=>.99999);
 assert.equal(e.hp,160); // D20 main + half D8 (4) - D2
});
test('range of sword special never borrows bow off-hand range',()=>{
 const s=game(),p=enter(s),b=s.rooms.clearing.battle,e=b.enemies[0];
 const main=equipSample(s,'one','Sword','Legendary'),off=equipSample(s,'one','Bow','Rare');
 p.equipped.weapon=main.id;p.equipped.offhand=off.id;
 e.hp=100;e.maxHp=100;p.x=1;p.y=3;e.x=4;e.y=3;
 b.actions.one={type:'special',target:e.id};resolveRound(s,'clearing',t0+1,()=>.99999);
 assert.equal(e.hp,100);
 assert(s.log.some(x=>/no enemy in the main weapon special attack range/.test(x.text)));
});

test('first hero launching Quest 3 can act immediately; late joiner waits next round',()=>{
 const s=game();s.unlockedQuest=3;enterQuest(s,'one',3,t0);
 const battle=s.rooms.q3r1.battle;assert.equal(battle.status,'active');
 assert.equal(battle.eligibleRound.one,1);
 enterQuest(s,'two',3,t0+10);assert.equal(battle.eligibleRound.two,2);
 submitAction(s,'one',{type:'defend'},t0+20);assert.equal(battle.round,2);
});
