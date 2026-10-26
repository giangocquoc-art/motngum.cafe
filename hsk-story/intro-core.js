/* Independent Pre-HSK progress. Never touches HSK1 study, grades or Story Graph. */
var HSKIntroCore=(function(){"use strict";
var storeKey="hai-que-huong-intro-v1",last=8;
function initial(){return {version:1,step:0,maxReached:0,discovered:[],focusGlyph:null,stroke:0,forest:1,people:1,lightParts:[],momRevealed:false,legendRead:false,quizIndex:0,quizResults:{},quizOutcomes:{},finished:false}}
function clamp(x,lo,hi){return Number.isInteger(x)?Math.min(hi,Math.max(lo,x)):lo}
function clean(raw){
 var s=initial();if(!raw||typeof raw!=="object"||Array.isArray(raw))return s;
 s.maxReached=clamp(raw.maxReached,0,last);
 s.step=clamp(raw.step,0,s.maxReached);
 s.discovered=Array.isArray(raw.discovered)?["人","木","日","月"].filter(x=>raw.discovered.includes(x)):[];
 s.focusGlyph=s.discovered.includes(raw.focusGlyph)?raw.focusGlyph:null;
 s.stroke=clamp(raw.stroke,0,3);s.forest=clamp(raw.forest,1,3);s.people=clamp(raw.people,1,3);
 s.lightParts=Array.isArray(raw.lightParts)?["日","月"].filter(x=>raw.lightParts.includes(x)):[];
 s.momRevealed=raw.momRevealed===true;s.legendRead=raw.legendRead===true;
 s.quizResults={};if(raw.quizResults&&typeof raw.quizResults==="object"&&!Array.isArray(raw.quizResults)){
  ["forest","crowd","mother","bright"].forEach(x=>{if(Number.isInteger(raw.quizResults[x])&&raw.quizResults[x]>=-1&&raw.quizResults[x]<=2)s.quizResults[x]=raw.quizResults[x]});
 }
  s.quizOutcomes={};
 ["forest","crowd","mother","bright"].forEach(function(id){
  if(!Object.prototype.hasOwnProperty.call(s.quizResults,id))return;
  var claimed=raw.quizOutcomes&&raw.quizOutcomes[id];
  s.quizOutcomes[id]=s.quizResults[id]===-1?"skipped":["recognized","review","legacy"].includes(claimed)?claimed:"legacy";
 });
 s.quizIndex=clamp(raw.quizIndex,0,4);
 s.finished=raw.finished===true&&s.maxReached===last;
 return s;
}
function move(s,dir){var a=clean(s);if(dir==="next"){a.step=Math.min(last,a.step+1);a.maxReached=Math.max(a.maxReached,a.step);if(a.step===last)a.finished=true}else if(dir==="back")a.step=Math.max(0,a.step-1);else throw Error("Unknown navigation");return a}
function visit(s,zi){var a=clean(s);if(!["人","木","日","月"].includes(zi))throw Error("Unknown glyph");if(!a.discovered.includes(zi))a.discovered.push(zi);a.focusGlyph=zi;return a}
function stroke(s){var a=clean(s);a.stroke=Math.min(3,a.stroke+1);return a}
function setCount(s,kind,n){var a=clean(s);if(!["forest","people"].includes(kind)||!Number.isInteger(n)||n<1||n>3)throw Error("Invalid object count");a[kind]=n;return a}
function light(s,zi){var a=clean(s);if(!["日","月"].includes(zi))throw Error("Invalid light glyph");if(!a.lightParts.includes(zi))a.lightParts.push(zi);return a}
function quiz(s,id,answer,items){var a=clean(s),q=items[a.quizIndex];if(!q||q.id!==id||!Number.isInteger(answer)||answer<0||answer>=q.options.length)throw Error("Invalid quiz item");
 if(Object.prototype.hasOwnProperty.call(a.quizResults,id))return a; // First answer stays locked, even after correction is shown
 a.quizResults[id]=answer;a.quizOutcomes[id]=answer===q.answer?"recognized":"review";return a}
function skipQuiz(s,items){var a=clean(s),q=items[a.quizIndex];if(!q)return a;
 if(!Object.prototype.hasOwnProperty.call(a.quizResults,q.id)){a.quizResults[q.id]=-1;a.quizOutcomes[q.id]="skipped"}return a}
function recap(s,items){var a=clean(s);
 return {recognized:items.filter(q=>a.quizOutcomes[q.id]==="recognized").length,
 practiced:items.filter(q=>a.quizOutcomes[q.id]==="review").length,
 skipped:items.filter(q=>a.quizOutcomes[q.id]==="skipped").length,
 older:items.filter(q=>a.quizOutcomes[q.id]==="legacy").length,
 seen:a.quizIndex,total:items.length};
}
function nextQuiz(s,items){var a=clean(s),q=items[a.quizIndex];if(!q||!Object.prototype.hasOwnProperty.call(a.quizResults,q.id))return a;a.quizIndex=Math.min(items.length,a.quizIndex+1);return a}
function review(s){var a=clean(s);a.quizIndex=0;a.quizResults={};a.quizOutcomes={};return a}
function restart(){return initial()}
var api={key:storeKey,initial:initial,clean:clean,move:move,visit:visit,stroke:stroke,setCount:setCount,light:light,quiz:quiz,skipQuiz:skipQuiz,recap:recap,review:review,nextQuiz:nextQuiz,restart:restart};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
