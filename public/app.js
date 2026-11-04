import {localTurnHandoff} from './local-turn-handoff.mjs';
import {resolveHotkey, R2_HOTKEYS} from './hotkeys.mjs';

/** Two-player vertical slice: room/tactical rendering inspired by the 3.2.1
 * canvas, palette, isometric projection and ORIGINAL bundled character assets.
 * All position, HP and combat outcomes are authoritative WebSocket messages.
 */
const ROOT = new URL('.',import.meta.url).pathname.replace(/\/$/,'');
const CLIENT_BUILD='R2 UI · HOTKEYS · FOUR CLASS PIECES';
const $ = id => document.getElementById(id);
const canvas = $('gameCanvas');
const ctx=canvas.getContext('2d');
// Visible verification: if the badge does not appear, the browser is still using old app.js.
const betaTitle=document.querySelector('.brand small');
if(betaTitle)betaTitle.append(document.createTextNode(' · '+CLIENT_BUILD));
const RES={tx:42,ty:23,zh:43}; // original DICEBOUND 3.2.1 projection
const paths={knight:'./assets/class-pieces/knight.png',outlaw:'./assets/class-pieces/outlaw.png',warlock:'./assets/class-pieces/warlock.png',tinker:'./assets/class-pieces/tinker.png',d8:'./assets/d8.png',wallface:'./assets/wallface.jpeg',wallcap:'./assets/wallcap.jpeg'};
const images={};for(const [key,path] of Object.entries(paths)){const image=new Image();image.src=path;images[key]=image}
const ROOM_DATA={woodland:{name:'Woodland Path',left:null,right:'clearing'},clearing:{name:'Training Clearing',left:'woodland',right:'watchpost'},watchpost:{name:'Old Watchpost',left:'clearing',right:null}};
const roomDef=id=>state?.roomDefinitions?.[id]||ROOM_DATA[id]||{name:'Unknown room',left:null,right:null,quest:1};
// Must match server's authoritative roomSize/doorRow rules; older adventures
// retain their original 9 × 7 geometry. Medium becomes 13 × 9.
const roomSize=id=>roomDef(id).quest>=10?{width:15,height:11}:roomDef(id).quest>=5?{width:13,height:9}:{width:9,height:7};
const doorRow=id=>Math.floor(roomSize(id).height/2);
let socket,state,me,view='tactical',connected=false,errorTimer,frameMetrics,authClosed=false,deadlineOffset=0;
let campaign=null,selectedQuest=1,selectedEnemyId=null,lastSeenEvent=null;
let chatData={messages:[],muted:[],reports:[],adminMuted:false,playersMuted:[]},chatOpen=false,chatSeen=0;
const query=new URLSearchParams(location.search);
const trial=query.get('trial')==='balance-v9';
const localMode=query.get('mode')==='local';
const localSeatCount=localMode?Math.max(1,Math.min(4,Number(query.get('seats'))||4)):1;
const seatIds=['one','two','three','four'].slice(0,localSeatCount);
if($('modeLabel'))$('modeLabel').textContent=localMode?`LOCAL MULTIPLAYER · ${localSeatCount} PLAYER${localSeatCount===1?'':'S'}`:'ONLINE MULTIPLAYER · UP TO FOUR PLAYERS';
let activeSeat='one';
const seatSockets={},seatStates={},seatChats={};let setupSeat=null;
let pendingLocalEndTurn=null;
let pendingLocalCharacterSetup=null;
const notices=[];let noticeTimer=null;
function showNotice(title,body,kind='level'){
 const notice=$('milestoneNotice');const close=$('noticeClose');
 notices.push({title,body,kind});if(!notice.hidden)return;
 function next(){const item=notices.shift();if(!item){notice.hidden=true;noticeTimer=null;return;}
  $('noticeTitle').textContent=item.title;$('noticeBody').textContent=item.body;
  notice.className='milestone-notice '+item.kind;notice.hidden=false;
  clearTimeout(noticeTimer);noticeTimer=setTimeout(next,5600);
 }
 next();close.onclick=()=>{clearTimeout(noticeTimer);next()};
}
function consumeEvents(snapshot,player){
 const events=snapshot.events||[];
 // Do not replay historic alerts on first login; the next new achievement is celebrated.
 if(lastSeenEvent===null){lastSeenEvent=events.at(-1)?.id||0;return}
 for(const event of events.filter(x=>x.id>lastSeenEvent)){
  if(event.type==='search-empty'&&event.player===player.id)toast('🔎 Search complete: nothing found.');
  if(event.type==='loot-found'&&event.player===player.id)toast('🎁 Found '+event.item+'!');
  if(event.type==='level-up'&&event.player===player.id)showNotice('LEVEL '+event.level+'!','HP +'+event.hpGain+' → '+event.hp+' · Attack +'+event.attackGain+' → D'+event.attack+' · Armour +'+event.armourGain+' → D'+event.armour,'level');
  if(event.type==='room-cleared'&&event.room===player.room)toast(event.name+' cleared!');
  if(event.type==='boss-wave'&&event.room===player.room)showNotice('SECOND WAVE!','A new boss emerges from the excavation. The battle is not over!','down');
  if(event.type==='quest-complete'&&event.room===player.room)showNotice('QUEST '+event.quest+' COMPLETE!','Boss defeated · '+(event.next?'Quest '+event.next+' unlocked!':'The next adventure awaits.')+' Head to the east exit.','quest');
  if(event.type==='rare-find'&&event.player===player.id)showNotice(event.rarity.toUpperCase()+' TREASURE!',event.item,'treasure');
  if(event.type==='return-camp'&&event.players?.includes(player.id))showNotice('WELCOME BACK!','Quest '+event.quest+' finished · merchant and new quests available at camp.','quest');
  if(event.type==='death'&&event.player===player.id)showNotice('DEFEATED','Returned to Level '+event.level+' · Lost '+event.goldLost+' gold'+(event.lost?' and '+event.lost:'')+'. Your journey continues.','down');
  if(event.type==='downed'&&event.player===player.id)showNotice('YOU ARE DOWN!','A teammate has three rounds to revive you.','down');
 }
 lastSeenEvent=events.at(-1)?.id||lastSeenEvent;
}
function setConnection(text,ok){connected=ok;$('connectionText').textContent=text;$('connectionDot').classList.toggle('online',ok)}
function toast(text){const el=$('toast');el.textContent=text;el.style.display='block';clearTimeout(errorTimer);errorTimer=setTimeout(()=>el.style.display='none',3200)}
function send(packet){if(socket?.readyState!==WebSocket.OPEN){toast('Reconnecting… please wait.');return}socket.send(JSON.stringify(packet))}
function requestMove(dir){
  if(!state||!me)return toast('Waiting for the game to connect.');
  const b=state.rooms[me.room].battle;
  if(me.hp<=0)return toast('You are down. Wait for a teammate to revive you.');
  if(state.turn?.activePlayer!==me.id)return toast('Waiting for '+(state.players[state.turn?.activePlayer]?.name||'the next player')+' to end their turn.');
  if(b.status==='active'){
    if(b.actions[me.id])return toast('Your action is queued. Press End Turn to continue.');
    // All players obey the same global turn; local room-entry eligibility cannot block the current actor.
  }
  if((me.moveRemaining||0)<=0)return toast('Roll your D6 movement first.');
  send({type:'move',dir});
}
const doorPanel=document.createElement('div');
doorPanel.id='doorControls';
doorPanel.style.cssText='margin:8px 0;font:600 14px system-ui;color:#f1d99b;min-height:24px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';
const turnStrip=document.createElement('div');turnStrip.id='globalTurnStrip';turnStrip.setAttribute('aria-live','polite');
document.querySelector('#turnStatusPanel')?.append(turnStrip);
const controlRow=document.querySelector('.controls');
controlRow?.insertAdjacentElement('afterend',doorPanel);
function updateDoorControls(){
  if(!state||!me)return;
  const room=roomDef(me.room);
  const b=state.rooms[me.room].battle;
  const {width}=roomSize(me.room),centre=doorRow(me.room);
  doorPanel.replaceChildren();
  if(me.room==='camp'){doorPanel.textContent='🏕 Camp: open Quests to choose an adventure, or tap View Merchant to buy potions and gear.';return;}
  if(state.turn?.activePlayer!==me.id){
    doorPanel.textContent='⌛ Waiting for '+(state.players[state.turn?.activePlayer]?.name||'the next player')+' to end their turn.';
    return;
  }
  if(b.status==='active'){
    doorPanel.textContent='⭐ YOUR TURN · Roll once, move, choose an action, then END TURN.';
    return;
  }
  if(room.final&&b.status==='cleared'){
    const exit=document.createElement('button');exit.textContent='🏁 Finish quest → Camp';exit.disabled=(Math.abs(me.x-(width-1))+Math.abs(me.y-centre)>1)||!connected;
    exit.title='Stand next to the right-side doorway to leave.';
    exit.addEventListener('click',()=>send({type:'finish-quest'}));doorPanel.append(exit);
    if(Math.abs(me.x-(width-1))+Math.abs(me.y-centre)>1)doorPanel.append(document.createTextNode('Stand next to the east exit to finish.'));
  }
  for(const [dir,label,edge,next] of [['W','⇦ Enter west door',0,room.left],['E','Enter east door ⇨',width-1,room.right]]){
    if(!next)continue;
    if(me.x===edge&&me.y===centre){
      const btn=document.createElement('button');btn.type='button';btn.textContent=label;
      btn.style.cssText='background:#d5b976;color:#1b2835;border:0;border-radius:8px;padding:10px;cursor:pointer;font-weight:700;';
      btn.addEventListener('click',()=>requestMove(dir));doorPanel.append(btn);
    }
  }
  if(!doorPanel.hasChildNodes())doorPanel.textContent='Doors: stand on the middle square of the east/west wall, then press its arrow.';
}
// Dedicated doorway arrows live immediately beside the map's exits.
// They call the same requestMove as the D-pad, so movement and global turns
// remain fully server-authoritative. Never bypass dice, collisions or turn locks.
const portalArrows={};
for(const dir of ['W','E']){
 const btn=document.createElement('button');
 btn.type='button';btn.className='portal-arrow portal-'+(dir==='W'?'west':'east');
 btn.textContent=dir==='W'?'❮':'❯';btn.hidden=true;btn.disabled=true;
 btn.setAttribute('aria-label',dir==='W'?'Use west doorway':'Use east doorway');
 btn.addEventListener('click',()=>requestMove(dir));
 $('canvasWrap').append(btn);portalArrows[dir]=btn;
}
function positionPortalArrows(projection,width,height){
 if(!state||!me)return;
 const definition=roomDef(me.room);
 const battle=state.rooms[me.room]?.battle;
 const canFinish=!!(definition.final&&battle?.status==='cleared');
 const exits={W:!!definition.left,E:!!definition.right||canFinish};
 const turn=state.turn||{};
 const canMove=connected&&me.hp>0&&turn.activePlayer===me.id&&
  me.lastRolledTurn===turn.round&&me.moveRemaining>0&&battle?.status!=='active';
 for(const dir of ['W','E']){
  const btn=portalArrows[dir];btn.hidden=!exits[dir];if(!exits[dir])continue;
  const west=dir==='W',p=projection.at(west?0:roomSize(me.room).width-1,doorRow(me.room));
  // Keep arrows beside the edge doorway, not over the player or their D-pad.
  const size=btn.offsetWidth||40;
  const offset=Math.max(22,projection.iso?projection.cell*.9:projection.cell*.70);
  const centre=p.x+(west?-offset:offset);
  const left=Math.max(3,Math.min(width-size-3,centre-size/2));
  const top=Math.max(3,Math.min(height-size-3,p.y-size/2));
  btn.style.left=left+'px';btn.style.top=top+'px';
  btn.disabled=!canMove||me.y!==doorRow(me.room)||me.x!==(west?0:roomSize(me.room).width-1);
  btn.title=btn.disabled?'Stand on the doorway square at the middle of the '+(west?'west':'east')+' wall, roll D6 and wait for your turn.':west?'Enter the west doorway':canFinish?'Finish quest and return to camp':'Enter the east doorway';
 }
}
function seatSelector(){
 const bar=$('localSeats');bar.hidden=!localMode;if(!localMode)return;
 const container=$('seatButtons');container.replaceChildren();
 for(const [i,id] of seatIds.entries()){
  const character=seatStates[id]?.players?.[id];
  const b=document.createElement('button');b.type='button';b.className='seat-button'+(activeSeat===id?' selected':'')+(!character?.nameConfirmed?' needs-setup':'');
  b.textContent=character?.nameConfirmed?character.name:`Player ${i+1}`;
  b.addEventListener('click',()=>selectSeat(id,{manual:true}));container.append(b);
 }
}
function selectSeat(id,{manual=false}={}){
 if(!seatIds.includes(id))return;
 if(manual){pendingLocalEndTurn=null;pendingLocalCharacterSetup=null;}
 activeSeat=id;socket=seatSockets[id];state=seatStates[id]||null;me=state?.players?.[state.me]||null;
 selectedEnemyId=null;lastSeenEvent=null;setupSeat=null;
 chatData=seatChats[id]||{messages:[],muted:[],reports:[],adminMuted:false,playersMuted:[]};
 setConnection(socket?.readyState===WebSocket.OPEN?'Local player '+(seatIds.indexOf(id)+1)+' ready':'Connecting local player…',socket?.readyState===WebSocket.OPEN);
 seatSelector();if(state&&me){syncUI();renderChatControls();renderChat()}
}
function connectSeat(id){
 if(authClosed)return;
 const u=new URL(ROOT+'/api/ws',location.origin);u.protocol=location.protocol==='https:'?'wss:':'ws:';
 if(trial)u.searchParams.set('trial','balance-v9');u.searchParams.set('mode',localMode?'local':'online');
 if(localMode)u.searchParams.set('seat',id);
 const ws=new WebSocket(u);seatSockets[id]=ws;
 if(!localMode||activeSeat===id)socket=ws;
 ws.onopen=()=>{if(!localMode||activeSeat===id)setConnection(localMode?'Local player ready':'Live · shared online adventure',true)};
 ws.onmessage=ev=>{
  let msg;try{msg=JSON.parse(ev.data)}catch{return}
  if(msg.type==='state'){
   seatStates[id]=msg.state;
   if(!localMode||activeSeat===id){state=msg.state;me=state.players[state.me];if(me)consumeEvents(state,me);syncUI();renderChatControls()}
   seatSelector();
   // After creating a character, offer the next unconfigured local seat.
   // Only advance on the confirmed server snapshot, not just form submission.
   if(localMode&&pendingLocalCharacterSetup){
     const savedSeat=pendingLocalCharacterSetup;
     // A second seat may connect *after* the character save acknowledgement.
     // Re-check on each seat's state, but only after the saved seat is confirmed.
     if(seatStates[savedSeat]?.players?.[savedSeat]?.nameConfirmed){
       const next=seatIds.find(candidate=>candidate!==savedSeat&&seatStates[candidate]?.players?.[candidate]&&!seatStates[candidate].players[candidate].nameConfirmed);
       if(next&&seatSockets[next]?.readyState===WebSocket.OPEN){
         pendingLocalCharacterSetup=null;selectSeat(next);
       }else if(seatIds.every(candidate=>seatStates[candidate]?.players?.[candidate]?.nameConfirmed))pendingLocalCharacterSetup=null;
     }
   }
   // Switch the shared screen only after the authoritative server state says
   // which local seat now owns the turn. Do not switch just on button click:
   // an invalid/unreceived End Turn must leave the same player selected.
   if(localMode&&pendingLocalEndTurn){
     const handoff=localTurnHandoff(pendingLocalEndTurn,id,msg.state,seatIds);
     if(handoff.status==='switch'){
       const next=handoff.seat;
       if(seatSockets[next]?.readyState===WebSocket.OPEN){
         pendingLocalEndTurn=null;selectSeat(next);
       }
     }else if(handoff.status==='finished')pendingLocalEndTurn=null;
   }
  }else if(msg.type==='chat-state'){
    seatChats[id]=msg;if(!localMode||activeSeat===id){chatData=msg;renderChat()}
  }else if(msg.type==='error'&&(!localMode||activeSeat===id)){
    if(localMode&&pendingLocalEndTurn?.actor===id)pendingLocalEndTurn=null;
    if(localMode&&pendingLocalCharacterSetup===id)pendingLocalCharacterSetup=null;
    const err=$('setupError');if(!($('characterOverlay').hidden)){err.textContent=msg.message;err.hidden=false}
    else toast(msg.message);
  }
 };
 ws.onclose=e=>{
  if(localMode&&pendingLocalEndTurn?.actor===id)pendingLocalEndTurn=null;
  if(!localMode||activeSeat===id)setConnection('Disconnected · reconnecting',false);
  if(e.code===4000){if(!localMode)authClosed=true;if(!localMode||activeSeat===id)toast('This seat opened on another device.');return}
  setTimeout(()=>connectSeat(id),2200);
 };
 ws.onerror=()=>{if(!localMode||activeSeat===id)setConnection('Connection interrupted',false)};
}
function connect(){
 seatSelector();for(const seat of seatIds)connectSeat(seat);
}
function updateCharacterSetup(){
 if(!me)return;
 const overlay=$('characterOverlay'),needed=!me.nameConfirmed||!me.classChosen;
 overlay.hidden=!needed;
 if(!needed){setupSeat=null;return}
 if(setupSeat!==me.id){
  setupSeat=me.id;$('setupError').hidden=true;$('characterName').value=me.nameConfirmed?me.name:'';
  $('characterClass').value=me.klass||'knight';
  updateClassPiecePreview();
  $('characterClass').disabled=!!me.classChosen;
  $('characterName').disabled=!!me.nameConfirmed;
  $('characterName').placeholder=localMode?'Name for Player '+(seatIds.indexOf(me.id)+1):'Name your adventurer';
 }
}
function updateClassPiecePreview(){
  const klass=$('characterClass').value;
  $('classPreview').src=paths[klass]||paths.knight;
  $('classPreview').alt=(klass.charAt(0).toUpperCase()+klass.slice(1))+' class game piece';
}
$('characterClass').addEventListener('change',updateClassPiecePreview);
$('characterForm').addEventListener('submit',event=>{
 event.preventDefault();if(!me)return;
 $('setupError').hidden=true;
 if(localMode)pendingLocalCharacterSetup=activeSeat;
 send({type:'character-create',name:$('characterName').value,klass:$('characterClass').value});
});
function el(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e}
function syncUI(){if(!state||!me)return;
  updateCharacterSetup();
  // Prominent fixed-order turn strip visible even when no enemies are present.
  const turn=state.turn||{};turnStrip.replaceChildren();
  turnStrip.append(el('strong','turn-heading','GLOBAL ROUND '+(turn.round||1)+' · '));
  for(const [i,id] of ['one','two','three','four'].entries()){
    const player=state.players[id];if(!player)continue;
    const label=turn.ended?.[id]?'DONE':!player.connected?'OFFLINE':turn.activePlayer===id?'NOW':'WAITING';
    const cell=el('span','turn-step '+(label==='NOW'?'now':label==='DONE'?'done':'waiting'),`P${i+1} ${player.name}: ${label}`);
    turnStrip.append(cell);
  }
  turnStrip.append(el('span','turn-enemies','→ Enemies move / attack after everybody ends their turn'));

  const room=roomDef(me.room),battle=state.rooms[me.room].battle;
  if(!battle.enemies.some(e=>e.id===selectedEnemyId&&e.hp>0))selectedEnemyId=null;
  $('roomName').textContent=room.name;
  let tactical=$('roomChallenge');
  if(!tactical){tactical=document.createElement('p');tactical.id='roomChallenge';tactical.className='room-challenge';$('roomSub').after(tactical)}
  tactical.hidden=!room.challenge;
  const nextHazardPhase=((battle.enemyPhases||0)+1+(room.hazardPhaseOffset||0))%3;
  const hazardWarning=room.hazard?(room.hazard==='chaos'||room.hazard==='storm'?nextHazardPhase===0:room.hazard==='darkness'?nextHazardPhase===0:nextHazardPhase!==0)?(room.hazard==='storm'?' · 🌪 WIND NEXT ENEMY PHASE':room.hazard==='darkness'?' · 🌑 SHADOW STRIKE NEXT PHASE':' · ⚠ DANGER ON NEXT ENEMY PHASE'):' · Hazard rests this phase':'';
  tactical.textContent=room.challenge?'⚑ ROOM CHALLENGE · '+room.challenge+hazardWarning:'';
  $('currentQuestLabel').textContent=me.room==='camp'?'CAMP · BETWEEN QUESTS':`QUEST ${room.quest||1} · ${(campaign?.quests?.find(q=>q.number===(room.quest||1))?.name||'ADVENTURE').toUpperCase()}`;
  $('roomSub').textContent=me.room==='camp'?'ADVENTURERS’ CAMP · Merchant, quests and resting place':
    `QUEST ${room.quest||1} · ${room.challenge||room.subtitle||'Explore the adventure'}${room.quest>=5?' · '+roomSize(me.room).width+'×'+roomSize(me.room).height+' maze · '+battle.enemies.filter(e=>e.hp>0).length+' foes remaining':''}`;
  const help=document.querySelector('.canvas-help');
  if(help)help.textContent=room.quest>=5?roomSize(me.room).width+'×'+roomSize(me.room).height+' maze · S Swift · R Ranged · A Armoured · Z Zombie · G Ghost · T Teleporter · C Cloner · H Healer · N Ninja · Tap a foe to target':'Arrow keys or touch pad to move · Tap a foe to target';
  const list=$('people');list.replaceChildren();
  for(const p of Object.values(state.players)){
    const wrap=el('div','player'+(p.id===state.me?' me':''));const pic=el('img','portrait');pic.src=paths[p.klass]||paths.knight;pic.alt=({knight:'Armoured knight',outlaw:'Outlaw scout',warlock:'Warlock arcane caster',tinker:'Tinker field inventor'}[p.klass]||'Adventurer');wrap.append(pic);
    const d=el('div','player-details');const name=el('div','player-name',p.name+(p.id===state.me?' (you)':''));d.append(name);
    d.append(el('div','player-place',(p.connected?'● ':'○ ')+roomDef(p.room).name));
    const bar=el('div','hpbar'),fill=el('div','hpfill');fill.style.width=Math.max(0,100*p.hp/p.maxHp)+'%';bar.append(fill);d.append(bar);
    d.append(el('div','player-stats',`${p.hp}/${p.maxHp} HP · ${({knight:'Knight',outlaw:'Outlaw',warlock:'Warlock',tinker:'Tinker'}[p.klass]||'Adventurer')}${p.hp===0?' · DOWNED':''}`));wrap.append(d);list.append(wrap);
  }
  const map=$('roomMap');map.replaceChildren();for(const id of Object.keys(state.rooms).filter(id=>roomDef(id).quest===(room.quest||1))){
    const row=el('div','roomlink'+(state.rooms[id].discovered?' seen':'')+(me.room===id?' active':''));
    row.textContent=(state.rooms[id].discovered?'◈ ':'◇ ')+(state.rooms[id].discovered?roomDef(id).name:'Undiscovered room')+' · '+Object.values(state.players).filter(p=>p.room===id).length+' player(s)';map.append(row);
  }
  const battleStatus=$('battleStatus');const foes=$('enemies');foes.replaceChildren();
  if(battle.status==='active'){
    const acting=Object.values(state.players).filter(p=>p.connected&&p.hp>0);
    battleStatus.textContent=`GLOBAL ROUND ${state.turn.round} · ${state.players[state.turn.activePlayer]?.name||'Enemy phase'} acting · ${acting.map(p=>`${p.name}: ${state.turn.ended?.[p.id]?'DONE':state.turn.activePlayer===p.id?'ACTING':'WAITING'}`).join(' · ')}`;
    for(const e of battle.enemies){
      const btn=el('button','enemy target-choice'+(selectedEnemyId===e.id?' selected':''));btn.type='button';btn.disabled=e.hp<=0;
      btn.setAttribute('aria-pressed',String(selectedEnemyId===e.id));
      const portrait=el('img');portrait.src=paths.d8;portrait.alt='Original DICEBOUND enemy artwork';btn.append(portrait);
      const detail=el('div');detail.append(el('strong','',e.name),el('div','',`${e.hp}/${e.maxHp} HP`),el('small','',e.hp<=0?'Defeated':selectedEnemyId===e.id?'✓ TARGET SELECTED':'Tap to target · Attack D'+e.atk+' · Defence D'+(e.armourDie||4)));btn.append(detail);
      btn.addEventListener('click',()=>{selectedEnemyId=selectedEnemyId===e.id?null:e.id;syncUI()});foes.append(btn);
    }
  }else battleStatus.textContent=battle.status==='cleared'?'✓ Room cleared':battle.status==='dormant'?'⚠ Enter to awaken enemies':'No enemies here';
  const history=$('log');history.replaceChildren();for(const e of [...state.log].reverse())history.append(el('div','logentry',e.text));
  const active=battle.status==='active';const submitted=!!battle.actions[me.id];
  // There is ONE global turn sequence; entering an already active battle must
  // not hide/disable the current actor's movement, attack or End Turn buttons.
  const myTurn=state.turn?.activePlayer===me.id;const rolled=me.lastRolledTurn===state.turn?.round;
  $('endTurnBtn').disabled=!connected||!myTurn||!rolled||me.hp<=0;
  $('endTurnQuickBtn').disabled=$('endTurnBtn').disabled;
  $('endTurnBtn').textContent=myTurn?(submitted?'✓ END TURN · Resolve action':'✓ END TURN · Next player'):'⌛ Waiting';
  $('endTurnQuickBtn').textContent=myTurn?'✓ END TURN (E)':'⌛ WAITING';
  $('returnCampBtn').disabled=!connected||active||me.hp<=0||state.turn?.activePlayer!==me.id;
  $('returnCampBtn').textContent=me.room==='camp'?'🪙 View Merchant ↓':'🏕 Camp / Shop';
  $('returnCampBtn').title=active?'Finish the encounter first':me.room==='camp'?'Scroll to the merchant below':'Visit the merchant independently, without moving teammates';
  const lastQuest=me.lastCampQuest,bookmark=me.questBookmarks?.[lastQuest];
  $('resumeQuestBtn').hidden=!(me.room==='camp'&&bookmark);
  $('resumeQuestBtn').disabled=!connected||state.turn?.activePlayer!==me.id||me.hp<=0;
  if(bookmark)$('resumeQuestBtn').textContent='↩ Return to '+(roomDef(bookmark.room)?.name||'quest');
  for(const name of ['attackBtn','defendBtn','reviveBtn'])$(name).disabled=!connected||!active||submitted||!myTurn||!rolled||me.hp<=0;
  const adjacentNest=(battle.nests||[]).find(n=>n.active&&Math.abs(n.x-me.x)+Math.abs(n.y-me.y)===1);
  $('nestBtn').hidden=room.quest!==9||battle.status!=='active';
  $('nestBtn').disabled=!adjacentNest||!connected||submitted||!myTurn||!rolled||me.hp<=0;
  $('nestBtn').textContent=adjacentNest?'💠 Disable Nest · N':'💠 Stand Beside Nest';
  const lanterns=state.roomLanterns?.[me.room]||[];
  const availableLantern=lanterns.findIndex(([x,y],i)=>!(battle.litLanterns||[]).includes(i)&&Math.abs(x-me.x)+Math.abs(y-me.y)<=1);
  $('lanternBtn').hidden=room.quest!==14||battle.status!=='active';
  $('lanternBtn').disabled=availableLantern<0||!connected||submitted||!myTurn||!rolled||me.hp<=0;
  $('lanternBtn').textContent=availableLantern>=0?'🏮 Light Lantern · Items':'🏮 Approach an Unlit Lantern';
  const stat=me.combatStats||{};
  const main=me.inventory?.equipment?.find(item=>item.id===me.equipped?.weapon);
  const special=stat.special;
  const last=main&&me.specialUsedAt?.[main.id];
  const cooling=last===undefined||!special?0:Math.max(0,last+special.cooldown-(me.combatTurns||0));
  $('specialBtn').disabled=!connected||!active||submitted||!myTurn||!rolled||me.hp<=0||!special||cooling>0;
  $('specialBtn').textContent=special?`★ Special (S)${cooling?' · '+cooling+' turn(s)':''}`:'★ Special (S)';
  $('specialBtn').title=special?`${main?.rarity} ${main?.category} special`:'Requires a qualifying equipped weapon';
  $('attackBtn').textContent=stat.category==='Mace'?'⚒ Sweep (A)':stat.multishot?'🏹 Multishot (A)':'⚔ Attack (A)';
  $('selectedTarget').textContent=selectedEnemyId?`Target: ${battle.enemies.find(e=>e.id===selectedEnemyId)?.name||'nearest'} · tap again to clear`:'Target: nearest enemy · tap a foe to choose';
  const canPotion=!!me.inventory?.potions?.some(x=>x.charges>0);
  const ally=Object.values(state.players).find(p=>p.id!==me.id&&p.connected&&p.room===me.room&&p.hp>0&&p.hp<p.maxHp&&Math.abs(p.x-me.x)+Math.abs(p.y-me.y)===1);
  $('potionBtn').disabled=!connected||me.hp<=0||me.hp>=me.maxHp||!canPotion||!myTurn||!rolled||(active&&submitted);
  $('potionAllyBtn').disabled=!connected||me.hp<=0||!ally||!canPotion||!myTurn||!rolled||(active&&submitted);
  $('potionAllyBtn').title=ally?`Heal ${ally.name}`:'Stand next to an injured teammate to heal them';
  for(const btn of document.querySelectorAll('[data-dir]'))btn.disabled=!connected||me.hp<=0||!myTurn||!rolled||(active&&submitted);
  const chosen=battle.actions[me.id];
  const waitingFor=state.players[state.turn?.activePlayer]?.name||'another player';
  $('actionHint').textContent=!myTurn?'⌛ WAITING FOR '+waitingFor.toUpperCase()+' — their End Turn unlocks your dice roll.':
    !rolled?'⭐ YOUR TURN: roll your movement D6 once to begin.':
    active?(chosen?'Your '+chosen.type+' is queued. Press END TURN to resolve it.':'Move up to your D6 roll, choose ONE combat action (optional), then END TURN.'): 
    'Move up to your D6 roll, search or explore if you wish, then END TURN. All players go before any enemies.';
  updateDoorControls();
  updateHeroHud();
  updateLootPanel();updateShopPanel();updateQuestRewards();updateCombatItemsPanel();updateMazeUI();updateMoveControls();
  if(!$('questOverlay').hidden)renderCampaign();
  requestAnimationFrame(render);
}
function updateMoveControls(){
 const remaining=me?.moveRemaining||0;
 const global=state?.turn||{};
 const myTurn=global.activePlayer===me?.id;
 const rolled=me?.lastRolledTurn===global.round;
 const b=state?.rooms[me?.room]?.battle;
 $('moveCounter').textContent=rolled?`🎲 ${remaining} step${remaining===1?'':'s'} left`:'🎲 Roll once this turn';
 $('rollMoveBtn').disabled=!connected||me.hp<=0||!myTurn||rolled;
 $('rollMoveBtn').textContent=rolled?'🎲 D6 · '+remaining+' steps':'🎲 Roll movement D6';
}
function updateQuestRewards(){
 const panel=$('questRewardPanel'),offers=Object.values(state?.questRewardOffers||{});
 panel.hidden=!offers.length;if(panel.hidden)return;
 const area=$('questRewardChoices');area.replaceChildren();
 for(const offer of offers){
   area.append(el('p','',`Quest ${offer.quest} · ${offer.rarity} equipment reward · choose one:`));
   for(const category of ['Sword','Bow','Mace','Staff','Armour']){
     const btn=el('button','bag-action',category);btn.type='button';
     btn.disabled=!connected||state.turn?.activePlayer!==me.id;
     btn.addEventListener('click',()=>send({type:'claim-quest-reward',quest:offer.quest,category}));area.append(btn);
   }
 }
}
function updateShopPanel(){
 const panel=$('merchantPanel');panel.hidden=me.room!=='camp';
 if(panel.hidden)return;
 const stock=$('merchantStock');stock.replaceChildren();
 for(const item of state.shopStock||[]){
   if((item.unlock||1)>(state.unlockedQuest||1))continue;
   const row=el('div','shop-item');row.append(el('span','',item.name+' · '+item.cost+' gold'));
   const button=el('button','bag-action','Buy');button.disabled=!connected||state.turn?.activePlayer!==me.id||(me.gold||0)<item.cost;
   button.addEventListener('click',()=>send({type:'shop-buy',sku:item.sku}));row.append(button);stock.append(row);
 }
 const sell=$('merchantSell');sell.replaceChildren();
 let count=0;
 for(const kind of ['equipment','potions','enchantments','consumables'])for(const item of me.inventory?.[kind]||[]){
   const price=merchantResaleValue(item);
   if(price<=0)continue;
   count++;
   const row=el('div','shop-item');
   const equippedSlot=Object.entries(me.equipped||{}).find(([,value])=>value===item.id)?.[0];
   row.append(el('span','',`${item.name} · ${price} gold${equippedSlot?' · EQUIPPED':''}${item.kind==='potion'?' · 1 use':''}`));
   const button=el('button','bag-action','Sell');button.disabled=!connected||state.turn?.activePlayer!==me.id;
   button.addEventListener('click',()=>{
      const warning=item.enchantments?.length?' Bound enchantments are lost with this item.':'';
      if(confirm(`Sell ${item.name} for ${price} gold?${warning} This cannot be undone.`))send({type:'shop-sell',kind,itemId:item.id});
   });
   row.append(button);sell.append(row);
 }
 if(!count)sell.append(el('p','muted','No sellable items. Training-only equipment has no resale value.'));
}
const CONSUMABLE_LABELS={
 'blast-bomb':['💣 Blast Bomb','Ranged blast, within 3 tiles; walls block the blast.'],
 'meteor-scroll':['☄️ Meteor Scroll','Light damage to every living enemy in this room.'],
 'guardian-ward':['🔰 Guardian Tonic','Restore 35% max HP and block next enemy strike.'],
 'super-potion':['⚡ Superstrength','Double attack and armour dice until leaving this room.']
};
function updateCombatItemsPanel(){
 const list=$('combatItemsList');if(!list||!state||!me)return;
 const battle=state.rooms[me.room]?.battle;
 const active=battle?.status==='active';const submitted=!!battle?.actions?.[me.id];
 const allowed=connected&&active&&!submitted&&me.hp>0&&state.turn?.activePlayer===me.id&&me.lastRolledTurn===state.turn?.round;
 list.replaceChildren();
 for(const [sku,[label,description]] of Object.entries(CONSUMABLE_LABELS)){
   const quantity=(me.inventory?.consumables||[]).filter(x=>x.sku===sku&&x.charges>0).length;
   const row=el('div','supply-item');
   const note=el('div','supply-text');note.append(el('strong','',`${label} · ${quantity}`),el('small','',description));
   const btn=el('button','bag-action','Use');btn.type='button';btn.disabled=!allowed||quantity<1;
   btn.title=!active?'Enter combat to use this item':quantity<1?'Purchase at camp':'Queues your single combat action for this turn';
   btn.addEventListener('click',()=>send({type:'action',action:{type:'item',sku}}));
   row.append(note,btn);list.append(row);
 }
}
function merchantResaleValue(item){
 if(!item||item.training)return 0;
 const stock=(state.shopStock||[]).find(s=>s.kind==='equipment'&&s.category===item.category&&s.rarity===item.rarity);
 const fallback={Sword:{Legendary:400,Mythic:900,Exotic:3000},Mace:{Legendary:500,Mythic:1200,Exotic:4000},Bow:{Rare:170,Legendary:400,Mythic:900,Exotic:3000},Armour:{Rare:170,Legendary:400,Mythic:900,Exotic:3000}};
 if(item.kind==='equipment')return Math.floor((stock?.cost||fallback[item.category]?.[item.rarity]||0)*.5);
 if(item.kind==='potion')return Math.floor(Math.max(0,item.charges||0)*5);
 if(item.kind==='consumable')return Math.floor(((state.shopStock||[]).find(x=>x.sku===item.sku)?.cost||({ 'blast-bomb':45,'meteor-scroll':120,'guardian-ward':35,'super-potion':150}[item.sku]||0))*.5);
 if(item.kind==='enchantment')return Math.floor((20+10*Math.max(1,Math.min(5,item.level||1)))*.5);
 return 0;
}
/** Display the server's current enchantment rules, not invented bonuses. */
function enchantmentDescription(enchant){
  if(!enchant)return 'Unknown enchantment';
  const level=Math.max(1,Math.min(5,Math.floor(Number(enchant.level)||1)));
  switch(enchant.school){
    case 'Sharpness':return `Weapon only · raises the attack die maximum by +${level*3} (+3 per enchantment level).`;
    case 'Fortification':return `Armour only · raises the armour die maximum by +${level*2} (+2 per enchantment level).`;
    case 'Multishot':return `Main-hand bow only · a normal shot can strike up to ${level} aligned enem${level===1?'y':'ies'} along a straight row/column, within bow range. No extra shots if no other targets are lined up.`;
    default:return 'No effect description is available for this enchantment.';
  }
}
const LEVEL_CAP=30;
function xpTarget(level){return level>=LEVEL_CAP?0:Math.ceil(100*Math.pow(1.4,Math.max(0,level-1)))}
function currentCombatStats(p){
  const base=({knight:{attack:12,armour:8},outlaw:{attack:14,armour:6},warlock:{attack:16,armour:4},tinker:{attack:10,armour:10}}[p.klass]||{attack:12,armour:8});
  const multiplier=Math.pow(1.2,Math.max(0,(p.level||1)-1));
  return {attack:Math.round(base.attack*multiplier),armour:Math.round(base.armour*multiplier)};
}

