const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const box={};box.globalThis=box;
for(const file of ["curriculum-data.js","content-manifest.js","game-core.js","duong-re/branch-data.js","duong-re/branch-engine.js","duong-re/branch-learning.js"])vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),box,{filename:file});
const L=box.ChimSeBranchLearning,E=box.AnBranchEngine,D=box.AnBranchStory;
function next(state,choice){const out=E.step(state,choice);assert.equal(out.ok,true,out.error);return out.state;}
function finish(state,history){let pending;while((pending=L.pending(state,history)))history=L.record(history,pending.index,{status:"correct",attempts:0,hint:false});return history;}

test("every existing task gates its reached anchor in the original learning order",()=>{
 const expected={arrival:[0],"school-gate":[1],"lost-diary":[2,3],"noodle-order":[4],"walk-home":[5,6],"day2-bird":[7,8,9]};
 let history=L.clean([]);
 for(const [anchor,tasks] of Object.entries(expected)){
  const state={node:anchor,path:[]};
  for(const index of tasks){const pending=L.pending(state,history);assert.equal(pending.index,index);assert.equal(pending.scene,box.HSKContent.scenes[index]);assert.equal(pending.meta,box.HSKCurriculum.scenes[index]);history=L.record(history,index,{status:"correct",attempts:0,hint:false});}
  assert.equal(L.pending(state,history),null);
 }
 assert.equal(history.filter(Boolean).length,10);
});

test("an existing experimental save cannot bypass earlier learning by resuming after its anchor",()=>{
 let state=E.fresh();while(!state.done){const scene=D.byId[state.node];state=next(state,scene.kind==="choice"?E.availableOptions(scene,state)[0].id:"next");}
 const restored=E.load(E.exportSave(state));let history=L.clean([]),indices=[];
 while(L.pending(restored,history)){const item=L.pending(restored,history);indices.push(item.index);history=L.record(history,item.index,{status:"correct",attempts:0,hint:false});}
 assert.deepEqual(indices,[0,1,2,3,4,5,6,7,8,9]);
 assert.equal(L.pending(restored,history),null);
});

test("all 4374 first-day routes require their seven original tasks and retain evidence through rewind",()=>{
 let routes=0;
 function walk(state,history){history=finish(state,history);if(state.node==="epilogue"){routes++;assert.equal(history.slice(0,7).every(Boolean),true);assert.equal(history.slice(7).some(Boolean),false);const first=E.load({version:1,path:[]});assert.equal(L.pending(first,history),null);return;}
  const scene=D.byId[state.node];if(scene.kind==="choice")E.availableOptions(scene,state).forEach(choice=>walk(next(state,choice.id),history));else walk(next(state,"next"),history);
 }
 walk(E.fresh(),[]);assert.equal(routes,4374);
});

test("practice supplies existing authored models and checkpoints never expose a model by default",()=>{
 const practice=L.pending({node:"arrival",path:[]},[]);assert.equal(practice.model,box.HSKContent.scenes[0].guidedModel);assert.equal(practice.checkpoint,false);
 let history=L.clean([]);for(let i=0;i<7;i++)history=L.record(history,i,{status:"correct",attempts:0,hint:false});
 const checkpoint=L.pending({node:"day2-bird",path:[]},history);assert.equal(checkpoint.index,7);assert.equal(checkpoint.checkpoint,true);assert.equal(checkpoint.model,null);
});

test("existing deterministic rubric grades input without recording personality or learning evidence",()=>{
 const history=L.clean([]),state=E.fresh(),before=JSON.stringify(state);
 assert.equal(L.evaluate(0,"我还好").ok,true);assert.equal(L.evaluate(3,"三个").ok,true);assert.equal(L.evaluate(3,"四个").ok,false);assert.equal(L.evaluate(0,"wǒ hěn hǎo").ok,false);
 assert.equal(history.some(Boolean),false);assert.equal(JSON.stringify(state),before);assert.throws(()=>L.evaluate(10,"你好"));
});

test("evidence distinguishes independent, hinted, attempted, and assisted responses and ignores forged records",()=>{
 const raw=[{status:"mastered",attempts:0,hint:false},{status:"correct",attempts:2,hint:true},{status:"assisted",attempts:4,hint:false}];
 const cleaned=L.clean(raw);assert.equal(cleaned[0],null);assert.deepEqual(JSON.parse(JSON.stringify(cleaned[1])),{status:"correct",attempts:2,hint:true});assert.equal(cleaned[2].hint,true);
 const recorded=L.record(cleaned,0,{status:"correct",attempts:0,hint:false});assert.equal(cleaned[0],null);assert.equal(recorded[0].hint,false);assert.equal(recorded[0].attempts,0);assert.equal(recorded[2].status,"assisted");
 assert.equal(L.storageKey,"chimse-branch-learning-v1");assert.throws(()=>L.record(recorded,1,{status:"wrong"}));
});
