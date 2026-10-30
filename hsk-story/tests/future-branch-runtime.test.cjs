const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const R=require("../future-branch-runtime.js"),F=require("../future-acts.js"),B=require("../learning-blueprint.js");

function fullChoiceSets(){
 const episodes=F.byLevel(2).episodes;
 return Array.from({length:1<<episodes.length},(_,mask)=>Object.fromEntries(episodes.map((episode,index)=>[episode.id,episode.decision.choices[(mask>>index)&1].id])));
}
function play(choiceByEpisode){
 let progress=R.freshProgress(),guard=0;
 while(guard++<100){
  const inspected=R.inspectProgress(progress);assert.equal(inspected.ok,true,inspected.error);
  const current=inspected.progress.cursorNodeId,node=R.compiled.graph.byId[current];
  if(node.type==="story-decision"&&inspected.route.awaitingDecisionId===current){
   const moved=R.choose(progress,choiceByEpisode[node.episodeId]);assert.equal(moved.ok,true,moved.error);progress=moved.progress;
  }else{
   const moved=R.advance(progress);assert.equal(moved.ok,true,moved.error);progress=moved.progress;if(moved.done)return {progress,route:R.routePath(progress.choices)};
  }
 }
 throw new Error("Author preview did not reach its ending");
}

test("HSK2 internal graph has explicit reactions, joins, callbacks and common staged objectives",()=>{
 assert.equal(R.compiled.ok,true,R.compiled.errors&&R.compiled.errors.join("; "));
 const graph=R.compiled.graph;
 assert.equal(graph.playable,false);
 assert.equal(R.validateGraph().length,0);
 assert.equal(graph.nodes.filter(node=>node.type==="story-decision").length,4);
 assert.equal(graph.nodes.filter(node=>node.type==="choice-reaction").length,8);
 assert.equal(graph.nodes.filter(node=>node.type==="story-callback").length,8);
 assert.equal(graph.nodes.filter(node=>node.type==="shared-convergence").length,4);
 assert.equal(graph.nodes.filter(node=>node.type==="learning-anchor"&&node.stage==="intro").length,6);
 assert.equal(graph.nodes.filter(node=>node.type==="learning-anchor"&&node.stage==="reuse").length,6);
 assert.equal(graph.nodes.filter(node=>node.type==="learning-anchor"&&node.stage==="checkpoint").length,6);
});
test("future curriculum and author-preview source files stay out of the public Vercel package",()=>{
 const ignore=fs.readFileSync(path.join(__dirname,"../.vercelignore"),"utf8").split(/\r?\n/).map(line=>line.trim());
 for(const file of ["future-branch-runtime.js","future-branch-decisions.json","future-acts.js","learning-blueprint.js","candidate-source-index.json","hsk30-syllabus-inventory.json"])assert.ok(ignore.includes(file),file+" must remain authoring-only");
});

test("all 16 HSK2 narrative paths converge to identical learning opportunities",()=>{
 let commonAnchors=null;
 for(const choices of fullChoiceSets()){
  const {progress,route}=play(choices),path=route.path;
  assert.equal(route.awaitingDecisionId,null);
  assert.equal(path.filter(id=>R.compiled.graph.byId[id].type==="shared-convergence").length,4);
  const selectedCallbacks=path.filter(id=>R.compiled.graph.byId[id].type==="story-callback");
  assert.equal(selectedCallbacks.length,4);
  for(const [episodeId,choiceId] of Object.entries(choices)){
   const decision=F.byLevel(2).episodes.find(episode=>episode.id===episodeId).decision;
   const chosen=decision.choices.find(option=>option.id===choiceId),other=decision.choices.find(option=>option.id!==choiceId);
   assert.ok(path.includes(chosen.branchSceneId),"selected reaction appears");
   assert.ok(path.includes(chosen.laterConsequence.sceneId),"selected callback appears");
   assert.ok(!path.includes(other.branchSceneId),"unchosen reaction stays out of this route");
   assert.ok(!path.includes(other.laterConsequence.sceneId),"unchosen callback stays out of this route");
  }
  const anchors=path.filter(id=>R.compiled.graph.byId[id].type==="learning-anchor");
  assert.equal(anchors.length,18);
  if(!commonAnchors)commonAnchors=anchors;else assert.deepEqual(anchors,commonAnchors);
  assert.equal(progress.choices.length,4);
 }
});