function updateClassSelection(){
 const panel=$('classSelectPanel');if(!panel||!me)return;
 panel.hidden=true;return; // Character setup now occurs in the pre-adventure overlay.
 panel.hidden=!!me.classChosen;
 if(panel.hidden)return;
 const safe=!me.mazeSlot&&['camp','woodland'].includes(me.room)&&state.rooms?.[me.room]?.battle?.status!=='active';
 $('classChoiceNote').textContent=safe
   ?'Choose a permanent class. Existing XP, coins, equipment and progress are retained. You receive a simple starter weapon.'
   :'Choose your class when you return to camp. Your existing character and gear are safe.';
 const choices=$('classChoices');choices.replaceChildren();
 for(const c of [
  {id:'knight',name:'🛡 Knight',detail:'50 HP · D12 attack · D8 armour · +25% equipment finds · 25% off Maces/Plate · Mace +D2, Plate +D2 defence'},
  {id:'outlaw',name:'🏹 Outlaw',detail:'44 HP · D14 attack · D6 armour · +25% gold · 25% off Swords/Shields · Sword +D2, Shield +D2 defence'},
  {id:'warlock',name:'🔮 Warlock',detail:'40 HP · D16 attack · D4 armour · +25% potion finds · 25% off Staffs/Wards · Staff +D4'},
  {id:'tinker',name:'⚙ Tinker',detail:'48 HP · D10 attack · D10 armour · +25% enchantment finds · 25% off combat supplies · Bomb/Meteor +D4'}
 ]){
  const b=el('button','class-choice',c.name+' · '+c.detail);b.type='button';b.disabled=!safe||!connected;
  b.addEventListener('click',()=>{if(confirm(`Choose ${c.name.replace(/^.. /,'')} permanently? Your current gear and progress will be kept.`))send({type:'class-select',klass:c.id})});choices.append(b);
 }
}

