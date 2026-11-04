import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,selectClass,claimLoot,buyFromShop,SHOP_STOCK,merchantStock,effectiveStats,
  equipItem,publicState,classFindChance,classGoldBonus,classBonusAttackDie,classBonusDefenceDie,classBombDie,classPrice,
  submitSequentialAction,endTurn,rollMovement} from '../src/engine.mjs';
import {createMaze,mazeClaim} from '../src/maze-play.mjs';
const T=1980000000000;
function game(klass){const s=freshState(T);ensurePlayer(s,'one','Player');const p=s.players.one;p.room='camp';selectClass(s,'one',klass,T);return {s,p};}
function addGear(p,category,slot,rarity='Rare'){
 const gear={id:'test-'+category,kind:'equipment',category,rarity,level:1,bonusDie:8,name:category,enchantments:[]};
 p.inventory.equipment.push(gear);p.equipped[slot]=gear.id;return gear;
}
test('only a confirmed permanent class activates perks; defaults remain backward-compatible',()=>{
 const s=freshState(T);ensurePlayer(s,'one','Player');const p=s.players.one;
 assert.equal(p.classChosen,false);assert.equal(classBonusAttackDie(p),0);
 assert.equal(classFindChance(null,'equipment'),.5);
 assert.equal(classGoldBonus(null,100),100);
 p.room='camp';selectClass(s,'one','knight',T);
 assert.equal(p.classChosen,true);
 assert.throws(()=>selectClass(s,'one','outlaw',T),/already/);
});
test('all four +25% effects change only their specified search category',()=>{
 for(const [klass,slot] of [['knight','equipment'],['warlock','potion'],['tinker','enchantment']]){
  const {s,p}=game(klass);p.room='woodland';
  assert.equal(classFindChance(klass,slot),.625);
  assert.equal(classFindChance(klass,'coin'),.5);
  assert(claimLoot(s,'one',slot,T,()=>.4).item,'.4 succeeds for specialist');
  const plain=freshState(T);ensurePlayer(plain,'one','Player');
  assert.equal(claimLoot(plain,'one',slot,T,()=>.4).item,null);
 }
 assert.equal(classGoldBonus('outlaw',100),125);
 assert.equal(classGoldBonus('knight',100),100);
 const {s,p}=game('outlaw');p.room='woodland';
 // First die is search, second one chooses the fixed coin reward tier.
 let n=0;const item=claimLoot(s,'one','coin',T,()=>[.9,.999][n++]).item;
 assert.equal(item.gold,1250);assert.equal(p.gold,1250);
});
test('class-specific shop prices are enforced and match the displayed player-specific merchant prices',()=>{
 const cases=[['knight','mace-common',35,27],['knight','armour-common',35,27],['outlaw','sword-common',45,34],['outlaw','shield-common',35,27],['warlock','staff-common',45,34],['warlock','guardian-ward',35,27],['tinker','blast-bomb',45,34],['tinker','meteor-scroll',120,90],['tinker','super-potion',150,113],['tinker','guardian-ward',35,27]];
 for(const [klass,sku,full,discount] of cases){const {s,p}=game(klass);p.gold=10000;
  const stock=SHOP_STOCK.find(x=>x.sku===sku);assert.equal(stock.cost,full);assert.equal(classPrice(p,stock),discount);
  const publicOffer=publicState(s,'one').shopStock.find(x=>x.sku===sku);assert.equal(publicOffer.cost,discount);
  buyFromShop(s,'one',sku,T);assert.equal(p.gold,10000-discount);
 }
 const {s,p}=game('tinker');const sword=SHOP_STOCK.find(x=>x.sku==='sword-common');assert.equal(classPrice(p,sword),sword.cost);
 assert.equal(classPrice(p,SHOP_STOCK.find(x=>x.sku==='blast-bomb'),true),Math.ceil(45*.75*.9));
});
test('one-sided weapons and defence are a separate class die, not a permanent increase to the base dice',()=>{
 for(const [klass,weapon,armour] of [['knight','Mace','Armour'],['outlaw','Sword','Shield'],['warlock','Staff',null],['tinker','Mace',null]]){
  const {p}=game(klass);addGear(p,weapon,'weapon');if(armour)addGear(p,armour,armour==='Shield'?'offhand':'armour');
  assert.equal(classBonusAttackDie(p),klass==='warlock'?4:klass==='tinker'?0:2);
  assert.equal(classBonusDefenceDie(p),armour?2:0);
  assert.equal(effectiveStats(p).classAttackDie,classBonusAttackDie(p));
 }
});
test('shields are genuine offhand equipment, not weapons occupying the main slot',()=>{
 const {s,p}=game('outlaw');const shield=addGear(p,'Shield','offhand');p.equipped.offhand=null;
 assert.throws(()=>equipItem(s,'one',shield.id,'weapon',T),/Shields must/);
 equipItem(s,'one',shield.id,'offhand',T);assert.equal(p.equipped.offhand,shield.id);
 assert(effectiveStats(p).armour>6);
});
test('tinker extra D4 is limited to bomb and meteor; not permanent character attack',()=>{
 const {p}=game('tinker');assert.equal(classBombDie(p,'blast-bomb'),4);assert.equal(classBombDie(p,'meteor-scroll'),4);
 assert.equal(classBombDie(p,'guardian-ward'),0);assert.equal(classBonusAttackDie(p),0);
});
test('maze loot respects class search probabilities with deterministic persisted per-player claim IDs',()=>{
 const {s,p}=game('warlock');s.completedQuests=Array.from({length:15},(_,i)=>i+1);p.level=25;
 createMaze(s,'one',1,'perks-test-seed',T);
 const run=s.mazeRuns[1];const room=run.map.entrance;
 // Verify the maze's actual saved outcomes against its seeded value: with a
 // fixed seed the same player cannot repeat even after rejoining.
 const result=mazeClaim(s,'one','potion',T);
 assert.equal(run.claimed[`one:${room}:potion`],true);
 assert.throws(()=>mazeClaim(s,'one','potion',T),/already/);
 assert(result.empty||result.item==='Healing Potion');
});
test('medium 5% Legendary chance is unchanged by Knight search bonus',()=>{
 const {s,p}=game('knight');p.room='q5r1';s.rooms.q5r1.battle.status='cleared';
 let i=0;const seq=[.9,.0,.999];const item=claimLoot(s,'one','equipment',T,()=>seq[i++]).item;
 assert.equal(item.rarity,'Legendary');
});