test("plot persistence stores only the versioned route path and choices; callbacks and memories derive on reload",()=>{
 const choices={misunderstanding:"write-message", "street-map":"ask-worker", "market-money":"choose-favorite"};
 let p=playPartial(choices),saved=R.saveProgress(p);
 assert.equal(saved.ok,true);
 assert.deepEqual(Object.keys(saved.save).sort(),["actId","choices","scenePath","schemaVersion"]);
 assert.equal(JSON.stringify(saved.save).includes("memory"),false);
 assert.equal(Object.prototype.hasOwnProperty.call(saved.save,"callbacks"),false);
 assert.equal(JSON.stringify(saved.save).includes("Tiểu Vũ vẫn giữ tin nhắn cũ"),false);
 assert.ok(saved.save.scenePath.every(id=>typeof id==="string"));
 const loaded=R.inspectProgress(saved.save);assert.equal(loaded.ok,true);
 assert.equal(loaded.progress.cursorNodeId,p.cursorNodeId);
 assert.deepEqual(loaded.progress.routeHistory,p.routeHistory);
 assert.deepEqual(loaded.route.memories,R.deriveMemories(saved.save.choices));
 assert.ok(loaded.route.path.includes("hsk2.term-conversation.callback-message"));
 assert.ok(loaded.route.path.includes("hsk2.term-conversation.callback-worker"));
 assert.equal(R.inspectProgress({...saved.save,schemaVersion:999}).ok,false);
 assert.equal(R.inspectProgress({...saved.save,memories:["forged"]}).ok,false);
 assert.equal(R.inspectProgress({...p,cursorNodeId:"hsk2.first-friend.author-preview-ending"}).ok,false);
 assert.equal(R.inspectProgress({...saved.save,choices:[saved.save.choices[1]]}).ok,false);
 assert.equal(R.inspectProgress({...saved.save,choices:[{...saved.save.choices[0],memory:{value:"forged"}},...saved.save.choices.slice(1)]}).ok,false);
 const complete=play(Object.fromEntries(F.byLevel(2).episodes.map(episode=>[episode.id,episode.decision.choices[0].id]))).progress,completePath=R.routePath(complete.choices).path,priorCursor=completePath[completePath.length-2],validPrior={...complete,cursorNodeId:priorCursor,routeHistory:completePath.slice(0,-1)};
 assert.equal(R.inspectProgress(validPrior).ok,true);
 assert.equal(R.inspectProgress({...validPrior,cursorNodeId:R.compiled.graph.endingNodeId}).ok,false,"a cursor jump cannot bypass the final reaction, callbacks, or anchors");
});
function playPartial(choiceByEpisode){
 let progress=R.freshProgress(),guard=0;
 while(guard++<50){const current=R.inspectProgress(progress),node=R.compiled.graph.byId[current.progress.cursorNodeId];if(node.type==="story-decision"&&current.route.awaitingDecisionId===node.id){if(!Object.prototype.hasOwnProperty.call(choiceByEpisode,node.episodeId))return progress;progress=R.choose(progress,choiceByEpisode[node.episodeId]).progress;}else progress=R.advance(progress).progress;}
 throw new Error("Partial author preview did not stop at its next choice");
}

