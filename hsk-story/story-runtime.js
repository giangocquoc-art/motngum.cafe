/* HSK Story Runtime V4 contract: graph-governed transitions with legacy save shadow.
 * On this release legacy V3 remains authoritative for READ, and is never deleted.
 * V4 snapshots are derived from the exact V3 serialized payload and validated
 * before they are ever eligible for an opt-in reader in a later release.
 */
var HSKStoryRuntime=(function(){"use strict";
 var VERSION=4, STORY_ID="hsk1.e01",SAVE_KEY="hai-que-huong-progress-v4";
 function hash(source){var h=2166136261;for(var i=0;i<source.length;i++){h^=source.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,"0")}
 function advance(sceneRef,gates,graph){
  if(!graph||typeof graph.indexOf!=="function"||graph.indexOf(sceneRef)<0)throw Error("Unknown story node");
  if(!gates||gates.solved!==true)return {ok:false,reason:"unsolved",sceneRef:sceneRef};
  for(var i of ["encounter","interlude","choice","sampler"])if(gates[i]===true)return {ok:false,reason:i,sceneRef:sceneRef};
  var next=graph.next(sceneRef);
  if(next!==null&&graph.indexOf(next)<0)throw Error("Graph transition points to missing node");
  return {ok:true,done:next===null,sceneRef:next||sceneRef,from:sceneRef};
 }
 function shadow(v3,serialized,graph){
  if(!v3||v3.v!==3||!Array.isArray(v3.history)||!Number.isInteger(v3.step)||!graph)throw Error("Cannot migrate malformed V3 save");
  var id=graph.idAt(v3.step);
  if(!id)throw Error("Unknown historic scene index");
  var resolved=graph.resolve(v3.sceneRef,v3.step);
  if(resolved!==v3.step)throw Error("Inconsistent numeric/indexed V3 save — keep V3 for recovery");
  return {v:VERSION,storyId:STORY_ID,sceneRef:id,sceneIndex:v3.step,sourceVersion:3,
    sourceSignature:hash(serialized),sourceLength:serialized.length,
    // v4 graph state is prepared but not yet the load authority.
    progress:{history:v3.history,done:v3.done===true},
    memory:{storyChoices:v3.storyChoices||{},storyBeats:v3.storyBeats||[],encounter:v3.encounter||null,worldSeen:v3.worldSeen||{},worldFocus:v3.worldFocus||{}},
    evidence:{skillSampler:v3.skillSampler||null},
    pending:{draft:typeof v3.draft==="string"?v3.draft:"",encounterDraft:typeof v3.encounterDraft==="string"?v3.encounterDraft:"",practiceOpen:v3.practiceOpen===true}
  };
 }
 function validateShadow(v4,v3Serialized,graph){
  if(!v4||v4.v!==VERSION||v4.storyId!==STORY_ID||v4.sourceVersion!==3||typeof v3Serialized!=="string")return false;
  if(v4.sourceSignature!==hash(v3Serialized)||v4.sourceLength!==v3Serialized.length)return false;
  try{var raw=JSON.parse(v3Serialized);return raw.v===3&&raw.step===v4.sceneIndex&&graph.idAt(raw.step)===v4.sceneRef&&graph.resolve(raw.sceneRef,raw.step)===raw.step}
  catch(e){return false}
 }
 function readShadow(storage,legacyKey,graph){
  try{var raw=storage.getItem(legacyKey),v4=JSON.parse(storage.getItem(SAVE_KEY)||"null");return validateShadow(v4,raw,graph)?v4:null}catch(e){return null}
 }
 function writeShadow(storage,v3,serialized,graph){
  try{
   var v4=shadow(v3,serialized,graph);
   storage.setItem(SAVE_KEY,JSON.stringify(v4));return true
  }catch(e){return false}
 }
 var api={version:VERSION,key:SAVE_KEY,storyId:STORY_ID,advance:advance,shadow:shadow,validateShadow:validateShadow,readShadow:readShadow,writeShadow:writeShadow};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
