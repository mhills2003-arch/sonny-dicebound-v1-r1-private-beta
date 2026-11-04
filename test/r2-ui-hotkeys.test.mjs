import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {resolveHotkey,R2_HOTKEYS} from '../public/hotkeys.mjs';
const root=new URL('../',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
const event=(key,other={})=>({key,repeat:false,ctrlKey:false,metaKey:false,altKey:false,isComposing:false,...other});
const required={r:'roll',e:'end',a:'attack',i:'inventory',f:'fortify',c:'camp',p:'items',s:'special',l:'log',q:'quests'};
for(const [key,action] of Object.entries(required)){
 test(`R2 shortcut ${key.toUpperCase()} maps to ${action}`,()=>{
  assert.equal(R2_HOTKEYS[key],action);
  assert.equal(resolveHotkey(event(key)),action);
  assert.equal(resolveHotkey(event(key.toUpperCase())),action);
 });
}
for(const [key,dir] of [['ArrowUp','N'],['ArrowDown','S'],['ArrowLeft','W'],['ArrowRight','E']]){
 test(`Arrow key ${key} moves ${dir}`,()=>assert.equal(resolveHotkey(event(key)),'move:'+dir));
}
test('WASD no longer steals action-key input',()=>{
 assert.equal(resolveHotkey(event('a')),'attack');
 assert.equal(resolveHotkey(event('s')),'special');
 assert.equal(resolveHotkey(event('w')),null);
 assert.equal(resolveHotkey(event('d')),null);
});
test('old Space attack still works',()=>assert.equal(resolveHotkey(event(' ')),'attack'));
test('shortcuts cannot fire during typing or modal dialog',()=>{
 for(const [opts,e] of [[{typing:true},event('e')],[{modalOpen:true},event('p')]])assert.equal(resolveHotkey(e,opts),null);
});
test('modified and held keys cannot repeat a turn action',()=>{
 for(const flag of ['altKey','ctrlKey','metaKey','repeat','isComposing'])assert.equal(resolveHotkey(event('e',{[flag]:true})),null);
});
test('four actual class sprites exist as transparent PNGs',()=>{
 for(const klass of ['knight','outlaw','warlock','tinker']){
  const b=readFileSync(new URL(`public/assets/class-pieces/${klass}.png`,root));
  assert.equal(b.subarray(1,4).toString(),'PNG');
  assert.equal(b.readUInt32BE(16),320);
  assert.equal(b.readUInt32BE(20),320);
  assert.equal(b[25],6,'RGBA PNG required for transparent game pieces');
 }
});
test('canvas and player roster choose class art, never player-seat art',()=>{
 const app=read('public/app.js');
 assert.match(app,/pic\.src=paths\[p\.klass\]/);
 assert.match(app,/images\[kind==='enemy'\?'d8':\(p\.klass\|\|'knight'\)\]/);
 assert.match(app,/P\$\{i\+1\}/);
});
test('R2 actions reuse existing server validated actions',()=>{
 const app=read('public/app.js');
 for(const packet of ["type:'roll-move'","type:'end-turn'","type:'defend'","type:'special'","type:'attack'"])assert.ok(app.includes(packet),packet);
});
test('all R2 buttons and item drawer have unique HTML ids',()=>{
 const html=read('public/index.html');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length);
 for(const id of ['searchDrawerToggle','searchSidebar','inventoryShortcutBtn','heroPortrait','itemsMenuBtn','itemsDrawer','itemsActions','itemsCloseBtn','r2BackpackBtn','r2CombatSuppliesBtn'])assert.ok(ids.includes(id),id);
});
test('unchanged Worker and durable object config targets beta, not live V1',()=>{
 const config=read('wrangler.toml');
 assert.match(config,/name = "sonny-dicebound-v1-r1-private-beta"/);
 assert.match(config,/html_handling = "none"/);
 assert.doesNotMatch(config,/^\s*(?:base_path|route|routes)\s*=/m);
});
test('new action row and search panel remain collapsible',()=>{
 const css=read('public/styles.css');
 assert.match(css,/\.side-left\.r2-open/);
 assert.match(css,/\.action-dock\.r2-action-bar/);
 assert.match(css,/\.r2-items-drawer\[hidden\]/);
});
