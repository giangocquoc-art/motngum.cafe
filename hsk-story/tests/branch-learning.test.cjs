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

test("all condition-equivalent day-two routes keep the same final HSK anchors",()=>{
 const day2Start=D.byId.epilogue.to,requirements=[],seenGraph=new Set(),flagKeys=new Set(),traitThresholds={},relationThresholds={};
 const allowedRequirementKeys=["flag","notFlag","anyFlags","minTrait","minRelation"];
 function inspectRequirement(req){if(!req)return;for(const key of Object.keys(req))assert.ok(allowedRequirementKeys.includes(key),"Add new condition type to the route signature: "+key);
  if(req.flag)flagKeys.add(req.flag);if(req.notFlag)flagKeys.add(req.notFlag);(req.anyFlags||[]).forEach(key=>flagKeys.add(key));
  Object.entries(req.minTrait||{}).forEach(([key,value])=>(traitThresholds[key]||(traitThresholds[key]=new Set())).add(value));
  Object.entries(req.minRelation||{}).forEach(([key,value])=>(relationThresholds[key]||(relationThresholds[key]=new Set())).add(value));requirements.push(req);
 }
 function scan(id){if(seenGraph.has(id))return;seenGraph.add(id);const scene=D.byId[id];assert.ok(scene,"Missing day-two node "+id);if(scene.kind==="ending")return;
  const outgoing=scene.kind==="choice"?scene.options:scene.kind==="route"?scene.routes:[{to:scene.to}];
  for(const edge of outgoing){inspectRequirement(edge.requires);scan(edge.to);}
 }
 scan(day2Start);
 function signature(state){return JSON.stringify({flags:Array.from(flagKeys).sort().map(key=>[key,Boolean(state.flags[key])]),traits:Object.keys(traitThresholds).sort().map(key=>[key,Array.from(traitThresholds[key]).sort((a,b)=>a-b).map(value=>(state.traits[key]||0)>=value)]),relations:Object.keys(relationThresholds).sort().map(key=>[key,Array.from(relationThresholds[key]).sort((a,b)=>a-b).map(value=>(state.relationships[key]||0)>=value)])});}
 const groups=new Map();let firstDayRoutes=0;
 function visitDayOne(state){if(state.node==="epilogue"){
   const history=finish(state,[]);assert.equal(history.slice(0,7).every(Boolean),true);assert.equal(history.slice(7).some(Boolean),false);
   firstDayRoutes++;const key=signature(state),group=groups.get(key)||{state:state,count:0};group.count++;groups.set(key,group);return;
  }
  const scene=D.byId[state.node];if(scene.kind==="choice")E.availableOptions(scene,state).forEach(option=>visitDayOne(next(state,option.id)));else visitDayOne(next(state,"next"));
 }
 visitDayOne(E.fresh());assert.equal(firstDayRoutes,4374);assert.equal(groups.size,72);
 let representativeSuffixes=0,weightedFullRoutes=0;
 const expectedTasks=[7,8,9],expectedObjectives=[["introduce-self","student-identity"],["price"],["order-noodles"]];
 function visitDayTwo(state,history,seenNodes){
  assert.equal(seenNodes.has(state.node),false,"Day-two route loop at "+state.node);seenNodes.add(state.node);
  let pending;
  while((pending=L.pending(state,history))){assert.equal(state.node,"day2-bird","The shared day-two checkpoint must be at the bird scene");assert.equal(pending.index,expectedTasks[history.slice(7).filter(Boolean).length]);assert.deepEqual(Array.from(pending.meta.assessmentObjectiveIds),expectedObjectives[pending.index-7]);history=L.record(history,pending.index,{status:"correct",attempts:0,hint:false});}
  if(state.node==="day2-epilogue"){
   assert.equal(state.done,true);assert.equal(history.slice(0,10).every(Boolean),true);assert.equal(L.pending(state,history),null);representativeSuffixes++;return 1;
  }
  const scene=D.byId[state.node],options=scene.kind==="choice"?E.availableOptions(scene,state):[null];assert.ok(options.length,"No valid continuation at "+state.node);
  let count=0;for(const option of options){const choice=option?option.id:"next";count+=visitDayTwo(next(state,choice),history,new Set(seenNodes));}return count;
 }
 for(const group of groups.values())weightedFullRoutes+=group.count*visitDayTwo(group.state,Array.from({length:7},()=>({status:"correct",attempts:0,hint:false})),new Set());
 assert.equal(representativeSuffixes,3552);assert.equal(weightedFullRoutes,190944);
});

