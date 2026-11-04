const test=require('node:test'),assert=require('node:assert/strict');
const Runtime=require('../future-branch-runtime.js'),Acts=require('../future-acts.js'),Drafts=require('../future-branch-decisions.json');
const copy=value=>JSON.parse(JSON.stringify(value));

function choicesFor(act,mask){return Object.fromEntries(act.episodes.map((episode,index)=>[episode.id,episode.decision.choices[(mask>>index)&1].id]));}
function nextVisible(graph,node,choices){
 const selected=new Map(choices.map(choice=>[choice.episodeId,choice.choiceId]));
 let id=node.next[0],guard=0;
 while(graph.byId[id]?.type==='story-callback'&&selected.get(graph.byId[id].requiredEpisodeId)!==graph.byId[id].requiredChoiceId){
  assert.ok(++guard<=graph.nodes.length,'callback skips terminate');id=graph.byId[id].skipTo;
 }
 return id;
}
function play(runtime,picks,start=runtime.freshProgress(),visit=()=>{}){
 let progress=start;
 for(let guard=0;guard<100;guard++){
  const checked=runtime.inspectProgress(progress);assert.equal(checked.ok,true,checked.error);
  const graph=runtime.compiled.graph,node=graph.byId[progress.cursorNodeId];
  const saved=runtime.saveProgress(progress);assert.equal(saved.ok,true,saved.error);
  const loaded=runtime.inspectProgress(copy(saved.save));assert.equal(loaded.ok,true,loaded.error);assert.deepEqual(loaded.progress,progress,'every reached partial route round-trips');
  visit(progress,node);
  if(node.type==='act-ending')return progress;
  let result;
  if(node.type==='story-decision'){
   assert.equal(runtime.advance(progress).needsChoice,true,'a decision cannot be skipped');
   assert.equal(runtime.choose(progress,'unknown-choice').ok,false);
   result=runtime.choose(progress,picks[node.episodeId]);
   assert.equal(result.ok,true,result.error);
   assert.equal(result.progress.cursorNodeId,node.choices.find(choice=>choice.id===picks[node.episodeId]).to);
  }else{
   result=runtime.advance(progress);assert.equal(result.ok,true,result.error);
   assert.equal(result.progress.cursorNodeId,nextVisible(graph,node,progress.choices),'runtime follows the authored next/skip edges');
  }
  progress=result.progress;
 }
 throw new Error('Author preview did not terminate');
}

