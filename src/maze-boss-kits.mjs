/** Deterministic, server-only combat kits for the six Endgame Maze bosses.
 * Arena actions are validated in maze-play.mjs; nothing here trusts browser-supplied mechanics.
 */
export const BOSS_KITS=Object.freeze({
 'iron-regent':{title:'The Iron Regent',mechanic:'Magnetic pulls and marching sentries',weakness:'Take cover behind an anchor before a pull to expose the Regent.',points:[{id:'a',x:1,y:1,name:'Northwest iron anchor'},{id:'b',x:5,y:1,name:'Northeast iron anchor'},{id:'c',x:1,y:5,name:'Southwest iron anchor'},{id:'d',x:5,y:5,name:'Southeast iron anchor'}],minion:'Iron Sentry'},
 'cinder-wyrm':{title:'The Cinder Wyrm',mechanic:'Fire breath, hot ground, emberlings',weakness:'Open a cooling valve to quench its furnace and expose its scales.',points:[{id:'a',x:1,y:2,name:'West cooling valve'},{id:'b',x:5,y:4,name:'East cooling valve'}],minion:'Emberling'},
 'mirror-queen':{title:'The Mirror Queen',mechanic:'Decoys and crossing reflected beams',weakness:'Inspect the glass that casts a shadow to reveal the true Queen.',points:[{id:'a',x:1,y:1,name:'Western mirror'},{id:'b',x:3,y:5,name:'Southern mirror'},{id:'c',x:5,y:1,name:'Eastern mirror'}],minion:'Glass Reflection'},
 'root-colossus':{title:'The Root Colossus',mechanic:'Root snares and thorn guardians',weakness:'Sever two anchoring roots to expose the heartwood.',points:[{id:'a',x:1,y:2,name:'Western root'},{id:'b',x:5,y:4,name:'Eastern root'},{id:'c',x:3,y:5,name:'Southern root'}],minion:'Thorn Guardian'},
 'hourglass-warden':{title:'The Hourglass Warden',mechanic:'Alternating clock hands and sand echoes',weakness:'Reverse the central hourglass to cancel the next sweep and expose the Warden.',points:[{id:'a',x:3,y:3,name:'Hourglass dial'}],minion:'Sand Echo'},
 'hollow-titan':{title:'The Hollow Titan',mechanic:'Void pulses and gravitational pulls',weakness:'Stabilise both void regulators to expose its hollow heart.',points:[{id:'a',x:2,y:2,name:'West void regulator'},{id:'b',x:4,y:4,name:'East void regulator'}],minion:'Void Fragment'}
});
export const inArena=(p)=>p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<=6&&p.y>=0&&p.y<=6;
export const distance=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
export const clampArena=(v)=>Math.max(0,Math.min(6,v));
export function bossSetup(id,seed=''){
 const kit=BOSS_KITS[id];if(!kit)throw new Error('Unknown Maze boss');
 // A fixed true mirror for this saved expedition, not rolled on every reconnect.
 let h=0;for(const c of String(seed))h=(Math.imul(h,31)+c.charCodeAt(0))>>>0;
 return {id,points:kit.points.map(x=>({...x,used:false})),trueMirror:['a','b','c'][h%3],weakUntil:0,anchors:{},snared:{},lastInteract:-10,phaseSeen:[0],summons:0,pendingEvent:null,exposureNote:'',partyPeak:1,hotTiles:[],firstWarning:false};
}
export function inspectBossPoint(b,p,id){
 const point=b.bossState?.points.find(x=>x.id===id);if(!point)throw new Error('Unknown boss arena object');
 if(distance(p.mazeTile||{x:1,y:3},point)>1)throw new Error('Move adjacent to the arena object to interact');
 return point;
}
/** Returns a semantic result used to update the boss's server state and log. */
export function useBossPoint(b,p,point){
 const bs=b.bossState,phase=b.phase,r=b.round,id=bs.id;
 if(id==='iron-regent'){
  bs.anchors[p.id]=r+3;bs.weakUntil=Math.max(bs.weakUntil,r+2);
  return {text:`${p.name} braces behind ${point.name}: protected from the next pull; a joint in the armour opens!`,expose:true};
 }
 if(id==='cinder-wyrm'){
  if(point.used)throw new Error('This valve has already been opened');point.used=true;
  bs.weakUntil=r+2;bs.hotTiles=[];return {text:`${p.name} opens ${point.name}. The Wyrm's scales cool and crack!`,cancelHazard:true,expose:true};
 }
 if(id==='mirror-queen'){
  if(point.used)throw new Error('This mirror has already been examined');point.used=true;
  if(point.id===bs.trueMirror){bs.weakUntil=r+3;return {text:`${p.name} spots the TRUE shadow in ${point.name}. The Queen is revealed!`,expose:true,clearDecoys:true};}
  return {text:`${p.name} breaks a false reflection; a glass decoy emerges!`,summon:1};
 }
 if(id==='root-colossus'){
  if(point.used)throw new Error('This root has already been severed');point.used=true;
  const cut=bs.points.filter(x=>x.used).length;
  if(cut>=2){bs.weakUntil=r+3;return {text:`${p.name} severs ${point.name}. With two roots cut, the Colossus exposes its heartwood!`,expose:true};}
  return {text:`${p.name} severs ${point.name}. One more root will expose the heartwood.`};
 }
 if(id==='hourglass-warden'){
  if(r<bs.lastInteract+3)throw new Error('The hourglass is still resetting');
  bs.lastInteract=r;bs.weakUntil=r+2;
  return {text:`${p.name} reverses the hourglass. The next sweep is cancelled and the Warden stumbles!`,cancelHazard:true,expose:true};
 }
 if(id==='hollow-titan'){
  if(point.used)throw new Error('This regulator is already stabilised');point.used=true;
  if(bs.points.every(x=>x.used)){bs.weakUntil=r+3;return {text:`${p.name} stabilises the final regulator. The Titan's hollow heart is exposed!`,expose:true};}
  return {text:`${p.name} stabilises ${point.name}. Activate the other regulator to expose the heart.`};
 }
 throw new Error('Unknown boss interaction');
}
export function bossWeaknessMultiplier(b,p){
 if(!b?.bossState)return 1;const bs=b.bossState;
 if(bs.id==='iron-regent')return bs.anchors[p.id]>=b.round?1.7:1;
 if(bs.weakUntil>=b.round){
  if(bs.id==='mirror-queen'&&b.enemies.some(e=>e.role==='decoy'&&e.hp>0))return 1.15;
  return 1.75;
 }
 return 1;
}
/** Per-phase unique minion type; a bound prevents infinite additive waves. */
export function bossMinion(id,serial,depth=18,phase=0,scale=null){
 const kit=BOSS_KITS[id];if(!kit)throw new Error('Unknown Maze boss');
 const hp=Math.round(scale?Math.max(16,scale.attack*(.45+.1*phase)):24+depth*3+phase*16);
 const atk=scale?Math.round(Math.max(8,scale.armour*.7+scale.maxHp*.04+phase*scale.attack*.08)):Math.round(9+depth*.9+phase*4);
 const armour=scale?Math.round(Math.max(4,scale.attack*.13)):Math.round(6+depth*.55);
 return {id:`boss-add-${serial}`,name:kit.minion,role:id==='mirror-queen'?'decoy':'minion',hp,maxHp:hp,atk,armour,die:12+phase*4,x:1+serial%5,y:1+Math.floor(serial/5)%5};
}
/** Telegraph *before* an unusual secondary mechanic. Called after its previous event resolves. */
export function nextBossEvent(bs,round,phase){
 const period=bs.id==='hourglass-warden'?2:3;
 if((round+phase)%period!==0)return null;
 return {kind:bs.id==='iron-regent'?'magnet':bs.id==='cinder-wyrm'?'embers':bs.id==='mirror-queen'?'reflection':bs.id==='root-colossus'?'roots':bs.id==='hourglass-warden'?'echo':'gravity',due:round+1,
  label:bs.id==='iron-regent'?'Magnetic pull':bs.id==='cinder-wyrm'?'Emberlings':bs.id==='mirror-queen'?'Shattered reflections':bs.id==='root-colossus'?'Binding roots':bs.id==='hourglass-warden'?'Sand echo':'Void gravity'};
}
