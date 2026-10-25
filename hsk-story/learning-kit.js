/* In-story learner support (pure functions). Does not claim official HSK mastery. */
var HSKLearningKit=(function(){
"use strict";
var tileBank=[
["我","很","好","谢谢"],["我叫","安","明安","你好"],["我是","学生","是","对"],["有","三个","学生","三个人"],["我想吃","面条","我要","一碗"],["谢谢","谢谢您","谢谢奶奶"],["好","好的","明天见"]
];
function tiles(sceneId){return (tileBank[sceneId]||[]).slice()}
function compose(draft,token){
 var s=String(draft||"");
 if(token==="__clear")return "";
 if(token==="__undo")return Array.from(s).slice(0,-1).join("");
 return (s+String(token||"")).slice(0,100);
}
function needsReview(history,scenes){
 return (scenes||[]).filter(function(s){return s.kind==="practice"}).map(function(s){
  var result=Array.isArray(history)?history[s.id]:null;
  if(!result)return null;
  var severity=result.status==="assisted"?3:result.hint?2:(Number(result.attempts)||0)>0?1:0;
  return severity?{sceneId:s.id,objective:s.objective,topic:s.topic,severity:severity}:null;
 }).filter(Boolean).sort(function(a,b){return b.severity-a.severity||a.sceneId-b.sceneId});
}
function notebook(scenes,history,step,done){
 var seen=new Set(),words=[];
 (scenes||[]).forEach(function(scene){
  if(scene.kind!=="practice"||!(scene.id<=step||done||history&&history[scene.id]))return;
  (scene.words||[]).forEach(function(w){
   if(!w||!w[0]||seen.has(w[0]))return;
   seen.add(w[0]);
   words.push({hanzi:w[0],pinyin:w[1],vietnamese:w[2],firstSeen:scene.id});
  });
 });
 return words;
}
function counts(history,scenes){
 var total=(scenes||[]).filter(s=>s.kind==="practice").length;
 var finished=(scenes||[]).filter(s=>s.kind==="practice"&&history&&history[s.id]).length;
 var independent=(scenes||[]).filter(s=>s.kind==="practice"&&history&&history[s.id]&&history[s.id].status==="correct"&&!history[s.id].hint&&(history[s.id].attempts||0)===0).length;
 return {total:total,finished:finished,independent:independent,review:needsReview(history,scenes).length};
}
if(typeof module!=="undefined"&&module.exports)module.exports={tiles:tiles,compose:compose,needsReview:needsReview,notebook:notebook,counts:counts};
return {tiles:tiles,compose:compose,needsReview:needsReview,notebook:notebook,counts:counts};
})();