test("different complete two-day story branches expose the same ten learning tasks in the same order",()=>{
 const routes=[
  {name:"friendship",choices:{arrival:"hold-mother","school-gate":"ask-friend","lost-diary":"friend-search","staff-office":"say-simple",canteen:"help-liu","noodle-order":"share-bowl","walk-home":"invite-friend",night:"write-people","day2-breakfast":"prepare-for-guest","day2-bird":"bird-with-friend","day2-liu":"liu-stock","day2-night":"day2-letter-kind"}},
  {name:"curiosity",choices:{arrival:"look-around","school-gate":"watch-first","lost-diary":"solo-search","staff-office":"ask-again",canteen:"read-menu","noodle-order":"try-hot","walk-home":"keep-secret",night:"write-question","day2-breakfast":"confess-yesterday","day2-bird":"bird-quiet","day2-liu":"liu-menu","day2-night":"day2-letter-curious"}}
 ];
 for(const route of routes){let state=E.fresh(),history=L.clean([]),observed=[],guard=0;
  while(!state.done){if(++guard>100)throw Error(route.name+" route did not finish");let pending=L.pending(state,history);while(pending){observed.push(pending.index);history=L.record(history,pending.index,{status:"correct",attempts:0,hint:false});pending=L.pending(state,history)}
   const scene=D.byId[state.node],choice=scene.kind==="choice"?(route.choices[scene.id]||E.availableOptions(scene,state)[0]?.id):"next";assert.ok(choice,route.name+" has no available option at "+scene.id);state=next(state,choice);
  }
  assert.deepEqual(observed,[0,1,2,3,4,5,6,7,8,9],route.name+" learning objectives");
  assert.equal(history.filter(Boolean).length,10);
 }
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

test("wrong, assisted/sample, and skipped learning outcomes never mutate narrative state or award independent credit",()=>{
 let state=next(E.fresh(),"hold-mother"),history=L.clean([]);const before=JSON.stringify(state),pending=L.pending(state,history);
 assert.equal(pending.index,0);
 const wrong=L.evaluate(0,"不是正确答案");assert.equal(wrong.ok,false);assert.deepEqual(JSON.parse(JSON.stringify(state)),JSON.parse(before));assert.equal(L.pending(state,history).index,0);
 assert.throws(()=>L.record(history,0,{status:"wrong",attempts:1,hint:false}));
 assert.deepEqual(JSON.parse(JSON.stringify(state)),JSON.parse(before));assert.equal(L.pending(state,history).index,0);assert.equal(history[0],null);
 const skipped=L.record(history,0,{status:"skipped",attempts:1,hint:false});
 assert.deepEqual(JSON.parse(JSON.stringify(state)),JSON.parse(before));assert.deepEqual(JSON.parse(JSON.stringify(skipped[0])),{status:"skipped",attempts:1,hint:false});
 assert.equal(L.pending(state,skipped),null,"skip records completion so the narrative can continue");assert.notEqual(skipped[0].status,"correct","skip is not independent mastery");
 history=L.record(L.clean([]),0,{status:"assisted",attempts:2,hint:true});
 assert.deepEqual(JSON.parse(JSON.stringify(state)),JSON.parse(before));assert.deepEqual(JSON.parse(JSON.stringify(history[0])),{status:"assisted",attempts:2,hint:true});
 assert.notEqual(history[0].status,"correct","a viewed sample remains assisted evidence");
});

test("legacy day-one story save resumes at its milestone, and learning evidence survives rewind unchanged",()=>{
 const old=E.load({version:1,path:[]});let state=old,guard=0;
 while(state.node!=="epilogue"){if(++guard>50)throw Error("day-one route did not reach its saved milestone");const scene=D.byId[state.node],choice=scene.kind==="choice"?E.availableOptions(scene,state)[0]?.id:"next";assert.ok(choice);state=next(state,choice)}
 const saved=E.exportSave(state),restored=E.load(saved);assert.equal(restored.node,"epilogue");
 let history=L.clean([]);for(let i=0;i<7;i++)history=L.record(history,i,{status:i===2?"assisted":"correct",attempts:i===2?2:0,hint:i===2});
 const evidenceBefore=JSON.stringify(history),dayTwo=next(restored,"next");assert.equal(L.pending(dayTwo,history),null);
 let atBird=dayTwo,steps=0;while(atBird.node!=="day2-bird"){if(++steps>30)throw Error("resumed v1 save did not reach day two checkpoint");const scene=D.byId[atBird.node],choice=scene.kind==="choice"?E.availableOptions(scene,atBird)[0]?.id:"next";assert.ok(choice);atBird=next(atBird,choice)}
 assert.equal(L.pending(atBird,history).index,7);
 const rewindIndex=atBird.path.findIndex(p=>p.at==="walk-home"),rewound=E.load({version:1,path:atBird.path.slice(0,rewindIndex)});
 assert.equal(rewound.node,"walk-home");assert.equal(JSON.stringify(history),evidenceBefore);assert.equal(L.pending(rewound,history),null);
});

test("evidence distinguishes independent, hinted, attempted, and assisted responses and ignores forged records",()=>{
 const raw=[{status:"mastered",attempts:0,hint:false},{status:"correct",attempts:2,hint:true},{status:"assisted",attempts:4,hint:false}];
 const cleaned=L.clean(raw);assert.equal(cleaned[0],null);assert.deepEqual(JSON.parse(JSON.stringify(cleaned[1])),{status:"correct",attempts:2,hint:true});assert.equal(cleaned[2].hint,true);
 const recorded=L.record(cleaned,0,{status:"correct",attempts:0,hint:false});assert.equal(cleaned[0],null);assert.equal(recorded[0].hint,false);assert.equal(recorded[0].attempts,0);assert.equal(recorded[2].status,"assisted");
 assert.equal(L.storageKey,"chimse-branch-learning-v1");assert.throws(()=>L.record(recorded,1,{status:"wrong"}));
});

test("objective-keyed evidence round-trips while preserving the legacy lesson-index record",()=>{
 let history=L.clean([]);history=L.record(history,0,{status:"correct",attempts:0,hint:false});history=L.record(history,7,{status:"skipped",attempts:1,hint:false});history=L.record(history,5,{status:"assisted",attempts:2,hint:true});
 const saved=L.objectiveEvidence(history);
 assert.equal(saved.version,1);assert.equal(saved.objectives.greeting[0].taskId,"chimse.hsk1-demo.scene.0");
 assert.equal(saved.objectives["introduce-self"].find(x=>x.taskId==="chimse.hsk1-demo.scene.7").status,"skipped");
 assert.equal(saved.objectives.gratitude.find(x=>x.taskId==="chimse.hsk1-demo.scene.5").status,"assisted");
 assert.equal(JSON.stringify(L.fromObjectiveEvidence(saved)),JSON.stringify(history));
 assert.equal(L.storageKey,"chimse-branch-learning-v1");assert.equal(L.objectiveStorageKey,"chimse-branch-objective-evidence-v1");
});

test("objective evidence is credited only to the objective directly tested by each canonical answer",()=>{
 let history=L.clean([]);
 for(const index of [0,1,2,3,4,5,6,7,8,9])history=L.record(history,index,{status:"correct",attempts:0,hint:false});
 const objectives=L.objectiveEvidence(history).objectives;
 assert.deepEqual(Object.keys(objectives).sort(),["farewell","gratitude","greeting","introduce-self","numbers","order-noodles","price","student-identity"].sort());
 assert.deepEqual(Array.from(objectives.greeting,x=>x.taskId),["chimse.hsk1-demo.scene.0"]);
 assert.deepEqual(Array.from(objectives["introduce-self"],x=>x.taskId),["chimse.hsk1-demo.scene.1","chimse.hsk1-demo.scene.7"]);
 assert.deepEqual(Array.from(objectives["student-identity"],x=>x.taskId),["chimse.hsk1-demo.scene.2","chimse.hsk1-demo.scene.7"]);
 assert.deepEqual(Array.from(objectives.numbers,x=>x.taskId),["chimse.hsk1-demo.scene.3"]);
 assert.deepEqual(Array.from(objectives.price,x=>x.taskId),["chimse.hsk1-demo.scene.8"]);
 assert.deepEqual(Array.from(objectives.gratitude,x=>x.taskId),["chimse.hsk1-demo.scene.5"]);
 assert.deepEqual(Array.from(objectives["order-noodles"],x=>x.taskId),["chimse.hsk1-demo.scene.4","chimse.hsk1-demo.scene.9"]);
 assert.deepEqual(Array.from(objectives.farewell,x=>x.taskId),["chimse.hsk1-demo.scene.6"]);
});

test("legacy objective evidence with a mismatched objective-to-scene key is ignored",()=>{
 const restored=L.fromObjectiveEvidence({version:1,objectives:{
  greeting:[{taskId:"chimse.hsk1-demo.scene.8",status:"correct",attempts:0,hint:false}],
  price:[{taskId:"chimse.hsk1-demo.scene.8",status:"assisted",attempts:2,hint:true}],
  "order-noodles":[{taskId:"chimse.hsk1-demo.scene.99",status:"correct",attempts:0,hint:false}]
 }});
 assert.equal(restored[0],null);
 assert.equal(restored[8].status,"assisted");
 assert.equal(restored[9],null);
});
