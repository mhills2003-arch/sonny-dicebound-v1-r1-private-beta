import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {freshState,ensurePlayer,createCharacter} from '../src/engine.mjs';
import {createMaze,joinMaze,mazePublic,mazeTravel,mazeAction,leaveMaze} from '../src/maze-play.mjs';
import {mazeLabRoomKey,provisionMazeLabPlayer,grantMazeLabEquipment} from '../src/maze-lab.mjs';
const T=1793820000000;
const users=['one','two','three','four'];

test('Maze Lab uses distinct Durable Object names for local, online and normal worlds',()=>{
 const online=mazeLabRoomKey('online');const local=mazeLabRoomKey('local','v1-local-four-seat-test');
 assert.notEqual(online,local);
 assert.notEqual(online,'quest-01-two-player-prototype');
 assert.notEqual(local,'v1-local-four-seat-test');
 assert.notEqual(mazeLabRoomKey('local','v1-local-adventure-01234567-89ab-4cde-8f12-0123456789ab'),local);
 assert.throws(()=>mazeLabRoomKey('local','quest-01-two-player-prototype'));
 assert.equal(mazeLabRoomKey('online','ignored'),online);
});

test('Maze Lab grants endgame access only in a separate lab world, once per player',()=>{
 const normal=freshState(T);const lab=freshState(T);lab.mazeLab=true;
 for(const id of users){
   const ordinary=ensurePlayer(normal,id,id);assert(!ordinary.completedQuests.includes(15));
   const player=ensurePlayer(lab,id,id);provisionMazeLabPlayer(lab,id);
   assert.equal(player.room,'camp');assert.equal(player.level,25);assert(player.completedQuests.includes(15));
   assert.equal(normal.players[id].level,1);
   const name=`Tester-${id}`;
   const klass={one:'knight',two:'outlaw',three:'warlock',four:'tinker'}[id];
   createCharacter(lab,id,name,klass,T);grantMazeLabEquipment(lab,id);
   assert.equal(player.klass,klass);
   assert(player.equipped.weapon&&player.equipped.armour);
   assert.equal(player.inventory.potions.length,10);
   assert.equal(player.inventory.consumables.length,3);
   const count=player.inventory.equipment.length;
   provisionMazeLabPlayer(lab,id);grantMazeLabEquipment(lab,id);
   assert.equal(player.inventory.equipment.length,count,'repeated connection must not duplicate items');
 }
 assert.throws(()=>createMaze(normal,'one',1,'lab-isolation-maze',T),/Quest 15/);
 createMaze(lab,'one',1,'lab-isolation-maze',T);
 for(const id of users.slice(1))joinMaze(lab,id,1,T);
 const run=lab.mazeRuns[1];assert(users.every(id=>run.positions[id]===run.map.entrance));
 const dir=Object.keys(run.map.rooms[run.map.entrance].connections)[0];
 for(const id of users)mazeTravel(lab,id,dir,T);
 for(const id of users)mazeAction(lab,id,{type:'defend'},T,()=>.5);
 assert.equal(run.fights[run.positions.one].round,2);
 for(const id of users)leaveMaze(lab,id,T);
 assert.deepEqual(normal.mazeRuns||{},{});
});

test('only authenticated Worker chooses lab header, never caller-supplied request header',()=>{
 const worker=readFileSync(new URL('../src/worker.mjs',import.meta.url),'utf8');
 const client=readFileSync(new URL('../public/app.js',import.meta.url),'utf8');
 assert.match(worker,/headers\.delete\('x-dicebound-maze-lab'\)/);
 assert.match(worker,/if\(isMazeLab\)headers\.set\('x-dicebound-maze-lab','yes'\)/);
 assert.match(worker,/mazeLabRoomKey\(mode/);
 assert.match(worker,/if\(req\.headers\.get\('x-dicebound-maze-lab'\)==='yes'\)/);
 assert.match(client,/if\(mazeLab\)u\.searchParams\.set\('mazeLab','1'\)/);
});