test("rewinding a story decision regenerates plot memories without changing separate learning evidence",()=>{
 const picks={misunderstanding:"ask-again", "street-map":"ask-worker", "market-money":"choose-favorite", "term-conversation":"admit-nervous"};
 const complete=play(picks),before=complete.route;
 let evidence=R.freshLearningEvidence();
 const assessmentProgress=progressAtCheckpoint("hsk2.routes-and-positions");
 evidence=R.recordLearningEvidence(assessmentProgress,evidence,"hsk2.routes-and-positions",{accepted:false,hintUsed:false,sampleShown:false,attempts:1,skipped:false}).evidence;
 evidence=R.recordLearningEvidence(assessmentProgress,evidence,"hsk2.routes-and-positions",{accepted:true,hintUsed:true,sampleShown:false,attempts:2,skipped:false}).evidence;
 const retained=JSON.stringify(evidence);
 const rewound=R.rewind(complete.progress,"market-money");assert.equal(rewound.ok,true);
 assert.deepEqual(rewound.progress.choices.map(item=>item.episodeId),["misunderstanding","street-map"]);
 assert.equal(rewound.derivedMemories.length,2);
 assert.equal(JSON.stringify(evidence),retained);
 const replay=R.choose(rewound.progress,"choose-useful");assert.equal(replay.ok,true,replay.error);
 const after=R.routePath(replay.progress.choices);
 assert.equal(after.memories.length,3);
 assert.ok(after.path.includes("hsk2.term-conversation.callback-notebook"));
 assert.ok(!after.path.includes("hsk2.term-conversation.callback-favorite"));
 assert.equal(before.memories.length,4);
 assert.equal(JSON.stringify(evidence),retained);
});

test("wrong answers, hints and skips update evidence only and cannot create or change story choices",()=>{
 let progress=progressAtCheckpoint("hsk2.time-and-repair"),evidence=R.freshLearningEvidence();
 const choicesBefore=JSON.stringify(progress.choices),memoryBefore=JSON.stringify(R.deriveMemories(progress.choices));
 assert.equal(R.recordLearningEvidence(R.freshProgress(),evidence,"hsk2.time-and-repair",{accepted:true,hintUsed:false,sampleShown:false,attempts:1,skipped:false}).ok,false,"evidence cannot be recorded before the checkpoint anchor");
 for(const outcome of [{accepted:false,hintUsed:false,sampleShown:false,attempts:1,skipped:false},{accepted:true,hintUsed:true,sampleShown:false,attempts:1,skipped:false},{accepted:false,hintUsed:false,sampleShown:false,attempts:1,skipped:true}]){const result=R.recordLearningEvidence(progress,evidence,"hsk2.time-and-repair",outcome);assert.equal(result.ok,true,result.error);evidence=result.evidence;}
 assert.equal(JSON.stringify(progress.choices),choicesBefore);
 assert.equal(JSON.stringify(R.deriveMemories(progress.choices)),memoryBefore);
 assert.deepEqual(evidence.records.map(record=>record.kind),["incorrect","supported-correct","skipped"]);
 assert.equal(R.recordLearningEvidence(progress,evidence,"hsk2.routes-and-positions",{accepted:true,hintUsed:false,sampleShown:false,attempts:1,skipped:false}).ok,false,"a reached checkpoint cannot award evidence to another objective");
 assert.equal(R.choose(progress,"not-a-choice").ok,false);
});
function progressAtCheckpoint(objectiveId){
 let progress=R.freshProgress(),guard=0;
 while(guard++<100){const state=R.inspectProgress(progress),node=R.compiled.graph.byId[state.progress.cursorNodeId];if(node.type==="learning-anchor"&&node.stage==="checkpoint"&&node.objectiveId===objectiveId)return progress;if(node.type==="story-decision"&&state.route.awaitingDecisionId===node.id)progress=R.choose(progress,node.choices[0].id).progress;else{const moved=R.advance(progress);if(!moved.ok)throw Error(moved.error);progress=moved.progress;}}
 throw new Error("Checkpoint not reachable: "+objectiveId);
}