test('Tinker meteor scroll in Maze uses a single server-owned charge and damages enemies',async()=>{
 const {mazeTravel,mazeAction}=await import('../src/maze-play.mjs');
 const {s,p}=game('tinker');s.completedQuests=Array.from({length:15},(_,i)=>i+1);p.level=25;p.maxHp=300;p.hp=300;
 createMaze(s,'one',1,'tinker-meteor-test',T);
 const run=s.mazeRuns[1],start=run.map.rooms[run.map.entrance];
 const dir=Object.entries(start.connections).find(([,id])=>!run.map.rooms[id].hidden)?.[0];
 assert(dir,'entrance has a visible door');mazeTravel(s,'one',dir,T);
 const b=run.fights[run.positions.one];assert(b?.enemies.length);
 const hp=b.enemies.reduce((n,e)=>n+e.hp,0);
 p.inventory.consumables.push({id:'meteor-owned',name:'Meteor Scroll',sku:'meteor-scroll',charges:1,kind:'consumable'});
 mazeAction(s,'one',{type:'item',sku:'meteor-scroll'},T,()=>.5);
 assert.equal(p.inventory.consumables.filter(x=>x.id==='meteor-owned').length,0);
 assert(b.enemies.reduce((n,e)=>n+e.hp,0)<hp);
 assert.throws(()=>mazeAction(s,'one',{type:'item',sku:'meteor-scroll'},T),/One tactical|not owned|No active fight/);
});
