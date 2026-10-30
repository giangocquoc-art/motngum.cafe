/*
 * Internal author-preview compiler/runtime for future story branches.
 * It is intentionally not loaded by index.html and cannot make HSK2 playable.
 * Plot saves contain only versioned choices and the validated node-ID path;
 * memories/callbacks are derived from those choices and learning evidence is separate.
 */
var HSKFutureBranchRuntime=(function(){"use strict";
var blueprint=typeof require==="function"?require("./learning-blueprint.js"):null;
var futureActs=typeof require==="function"?require("./future-acts.js"):null;
var branchDrafts=typeof require==="function"?require("./future-branch-decisions.json"):null;
var SAVE_VERSION=1,EVIDENCE_VERSION=1;
function clone(value){return JSON.parse(JSON.stringify(value));}
function fail(message){return {ok:false,error:message};}
function compileHsk2AuthorPreview(){
 if(!blueprint||!futureActs||!branchDrafts)return {ok:false,errors:["Future story source files are unavailable"]};
 var act=futureActs.byLevel(2),plan=blueprint.futurePlans.find(function(item){return item.level===2;}),draft=branchDrafts.acts["hsk2.first-friend"];
 if(!act||!plan||!draft)return {ok:false,errors:["HSK2 author-preview source is incomplete"]};
 var errors=[],nodes=[],byId=Object.create(null),episodeRank=new Map(act.episodes.map(function(item,index){return [item.id,index];})),choicesByEpisode=new Map(),callbacksByTarget=new Map();
 function add(node){if(byId[node.id]){errors.push("Duplicate author-preview graph node: "+node.id);return;}node=Object.assign({next:[]},node);nodes.push(node);byId[node.id]=node;return node;}
 function append(target,node){if(target&&node){target.next.push(node.id);if(target.type==="story-callback")target.skipTo=node.id;}}
 function decisionChoices(episode){var decision=draft.decisions[episode.id];return decision?decision.choices:[];}
 act.episodes.forEach(function(episode){var decision=draft.decisions[episode.id];if(!decision){errors.push("Missing episode decision: "+episode.id);return;}choicesByEpisode.set(episode.id,decision.choices);decision.choices.forEach(function(choice){var callback=choice.laterConsequence;if(!callbacksByTarget.has(callback.episodeId))callbacksByTarget.set(callback.episodeId,[]);callbacksByTarget.get(callback.episodeId).push({sourceEpisodeId:episode.id,choice:choice});});});
 var objectives=blueprint.makeFutureObjectives(futureActs).filter(function(item){return item.level===2;});
 var objectiveById=new Map(objectives.map(function(item){return [item.id,item];}));
 var firstNode=null,previousEpisodeTail=null;
 act.episodes.forEach(function(episode){
  var episodeId=episode.id,decision=draft.decisions[episodeId];
  var entry=add({id:"hsk2."+episodeId+".entry",type:"episode-entry",episodeId:episodeId,title:episode.title,setting:episode.setting,conflict:episode.conflict});
  if(!firstNode)firstNode=entry;
  append(previousEpisodeTail,entry);
  var preCallbacks=(callbacksByTarget.get(episodeId)||[]).filter(function(item){return episodeRank.get(item.sourceEpisodeId)<episodeRank.get(episodeId);});
  var postCallbacks=(callbacksByTarget.get(episodeId)||[]).filter(function(item){return item.sourceEpisodeId===episodeId;});
  var previous=entry;
  function callbackNode(item){var source=item.sourceEpisodeId,option=item.choice,consequence=option.laterConsequence;return add({id:consequence.sceneId,type:"story-callback",episodeId:episodeId,sourceEpisodeId:source,requiredChoiceId:option.id,requiredEpisodeId:source,condition:{type:"choice-selected",episodeId:source,choiceId:option.id},text:consequence.text,derivedMemory:{key:source+"."+option.memory.key,value:option.memory.value}});}
  preCallbacks.forEach(function(item){var callback=callbackNode(item);append(previous,callback);previous=callback;});
  var decisionNode=add({id:decision.id,type:"story-decision",episodeId:episodeId,purpose:decision.purpose,convergenceSceneId:decision.convergenceSceneId,choices:decision.choices.map(function(option){return {id:option.id,label:option.label,to:option.branchSceneId};})});
  append(previous,decisionNode);
  decision.choices.forEach(function(option){
   var branch=add({id:option.branchSceneId,type:"choice-reaction",episodeId:episodeId,choiceId:option.id,label:option.label,text:option.reaction,derivedMemory:{key:episodeId+"."+option.memory.key,value:option.memory.value}});
   if(!decisionNode.choices.some(function(edge){return edge.id===option.id&&edge.to===branch.id;}))errors.push("Missing decision edge to reaction: "+episodeId+"/"+option.id);
  });
  var join=add({id:decision.convergenceSceneId,type:"shared-convergence",episodeId:episodeId,sharedLearningAnchorIds:draft.commonLearningAnchorIds.slice()});
  var joins=decision.choices.map(function(option){return option.joinsAtSceneId;});
  if(joins.some(function(id){return id!==join.id;}))errors.push("A choice bypasses shared convergence: "+episodeId);
  decision.choices.forEach(function(option){var branch=byId[option.branchSceneId];append(branch,join);});
  var after=join;
  postCallbacks.forEach(function(item){var callback=callbackNode(item);append(after,callback);after=callback;});
  var stages=[];
  plan.objectives.forEach(function(spec){var objective=objectiveById.get(spec.id);if(!objective)return;var refs=objective.episodeRefs;if(refs.intro.episodeId===episodeId)stages.push({id:objective.id+".intro",stage:"intro",objectiveId:objective.id,episodeId:episodeId,beat:refs.intro.beat});if(refs.reuse.episodeId===episodeId)stages.push({id:objective.id+".reuse",stage:"reuse",objectiveId:objective.id,episodeId:episodeId,beat:refs.reuse.beat});if(refs.checkpoint.episodeId===episodeId)stages.push({id:objective.id+".checkpoint",stage:"checkpoint",objectiveId:objective.id,episodeId:episodeId,beat:refs.checkpoint.beat});});
  stages.forEach(function(stage){var node=add({id:stage.id,type:"learning-anchor",episodeId:episodeId,stage:stage.stage,objectiveId:stage.objectiveId,beat:stage.beat});append(after,node);after=node;});
  previousEpisodeTail=after;
 });
 var ending=add({id:"hsk2.first-friend.author-preview-ending",type:"act-ending",episodeId:act.episodes[act.episodes.length-1].id,text:"Kết thúc bản đồ nhánh nội bộ HSK2."});append(previousEpisodeTail,ending);
 var anchors=plan.objectives.map(function(item){return item.id;}),targetChoices=new Map();
 act.episodes.forEach(function(episode){var decision=draft.decisions[episode.id];decision.choices.forEach(function(option){targetChoices.set(episode.id+"\u0000"+option.id,option);});});
 if(JSON.stringify(draft.commonLearningAnchorIds)!==JSON.stringify(anchors))errors.push("HSK2 authored anchors do not match the ordered objective plan");
 nodes.filter(function(node){return node.type==="story-callback";}).forEach(function(node){var source=episodeRank.get(node.sourceEpisodeId),target=episodeRank.get(node.episodeId);if(source===undefined||target===undefined||source>target)errors.push("Callback targets an earlier or missing episode: "+node.id);if(!targetChoices.has(node.requiredEpisodeId+"\u0000"+node.requiredChoiceId))errors.push("Callback requirement refers to an unknown choice: "+node.id);if(!node.condition||node.condition.type!=="choice-selected"||node.condition.episodeId!==node.requiredEpisodeId||node.condition.choiceId!==node.requiredChoiceId||!node.skipTo||node.next.length!==1||node.next[0]!==node.skipTo)errors.push("Callback needs an explicit selected-choice gate and safe skip edge: "+node.id);});
 var decisions=nodes.filter(function(node){return node.type==="story-decision";});
 decisions.forEach(function(node){var ids=new Set();node.choices.forEach(function(choice){if(ids.has(choice.id)||!byId[choice.to]||byId[choice.to].type!=="choice-reaction")errors.push("Malformed choice edge: "+node.id);ids.add(choice.id);});if(ids.size<2)errors.push("Decision needs at least two choices: "+node.id);});
 act.episodes.forEach(function(episode){var stages=nodes.filter(function(node){return node.type==="learning-anchor"&&node.episodeId===episode.id;});var expected=plan.objectives.filter(function(objective){return objective.episode===episode.id;}).map(function(objective){return objective.id;});var actual=stages.filter(function(node){return node.stage==="intro";}).map(function(node){return node.objectiveId;});if(JSON.stringify(actual)!==JSON.stringify(expected))errors.push("Episode learning introductions do not match objective anchors: "+episode.id);});
 return errors.length?{ok:false,errors:errors}:{ok:true,graph:{schemaVersion:1,id:act.id,level:2,playable:false,planningStatus:"internal-author-preview-only; HSK2 release remains locked",startNodeId:firstNode.id,endingNodeId:ending.id,nodes:nodes,byId:byId,episodes:act.episodes.map(function(item){return item.id;}),choicesByEpisode:choicesByEpisode,commonLearningAnchorIds:anchors}};
}
var compiled=compileHsk2AuthorPreview();
function validChoices(graph,choices){if(!Array.isArray(choices))return {ok:false,error:"Plot choices must be a list"};if(choices.length>graph.episodes.length)return {ok:false,error:"Too many plot choices"};for(var index=0;index<choices.length;index++){var record=choices[index],episodeId=graph.episodes[index],options=graph.choicesByEpisode.get(episodeId)||[],keys=record&&Object.keys(record).sort();if(!record||JSON.stringify(keys)!==JSON.stringify(["choiceId","episodeId"])||record.episodeId!==episodeId||!options.some(function(option){return option.id===record.choiceId;}))return {ok:false,error:"Plot choices must be plain ID pairs forming a valid chronological prefix"};}return {ok:true};}
function deriveMemories(graph,choices){var memories=[];choices.forEach(function(record){var option=(graph.choicesByEpisode.get(record.episodeId)||[]).find(function(item){return item.id===record.choiceId;});if(option)memories.push({episodeId:record.episodeId,key:record.episodeId+"."+option.memory.key,value:option.memory.value});});return memories;}
function routePath(graph,choices){var validation=validChoices(graph,choices);if(!validation.ok)return validation;var path=[],awaiting=null,selected=new Map(choices.map(function(item){return [item.episodeId,item.choiceId];}));
 function push(id){if(!graph.byId[id])throw new Error("Unknown graph node: "+id);path.push(id);}
 for(var episodeIndex=0;episodeIndex<graph.episodes.length;episodeIndex++){var episodeId=graph.episodes[episodeIndex],entry="hsk2."+episodeId+".entry",decision=Object.values(graph.byId).find(function(node){return node.type==="story-decision"&&node.episodeId===episodeId;}),join=decision&&decision.convergenceSceneId;push(entry);
  var callbacks=Object.values(graph.byId).filter(function(node){return node.type==="story-callback"&&node.episodeId===episodeId&&graph.episodes.indexOf(node.sourceEpisodeId)<episodeIndex;});
  callbacks.forEach(function(callback){if(selected.get(callback.requiredEpisodeId)===callback.requiredChoiceId)push(callback.id);});
  push(decision.id);var chosen=selected.get(episodeId);if(!chosen){awaiting=decision.id;break;}
  var edge=decision.choices.find(function(item){return item.id===chosen;});if(!edge)throw new Error("Chosen option is missing from graph: "+episodeId+"/"+chosen);push(edge.to);push(join);
  var ownCallbacks=Object.values(graph.byId).filter(function(node){return node.type==="story-callback"&&node.episodeId===episodeId&&node.sourceEpisodeId===episodeId;});ownCallbacks.forEach(function(callback){if(chosen===callback.requiredChoiceId)push(callback.id);});
  Object.values(graph.byId).filter(function(node){return node.type==="learning-anchor"&&node.episodeId===episodeId;}).forEach(function(node){push(node.id);});
 }
 if(!awaiting)push(graph.endingNodeId);return {ok:true,path:path,awaitingDecisionId:awaiting,memories:deriveMemories(graph,choices)};
}
function freshProgress(){if(!compiled.ok)throw new Error(compiled.errors.join("; "));var result=routePath(compiled.graph,[]),first=result.path[0];return {schemaVersion:SAVE_VERSION,actId:compiled.graph.id,choices:[],cursorNodeId:first,routeHistory:[first]};}
function inspectProgress(save){
 if(!compiled.ok)return fail("HSK2 author preview could not be compiled");
 if(!save||save.schemaVersion!==SAVE_VERSION||save.actId!==compiled.graph.id||!Array.isArray(save.choices))return fail("Unsupported or malformed plot save");
 var keys=Object.keys(save).sort(),allowedBare=["actId","choices","schemaVersion"],allowedRuntime=["actId","choices","cursorNodeId","routeHistory","schemaVersion"],allowedSavedPath=["actId","choices","scenePath","schemaVersion"],hasCursor=Object.prototype.hasOwnProperty.call(save,"cursorNodeId"),hasScenePath=Object.prototype.hasOwnProperty.call(save,"scenePath");
 var allowed=hasCursor?allowedRuntime:(hasScenePath?allowedSavedPath:allowedBare);
 if(JSON.stringify(keys)!==JSON.stringify(allowed)||hasCursor&&hasScenePath)return fail("Plot save contains unrecognized or derived fields");
 var route=routePath(compiled.graph,save.choices);if(!route.ok)return route;var cursor=save.cursorNodeId,history=save.routeHistory;
 if(hasScenePath){history=save.scenePath;cursor=Array.isArray(history)&&history.length?history[history.length-1]:null;}
 if(!hasCursor&&!hasScenePath){if(save.choices.length){var last=save.choices[save.choices.length-1],decision=Object.values(compiled.graph.byId).find(function(node){return node.type==="story-decision"&&node.episodeId===last.episodeId;}),edge=decision&&decision.choices.find(function(item){return item.id===last.choiceId;});cursor=edge&&edge.to;}else cursor=route.path[0];if(!cursor)return fail("The saved plot choice cannot be resumed");var resumeIndex=route.path.indexOf(cursor);history=route.path.slice(0,resumeIndex+1);}
 if(typeof cursor!=="string"||!Array.isArray(history))return fail("Malformed in-session plot cursor");
 var cursorIndex=route.path.indexOf(cursor),expectedHistory=cursorIndex<0?[]:route.path.slice(0,cursorIndex+1);
 if(cursorIndex<0||JSON.stringify(history)!==JSON.stringify(expectedHistory))return fail("Plot progress must follow the reachable story path without skipping scenes");
 return {ok:true,progress:{schemaVersion:SAVE_VERSION,actId:compiled.graph.id,choices:clone(save.choices),cursorNodeId:cursor,routeHistory:clone(history)},route:route};
}
function saveProgress(progress){var checked=inspectProgress(progress);if(!checked.ok)return checked;return {ok:true,save:{schemaVersion:SAVE_VERSION,actId:compiled.graph.id,choices:clone(checked.progress.choices),scenePath:clone(checked.progress.routeHistory)}};}
function advance(progress){var checked=inspectProgress(progress);if(!checked.ok)return checked;var path=checked.route.path,index=path.indexOf(checked.progress.cursorNodeId),node=compiled.graph.byId[path[index]];if(node.type==="story-decision"&&checked.route.awaitingDecisionId===node.id)return {ok:false,error:"Choose a story response before continuing",needsChoice:true,nodeId:node.id};if(index===path.length-1)return {ok:true,progress:checked.progress,done:node.type==="act-ending"};var nextId=path[index+1],next=Object.assign({},checked.progress,{cursorNodeId:nextId,routeHistory:checked.progress.routeHistory.concat([nextId])});return {ok:true,progress:next,done:false};}
function choose(progress,choiceId){var checked=inspectProgress(progress);if(!checked.ok)return checked;var node=compiled.graph.byId[checked.progress.cursorNodeId],awaiting=checked.route.awaitingDecisionId;if(node.type!=="story-decision"||node.id!==awaiting)return fail("Choices can only be made at the current decision");var edge=node.choices.find(function(item){return item.id===choiceId;});if(!edge)return fail("Unknown choice for the current decision");var episodeId=node.episodeId,choices=checked.progress.choices.concat([{episodeId:episodeId,choiceId:choiceId}]),updated={schemaVersion:SAVE_VERSION,actId:compiled.graph.id,choices:choices,cursorNodeId:edge.to,routeHistory:checked.progress.routeHistory.concat([edge.to])};var next=inspectProgress(updated);if(!next.ok)return next;return {ok:true,progress:next.progress,derivedMemories:next.route.memories};}
function rewind(progress,episodeId){var checked=inspectProgress(progress);if(!checked.ok)return checked;var index=checked.progress.choices.findIndex(function(item){return item.episodeId===episodeId;});if(index<0)return fail("That episode has no saved choice to rewind");var choices=checked.progress.choices.slice(0,index),route=routePath(compiled.graph,choices),decision=Object.values(compiled.graph.byId).find(function(node){return node.type==="story-decision"&&node.episodeId===episodeId;}),position=route.path.indexOf(decision.id),history=route.path.slice(0,position+1);return {ok:true,progress:{schemaVersion:SAVE_VERSION,actId:compiled.graph.id,choices:choices,cursorNodeId:decision.id,routeHistory:history},derivedMemories:deriveMemories(compiled.graph,choices)};}
function freshLearningEvidence(){if(!compiled.ok)throw new Error(compiled.errors.join("; "));return {schemaVersion:EVIDENCE_VERSION,actId:compiled.graph.id,records:[]};}
function recordLearningEvidence(progress,evidence,objectiveId,outcome){
 var checked=inspectProgress(progress);if(!checked.ok)return checked;
 if(!evidence||evidence.schemaVersion!==EVIDENCE_VERSION||evidence.actId!==compiled.graph.id||!Array.isArray(evidence.records))return fail("Unsupported or malformed learning evidence");
 if(compiled.graph.commonLearningAnchorIds.indexOf(objectiveId)<0)return fail("Unknown learning objective");
 var node=compiled.graph.byId[checked.progress.cursorNodeId];if(!node||node.type!=="learning-anchor"||node.stage!=="checkpoint"||node.objectiveId!==objectiveId)return fail("Learning evidence can only be recorded at that objective's checkpoint");
 if(!outcome||typeof outcome!="object"||typeof outcome.accepted!=="boolean"||typeof outcome.hintUsed!=="boolean"||typeof outcome.sampleShown!=="boolean"||!Number.isInteger(outcome.attempts)||outcome.attempts<1||typeof outcome.skipped!=="boolean")return fail("A normalized checkpoint evaluation is required");
 if(outcome.skipped&&outcome.accepted)return fail("A skipped checkpoint cannot be marked correct");
 var kind=outcome.skipped?"skipped":(!outcome.accepted?"incorrect":((outcome.hintUsed||outcome.sampleShown)?"supported-correct":(outcome.attempts>1?"retried-correct":"independent-correct")));
 var detail={hintUsed:outcome.hintUsed,sampleShown:outcome.sampleShown,attempts:outcome.attempts};
 return {ok:true,evidence:{schemaVersion:EVIDENCE_VERSION,actId:compiled.graph.id,records:evidence.records.concat([{objectiveId:objectiveId,kind:kind,detail:detail}])}};
}
function validateGraph(){if(!compiled.ok)return compiled.errors.slice();var graph=compiled.graph,errors=[],reachable=new Set(),stack=[graph.startNodeId];while(stack.length){var id=stack.pop();if(reachable.has(id))continue;var node=graph.byId[id];if(!node){errors.push("Graph points to a missing node: "+id);continue;}reachable.add(id);if(node.type==="story-decision"){node.choices.forEach(function(choice){if(!graph.byId[choice.to])errors.push("Decision points to a missing reaction: "+id+"/"+choice.id);else stack.push(choice.to);});}else (node.next||[]).forEach(function(next){if(!graph.byId[next])errors.push("Node points to a missing next node: "+id+"/"+next);else stack.push(next);});}
 graph.nodes.forEach(function(node){if(!reachable.has(node.id))errors.push("Unreachable author-preview node: "+node.id);});if(graph.nodes.filter(function(node){return node.type==="story-callback";}).length!==8)errors.push("Expected one actual callback node per HSK2 decision option");if(graph.nodes.filter(function(node){return node.type==="learning-anchor"&&node.stage==="checkpoint";}).length!==6)errors.push("Every HSK2 objective needs a checkpoint node");return errors;}
var api={version:"hsk2-author-preview-v1",status:"INTERNAL / NOT LOADED BY THE GAME / HSK2–6 REMAIN LOCKED",compiled:compiled,compileHsk2AuthorPreview:compileHsk2AuthorPreview,validateGraph:validateGraph,routePath:function(choices){return compiled.ok?routePath(compiled.graph,choices):compiled;},freshProgress:freshProgress,inspectProgress:inspectProgress,saveProgress:saveProgress,advance:advance,choose:choose,rewind:rewind,deriveMemories:function(choices){return compiled.ok?deriveMemories(compiled.graph,choices):[];},freshLearningEvidence:freshLearningEvidence,recordLearningEvidence:recordLearningEvidence};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
