/* V8 first authored active story encounter. Learning evidence ≠ chapter exam score. */
var HSKEncounter=(function(){
"use strict";
var id="lost-notebook";
var triggerScene=4;
var objects=[
{id:"desk",label:"Mặt bàn học",clue:"Trên mặt bàn chỉ còn vết mực nhỏ. Sổ không còn ở đây."},
{id:"bag",label:"Ngăn cặp của An",clue:"An lật từng ngăn. Hộp bút vẫn còn, nhưng quyển sổ đã biến mất."},
{id:"door",label:"Gần cửa lớp",clue:"Tiểu Vũ nhìn thấy một trang giấy nhỏ nằm trên lối đi dẫn tới phòng trực."}
];
var routes=[
{id:"friend",label:"Nhờ Tiểu Vũ đi cùng",zh:"我们一起去吧。",vi:"Tiểu Vũ gật đầu: “Mình cùng đi nhé.”"},
{id:"teacher",label:"Nhờ cô Vương chỉ đường",zh:"老师带安去值班室。",vi:"Cô Vương đưa An đến phòng trực, rồi để An tự nói chuyện."}
];
var accepted=["我叫安","我叫明安","我是安"];
var stages=["inspect","decide","respond","outcome","done","legacy"];
function initial(){return {stage:"inspect",inspected:[],route:null,attempts:0,usedHelp:false,answer:null,feedback:""}}
function clean(raw){
 if(!raw||typeof raw!=="object")return initial();
 var i=initial(),stage=stages.includes(raw.stage)?raw.stage:"inspect";
 i.inspected=Array.isArray(raw.inspected)?objects.filter(o=>raw.inspected.includes(o.id)).map(o=>o.id):[];
 i.route=routes.some(o=>o.id===raw.route)?raw.route:null;
 i.attempts=Math.max(0,Math.min(20,Number.isInteger(raw.attempts)?raw.attempts:0));
 i.usedHelp=raw.usedHelp===true;
 i.answer=["independent","helped","retried","sample"].includes(raw.answer)?raw.answer:null;
 i.feedback=typeof raw.feedback==="string"?raw.feedback.slice(0,140):"";
 if(stage==="decide"&&i.inspected.length<2)stage="inspect";
 if(["respond","outcome","done"].includes(stage)&&!i.route)stage=i.inspected.length>=2?"decide":"inspect";
 if(["outcome","done"].includes(stage)&&!i.answer)stage="respond";
 i.stage=stage;return i;
}
function migrate(raw,scene,history,done){
 if(raw&&typeof raw==="object")return clean(raw);
 if(done||scene>triggerScene||!!(history&&history[triggerScene]))return {stage:"legacy",inspected:[],route:null,attempts:0,usedHelp:false,answer:null,feedback:""};
 return initial();
}
function pending(scene,mem){var x=clean(mem);return scene===triggerScene&&!["done","legacy"].includes(x.stage)}
function move(mem,action,score){
 var s=clean(mem),key=action&&action.type;
 if(s.stage==="inspect"&&key==="inspect"){
  if(!objects.some(o=>o.id===action.id))throw Error("Unknown object");
  if(!s.inspected.includes(action.id))s.inspected.push(action.id);
  s.feedback=objects.find(o=>o.id===action.id).clue;
  if(s.inspected.length>=2)s.stage="decide";
  return s;
 }
 if(s.stage==="decide"&&key==="route"){
  if(!routes.some(o=>o.id===action.id))throw Error("Unknown route");
  s.route=action.id;s.stage="respond";s.feedback="";return s;
 }
 if(s.stage==="respond"&&key==="hint"){
  s.usedHelp=true;s.feedback="Gợi ý: dùng mẫu giới thiệu tên đã học khi gặp cô Vương (我叫...).";return s;
 }
 if(s.stage==="respond"&&key==="submit"){
  var value=String(action.value||"").slice(0,120);
  if(!value.trim()){s.feedback="Hãy thử nói tên của An bằng chữ Hán.";return s}
  if(!score||typeof score.evaluate!=="function")throw Error("Requires tested HSK grading core");
  var res=score.evaluate({id:1,answers:accepted},value);
  if(!res.ok){s.attempts++;s.feedback="Cô trực chưa hiểu. Hãy thử giới thiệu tên một lần nữa.";return s}
  s.answer=s.usedHelp?"helped":s.attempts>0?"retried":"independent";
  s.stage="outcome";s.feedback="";return s;
 }
 if(s.stage==="respond"&&key==="sample"&&s.attempts>=2){
  s.usedHelp=true;s.answer="sample";s.stage="outcome";s.feedback="Đã xem câu mẫu: 我叫安。 Đây không phải câu tự trả lời.";return s;
 }
 if(s.stage==="outcome"&&key==="continue"){s.stage="done";return s}
 throw Error("Invalid encounter transition: "+s.stage+" / "+key);
}
function route(id){return routes.find(r=>r.id===id)||null}
function callback(scene,mem){
 var s=clean(mem);
 if(scene!==6||s.stage!=="done")return null;
 return s.route==="friend"?
 {zh:"小雨说：“你的本子找到了，太好了！”",vi:"Tiểu Vũ nhìn quyển sổ An đang ôm và cười: “Tìm được rồi, tốt quá!”"}:
 {zh:"安说：“谢谢王老师！”",vi:"An nhìn về cổng trường, thầm nhớ đã mạnh dạn nhờ cô Vương chỉ đường."};
}
function validate(){
 var err=[];
 if(objects.length<3||routes.length!==2||new Set(objects.map(x=>x.id)).size!==objects.length||new Set(routes.map(x=>x.id)).size!==routes.length)err.push("Invalid encounter graph");
 if(objects.some(o=>!o.label||!o.clue)||routes.some(r=>!r.label||!r.zh||!r.vi))err.push("Incomplete scenario localization");
 if(triggerScene!==4)err.push("Encounter position migration requires explicit review");
 return err;
}
var content={id:id,triggerScene:triggerScene,title:"Quyển sổ biến mất",startZh:"我的小本子呢？",startPy:"Wǒ de xiǎo běnzi ne?",startVi:"Quyển sổ nhỏ của mình đâu rồi?",promptZh:"你叫什么名字？",promptPy:"Nǐ jiào shénme míngzi?",promptVi:"Cô trực hỏi: “Em tên là gì?”",endingZh:"我学会了一点中文，也认识了新朋友。",endingVi:"Hôm nay An chưa hiểu hết mọi lời nói, nhưng đã tìm được một người bạn, một nơi thân thuộc và quyển sổ mẹ tặng. Trên trang mới, An ghi lời nhắc: ngày mai hãy hiểu thêm một người.",prompt:"Em đã học giới thiệu tên với cô Vương. Bây giờ hãy tự dùng lại câu đó để nhận quyển sổ của An.",objects:objects,routes:routes,accepted:accepted};
return {content:content,initial:initial,clean:clean,migrate:migrate,pending:pending,move:move,route:route,callback:callback,validate:validate};
})();
if(typeof module!=="undefined"&&module.exports)module.exports=HSKEncounter;
