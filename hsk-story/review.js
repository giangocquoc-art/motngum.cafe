/* Gate6: optional authored reading/Hanzi/typed recall lab; no data leaves browser.
 * This page MUST NOT write hai-que-huong-progress-v3, v4 or intro-v1.
 */
(function(){"use strict";
var D=HSKReviewData,C=HSKReviewCore,CORE=HSKCore;
if(D.validate().length)throw Error("Review content not valid: "+D.validate().join(", "));
function $(id){return document.getElementById(id)}
function today(){var d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function readStory(){try{return JSON.parse(localStorage.getItem("hai-que-huong-progress-v3")||"null")}catch(e){return null}}
var story=readStory(),progress=C.read(localStorage,D),day=today(),currentId=null,outcome=null,notice="",draft="";
function persist(){if(!C.write(localStorage,D,progress))$("storageNotice").textContent="Trình duyệt không cho phép lưu lịch ôn. Bạn vẫn có thể luyện trong phiên này, nhưng lần sau có thể phải làm lại. Không ảnh hưởng tiến độ truyện."}
function actionLabel(item){return item.kind==="reading"?"ĐỌC HIỂU":item.kind==="hanzi"?"NHẬN MẶT CHỮ":"NHẬP CHỮ HÁN"}
function clearChildren(el){el.replaceChildren()}
function render(){
 var stats=C.report(D,story,progress,day);
 $("unlockedCount").textContent=stats.unlocked;
 $("dueCount").textContent=stats.due;
 $("independentCount").textContent=stats.independent;
 $("assistedCount").textContent=stats.assisted+stats.sample;
 var due=C.queue(D,story,progress,day);
 var active= currentId?D.items.find(x=>x.id===currentId):null;
 if(!active||(!outcome&&!due.some(x=>x.id===currentId))){active=due[0]||null;currentId=active&&active.id||null}
 $("emptyReview").hidden=!!active;
 document.querySelector(".book").classList.toggle("is-empty",!active);
 $("exerciseCard").hidden=!active;
 $("nextBtn").hidden=!outcome;
 $("notice").className="notice"+(outcome&&outcome.result==="independent"?" success":outcome&&["assisted","sample"].includes(outcome.result)?" warning":"");
 if(!active){
  $("taskTitle").textContent=stats.unlocked===0?"Mở trang đầu tiên của câu chuyện":"Ôn tập hôm nay đã xong";
  $("chapterLabel").textContent="SỔ TAY CỦA AN";
  $("taskKind").textContent="Tự chọn";
  $("sceneContext").textContent=stats.unlocked===0?"Hoàn thành ít nhất một cảnh HSK 1 để mở bài ôn đúng thời điểm. Nhập môn không bị bắt buộc.":"Bạn đã xử lý hết các bài ôn đang tới hạn. Các bài mới sẽ mở khi An gặp thêm người và tình huống trong truyện.";
  $("notice").textContent=stats.unlocked===0?"Quay về chơi tập truyện đầu tiên rồi trở lại nhé.":"Không có bài nào đang tới hạn. Hệ thống không tự cấp điểm hoặc làm bài hộ.";
  return;
 }
 $("chapterLabel").textContent="SAU CẢNH "+String(active.after+1).padStart(2,"0")+" · MỘT KÝ ỨC TRONG TRUYỆN";
 $("taskTitle").textContent=active.topic;
 $("taskKind").textContent=actionLabel(active);
 $("sceneContext").textContent="Đây là bài ôn tự chọn dựa trên câu chuyện đã trải qua; không phải đề thi HSK.";
 $("chineseExcerpt").textContent=active.zh;
 $("questionPrompt").textContent=active.question;
 var finished=!!outcome,choice=active.kind!=="typed",hasAttempt=progress.items[active.id]&&progress.items[active.id].attempts>=2;
 $("choiceOptions").hidden=!choice;
 $("typedLabel").hidden=choice;
 $("typedAnswer").hidden=choice;
 $("submitTyped").hidden=choice||finished;
 $("hintBtn").hidden=finished;
 $("skipBtn").hidden=finished;
 $("sampleBtn").hidden=finished||!hasAttempt;
 clearChildren($("choiceOptions"));
 if(choice)active.options.forEach(function(opt){
  var b=document.createElement("button");b.type="button";b.textContent=opt[1];b.disabled=finished;
  b.addEventListener("click",function(){submit({type:"answer",value:opt[0]})});
  $("choiceOptions").appendChild(b);
 });
 $("typedAnswer").disabled=finished;
 $("typedAnswer").value=draft;
 if(outcome){
  $("notice").textContent=outcome.result==="independent"?"✳ Đã tự làm đúng, chưa dùng gợi ý. Ôn lại từ ngày "+outcome.nextDay+".\n"+outcome.text:outcome.result==="assisted"?"✳ Hoàn thành nhờ gợi ý hoặc thử lại. Ôn thêm từ ngày "+outcome.nextDay+".\n"+outcome.text:outcome.result==="sample"?"✳ Xem đáp án mẫu — không tính là tự làm đúng.\n"+outcome.text:"✳ Chưa đánh giá.\n"+outcome.text;
 }else $("notice").textContent=notice;
}
function submit(action){
 if(!currentId||outcome)return;
 var item=D.items.find(x=>x.id===currentId);
 if(item.kind==="typed"&&action.type==="answer")draft=$("typedAnswer").value;
 var result;
 try{result=C.act(D,progress,currentId,action,day,CORE,story)}
 catch(err){$("notice").textContent="Không thể xử lý lựa chọn này. Bạn thử lại nhé.";return}
 progress=result.state;persist();
 if(["independent","assisted","sample","skipped"].includes(result.result)){outcome=result;notice=""}
 else if(result.result==="hint"){notice="Gợi ý (tính là có hỗ trợ): "+result.text}
 else if(result.result==="incorrect"){notice=result.text+(result.sampleAvailable?" Sau hai lần chưa đúng, bạn có thể xem đáp án mẫu.":"")}
 else notice="Hôm nay bạn đã ôn bài này rồi.";
 render();
}
$("submitTyped").addEventListener("click",function(){submit({type:"answer",value:$("typedAnswer").value})});
$("typedAnswer").addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();submit({type:"answer",value:$("typedAnswer").value})}});
$("typedAnswer").addEventListener("input",function(){draft=$("typedAnswer").value});
$("hintBtn").addEventListener("click",function(){submit({type:"hint"})});
$("sampleBtn").addEventListener("click",function(){submit({type:"sample"})});
$("skipBtn").addEventListener("click",function(){submit({type:"skip"})});
$("nextBtn").addEventListener("click",function(){outcome=null;currentId=null;draft="";notice="";render();$("exerciseCard").hidden?$("taskTitle").focus?.():$("questionPrompt").setAttribute("tabindex","-1");if(!$("exerciseCard").hidden)$("questionPrompt").focus?.()});
render();
})();
