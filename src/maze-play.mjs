/** DICEBOUND 4.0 — independently saved co-operative Endgame Maze rules.
 * All commands run within the server's Durable Object, never in the browser.
 * This is a beta implementation; account-level transactional durability and child
 * permissions remain separate release requirements.
 */
import {generateEndgameMaze,seededRandom,shortestPath} from './endgame-maze.mjs';
import {effectiveStats,rollDie,awardXp,xpRequiredForLevel,RARITY_DICE,LEVEL_CAP,classFindChance,classGoldBonus,classBonusAttackDie,classBonusDefenceDie,classBombDie} from './engine.mjs';
import {BOSS_KITS,bossSetup,inspectBossPoint,useBossPoint,bossWeaknessMultiplier,bossMinion,nextBossEvent,distance,clampArena} from './maze-boss-kits.mjs';

const CATS=['Sword','Bow','Mace','Staff','Armour','Shield'];
const PLAYER_ORDER=['one','two','three','four'];
const clone=x=>structuredClone(x);
const stamp=()=>Date.now();
const d=(a,b)=>Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
function msg(s,text,now=stamp()) {s.log.push({at:now,text});s.log=s.log.slice(-35);}
function pickId(p,kind){p.nextItemNumber??=1;return `${p.id}-maze-${kind}-${p.nextItemNumber++}`;}
function progress(s){s.mazeRuns??={};s.lastMazeBoss??=null;s.mazeEpoch??=0;}
function account(s,id){const p=s.players?.[id];if(!p||!p.connected)throw new Error('Player disconnected');return p;}
function expedition(s,id){progress(s);const p=account(s,id),run=s.mazeRuns[p.mazeSlot];if(!run||run.status!=='active')throw new Error('Join an active Maze expedition');return {p,run};}
function inCamp(s,p){if(p.mazeSlot||p.room!=='camp'||s.rooms[p.room].battle.status==='active')throw new Error('Leave the existing adventure and return to camp first');}
function active(s,run){return PLAYER_ORDER.filter(id=>s.players?.[id]?.connected&&s.players[id].mazeSlot===run.slot);}
function roomOf(run,p){return run.map.rooms[run.positions[p.id]];}
function logContribution(run,id,roomId){run.contributions[id]??={};run.contributions[id][roomId]=(run.contributions[id][roomId]||0)+1;}
function rewardEquip(p,category,rarity,desc){const piece={id:pickId(p,'equipment'),kind:'equipment',category,rarity,level:p.level,bonusDie:RARITY_DICE[rarity],name:`${rarity} ${category} · ${desc} · L${p.level}`,enchantments:[],mazeReward:true};p.inventory.equipment.push(piece);return piece;}
function lootDie(run,player,roomId,slot){return seededRandom(`${run.map.seed}:${player}:${roomId}:${slot}`);}
function randomRarity(depth,random){const value=random();return depth<8?(value<.75?'Rare':value<.98?'Legendary':'Mythic'):depth<16?(value<.65?'Legendary':value<.98?'Mythic':'Exotic'):value<.55?'Legendary':value<.95?'Mythic':'Exotic';}

