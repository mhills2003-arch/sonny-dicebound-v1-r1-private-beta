import { DurableObject } from 'cloudflare:workers';
import {mazeLabRoomKey,provisionMazeLabPlayer,grantMazeLabEquipment} from './maze-lab.mjs';
import {localHistory,newLocalAdventure,resumeLocalAdventure,activeLocalAdventure,localRoomKey,seatPermitted} from './local-adventures.mjs';
import {createMaze,joinMaze,leaveMaze,mazeTravel,mazeSearch,mazeClaim,mazeBonus,mazeAction,mazeRetreat,mazeReward,mazeVoteAbandon,mazeTick,nextMazeDeadline,mazePublic,resumeMazeClock} from './maze-play.mjs';
import {ensureChat,chatForViewer,postChat,togglePersonalMute,reportChat,toggleAdminMute} from './chat.mjs';
import {freshState,ensurePlayer,markDisconnected,move,submitAction,claimLoot,resetTestAdventure,equipItem,unequipItem,bindEnchantment,usePotion,claimTrainingRack,enterQuest,replayQuest,rollMovement,voteFinishQuest,returnToCamp,buyFromShop,sellToShop,resumeQuest,submitSequentialAction,endTurn,assertGlobalTurn,tick,publicState,ROOM_DATA,claimQuestReward,selectClass,createCharacter} from './engine.mjs';

