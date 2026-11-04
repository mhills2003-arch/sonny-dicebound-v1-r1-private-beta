import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');
const engine=readFileSync(new URL('../src/engine.mjs',import.meta.url),'utf8');

test('enchant descriptions are accurate to the engine and shown for unbound and bound items',()=>{
 assert.match(engine,/school==='Sharpness'\?3:2/);
 assert.match(js,/case 'Sharpness':return `Weapon only · raises the attack die maximum by \+\$\{level\*3\}/);
 assert.match(js,/case 'Fortification':return `Armour only · raises the armour die maximum by \+\$\{level\*2\}/);
 assert.match(engine,/\.slice\(0,Math\.max\(1,stats\.multishot\)\)/);
 assert.match(js,/Main-hand bow only · a normal shot can strike up to/);
 assert.match(js,/Permanently bound/);
 assert.match(js,/enchant-effect/);
 assert.match(css,/\.enchant-effect\{/);
});
test('tablet portal arrows use normal movement, never bypassing global turns',()=>{
 assert.match(js,/const portalArrows=\{\}/);
 assert.match(js,/\$\('canvasWrap'\)\.append\(btn\)/);
 assert.match(js,/btn\.addEventListener\('click',\(\)=>requestMove\(dir\)\)/);
 assert.match(js,/me\.lastRolledTurn===turn\.round/);
 assert.match(js,/me\.moveRemaining>0/);
 assert.match(js,/turn\.activePlayer===me\.id/);
 // Doorways scale with 9×7 Beginner/Easy, 13×9 Medium, and 15×11 Hard/Extreme arenas.
 assert.match(js,/const roomSize=id=>roomDef\(id\)\.quest>=10\?\{width:15,height:11\}:roomDef\(id\)\.quest>=5\?\{width:13,height:9\}:\{width:9,height:7\}/);
 assert.match(js,/const doorRow=id=>Math\.floor\(roomSize\(id\)\.height\/2\)/);
 assert.match(js,/btn\.disabled=!canMove\|\|me\.y!==doorRow\(me\.room\)\|\|me\.x!==\(west\?0:roomSize\(me\.room\)\.width-1\)/);
 assert.match(css,/\.portal-arrow\{/);
 assert.match(html,/id="canvasWrap"/);
});
test('chat remains outside player turn actions, with separate storage',()=>{
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert.match(worker,/storage\.get\('chat-v1'\)/);
 assert.match(worker,/storage\.put\('chat-v1',this\.chat\)/);
 assert.match(worker,/await this\.handleChatPacket\(ws,id,packet\);return;/);
 assert.match(html,/id="chatDrawer"/);
});
