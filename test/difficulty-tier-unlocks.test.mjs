import test from 'node:test';
import assert from 'node:assert/strict';
import {freshState,ensurePlayer,ensureWorld,enterQuest,publicState,resolveRound,voteFinishQuest,merchantStock,buyFromShop,replayQuest} from '../src/engine.mjs';
import {createMaze} from '../src/maze-play.mjs';
import {QUEST_TIERS,unlockedQuestCeiling,normalizedCompletions,questIsUnlocked,migrateLegacyCompletions} from '../src/quest-progression.mjs';
const T=2_100_000_000_000;
const seq=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
const session=(ids=['one'])=>{const s=freshState(T);for(const id of ids)ensurePlayer(s,id,id);return s;};
const grant=(p,nums)=>{p.completedQuests=normalizedCompletions(nums);p.unlockedQuest=unlockedQuestCeiling(p.completedQuests);};

test('all 15 quests remain in five locked difficulty tiers with correct membership',()=>{
 assert.deepEqual(QUEST_TIERS.map(t=>[t.name,t.min,t.max]),[['Beginner',1,1],['Easy',2,4],['Medium',5,9],['Hard',10,12],['Extreme',13,15]]);
 assert.deepEqual(QUEST_TIERS.flatMap(t=>t.quests),seq(1,15));
});
test('tier completion opens the WHOLE next difficulty, not one quest at a time',()=>{
 for(const [completed,max] of [[[],1],[[1],4],[[1,4],4],[[1,4,2],4],[seq(1,4),9],[seq(1,9),12],[seq(1,12),15]]){
   assert.equal(unlockedQuestCeiling(completed),max);
   for(let q=1;q<=15;q++)assert.equal(questIsUnlocked(completed,q),q<=max,`completion ${completed}: quest ${q}`);
 }
 assert.equal(unlockedQuestCeiling([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),15);
});
test('quests inside a tier may be entered in any order once the preceding tier is complete',()=>{
 const s=session(),p=s.players.one;grant(p,[1]);
 for(const quest of [4,2,3]){
  p.room='camp';assert.equal(enterQuest(s,'one',quest,T).saved,'room-entry');
  assert.equal(p.room,`q${quest}r1`);
 }
 assert.throws(()=>enterQuest(s,'one',5,T),/tier is not unlocked/i);
});
test('individual character access is enforced by server even when a teammate has cleared later tiers',()=>{
 const s=session(['one','two','three','four']);grant(s.players.one,seq(1,9));grant(s.players.two,[1]);
 s.completedQuests=seq(1,12);ensureWorld(s);
 assert.equal(s.unlockedQuest,15,'world can have advanced progress');
 assert.equal(publicState(s,'one').unlockedQuest,12);
 assert.equal(publicState(s,'two').unlockedQuest,4);
 assert.equal(publicState(s,'three').unlockedQuest,1);
 assert.equal(publicState(s,'four').unlockedQuest,1);
 assert.throws(()=>enterQuest(s,'two',10,T),/tier is not unlocked/i);
 assert.equal(enterQuest(s,'one',10,T).saved,'room-entry');
 assert.equal(publicState(s,'two').players.one.completedQuests,undefined,'teammate progress is private');
});
test('migrating existing V1 worlds protects old quest access, gear, gold and personal saves',()=>{
 const s=session(['one','two']),veteran=s.players.one;veteran.gold=900;veteran.level=17;
 veteran.questBookmarks={4:{room:'q4r3',x:1,y:3}};veteran.inventory.equipment.push({id:'sword',name:'Old sword'});
 s.completedQuests=seq(1,6);s.unlockedQuest=7;delete s.progressionVersion;
 for(const p of Object.values(s.players))delete p.completedQuests;
 ensureWorld(s);
 assert.equal(s.progressionVersion,2);assert.equal(s.unlockedQuest,9);
 assert.equal(veteran.unlockedQuest,9);assert.deepEqual(veteran.completedQuests,seq(1,6));
 assert.equal(veteran.gold,900);assert.equal(veteran.level,17);
 assert.equal(veteran.inventory.equipment[0].id,'sword');assert.equal(veteran.questBookmarks[4].room,'q4r3');
 ensurePlayer(s,'three','Newcomer');assert.deepEqual(s.players.three.completedQuests,[]);
 assert.equal(s.players.three.unlockedQuest,1);
});
test('boss completion credits only fight participants, not players elsewhere in shared world',()=>{
 const s=session(['one','two']),b=s.rooms.watchpost.battle;
 s.players.one.room='watchpost';s.players.two.room='woodland';
 b.status='active';b.round=1;b.enemies=[{id:'dead',hp:0,maxHp:8}];b.participated={one:true};b.damageBy={one:8};
 resolveRound(s,'watchpost',T,()=>.5);
 assert.deepEqual(s.players.one.completedQuests,[1]);assert.deepEqual(s.players.two.completedQuests,[]);
 assert.equal(publicState(s,'one').unlockedQuest,4);assert.equal(publicState(s,'two').unlockedQuest,1);
 const event=s.events.find(e=>e.type==='quest-complete');assert.equal(event.unlockedFor.one,'Easy');assert.equal(event.unlockedFor.two,undefined);
});
test('late joining players can earn credit at an already-cleared final exit',()=>{
 const s=session(['one','two']),b=s.rooms.watchpost.battle;
 b.status='cleared';s.players.two.room='watchpost';s.players.two.x=8;s.players.two.y=3;
 assert.equal(voteFinishQuest(s,'two',T).saved,'quest-exit');
 assert.deepEqual(s.players.two.completedQuests,[1]);assert.equal(s.players.two.unlockedQuest,4);
 assert.equal(s.players.one.unlockedQuest,1);
});
test('shop unlocks also respect the individual character, not only the advanced world',()=>{
 const s=session(['one','two']);s.completedQuests=seq(1,12);grant(s.players.one,seq(1,12));grant(s.players.two,[]);ensureWorld(s);
 s.players.one.room='camp';s.players.two.room='camp';s.players.two.gold=50000;
 assert(merchantStock(s,'one').some(x=>x.sku==='sword-legendary'));
 assert(!merchantStock(s,'one').some(x=>x.sku==='sword-uncommon'));
 assert(!merchantStock(s,'two').some(x=>x.sku==='sword-legendary'));
 assert.throws(()=>buyFromShop(s,'two','sword-legendary',T),/not unlocked/);
});
test('the Endgame Maze still requires personal Quest 15 completion',()=>{
 const s=session(['one','two']);s.completedQuests=seq(1,15);ensureWorld(s);s.players.one.room='camp';
 assert.throws(()=>createMaze(s,'one',1,'tier-validation-seed',T),/Quest 15/);
 grant(s.players.one,seq(1,15));assert.equal(createMaze(s,'one',1,'tier-validation-seed',T).saved,'room-entry');
});
test('legacy sequential state is upgraded once; new players cannot inherit another player’s history',()=>{
 assert.deepEqual(migrateLegacyCompletions([1,2,5],7),[1,2,3,4,5,6]);
 assert.deepEqual(normalizedCompletions([15,1,1,2,0,17,'3',4]),[1,2,4,15]);
});

test('an out-of-order tier-winning boss still triggers the rare merchant opportunity',()=>{
 const s=session(),p=s.players.one;
 // Easy can be finished in order 4, 3, 2. Defeating Q2 is the milestone.
 const completed=[1,3,4];s.completedQuests=completed;grant(p,completed);
 s.unlockedQuest=4;p.room='q2r5';
 const b=s.rooms.q2r5.battle;b.status='active';b.round=1;
 b.enemies=[{id:'boss',hp:0,maxHp:12}];b.participated={one:true};b.damageBy={one:12};
 const result=resolveRound(s,'q2r5',T,()=>0);
 assert.equal(result.saved,'boss-completed');
 assert.equal(s.unlockedQuest,9);assert.equal(p.unlockedQuest,9);
 assert(s.legendaryMerchantOffer,'first Medium merchant rare chance must be evaluated even if Q2 finishes Easy last');
});