/** Host creates up to three independent, immutable-layout expeditions. */
export function createMaze(s,id,slot,seed,now=stamp()){
 progress(s);const p=account(s,id);if(id!=='one')throw new Error('Only the host can create a Maze expedition');
 if(!Number.isInteger(slot)||slot<1||slot>3)throw new Error('Choose save slot 1, 2 or 3');
 if(!s.completedQuests?.includes(15))throw new Error('Complete Quest 15 to unlock the Endgame Maze');
 if(p.mazeSlot)throw new Error('Leave your current Maze before starting another');inCamp(s,p);
 const old=s.mazeRuns[slot];if(old&&old.status==='active')throw new Error('This Maze is in progress; rejoin it instead');
 if(old&&old.status==='active'&&active(s,old).length)throw new Error('All players must leave first');
 if(typeof seed!=='string'||seed.length<8)throw new Error('Server-generated seed required');
 const map=generateEndgameMaze({seed,previousBossId:s.lastMazeBoss});
 s.lastMazeBoss=map.bossId;
 const checkpoints=shortestPath(map.rooms,map.entrance,map.bossRoomId).filter((_,i)=>i===6||i===12);
 const run={slot,map,status:'active',positions:{},seen:[map.entrance],searched:[],revealed:[],clues:[],checkpoints,checkpoint:map.entrance,
  fights:{},claimed:{},bonusAttempted:[],contributions:{},rewardOffers:{},rewardClaimed:{},abandonVotes:[],
  createdAt:now,revision:0,bossVictoryAt:null,lastEntryAt:now};
 s.mazeRuns[slot]=run;p.mazeSlot=slot;p.mazeTile={x:1,y:3};run.positions[id]=map.entrance;
 msg(s,`${p.name} opened Endgame Maze ${slot}: ${map.roomCount} rooms await.`,now);s.revision++;
 return {saved:'room-entry'};
}
export function joinMaze(s,id,slot,now=stamp()){
 progress(s);const p=account(s,id);inCamp(s,p);
 const run=s.mazeRuns[slot];if(!run||run.status!=='active')throw new Error('No active Maze in that slot');
 if(run.positions[id]){
  p.mazeSlot=slot;
  if(run.positions[id]===run.map.bossRoomId&&!run.fights[run.map.bossRoomId]){
   const fallback=run.bossEntryFrom?.[id]||Object.values(run.map.rooms[run.map.bossRoomId].connections)[0];
   run.positions[id]=fallback;p.mazeTile={x:1,y:3};
  }
  if(run.positions[id]===run.map.bossRoomId)adaptBossParty(s,run,run.fights[run.map.bossRoomId],now);
  msg(s,`${p.name} resumed the saved Maze.`,now);return {saved:'room-entry'};
 }
 p.mazeSlot=slot;p.mazeTile={x:1,y:3};run.positions[id]=run.checkpoint||run.map.entrance;
 run.seen=Array.from(new Set([...run.seen,run.positions[id]]));
 msg(s,`${p.name} joined Maze ${slot}.`,now);s.revision++;return {saved:'room-entry'};
}
export function leaveMaze(s,id,now=stamp()){
 const p=account(s,id);progress(s);const run=s.mazeRuns[p.mazeSlot];if(!run)throw new Error('Not in a Maze');
 if(p.hp===0&&run.positions[id]===run.map.bossRoomId&&run.fights[run.map.bossRoomId]?.status==='active')throw new Error('Downed heroes must be revived or await team defeat');p.mazeSlot=null;delete run.abandonVotes[id];
 resetEmptyBoss(s,run,now);
 msg(s,`${p.name} left Maze ${run.slot}; their discoveries are saved.`,now);s.revision++;return {saved:'room-entry'};
}
function battleFor(s,run,roomId){
 const r=run.map.rooms[roomId];if(r.role==='entrance')return null;
 if(run.fights[roomId])return run.fights[roomId];
 const random=seededRandom(`${run.map.seed}:${roomId}:battle`);
 // Scale final boss stats to real character strength, not the low-level campaign
 // D20 enemies. This prevents level-25 armour from making every attack harmless.
 const party=active(s,run).filter(id=>run.positions[id]===roomId&&s.players[id].hp>0).map(id=>effectiveStats(s.players[id]));
 const mean=(key,fallback)=>party.length?party.reduce((sum,p)=>sum+p[key],0)/party.length:fallback;
 const bossPower={attack:mean('attack',500),armour:mean('armour',250),maxHp:mean('maxHp',2500)};
 const bossHp=Math.round(Math.max(300,bossPower.attack*5.5+bossPower.maxHp*.15));
 const bossAtk=Math.round(Math.max(22,bossPower.armour*1.5+bossPower.maxHp*.08));
 const bossArmour=Math.round(Math.max(5,bossPower.attack*.28));
 const count=r.role==='boss'?1:Math.min(6,1+Math.floor(r.depth/5)+(r.role==='bonus'?2:0)+Math.floor(random()*2));
 const enemies=Array.from({length:count},(_,i)=>{
  const boss=r.role==='boss';const die=boss?34+Math.floor(r.depth*.8):8+Math.floor(r.depth*1.7)+Math.floor(random()*7);
  const role=boss?'boss':['normal','armoured','ghost','ninja','ranged','teleporter','healer','cloner'][Math.floor(random()*Math.min(8,3+Math.floor(r.depth/4)))];
  const hp=boss?bossHp:Math.round((45+r.depth*8)*(r.role==='bonus'?1.45:1));
  return {id:`${roomId}-e${i}`,name:boss?run.map.boss.name:`${role[0].toUpperCase()+role.slice(1)} D${die}`,hp,maxHp:hp,atk:boss?bossAtk:12+Math.floor(r.depth*2.3),armour:boss?bossArmour:9+Math.floor(r.depth*1.15),role,die,
   x:boss?3:1+(i*2)%5,y:boss?2:1+Math.floor(i/3)*3};
 });
 const battle={status:'active',round:1,enemyPhases:0,deadline:stamp()+60_000,actions:{},enemies,phase:0,phaseEvents:[0],finalPhasePlayed:false,warn:null,damageBy:{},supportBy:{},downed:{},reviveGuard:{},hazardTiles:[],pendingPhase:[],phaseAvailable:1,bossState:r.role==='boss'?bossSetup(run.map.bossId,run.map.seed):null};
 if(battle.bossState)battle.bossState.minionScale={attack:bossPower.attack,armour:bossPower.armour,maxHp:bossPower.maxHp};
 run.fights[roomId]=battle;return battle;
}
function fightActive(run,roomId){const b=run.fights[roomId];return !!b&&b.status==='active';}
function roomReady(run,roomId){const r=run.map.rooms[roomId];return r.role==='entrance'||run.fights[roomId]?.status==='cleared';}
export function mazeTravel(s,id,dir,now=stamp()){
 const {p,run}=expedition(s,id);if(!['N','S','E','W'].includes(dir))throw new Error('Choose north, south, east or west');
 const room=roomOf(run,p);if(!roomReady(run,room.id))throw new Error('Defeat or escape this room’s guardians before travelling');
 const destination=room.connections[dir];if(!destination)throw new Error('No passage in that direction');
 if(run.map.rooms[destination].hidden&&!run.revealed.includes(destination))throw new Error('A hidden passage may be nearby. Search this room.');
 const b=run.fights[destination];if(b?.status==='active'&&b.enemies.every(e=>e.hp<=0))b.status='cleared';
 run.positions[id]=destination;run.seen=Array.from(new Set([...run.seen,destination]));
 if(run.checkpoints.includes(destination)&&run.checkpoint!==destination){run.checkpoint=destination;run.checkpointFights=clone(run.fights);run.checkpointSeen=[...run.seen];msg(s,'⚑ Maze checkpoint activated. Adventure world progress saved.',now);}
 const next=battleFor(s,run,destination);
 if(next?.status==='active'&&run.map.rooms[destination].role==='boss'&&!next.bossState)next.bossState=bossSetup(run.map.bossId,run.map.seed);
 if(next?.status==='active')next.deadline=now+60_000;
 if(run.map.rooms[destination].role==='boss'){p.mazeTile={x:1,y:3};run.bossEntryFrom??={};run.bossEntryFrom[id]=room.id;adaptBossParty(s,run,next,now);}
 run.lastEntryAt=now;run.revision++;s.revision++;
 msg(s,`${p.name} entered ${run.map.rooms[destination].name} (${dir}).`,now);
 return {saved:run.checkpoints.includes(destination)?'checkpoint':'room-entry'};
}
export function mazeSearch(s,id,now=stamp()){
 const {p,run}=expedition(s,id),room=roomOf(run,p);
 if(!roomReady(run,room.id))throw new Error('Defeat the guardians before investigating the chamber');
 if(run.searched.includes(room.id))throw new Error('This room has already been thoroughly searched');
 run.searched.push(room.id);let discoveries=[];
 for(const clue of run.map.clues.filter(c=>c.roomId===room.id)){
  if(clue.unlock==='guardian-or-puzzle'&&room.role!=='entrance'&&run.fights[room.id]?.status!=='cleared')continue;
  if(!run.clues.includes(clue.id)){run.clues.push(clue.id);discoveries.push(clue.text);}
 }
 for(const neighborId of Object.values(room.connections)){if(run.map.rooms[neighborId]?.hidden&&!run.revealed.includes(neighborId)){
  run.revealed.push(neighborId);discoveries.push(`A concealed passage leads to ${run.map.rooms[neighborId].name}.`);
 }}
 logContribution(run,id,room.id);run.revision++;s.revision++;
 msg(s,discoveries.length?`${p.name} found ${discoveries.join(' ')}`:`${p.name} searched ${room.name} but found no new clues.`,now);
 return {saved:null,discoveries};
}
export function mazeClaim(s,id,slot,now=stamp()){
 const {p,run}=expedition(s,id);const r=roomOf(run,p);
 if(!['coin','potion','equipment','enchantment'].includes(slot))throw new Error('Invalid treasure category');
 if(!roomReady(run,r.id))throw new Error('Clear the room before collecting treasure');
 const key=`${id}:${r.id}:${slot}`;
 if(run.claimed[key])throw new Error('This personal treasure has already been searched');
 // The claim ledger is durable in the same serialized state as the inventory.
 run.claimed[key]=true;const random=lootDie(run,id,r.id,slot);
 if(random()<1-classFindChance(p.classChosen?p.klass:null,slot)){msg(s,`${p.name} searched ${slot} treasure but found nothing.`,now);s.revision++;return {saved:null,empty:true};}
 let item=null;
 if(slot==='coin'){const rare=random()<1/500,amount=rare?1000:25+r.depth*9+Math.floor(random()*30);const credited=classGoldBonus(p.classChosen?p.klass:null,amount);p.gold+=credited;item=rare?'Coin of Ages':`${credited} gold`;}
 else if(slot==='potion'){p.inventory.potions.push({id:pickId(p,'potion'),kind:'potion',name:'Healing Potion',charges:1});item='Healing Potion';}
 else if(slot==='equipment'){const category=CATS[Math.floor(random()*CATS.length)],rarity=randomRarity(r.depth,random);item=rewardEquip(p,category,rarity,'Maze discovery').name;}
 else {const multishot=random()<1/1500,schools=['Sharpness','Fortification','Multishot'],school=multishot?'Multishot':schools[Math.floor(random()*3)],level=multishot?5:1+Math.floor(random()*4);const enchant={id:pickId(p,'enchantment'),kind:'enchantment',school,level,name:school+' '+['I','II','III','IV','V'][level-1]};p.inventory.enchantments.push(enchant);item=enchant.name;}
 msg(s,`${p.name} discovered ${item} in ${r.name}.`,now);s.revision++;return {saved:null,item};
}
export function mazeBonus(s,id,now=stamp()){
 const {p,run}=expedition(s,id),r=roomOf(run,p);if(r.role!=='bonus')throw new Error('No optional challenge here');
 if(!roomReady(run,r.id))throw new Error('Defeat the bonus chamber guardians first');
 if(run.bonusAttempted.includes(r.id))throw new Error('This chamber challenge has already been attempted');
 if(!run.contributions[id]?.[r.id])throw new Error('Participate meaningfully in this chamber to earn its prize');
 run.bonusAttempted.push(r.id);
 const random=seededRandom(`${run.map.seed}:${r.id}:bonus`),win=random()<.7;
 if(win){
  const winners=Object.keys(run.positions).filter(pid=>run.positions[pid]===r.id&&(run.contributions[pid]?.[r.id]||0)>0);
  for(const pid of winners){const hero=s.players[pid],gold=100+r.depth*18;hero.gold+=gold;msg(s,`${hero.name} earned ${gold} gold from the bonus chamber.`,now);}
 }else {p.hp=Math.max(1,p.hp-Math.floor(p.maxHp*.22));msg(s,`${p.name} lost the treasure gamble and suffered a backlash.`,now);}
 s.revision++;return {saved:null,win};
}
function aliveEnemies(b){return b.enemies.filter(e=>e.hp>0);}
function spawnBossAdds(s,run,b,count,now){
 if(!b?.bossState||b.status!=='active')return 0;
 const live=b.enemies.filter(e=>e.hp>0&&e.role!=='boss').length;
 const amount=Math.max(0,Math.min(count,7-live));
 for(let i=0;i<amount;i++){
  const serial=++b.bossState.summons,add=bossMinion(run.map.bossId,serial,run.map.rooms[run.map.bossRoomId].depth,b.phase,b.bossState.minionScale);
  // Never spawn directly on a marked danger tile or a living player.
  const occupied=run.positions&&Object.keys(run.positions).filter(id=>run.positions[id]===run.map.bossRoomId&&s.players[id]?.hp>0).map(id=>s.players[id].mazeTile||{x:1,y:3})||[];
  const forbidden=[...(b.warn?.tiles||[]),...occupied,...b.enemies.filter(e=>e.hp>0).map(e=>({x:e.x,y:e.y}))];
  const free=Array.from({length:25},(_,j)=>({x:1+j%5,y:1+Math.floor(j/5)})).find(t=>!forbidden.some(x=>distance(x,t)===0));
  if(free){add.x=free.x;add.y=free.y;}
  b.enemies.push(add);
 }
 if(amount)msg(s,`⚔ ${amount} ${BOSS_KITS[run.map.bossId].minion}${amount>1?'s':''} join the battle.`,now);
 return amount;
}
function adaptBossParty(s,run,b,now){
 if(!b||b.status!=='active'||!b.bossState)return;
 const n=participants(s,run,run.map.bossRoomId).length;
 if(n>b.bossState.partyPeak){spawnBossAdds(s,run,b,n-b.bossState.partyPeak,now);b.bossState.partyPeak=n;}
}
function resetEmptyBoss(s,run,now){
 const id=run.map.bossRoomId,b=run.fights[id];if(!b||b.status!=='active')return;
 const inside=Object.keys(run.positions).some(pid=>s.players[pid]?.mazeSlot===run.slot&&run.positions[pid]===id);
 if(!inside){delete run.fights[id];msg(s,`↩ The ${run.map.boss.name} arena resets after the entire party retreats.`,now);}
}
/** The retreat is a real boss-room exit, never a way to claim a kill without fighting. */
export function mazeRetreat(s,id,now=stamp()){
 const {p,run}=expedition(s,id),rid=run.positions[id];
 if(p.hp<=0)throw new Error('Downed heroes cannot retreat');
 if(rid!==run.map.bossRoomId||run.fights[rid]?.status!=='active')throw new Error('Retreat is only available during the final boss battle');
 const origin=run.bossEntryFrom?.[id];
 const safe=(origin&&run.map.rooms[rid].connections&&Object.values(run.map.rooms[rid].connections).includes(origin))?origin:Object.values(run.map.rooms[rid].connections)[0];
 if(!safe)throw new Error('No retreat passage');
 run.positions[id]=safe;p.mazeTile={x:1,y:3};run.seen=Array.from(new Set([...run.seen,safe]));
 msg(s,`${p.name} retreats from the Maze Heart.`,now);resetEmptyBoss(s,run,now);run.revision++;s.revision++;return {saved:'room-entry'};
}

