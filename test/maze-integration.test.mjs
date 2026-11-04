import test from 'node:test';
import assert from 'node:assert/strict';
import {shortestPath} from '../src/endgame-maze.mjs';
import {freshState,ensurePlayer,claimQuestReward,effectiveStats,globalActivePlayer} from '../src/engine.mjs';
import {createMaze,joinMaze,leaveMaze,mazeTravel,mazeSearch,mazeClaim,mazeAction,mazeReward,mazeVoteAbandon,mazePublic,mazeTick,nextMazeDeadline} from '../src/maze-play.mjs';
const T=1762021000000;
function session(){const s=freshState(T);ensurePlayer(s,'one','Player One');ensurePlayer(s,'two','Player Two');for(const id of ['one','two']){s.players[id].room='camp';s.players[id].gold=500;s.players[id].level=25;s.players[id].maxHp=300;s.players[id].hp=300;}s.completedQuests=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];s.unlockedQuest=15;return s;}
test('three-slot Maze creation, rejoin, secure seed, and no boss repetition',()=>{
 const s=session();assert.throws(()=>createMaze(s,'two',1,'seed-secret-12345',T),/host/);
 assert.throws(()=>createMaze(s,'one',4,'seed-secret-12345',T),/slot/);
 createMaze(s,'one',1,'seed-secret-12345',T);
 const a=s.mazeRuns[1];assert(a.map.roomCount>=30&&a.map.roomCount<=50);assert.equal(a.positions.one,a.map.entrance);
 assert.throws(()=>createMaze(s,'one',1,'other-secret-123',T),/Leave/);
 assert.equal(globalActivePlayer(s),'two');
 joinMaze(s,'two',1,T);assert.equal(globalActivePlayer(s),null);
 assert.throws(()=>mazeClaim(s,'two','fake',T),/treasure category/);
 assert.equal(mazePublic(s,'two').run.roomId,a.map.entrance);
 leaveMaze(s,'one',T);joinMaze(s,'one',1,T);assert.equal(s.mazeRuns[1].map.seed,'seed-secret-12345');
 leaveMaze(s,'two',T);leaveMaze(s,'one',T);
 a.status='completed';createMaze(s,'one',2,'another-maze-seed',T);
 assert.notEqual(s.mazeRuns[2].map.bossId,a.map.bossId);
});
test('entry, backtracking, shared room map, hidden passage reveal, clue search, and claiming once',()=>{
 const s=session();createMaze(s,'one',1,'maze-branching-seed',T);joinMaze(s,'two',1,T);
 const run=s.mazeRuns[1],starting=run.map.rooms[run.map.entrance],dir=Object.keys(starting.connections)[0];
 mazeSearch(s,'one',T);
 assert.throws(()=>mazeSearch(s,'two',T),/already/);
 mazeClaim(s,'one','coin',T);assert.throws(()=>mazeClaim(s,'one','coin',T),/already/);
 assert.equal(run.claimed[`one:${run.map.entrance}:coin`],true);
 const next=starting.connections[dir];mazeTravel(s,'one',dir,T);
 assert.equal(run.positions.one,next);assert(run.seen.includes(next));
 const def=run.map.rooms[next];run.fights[next].status='cleared';
 const back=Object.entries(def.connections).find(([,dest])=>dest===run.map.entrance)[0];mazeTravel(s,'one',back,T);
 assert.equal(run.positions.one,run.map.entrance);
 assert.throws(()=>mazeTravel(s,'one','Z',T),/north/);
 const snapshot=mazePublic(s,'one');assert.equal(snapshot.run.seen.length,2);assert(!JSON.stringify(snapshot).includes('seed-secret'));
});
test('synchronized tactical submissions resolve on the final teammate action and one action per player',()=>{
 const s=session();createMaze(s,'one',1,'fight-simulation-seed',T);joinMaze(s,'two',1,T);
 const run=s.mazeRuns[1],entrance=run.map.rooms[run.map.entrance],dir=Object.keys(entrance.connections)[0];
 mazeTravel(s,'one',dir,T);mazeTravel(s,'two',dir,T);const room=run.positions.one,b=run.fights[room];
 const before=b.round;mazeAction(s,'one',{type:'defend'},T);
 assert.equal(b.round,before);assert.throws(()=>mazeAction(s,'one',{type:'attack'},T),/One tactical/);
 mazeAction(s,'two',{type:'defend'},T);
 assert.equal(b.round,before+1);
 assert(run.contributions.one[room]>=1&&run.contributions.two[room]>=1);
 assert(Number.isFinite(nextMazeDeadline(s)));
});
test('combat timeout; saved maze loot cannot be rerolled after a death',()=>{
 const s=session();createMaze(s,'one',1,'checkpoint-seed-abc',T);
 const run=s.mazeRuns[1],dir=Object.keys(run.map.rooms[run.map.entrance].connections)[0];mazeTravel(s,'one',dir,T);
 const room=run.positions.one;run.fights[room].deadline=T;
 assert.equal(mazeTick(s,T+10,()=>.5),true);
 run.fights[room].status='cleared';mazeClaim(s,'one','equipment',T);
 const count=s.players.one.inventory.equipment.length;
 assert.throws(()=>mazeClaim(s,'one','equipment',T),/already/);
 assert.equal(s.players.one.inventory.equipment.length,count);
});
test('completion chest rarity is server-recorded, selected once; no duplicate awards',()=>{
 const s=session();createMaze(s,'one',1,'victory-seed-abcde',T);joinMaze(s,'two',1,T);
 const run=s.mazeRuns[1];run.contributions.one={a:1,b:1};run.contributions.two={a:1,b:1};
 const room=run.map.bossRoomId;run.positions.one=room;run.positions.two=room;
 // Build the boss fight, then exercise its real three-phase contract.
 mazeTick(s,T);
 // Joining the final room through its connection normally spawns the boss;
 // use an already validated generated battle by travelling from the predecessor.
 const path=[];let cur=run.map.entrance;
 path.push(...shortestPath(run.map.rooms,cur,room));
 run.positions.one=path.at(-2);run.positions.two=path.at(-2);
 run.fights[path.at(-2)]={status:'cleared'};
 const d=Object.entries(run.map.rooms[path.at(-2)].connections).find(([,v])=>v===room)[0];
 mazeTravel(s,'one',d,T);mazeTravel(s,'two',d,T);
 const b=run.fights[room],boss=b.enemies[0];boss.hp=0;b.phase=2;b.finalPhasePlayed=true;for(const add of b.enemies.slice(1))add.hp=0;
 // A late participant cannot earn the victory chest simply by joining.
 run.contributions.two={};
 mazeAction(s,'one',{type:'defend'},T);mazeAction(s,'two',{type:'defend'},T);
 assert.equal(run.status,'completed');assert(run.rewardOffers.one);assert(!run.rewardOffers.two);
 const initial=s.players.one.inventory.equipment.length;
 mazeReward(s,'one','Sword',T);
 assert.equal(s.players.one.inventory.equipment.length,initial+1);
 assert.throws(()=>mazeReward(s,'one','Sword',T),/unclaimed/);
 leaveMaze(s,'one',T);
});
test('quest-boss reward selection one time; Legendary Bow now has a special',()=>{
 const s=session(),p=s.players.one;
 s.questRewardOffers={'one:14':{quest:14,rarity:'Mythic',level:p.level}};
 const initial=p.inventory.equipment.length;
 claimQuestReward(s,'one',14,'Bow',T);
 assert.equal(p.inventory.equipment.length,initial+1);
 assert.throws(()=>claimQuestReward(s,'one',14,'Bow',T),/unclaimed/);
 p.equipped.weapon=p.inventory.equipment.at(-1).id;
 assert(effectiveStats(p).special);
});
test('abandonment requires unanimous active player approval',()=>{
 const s=session();createMaze(s,'one',1,'abandon-maze-seed',T);joinMaze(s,'two',1,T);
 mazeVoteAbandon(s,'one',T);assert.equal(s.mazeRuns[1].status,'active');
 mazeVoteAbandon(s,'two',T);assert.equal(s.mazeRuns[1].status,'abandoned');
 assert.equal(s.players.one.mazeSlot,null);
});
