/** Private beta QA-only test world. Never grants quest access in normal adventures.
 * The test world uses a separate Durable Object namespace and does not share
 * character, inventory, completion or loot state with local/online campaign. */
import {effectiveStats,RARITY_DICE} from './engine.mjs';

export function mazeLabRoomKey(mode,localKey=''){
  if(mode==='online')return 'beta-r24-isolated-maze-lab-online';
  if(mode==='local' && typeof localKey==='string' && localKey.startsWith('v1-local-'))return `beta-r24-isolated-maze-lab:${localKey}`;
  throw new Error('Invalid Maze Lab world');
}
export function provisionMazeLabPlayer(state,id){
  if(!state.mazeLab)throw new Error('This is not a Maze Lab world');
  const p=state.players?.[id];
  if(!p||!p.connected)throw new Error('Maze Lab requires a connected player');
  if(p.mazeLabReady)return p;
  // Access and supplies are artificial and live in this isolated test world only.
  p.room='camp';p.level=25;p.xp=0;p.gold=8000;
  p.completedQuests=Array.from({length:15},(_,i)=>i+1);p.unlockedQuest=15;
  p.maxHp=effectiveStats(p).maxHp;p.hp=p.maxHp;
  p.mazeLabReady=true;state.revision++;
  return p;
}
export function grantMazeLabEquipment(state,id){
  if(!state.mazeLab)throw new Error('Not a Maze Lab world');
  const p=state.players?.[id];
  if(!p?.mazeLabReady||!p.classChosen)throw new Error('Choose a class first');
  if(p.mazeLabEquipped)return p;
  const category={knight:'Sword',outlaw:'Bow',warlock:'Staff',tinker:'Mace'}[p.klass]||'Sword';
  for(const itemCategory of [category,'Armour']){
    const item={id:`${id}-maze-lab-${itemCategory.toLowerCase()}`,kind:'equipment',category:itemCategory,rarity:'Mythic',level:25,bonusDie:RARITY_DICE.Mythic,name:`Maze Lab ${itemCategory} · L25`,enchantments:[],training:true};
    p.inventory.equipment.push(item);
    if(itemCategory==='Armour')p.equipped.armour=item.id;else p.equipped.weapon=item.id;
  }
  for(let i=0;i<10;i++)p.inventory.potions.push({id:`${id}-maze-lab-potion-${i}`,kind:'potion',name:'Healing Potion',charges:1});
  for(let i=0;i<3;i++)p.inventory.consumables.push({id:`${id}-maze-lab-bomb-${i}`,kind:'consumable',sku:'blast-bomb',name:'Blast Bomb',charges:1});
  p.mazeLabEquipped=true;state.revision++;return p;
}