for(let level=2;level<=6;level++){
 test('HSK'+level+': all 16 runtime routes preserve staged learning, partial saves and every decision rewind',()=>{
  const runtime=Runtime.forLevel(level),act=Acts.byLevel(level),graph=runtime.compiled.graph;
  assert.equal(runtime.compiled.ok,true);assert.equal(graph.playable,false);assert.match(graph.planningStatus,/release remains locked/);
  assert.deepEqual(runtime.validateGraph(),[]);
  let sharedStages;
  for(let mask=0;mask<16;mask++){
   const picks=choicesFor(act,mask),progress=play(runtime,picks),path=progress.routeHistory;
   assert.equal(progress.cursorNodeId,graph.endingNodeId);
   assert.deepEqual(path,runtime.routePath(progress.choices).path);
   const stages=path.filter(id=>graph.byId[id].type==='learning-anchor');
   assert.equal(stages.length,graph.commonLearningAnchorIds.length*3);
   if(!sharedStages)sharedStages=stages;else assert.deepEqual(stages,sharedStages,'every branch has the same actual learning sequence');
   for(const objectiveId of graph.commonLearningAnchorIds){
    assert.ok(stages.indexOf(objectiveId+'.intro')>=0);
    assert.ok(stages.indexOf(objectiveId+'.intro')<stages.indexOf(objectiveId+'.reuse'));
    assert.ok(stages.indexOf(objectiveId+'.reuse')<stages.indexOf(objectiveId+'.checkpoint'));
   }
   for(const episode of act.episodes){
    const selected=episode.decision.choices.find(choice=>choice.id===picks[episode.id]);
    assert.ok(path.indexOf(selected.branchSceneId)<path.indexOf(selected.joinsAtSceneId));
    assert.ok(path.indexOf(selected.joinsAtSceneId)<path.indexOf(selected.laterConsequence.sceneId));
    for(const choice of episode.decision.choices){assert.equal(path.includes(choice.branchSceneId),choice===selected);assert.equal(path.includes(choice.laterConsequence.sceneId),choice===selected);}
    const rewind=runtime.rewind(progress,episode.id);assert.equal(rewind.ok,true,rewind.error);
    assert.equal(rewind.progress.choices.length,act.episodes.indexOf(episode));
    const other=episode.decision.choices.find(choice=>choice!==selected),replayed=play(runtime,{...picks,[episode.id]:other.id},rewind.progress);
    const replayRoute=runtime.routePath(replayed.choices);
    assert.ok(replayRoute.path.includes(other.laterConsequence.sceneId));assert.ok(!replayRoute.path.includes(selected.laterConsequence.sceneId));
    assert.equal(replayRoute.memories.find(memory=>memory.episodeId===episode.id).value,other.memory.value);
    assert.equal(runtime.routePath(progress.choices).memories.find(memory=>memory.episodeId===episode.id).value,selected.memory.value,'replay does not mutate the original route');
   }
   const saved=runtime.saveProgress(progress).save;
   assert.equal(runtime.inspectProgress({...saved,schemaVersion:2}).ok,false);
   const otherAct=Acts.byLevel(level===6?2:level+1).id;
   assert.equal(runtime.inspectProgress({...saved,actId:otherAct}).ok,false,'another act cannot overwrite this act');
   assert.equal(runtime.inspectProgress({...saved,scenePath:[path[0]]}).ok,false,'future choices cannot be stored ahead of their reached reactions');
  }
 });

 test('HSK'+level+': graph validation rejects cycles, skipped anchors and broken callback gates',()=>{
  const runtime=Runtime.forLevel(level),graph=runtime.compiled.graph;
  const reaction=graph.nodes.find(node=>node.type==='choice-reaction'),reactionNext=reaction.next;
  try{reaction.next=[graph.endingNodeId];assert.ok(runtime.validateGraph().length>0,'reaction shortcut cannot bypass the common learning anchors');}finally{reaction.next=reactionNext;}
  const ending=graph.byId[graph.endingNodeId],endingNext=ending.next;
  try{ending.next=[graph.startNodeId];assert.ok(runtime.validateGraph().some(error=>/ending|cycle/.test(error)));}finally{ending.next=endingNext;}
  const entry=graph.byId[graph.startNodeId],entryNext=entry.next;
  try{entry.next=[entry.id];assert.ok(runtime.validateGraph().some(error=>/cycle/.test(error)));assert.equal(runtime.routePath([]).ok,false);}finally{entry.next=entryNext;}
  const callback=graph.nodes.find(node=>node.type==='story-callback'),condition=callback.condition;
  try{callback.condition={...condition,choiceId:'forged'};assert.ok(runtime.validateGraph().some(error=>/selected-choice gate/.test(error)));}finally{callback.condition=condition;}
  const decision=graph.nodes.find(node=>node.type==='story-decision'),options=decision.choices;
  try{decision.choices=null;assert.ok(runtime.validateGraph().some(error=>/Malformed decision edges/.test(error)));}finally{decision.choices=options;}
  try{graph.byId['unlisted-node']={id:'unlisted-node',type:'episode-entry',next:reactionNext};reaction.next=['unlisted-node'];assert.ok(runtime.validateGraph().some(error=>/unlisted/.test(error)));}finally{delete graph.byId['unlisted-node'];reaction.next=reactionNext;}
  assert.deepEqual(runtime.validateGraph(),[]);
 });

 test('HSK'+level+': evidence rejects corrupt history and never changes plot choices or memories',()=>{
  const runtime=Runtime.forLevel(level),act=Acts.byLevel(level),picks=choicesFor(act,0);
  let checkpoint;
  play(runtime,picks,undefined,(progress,node)=>{if(!checkpoint&&node.type==='learning-anchor'&&node.stage==='checkpoint')checkpoint=copy(progress);});
  const objectiveId=runtime.compiled.graph.byId[checkpoint.cursorNodeId].objectiveId,plot=JSON.stringify(checkpoint),memories=JSON.stringify(runtime.deriveMemories(checkpoint.choices));
  let evidence=runtime.freshLearningEvidence();
  const outcome={accepted:true,hintUsed:false,sampleShown:false,attempts:1,skipped:false};
  for(const change of [{accepted:false},{hintUsed:true},{sampleShown:true},{attempts:2},{accepted:false,skipped:true},{}]){
   const result=runtime.recordLearningEvidence(checkpoint,evidence,objectiveId,{...outcome,...change});assert.equal(result.ok,true,result.error);evidence=result.evidence;
  }
  assert.deepEqual(evidence.records.map(record=>record.kind),['incorrect','supported-correct','supported-correct','retried-correct','skipped','independent-correct']);
  assert.equal(runtime.inspectLearningEvidence(copy(evidence)).ok,true);
  const badRecords=[
   {...evidence.records[5],objectiveId:'forged.future'},
   {...evidence.records[5],kind:'certified'},
   {...evidence.records[5],detail:{hintUsed:false,sampleShown:false,attempts:-2}},
   {...evidence.records[5],detail:{hintUsed:true,sampleShown:false,attempts:1}},
   {...evidence.records[5],detail:{hintUsed:false,sampleShown:false,attempts:2}},
   {...evidence.records[5],kind:'supported-correct'},
   {...evidence.records[5],kind:'retried-correct'},
   {...evidence.records[5],route:'forged'},
  ];
  for(const record of badRecords){const corrupt={...evidence,records:[record]},before=JSON.stringify(corrupt);assert.equal(runtime.inspectLearningEvidence(corrupt).ok,false);assert.equal(runtime.recordLearningEvidence(checkpoint,corrupt,objectiveId,outcome).ok,false);assert.equal(JSON.stringify(corrupt),before);}
  assert.equal(runtime.inspectLearningEvidence({...evidence,schemaVersion:2}).ok,false);
  assert.equal(runtime.inspectLearningEvidence({...evidence,actId:Acts.byLevel(level===6?2:level+1).id}).ok,false);
  assert.equal(runtime.recordLearningEvidence(checkpoint,evidence,objectiveId,{...outcome,storyChoice:'forged'}).ok,false);
  assert.equal(JSON.stringify(checkpoint),plot);assert.equal(JSON.stringify(runtime.deriveMemories(checkpoint.choices)),memories);
  const retained=JSON.stringify(evidence);runtime.rewind(checkpoint,checkpoint.choices[0].episodeId);assert.equal(JSON.stringify(evidence),retained);
 });
}

