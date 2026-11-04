/** Private-beta local adventure history; only server-signed cookie data is trusted. */
const ID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LEGACY={id:'legacy',seats:4,created:0};
const LIMIT=14;
const validSeats=(n)=>Number.isInteger(n)&&n>=1&&n<=4;
const validGame=(g)=>!!g&&(g.id==='legacy'||ID.test(g.id))&&validSeats(g.seats)&&Number.isSafeInteger(g.created)&&g.created>=0;
export function localHistory(raw){
  const supplied=Array.isArray(raw?.games)?raw.games:[];
  const games=[{...LEGACY}];const seen=new Set(['legacy']);
  for(const g of supplied){
    if(!validGame(g))continue;
    if(g.id==='legacy'){games[0]={...LEGACY,seats:g.seats};continue;}
    if(seen.has(g.id))continue;
    seen.add(g.id);games.push({id:g.id.toLowerCase(),seats:g.seats,created:g.created});
  }
  // The legacy save is always available, even before a local session cookie exists.
  const trimmed=[games[0],...games.slice(1).slice(-LIMIT)];
  const active=trimmed.some(g=>g.id===raw?.active)?raw.active:null;
  return {games:trimmed,active};
}
export function newLocalAdventure(history,seats,id,now=Date.now()){
  const current=localHistory(history);
  if(!validSeats(seats))throw new Error('Choose between one and four players');
  if(!ID.test(id)||current.games.some(g=>g.id===id))throw new Error('Invalid new adventure ID');
  if(!Number.isSafeInteger(now)||now<0)throw new Error('Invalid adventure date');
  return localHistory({games:[...current.games,{id:id.toLowerCase(),seats,created:now}],active:id.toLowerCase()});
}
export function resumeLocalAdventure(history,id,legacySeats){
  const current=localHistory(history);
  const game=current.games.find(g=>g.id===id);
  if(!game)throw new Error('That saved adventure is not available');
  if(id==='legacy'&&legacySeats!==undefined){
    if(!validSeats(legacySeats))throw new Error('Choose between one and four players');
    current.games[0]={...LEGACY,seats:legacySeats};
  }
  return {...current,active:id};
}
export function activeLocalAdventure(history){
  const current=localHistory(history);return current.games.find(g=>g.id===current.active)||null;
}
export function localRoomKey(game){
  if(!validGame(game))throw new Error('Invalid adventure');
  return game.id==='legacy'?'v1-local-four-seat-test':'v1-local-adventure-'+game.id;
}
export function seatPermitted(game,seat){
  return !!game&&['one','two','three','four'].indexOf(seat)>=0&&['one','two','three','four'].indexOf(seat)<game.seats;
}
