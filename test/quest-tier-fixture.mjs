/** TEST ONLY: seed historical progression in old scenario fixtures. Production
 * always checks a character's actual earned completedQuest list. */
import {normalizedCompletions,unlockedQuestCeiling} from '../src/quest-progression.mjs';
export function mirrorWorldProgress(s){
 s.completedQuests=normalizedCompletions(s.completedQuests);
 for(const p of Object.values(s.players)){
   p.completedQuests=normalizedCompletions([...p.completedQuests,...s.completedQuests]);
   p.unlockedQuest=unlockedQuestCeiling(p.completedQuests);
 }
 s.unlockedQuest=unlockedQuestCeiling(s.completedQuests);
 return s;
}
export function grantTestTier(s,quest){
 const previous=quest>=13?12:quest>=10?9:quest>=5?4:quest>=2?1:0;
 s.completedQuests=normalizedCompletions([...s.completedQuests,...Array.from({length:previous},(_,i)=>i+1)]);
 return mirrorWorldProgress(s);
}