test('the default HSK2 API resumes an existing version-one save without renaming its scene IDs',()=>{
 const save={schemaVersion:1,actId:'hsk2.first-friend',choices:[{episodeId:'misunderstanding',choiceId:'write-message'}],scenePath:['hsk2.misunderstanding.entry','hsk2.misunderstanding.decision','hsk2.misunderstanding.write']};
 const restored=Runtime.inspectProgress(save);assert.equal(restored.ok,true,restored.error);
 assert.equal(Runtime.version,'hsk2-author-preview-v1');assert.equal(restored.progress.cursorNodeId,'hsk2.misunderstanding.write');
 assert.deepEqual(Runtime.saveProgress(restored.progress).save,save);
 assert.equal(Runtime.compileHsk2AuthorPreview().graph.id,'hsk2.first-friend');
 for(const level of [1,7,2.5,'2',null]){assert.equal(Runtime.compileAuthorPreview(level).ok,false);assert.throws(()=>Runtime.forLevel(level),RangeError);}
});

test('missing decisions and incomplete authored choices fail compilation without throwing',()=>{
 for(let level=2;level<=6;level++){
  const act=Acts.byLevel(level),draft=Drafts.acts[act.id],episode=act.episodes[0].id,original=draft.decisions[episode];
  try{delete draft.decisions[episode];assert.equal(Runtime.compileAuthorPreview(level).ok,false);}finally{draft.decisions[episode]=original;}
  const callback=original.choices[0].laterConsequence;
  try{delete original.choices[0].laterConsequence;assert.equal(Runtime.compileAuthorPreview(level).ok,false);}finally{original.choices[0].laterConsequence=callback;}
  const branchId=original.choices[1].branchSceneId;
  try{original.choices[1].branchSceneId=original.choices[0].branchSceneId;assert.equal(Runtime.compileAuthorPreview(level).ok,false);}finally{original.choices[1].branchSceneId=branchId;}
  const target=callback.episodeId;
  try{callback.episodeId='missing-target';assert.equal(Runtime.compileAuthorPreview(level).ok,false);}finally{callback.episodeId=target;}
  const later=act.episodes.at(-1).id,laterCallback=draft.decisions[later].choices[0].laterConsequence,laterTarget=laterCallback.episodeId;
  try{laterCallback.episodeId=episode;assert.equal(Runtime.compileAuthorPreview(level).ok,false);}finally{laterCallback.episodeId=laterTarget;}
  assert.equal(Runtime.compileAuthorPreview(level).ok,true);
 }
});
