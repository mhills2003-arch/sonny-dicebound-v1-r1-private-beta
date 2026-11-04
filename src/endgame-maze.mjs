/** DICEBOUND 4.0 Endgame Maze: deterministic, independent pure model.
 * This module defines the maze blueprint; multiplayer play is implemented in maze-play.mjs.
 * No browser-provided seed, loot, position or reward may be trusted by the server.
 */
export const MAZE_MIN_ROOMS=30,MAZE_MAX_ROOMS=50;
export const COMPASS=Object.freeze({N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]});
export const OPPOSITE=Object.freeze({N:'S',S:'N',E:'W',W:'E'});
const TYPES=['Forked Hall','Collapsed Gallery','Lantern Court','Moonwell','Old Vault','Rune Passage','Watch Chamber','Broken Stair','Salt Crypt','Hollow Crossing','Echo Chamber','Iron Arch','Forgotten Shrine','Stone Crossing','Ash Gallery'];
const key=(x,y)=>`${x},${y}`;
const between=(a,b)=>Object.keys(COMPASS).find(d=>a.x+COMPASS[d][0]===b.x&&a.y+COMPASS[d][1]===b.y);
const hashSeed=(seed)=>{let h=2166136261;for(const c of String(seed))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0||1};
export function seededRandom(seed){let x=hashSeed(seed);return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296}};
const choice=(a,random)=>a[Math.floor(random()*a.length)];
const shuffle=(a,random)=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const freshRoom=(id,x,y)=>({id,x,y,connections:{},name:null,depth:0,role:'ordinary',hidden:false,challenge:null});
const connect=(a,b)=>{const d=between(a,b);if(!d)throw new Error('Non-cardinal connection');a.connections[d]=b.id;b.connections[OPPOSITE[d]]=a.id};
export function shortestPath(rooms,from,to){
 const known=Array.isArray(rooms)?Object.fromEntries(rooms.map(r=>[r.id,r])):rooms;
 if(!known[from]||!known[to])return null;
 const prev=new Map([[from,null]]),q=[from];for(let i=0;i<q.length;i++){
  const id=q[i];if(id===to)break;
  for(const next of Object.values(known[id].connections)){if(!prev.has(next)){prev.set(next,id);q.push(next)}}
 }
 if(!prev.has(to))return null;const path=[];for(let p=to;p!==null;p=prev.get(p))path.unshift(p);return path;
}
function routeDepths(rooms,entrance){const d={};const q=[entrance];d[entrance]=0;for(let i=0;i<q.length;i++){const r=rooms[q[i]];for(const next of Object.values(r.connections)){if(d[next]===undefined){d[next]=d[r.id]+1;q.push(next)}}}return d;}
export const ENDGAME_BOSSES=Object.freeze([
 {id:'iron-regent',name:'The Iron Regent',visual:'Colossal walking armour with a burning crown',phases:[{at:1,name:'Iron Procession',attack:'shield-sweep'},{at:.65,name:'Magnetic Call',attack:'pull-and-cleave'},{at:.30,name:'Shattered Crown',attack:'falling-armour'}],hazard:'moving steel lanes',warningRounds:1,weakness:'Break line of sight behind fallen armour during the pull'},
 {id:'cinder-wyrm',name:'The Cinder Wyrm',visual:'Serpentine dragon made of burning coal',phases:[{at:1,name:'Embers',attack:'ember-breath'},{at:.6,name:'Molten Coil',attack:'sweeping-flame'},{at:.25,name:'Last Furnace',attack:'ring-of-fire'}],hazard:'marked fire arcs that leave hot tiles',warningRounds:1,weakness:'The furnace is vulnerable after a missed breath attack'},
 {id:'mirror-queen',name:'The Mirror Queen',visual:'Crystal figure surrounded by false reflections',phases:[{at:1,name:'Reflections',attack:'decoy-strikes'},{at:.7,name:'Splintered Light',attack:'reflection-volley'},{at:.35,name:'Shattered Throne',attack:'crossing-beams'}],hazard:'telegraphed reflected beams',warningRounds:1,weakness:'Only the true Queen casts a shadow'},
 {id:'root-colossus',name:'The Root Colossus',visual:'Massive creature woven from roots and masonry',phases:[{at:1,name:'Awakening',attack:'root-grasp'},{at:.6,name:'Thorn Bloom',attack:'entangling-thorns'},{at:.3,name:'Heartwood',attack:'ground-crack'}],hazard:'expanding root snares',warningRounds:1,weakness:'Sever exposed roots before the Colossus channels a strike'},
 {id:'hourglass-warden',name:'The Hourglass Warden',visual:'Stone keeper revolving around a giant clockwork hourglass',phases:[{at:1,name:'Tick',attack:'clock-hand-sweep'},{at:.65,name:'Reversal',attack:'echo-strike'},{at:.3,name:'Last Grain',attack:'sandfall'}],hazard:'countdown squares and rotating strikes',warningRounds:1,weakness:'Safe positions reverse when the hourglass turns'},
 {id:'hollow-titan',name:'The Hollow Titan',visual:'Vast masked construct with a glowing hollow chest',phases:[{at:1,name:'The Mask',attack:'stone-fist'},{at:.55,name:'The Void',attack:'suction-pulse'},{at:.2,name:'The Open Heart',attack:'void-surge'}],hazard:'telegraphed void fissures',warningRounds:1,weakness:'The exposed chest briefly takes extra damage after a void pulse'}
]);
/** No repeats from the immediately prior expedition. Boss is saved once per expedition. */
export function chooseBoss(seed,previousBossId=null){const pool=ENDGAME_BOSSES.filter(x=>x.id!==previousBossId);if(!pool.length)throw new Error('Boss pool empty');return choice(pool,seededRandom(`${seed}:boss`));}
function blueprint(seed,attempt,target){
 const random=seededRandom(`${seed}:layout:${attempt}`), rooms={},cells=new Map();
 const first=freshRoom('mz001',0,0);rooms[first.id]=first;cells.set(key(0,0),first.id);
 const candidates=[first.id],n=target;
 for(let i=2;i<=n;i++){
  // Grow a long meandering backbone, with enough side branches for dead ends.
  const parents=random()<.7?candidates.slice(-Math.min(8,candidates.length)).reverse():shuffle(candidates,random);
  let chosen=null;
  for(const pid of parents){const p=rooms[pid];const dirs=shuffle(Object.keys(COMPASS),random);
   for(const dir of dirs){const [dx,dy]=COMPASS[dir],nx=p.x+dx,ny=p.y+dy;
    if(!cells.has(key(nx,ny))){chosen={p,nx,ny};break}}
   if(chosen)break;
  }
  if(!chosen)throw new Error('Layout growth failed');
  const room=freshRoom(`mz${String(i).padStart(3,'0')}`,chosen.nx,chosen.ny);rooms[room.id]=room;cells.set(key(room.x,room.y),room.id);connect(chosen.p,room);candidates.push(room.id);
 }
 // Add a few genuine loops while retaining boss distance at 15–20 steps.
 const baseDepths=routeDepths(rooms,first.id), viable=Object.keys(baseDepths).filter(id=>baseDepths[id]>=15&&baseDepths[id]<=20);
 if(!viable.length)return null;
 const bossId=choice(viable.filter(id=>Object.values(rooms[id].connections).length<=2).length?viable.filter(id=>Object.values(rooms[id].connections).length<=2):viable,random);
 const loopCandidates=[];
 for(const r of Object.values(rooms))for(const [dir,[dx,dy]] of Object.entries(COMPASS)){
   const next=cells.get(key(r.x+dx,r.y+dy));if(next&&r.id<next&&!r.connections[dir])loopCandidates.push([r.id,next]);
 }
 let loops=0;
 for(const [a,b] of shuffle(loopCandidates,random)){
  connect(rooms[a],rooms[b]);const len=shortestPath(rooms,first.id,bossId).length-1;
  if(len>=15&&len<=20){loops++;}else{const d=between(rooms[a],rooms[b]);delete rooms[a].connections[d];delete rooms[b].connections[OPPOSITE[d]];}
  if(loops>=2)break;
 }
 if(loops<1)return null;
 const depths=routeDepths(rooms,first.id);
 if(depths[bossId]<15||depths[bossId]>20)return null;
 const optional=Object.keys(depths).filter(id=>id!==bossId&&depths[id]>=8&&Object.values(rooms[id].connections).length<=2);
 if(optional.length<6)return null;
 return {rooms,entrance:first.id,bossId,depths,loops,random};
}
/** Generate exactly one sealed blueprint, using a server-controlled seed. */
export function generateEndgameMaze({seed,previousBossId=null,roomCount=null}={}){
 if(typeof seed!=='string'&&typeof seed!=='number')throw new Error('A server-generated seed is required');
 const roll=seededRandom(`${seed}:count`);
 const count=roomCount===null?MAZE_MIN_ROOMS+Math.floor(roll()*(MAZE_MAX_ROOMS-MAZE_MIN_ROOMS+1)):roomCount;
 if(!Number.isInteger(count)||count<MAZE_MIN_ROOMS||count>MAZE_MAX_ROOMS)throw new Error('Maze room count must be 30–50');
 let plan=null;for(let attempt=0;attempt<2000;attempt++){plan=blueprint(seed,attempt,count);if(plan)break}
 if(!plan)throw new Error('Failed to find a valid maze with a safe boss route');
 const {rooms,entrance,bossId,depths,loops,random}=plan;
 const boss=chooseBoss(seed,previousBossId);
 const bonusPool=Object.keys(depths).filter(id=>depths[id]>=8&&id!==bossId&&id!==entrance&&Object.values(rooms[id].connections).length<=2);
 const bonusCount=4+Math.floor(random()*3);
 const bonus=shuffle(bonusPool,random).slice(0,bonusCount);
 for(let i=0;i<bonus.length;i++){
  const r=rooms[bonus[i]];r.role='bonus';r.hidden=i%2===0;r.challenge=choice(['elite-guard','hazard','single-attempt-riddle','treasure-gamble','miniboss'],random);
 }
 const bossRoute=shortestPath(rooms,entrance,bossId),bossRouteStops=bossRoute.slice(1,-1);
 // All navigation clues are honest, verified by a fresh shortest path from their placement.
 const navCount=6+Math.floor(random()*3);
 const spots=shuffle(bossRouteStops,random).slice(0,navCount).sort((a,b)=>depths[a]-depths[b]);
 const guardedCount=1+Math.floor(random()*3);
 const clues=spots.map((roomId,i)=>{
  const path=shortestPath(rooms,roomId,bossId),destination=rooms[path[1]],origin=rooms[roomId];
  const direction=between(origin,destination);
  if(!direction)throw new Error('Invalid clue direction');
  return {id:`nav${i+1}`,kind:'navigation',roomId,depth:depths[roomId],direction,
    text:`From ${origin.name||'this chamber'}, follow the ${direction} passage to approach the Maze Heart.`,
    hidden:true,unlock:i<guardedCount?'guardian-or-puzzle':'search'};
 });
 const bossClueCount=2+Math.floor(random()*2);
 const bossCluePlaces=shuffle(Object.values(rooms).filter(r=>r.id!==bossId&&r.depth>=0&&depths[r.id]>=4&&depths[r.id]<depths[bossId]),random).slice(0,bossClueCount);
 const bossClues=bossCluePlaces.map((r,i)=>({id:`boss${i+1}`,kind:'boss',roomId:r.id,hidden:true,unlock:'search',
   text:i===0?`The Maze Heart shelters ${boss.name}.`:i===1?`Beware: ${boss.phases[1].attack} begins after the first phase.`:`An old inscription whispers: ${boss.weakness}.`}));
 for(const r of Object.values(rooms)){r.depth=depths[r.id];r.name=TYPES[Math.floor(random()*TYPES.length)]+' '+r.id.slice(2);}
 for(const clue of clues){const room=rooms[clue.roomId];const next=rooms[room.connections[clue.direction]];clue.text=`From ${room.name}, take the ${clue.direction} passage towards ${next.name} on the way to the Maze Heart.`;}
 rooms[entrance].role='entrance';rooms[bossId].role='boss';rooms[bossId].name='The Maze Heart';
 const records=Object.fromEntries(Object.values(rooms).map(r=>[r.id,r]));
 const maze={schemaVersion:1,seed:String(seed),roomCount:count,entrance,bossRoomId:bossId,bossId:boss.id,
   boss:{...boss},rooms:records,loops,bonusRoomIds:bonus,clues:[...clues,...bossClues],
   journal:{discoveredClueIds:[],discoveredRoomIds:[entrance]},status:'active'};
 validateEndgameMaze(maze);
 return maze;
}
export function validateEndgameMaze(m){
 const errors=[],ids=Object.keys(m.rooms||{}),rooms=m.rooms;
 if(ids.length<30||ids.length>50||ids.length!==m.roomCount)errors.push('room count');
 if(!rooms[m.entrance]||!rooms[m.bossRoomId])errors.push('entrance or boss missing');
 if(!ENDGAME_BOSSES.some(b=>b.id===m.bossId))errors.push('boss identity');
 const depths=rooms[m.entrance]?routeDepths(rooms,m.entrance):{};
 if(Object.keys(depths).length!==ids.length)errors.push('unreachable rooms');
 const d=depths[m.bossRoomId];if(d<15||d>20||d===undefined)errors.push('boss route 15–20');
 for(const room of Object.values(rooms))for(const [direction,next] of Object.entries(room.connections)){
   if(!COMPASS[direction]||!rooms[next]||rooms[next].connections[OPPOSITE[direction]]!==room.id||between(room,rooms[next])!==direction)errors.push('broken reciprocal cardinal door');
 }
 const bonus=m.bonusRoomIds||[];
 if(bonus.length<4||bonus.length>6||new Set(bonus).size!==bonus.length||bonus.some(id=>!rooms[id]||depths[id]<8||rooms[id].role!=='bonus'))errors.push('optional chambers');
 const nav=m.clues.filter(c=>c.kind==='navigation'),guarded=nav.filter(c=>c.unlock==='guardian-or-puzzle');
 if(nav.length<6||nav.length>8||guarded.length<1||guarded.length>3)errors.push('navigation clue count');
 for(const clue of nav){const path=shortestPath(rooms,clue.roomId,m.bossRoomId);if(!path||path.length<2||rooms[clue.roomId].connections[clue.direction]!==path[1])errors.push('false navigation clue')}
 if(m.clues.filter(c=>c.kind==='boss').length<2||m.clues.filter(c=>c.kind==='boss').length>3)errors.push('boss clue count');
 if(m.boss.phases.length!==3||m.boss.phases.some((p,i)=>i&&p.at>=m.boss.phases[i-1].at))errors.push('boss phase contract');
 if(errors.length)throw new Error(`Invalid Endgame Maze: ${[...new Set(errors)].join(', ')}`);
 return true;
}