function participants(s,run,roomId){return active(s,run).filter(id=>run.positions[id]===roomId&&s.players[id].hp>0);}
function hitEnemy(s,run,p,b,enemy,damage,now){
 // Before the third combat phase has played, keep the boss at its last 1 HP.
 // This does not restore previously lost HP; every phase must have a real turn.
 const floor=enemy.role==='boss'&&!b.finalPhasePlayed?1:0;
 const modified=enemy.role==='boss'?Math.ceil(Math.max(0,damage)*bossWeaknessMultiplier(b,p)):Math.max(0,damage);
 const actual=Math.min(Math.max(0,enemy.hp-floor),modified);enemy.hp-=actual;b.damageBy[p.id]=(b.damageBy[p.id]||0)+actual;
 if(enemy.role==='boss'&&modified>damage)msg(s,`✦ ${p.name} exploited ${enemy.name}'s weakness!`,now);
 msg(s,`${p.name} dealt ${actual} to ${enemy.name} (${enemy.hp}/${enemy.maxHp}).`,now);
}
function advancePhases(s,run,b,now){
 const boss=b.enemies.find(e=>e.role==='boss');if(!boss)return;
 const thresholds=run.map.boss.phases;
 for(let phase=1;phase<3;phase++){
  if(boss.hp<=boss.maxHp*thresholds[phase].at&&phase>b.phase&&!b.pendingPhase.includes(phase))b.pendingPhase.push(phase);
 }
 // First transition occurs after the hit; later transitions are processed
 // one per enemy phase. Large attacks never skip the intermediate phase.
 if(b.phase===0&&b.pendingPhase.includes(1))enterBossPhase(s,run,b,1,now);
}
function enterBossPhase(s,run,b,next,now){
 if(next!==b.phase+1||!b.pendingPhase.includes(next))return false;
 b.pendingPhase=b.pendingPhase.filter(x=>x!==next);b.phase=next;
 b.phaseAvailable=b.round+1;b.phaseEvents.push(next);
 if(b.bossState){b.bossState.phaseSeen.push(next);if(run.map.bossId==='root-colossus'&&next===2){b.bossState.points.forEach(pt=>pt.used=false);b.bossState.weakUntil=0;}}
 msg(s,`⚠ ${run.map.boss.name} enters PHASE ${next+1}: ${run.map.boss.phases[next].name}. ${run.map.boss.phases[next].attack} prepares for a later turn.`,now);
 // Boss-specific attendants are a tactical change, not just an HP increase.
 spawnBossAdds(s,run,b,next===2?2:1,now);
 return true;
}
function bossSecondary(s,run,b,now){
 const bs=b.bossState;if(!bs)return;
 const pending=bs.pendingEvent;
 if(pending&&pending.due<=b.round){
  bs.pendingEvent=null;
  if(pending.kind==='magnet'||pending.kind==='gravity'){
   const attracted=[];
   for(const pid of participants(s,run,run.map.bossRoomId)){
    const p=s.players[pid],tile=p.mazeTile||{x:1,y:3};
    if(pending.kind==='magnet'&&bs.anchors[pid]>=b.round)continue;
    const x=tile.x===3?3:clampArena(tile.x+(tile.x<3?1:-1));
    const y=tile.y===3?3:clampArena(tile.y+(tile.y<3?1:-1));
    p.mazeTile={x,y};attracted.push(p.name);
   }
   if(attracted.length)msg(s,`↪ ${pending.label} shifts ${attracted.join(', ')} one tile towards the centre.`,now);
  }else if(pending.kind==='embers'||pending.kind==='reflection')spawnBossAdds(s,run,b,b.phase>=1?2:1,now);
  else if(pending.kind==='roots'){
   for(const pid of participants(s,run,run.map.bossRoomId))bs.snared[pid]=b.round+1;
   msg(s,'🌿 Binding roots grip the party. Movement is blocked for one tactical round.',now);
  }else if(pending.kind==='echo'){
   // The echo reinforces the next telegraphed sweep; no surprise damage.
   bs.echoPower=b.round+1;msg(s,'⌛ An echo strengthens the NEXT warned clock-hand sweep.',now);
  }
 }
 if(!bs.pendingEvent){const next=nextBossEvent(bs,b.round,b.phase);if(next){bs.pendingEvent=next;msg(s,`⚠ ${next.label} will activate during the next enemy phase.`,now);}}
}
function endFight(s,run,roomId,now){
 const b=run.fights[roomId];if(!b||b.status!=='active'||aliveEnemies(b).length)return false;
 if(roomId===run.map.bossRoomId&&!b.finalPhasePlayed)return false;
 b.status='cleared';b.deadline=null;b.warn=null;
 for(const id of Object.keys(b.damageBy)){const p=s.players[id];if(p){
    const share=b.damageBy[id]/Math.max(1,Object.values(b.damageBy).reduce((a,v)=>a+v,0));
    const depth=run.map.rooms[roomId].depth;
    const budget=xpRequiredForLevel(p.level);
    const xp=Math.max(30,Math.round(budget*(.024+.0005*depth)*(.2/Math.max(1,Object.keys(b.damageBy).length)+.8*share)));
    awardXp(p,xp,s,now);
  }}
 if(roomId===run.map.bossRoomId){
  run.status='completed';run.bossVictoryAt=now;
  for(const id of Object.keys(run.positions)){
   const participation=Object.values(run.contributions[id]||{}).reduce((a,v)=>a+v,0);
   if(participation>=2){const random=seededRandom(`${run.map.seed}:${id}:victory`),r=random();run.rewardOffers[id]={rarity:r<.75?'Legendary':r<.95?'Mythic':'Exotic',gold:300+s.players[id].level*42,level:s.players[id].level};}
  }
  msg(s,`🏆 ${run.map.boss.name} is defeated. Every eligible hero receives their own victory chest!`,now);
 }else msg(s,`✅ ${run.map.rooms[roomId].name} cleared.`,now);
 return true;
}
/** Each Endgame boss uses its own deterministic, telegraphed 7 × 7 hazard
 * geometry. This is server-owned: the browser receives only marked squares. */
