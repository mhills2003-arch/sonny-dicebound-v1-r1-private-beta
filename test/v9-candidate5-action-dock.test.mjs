import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
const css=readFileSync(new URL('../public/styles.css',import.meta.url),'utf8');

test('Roll, Attack, Heal and End Turn share the right-side action dock, outside map squares',()=>{
  assert.match(html,/<div class="board-and-actions"[\s\S]*?<div class="canvas-wrap"[\s\S]*?<aside class="action-dock"/);
  const dock=html.split('<aside class="action-dock"')[1].split('</aside>')[0];
  for(const id of ['rollMoveBtn','attackBtn','potionBtn','potionAllyBtn','specialBtn','defendBtn','reviveBtn','endTurnQuickBtn']){
    assert.match(dock,new RegExp('id="'+id+'"'),id+' missing from action dock');
    assert.equal((html.match(new RegExp('id="'+id+'"','g'))||[]).length,1,id+' duplicated');
  }
  assert.match(css,/\.action-dock .end-turn-overlay\{position:static/);
  assert.match(css,/\.action-dock\{height:min\(100%,345px\)/);
});

test('browser movement no longer rejects current global actor on stale battle-local round',()=>{
  const clientMove=js.split('function requestMove(dir){')[1].split('const doorPanel=')[0];
  assert.doesNotMatch(clientMove,/eligibleRound|join this fight next round/);
  assert.match(clientMove,/state\.turn\?\.activePlayer!==me\.id/);
  assert.match(js,/\$\('endTurnQuickBtn'\)\.onclick=\(\)=>send\(\{type:'end-turn'\}\)/);
});
