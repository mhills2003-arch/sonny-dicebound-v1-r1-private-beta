import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,returnToCamp,enterQuest,resumeQuest,replayQuest,
 buyFromShop,sellToShop,resaleValue,publicState,ROOM_DATA,ROOM_WALLS,
 rollMovement,endTurn,claimLoot,SHOP_STOCK} from '../src/engine.mjs';
const T=1900000500000;
function game(ids=['one','two']){const s=freshState(T);for(const id of ids)ensurePlayer(s,id,id);s.unlockedQuest=4;return s}
function place(s,id,room,x=1,y=3){Object.assign(s.players[id],{room,x,y});s.rooms[room].battle.status='cleared';}
function freeSquare(room,x,y){return !(ROOM_WALLS[room]||[]).some(([a,b])=>a===x&&b===y)}
test('camp returns to original room and square without resetting battles or searched loot',()=>{
 const s=game();place(s,'one','q2r4',3,3);
 s.players.one.lootClaimed.q2r4={equipment:true};
 s.rooms.q2r4.battle.enemies=[{id:'defeated',hp:0}];
 const turn=s.turn.round;
 returnToCamp(s,'one',T);
 assert.equal(s.players.one.room,'camp');assert.equal(s.players.one.lastCampQuest,2);
 assert.deepEqual(s.players.one.questBookmarks[2],{room:'q2r4',x:3,y:3});
 resumeQuest(s,'one',T+1);
 assert.deepEqual([s.players.one.room,s.players.one.x,s.players.one.y],['q2r4',3,3]);
 assert.equal(s.players.one.lootClaimed.q2r4.equipment,true);
 assert.equal(s.rooms.q2r4.battle.status,'cleared');
 assert.equal(s.rooms.q2r4.battle.enemies.length,1);
 assert.equal(s.turn.round,turn);
});
test('camp re-entry via existing Quest Chronicle resumes saved room, not entrance',()=>{
 const s=game(['one']);place(s,'one','q3r4',3,3);returnToCamp(s,'one',T);
 enterQuest(s,'one',3,T+1);
 assert.equal(s.players.one.room,'q3r4');
});
test('if saved tile is occupied, player returns near it rather than overlapping',()=>{
 const s=game();place(s,'one','q2r4',3,3);returnToCamp(s,'one',T);
 place(s,'two','q2r4',3,3);
 resumeQuest(s,'one',T+1);
 assert.equal(s.players.one.room,'q2r4');
 assert.notDeepEqual([s.players.one.x,s.players.one.y],[3,3]);
 assert.equal(freeSquare('q2r4',s.players.one.x,s.players.one.y),true);
 assert(Math.abs(s.players.one.x-3)+Math.abs(s.players.one.y-3)<=2);
});
test('different players retain separate bookmarks in independent quests',()=>{
 const s=game();place(s,'one','q2r4',3,3);place(s,'two','q3r3',3,3);
 returnToCamp(s,'one',T);returnToCamp(s,'two',T);
 resumeQuest(s,'one',T+1);resumeQuest(s,'two',T+2);
 assert.equal(s.players.one.room,'q2r4');assert.equal(s.players.two.room,'q3r3');
});
test('switching quests stores and restores separate per-quest bookmarks',()=>{
 const s=game(['one']);place(s,'one','q2r3',4,3);
 enterQuest(s,'one',3,T);
 assert.equal(s.players.one.room,'q3r1');
 place(s,'one','q3r4',3,3);
 enterQuest(s,'one',2,T+1);
 assert.equal(s.players.one.room,'q2r3');
 enterQuest(s,'one',3,T+2);
 assert.equal(s.players.one.room,'q3r4');
});
test('replaying completed quest resets its bookmarks and starts at beginning',()=>{
 const s=game(['one']);place(s,'one','q2r4',3,3);returnToCamp(s,'one',T);
 s.completedQuests.push(2);
 replayQuest(s,'one',2,T+1);
 assert.equal(s.players.one.room,'q2r1');
 assert.equal(s.players.one.questBookmarks[2].room,'q2r1');
});
test('personal bookmark does not leak to other player on broadcast',()=>{
 const s=game();place(s,'one','q2r3',3,3);returnToCamp(s,'one',T);
 const viewed=publicState(s,'two');
 assert.equal(viewed.players.one.questBookmarks,undefined);
 assert.equal(viewed.players.one.lastCampQuest,undefined);
 assert.equal(viewed.players.two.questBookmarks!==undefined,true);
});
test('sell ordinary equipment, automatically unequip, give exact quote, block second sale',()=>{
 const s=game(['one']);place(s,'one','camp');s.players.one.gold=100;
 buyFromShop(s,'one','sword-common',T);
 const item=s.players.one.inventory.equipment[0];
 s.players.one.equipped.weapon=item.id;
 assert.equal(resaleValue(item),22);
 assert.equal(sellToShop(s,'one','equipment',item.id,T+1).price,22);
 assert.equal(s.players.one.gold,77);
 assert.equal(s.players.one.equipped.weapon,null);
 assert.equal(s.players.one.inventory.equipment.length,0);
 assert.throws(()=>sellToShop(s,'one','equipment',item.id),/do not own/);
});
test('buy then sell cannot create gold; no sale permitted outside merchant',()=>{
 const s=game(['one']);place(s,'one','camp');s.players.one.gold=100;
 buyFromShop(s,'one','potion',T);
 const pot=s.players.one.inventory.potions[0];
 assert.equal(sellToShop(s,'one','potions',pot.id,T+1).price,5);
 assert.equal(s.players.one.gold,95);
 buyFromShop(s,'one','armour-common',T+2);
 const gear=s.players.one.inventory.equipment[0];
 place(s,'one','woodland');
 assert.throws(()=>sellToShop(s,'one','equipment',gear.id),/merchant/);
});
test('selling partial potion charges and unused enchantments, and training gear protection',()=>{
 const s=game(['one']);place(s,'one','camp');
 s.players.one.inventory.potions.push({id:'pot-one',kind:'potion',name:'Healing Potion',charges:1});
 s.players.one.inventory.enchantments.push({id:'ench-one',kind:'enchantment',name:'Sharpness II',school:'Sharpness',level:2});
 s.players.one.inventory.equipment.push({id:'train',kind:'equipment',name:'Testing Sword',category:'Sword',rarity:'Exotic',training:true});
 assert.equal(sellToShop(s,'one','potions','pot-one',T).price,5);
 assert.equal(sellToShop(s,'one','enchantments','ench-one',T+1).price,20);
 assert.throws(()=>sellToShop(s,'one','equipment','train'),/Training equipment/);
 assert.equal(s.players.one.gold,25);
});
test('unrelated player cannot sell another player inventory item',()=>{
 const s=game();place(s,'one','camp');place(s,'two','camp');
 s.players.one.inventory.equipment.push({id:'only-one',kind:'equipment',rarity:'Common',category:'Sword',name:'Common Sword'});
 assert.throws(()=>sellToShop(s,'two','equipment','only-one'),/do not own/);
 assert.equal(s.players.one.inventory.equipment.length,1);
});
test('camp return and merchant transactions do not create bonus movement rolls',()=>{
 const s=game(['one']);place(s,'one','q2r4',3,3);
 rollMovement(s,'one',T,()=>.9);
 returnToCamp(s,'one',T+1);s.players.one.gold=100;
 buyFromShop(s,'one','sword-common',T+2);
 resumeQuest(s,'one',T+3);
 assert.throws(()=>rollMovement(s,'one',T+4),/Already rolled/);
 endTurn(s,'one',T+5,()=>.99);
 assert.equal(s.turn.round,2);
});