export function mazeBossHazardTiles(bossId,phase,round){
 const index=(round+phase)%5+1,points=[];
 const add=(x,y)=>{if(x>=0&&x<=6&&y>=0&&y<=6&&!points.some(t=>t.x===x&&t.y===y))points.push({x,y});};
 if(bossId==='iron-regent'){
  // Sweeping steel lanes: one column, then a second converging lane.
  for(let y=1;y<=5;y++)add(index,y);
  if(phase>=1)for(let y=1;y<=5;y++)add(6-index,y);
 }else if(bossId==='cinder-wyrm'){
  // Fire breath: an expanding arc that wraps around the arena.
  const y=1+(round%5);for(let x=1;x<=5;x++)add(x,y);
  add(2,Math.max(1,y-1));add(4,Math.min(5,y+1));
  if(phase>=1){add(1,1);add(5,1);add(1,5);add(5,5);}
  if(phase===2)for(let x=1;x<=5;x++){add(x,1);add(x,5);}
 }else if(bossId==='mirror-queen'){
  // Reflected light: diagonal beams with phase-dependent crossings.
  for(let j=1;j<=5;j++){add(j,j);if(phase>=1)add(6-j,j);}
  if(phase===2)for(let y=1;y<=5;y++)add(index,y);
 }else if(bossId==='root-colossus'){
  // Roots spread out across rows, thickening each phase.
  for(let x=1;x<=5;x++)add(x,index);
  add(3,Math.max(1,index-2));add(3,Math.min(5,index+1));
  if(phase>=1)for(let x=1;x<=5;x++)add(x,Math.max(1,index-1));
  if(phase===2)for(let y=1;y<=5;y++)add(3,y);
 }else if(bossId==='hourglass-warden'){
  // Clock hands sweep perpendicular axes and reverse by phase.
  const h=(index+phase-1)%5+1;
  for(let i=1;i<=5;i++){if((round+phase)%2===0)add(i,h);else add(h,i);}
  add(3,3);add(4,4);
  if(phase===2)for(let i=1;i<=5;i++)add(i,6-h);
 }else if(bossId==='hollow-titan'){
  // Void pulses collapse towards the heart from the outer ring.
  const radius=phase===0?2:phase===1?1:0;
  for(let x=1;x<=5;x++)for(let y=1;y<=5;y++)if(Math.abs(x-3)+Math.abs(y-3)===radius+1)add(x,y);
 }else{
  for(let y=1;y<=5;y++)add(index,y);
 }
 return points;
}
function resolveBattle(s,run,roomId,now,random=Math.random){
 const b=run.fights[roomId];if(!b||b.status!=='active')return;
 const ids=participants(s,run,roomId);
 for(const id of ids){
  const p=s.players[id],a=b.actions[id]||{type:'defend'};
  if(a.type==='attack'||a.type==='special'){
   const targets=aliveEnemies(b),enemy=targets.find(e=>e.id===a.target)||targets[0];if(!enemy)continue;
   const stats=effectiveStats(p),boost=b.boosted?.[id]?2:1,die=a.type==='special'&&stats.special?stats.special.dice.reduce((sum,faces)=>sum+rollDie(faces*boost,random),0):rollDie(stats.attack*boost,random);
   const extra=classBonusAttackDie(p)?rollDie(classBonusAttackDie(p),random):0;
   const damage=Math.max(1,die+extra-rollDie(enemy.armour,random));
   hitEnemy(s,run,p,b,enemy,damage,now);
   if(a.type==='special'){p.specialUsedAt??={};const item=p.inventory.equipment.find(x=>x.id===p.equipped.weapon);if(item)p.specialUsedAt[item.id]=(p.combatTurns||0);}
   advancePhases(s,run,b,now);
  }else if(a.type==='item'){
   const idx=(p.inventory.consumables||[]).findIndex(x=>x.sku===a.sku&&x.charges>0);
   if(idx>=0){
    const used=p.inventory.consumables.splice(idx,1)[0],targets=aliveEnemies(b);
    if(a.sku==='guardian-ward'){
      const gain=Math.min(p.maxHp-p.hp,Math.ceil(p.maxHp*.35));p.hp+=gain;p.wardCharges=1;
      b.supportBy[id]=(b.supportBy[id]||0)+1;msg(s,`${p.name} used Guardian Tonic (+${gain} HP; next hit blocked).`,now);
    }else if(a.sku==='super-potion'){
      b.boosted??={};b.boosted[id]=true;b.supportBy[id]=(b.supportBy[id]||0)+1;
      msg(s,`${p.name} activated Superstrength for this encounter.`,now);
    }else{
      const affected=a.sku==='blast-bomb'?targets.filter(e=>d(p.mazeTile||{x:1,y:3},e)<=3):targets;
      for(const enemy of affected){
        const stats=effectiveStats(p),boost=b.boosted?.[id]?2:1;
        const die=a.sku==='blast-bomb'?Math.max(4,stats.attack):Math.max(3,Math.ceil(stats.attack*.35));
        const roll=rollDie(die*boost,random)+(classBombDie(p,a.sku)?rollDie(classBombDie(p,a.sku),random):0);
        const dmg=a.sku==='blast-bomb'?Math.max(1,roll-rollDie(enemy.armour,random)):roll;
        hitEnemy(s,run,p,b,enemy,dmg,now);
      }
      advancePhases(s,run,b,now);msg(s,`${p.name} used ${used.name} on ${affected.length} target(s).`,now);
    }
   }
  }else if(a.type==='heal'){
   const target=s.players[a.target]||p;
   if(p.inventory.potions?.length){p.inventory.potions.shift();target.hp=Math.min(target.maxHp,target.hp+Math.ceil(target.maxHp*.35));b.supportBy[id]=(b.supportBy[id]||0)+1;msg(s,`${p.name} healed ${target.name}.`,now);}
  }else if(a.type==='revive'){
   const target=s.players[a.target];if(target&&target.hp===0&&target.mazeSlot===run.slot&&run.positions[target.id]===roomId&&b.downed[target.id]>=b.round){target.hp=Math.ceil(target.maxHp*.5);b.downed[target.id]=null;b.reviveGuard??={};b.reviveGuard[target.id]=b.round+1;b.supportBy[id]=(b.supportBy[id]||0)+1;msg(s,`${p.name} revived ${target.name}.`,now);}
  }else if(a.type==='interact'){
   const point=inspectBossPoint(b,p,a.point),effect=useBossPoint(b,p,point);
   msg(s,`⚙ ${effect.text}`,now);b.supportBy[id]=(b.supportBy[id]||0)+1;
   if(effect.cancelHazard){b.warn=null;b.bossState.pendingEvent=null;}
   if(effect.clearDecoys)for(const e of b.enemies)if(e.role==='decoy')e.hp=0;
   if(effect.summon)spawnBossAdds(s,run,b,effect.summon,now);
  }else if(a.type==='defend'){b.supportBy[id]=(b.supportBy[id]||0)+1;}
  else if(a.type==='move'){p.mazeTile=a.tile;}
  p.combatTurns=(p.combatTurns||0)+1;
 }
 if(endFight(s,run,roomId,now))return;
 b.enemyPhases++;
 const boss=run.map.rooms[roomId].role==='boss';
 // Warn one complete tactical round before the hazard. Resolve the previously
 // marked danger first; then telegraph the next one, never same-phase surprise.
 if(b.warn&&b.warn.resolveAt<=b.round){
  for(const id of ids){const p=s.players[id],tile=p.mazeTile||{x:1,y:3};
   if(p.hp<=0||b.reviveGuard?.[id]>=b.round)continue;
   if(b.warn.tiles.some(t=>d(t,tile)===0)){
     const base=Math.max(1,Math.floor(22+run.map.rooms[roomId].depth*1.2));
     const incoming=Math.max(1,base-Math.floor(effectiveStats(p).armour*.08));
     const enhanced=b.bossState?.echoPower===b.round?Math.ceil(incoming*1.2):incoming;
     const dealt=b.actions[id]?.type==='defend'?Math.ceil(enhanced*.5):enhanced;
     p.hp=Math.max(0,p.hp-dealt);if(p.hp===0)b.downed[id]=b.round+3;
     msg(s,`⚠ ${p.name} was hit by ${b.warn.attack}: ${dealt} damage.`,now);
    }
   }
  if(boss&&run.map.bossId==='cinder-wyrm'&&b.phase>=1&&b.bossState){
    b.bossState.hotTiles=b.warn.tiles.slice(0,4).map(x=>({...x}));
  }
  b.warn=null;
 }
 if(boss)bossSecondary(s,run,b,now);
 for(const e of aliveEnemies(b)){
  const targets=ids.filter(id=>s.players[id].hp>0);if(!targets.length)break;
  const target=s.players[targets[Math.floor(random()*targets.length)]],a=b.actions[target.id]||{};
  const bossAttack=e.role==='boss'&&boss&&b.phaseAvailable<=b.round?e.atk+Math.round(e.atk*(b.phase*.22))+(ids.length>2?Math.round(e.atk*.12):0):e.atk;
  const strike=Math.max(1,rollDie(bossAttack,random)-(rollDie(effectiveStats(target).armour*(b.boosted?.[target.id]?2:1),random)+(classBonusDefenceDie(target)?rollDie(classBonusDefenceDie(target),random):0)));
  const damage=a.type==='defend'?Math.ceil(strike*.5):strike;
  if(target.wardCharges>0){target.wardCharges--;target.hp=Math.max(0,target.hp);msg(s,`${target.name}'s Guardian Tonic blocked the blow.`,now);}else target.hp=Math.max(0,target.hp-damage);
  if(target.hp===0)b.downed[target.id]=b.round+3;
  msg(s,`${e.name} struck ${target.name} for ${damage} damage.`,now);
 }
 if(boss){
   if(b.phase===2&&b.phaseAvailable<=b.round)b.finalPhasePlayed=true;
   if(b.pendingPhase.includes(2)&&b.phase===1&&b.round>=b.phaseAvailable)enterBossPhase(s,run,b,2,now);
 }
 if(boss&&b.phaseAvailable<=b.round+1){
  const phase=b.phase;
  const tiles=mazeBossHazardTiles(run.map.bossId,phase,b.round);
  // The Wyrm leaves a handful of hot squares behind. They stay visible
  // in next round's warning, never dealing unannounced residual damage.
  if(run.map.bossId==='cinder-wyrm')for(const pt of b.bossState.hotTiles||[])if(!tiles.some(t=>d(pt,t)===0))tiles.push(pt);
  b.warn={tiles,resolveAt:b.round+1,attack:run.map.boss.phases[phase].attack};
  msg(s,`⚠ Danger tiles marked for NEXT round: ${tiles.map(t=>`(${t.x},${t.y})`).join(' ')}. Move or Defend!`,now);
 }
 const activeAlive=active(s,run).filter(id=>s.players[id].hp>0);
 if(!activeAlive.length){
  // Restore the world since the checkpoint; preserve personal loot ledger and
  // character items to prevent re-roll/duplication after a team defeat.
  if(run.checkpointFights)run.fights=clone(run.checkpointFights);else run.fights={};
  for(const id of Object.keys(run.positions)){run.positions[id]=run.checkpoint;const p=s.players[id];if(p){p.hp=p.maxHp;p.mazeTile={x:1,y:3};}}
  run.seen=Array.from(new Set([...(run.checkpointSeen||[run.map.entrance]),run.checkpoint]));
  msg(s,'The team fell. Returning to the latest Maze checkpoint with personal gear intact.',now);
 }
 b.actions={};b.round++;b.deadline=now+60_000;
}
export function mazeAction(s,id,action,now=stamp(),random=Math.random){
 const {p,run}=expedition(s,id),roomId=run.positions[id],b=run.fights[roomId];
 if(roomId===run.map.bossRoomId&&b&&!b.bossState)b.bossState=bossSetup(run.map.bossId,run.map.seed);
 if(!b||b.status!=='active')throw new Error('No active fight in this chamber');
 if(p.hp<=0)throw new Error('A teammate must revive you');
 if(b.actions[id])throw new Error('One tactical action per round');
 if(!action||!['attack','special','defend','heal','revive','move','interact','item'].includes(action.type))throw new Error('Invalid tactical action');
 const a={type:action.type};
 if(['attack','special'].includes(a.type)){
  if(a.type==='special'){
   const special=effectiveStats(p).special,item=p.inventory.equipment.find(x=>x.id===p.equipped.weapon);
   if(!special||!item)throw new Error('A Legendary+ weapon special is required');
   const prev=p.specialUsedAt?.[item.id];if(Number.isInteger(prev)&&(p.combatTurns||0)<prev+special.cooldown)throw new Error('Special recharging');
  }
  if(action.target!=null&&!b.enemies.some(e=>e.id===action.target&&e.hp>0))throw new Error('Unknown enemy');a.target=action.target;
 }
 if(a.type==='item'){
  if(!['blast-bomb','meteor-scroll','guardian-ward','super-potion'].includes(action.sku))throw new Error('Unknown Maze combat item');
  if(!(p.inventory?.consumables||[]).some(x=>x.sku===action.sku&&x.charges>0))throw new Error('Combat item not owned');
  if(action.sku==='super-potion'&&b.boosted?.[id])throw new Error('Superstrength already active');
  if(action.sku==='meteor-scroll'&&!aliveEnemies(b).length)throw new Error('No targets for meteor');
  if(action.sku==='blast-bomb'&&!aliveEnemies(b).some(e=>d(p.mazeTile||{x:1,y:3},e)<=3))throw new Error('No targets in bomb range');
  a.sku=action.sku;
 }
 if(a.type==='heal'){if(!p.inventory.potions?.length)throw new Error('No healing potions');const target=action.target||id;if(!s.players[target]||run.positions[target]!==roomId)throw new Error('No ally here');a.target=target;}
 if(a.type==='revive'){const target=s.players[action.target];if(!target||target.hp>0||run.positions[target.id]!==roomId)throw new Error('No downed teammate to revive');a.target=target.id;}
 if(a.type==='interact'){
  if(roomId!==run.map.bossRoomId||!b.bossState)throw new Error('Interact is only for final boss arena objects');
  const point=inspectBossPoint(b,p,action.point);
  if(point.used)throw new Error('This arena object has already been used');
  if(b.bossState.id==='hourglass-warden'&&b.round<b.bossState.lastInteract+3)throw new Error('The hourglass is still resetting');
  if(Object.values(b.actions).some(x=>x.type==='interact'&&x.point===point.id)&&b.bossState.id!=='iron-regent')throw new Error('A teammate is already using this arena object');
  a.point=action.point;
 }
 if(a.type==='move'){
  const current=p.mazeTile||{x:1,y:3},tile=action.tile;
  if(!tile||!Number.isInteger(tile.x)||!Number.isInteger(tile.y)||tile.x<0||tile.x>6||tile.y<0||tile.y>6||d(current,tile)!==1)throw new Error('Move one tile inside the arena');
  if(b.bossState?.snared?.[id]>=b.round)throw new Error('Entangled by roots: defend or fight until the snare expires');a.tile={x:tile.x,y:tile.y};
 }
 b.actions[id]=a;logContribution(run,id,roomId);
 if(participants(s,run,roomId).every(x=>b.actions[x]))resolveBattle(s,run,roomId,now,random);
 run.revision++;s.revision++;return {saved:b.status==='cleared'&&roomId===run.map.bossRoomId?'boss-completed':null};
}
export function mazeTick(s,now=stamp(),random=Math.random){progress(s);let changed=false;
 for(const run of Object.values(s.mazeRuns))if(run.status==='active')for(const [roomId,b] of Object.entries(run.fights))if(b.status==='active'&&b.deadline&&b.deadline<=now&&participants(s,run,roomId).length){resolveBattle(s,run,roomId,now,random);changed=true;}
 return changed;
}
export function nextMazeDeadline(s){progress(s);return Math.min(Infinity,...Object.values(s.mazeRuns).filter(r=>r.status==='active').flatMap(r=>Object.values(r.fights).filter(b=>b.status==='active'&&b.deadline&&participants(s,r,Object.entries(r.fights).find(([,v])=>v===b)?.[0]).length).map(b=>b.deadline)));}
export function mazeReward(s,id,category,now=stamp()){
 progress(s);const p=account(s,id);if(!CATS.includes(category))throw new Error('Choose a weapon or armour category');
 const run=Object.values(s.mazeRuns).find(r=>r.status==='completed'&&r.rewardOffers[id]&&!r.rewardClaimed[id]);
 if(!run)throw new Error('No unclaimed Maze victory chest');
 const offer=run.rewardOffers[id];if(p.inventory.equipment.some(x=>x.mazeRewardId===`${run.map.seed}:${id}`))throw new Error('Maze reward already collected');
 const piece=rewardEquip(p,category,offer.rarity,`${run.map.boss.name} victory`);piece.mazeRewardId=`${run.map.seed}:${id}`;
 p.gold+=offer.gold;const enchant={id:pickId(p,'enchantment'),kind:'enchantment',school:'Sharpness',level:3,name:'Sharpness III · Maze Victory'};p.inventory.enchantments.push(enchant);
 awardXp(p,Math.round(xpRequiredForLevel(p.level)*.4),s,now);run.rewardClaimed[id]=true;
 msg(s,`🏆 ${p.name} chose a ${offer.rarity} ${category}, ${offer.gold} gold and a free enchantment.`,now);s.revision++;
 return {saved:null,item:piece};
}
export function mazeVoteAbandon(s,id,now=stamp()){
 const {p,run}=expedition(s,id);if(run.abandonVotes.includes(id))throw new Error('You have already voted');run.abandonVotes.push(id);
 const voters=active(s,run);
 if(voters.length&&voters.every(x=>run.abandonVotes.includes(x))){run.status='abandoned';for(const player of Object.values(s.players))if(player.mazeSlot===run.slot)player.mazeSlot=null;msg(s,'Maze expedition abandoned by unanimous vote. Personal rewards earned remain.',now);}
 else msg(s,`${p.name} requests Maze abandonment (${run.abandonVotes.length}/${voters.length}).`,now);
 s.revision++;return {saved:null};
}
export function mazePublic(s,id){progress(s);const p=s.players?.[id],slot=p?.mazeSlot;
 return {activeSlot:slot||null,slots:[1,2,3].map(n=>({slot:n,status:s.mazeRuns[n]?.status||'empty',rooms:s.mazeRuns[n]?.map.roomCount||null,bossName:s.mazeRuns[n]?.status==='completed'?s.mazeRuns[n]?.map.boss.name:null})),
  rewards:Object.values(s.mazeRuns).filter(r=>r.status==='completed'&&r.rewardOffers[id]&&!r.rewardClaimed[id]).map(r=>({slot:r.slot,rarity:r.rewardOffers[id].rarity})),
  run:slot&&s.mazeRuns[slot]?(()=>{
   const run=s.mazeRuns[slot],roomId=run.positions[id],r=run.map.rooms[roomId];
   return {slot,roomId,room:r.name,depth:r.depth,role:r.role,seen:run.seen.map(x=>{
     const node=run.map.rooms[x];return {id:node.id,x:node.x,y:node.y,name:node.name,role:node.role==='boss'&&x!==roomId?'unknown':node.role,
       connections:Object.fromEntries(Object.entries(node.connections).filter(([,dest])=>!run.map.rooms[dest].hidden||run.revealed.includes(dest)).map(([dir,dest])=>[dir,run.seen.includes(dest)?dest:'?']))};
   }),positions:Object.fromEntries(Object.entries(run.positions).filter(([pid])=>s.players[pid]?.mazeSlot===slot)),
    connections:Object.fromEntries(Object.entries(r.connections).filter(([,dest])=>!run.map.rooms[dest].hidden||run.revealed.includes(dest)).map(([dir,dest])=>[dir,run.seen.includes(dest)?run.map.rooms[dest].name:'Unexplored'])),
    journal:run.map.clues.filter(c=>run.clues.includes(c.id)).map(c=>c.text),
    cluesFound:run.clues.length,checkpoint:run.checkpoint,roomSearched:run.searched.includes(roomId),
    bonus:r.role==='bonus'?{challenge:r.challenge,attempted:run.bonusAttempted.includes(roomId)}:null,
    claimed:['coin','potion','equipment','enchantment'].filter(slot=>run.claimed[`${id}:${roomId}:${slot}`]),
    battle:run.fights[roomId]?(()=>{
      const b=clone(run.fights[roomId]);b.actions=Object.fromEntries(Object.entries(b.actions).map(([pid,a])=>[pid,{type:a.type}]));
      if(b.bossState){delete b.bossState.trueMirror;delete b.bossState.anchors;delete b.bossState.snared;}
      return b;
    })():null,
    boss:roomId===run.map.bossRoomId?{name:run.map.boss.name,phases:run.map.boss.phases.map(x=>x.name),mechanic:BOSS_KITS[run.map.bossId].mechanic,weakness:run.clues.includes('boss3')?BOSS_KITS[run.map.bossId].weakness:null}:null,
    votes:run.abandonVotes.length};
  })():null};
}

export function resumeMazeClock(s,id,now=stamp()){const p=s.players?.[id];if(!p?.mazeSlot)return;const run=s.mazeRuns?.[p.mazeSlot];const battle=run?.fights?.[run.positions[id]];if(battle?.status==='active'){if(run.positions[id]===run.map.bossRoomId&&!battle.bossState)battle.bossState=bossSetup(run.map.bossId,run.map.seed);battle.deadline=now+60_000;}}
