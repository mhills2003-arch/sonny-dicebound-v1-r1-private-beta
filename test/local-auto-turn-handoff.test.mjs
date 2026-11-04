import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {localTurnHandoff} from '../public/local-turn-handoff.mjs';

const pending={actor:'one',round:5,revision:24};
const seats=['one','two','three','four'];
const snapshot=(actor,revision=25,round=5)=>({revision,turn:{activePlayer:actor,round}});

test('accepted End Turn passes a two-player local game to Player 2',()=>{
  assert.deepEqual(localTurnHandoff(pending,'two',snapshot('two'),seats),{status:'switch',seat:'two'});
});
test('the same procedure continues through Player 3, Player 4 and wraps',()=>{
  for(const [from,to,round] of [['two','three',5],['three','four',5],['four','one',6]]){
    const request={actor:from,round:5,revision:24};
    assert.deepEqual(localTurnHandoff(request,to,snapshot(to,25,round),seats),{status:'switch',seat:to});
  }
});
test('stale broadcasts and snapshots for another seat do not hijack input',()=>{
  assert.deepEqual(localTurnHandoff(pending,'two',snapshot('two',24),seats),{status:'waiting'});
  assert.deepEqual(localTurnHandoff(pending,'one',snapshot('two'),seats),{status:'waiting'});
  assert.deepEqual(localTurnHandoff(pending,'four',snapshot('two'),seats),{status:'waiting'});
  assert.deepEqual(localTurnHandoff(pending,'five',snapshot('five'),seats),{status:'waiting'});
});
test('solo or unavailable remaining seats stay selected when next round begins',()=>{
  assert.deepEqual(localTurnHandoff(pending,'one',snapshot('one',25,6),seats),{status:'finished'});
  assert.deepEqual(localTurnHandoff(pending,'one',snapshot(null,25,6),seats),{status:'finished'});
});
test('beta only auto-hands off after player presses End Turn, not for online mode',()=>{
  const ui=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
  assert.match(ui,/if\(localMode&&seatIds\.length>1&&state\?\.turn\?\.activePlayer===activeSeat/);
  assert.match(ui,/pendingLocalEndTurn=\{actor:activeSeat,round:state\.turn\.round,revision:state\.revision\}/);
  assert.match(ui,/\$\('endTurnBtn'\)\.onclick=endTurnAndPassDevice/);
  assert.match(ui,/\$\('endTurnQuickBtn'\)\.onclick=endTurnAndPassDevice/);
  assert.match(ui,/b\.addEventListener\('click',\(\)=>selectSeat\(id,\{manual:true\}\)\)/);
});
