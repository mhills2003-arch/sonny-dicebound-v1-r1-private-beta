/** Quest accessibility is based on COMPLETING the entire preceding difficulty.
 * This module is deliberately independent of the world/map state: multiplayer
 * characters have separate progress even while sharing enemies and rooms. */
export const QUEST_TIERS = Object.freeze([
  Object.freeze({name:'Beginner',min:1,max:1,quests:Object.freeze([1])}),
  Object.freeze({name:'Easy',min:2,max:4,quests:Object.freeze([2,3,4])}),
  Object.freeze({name:'Medium',min:5,max:9,quests:Object.freeze([5,6,7,8,9])}),
  Object.freeze({name:'Hard',min:10,max:12,quests:Object.freeze([10,11,12])}),
  Object.freeze({name:'Extreme',min:13,max:15,quests:Object.freeze([13,14,15])})
]);
export function normalizedCompletions(input){
  return [...new Set((Array.isArray(input)?input:[]).filter(q=>Number.isInteger(q)&&q>=1&&q<=15))].sort((a,b)=>a-b);
}
export function unlockedQuestCeiling(completed){
  const finished=new Set(normalizedCompletions(completed));
  let ceiling=1;
  for(let i=0;i<QUEST_TIERS.length-1;i++){
    if(!QUEST_TIERS[i].quests.every(q=>finished.has(q)))break;
    ceiling=QUEST_TIERS[i+1].max;
  }
  return ceiling;
}
export function questIsUnlocked(completed,quest){
  return Number.isInteger(quest)&&quest>=1&&quest<=unlockedQuestCeiling(completed);
}
/** Old V1's highest quest number meant every earlier quest was accessible.
 * During the one-time migration only, keep earned access by granting the old
 * implied completed quests. Never use this for newly joining characters. */
export function migrateLegacyCompletions(completed,legacyUnlockedQuest){
  const highest=Math.max(1,Math.min(15,Math.floor(Number(legacyUnlockedQuest)||1)));
  const implied=Array.from({length:highest-1},(_,i)=>i+1);
  return normalizedCompletions([...normalizedCompletions(completed),...implied]);
}
