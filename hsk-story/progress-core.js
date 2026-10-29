/* Account sync envelope. Canonical story/intro/review keys stay backward compatible. */
var ChimseProgress=(function(){
"use strict";
var KEYS={story:"hai-que-huong-progress-v3",intro:"hai-que-huong-intro-v1",review:"hai-que-huong-review-v1"};
var STORY_FIELDS="v step history done pinyin vi draft attempts hintUsed examHelp storyChoices storyBeats vocabSeen encounter encounterDraft sceneRef worldSeen worldFocus skillSampler practiceOpen".split(" ");
function plain(v){return !!v&&typeof v==="object"&&!Array.isArray(v)&&(Object.getPrototypeOf(v)===Object.prototype||Object.getPrototypeOf(v)===null)}
function clone(value,depth,budget){
 if(depth>14||--budget.left<0)throw Error("Snapshot too complex");
 if(value===null||typeof value==="boolean")return value;
 if(typeof value==="number"&&Number.isFinite(value))return value;
 if(typeof value==="string"&&value.length<=2000)return value;
 if(Array.isArray(value)&&value.length<=200)return value.map(x=>clone(x,depth+1,budget));
 if(plain(value)&&Object.keys(value).length<=200){var o={};Object.keys(value).sort().forEach(k=>{if(["__proto__","prototype","constructor"].includes(k)||k.length>128)throw Error("Unsafe key");o[k]=clone(value[k],depth+1,budget)});return o}
 throw Error("Invalid snapshot value");
}
function clean(raw){
 if(!plain(raw)||raw.v!==1)throw Error("Unknown snapshot version");
 var out={v:1,story:null,intro:null,review:null};
 Object.keys(KEYS).forEach(area=>{
  if(raw[area]==null)return;
  var value=clone(raw[area],0,{left:5000});if(!plain(value))throw Error("Invalid progress area");
  if(area==="story"){
   if(value.v!==3||!Number.isInteger(value.step)||value.step<0||value.step>9||!Array.isArray(value.history)||value.history.length>10)throw Error("Invalid story");
   value.history.forEach(row=>{if(row!==null&&(!plain(row)||!["correct","assisted"].includes(row.status)))throw Error("Invalid story result")});
   var story={};STORY_FIELDS.forEach(k=>{if(Object.prototype.hasOwnProperty.call(value,k))story[k]=value[k]});value=story;
  }
  if(area==="intro"&&(value.version!==1||!Number.isInteger(value.step)||value.step<0||value.step>8))throw Error("Invalid intro");
  if(area==="review"&&(value.v!==1||!plain(value.items)))throw Error("Invalid review");
  out[area]=value;
 });
 if(JSON.stringify(out).length>120000)throw Error("Snapshot too large");
 return out;
}
function read(storage,key){try{return JSON.parse(storage.getItem(key)||"null")}catch(e){return null}}
function capture(storage){var raw={v:1,story:null,intro:null,review:null};Object.keys(KEYS).forEach(area=>{try{var trial={v:1};trial[area]=read(storage,KEYS[area]);raw[area]=clean(trial)[area]}catch(e){}});return raw}
function stable(value){if(Array.isArray(value))return "["+value.map(stable).join(",")+"]";if(plain(value))return "{"+Object.keys(value).sort().map(k=>JSON.stringify(k)+":"+stable(value[k])).join(",")+"}";return JSON.stringify(value)}
function equal(a,b){return stable(a)===stable(b)}
function merge(base,local,remote){
 base=clean(base||{v:1});local=clean(local);remote=clean(remote||{v:1});var result={v:1},conflicts=[];
 Object.keys(KEYS).forEach(area=>{
  if(equal(local[area],remote[area]))result[area]=local[area];
  else if(equal(local[area],base[area]))result[area]=remote[area];
  else if(equal(remote[area],base[area]))result[area]=local[area];
  else{conflicts.push(area);result[area]=local[area]}
 });return {snapshot:result,conflicts:conflicts};
}
function hasProgress(raw){var s=clean(raw);return !!(s.story&&(s.story.step>0||s.story.done||s.story.history.length)||s.intro&&(s.intro.maxReached>0||s.intro.discovered&&s.intro.discovered.length)||s.review&&Object.keys(s.review.items).length)}
function describe(raw){var s=clean(raw||{v:1}),parts=[];if(s.story){var n=s.story.history.filter(x=>x&&["correct","assisted"].includes(x.status)).length;parts.push(s.story.done?"Đã đi hết tập truyện":"Truyện: cảnh "+(s.story.step+1)+"/10 · đã qua "+n+" cảnh")}if(s.intro)parts.push("Cuốn sổ: trang "+(s.intro.step+1)+"/9");if(s.review&&Object.keys(s.review.items).length)parts.push("Đã ôn "+Object.keys(s.review.items).length+" câu");return parts.join(" · ")||"Chưa bắt đầu câu chuyện"}
function apply(storage,raw){
 var value=clean(raw),before={};Object.keys(KEYS).forEach(area=>before[area]=storage.getItem(KEYS[area]));
 try{Object.keys(KEYS).forEach(area=>{if(value[area]===null)storage.removeItem(KEYS[area]);else storage.setItem(KEYS[area],JSON.stringify(value[area]))});storage.removeItem("hai-que-huong-progress-v4")}
 catch(error){Object.keys(KEYS).forEach(area=>{try{before[area]===null?storage.removeItem(KEYS[area]):storage.setItem(KEYS[area],before[area])}catch(e){}});throw error}
 return value;
}
var api={keys:KEYS,clean:clean,capture:capture,equal:equal,merge:merge,hasProgress:hasProgress,describe:describe,apply:apply};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
