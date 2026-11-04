import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {localHistory,newLocalAdventure,resumeLocalAdventure,activeLocalAdventure,localRoomKey,seatPermitted} from '../src/local-adventures.mjs';
const first='123e4567-e89b-42d3-a456-426614174000';
const second='223e4567-e89b-42d3-a456-426614174001';

test('an existing pre-upgrade local beta adventure can still be resumed',()=>{
 const old=localHistory(null);
 assert.equal(old.games[0].id,'legacy');
 const resumed=resumeLocalAdventure(old,'legacy',2);
 assert.equal(activeLocalAdventure(resumed).seats,2);
 assert.equal(localRoomKey(activeLocalAdventure(resumed)),'v1-local-four-seat-test');
 assert.equal(seatPermitted(activeLocalAdventure(resumed),'three'),false);
 assert.equal(seatPermitted(activeLocalAdventure(resumed),'two'),true);
 assert.equal(localHistory(resumed).games[0].seats,2,'remember legacy seat count for next resume');
});
test('starting four players does not join or overwrite previous two-player game',()=>{
 const old=resumeLocalAdventure(localHistory(null),'legacy',2);
 const newer=newLocalAdventure(old,4,first,1810000000000);
 const current=activeLocalAdventure(newer);
 assert.equal(current.seats,4);
 assert.equal(localRoomKey(current),'v1-local-adventure-'+first);
 assert.notEqual(localRoomKey(current),localRoomKey(activeLocalAdventure(old)));
 assert.deepEqual(['one','two','three','four'].map(p=>seatPermitted(current,p)),[true,true,true,true]);
 assert.equal(newer.games.some(g=>g.id==='legacy'),true);
 const oldAgain=resumeLocalAdventure(newer,'legacy',2);
 assert.equal(localRoomKey(activeLocalAdventure(oldAgain)),'v1-local-four-seat-test');
 assert.equal(activeLocalAdventure(oldAgain).seats,2);
 const returnNew=resumeLocalAdventure(oldAgain,first,4);
 assert.equal(localRoomKey(activeLocalAdventure(returnNew)),'v1-local-adventure-'+first);
});
test('multiple new local adventures remain independent and can each be resumed',()=>{
 const firstWorld=newLocalAdventure(localHistory(null),2,first,1810000000000);
 const secondWorld=newLocalAdventure(firstWorld,4,second,1810000000100);
 assert.notEqual(localRoomKey(firstWorld.games[1]),localRoomKey(secondWorld.games[2]));
 assert.equal(activeLocalAdventure(secondWorld).seats,4);
 assert.equal(activeLocalAdventure(resumeLocalAdventure(secondWorld,first)).seats,2);
});
test('invalid or forged room names, seat counts and session IDs cannot be selected',()=>{
 assert.throws(()=>newLocalAdventure(null,5,first),/between one and four/);
 assert.throws(()=>newLocalAdventure(null,2,'../../private'),/Invalid new adventure ID/);
 assert.throws(()=>resumeLocalAdventure(localHistory(null),'../../private'),/not available/);
 assert.equal(localRoomKey(localHistory(null).games[0]),'v1-local-four-seat-test');
 assert.deepEqual(localHistory({games:[{id:'../../oops',seats:9,created:0}],active:'../../oops'}).games,[{id:'legacy',seats:4,created:0}]);
 assert.equal(seatPermitted({seats:2},'four'),false);
 assert.equal(seatPermitted({seats:4},'not-a-seat'),false);
});
test('the beta landing and websocket enforce a POST-based signed adventure selection',()=>{
 const s=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 assert.match(s,/name="action" value="new"/);
 assert.match(s,/name="action" value="resume"/);
 assert.match(s,/const roomKey=mode==='local'\?localRoomKey\(localGame\)/);
 assert.match(s,/signedLocalHistory\(req,env\)/);
 assert.match(s,/if\(!goodOrigin\(req\)\)return reply\('Origin mismatch\.',403\)/);
 assert.match(s,/seatPermitted\(localGame,seat\)/);
 assert.match(s,/localCookie\(updated,env,req\)/);
 assert.match(s,/HttpOnly; SameSite=Strict/);
 assert.match(s,/if\(!selected\)return Response\.redirect/);
 assert.doesNotMatch(s, /mode==='local'\?'v1-local-four-seat-test'/);
});
test('automatic local End Turn handoff remains enabled and character creation advances to next seat',()=>{
 const js=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(js,/localTurnHandoff\(pendingLocalEndTurn,id,msg\.state,seatIds\)/);
 assert.match(js,/pendingLocalCharacterSetup===id/);
 assert.match(js,/selectSeat\(next\)/);
 assert.match(js,/pendingLocalCharacterSetup=activeSeat/);
});
