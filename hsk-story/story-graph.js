/* V9 stable identity graph. Never renumber the V3-V8 numeric history; canonical IDs survive future authorship. */
var HSKStoryGraph=(function(){"use strict";
var sceneIds=["hsk1.e01.arrival-greeting","hsk1.e01.school-introduction","hsk1.e01.xiaoyu-friendship","hsk1.e01.class-counting","hsk1.e01.liu-noodle-order","hsk1.e01.liu-payment","hsk1.e01.walk-home","hsk1.e01.exam-introduction","hsk1.e01.exam-price","hsk1.e01.exam-order"];
var events=[
{id:"hsk1.e01.story.arrival",before:sceneIds[0],kind:"interlude",sourceId:"arrival"},
{id:"hsk1.e01.story.gate",before:sceneIds[1],kind:"interlude",sourceId:"gate"},
{id:"hsk1.e01.story.lunch",before:sceneIds[4],kind:"interlude",sourceId:"lunch"},
{id:"hsk1.e01.story.homecoming",before:sceneIds[6],kind:"interlude",sourceId:"way-home"},
{id:"hsk1.e01.story.class-test",before:sceneIds[7],kind:"interlude",sourceId:"school-test"},
{id:"hsk1.e01.quest.diary",before:sceneIds[4],kind:"encounter",sourceId:"lost-notebook"},
{id:"hsk1.e01.skill-sampler",before:sceneIds[7],kind:"formative",sourceId:"skill-sampler"},
{id:"hsk1.e01.choice.friendship",after:sceneIds[2],kind:"branch",sourceId:"friendship"},
{id:"hsk1.e01.choice.noodle",after:sceneIds[4],kind:"branch",sourceId:"noodle-taste"}
];
function idAt(index){return Number.isInteger(index)&&index>=0&&index<sceneIds.length?sceneIds[index]:null}
function indexOf(id){return typeof id==="string"?sceneIds.indexOf(id):-1}
function resolve(sceneId,legacyIndex){var i=indexOf(sceneId);return i>=0?i:Number.isInteger(legacyIndex)?Math.max(0,Math.min(sceneIds.length-1,legacyIndex)):0}
function next(id){var i=indexOf(id);return i>=0?idAt(i+1):null}
function path(){return sceneIds.slice()}
function validate(content,curriculum,storyBeats,director,encounter){
 var problems=[];
 if(new Set(sceneIds).size!==sceneIds.length)problems.push("Duplicate story scene ID");
 if(sceneIds.length!==10)problems.push("Legacy ID migration requires a deliberate versioned plan");
 if(!content||!curriculum||!Array.isArray(content.scenes)||!Array.isArray(curriculum.scenes))return ["Missing content/curriculum"];
 sceneIds.forEach(function(id,i){if(!/^hsk1\.e01\.[a-z0-9-]+$/.test(id))problems.push("Malformed ID "+id);
  if(!content.scenes[i]||content.scenes[i].id!==i||!curriculum.scenes[i]||curriculum.scenes[i].id!==i)problems.push("Broken mapping "+id);
 });
 if(new Set(events.map(e=>e.id)).size!==events.length)problems.push("Duplicate story event ID");
 events.forEach(function(e){var at=indexOf(e.before||e.after);if(at<0)problems.push("Invalid node on event "+e.id);if(e.kind==="branch"&&at>=7)problems.push("Branch cannot skip checkpoint");
  if(e.kind==="interlude"&&(!storyBeats||!storyBeats.beats.some(b=>b.id===e.sourceId)))problems.push("Missing interlude "+e.id);
  if(e.kind==="branch"&&(!director||!director.points.some(p=>p.id===e.sourceId)))problems.push("Missing branch "+e.id);
  if(e.kind==="encounter"&&(!encounter||encounter.content.id!==e.sourceId))problems.push("Missing encounter "+e.id);
 });
 if(next(sceneIds[9])!==null)problems.push("Last scene must terminate");
 return problems;
}
var api={version:"9.0.0",sceneIds:sceneIds,events:events,idAt:idAt,indexOf:indexOf,resolve:resolve,next:next,path:path,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
