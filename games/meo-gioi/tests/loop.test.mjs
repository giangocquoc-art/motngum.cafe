import test from 'node:test';
import assert from 'node:assert/strict';
import {questSpec, questState, acceptQuest, recordRatDefeat, claimQuest, buy, faintPenalty, MAX_UPGRADE} from '../overrides/src/gameplay/loop.mjs';

test('New quests start at 0, no progress for unaccepted quest',()=>{
 const p=questState('new');assert.equal(recordRatDefeat(p).added,false);
 const q=acceptQuest(p);assert.equal(q.state,'active');assert.equal(q.count,0);
});
test('Quest completes exactly once and restarts at 0',()=>{
 let p=acceptQuest(questState('new'));
 const target=questSpec(0).target;
 for(let i=0;i<target+4;i++)p=recordRatDefeat(p).progress;
 assert.equal(p.count,target);
 const reward=claimQuest(p);
 assert.equal(reward.claimed,true);assert.equal(reward.gold,60);
 assert.equal(claimQuest(reward.progress).claimed,false);
 const next=acceptQuest(reward.progress);
 assert.equal(next.state,'active');assert.equal(next.count,0);assert.equal(next.completed,1);
});
test('Quest target and rewards have caps',()=>{
 assert.deepEqual(questSpec(0),{target:5,gold:60});
 assert.deepEqual(questSpec(1000),{target:10,gold:180});
 assert.deepEqual(questSpec(-5),questSpec(0));
});
test('No shop purchases on invalid actions or insufficient gold',()=>{
 const base={gold:0,hp:20,maxHp:150,upgrades:0};
 assert.equal(buy('upgrade',base).ok,false);
 assert.equal(buy('fish',base).ok,false);
 assert.equal(buy('unknown',{...base,gold:300}).ok,false);
});
test('Healing caps to maxHp; full hp cannot spend money on health',()=>{
 const r=buy('fish',{gold:100,hp:110,maxHp:150,upgrades:0});
 assert.equal(r.ok,true);assert.equal(r.hp,150);assert.equal(r.gold,75);
 assert.equal(buy('fish',{gold:75,hp:150,maxHp:150,upgrades:0}).ok,false);
});
test('Upgrade has strict ceiling; prevents overspending',()=>{
 let state={gold:1000,hp:120,maxHp:150,upgrades:0};
 for(let i=0;i<MAX_UPGRADE;i++)state={...state,...buy('upgrade',state)};
 assert.equal(state.upgrades,MAX_UPGRADE);
 assert.equal(buy('upgrade',state).ok,false);
});
test('Death penalty is capped and never makes balance negative',()=>{
 assert.equal(faintPenalty(0),0);assert.equal(faintPenalty(50),5);
 assert.equal(faintPenalty(1000000),15);
});
test('Corrupt progression never creates infinite targets or rewards',()=>{
 assert.deepEqual(questState('active',Infinity,NaN),{state:'active',count:0,completed:0});
 assert.equal(claimQuest({state:'new',count:9999,completed:0}).claimed,false);
});
