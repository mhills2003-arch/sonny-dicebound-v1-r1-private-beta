import test from 'node:test';
import assert from 'node:assert/strict';
import {
 freshState,ensurePlayer,buyFromShop,submitSequentialAction,endTurn,
 rollMovement,effectiveStats,resaleValue,sellToShop,publicState,
 SHOP_STOCK,merchantStock,refreshMerchant,ensureWorld
} from '../src/engine.mjs';
const T=1_950_000_000_000;
const ITEMS=['blast-bomb','meteor-scroll','guardian-ward','super-potion'];
function game(){
 const s=freshState(T);ensurePlayer(s,'one','One');
 const p=s.players.one;p.room='camp';p.gold=10_000;
 return {s,p};
}
function fight(s,p,{enemyX=3,enemyHp=500,atk=2}={}){
 p.room='clearing';p.x=1;p.y=3;
 const b=s.rooms.clearing.battle;
 b.status='active';b.round=s.turn.round;b.actions={};b.eligibleRound={one:s.turn.round};b.participated={};b.damageBy={};
 b.enemies=[{id:'e1',name:'First foe',faces:30,role:'normal',variant:'normal',x:enemyX,y:3,hp:enemyHp,maxHp:enemyHp,armourDie:4,atk},
 {id:'e2',name:'Second foe',faces:30,role:'normal',variant:'normal',x:7,y:3,hp:enemyHp,maxHp:enemyHp,armourDie:4,atk}];
 rollMovement(s,'one',T,()=>0);
 return b;
}
function use(s,sku){submitSequentialAction(s,'one',{type:'item',sku},T);return endTurn(s,'one',T,()=>.9999)}
test('four original combat consumables have prices and stay in personal inventory when bought',()=>{
 const {s,p}=game();
 const prices=[45,120,35,150];
 for(let i=0;i<ITEMS.length;i++){
   const sku=ITEMS[i],item=SHOP_STOCK.find(x=>x.sku===sku);
   assert.equal(item.kind,'consumable');assert.equal(item.cost,prices[i]);
   buyFromShop(s,'one',sku,T);
   assert.equal(p.inventory.consumables.at(-1).sku,sku);
   assert.equal(resaleValue(p.inventory.consumables.at(-1)),Math.floor(prices[i]/2));
 }
 assert.equal(p.gold,10000-prices.reduce((a,b)=>a+b,0));
 assert.equal(publicState(s,'one').players.one.inventory.consumables.length,4);
 assert.equal(publicState(s,'two').players.one.inventory,undefined,'other players cannot inspect inventory');
});
test('consumables can be sold but purchases are refused outside the camp',()=>{
 const {s,p}=game();buyFromShop(s,'one','blast-bomb',T);
 assert.equal(sellToShop(s,'one','consumables',p.inventory.consumables[0].id,T).price,22);
 assert.equal(p.inventory.consumables.length,0);
 p.room='clearing';assert.throws(()=>buyFromShop(s,'one','meteor-scroll',T),/camp/i);
});
test('Blast Bomb only hits foes within range and deducts exactly one item',()=>{
 const {s,p}=game();buyFromShop(s,'one','blast-bomb',T);
 const b=fight(s,p);use(s,'blast-bomb');
 assert.equal(p.inventory.consumables.length,0);
 assert(b.enemies[0].hp<500);
 assert.equal(b.enemies[1].hp,500);
 assert((b.damageBy.one||0)>0);
});
test('Meteor Scroll hits multiple distant enemies and records damage for XP',()=>{
 const {s,p}=game();buyFromShop(s,'one','meteor-scroll',T);
 const b=fight(s,p);use(s,'meteor-scroll');
 assert.equal(p.inventory.consumables.length,0);
 assert(b.enemies.every(e=>e.hp<500));
 assert((b.damageBy.one||0)>0);
});
test('Guardian Tonic heals and blocks the following high-damage strike',()=>{
 const {s,p}=game();buyFromShop(s,'one','guardian-ward',T);
 p.hp=20;const b=fight(s,p,{enemyX:2,atk:100});
 // The second distant enemy does not attack on this turn; only the adjacent strike.
 use(s,'guardian-ward');
 assert.equal(p.inventory.consumables.length,0);
 assert.equal(p.wardCharges,0);
 assert(p.hp>20,'the tonic restored health');
 assert(s.log.some(e=>/Ward blocks the strike/.test(e.text)));
});
test('Superstrength doubles attack and defence for its room only',()=>{
 const {s,p}=game();buyFromShop(s,'one','super-potion',T);
 const b=fight(s,p);
 const before=effectiveStats(p);
 use(s,'super-potion');const after=effectiveStats(p);
 assert.equal(after.attack,2*before.attack);assert.equal(after.armour,2*before.armour);
 assert.equal(p.inventory.consumables.length,0);
 p.room='camp';const elsewhere=effectiveStats(p);
 assert.deepEqual({attack:elsewhere.attack,armour:elsewhere.armour},{attack:before.attack,armour:before.armour});
});
test('item actions are validated server-side and cannot be duplicated',()=>{
 const {s,p}=game();buyFromShop(s,'one','meteor-scroll',T);fight(s,p);
 assert.throws(()=>submitSequentialAction(s,'one',{type:'item',sku:'hacked-item'},T),/Unknown combat consumable/);
 assert.throws(()=>submitSequentialAction(s,'one',{type:'item',sku:'blast-bomb'},T),/do not own/);
 submitSequentialAction(s,'one',{type:'item',sku:'meteor-scroll'},T);
 assert.equal(p.inventory.consumables.length,1,'queueing is not immediate use');
 assert.throws(()=>submitSequentialAction(s,'one',{type:'item',sku:'meteor-scroll'},T),/already locked/i);
 endTurn(s,'one',T,()=>.5);
 assert.equal(p.inventory.consumables.length,0);
});
test('legacy characters are migrated without resetting equipment, XP or completed quests',()=>{
 const {s,p}=game();p.xp=82;s.completedQuests=[1,2];
 delete p.inventory.consumables;delete p.wardCharges;delete s.legendaryMerchantOffer;
 ensurePlayer(s,'one','One');ensureWorld(s);
 assert.equal(p.xp,82);assert.deepEqual(s.completedQuests,[1,2]);
 assert.deepEqual(p.inventory.consumables,[]);assert.equal(p.wardCharges,0);
 assert.equal(merchantStock(s).filter(x=>x.rarity==='Legendary').length,0);
});
test('Legendary stock is at most one single-use merchant offer after a 5% refresh',()=>{
 const {s,p}=game();s.unlockedQuest=5;
 refreshMerchant(s,()=>.500);assert.equal(merchantStock(s).filter(x=>x.rarity==='Legendary').length,0);
 let k=0;refreshMerchant(s,()=>[.049,.999][k++]);
 const stock=merchantStock(s).filter(x=>x.rarity==='Legendary');assert.equal(stock.length,1);
 assert(['sword-legendary','bow-legendary','mace-legendary','staff-legendary'].includes(stock[0].sku));
 const chosen=stock[0].sku;buyFromShop(s,'one',chosen,T);
 assert.equal(merchantStock(s).filter(x=>x.rarity==='Legendary').length,0);
 assert.throws(()=>buyFromShop(s,'one',chosen,T),/not stocked/i);
});
