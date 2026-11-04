import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,selectClass,CLASS_DATA,effectiveStats,equipItem,buyFromShop,merchantStock,claimQuestReward,rollDie,publicState} from '../src/engine.mjs';
import {mazeReward} from '../src/maze-play.mjs';
const NOW=1800000000000;
const session=()=>{const s=freshState(NOW);ensurePlayer(s,'one','Joe');ensurePlayer(s,'two','Friend');return s};
test('Knight, Outlaw, Warlock and Tinker are four distinct valid classes',()=>{
 assert.deepEqual(Object.keys(CLASS_DATA),['knight','outlaw','warlock','tinker']);
 const hp=new Set(Object.values(CLASS_DATA).map(x=>x.hp));assert.equal(hp.size,4);
 for(const cls of Object.values(CLASS_DATA))assert(cls.atk>0&&cls.arm>0&&cls.starter);
});
test('a legacy Level 20 player can select Tinker without resetting XP, gear, quests, coins or teammates',()=>{
 const s=session(),p=s.players.one,friend=s.players.two;
 p.level=20;p.xp=155;p.gold=999;p.room='camp';friend.level=12;
 p.maxHp=effectiveStats(p).maxHp;p.hp=p.maxHp;
 const initialCount=p.inventory.equipment.length;const prevState=s.completedQuests?.slice();
 selectClass(s,'one','tinker',NOW);
 assert.equal(p.klass,'tinker');assert.equal(p.classChosen,true);
 assert.equal(p.level,20);assert.equal(p.xp,155);assert.equal(p.gold,999);
 assert.deepEqual(s.completedQuests,prevState);assert.equal(friend.klass,'outlaw');assert.equal(friend.level,12);
 assert.equal(p.maxHp,effectiveStats(p).maxHp);assert.equal(p.hp,p.maxHp);
 assert.equal(p.inventory.equipment.length,initialCount+1);
 assert.equal(p.inventory.equipment.at(-1).category,'Mace');
 assert.throws(()=>selectClass(s,'one','warlock',NOW),/already/);
});
test('a new Warlock can choose their class at Woodland, receives a Staff and it has three-square range',()=>{
 const s=session(),p=s.players.one;
 selectClass(s,'one','warlock',NOW);
 assert.equal(p.klass,'warlock');assert.equal(p.classChosen,true);
 const starter=p.inventory.equipment.find(x=>x.category==='Staff');assert(starter);
 assert.equal(p.equipped.weapon,starter.id);assert.equal(effectiveStats(p).mainRange,3);
 assert.equal(effectiveStats(p).maxHp,40);
 assert.throws(()=>selectClass(s,'two','not-a-class',NOW),/Choose/);
});
test('class cannot be changed inside battle or Maze even if original choice was unconfirmed',()=>{
 const s=session(),p=s.players.one;
 p.room='clearing';s.rooms.clearing.battle.status='active';
 assert.throws(()=>selectClass(s,'one','tinker',NOW),/camp|Woodland/);
 p.room='camp';p.mazeSlot=1;
 assert.throws(()=>selectClass(s,'one','tinker',NOW),/camp|Woodland/);
});
test('Staff rarities appear in merchant from Common through Exotic without changing previous prices',()=>{
 const s=session(),p=s.players.one;p.room='camp';p.gold=10000;
 assert(merchantStock(s).some(x=>x.sku==='staff-common'));
 buyFromShop(s,'one','staff-common',NOW);
 const staff=p.inventory.equipment.find(x=>x.category==='Staff');assert(staff);
 equipItem(s,'one',staff.id,'weapon',NOW);
 assert.equal(effectiveStats(p).mainRange,3);
 s.unlockedQuest=13;s.exoticMerchantOffer={sku:'staff-exotic',remaining:1};
 assert(merchantStock(s).some(x=>x.sku==='staff-exotic'));
 buyFromShop(s,'one','staff-exotic',NOW);
 assert.equal(p.inventory.equipment.at(-1).rarity,'Exotic');
 assert.equal(s.exoticMerchantOffer.remaining,0);
 assert.equal(merchantStock(s).some(x=>x.sku==='staff-exotic'),false);
});
test('Legendary and Mythic staffs have their own cooldown spells',()=>{
 const s=session(),p=s.players.one;
 for(const rarity of ['Legendary','Mythic','Exotic']){
   const item={id:`test-${rarity}`,category:'Staff',rarity,level:1,bonusDie:{Legendary:12,Mythic:20,Exotic:30}[rarity],enchantments:[],name:rarity+' Staff'};
   p.inventory.equipment.push(item);p.equipped.weapon=item.id;
   const stats=effectiveStats(p);
   assert(stats.special);assert(stats.special.targets>=2);
   assert(stats.special.cooldown>=2);assert.equal(stats.mainRange,3);
 }
});
test('Staff is eligible for a quest reward chest and the claim remains one-use',()=>{
 const s=session();s.players.one.room='camp';s.questRewardOffers={'one:15':{quest:15,rarity:'Exotic',level:1}};s.questRewardClaimed={};
 claimQuestReward(s,'one',15,'Staff',NOW);
 assert.equal(s.players.one.inventory.equipment.at(-1).category,'Staff');
 assert.throws(()=>claimQuestReward(s,'one',15,'Staff',NOW),/unclaimed/);
});
test('Maze endgame victory reward can be a Staff and cannot be claimed twice',()=>{
 const s=session(),p=s.players.one;p.room='camp';
 s.mazeRuns={1:{slot:1,status:'completed',map:{seed:'once-only-seed',boss:{name:'Abyss Guardian'}},rewardOffers:{one:{rarity:'Legendary',gold:350,level:1}},rewardClaimed:{}}};
 mazeReward(s,'one','Staff',NOW);
 assert.equal(p.inventory.equipment.at(-1).category,'Staff');
 assert.throws(()=>mazeReward(s,'one','Staff',NOW),/unclaimed/);
});
test('private character class choice is reported to its owner without exposing inventory to others',()=>{
 const s=session();selectClass(s,'one','tinker',NOW);
 const a=publicState(s,'one'),b=publicState(s,'two');
 assert.equal(a.players.one.klass,'tinker');assert.equal(a.players.one.classChosen,true);
 assert.equal(b.players.one.inventory,undefined);
});
