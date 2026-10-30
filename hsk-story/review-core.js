/* Isolated spaced-review reducer. Story evidence is read-only; only the review key is written. */
var HSKReviewCore=(function(){"use strict";
 var KEY="hai-que-huong-review-v1",STAGES=[1,3,7,14];
 function dateOK(s){if(typeof s!=="string"||!/^\d{4}-\d\d-\d\d$/.test(s))return false;var d=new Date(s+"T12:00:00Z");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s}
 function plusDays(day,n){if(!dateOK(day)||!Number.isInteger(n)||n<0||n>365)throw Error("Invalid review day");var d=new Date(day+"T12:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
 function initial(){return {v:1,items:{}}}
 function clean(raw,data){
  var state=initial(),known=(data&&Array.isArray(data.items)?data.items:[]);
  if(!raw||raw.v!==1||!raw.items||typeof raw.items!=="object"||Array.isArray(raw.items))return state;
  known.forEach(function(it){var r=raw.items[it.id];if(!r||typeof r!=="object"||Array.isArray(r))return;
   var allowed=["in-progress","independent","assisted","sample","skipped"];
   if(!allowed.includes(r.status))return;
   state.items[it.id]={
    status:r.status,
    attempts:Number.isInteger(r.attempts)?Math.min(20,Math.max(0,r.attempts)):0,
    hinted:r.hinted===true,
    stage:Number.isInteger(r.stage)?Math.min(4,Math.max(0,r.stage)):0,
    lastDay:dateOK(r.lastDay)?r.lastDay:null,
    dueDay:dateOK(r.dueDay)?r.dueDay:null
   };
  });
  return state;
 }
 function completedPrefix(legacy){
  if(!legacy||legacy.v!==3||!Array.isArray(legacy.history))return 0;
  var count=0;while(count<10&&legacy.history[count]&&["correct","assisted","skipped"].includes(legacy.history[count].status))count++;
  return count;
 }
 function storyRecord(raw){if(!raw||typeof raw!=="object"||Array.isArray(raw)||!["correct","assisted","skipped"].includes(raw.status))return null;return Object.freeze({status:raw.status,attempts:Number.isInteger(raw.attempts)?Math.min(100,Math.max(0,raw.attempts)):0,hint:raw.status==="assisted"||raw.hint===true})}
 function combineProgress(legacy,branch){
  var old=legacy&&legacy.v===3&&Array.isArray(legacy.history)?legacy.history:[],other=Array.isArray(branch)?branch:[];
  return Object.freeze({v:3,history:Object.freeze(Array.from({length:10},function(_,i){return storyRecord(old[i])||storyRecord(other[i])}))});
 }
 function readStoryProgress(storage){function safe(key){try{return JSON.parse(storage.getItem(key)||"null")}catch(e){return null}}return combineProgress(safe("hai-que-huong-progress-v3"),safe("chimse-branch-learning-v1"))}
 function storyHref(storage){function safe(key){try{return JSON.parse(storage.getItem(key)||"null")}catch(e){return null}}var previous=safe("hai-que-huong-progress-v3"),branch=safe("hai-que-huong-branching-novel-v1");return previous&&previous.v===3&&Array.isArray(previous.history)&&!(branch&&branch.version===1&&Array.isArray(branch.path))?"/?play=hsk1":"/duong-re/"}
 function unlocked(item,legacy){return !!item&&Number.isInteger(item.after)&&completedPrefix(legacy)>item.after}
 function isDue(record,day){
  if(!record||record.status==="in-progress")return true;
  if(record.lastDay===day)return false;
  return !record.dueDay||record.dueDay<=day
 }
 function queue(data,legacy,rawState,day){
  if(!dateOK(day))throw Error("Invalid current day");
  var state=clean(rawState,data);
  return data.items.filter(function(item){return unlocked(item,legacy)&&isDue(state.items[item.id],day)});
 }
 function report(data,legacy,rawState,day){
  var s=clean(rawState,data),available=data.items.filter(it=>unlocked(it,legacy)),
      count={unlocked:available.length,due:queue(data,legacy,s,day).length,independent:0,assisted:0,sample:0,skipped:0,unassessed:0,reading:0,hanzi:0,typed:0};
  available.forEach(function(it){var r=s.items[it.id];if(r&&["independent","assisted","sample","skipped"].includes(r.status))count[r.status]++;else count.unassessed++;count[it.kind]++});
  return count;
 }
 function act(data,rawState,id,action,day,core,legacy){
  if(!dateOK(day))throw Error("Invalid day");
  var item=data.items.find(it=>it.id===id);if(!item||!unlocked(item,legacy))throw Error("Locked or missing item");
  var state=clean(rawState,data),old=state.items[id],r=old?Object.assign({},old):{status:"in-progress",attempts:0,hinted:false,stage:0,lastDay:null,dueDay:null};
  if(old&&!isDue(old,day))return {state:state,result:"already-reviewed"};
  if(action.type==="hint"){
   r.hinted=true;r.status="in-progress";state.items[id]=r;return {state:state,result:"hint",text:item.hint}
  }
  if(action.type==="sample"){
   if(r.attempts<2)throw Error("Sample is gated after two incorrect attempts");
   r.status="sample";r.stage=0;r.lastDay=day;r.dueDay=plusDays(day,1);r.hinted=true;
   state.items[id]=r;return {state:state,result:"sample",text:(item.kind==="typed"?item.answers[0]:item.options.find(o=>o[0]===item.correct)[1])+" — "+item.explain}
  }
  if(action.type==="skip"){
   r.status="skipped";r.stage=0;r.lastDay=day;r.dueDay=plusDays(day,1);
   state.items[id]=r;return {state:state,result:"skipped",text:"Chưa đánh giá. Bạn có thể quay lại từ ngày mai."}
  }
  if(action.type!=="answer")throw Error("Invalid review action");
  var correct=false;
  if(item.kind==="typed"){
   if(!core||typeof core.evaluate!=="function")throw Error("Typed evaluation requires tested HSKCore");
   correct=core.evaluate({id:item.scene,answers:item.answers},action.value).ok===true;
  }else{
   var opt=item.options.find(o=>o[0]===action.value);
   if(!opt)throw Error("Unknown option");correct=action.value===item.correct;
  }
  if(!correct){
   r.attempts=Math.min(20,r.attempts+1);r.status="in-progress";state.items[id]=r;
   return {state:state,result:"incorrect",text:"Câu này chưa đúng. Bạn thử đọc lại hoàn cảnh và chọn câu phù hợp nhé.",sampleAvailable:r.attempts>=2};
  }
  var independent=!r.hinted&&r.attempts===0;
  r.status=independent?"independent":"assisted";
  r.stage=independent?Math.min(4,r.stage+1):0;
  r.lastDay=day;
  r.dueDay=plusDays(day,independent?STAGES[r.stage-1]:1);
  r.attempts=0;r.hinted=false;
  state.items[id]=r;
  return {state:state,result:independent?"independent":"assisted",text:item.explain,nextDay:r.dueDay};
 }
 function read(storage,data){try{return clean(JSON.parse(storage.getItem(KEY)||"null"),data)}catch(e){return initial()}}
 function write(storage,data,raw){try{storage.setItem(KEY,JSON.stringify(clean(raw,data)));return true}catch(e){return false}}
 var api={key:KEY,intervals:STAGES,initial:initial,clean:clean,plusDays:plusDays,completedPrefix:completedPrefix,combineProgress:combineProgress,readStoryProgress:readStoryProgress,storyHref:storyHref,unlocked:unlocked,isDue:isDue,queue:queue,report:report,act:act,read:read,write:write};
 if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
