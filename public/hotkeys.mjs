// Keyboard contract shared by local and online multiplayer (R2).
// Input/dialog/modal guards prevent typing from triggering an action.
export const R2_HOTKEYS=Object.freeze({
 r:'roll',e:'end',a:'attack',i:'inventory',f:'fortify',c:'camp',
 p:'items',s:'special',l:'log',q:'quests',n:'nest'
});
export const R2_DIRECTIONS=Object.freeze({ArrowUp:'N',ArrowDown:'S',ArrowLeft:'W',ArrowRight:'E'});
export function resolveHotkey(event,{typing=false,modalOpen=false}={}){
 if(typing||modalOpen||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return null;
 if(event.key in R2_DIRECTIONS)return 'move:'+R2_DIRECTIONS[event.key];
 if(event.key===' ')return 'attack'; // backwards-compatible Space attack
 return R2_HOTKEYS[event.key?.toLowerCase()]||null;
}
