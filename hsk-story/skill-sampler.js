/* V10 formative modality sample. NOT official HSK, and browser TTS ≠ authenticated audio exam. */
var HSKSkillSampler=(function(){"use strict";
var id="hsk1.e01.skill-sampler",trigger=7;
var items=[
{id:"reading-friend",mode:"reading",hanzi:"小雨是学生。",prompt:"Trong câu trên, ai là học sinh?",options:[{id:"xiaoyu",text:"Tiểu Vũ"},{id:"teacher",text:"Cô Vương"},{id:"liu",text:"Bà Lưu"}],answer:"xiaoyu",sourceScenes:[2]},
{id:"listening-farewell",mode:"listening",audioZh:"明天见！",prompt:"Nghe lời nói ngắn của một người bạn. Người ấy muốn nói gì?",options:[{id:"hello",text:"Xin chào"},{id:"tomorrow",text:"Hẹn gặp ngày mai"},{id:"thanks",text:"Cảm ơn"}],answer:"tomorrow",sourceScenes:[6]}
];
var statuses=["pending","done","legacy","skipped"];
function initial(){return {status:"pending",index:0,results:[],audioPlayed:false,feedback:""}}
function clean(raw){
 var st=initial();if(!raw||typeof raw!=="object")return st;
 st.status=statuses.includes(raw.status)?raw.status:"pending";
 st.results=Array.isArray(raw.results)?raw.results.slice(0,items.length).map((r,i)=>({
  id:items[i].id,mode:items[i].mode,result:["correct","incorrect","unassessed"].includes(r&&r.result)?r.result:"unassessed"
 })):[];
 st.index=st.results.length;
 st.audioPlayed=raw.audioPlayed===true&&st.index<items.length&&items[st.index].mode==="listening";
 st.feedback=typeof raw.feedback==="string"?raw.feedback.slice(0,120):"";
 if(st.status==="done"&&st.results.length!==items.length)st.status="pending";
 if(st.status==="pending"&&st.index>=items.length)st.status="done";
 return st;
}
function migrate(raw,step,history,done){if(raw&&typeof raw==="object")return clean(raw);return done||step>trigger||(history&&history[trigger])?{status:"legacy",index:0,results:[],audioPlayed:false,feedback:""}:initial()}
function pending(step,state){return step===trigger&&clean(state).status==="pending"}
function current(state){var s=clean(state);return s.status==="pending"?items[s.index]||null:null}
function audio(state,supported){
 var s=clean(state),item=current(s);if(!item||item.mode!=="listening"||supported!==true)throw Error("Audio unavailable for valid listening sample");
 s.audioPlayed=true;return s;
}
function answer(state,optionId){
 var s=clean(state),item=current(s);if(!item)throw Error("Sampler already finished");
 if(!item.options.some(o=>o.id===optionId))throw Error("Invalid choice");
 var eligible=item.mode==="reading"||s.audioPlayed===true;
 var result=eligible?(optionId===item.answer?"correct":"incorrect"):"unassessed";
 s.results.push({id:item.id,mode:item.mode,result:result});s.index++;s.audioPlayed=false;
 s.feedback=result==="correct"?"Bạn hiểu đúng ý.":result==="incorrect"?"Cần ôn lại mục này.":"Không ghi nhận nghe hiểu vì chưa phát được audio.";
 if(s.index>=items.length)s.status="done";return s;
}
function skip(state){var s=clean(state);if(!current(s))return s;var item=current(s);s.results.push({id:item.id,mode:item.mode,result:"unassessed"});s.index++;s.audioPlayed=false;s.feedback="Bạn có thể quay lại ôn sau; chưa có bằng chứng cho kỹ năng này.";if(s.index>=items.length)s.status="done";return s}
function skipAll(state){var s=clean(state);while(current(s))s=skip(s);if(s.status==="pending")s.status="skipped";return s}
function summary(state){var s=clean(state);return {reading:s.results.find(x=>x.mode==="reading")?.result||"unassessed",listening:s.results.find(x=>x.mode==="listening")?.result||"unassessed",speaking:"unassessed",writing:"unassessed",note:"Thử nghiệm luyện kỹ năng, không phải bài thi HSK. Nghe dựa vào TTS tùy trình duyệt."}}
function validate(graph,curriculum){var err=[];if(!graph||graph.idAt(trigger)!=="hsk1.e01.exam-introduction")err.push("Sampler trigger moved");if(!curriculum||!Array.isArray(curriculum.scenes))err.push("Missing curriculum");if(new Set(items.map(x=>x.id)).size!==items.length)err.push("Duplicate items");items.forEach(x=>{if(!x.options.some(o=>o.id===x.answer))err.push("No answer");if(x.sourceScenes.some(i=>i>=trigger||i<0))err.push("Unintroduced content");if(!x.prompt||!x.mode)err.push("Missing localized item")});return err}
var api={id:id,trigger:trigger,items:items,initial:initial,clean:clean,migrate:migrate,pending:pending,current:current,audio:audio,answer:answer,skip:skip,skipAll:skipAll,summary:summary,validate:validate};
if(typeof module!=="undefined"&&module.exports)module.exports=api;return api;
})();
