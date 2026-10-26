/* Independent Pre-HSK progress. Never touches HSK1 study, grades or Story Graph. */
var HSKIntroCore=(function(){"use strict";
var storeKey="hai-que-huong-intro-v1",last=8;
function initial(){return {version:1,step:0,maxReached:0,discovered:[],stroke:0,forest:1,people:1,lightParts:[],momRevealed:false,legendRead:false,quizIndex:0,quizResults:{},finished:false}}
function clamp(x,lo,hi){return Number.isInteger(x)?Math.min(hi,Math.max(lo,x)):lo}
function clean(raw){
 var s=initial();if(!raw||typeof raw!=="object"||Array.isArray(raw))return s;
 s.maxReached=clamp(raw.maxReached,0,last);
 s.step=clamp(raw.step,0,s.maxReached);
 s.discovered=Array.isArray(raw.discovered)?["人","木","日","月"].filter(x=>raw.discovered.includes(x)):[];
 s.stroke=clamp(raw.stroke,0,3);s.forest=clamp(raw.forest,1,3);s.people=clamp(raw.people,1,3);
 s.lightParts=Array.isArray(raw.lightParts)?["日","月"].filter(x=>raw.lightParts.includes(x)):[];
 s.momRevealed=raw.momRevealed===true;s.legendRead=raw.legendRead===true;
 s.quizResults={};if(raw.quizResults&&typeof raw.quizResults==="object"&&!Array.isArray(raw.quizResults)){
  ["forest","crowd","mother","bright"].forEach(x=>{if(Number.isInteger(raw.quizResults[x])&&raw.quizResults[x]>=0&&raw.quizResults[x]<=2)s.quizResults[x]=raw.quizResults[x]});
 }
 s.quizIndex=clamp(raw.quizIndex,0,4);
 s.finished=raw.finished===true&&s.maxReached===last;
 return s;
}
function move(s,dir){var a=clean(s);if(dir==="next"){a.step=Math.min(last,a.step+1);a.maxReached=Math.max(a.maxReached,a.step);if(a.step===last)a.finished=true}else if(dir==="back")a.step=Math.max(0,a.step-1);else throw Error("Unknown navigation");return a}
function visit(s,zi){var a=clean(s);if(!["人","木","日","月"].includes(zi))throw Error("Unknown glyph");if(!a.discovered.includes(zi))a.discovered.push(zi);return a}
function stroke(s){var a=clean(s);a.stroke=Math.min(3,a.stroke+1);return a}
function setCount(s,kind,n){var a=clean(s);if(!["forest","people"].includes(kind)||!Number.isInteger(n)||n<1||n>3)throw Error("Invalid object count");a[kind]=n;return a}
function light(s,zi){var a=clean(s);if(!["日","月"].includes(zi))throw Error("Invalid light glyph");if(!a.lightParts.includes(zi))a.lightParts.push(zi);return a}
function quiz(s,id,answer,items){var a=clean(s),q=items[a.quizIndex];if(!q||q.id!==id||!Number.isInteger(answer)||answer<0||answer>=q.options.length)throw Error("Invalid quiz item");a.quizResults[id]=answer;return a}
function nextQuiz(s,items){var a=clean(s),q=items[a.quizIndex];if(!q||!Number.isInteger(a.quizResults[q.id]))return a;a.quizIndex=Math.min(items.length,a.quizIndex+1);return a}
function restart(){return initial()}
var api={key:storeKey,initial:initial,clean:clean,move:move,visit:visit,stroke:stroke,setCount:setCount,light:light,quiz:quiz,nextQuiz:nextQuiz,restart:restart};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
