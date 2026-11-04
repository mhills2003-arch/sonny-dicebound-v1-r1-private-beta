import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,ROOM_DATA,SHOP_STOCK,RARITY_DICE,QUEST_MAX_RARITY,equipmentRarity,claimLoot,buyFromShop,resaleValue,merchantStock,refreshMerchant,MEDIUM_LEGENDARY_CHANCE} from '../src/engine.mjs';
const T=1_800_000_000_000;
const fresh=()=>{const s=freshState(T);ensurePlayer(s,'one','PLAYER ONE');return s};
test('Medium successful equipment rolls: 5% Legendary, 8% Rare; Easy retains its original ceilings',()=>{
 for(const q of [5,6,7]){
  assert.equal(QUEST_MAX_RARITY[q],'Legendary');
  const counts={};for(let i=0;i<10000;i++){
   const rarity=equipmentRarity(q,()=>(i+.5)/10000);counts[rarity]=(counts[rarity]||0)+1;
  }
  assert.deepEqual(counts,{Common:5700,Uncommon:3000,Rare:800,Legendary:500});
 }
 for(let q=1;q<=4;q++)assert.notEqual(equipmentRarity(q,()=>.999),'Legendary');
});
test('the 50% empty search roll remains unchanged; a Medium sword can genuinely be Legendary',()=>{
 const miss=fresh();miss.players.one.room='q5r1';miss.rooms.q5r1.battle.status='cleared';
 assert.equal(claimLoot(miss,'one','equipment',T,()=>.49).item,null);
 const s=fresh();s.players.one.room='q5r1';s.rooms.q5r1.battle.status='cleared';
 let i=0;const random=()=>[.99,.00,.99][i++];
 const item=claimLoot(s,'one','equipment',T,random).item;
 assert.equal(item.rarity,'Legendary');assert.equal(item.category,'Sword');
 assert.equal(item.bonusDie,RARITY_DICE.Legendary);
 assert(s.players.one.inventory.equipment.some(x=>x.id===item.id));
 assert.throws(()=>claimLoot(s,'one','equipment',T,()=>.99),/already searched/);
 const n=fresh();n.players.one.room='q4r1';n.rooms.q4r1.battle.status='cleared';
 i=0;const easy=claimLoot(n,'one','equipment',T,random).item;
 assert.notEqual(easy.rarity,'Legendary');
});
test('a completed-boss Medium merchant refresh has ONE at-most-5% Legendary offer',()=>{
 assert.equal(MEDIUM_LEGENDARY_CHANCE,.05);
 const cases=[['sword-legendary',400,'Sword'],['bow-legendary',400,'Bow'],['mace-legendary',500,'Mace']];
 const s=fresh(),p=s.players.one;p.room='camp';p.gold=2500;
 assert.throws(()=>buyFromShop(s,'one','sword-legendary',T),/not unlocked/i);
 s.unlockedQuest=5;
 assert.equal(merchantStock(s).some(x=>x.rarity==='Legendary'),false);
 assert.throws(()=>buyFromShop(s,'one','sword-legendary',T),/not stocked/i);
 for(let i=0;i<1000;i++){
   refreshMerchant(s,()=> (i+.5)/1000);
   assert.equal(merchantStock(s).filter(x=>x.rarity==='Legendary').length,i<50?1:0);
 }
 for(const [sku,cost,category] of cases){
   const listing=SHOP_STOCK.find(x=>x.sku===sku);
   assert.equal(listing.cost,cost);assert.equal(listing.unlock,5);
   const draws=[0,(cases.findIndex(a=>a[0]===sku)+.1)/cases.length];let k=0;
   refreshMerchant(s,()=>draws[k++]);
   assert.deepEqual(merchantStock(s).filter(x=>x.rarity==='Legendary').map(x=>x.sku),[sku]);
   assert.equal(buyFromShop(s,'one',sku,T).saved,'merchant');
   const item=p.inventory.equipment.at(-1);
   assert.equal(item.category,category);assert.equal(item.rarity,'Legendary');
   assert.equal(resaleValue(item),Math.floor(cost/2));
   assert.throws(()=>buyFromShop(s,'one',sku,T),/not stocked/i);
 }
 assert(!merchantStock(s).some(x=>['Mythic','Exotic'].includes(x.rarity))); // Hard-only stock exists in catalogue, not Medium merchant
});