const ROOT='/dicebound-beta';
const COOKIE='db4_beta_session';
const LOCAL_COOKIE='db4_beta_local_adventures';
const encoder=new TextEncoder();
const reply=(value,status=200,headers={})=>new Response(typeof value==='string'?value:JSON.stringify(value),{status,headers:{'cache-control':'no-store',...headers,'content-type':typeof value==='string'?'text/html; charset=utf-8':'application/json; charset=utf-8'}});
function b64url(bytes){let out='';for(const b of bytes)out+=String.fromCharCode(b);return btoa(out).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function readCookie(req,name=COOKIE){return (req.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${name}=`))?.slice(name.length+1)||null}
function decodeB64(data){return new TextDecoder().decode(Uint8Array.from(atob(data.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0)))}
async function signedLocalHistory(req,env){
  const value=readCookie(req,LOCAL_COOKIE);if(!value||!env.COOKIE_SECRET)return localHistory(null);
  const parts=value.split('.');if(parts.length!==2)return localHistory(null);
  const [data,mac]=parts;
  if(!data||!mac||(await signature(data,env.COOKIE_SECRET))!==mac)return localHistory(null);
  try{return localHistory(JSON.parse(decodeB64(data)))}catch{return localHistory(null)}
}
async function localCookie(history,env,req){
  const data=b64url(encoder.encode(JSON.stringify(localHistory(history))));
  return `${LOCAL_COOKIE}=${data}.${await signature(data,env.COOKIE_SECRET)}; HttpOnly; SameSite=Strict; Path=${ROOT}; Max-Age=31536000${new URL(req.url).protocol==='https:'?'; Secure':''}`;
}
async function signature(data, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const mac = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return b64url(new Uint8Array(mac));
}
async function validSession(req,env){
  if(!env.COOKIE_SECRET||env.COOKIE_SECRET.length<32)return null;
  const cookie=readCookie(req);
  if(!cookie)return null;
  const [data,mac]=cookie.split('.');if(!data||!mac||cookie.split('.').length!==2)return null;
  if((await signature(data,env.COOKIE_SECRET))!==mac)return null;
  try{
    const parsed=JSON.parse(decodeB64(data));
    if(!['one','two','three','four'].includes(parsed.id)||parsed.exp<=Date.now())return null;
    const index={one:1,two:2,three:3,four:4}[parsed.id];
    if(index>=3&&(!env['INVITE_TOKEN_'+index]||env['INVITE_TOKEN_'+index].length<24))return null;
    return {id:parsed.id,name:env['PLAYER_'+index+'_NAME']||`Player ${['One','Two','Three','Four'][index-1]}`};
  }catch{return null}
}
function loginScreen(error=''){
  const message=error?'<p class="error" role="alert">That invitation code was not accepted.</p>':'';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DICEBOUND V1 — Private Multiplayer Beta</title><style>body{min-height:100dvh;display:grid;place-items:center;background:radial-gradient(#1c3550,#050b16);font:16px system-ui;color:#e9dcc0;margin:0}.card{max-width:370px;width:calc(100% - 48px);padding:30px;background:#101b2be8;border:1px solid #9f804a;border-radius:20px;box-shadow:0 25px 90px #0008}h1{font:32px Georgia;color:#e9c77b}.error{color:#ffaaaa}label{display:block;margin:18px 0 8px}input{width:100%;box-sizing:border-box;padding:12px;border-radius:9px;border:1px solid #9f804a;background:#081323;color:white;font-size:17px}button{width:100%;margin-top:18px;padding:13px;background:#d9b978;color:#151a23;border:0;border-radius:10px;font-weight:700}small{color:#c2c8cc}</style></head><body><main class="card"><h1>🎲 DICEBOUND V1</h1><p>Private multiplayer beta · adult supervised testing</p><p><strong>🎮 Local</strong> · 1–4 on one device<br><strong>🌐 Online</strong> · 1–4 on separate devices</p>${message}<form action="${ROOT}/api/login" method="POST"><label for="code">Parent-issued invitation code</label><input id="code" name="code" type="password" autocomplete="off" required minlength="20" maxlength="256"><button type="submit">Enter prototype</button></form><p><small>For development testing only. Do not invite children until parental authentication, moderation and privacy safeguards are complete.</small></p></main></body></html>`;
}
/** Authenticated landing page. No live V1 pages or worker routes are modified. */
function landingScreen(identity,history){
  const isHost=identity.id==='one';
  const local=localHistory(history);
  const previous=local.games.map(g=>`<option value="${g.id}" ${g.id===local.active?'selected':''}>${g.id==='legacy'?'Existing beta adventure (before this update)':`${g.seats} player${g.seats===1?'':'s'} · ${new Date(g.created).toLocaleDateString('en-GB')} · ${g.id.slice(0,8)}`}</option>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DICEBOUND · Choose a game</title><style>
  :root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;min-height:100dvh;background:radial-gradient(circle at 45% 0,#29435a,#0a1523 65%,#050915);color:#f0e0be;font:16px system-ui,Arial}main{max-width:960px;margin:auto;padding:clamp(28px,6vw,78px) 24px}header{text-align:center;margin-bottom:42px}h1{font:700 clamp(44px,8vw,76px) Georgia,serif;color:#f3ce79;margin:0;letter-spacing:.08em}h2{font:700 24px Georgia,serif;color:#f0cb82;margin:5px 0 13px}p{color:#c5d1d8;line-height:1.65}small{font-size:12px;color:#b3bfcb}.eyebrow{letter-spacing:.27em;color:#9fbaa7;text-transform:uppercase;font-weight:bold;font-size:11px}.modes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:19px}.mode{padding:30px;background:linear-gradient(140deg,#233747,#101d30);border:1px solid #a38956;border-radius:19px;box-shadow:0 15px 50px #0007}.mode-icon{font-size:45px}.mode a,.mode button{display:block;width:100%;text-align:center;text-decoration:none;border-radius:11px;background:#e4bd77;color:#142132;font-weight:800;padding:14px;margin-top:23px;border:0;font-size:15px}.local-choices{display:grid;gap:16px}.local-choices form{border-top:1px solid #5a6470;padding-top:12px}.local-choices h3{font:700 18px Georgia;color:#f0cb82;margin:6px 0}.mode select{background:#071624;color:#f5ddb0;border:1px solid #bba371;border-radius:7px;padding:9px;width:100%;margin:7px 0}.note{padding:16px 20px;margin-top:30px;border:1px solid #526475;border-radius:10px;background:#102133}footer{text-align:center;margin-top:24px;font-size:12px;color:#b7c3ca}form.exit button{background:transparent;border:1px solid #687889;padding:8px 15px;color:#d2d6d4;border-radius:7px;cursor:pointer}
  </style></head><body><main><header><div class="eyebrow">The original tactical dice adventure</div><h1>🎲 DICEBOUND</h1><p>Choose how your party enters the dungeon</p></header>
  <div class="modes"><section class="mode"><div class="mode-icon">🎮</div><h2>Local multiplayer</h2><p>Up to four adventurers, sharing one screen. Pass control to the next player when it is their turn. This mode has its own save world.</p>${isHost?`<div class="local-choices"><form action="${ROOT}/api/local-adventure" method="POST"><input type="hidden" name="action" value="new"><h3>Start a NEW adventure</h3><p><small>Everyone begins together with new characters. Your earlier local saves are preserved for Resume.</small></p><label for="seats">Number of players</label><select id="seats" name="seats"><option value="1">1 player</option><option value="2">2 players</option><option value="3">3 players</option><option value="4" selected>4 players</option></select><button type="submit">Start new adventure</button></form><form action="${ROOT}/api/local-adventure" method="POST"><input type="hidden" name="action" value="resume"><h3>RESUME saved adventure</h3><label for="adventure">Choose a saved game</label><select id="adventure" name="adventure">${previous}</select><label for="legacySeats">Players (only for the existing beta save)</label><select id="legacySeats" name="legacySeats">${[1,2,3,4].map(n=>`<option value="${n}" ${local.games[0].seats===n?'selected':''}>${n} player${n===1?'':'s'}</option>`).join('')}</select><button type="submit">Resume adventure</button></form></div>`:'<p><small>Local host access is managed by Player One (the supervising adult).</small></p>'}</section>
  <section class="mode"><div class="mode-icon">🌐</div><h2>Online multiplayer</h2><p>Up to four players on separate devices. Each approved player uses their personal reusable access code. The six-boss Maze is included in this game mode.</p><a href="${ROOT}/play?mode=online">Enter online game</a></section></div>
  <div class="note" style="border-color:#ba9556"><strong>🧪 Endgame Maze Lab · isolated test adventure</strong><p>Test the complete six-boss Maze now, without completing Quest 15. These are separate Level 25 test characters; nothing transfers to your saved campaign. Parent/host creates the Maze in Save 1; friends can join from their own devices.</p><p><a style="color:#efcf86" href="${ROOT}/play?mode=online&mazeLab=1">Open ONLINE Maze Lab</a>${isHost&&activeLocalAdventure(local)?` · <a style="color:#efcf86" href="${ROOT}/play?mode=local&seats=${activeLocalAdventure(local).seats}&mazeLab=1">Open LOCAL Maze Lab (${activeLocalAdventure(local).seats} players)</a>`:''}</p></div>
  <div class="note"><strong>Private development beta</strong><p>V1 at <strong>/dicebound/</strong> is unaffected. Keep multiplayer supervised; adult-managed friend identities and safety controls are being developed. Do not share invitation codes publicly.</p></div>
  <footer>Signed in as ${identity.id==='one'?'Player One':identity.id==='two'?'Player Two':identity.id==='three'?'Player Three':'Player Four'} · <a style="color:#e4bd77" href="${ROOT}/">Choose mode</a><form class="exit" action="${ROOT}/api/logout" method="POST"><button type="submit">Sign out</button></form></footer></main></body></html>`;
}
function goodOrigin(req){const origin=req.headers.get('origin');if(!origin)return false;try{return new URL(origin).origin===new URL(req.url).origin}catch{return false}}
function configured(env){return env.INVITE_TOKEN_1?.length>=24&&env.INVITE_TOKEN_2?.length>=24&&env.COOKIE_SECRET?.length>=32&&env.INVITE_TOKEN_1!==env.INVITE_TOKEN_2&&![env.INVITE_TOKEN_1,env.INVITE_TOKEN_2,env.COOKIE_SECRET].some(x=>x.includes('REPLACE_WITH'))}
async function doLogin(req,env){
  if(!configured(env))return reply('Server invitation secrets are not configured.',503);
  if(!goodOrigin(req))return reply('Origin mismatch.',403);
  const type=req.headers.get('content-type')||'';
  if(!type.includes('application/x-www-form-urlencoded')&&!type.includes('multipart/form-data'))return reply('Unsupported form.',415);
  const form=await req.formData();const code=String(form.get('code')||'');
  const id=code===env.INVITE_TOKEN_1?'one':code===env.INVITE_TOKEN_2?'two':(env.INVITE_TOKEN_3?.length>=24&&code===env.INVITE_TOKEN_3)?'three':(env.INVITE_TOKEN_4?.length>=24&&code===env.INVITE_TOKEN_4)?'four':null;
  if(!id)return reply(loginScreen(true),401);
  const data=b64url(encoder.encode(JSON.stringify({id,exp:Date.now()+1000*60*60*12})));
  const cookie=`${COOKIE}=${data}.${await signature(data,env.COOKIE_SECRET)}; HttpOnly; SameSite=Strict; Path=${ROOT}; Max-Age=43200${new URL(req.url).protocol==='https:'?'; Secure':''}`;
  return new Response(null,{status:303,headers:{'location':`${ROOT}/`,'set-cookie':cookie,'cache-control':'no-store'}});
}
export default {
  async fetch(req,env){
    const u=new URL(req.url);if(u.pathname===ROOT)return Response.redirect(u.origin+ROOT+'/',308);
    if(!u.pathname.startsWith(ROOT+'/'))return new Response('Not found',{status:404});
    if(req.method==='POST'&&u.pathname===ROOT+'/api/login')return doLogin(req,env);
    const identity=await validSession(req,env);
    if(!identity)return reply(loginScreen(),401,{'x-frame-options':'DENY'});
    if(req.method==='GET'&&u.pathname===ROOT+'/')return reply(landingScreen(identity,identity.id==='one'?await signedLocalHistory(req,env):null),200,{'x-frame-options':'DENY'});
    if(req.method==='POST'&&u.pathname===ROOT+'/api/local-adventure'){
      if(identity.id!=='one')return reply('Only the parent host can choose a local adventure',403);
      if(!goodOrigin(req))return reply('Origin mismatch.',403);
      const form=await req.formData();const action=String(form.get('action')||'');
      const history=await signedLocalHistory(req,env);let updated;
      try{
        if(action==='new')updated=newLocalAdventure(history,Number(form.get('seats')),crypto.randomUUID());
        else if(action==='resume')updated=resumeLocalAdventure(history,String(form.get('adventure')||''),Number(form.get('legacySeats')));
        else return reply('Invalid adventure choice.',400);
      }catch(err){return reply(String(err.message||'Invalid adventure'),400)}
      const chosen=activeLocalAdventure(updated);
      return new Response(null,{status:303,headers:{location:`${ROOT}/play?mode=local&seats=${chosen.seats}`,'set-cookie':await localCookie(updated,env,req),'cache-control':'no-store'}});
    }
    if(req.method==='GET'&&u.pathname===ROOT+'/api/me')return reply(identity);
    if(req.method==='POST'&&u.pathname===ROOT+'/api/logout'){
      if(!goodOrigin(req))return reply('Origin mismatch.',403);
      return new Response(null,{status:303,headers:{location:ROOT+'/', 'set-cookie':`${COOKIE}=; Path=${ROOT}; Max-Age=0; HttpOnly; SameSite=Strict`}});
    }
    if(req.method==='GET'&&u.pathname===ROOT+'/api/ws'){
      if(req.headers.get('upgrade')?.toLowerCase()!=='websocket')return reply('Upgrade required',426);
      const isTrial=u.searchParams.get('trial')==='balance-v9';
      const isMazeLab=u.searchParams.get('mazeLab')==='1';
      const mode=u.searchParams.get('mode')==='local'?'local':'online';
      const seat=u.searchParams.get('seat')||'one';
      const localGame=mode==='local'?activeLocalAdventure(await signedLocalHistory(req,env)):null;
      if(mode==='local'&&(identity.id!=='one'||!seatPermitted(localGame,seat)))return reply('Choose a new or saved local adventure on the landing page.',403);
      const activeId=mode==='local'?seat:identity.id;
      const roomKey=mode==='local'?localRoomKey(localGame):isTrial?'quest-v9-balance-trial':'quest-01-two-player-prototype';
      const selectedRoomKey=isMazeLab?mazeLabRoomKey(mode,mode==='local'?roomKey:''):roomKey;
      const object=env.GAME_ROOM.get(env.GAME_ROOM.idFromName(selectedRoomKey));
      const headers=new Headers(req.headers);
      // Never trust a client-supplied lab flag. Only this authenticated route sets it.
      headers.delete('x-dicebound-maze-lab');
      headers.set('x-dicebound-player',activeId);
      headers.set('x-dicebound-name',mode==='local'?`Local Player ${['one','two','three','four'].indexOf(activeId)+1}`:identity.name);
      if(isTrial)headers.set('x-dicebound-trial','balance-v9');
      if(isMazeLab)headers.set('x-dicebound-maze-lab','yes');
      return object.fetch(new Request('https://game-internal/connect',{headers}));
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return reply('Method not allowed',405);
    if(u.pathname.includes('/api/'))return reply('Not found',404);
    if(u.pathname===ROOT+'/play'&&u.searchParams.get('mode')==='local'){
      if(identity.id!=='one')return reply('Local games need the parent host session',403);
      const selected=activeLocalAdventure(await signedLocalHistory(req,env));
      if(!selected)return Response.redirect(u.origin+ROOT+'/',303);
      if(u.searchParams.get('seats')!==String(selected.seats))return Response.redirect(`${u.origin}${ROOT}/play?mode=local&seats=${selected.seats}`,303);
    }
    // PRIVATE ASSET GATE. Worker authenticates before serving each file.
    // Cloudflare's default root assets path works on accounts without base_path.
    const assetUrl=new URL(req.url);
    assetUrl.pathname=(u.pathname===ROOT+'/play')?'/index.html':u.pathname.slice(ROOT.length);
    const result=await env.ASSETS.fetch(new Request(assetUrl.toString(),req));
    const headers=new Headers(result.headers);headers.set('cache-control','private, no-store');headers.set('x-content-type-options','nosniff');headers.set('x-frame-options','DENY');headers.set('referrer-policy','no-referrer');
    return new Response(result.body,{status:result.status,statusText:result.statusText,headers});
  }
};

export class GameRoom extends DurableObject {
  constructor(ctx,env){super(ctx,env);this.ready=ctx.blockConcurrencyWhile(async()=>{
    this.game=await ctx.storage.get('live')||freshState();
    this.chat=ensureChat(await ctx.storage.get('chat-v1'));
    const online=new Set(ctx.getWebSockets().map(ws=>ws.deserializeAttachment()?.id).filter(Boolean));
    for(const p of Object.values(this.game.players))p.connected=online.has(p.id);
  });}
  async fetch(req){
    await this.ready;
    if(req.headers.get('upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
    const id=req.headers.get('x-dicebound-player');
    if(!['one','two','three','four'].includes(id))return new Response('Not authorised',{status:403});
    const {0:client,1:server}=Object.values(new WebSocketPair());
    for(const older of this.ctx.getWebSockets()){
      if(older.deserializeAttachment()?.id===id)older.close(4000,'Joined on another device');
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({id});
    if(req.headers.get('x-dicebound-trial')==='balance-v9')this.game.balanceTrial=true;
    ensurePlayer(this.game,id,req.headers.get('x-dicebound-name'),null);
    if(req.headers.get('x-dicebound-maze-lab')==='yes'){
      this.game.mazeLab=true;provisionMazeLabPlayer(this.game,id);
      if(this.game.players[id].classChosen)grantMazeLabEquipment(this.game,id);
    }
    resumeMazeClock(this.game,id);
    this.announce(`${this.game.players[id].name} joined the adventure.`);
    await this.persist(null);
    this.broadcast();
    this.sendChat(server);
    return new Response(null,{status:101,webSocket:client});
  }
  announce(text){this.game.log.push({at:Date.now(),text});this.game.log=this.game.log.slice(-35)}
  sendChat(ws){try{ws.send(JSON.stringify(chatForViewer(this.chat,ws.deserializeAttachment()?.id)))}catch{}}
  broadcastChat(){for(const ws of this.ctx.getWebSockets())this.sendChat(ws)}
  async handleChatPacket(ws,id,packet){
    if(packet.type==='chat-send')postChat(this.chat,{id,name:this.game.players[id].name,text:packet.text});
    else if(packet.type==='chat-mute')togglePersonalMute(this.chat,id,packet.player);
    else if(packet.type==='chat-report')reportChat(this.chat,id,packet.messageId,packet.reason);
    else if(packet.type==='chat-admin-mute')toggleAdminMute(this.chat,id,packet.player);
    else throw new Error('Unknown chat command');
    await this.ctx.storage.put('chat-v1',this.chat);
    this.broadcastChat();
  }
  broadcast(){for(const ws of this.ctx.getWebSockets()){
    try{ws.send(JSON.stringify({type:'state',state:{...publicState(this.game,ws.deserializeAttachment()?.id),maze:mazePublic(this.game,ws.deserializeAttachment()?.id)}}))}catch{}
  }}
  async persist(reason){
    // Durable live coordination data is separate from the designated adventure
    // snapshots: room entry, boss victory and checkpoint activation (Decision 114).
    await this.ctx.storage.put('live',this.game);
    if(reason)await this.ctx.storage.put('adventureSnapshot',{reason,at:Date.now(),state:this.game});
    await this.schedule();
  }
  async schedule(){
    // One clock for the whole party, even when everyone is in different quests.
    const ordinary=this.game.turn?.activePlayer===null?Infinity:this.game.turn?.deadline||Infinity;
    const nextTime=Math.min(ordinary,nextMazeDeadline(this.game));const next=Number.isFinite(nextTime)?nextTime:null;
    if(next)await this.ctx.storage.setAlarm(Math.max(Date.now()+100,next));
    else await this.ctx.storage.deleteAlarm();
  }
  async webSocketMessage(ws,msg){
    await this.ready;
    if(typeof msg!=='string'||msg.length>1500)return;
    const id=ws.deserializeAttachment()?.id;
    if(!id||!this.game.players[id]?.connected)return;
    try{
      const packet=JSON.parse(msg);
      if(!packet||typeof packet!=='object'||Array.isArray(packet))throw new Error('Invalid command');
      // Supervised chat runs outside turn order. Its messages have their own
      // bounded storage and never alter dungeon, quest or combat saves.
      if(['chat-send','chat-mute','chat-report','chat-admin-mute'].includes(packet.type)){
        await this.handleChatPacket(ws,id,packet);return;
      }
      if(this.game.players[id].mazeSlot&&!packet.type.startsWith('maze-')&&!['ping','chat-send','chat-mute','chat-report','chat-admin-mute'].includes(packet.type))throw new Error('Leave the Maze before using campaign actions');
      // All gameplay changes are gated by the same global turn owner.
      // Rolling must precede movements and tactical actions; inventory controls
      // remain available during downtime (but still respect combat rules).
      const freePackets=['ping','reset-lab'];
      const inventoryPackets=['equip','unequip','bind-enchant','class-select','character-create'];
      if(!freePackets.includes(packet.type)&&!inventoryPackets.includes(packet.type)&&packet.type!=='end-turn'&&!packet.type.startsWith('maze-'))
        assertGlobalTurn(this.game,id);
      let result;
      if(packet.type==='maze-create')result=createMaze(this.game,id,packet.slot,crypto.randomUUID());
      else if(packet.type==='maze-join')result=joinMaze(this.game,id,packet.slot);
      else if(packet.type==='maze-leave')result=leaveMaze(this.game,id);
      else if(packet.type==='maze-travel')result=mazeTravel(this.game,id,packet.dir);
      else if(packet.type==='maze-search')result=mazeSearch(this.game,id);
      else if(packet.type==='maze-claim')result=mazeClaim(this.game,id,packet.slot);
      else if(packet.type==='maze-bonus')result=mazeBonus(this.game,id);
      else if(packet.type==='maze-action')result=mazeAction(this.game,id,packet.action);
      else if(packet.type==='maze-retreat')result=mazeRetreat(this.game,id);
      else if(packet.type==='maze-reward')result=mazeReward(this.game,id,packet.category);
      else if(packet.type==='maze-abandon')result=mazeVoteAbandon(this.game,id);
      else if(packet.type==='move')result=move(this.game,id,packet.dir);
      else if(packet.type==='action'){if(packet.action?.type==='move')throw new Error('Use dice movement');result=submitSequentialAction(this.game,id,packet.action);}
      else if(packet.type==='claim')result=claimLoot(this.game,id,packet.slot);
      else if(packet.type==='claim-quest-reward')result=claimQuestReward(this.game,id,packet.quest,packet.category);
      else if(packet.type==='class-select'){result=selectClass(this.game,id,packet.klass);if(this.game.mazeLab)grantMazeLabEquipment(this.game,id);}
      else if(packet.type==='character-create'){result=createCharacter(this.game,id,packet.name,packet.klass);if(this.game.mazeLab)grantMazeLabEquipment(this.game,id);}
      else if(packet.type==='equip')result=equipItem(this.game,id,packet.itemId,packet.slot||null);
      else if(packet.type==='training-rack')result=claimTrainingRack(this.game,id);
      else if(packet.type==='enter-quest')result=enterQuest(this.game,id,packet.quest);
      else if(packet.type==='replay-quest')result=replayQuest(this.game,id,packet.quest);
      else if(packet.type==='roll-move')result=rollMovement(this.game,id);
      else if(packet.type==='end-turn')result=endTurn(this.game,id);
      else if(packet.type==='return-camp')result=returnToCamp(this.game,id);
      else if(packet.type==='finish-quest')result=voteFinishQuest(this.game,id);
      else if(packet.type==='shop-buy')result=buyFromShop(this.game,id,packet.sku);
      else if(packet.type==='shop-sell')result=sellToShop(this.game,id,packet.kind,packet.itemId);
      else if(packet.type==='resume-quest')result=resumeQuest(this.game,id);
      else if(packet.type==='unequip')result=unequipItem(this.game,id,packet.slot);
      else if(packet.type==='bind-enchant')result=bindEnchantment(this.game,id,packet.enchantId,packet.itemId);
      else if(packet.type==='potion')result=this.game.rooms[this.game.players[id].room].battle.status==='active' ? submitSequentialAction(this.game,id,{type:'potion',target:packet.target||id}) : usePotion(this.game,id,packet.target);
      else if(packet.type==='reset-lab'){
        if(id!=='one')throw new Error('Only Player One can reset this technical test adventure');
        this.game=resetTestAdventure(this.game);
        result={saved:'lab-reset'};
      }
      else if(packet.type==='ping'){ws.send(JSON.stringify({type:'pong'}));return}
      else throw new Error('Unknown command');
      await this.persist(result?.saved||null);this.broadcast();
    }catch(err){ws.send(JSON.stringify({type:'error',message:String(err.message||'Invalid action').slice(0,150)}))}
  }
  async webSocketClose(ws){await this.disconnect(ws)}
  async webSocketError(ws){await this.disconnect(ws)}
  async disconnect(ws){
    await this.ready;
    const id=ws.deserializeAttachment()?.id;
    // If same user has rejoined on another socket, do not mark them disconnected.
    const another=this.ctx.getWebSockets().some(s=>s!==ws&&s.deserializeAttachment()?.id===id&&s.readyState===1);
    if(id&&!another){markDisconnected(this.game,id);this.announce(`${this.game.players[id].name} disconnected safely.`);await this.persist(null);this.broadcast()}
  }
  async alarm(){await this.ready;const mazeChanged=mazeTick(this.game);const changes=tick(this.game);if(changes.length||mazeChanged){const save=changes.map(c=>c.result?.saved).find(Boolean);await this.persist(save||null);this.broadcast()}else await this.schedule()}
}