function updateHeroHud(){
  if(!me)return;
  const level=me.level||1,required=xpTarget(level),xp=Math.max(0,me.xp||0);
  // Server computes the stats; this panel must not assume equipment bonuses.
  const stats=me.combatStats||currentCombatStats(me);
  const potions=(me.inventory?.potions||[]);
  const charges=potions.reduce((sum,item)=>sum+Math.max(0,item.charges||0),0);
  updateClassSelection();
  $('heroName').textContent=me.name;
  $('heroPortrait').src=paths[me.klass]||paths.knight;
  $('heroPortrait').alt=({knight:'Knight',outlaw:'Outlaw',warlock:'Warlock',tinker:'Tinker'}[me.klass]||'Adventurer')+' class piece';
  $('heroClass').textContent=' · '+({knight:'Knight',outlaw:'Outlaw',warlock:'Warlock',tinker:'Tinker'}[me.klass]||'Adventurer')+(me.klass==='knight'?' · Mace/Plate +D2':me.klass==='outlaw'?' · Sword/Shield +D2':me.klass==='warlock'?' · Staff +D4':me.klass==='tinker'?' · Bomb/Meteor +D4':'');
  $('heroLevel').textContent=`Level ${level} / ${LEVEL_CAP}`;
  $('heroHp').textContent=`${me.hp} / ${me.maxHp} HP`;
  $('heroHpFill').style.width=`${Math.max(0,Math.min(100,100*me.hp/Math.max(1,me.maxHp)))}%`;
  $('heroXp').textContent=required?`${xp} / ${required} XP`:'MAX LEVEL';
  $('heroXpFill').style.width=required?`${Math.max(0,Math.min(100,100*xp/required))}%`:'100%';
  $('heroAttack').textContent=`D${stats.attack} + off D${stats.offhand||0}`;
  $('heroArmour').textContent=`D${stats.armour}`;
  $('heroPotions').textContent=potions.length?`${charges} use${charges===1?'':'s'}`:'0';
  $('heroGold').textContent=String(me.gold||0);
  const inv=me.inventory||{};
  const equipped=me.equipped||{};
  const gear=inv.equipment||[];
  const weapon=gear.find(item=>item.id===equipped.weapon);
  const offhand=gear.find(item=>item.id===equipped.offhand);
  const armour=gear.find(item=>item.id===equipped.armour);
  $('heroGearNote').textContent=`MAIN ${weapon?.name||'Unarmed'} (range ${stats.mainRange||1}) · OFF ${offhand?.name||'Empty'} (range ${stats.offhandRange||0}) · ARMOUR ${armour?.name||'None'} · Both hands roll only when in reach.${stats.multishot?' Multishot '+stats.multishot:''}`;
  const view=$('heroInventory');view.replaceChildren();
  const active=state?.rooms[me.room]?.battle?.status==='active';
  const allowGear=connected&&!active&&me.hp>0;
  const itemsSection=el('section','hero-bag-section');
  itemsSection.append(el('strong','',`⚔ Weapons & armour (${gear.length})`));
  for(const item of gear){
    const slots=item.category==='Armour'?['armour']:item.category==='Shield'?['offhand']:['weapon','offhand'];
    const currently=slots.find(slot=>equipped[slot]===item.id);
    const row=el('div','bag-item');
    const worn=currently=== 'weapon'?' · MAIN':currently==='offhand'?' · OFF':currently==='armour'?' · WORN':'';
    const detail=el('div','gear-description');
    detail.append(el('span','',`${item.name||'Unknown equipment'} · Bonus D${item.bonusDie||({Common:4,Uncommon:6,Rare:8,Legendary:12,Mythic:20,Exotic:30}[item.rarity]||4)}${worn}${item.enchantments?.length?' · ✦ '+item.enchantments.map(x=>x.name).join(', '):''}`));
    for(const enchant of item.enchantments||[])detail.append(el('small','enchant-effect',`✦ ${enchant.name}: ${enchantmentDescription(enchant)} · Permanently bound`));
    row.append(detail);
    for(const slot of slots){
      const isWorn=equipped[slot]===item.id;
      const label=slot==='weapon'?'Main':slot==='offhand'?'Off':'Armour';
      const btn=el('button','bag-action',isWorn?`Remove ${label}`:`Equip ${label}`);btn.type='button';
      btn.disabled=!allowGear||(!isWorn&&(item.level||1)>me.level);
      btn.title=(item.level||1)>me.level?'Actual character level too low':'';
      btn.addEventListener('click',()=>send(isWorn?{type:'unequip',slot}:{type:'equip',itemId:item.id,slot}));row.append(btn);
    }
    itemsSection.append(row);
  }
  if(!gear.length)itemsSection.append(el('p','hud-muted','No equipment collected yet.'));
  view.append(itemsSection);
  const potionSection=el('section','hero-bag-section');
  potionSection.append(el('strong','',`🧪 Healing potions (${(inv.potions||[]).length} single-use)`));
  if((inv.potions||[]).length){
    for(const pot of inv.potions){potionSection.append(el('div','bag-item',`${pot.name} · 1 use`))}
    potionSection.append(el('p','hud-muted','Use Heal Me or Heal Ally. Each use restores up to 30% max HP (lab value).'));
  }else potionSection.append(el('p','hud-muted','No healing potions collected.'));
  view.append(potionSection);
  const supplySection=el('section','hero-bag-section');
  supplySection.append(el('strong','','💣 Combat supplies ('+(inv.consumables||[]).length+' single-use)'));
  for(const item of inv.consumables||[])supplySection.append(el('div','bag-item',item.name+' · 1 use'));
  if(!(inv.consumables||[]).length)supplySection.append(el('p','hud-muted','No combat supplies. Visit the camp merchant.'));
  view.append(supplySection);
  const enchantSection=el('section','hero-bag-section');
  enchantSection.append(el('strong','',`✦ Unused enchantments (${(inv.enchantments||[]).length})`));
  for(const ench of inv.enchantments||[]){
    const row=el('div','bag-item');
    const detail=el('div','gear-description');
    detail.append(el('strong','',ench.name));
    detail.append(el('small','enchant-effect',enchantmentDescription(ench)));
    detail.append(el('small','enchant-warning','Binding is permanent. Only one of each enchantment school may be bound to an item.'));
    row.append(detail);
    const available=gear.filter(item=>ench.school==='Sharpness'?item.category!=='Armour':ench.school==='Fortification'?item.category==='Armour':ench.school==='Multishot'?item.category==='Bow':false);
    {
      const select=el('select','bag-select');select.setAttribute('aria-label',`Equipment for ${ench.name}`);
      const initial=el('option','',available.length?'Select item':'No compatible item');initial.value='';select.append(initial);
      for(const item of available.filter(item=>!item.enchantments?.some(x=>x.school===ench.school))){
        const option=el('option','',item.name);option.value=item.id;select.append(option);
      }
      const btn=el('button','bag-action','Bind permanently');btn.type='button';btn.disabled=!allowGear||!available.length;
      btn.addEventListener('click',()=>{if(!select.value)return toast('Choose a compatible item first.');if(!confirm(`Permanently bind ${ench.name} to this item? This cannot be undone.`))return;send({type:'bind-enchant',enchantId:ench.id,itemId:select.value})});
      row.append(select,btn);
    }
    enchantSection.append(row);
  }
  if(!(inv.enchantments||[]).length)enchantSection.append(el('p','hud-muted','No unused enchantments.'));
  view.append(enchantSection);

}
const TEST_PICKUPS=[['coin','🪙 Coin'],['potion','🧪 Potion'],['equipment','⚔ Weapon / Armour'],['enchantment','✦ Enchantment']];
function updateLootPanel(){
  if(!state||!me)return;
  const inv=me.inventory||{potions:[],equipment:[],enchantments:[]};
  const claimed=me.lootClaimed?.[me.room]||{};
  const panel=$('lootPanel');panel.replaceChildren();
  const battle=state.rooms[me.room].battle;
  for(const [slot,label] of TEST_PICKUPS){
    const btn=el('button','loot-claim',claimed[slot]?'✓ '+label+' · Searched':'Search '+label);
    btn.type='button';btn.disabled=!connected||!!claimed[slot]||battle.status==='active'||state.turn?.activePlayer!==me.id;
    btn.addEventListener('click',()=>send({type:'claim',slot}));panel.append(btn);
  }
  $('lootSummary').textContent=`Gold ${me.gold||0} · Equipment ${(inv.equipment||[]).length} · Potions ${(inv.potions||[]).length} · Enchantments ${(inv.enchantments||[]).length}`;
  $('lootPanel').title=me.room==='camp'?'No treasure in the camp.':battle.status==='active'?'Clear enemies to search.':'Each type can be searched once, with a 50% chance of nothing.';
  const last=(inv.equipment||[]).at(-1);const lastEn=(inv.enchantments||[]).at(-1);
  let items=$('lootRecent');
  if(!items){items=el('div','loot-recent');items.id='lootRecent';$('lootSummary').after(items)}
  items.textContent=[last?.name,lastEn?.name].filter(Boolean).join(' · ');
  const rack=$('trainingRackBtn');
  rack.hidden=!!state.balanceTrial;rack.disabled=!!state.balanceTrial||!connected||state.turn?.activePlayer!==me.id||me.trainingRackClaimed||me.room!=='woodland'||battle.status==='active'||me.hp<=0;
  rack.textContent=me.trainingRackClaimed?'✓ Training rack collected':me.room!=='woodland'?'🎯 Training rack (Woodland only)':'🎯 Claim training weapons (once)';
  const reset=$('resetLabBtn');reset.hidden=state.me!=='one';
}
function confirmLabReset(){
  if(state?.me!=='one')return;
  if(!confirm('RESET ALL 58 TEST ROOMS AND EVERY TEST CHARACTER? This discards XP, equipment, coins, potion charges, enchantments, quest unlocks and defeated enemies. This is irreversible.'))return;
  const typed=prompt('Type RESET to confirm this is the technical lab, not the real game:');
  if(typed!=='RESET')return toast('Reset cancelled.');
  send({type:'reset-lab'});
}
$('resetLabBtn').addEventListener('click',confirmLabReset);
$('trainingRackBtn').addEventListener('click',()=>send({type:'training-rack'}));
function rr(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke()}}
function gridProjection(w,h){
  const {width:cols,height:rows}=roomSize(me.room),centre=doorRow(me.room);
  if(view==='tactical'){
    const cell=Math.max(8,Math.min((w-20)/cols,(h-24)/rows,86));
    return {cell,originX:(w-cell*cols)/2,originY:(h-cell*rows)/2,
      at:(x,y)=>({x:(w-cell*cols)/2+(x+.5)*cell,y:(h-cell*rows)/2+(y+.5)*cell})};
  }
  const scale=Math.max(.12,Math.min((w-22)/((cols+rows)*RES.tx),(h-22)/((cols+rows)*RES.ty),1.65));
  const ox=w/2-(cols-rows)*RES.tx*scale/2,oy=h/2-(cols+rows)*RES.ty*scale/2;
  return {cell:RES.tx*scale,originX:ox,originY:oy,iso:true,scale,
    at:(x,y)=>({x:ox+((x+.5)-(y+.5))*RES.tx*scale,y:oy+((x+.5)+(y+.5))*RES.ty*scale})};
}
function sceneFloor(s){
  const even=(x,y)=>(x+y)%2===0;
  const {width:cols,height:rows}=roomSize(me.room),centre=doorRow(me.room);
  if(!s.iso){
    const cs=s.cell;
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const X=s.originX+x*cs,Y=s.originY+y*cs;
      const hazard=(state.roomHazards?.[me.room]||[]).some(([hx,hy])=>hx===x&&hy===y);
      ctx.fillStyle=even(x,y)?'#314858':'#253847';ctx.fillRect(X,Y,cs,cs);
      if(images.wallface?.complete&&images.wallface.naturalWidth){ctx.globalAlpha=.12;ctx.drawImage(images.wallface,X,Y,cs,cs);ctx.globalAlpha=1;}
      if(!(state.roomWalls?.[me.room]||[]).some(([wx,wy])=>wx===x&&wy===y)){
        const plan=roomDef(me.room).formation||'stagger';
        const accents={island:'#a6bfa0',ghost:'#8ed8d5',rush:'#c7a476',boss:'#cfaa78',archers:'#d3b883',shield:'#b8b8b7',flanks:'#bdb7a0',stagger:'#8cabb5',gate:'#b7a48b',centre:'#b6c49b',guard:'#b6baa8'};
        const step=plan==='rush'?3:plan==='ghost'?4:5;
        if((x*5+y*7+roomDef(me.room).name.length)%step===0){
          ctx.strokeStyle=(accents[plan]||'#aab8a9')+'45';ctx.lineWidth=Math.max(1,cs*.025);
          ctx.beginPath();ctx.moveTo(X+cs*.27,Y+cs*.50);ctx.lineTo(X+cs*.73,Y+cs*.50);ctx.stroke();
        }
      }
      if(hazard){ctx.fillStyle=roomDef(me.room).quest===10?'#be6ad070':roomDef(me.room).quest===13?'#e9dcb070':'#51b6dd70';ctx.fillRect(X+3,Y+3,cs-6,cs-6);ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(10,cs*.34)}px system-ui`;ctx.fillText(roomDef(me.room).quest===10?'⚡':roomDef(me.room).quest===13?'🌪':'≈',X+cs*.5,Y+cs*.7);}
      ctx.strokeStyle='#b9a16a50';ctx.lineWidth=1;ctx.strokeRect(X+.5,Y+.5,cs-1,cs-1);
      if((x===0||x===cols-1)&&(y===centre)){ctx.fillStyle='#cfb46e40';ctx.fillRect(X+2,Y+2,cs-4,cs-4)}
    }
    const left=roomDef(me.room).left,right=roomDef(me.room).right||(roomDef(me.room).final&&state.rooms[me.room].battle.status==='cleared'?'camp':null);
    ctx.strokeStyle='#cda970';ctx.lineWidth=4;const x=s.originX,y=s.originY,w=cols*cs,h=rows*cs;
    ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.moveTo(x,y+h);ctx.lineTo(x+w,y+h);
    ctx.moveTo(x,y);ctx.lineTo(x,y+centre*cs);ctx.moveTo(x,y+(centre+1)*cs);ctx.lineTo(x,y+h);
    ctx.moveTo(x+w,y);ctx.lineTo(x+w,y+centre*cs);ctx.moveTo(x+w,y+(centre+1)*cs);ctx.lineTo(x+w,y+h);ctx.stroke();
    ctx.font=`${Math.max(9,cs*.20)}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#edcf8e';
    if(left)ctx.fillText('WEST ⇦',x+cs*.80,y+(centre+.95)*cs);
    if(right)ctx.fillText('⇨ EAST',x+(cols-.85)*cs,y+(centre+.95)*cs);
  }else{
    for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
      const v=s.at(x,y),hw=RES.tx*s.scale,hh=RES.ty*s.scale;
      ctx.beginPath();ctx.moveTo(v.x,v.y-hh);ctx.lineTo(v.x+hw,v.y);ctx.lineTo(v.x,v.y+hh);ctx.lineTo(v.x-hw,v.y);ctx.closePath();
      ctx.fillStyle=(state.roomHazards?.[me.room]||[]).some(([hx,hy])=>hx===x&&hy===y)?(roomDef(me.room).quest===10?'#89528b':roomDef(me.room).quest===13?'#957d56':'#30748a'):(even(x,y)?'#495c65':'#374955');ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#c4aa7380';ctx.stroke();
      if(y===centre&&(x===0||x===cols-1)){ctx.fillStyle='#d5b97650';ctx.fill()}
    }
  }
}
function iconAt(s,p,kind,size){
  const giant=kind==='enemy'&&(p.variant==='large'||p.variant==='large-shiny');
  const pt=s.at(p.x+(giant?.5:0),p.y+(giant?.5:0)),height=size||Math.max(26,s.cell*.74);let width=height;
  ctx.save();ctx.shadowColor='#000';ctx.shadowBlur=13;
  const image=images[kind==='enemy'?'d8':(p.klass||'knight')]||images.knight;
  const outline=kind==='enemy'?'#e8a09b':kind==='one'?'#e5c479':kind==='two'?'#78ebd7':kind==='three'?'#c9a4f5':'#fac393';
  const radius=Math.max(4,height*.13);
  if(giant)width*=1.6;
  const left=pt.x-width*.44,top=pt.y-height*.60,sz=width*.88;
  if(kind==='enemy'){
    ctx.beginPath();ctx.roundRect(left,top,sz,sz,radius);ctx.clip();
    ctx.fillStyle='#60323b';ctx.fillRect(left,top,sz,sz);
  }
  if(image?.complete&&image.naturalWidth)ctx.drawImage(image,left,top,sz,sz);
  ctx.restore();
  ctx.save();ctx.strokeStyle=outline;ctx.lineWidth=kind==='enemy'?2.5:2;
  if(kind==='enemy'){ctx.beginPath();ctx.roundRect(left,top,sz,sz,radius);ctx.stroke();}
  else{
    ctx.beginPath();ctx.ellipse(pt.x,pt.y+height*.34,sz*.42,Math.max(3,sz*.095),0,0,2*Math.PI);ctx.stroke();
    const n=({one:1,two:2,three:3,four:4}[kind]||0);if(n){
      ctx.fillStyle=outline;ctx.beginPath();ctx.arc(left+sz*.83,top+sz*.13,Math.max(6,sz*.15),0,2*Math.PI);ctx.fill();
      ctx.font=`bold ${Math.max(8,sz*.19)}px system-ui`;ctx.fillStyle='#082033';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(''+n,left+sz*.83,top+sz*.13);ctx.textBaseline='alphabetic';
    }
  }
  ctx.textAlign='center';ctx.font=`bold ${Math.max(9,Math.round(height*(roomSize(me.room).width>9?.31:.21)))}px system-ui`;
  ctx.lineWidth=3;ctx.strokeStyle='#111a25';ctx.fillStyle='#fff2df';
  const medium=roomSize(me.room).width>9;
  const abbreviations={normal:'',swift:'S',ranged:'R',armoured:'A',zombie:'Z',ghost:'G',teleporter:'T',cloner:'C',healer:'H',ninja:'N'};
  const text=kind==='enemy'&&medium?`${abbreviations[p.role||'normal']||''}D${p.faces}`:kind==='enemy'?p.name:p.name.slice(0,medium?4:8);
  ctx.strokeText(text,pt.x,pt.y+height*.47);ctx.fillText(text,pt.x,pt.y+height*.47);
  if(kind==='enemy'){
    const f=p.maxHp?Math.max(0,p.hp/p.maxHp):1;
    rr(pt.x-width*.44,pt.y+height*.54,width*.88,5,2,'#2b131c');
    rr(pt.x-width*.44,pt.y+height*.54,width*.88*f,5,2,'#e27577');
  }else if(p.hp===0){ctx.fillStyle='#ff8f91';ctx.fillText('DOWN',pt.x,pt.y-height*.65)}
  ctx.restore();
}
// Distinct wall palettes by quest: lichen and root-stone in the woods,
// cool slate inside the mines, mossy boulders among giants, warm quarry rock.
// These functions only DRAW; the actual collision map is unchanged.
function wallTerrain(room){
  const q=Number(room?.quest||1), name=(room?.name||'').toLowerCase();
  if(q===5)return {veil:'rgba(191,143,70,.29)',edge:'#edcf8c',shadow:'#4a311f',moss:'rgba(204,148,64,.68)',label:'desert'};
  if(q===6)return {veil:'rgba(68,113,116,.35)',edge:'#9ac3c3',shadow:'#142a2e',moss:'rgba(98,151,127,.7)',label:'marsh'};
  if(q===7)return {veil:'rgba(116,113,143,.3)',edge:'#c7bdd3',shadow:'#292737',moss:'rgba(156,136,173,.55)',label:'monastery'};
  if(q===8)return {veil:'rgba(94,122,141,.28)',edge:'#d1a889',shadow:'#292e3a',moss:'rgba(166,133,100,.55)',label:'diceworks'};
  if(q===10)return {veil:'rgba(129,70,170,.32)',edge:'#df9af4',shadow:'#281b43',moss:'rgba(163,96,197,.6)',label:'chaos'};
  if(q===11)return {veil:'rgba(45,121,164,.30)',edge:'#9fe4fa',shadow:'#153c58',moss:'rgba(97,157,190,.7)',label:'sunken'};
  if(q===13)return {veil:'rgba(119,166,207,.20)',edge:'#e7d7b7',shadow:'#293e55',moss:'rgba(191,199,211,.58)',label:'sky'};
  if(q===14)return {veil:'rgba(23,37,88,.43)',edge:'#9ca2e2',shadow:'#111327',moss:'rgba(94,102,173,.5)',label:'abyss'};
  if(q===15)return {veil:'rgba(153,122,184,.23)',edge:'#ebd8fa',shadow:'#322743',moss:'rgba(218,178,157,.4)',label:'celestial'};
  if(q===12)return {veil:'rgba(121,107,94,.30)',edge:'#d9c1a1',shadow:'#39312b',moss:'rgba(166,130,95,.6)',label:'city'};
  if(q===9)return {veil:'rgba(107,86,148,.30)',edge:'#bbadd7',shadow:'#232033',moss:'rgba(118,95,172,.60)',label:'warrens'};
  if(q===4||/quarry|excavation|crystal pit/.test(name))return {veil:'rgba(176,128,74,.23)',edge:'#e7c082',shadow:'#423022',moss:'rgba(197,150,79,.7)',label:'quarry'};
  if(q===2||/mine|crystal|gallery/.test(name))return {veil:'rgba(75,109,132,.33)',edge:'#9dbed1',shadow:'#182b37',moss:'rgba(114,174,177,.55)',label:'mine'};
  if(q===3||/giant|forest/.test(name))return {veil:'rgba(59,112,71,.28)',edge:'#a3b98c',shadow:'#1d3023',moss:'rgba(87,155,91,.8)',label:'forest'};
  return {veil:'rgba(77,108,63,.34)',edge:'#a8ba82',shadow:'#1d291b',moss:'rgba(92,148,69,.8)',label:'woodland'};
}
function stoneTexture(face,x,y,w,h,terrain,tileX,tileY){
  ctx.save();ctx.clip();
  ctx.fillStyle=terrain.shadow;ctx.fillRect(x,y,w,h);
  if(face?.complete&&face.naturalWidth){
    const fw=face.naturalWidth,fh=face.naturalHeight;
    const sx=(tileX*47+tileY*23)%Math.max(1,fw-77);
    const sy=(tileY*39+tileX*13)%Math.max(1,fh-77);
    ctx.drawImage(face,sx,sy,Math.min(76,fw-sx),Math.min(76,fh-sy),x,y,w,h);
  }
  ctx.fillStyle=terrain.veil;ctx.fillRect(x,y,w,h);
  ctx.restore();
}
function drawStoneTile(s,tx,ty,terrain){
  const c=s.cell,x=s.originX+tx*c,y=s.originY+ty*c;
  const inset=Math.max(1,c*.055),bx=x+inset,by=y+inset,bw=c-2*inset,bh=c-2*inset;
  ctx.save();ctx.shadowBlur=Math.max(4,c*.15);ctx.shadowColor='#000c';
  ctx.fillStyle=terrain.shadow;ctx.fillRect(bx,by,bw,bh);ctx.restore();
  const lip=Math.max(2,c*.12);
  ctx.beginPath();ctx.roundRect(bx+lip*.35,by+lip*.3,bw-lip*.7,bh-lip*.8,Math.max(2,c*.08));
  stoneTexture(images.wallface,bx,by,bw,bh,terrain,tx,ty);
  // Irregular mortar/stone courses, with stable variation per tile.
  ctx.save();ctx.strokeStyle=terrain.shadow;ctx.lineWidth=Math.max(1,c*.033);
  const y1=by+bh*.36,y2=by+bh*.70;
  ctx.beginPath();ctx.moveTo(bx+2,y1);ctx.lineTo(bx+bw-2,y1);ctx.moveTo(bx+2,y2);ctx.lineTo(bx+bw-2,y2);
  const cut1=bx+bw*(.29+((tx*3+ty)%4)*.10),cut2=bx+bw*(.62-((tx+ty*2)%3)*.11);
  ctx.moveTo(cut1,by+2);ctx.lineTo(cut1,y1);ctx.moveTo(cut2,y1);ctx.lineTo(cut2,y2);ctx.stroke();
  ctx.strokeStyle=terrain.edge;ctx.lineWidth=Math.max(1,c*.04);ctx.globalAlpha=.84;
  ctx.beginPath();ctx.moveTo(bx+1,by+bh-1);ctx.lineTo(bx+1,by+1);ctx.lineTo(bx+bw-1,by+1);ctx.stroke();
  if(terrain.label==='forest'||terrain.label==='woodland'){
    ctx.fillStyle=terrain.moss;
    ctx.beginPath();ctx.ellipse(bx+bw*.19,by+bh*.15,bw*.17,bh*.065,.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(bx+bw*.70,by+bh*.83,bw*.13,bh*.07,-.3,0,Math.PI*2);ctx.fill();
  }else if(terrain.label==='mine'){
    ctx.strokeStyle=terrain.moss;ctx.lineWidth=Math.max(1,c*.025);
    ctx.beginPath();ctx.moveTo(bx+bw*.67,by+bh*.20);ctx.lineTo(bx+bw*.49,by+bh*.38);ctx.lineTo(bx+bw*.62,by+bh*.52);ctx.stroke();
  }
  ctx.restore();
}
function stoneFace(points,texture,terrain,tx,ty,alpha=1){
  ctx.save();ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  for(const [x,y] of points.slice(1))ctx.lineTo(x,y);ctx.closePath();
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const [x,y] of points){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y)}
  ctx.globalAlpha=alpha;stoneTexture(texture,left,top,right-left,bottom-top,terrain,tx,ty);
  ctx.strokeStyle=terrain.edge;ctx.lineWidth=1;ctx.stroke();ctx.restore();
}
function drawStoneIso(s,tx,ty,terrain){
  const p=s.at(tx,ty),hw=RES.tx*s.scale,hh=RES.ty*s.scale,zh=29*s.scale;
  stoneFace([[p.x,p.y-hh-zh],[p.x+hw,p.y-zh],[p.x+hw,p.y],[p.x,p.y-hh]],images.wallface,terrain,tx,ty,.82);
  stoneFace([[p.x,p.y-hh-zh],[p.x-hw,p.y-zh],[p.x-hw,p.y],[p.x,p.y-hh]],images.wallface,terrain,tx+3,ty+6,.97);
  stoneFace([[p.x,p.y-hh-zh],[p.x+hw,p.y-zh],[p.x,p.y+hh-zh],[p.x-hw,p.y-zh]],images.wallcap,terrain,tx,ty,.98);
  ctx.save();ctx.strokeStyle=terrain.shadow;ctx.lineWidth=Math.max(.8,1.3*s.scale);
  ctx.beginPath();ctx.moveTo(p.x-hw*.60,p.y-hh*.12-zh);ctx.lineTo(p.x-hw*.10,p.y+hh*.18-zh);ctx.moveTo(p.x+hw*.1,p.y-hh*.60-zh);ctx.lineTo(p.x+hw*.65,p.y-hh*.12-zh);ctx.stroke();
  if(terrain.label==='woodland'||terrain.label==='forest'){
    ctx.strokeStyle=terrain.moss;ctx.lineWidth=2*s.scale;
    ctx.beginPath();ctx.moveTo(p.x-hw*.3,p.y-hh*.8-zh);ctx.lineTo(p.x-hw*.15,p.y-hh*.2-zh);ctx.stroke();
  }
  ctx.restore();
}
function render(){if(!state||!me)return;const box=canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);
  if(canvas.width!==Math.round(box.width*dpr)||canvas.height!==Math.round(box.height*dpr)){canvas.width=Math.max(1,Math.round(box.width*dpr));canvas.height=Math.max(1,Math.round(box.height*dpr))}
  ctx.setTransform(dpr,0,0,dpr,0,0);const w=box.width,h=box.height;
  ctx.clearRect(0,0,w,h);ctx.fillStyle='#08111e';ctx.fillRect(0,0,w,h);
  const mist=ctx.createRadialGradient(w*.5,h*.45,10,w*.5,h*.5,Math.max(w,h)*.8);mist.addColorStop(0,'#234457');mist.addColorStop(1,'#060d18');ctx.fillStyle=mist;ctx.fillRect(0,0,w,h);
  const s=gridProjection(w,h);frameMetrics=s;sceneFloor(s);positionPortalArrows(s,w,h);
  // Visual-only terrain. Original DICEBOUND stone textures are coloured by
  // setting; the server remains authoritative for ALL wall coordinates.
  const terrain=wallTerrain(roomDef(me.room));
  for(const [x,y] of state.roomWalls?.[me.room]||[]){
    if(s.iso)drawStoneIso(s,x,y,terrain);
    else drawStoneTile(s,x,y,terrain);
  }
  // Draw four real occupied squares for each 2×2 Large enemy, including tablets.
  const footprint=state.rooms[me.room].battle.enemies.filter(e=>e.hp>0&&(e.variant==='large'||e.variant==='large-shiny'));
  ctx.save();ctx.strokeStyle='#f1b475';ctx.fillStyle='#f1b47526';ctx.lineWidth=3;
  for(const enemy of footprint)for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++){const pt=s.at(enemy.x+dx,enemy.y+dy);
    if(s.iso){const hw=42*s.scale,hh=23*s.scale;ctx.beginPath();ctx.moveTo(pt.x,pt.y-hh);ctx.lineTo(pt.x+hw,pt.y);ctx.lineTo(pt.x,pt.y+hh);ctx.lineTo(pt.x-hw,pt.y);ctx.closePath();ctx.fill();ctx.stroke();}
    else{const x=s.originX+(enemy.x+dx)*s.cell,y=s.originY+(enemy.y+dy)*s.cell;ctx.fillRect(x,y,s.cell,s.cell);ctx.strokeRect(x+2,y+2,s.cell-4,s.cell-4)}
  }ctx.restore();
  const battle=state.rooms[me.room].battle;
  for(const nest of battle.nests||[]){
    const pt=s.at(nest.x,nest.y);ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font=`${Math.max(17,s.cell*(s.iso?.88:.52))}px system-ui`;
    ctx.shadowColor=nest.active?'#b881ff':'#495767';ctx.shadowBlur=nest.active?12:0;
    ctx.fillText(nest.active?'💠':'✖',pt.x,pt.y-(s.iso?12*s.scale:0));ctx.restore();
  }
  if(roomDef(me.room).quest===14){
    const lamps=state.roomLanterns?.[me.room]||[];
    // Keep the map navigable even in darkness, while showing dangerous unlit areas.
    if(!s.iso){
      for(let y=0;y<roomSize(me.room).height;y++)for(let x=0;x<roomSize(me.room).width;x++){
        const safe=(x<=2&&Math.abs(y-5)<=2)||lamps.some(([lx,ly],i)=>(battle.litLanterns||[]).includes(i)&&Math.abs(x-lx)+Math.abs(y-ly)<=3);
        if(!safe){ctx.fillStyle='#0407158a';ctx.fillRect(s.originX+x*s.cell,s.originY+y*s.cell,s.cell,s.cell);}
      }
    }
    for(const [i,[x,y]] of lamps.entries()){
      const pt=s.at(x,y),lit=(battle.litLanterns||[]).includes(i);
      ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${Math.max(18,s.cell*.55)}px system-ui`;
      ctx.shadowColor=lit?'#ffd684':'#536581';ctx.shadowBlur=lit?20:0;
      ctx.fillText(lit?'🏮':'🕯️',pt.x,pt.y-(s.iso?12*s.scale:0));ctx.restore();
    }
  }
  const actors=[...battle.enemies.filter(e=>e.hp>0).map(e=>({p:e,kind:'enemy'})),...Object.values(state.players).filter(p=>p.room===me.room).map(p=>({p,kind:p.id}))];
  if(s.iso)actors.sort((a,b)=>(a.p.x+a.p.y)-(b.p.x+b.p.y));
  for(const a of actors){
    const medium=roomSize(me.room).width>9;
    iconAt(s,a.p,a.kind,s.iso?Math.max(medium?15:23,s.cell*(medium?.76:1.15)):Math.max(medium?15:28,s.cell*(medium?.82:.75)));
  }
  const banner=$('turnBanner');
  const global=state.turn||{};
  const remaining=Math.max(0,Math.ceil(((global.deadline||Date.now())-Date.now())/1000));
  const current=global.activePlayer, myTurn=current===me.id;
  const label=myTurn?'⭐ YOUR TURN — Roll D6 once, then END TURN':'⌛ WAITING FOR '+(state.players[current]?.name||'the next round');
  $('turnClock').textContent=remaining+'s';
  banner.textContent=label;
  banner.classList.toggle('waiting',!myTurn);
  banner.hidden=false;
}
let lastFrame=0;function loop(t){if(t-lastFrame>120){render();lastFrame=t}requestAnimationFrame(loop)}
for(const b of document.querySelectorAll('[data-dir]'))b.addEventListener('click',()=>requestMove(b.dataset.dir));
$('rollMoveBtn').onclick=()=>send({type:'roll-move'});
function endTurnAndPassDevice(){
  if(localMode&&seatIds.length>1&&state?.turn?.activePlayer===activeSeat&&
     me?.lastRolledTurn===state.turn.round&&socket?.readyState===WebSocket.OPEN){
    pendingLocalEndTurn={actor:activeSeat,round:state.turn.round,revision:state.revision};
  }
  send({type:'end-turn'});
}
$('endTurnBtn').onclick=endTurnAndPassDevice;
$('endTurnQuickBtn').onclick=endTurnAndPassDevice;
$('resumeQuestBtn').onclick=()=>send({type:'resume-quest'});
$('returnCampBtn').onclick=()=>me?.room==='camp'?$('merchantPanel').scrollIntoView({behavior:'smooth',block:'start'}):send({type:'return-camp'});
$('attackBtn').onclick=()=>send({type:'action',action:{type:'attack',target:selectedEnemyId||null}});
$('specialBtn').onclick=()=>send({type:'action',action:{type:'special',target:selectedEnemyId||null}});
$('defendBtn').onclick=()=>send({type:'action',action:{type:'defend'}});
$('reviveBtn').onclick=()=>send({type:'action',action:{type:'revive'}});
$('nestBtn').onclick=()=>send({type:'action',action:{type:'nest'}});
$('lanternBtn').onclick=()=>send({type:'action',action:{type:'light'}});
$('potionBtn').onclick=()=>send({type:'potion',target:me?.id});
$('potionAllyBtn').onclick=()=>{
  const ally=Object.values(state?.players||{}).find(p=>p.id!==me?.id&&p.connected&&p.room===me.room&&p.hp>0&&p.hp<p.maxHp&&Math.abs(p.x-me.x)+Math.abs(p.y-me.y)===1);
  if(!ally)return toast('Stand next to an injured teammate.');
  send({type:'potion',target:ally.id});
};
$('toggleView').onclick=()=>{view=view==='tactical'?'illustrated':'tactical';$('toggleView').textContent=view==='tactical'?'▦ Tactical':'◇ Illustrated';render()};
$('logoutBtn').onclick=()=>{const form=document.createElement('form');form.method='POST';form.action=ROOT+'/api/logout';document.body.append(form);form.submit()};
// R2 shortcuts are intentionally resolved in one place for both local and online
// modes. Never execute gameplay actions while typing or while a modal is open.
const itemsDrawer=$('itemsDrawer');
const actionDock=document.querySelector('.action-dock');
const boardAndActions=document.querySelector('.board-and-actions');
boardAndActions.after(actionDock);
actionDock.classList.add('r2-action-bar');
for(const id of ['potionBtn','potionAllyBtn','reviveBtn','nestBtn','lanternBtn'])$('itemsActions').append($(id));
const searchSidebar=$('searchSidebar');
// Keep existing loot/search buttons and their event handlers intact.
const roomTreasure=document.querySelector('.lab-loot');
searchSidebar.prepend(roomTreasure);
function toggleSearch(force){
  const open=force===undefined?!searchSidebar.classList.contains('r2-open'):!!force;
  searchSidebar.classList.toggle('r2-open',open);
  $('searchDrawerToggle').setAttribute('aria-expanded',String(open));
}
$('searchDrawerToggle').onclick=()=>toggleSearch();
function toggleItems(force){
  const open=force===undefined?itemsDrawer.hidden:!!force;
  itemsDrawer.hidden=!open;
  $('itemsMenuBtn').setAttribute('aria-expanded',String(open));
}
$('itemsMenuBtn').onclick=()=>toggleItems();
$('itemsCloseBtn').onclick=()=>toggleItems(false);
function toggleBackpack(){
  $('heroBag').open=!$('heroBag').open;
  if($('heroBag').open)$('heroBag').scrollIntoView({behavior:'smooth',block:'nearest'});
}
$('inventoryShortcutBtn').onclick=toggleBackpack;
$('r2BackpackBtn').onclick=()=>{toggleItems(false);toggleBackpack()};
$('r2CombatSuppliesBtn').onclick=()=>{toggleItems(false);$('combatItemsPanel').scrollIntoView({behavior:'smooth',block:'start'})};
function showAdventureLog(){
  const log=$('log');const panel=log.closest('.plate');
  panel.classList.add('r2-log-flash');
  panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  log.focus?.({preventScroll:true});
  setTimeout(()=>panel.classList.remove('r2-log-flash'),1800);
}
window.addEventListener('keydown',ev=>{
  if(ev.key==='Escape'){
    if(!itemsDrawer.hidden){toggleItems(false);ev.preventDefault();return}
    if(searchSidebar.classList.contains('r2-open')){toggleSearch(false);ev.preventDefault();return}
  }
  const action=resolveHotkey(ev,{
    modalOpen:!$('characterOverlay').hidden||!$('questOverlay').hidden,
    typing:!!ev.target?.closest?.('input,textarea,select,[contenteditable="true"]')
  });
  if(!action)return;
  const controls={roll:'rollMoveBtn',end:'endTurnQuickBtn',attack:'attackBtn',fortify:'defendBtn',special:'specialBtn',camp:'returnCampBtn',nest:'nestBtn'};
  if(action.startsWith('move:'))requestMove(action.slice(5));
  else if(controls[action])$(controls[action]).click();
  else if(action==='items')toggleItems();
  else if(action==='inventory')toggleBackpack();
  else if(action==='log')showAdventureLog();
  else if(action==='quests')toggleQuestBoard($('questOverlay').hidden);
  ev.preventDefault();
});

canvas.addEventListener('pointerup',ev=>{
  if(!state||!me||!frameMetrics||!$('questOverlay').hidden)return;const rect=canvas.getBoundingClientRect(),xx=ev.clientX-rect.left,yy=ev.clientY-rect.top;
  let match=null,d=Infinity;
  for(let y=0;y<roomSize(me.room).height;y++)for(let x=0;x<roomSize(me.room).width;x++){
    const pt=frameMetrics.at(x,y),dis=Math.hypot(pt.x-xx,pt.y-yy);
    if(dis<d){d=dis;match={x,y}}
  }
  if(d>Math.max(14,frameMetrics.cell*.83)||!match)return;
  const battle=state.rooms[me.room].battle;
  if(battle.status==='active'){
    const target=battle.enemies.filter(e=>e.hp>0).find(e=>{
      const large=e.variant==='large'||e.variant==='large-shiny';
      const point=frameMetrics.at(e.x+(large?.5:0),e.y+(large?.5:0));
      return Math.hypot(point.x-xx,point.y-yy)<Math.max(20,frameMetrics.cell*.65);
    });
    if(target){selectedEnemyId=target.id;syncUI();return}
  }
  if(battle.status==='active'&&(battle.actions[me.id]||battle.activePlayer!==me.id)){
    toast(battle.actions[me.id]?'Press End Turn to continue.':'Waiting for '+(state.players[battle.activePlayer]?.name||'the next round')+'.');
    return;
  }
  const dx=match.x-me.x,dy=match.y-me.y;
  if(Math.abs(dx)+Math.abs(dy)!==1){toast('Tap a square next to your adventurer to move one step.');return}
  requestMove(dx>0?'E':dx<0?'W':dy>0?'S':'N');
});
// Authentic 15-quest catalogue is extracted from the original 3.2.1 HTML.
// It is read-only until each quest's unique multiplayer mechanics are ported.
function questSafe(text){return String(text??'')}
async function loadCampaign(){
  try{
    const response=await fetch('./campaign-catalog.json',{cache:'no-store'});
    if(!response.ok)throw new Error('Catalogue could not load ('+response.status+')');
    const data=await response.json();
    if(!Array.isArray(data.quests)||data.quests.length!==15||data.quests.reduce((n,q)=>n+q.rooms.length,0)!==133)
      throw new Error('Original quest catalogue did not pass validation');
    campaign=data;renderCampaign();if(state&&me)syncUI();
  }catch(e){$('campaignDetail').textContent='The quest catalogue is unavailable: '+e.message;}
}
function renderCampaign(){
  if(!campaign)return;
  const list=$('campaignList');list.replaceChildren();
  for(const q of campaign.quests){
    const btn=document.createElement('button');btn.type='button';btn.className='quest-choice'+(selectedQuest===q.number?' picked':'');
    const heading=el('span','quest-choice-heading',`${q.emoji} ${String(q.number).padStart(2,'0')} · ${q.name}`);
    const meta=el('span','quest-choice-meta',`${q.difficulty} · ${q.roomCount} rooms · ${q.number<= (state?.unlockedQuest||1)?'PLAYABLE':'LOCKED'}`);
    btn.append(heading,meta);btn.addEventListener('click',()=>{selectedQuest=q.number;renderCampaign()});list.append(btn);
  }
  const q=campaign.quests.find(x=>x.number===selectedQuest),detail=$('campaignDetail');detail.replaceChildren();
  const eyebrow=el('div','quest-detail-label',`QUEST ${q.number} · ${q.difficulty.toUpperCase()} · ${q.environment.toUpperCase()}`);
  const name=el('h3','',`${q.emoji} ${q.name}`);
  const unlocked=state?.unlockedQuest||1;
  const playable=q.number<=15;const accessible=playable&&q.number<=unlocked;
  const alert=el('div',accessible?'quest-live':'quest-pending',accessible?'✓ PLAYABLE · '+(state?.completedQuests?.includes(q.number)?'COMPLETED · Return to quest':'Unlocked and ready'):'🔒 COMPLETE THE PREVIOUS QUEST TO UNLOCK');
  detail.append(eyebrow,name,alert,el('p','muted',`${q.roomCount} original rooms. All 15 quests now have playable beta encounters.`));
  if(playable){const completed=state?.completedQuests?.includes(q.number);const savedRoom=me?.questBookmarks?.[q.number]?.room;const launch=el('button','quest-launch',completed?'↻ Replay Quest '+q.number:savedRoom?'↩ Resume Quest '+q.number+' · '+roomDef(savedRoom).name:'▶ Enter Quest '+q.number);launch.type='button';launch.disabled=!connected||!accessible||!me||state?.turn?.activePlayer!==me.id||state?.rooms[me.room]?.battle.status==='active';launch.addEventListener('click',()=>{
    if(completed&&!confirm('Replay Quest '+q.number+'? This resets defeated enemies and personal treasure in that quest for everyone, but preserves levels, gold, equipment and other quests. All players must first leave this quest.'))return;
    send({type:completed?'replay-quest':'enter-quest',quest:q.number});toggleQuestBoard(false)});detail.append(launch);}
  const rooms=el('ol','quest-rooms');
  q.rooms.forEach((r,i)=>{
    const li=el('li','quest-room');
    li.append(el('strong','',`${i+1}. ${r.name}`),el('span','',r.description));
    if(q.number<=15&&state){const id=q.number===1?['woodland','clearing','watchpost'][i]:`q${q.number}r${i+1}`;if(state.rooms[id]?.discovered)li.classList.add('quest-discovered');}
    rooms.append(li);
  });detail.append(rooms);
}
function toggleQuestBoard(show){
  const overlay=$('questOverlay');overlay.hidden=!show;
  if(show){selectedQuest=roomDef(me?.room).quest||1;renderCampaign();$('closeQuests').focus()}else $('openQuests').focus();
}
for(const id of ['openQuests','openQuestsSide'])$(id)?.addEventListener('click',()=>toggleQuestBoard(true));
$('closeQuests').addEventListener('click',()=>toggleQuestBoard(false));
$('questOverlay').addEventListener('click',e=>{if(e.target===$('questOverlay'))toggleQuestBoard(false)});
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('questOverlay').hidden){toggleQuestBoard(false);return}
  // Q is handled in the single R2 keyboard dispatcher above.
});
loadCampaign();
window.addEventListener('resize',render);
// Chat is independent of movement/turns; all validation and storage are server-side.
const chatLauncher=$('chatLauncher'),chatDrawer=$('chatDrawer');
// Client-side picker inserts ordinary Unicode into the existing filtered chat input.
// Chat moderation, rate limiting and max length remain server-authoritative.
for(const emoji of ['😀','😂','🎲','⚔️','🛡️','❤️','👍','🎉','👻','😮']){
 const button=el('button','chat-emoji',emoji);button.type='button';button.setAttribute('aria-label','Insert '+emoji);
 button.addEventListener('click',()=>{const input=$('chatInput');if(input.disabled)return;const before=input.value;
   if(before.length+emoji.length<=180){input.value=before+emoji;input.focus({preventScroll:true});}});
 $('chatEmojiBar').append(button);
}

function setChatOpen(open){chatOpen=open;chatDrawer.hidden=!open;chatLauncher.setAttribute('aria-expanded',String(open));if(open){chatSeen=chatData.messages.at(-1)?.id||chatSeen;$('chatUnread').hidden=true;renderChat();$('chatInput').focus({preventScroll:true})}}
chatLauncher.addEventListener('click',()=>setChatOpen(!chatOpen));
$('chatClose').addEventListener('click',()=>setChatOpen(false));
$('chatForm').addEventListener('submit',e=>{e.preventDefault();const input=$('chatInput');const value=input.value.trim();if(!value)return;send({type:'chat-send',text:value});input.value='';input.focus({preventScroll:true})});
$('chatMuteBtn').addEventListener('click',()=>{const player=$('chatMuteSelect').value;if(player)send({type:'chat-mute',player})});
$('chatAdminMute').addEventListener('click',()=>{const player=$('chatAdminPlayer').value;if(player)send({type:'chat-admin-mute',player})});
function renderChatControls(){
 if(!state?.players)return;
 const mute=$('chatMuteSelect'),admin=$('chatAdminPlayer');const mVal=mute.value,aVal=admin.value;
 for(const select of [mute,admin]){select.replaceChildren();const empty=el('option','', 'Choose a player');empty.value='';select.append(empty);for(const p of Object.values(state.players).filter(p=>p.id!==state.me)){const option=el('option','',p.name);option.value=p.id;select.append(option)}}
 mute.value=mVal;admin.value=aVal;
 $('chatAdminPanel').hidden=state.me!=='one';
}
function renderChat(){
 const area=$('chatMessages');const atBottom=area.scrollTop+area.clientHeight>=area.scrollHeight-40;
 area.replaceChildren();
 if(!chatData.messages.length)area.append(el('p','chat-quiet','No messages yet. Say hello!'));
 for(const message of chatData.messages){
   const self=message.from===state?.me;
   const row=el('div','chat-line'+(self?' chat-self':''));
   const head=el('div','chat-line-header');head.append(el('strong','',message.name),el('time','',new Date(message.at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})));
   row.append(head,el('p','chat-text',message.text));
   if(!self){const report=el('button','chat-report','Report');report.type='button';report.addEventListener('click',()=>{
    const reason=prompt('Report reason: enter 1 for Unkind message, 2 for Personal information, 3 for Other concern');
    const selected={'1':'Unkind message','2':'Personal information','3':'Other concern'}[reason];
    if(selected){send({type:'chat-report',messageId:message.id,reason:selected});toast('Report sent to Player 1 for review.')}});row.append(report)}
   area.append(row);
 }
 if(chatOpen&&atBottom)area.scrollTop=area.scrollHeight;
 const latest=chatData.messages.at(-1);
 if(chatOpen){chatSeen=latest?.id||chatSeen;$('chatUnread').hidden=true}
 else $('chatUnread').hidden=!(latest&&latest.id>chatSeen&&latest.from!==state?.me);
 const admin=state?.me==='one',panel=$('chatAdminPanel');panel.hidden=!admin;
 if(admin){const reports=$('chatReports');reports.replaceChildren();
  if(!chatData.reports.length)reports.append(el('p','chat-quiet','No reports.'));
  for(const report of [...chatData.reports].reverse().slice(0,10))reports.append(el('p','chat-report-entry',`From ${state.players[report.reporter]?.name||'Player'} · ${report.reason} · ${report.text}`));
  $('chatAdminMute').textContent=chatData.playersMuted.includes($('chatAdminPlayer').value)?'Restore Chat':'Suspend Chat';
 }
 $('chatSend').disabled=!connected||chatData.adminMuted;
 $('chatInput').disabled=!connected||chatData.adminMuted;
 $('chatInput').placeholder=chatData.adminMuted?'Chat suspended by test organiser':'Say something to your team…';
 $('chatMuteBtn').textContent=chatData.muted.includes($('chatMuteSelect').value)?'Unmute':'Mute';
}
$('chatMuteSelect').addEventListener('change',renderChat);
$('chatAdminPlayer').addEventListener('change',renderChat);
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&chatOpen)setChatOpen(false)});

connect();requestAnimationFrame(loop);

// Separate Endgame Maze interface. The ordinary 15-quest canvas remains unchanged.
function mazeButton(text,command,enabled=true){const b=el('button','bag-action',text);b.type='button';b.disabled=!connected||!enabled;b.addEventListener('click',()=>send(command));return b;}
function updateMazeUI(){
 const maze=state?.maze,panel=$('mazeControlPanel');if(!maze||!panel||!me)return;
 const slots=$('mazeSlotChoices');slots.replaceChildren();
 if(!maze.activeSlot){
  const label=el('p','muted',(state?.completedQuests||[]).includes(15)?'Endgame unlocked. Return to camp to begin or resume.':'Finish Quest 15 to unlock the Endgame Maze.');slots.append(label);
  for(const slot of maze.slots){
   const r=el('div','shop-item'),desc=el('span','',`Save ${slot.slot} · ${slot.status}${slot.rooms?' · '+slot.rooms+' chambers':''}`);r.append(desc);
   if(slot.status==='active')r.append(mazeButton('Join / Resume',{type:'maze-join',slot:slot.slot},me.room==='camp'));
   else if(me.id==='one')r.append(mazeButton(slot.status==='empty'?'Create Maze':'New Expedition',{type:'maze-create',slot:slot.slot},me.room==='camp'&&(state.completedQuests||[]).includes(15)));
   slots.append(r);
  }
 }else slots.append(el('p','',`Exploring saved Maze ${maze.activeSlot} · shared adventure`));
 const rewards=$('mazeRewardChoices');rewards.replaceChildren();
 for(const reward of maze.rewards||[]){rewards.append(el('p','',`🏆 Maze ${reward.slot} victory chest · ${reward.rarity}: choose one:`));
  for(const category of ['Sword','Bow','Mace','Staff','Armour'])rewards.append(mazeButton(category,{type:'maze-reward',category}));
 }
 const run=maze.run,live=$('mazeLive');live.hidden=!run;if(!run)return;
 $('mazeRoomHeading').textContent=`🧭 Maze ${run.slot}: ${run.room} · depth ${run.depth}`;
 $('mazeRoomStatus').textContent=`Shared discoveries: ${run.seen.length} rooms · clues ${run.cluesFound} · checkpoint ${run.checkpoint}`;
 const map=$('mazeMap');map.replaceChildren();
 const nodes=run.seen||[];if(nodes.length){
  const minX=Math.min(...nodes.map(n=>n.x)),minY=Math.min(...nodes.map(n=>n.y));
  const maxX=Math.max(...nodes.map(n=>n.x)),maxY=Math.max(...nodes.map(n=>n.y));
  const gap=38,pad=25,w=(maxX-minX)*gap+pad*2,h=(maxY-minY)*gap+pad*2;
  const grid=el('div','maze-map-grid');grid.style.width=Math.max(330,w)+'px';grid.style.height=Math.max(260,h)+'px';
  const byId=Object.fromEntries(nodes.map(n=>[n.id,n]));
  for(const n of nodes){
    for(const other of Object.values(n.connections||{})){
      if(!byId[other]||other<n.id)continue;
      const to=byId[other],x1=(n.x-minX)*gap+pad,y1=(n.y-minY)*gap+pad,x2=(to.x-minX)*gap+pad,y2=(to.y-minY)*gap+pad;
      const line=el('div','maze-map-line');line.style.left=x1+'px';line.style.top=y1+'px';line.style.width=Math.hypot(x2-x1,y2-y1)+'px';line.style.transform=`rotate(${Math.atan2(y2-y1,x2-x1)}rad)`;grid.append(line);
    }
  }
  for(const n of nodes){
   const spot=el('div','maze-node'+(n.id===run.roomId?' current':'')+(n.role==='boss'?' boss':''),n.id.slice(-2));
   spot.style.left=((n.x-minX)*gap+pad)+'px';spot.style.top=((n.y-minY)*gap+pad)+'px';
   spot.title=n.name+(n.id===run.roomId?' · YOU ARE HERE':'');grid.append(spot);
  }
  map.append(grid);
 }
 const directions=$('mazeDirections');directions.replaceChildren();
 const battle=run.battle,isFighting=battle?.status==='active';
 for(const dir of ['N','E','S','W'])if(run.connections[dir])directions.append(mazeButton(`${{N:'↑',E:'→',S:'↓',W:'←'}[dir]} ${run.connections[dir]}`,{type:'maze-travel',dir},!isFighting));
 const enemies=$('mazeEnemies');enemies.replaceChildren();
 if(battle){const fighting=battle.status==='active';enemies.append(el('h4','',fighting?`⚔ Combat · Round ${battle.round}`:'✓ This chamber is clear'));
  if(fighting){
   for(const enemy of battle.enemies.filter(e=>e.hp>0)){
    const row=el('div','maze-foe');row.append(el('span','',`${enemy.name} · HP ${enemy.hp}/${enemy.maxHp}`));
    row.append(mazeButton('⚔ Attack',{type:'maze-action',action:{type:'attack',target:enemy.id}},!battle.actions[me.id]&&me.hp>0));
    if(me.combatStats?.special)row.append(mazeButton('★ Special',{type:'maze-action',action:{type:'special',target:enemy.id}},!battle.actions[me.id]&&me.hp>0));
    enemies.append(row);
   }
   if(battle.warn?.tiles)enemies.append(el('p','maze-danger',`⚠ Next hazard: ${battle.warn.attack}. Avoid tiles ${battle.warn.tiles.map(t=>`(${t.x},${t.y})`).join(' ')}`));
   if(run.boss)enemies.append(el('p','maze-danger',`👑 ${run.boss.name} · phase ${battle.phase+1} of 3 · ${run.boss.phases[battle.phase]}`));
  }
 }
 // Boss room is an actual 7 × 7 tactical arena: all warned squares are visible.
 const arena=$('mazeArena');arena.replaceChildren();arena.hidden=!(isFighting&&run.boss);
 if(isFighting&&run.boss){
  const bs=battle.bossState||{},myTile=me.mazeTile||{x:1,y:3};
  const marked=new Set((battle.warn?.tiles||[]).map(t=>t.x+','+t.y));
  const occupants=Object.values(state.players||{}).filter(p=>p.mazeSlot===run.slot&&run.positions[p.id]===run.roomId&&p.hp>0);
  for(let y=0;y<7;y++)for(let x=0;x<7;x++){
   const hero=occupants.find(p=>(p.mazeTile?.x??1)===x&&(p.mazeTile?.y??3)===y);
   const fixture=(bs.points||[]).find(t=>t.x===x&&t.y===y);
   const enemy=battle.enemies.find(e=>e.hp>0&&e.x===x&&e.y===y);
   const tile=el('button','maze-arena-cell'+(marked.has(x+','+y)?' danger':'')+(fixture?' fixture':'')+(hero?' hero':'')+(enemy?.role==='boss'?' monarch':''),hero?'♟':enemy?.role==='boss'?'👑':enemy?'⚔':fixture?(fixture.used?'✓':'⚙'):'·');
   tile.type='button';tile.title=`(${x},${y})${hero?' · '+hero.name:''}${fixture?' · '+fixture.name+(fixture.used?' · used':''):''}${marked.has(x+','+y)?' · DANGER NEXT ROUND':''}`;
   const canStep=Math.abs(myTile.x-x)+Math.abs(myTile.y-y)===1&&!battle.actions[me.id]&&me.hp>0;
   const canInteract=fixture&&!fixture.used&&Math.abs(myTile.x-x)+Math.abs(myTile.y-y)<=1&&!battle.actions[me.id]&&me.hp>0;
   tile.disabled=!connected||(!canStep&&!canInteract);
   if(canInteract)tile.addEventListener('click',()=>send({type:'maze-action',action:{type:'interact',point:fixture.id}}));
   else if(canStep)tile.addEventListener('click',()=>send({type:'maze-action',action:{type:'move',tile:{x,y}}}));
   arena.append(tile);
  }
  enemies.append(el('p','maze-boss-intro',`👑 ${run.boss.mechanic}. ${run.boss.weakness||"The arena objects may reveal a weakness. Search the Maze for more clues."}`));
  if(bs.weakUntil>=battle.round)enemies.append(el('p','maze-weak',`✦ Weakness exposed through round ${bs.weakUntil}. Strike now!`));
  if(bs.pendingEvent)enemies.append(el('p','maze-danger',`⚠ Next enemy phase: ${bs.pendingEvent.label}.`));
 }
 const actions=$('mazeTactics');actions.replaceChildren();
 if(isFighting){
  const ready=!battle.actions[me.id]&&me.hp>0;
  if(run.boss){
   const at=me.mazeTile||{x:1,y:3};
   for(const point of battle.bossState?.points||[]){
    const near=Math.abs(at.x-point.x)+Math.abs(at.y-point.y)<=1;
    actions.append(mazeButton((point.used?'✓ ':near?'⚙ Use ':'↪ Approach ')+point.name,{type:'maze-action',action:{type:'interact',point:point.id}},ready&&near&&!point.used));
   }
   actions.append(mazeButton('↩ Retreat from boss arena',{type:'maze-retreat'},me.hp>0));
  }
  actions.append(mazeButton('🛡 Fortify',{type:'maze-action',action:{type:'defend'}},ready));
  actions.append(mazeButton('🧪 Healing Potion',{type:'maze-action',action:{type:'heal'}},ready&&!!me.inventory?.potions?.length));
  for(const [sku,label] of [['blast-bomb','💣 Bomb'],['meteor-scroll','☄ Meteor'],['guardian-ward','🔰 Guardian Tonic'],['super-potion','⚡ Superstrength']]){
   const available=(me.inventory?.consumables||[]).filter(i=>i.sku===sku&&i.charges>0).length;
   if(available)actions.append(mazeButton(label+' ×'+available,{type:'maze-action',action:{type:'item',sku}},ready));
  }
  for(const ally of Object.values(state.players||{}).filter(p=>p.mazeSlot===run.slot&&p.hp===0&&run.positions[p.id]===run.roomId))actions.append(mazeButton('♥ Revive '+ally.name,{type:'maze-action',action:{type:'revive',target:ally.id}},ready));
  for(const [dir,xy] of Object.entries({N:[0,-1],E:[1,0],S:[0,1],W:[-1,0]})){
   const at=me.mazeTile||{x:1,y:3},next={x:at.x+xy[0],y:at.y+xy[1]};
   if(next.x>=0&&next.x<=6&&next.y>=0&&next.y<=6)actions.append(mazeButton('Step '+dir,{type:'maze-action',action:{type:'move',tile:next}},ready));
  }
  if(battle.actions[me.id])actions.append(el('p','muted','Action submitted. Waiting for the other players in this chamber, or the 60-second round timer.'));
 }
 const searches=$('mazeSearchActions');searches.replaceChildren();
 if(!isFighting){
  searches.append(mazeButton('🔎 Search scenery and passages',{type:'maze-search'},!run.roomSearched));
  for(const slot of ['coin','potion','equipment','enchantment'])searches.append(mazeButton('🎁 '+slot,{type:'maze-claim',slot},!run.claimed.includes(slot)));
  if(run.bonus&&!run.bonus.attempted)searches.append(mazeButton('⚠ Attempt optional '+run.bonus.challenge,{type:'maze-bonus'}));
 }
 const journal=$('mazeJournal');journal.replaceChildren();
 for(const entry of run.journal)journal.append(el('p','',entry));if(!run.journal.length)journal.append(el('p','muted','No clues discovered yet. Investigate new chambers.'));
 $('mazeLeaveBtn').disabled=!connected; $('mazeAbandonBtn').disabled=!connected;
}
$('mazeLeaveBtn').addEventListener('click',()=>send({type:'maze-leave'}));
$('mazeAbandonBtn').addEventListener('click',()=>{if(confirm('Request unanimous abandonment? This permanently ends the saved expedition and forfeits the final chest.'))send({type:'maze-abandon'})});

