/* Gate6: optional authored reading/Hanzi/typed recall lab; no data leaves browser.
 * This page MUST NOT write hai-que-huong-progress-v3, v4 or intro-v1.
 */
(function(){"use strict";
var D=HSKReviewData,C=HSKReviewCore,CORE=HSKCore;
if(D.validate().length)throw Error("Review content not valid: "+D.validate().join(", "));
function $(id){return document.getElementById(id)}
function today(){var d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function readStory(){try{return C.readStoryProgress(localStorage)}catch(e){return C.combineProgress(null,null)}}
var story=readStory(),progress=C.read(localStorage,D),day=today(),currentId=null,outcome=null,notice="",draft="";
var practiceMode=typeof location!=="undefined"&&new URLSearchParams(location.search).get("mode")==="practice";
var practiceItems=practiceMode?C.practiceQueue(D,story,5):[],practiceIndex=0;
var storyHref=C.storyHref(localStorage);if(storyHref!=="/duong-re/")document.querySelectorAll('a[href="/duong-re/"]').forEach(function(link){link.href=storyHref});
function persist(){if(!C.write(localStorage,D,progress))$("storageNotice").textContent="Trình duyệt chưa giữ được lịch ôn trên máy. Bạn vẫn có thể luyện tiếp và thử lưu vào tài khoản.";if(typeof window.CustomEvent==="function"&&typeof window.dispatchEvent==="function")window.dispatchEvent(new window.CustomEvent("chimse-progress-changed",{detail:{area:"review",value:C.clean(progress,D)}}))}
function actionLabel(item){return item.kind==="reading"?"ĐỌC HIỂU":item.kind==="hanzi"?"NHẬN MẶT CHỮ":"NHẬP CHỮ HÁN"}
function clearChildren(el){el.replaceChildren()}
function render(){
 document.querySelector(".book").dataset.state=outcome?"feedback":"question";
 var stats=C.report(D,story,progress,day);
 $("unlockedCount").textContent=stats.unlocked;
 $("dueCount").textContent=stats.due;
 $("independentCount").textContent=stats.independent;
 $("assistedCount").textContent=stats.assisted+stats.sample;
 var due=C.queue(D,story,progress,day),pool=practiceMode?practiceItems:due;
 var active= currentId?D.items.find(x=>x.id===currentId):null;
 if(!active||(!outcome&&!pool.some(x=>x.id===currentId))){active=pool[practiceMode?practiceIndex:0]||null;currentId=active&&active.id||null}
 if(window.HSKSceneLayers){var artScene=active&&(Number.isInteger(active.artScene)?active.artScene:Number.isInteger(active.scene)?active.scene:active.after);window.HSKSceneLayers.mount($("reviewArt"),active?HSKSceneLayers.sceneIds[artScene]:"review.notebook",{dialogue:document.querySelector(".opening"),anExpression:outcome&&outcome.result==="independent"?"smile":"thinking"});if(due[1]){var nextArt=Number.isInteger(due[1].artScene)?due[1].artScene:Number.isInteger(due[1].scene)?due[1].scene:due[1].after;window.HSKSceneLayers.preload(HSKSceneLayers.sceneIds[nextArt])}}
 $("emptyReview").hidden=!!active;
 document.querySelector(".book").classList.toggle("is-empty",!active);
 $("exerciseCard").hidden=!active;
 $("nextBtn").hidden=!outcome;
 $("notice").className="notice"+(outcome&&outcome.result==="independent"?" success":outcome&&["assisted","sample"].includes(outcome.result)?" warning":"");
 if(!active){
   var firstReview=stats.unlocked===0,practiceFinished=practiceMode&&practiceItems.length>0&&practiceIndex>=practiceItems.length;
   $("taskTitle").textContent=practiceFinished?"Đã xong lượt luyện thêm":firstReview?"Chưa có bài để ôn":"Hôm nay đã ôn xong";
  $("chapterLabel").textContent="SỔ TAY CỦA AN";
  $("taskKind").textContent="Tự chọn";
   $("sceneContext").textContent=practiceFinished?"Lượt này dùng câu hỏi đã biên soạn sẵn. Luyện thêm không đổi lịch ôn.":firstReview?"Sổ tay mở bài ôn sau khi bạn hoàn thành một cảnh HSK 1. Tập Nhập môn là tùy chọn.":"Bạn đã ôn hết các câu đến hạn hôm nay. Bài mới sẽ mở khi An gặp thêm người và tình huống trong truyện.";
   $("openingCopy").textContent=practiceFinished?"Lượt luyện thêm chỉ là thực hành ngay lúc này; không phải ôn nhớ sau một khoảng thời gian.":firstReview?"Sổ tay giúp An ôn lại những câu đã gặp trong truyện. Hoàn thành một cảnh HSK 1 để mở bài ôn đầu tiên; Nhập môn là tùy chọn.":"Sổ tay giúp An ôn lại những câu đã gặp. Bạn đã xong các bài đến hạn hôm nay; bài mới sẽ mở khi câu chuyện có thêm tình huống.";
   $("emptyTitle").textContent=practiceFinished?"Đã luyện thêm "+practiceIndex+" câu":firstReview?"Bắt đầu từ một cảnh HSK 1":"Hôm nay chưa có bài mới";
   $("emptyCopy").textContent=practiceFinished?"Kết quả lượt này không thay đổi trạng thái hay ngày ôn của bất kỳ câu nào.":firstReview?"Hoàn thành một cảnh HSK 1 để mở bài ôn đầu tiên. Nhập môn là tùy chọn; bạn có thể bắt đầu ngay cùng An.":"Bạn đã ôn hết những câu đến hạn hôm nay. Tiếp tục câu chuyện để gặp thêm câu mới và mở bài ôn sau này.";
   $("emptyLink").href=practiceFinished?"/ren-luyen.html":storyHref;
   $("emptyLink").textContent=practiceFinished?"Trở lại sổ ôn hôm nay ↗":firstReview?"Bắt đầu HSK 1 cùng An ↗":"Tiếp tục câu chuyện cùng An ↗";
   var morePractice=$("practiceLink");if(morePractice){morePractice.hidden=firstReview||stats.unlocked===0||practiceMode;morePractice.href="/ren-luyen.html?mode=practice"}
   $("notice").textContent=practiceFinished?"Luyện thêm không phải ôn giãn cách; lịch ôn vẫn giữ nguyên.":firstReview?"":"Không có bài nào đang tới hạn hôm nay.";
  return;
 }
 $("chapterLabel").textContent=practiceMode?"LUYỆN THÊM · TỐI ĐA 5 CÂU · KHÔNG ĐỔI LỊCH":"SAU CẢNH "+String(active.after+1).padStart(2,"0")+" · MỘT KÝ ỨC TRONG TRUYỆN";
 $("taskTitle").textContent=active.topic;
 $("taskKind").textContent=actionLabel(active);
 $("sceneContext").textContent=practiceMode?"Lượt luyện thêm ngay bây giờ. Đây không phải bài ôn giãn cách và không đổi lịch ôn.":"Đây là bài ôn tự chọn dựa trên câu chuyện đã trải qua; không phải đề thi HSK.";
 $("chineseExcerpt").textContent=active.zh;
 $("questionPrompt").textContent=active.question;
 var finished=!!outcome,choice=active.kind!=="typed",hasAttempt=practiceMode?C.practiceAttempts(progress,active.id)>=2:progress.items[active.id]&&progress.items[active.id].attempts>=2;
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
  $("notice").textContent=practiceMode?(outcome.result==="practice-independent"?"✳ Đúng trong lượt luyện thêm. Đây không phải ôn nhớ sau một khoảng thời gian và không đổi lịch ôn.\n"+outcome.text:outcome.result==="practice-assisted"?"✳ Đúng sau gợi ý hoặc thử lại trong lượt luyện thêm. Lịch ôn không đổi.\n"+outcome.text:outcome.result==="sample"?"✳ Đã xem đáp án mẫu. Lịch ôn không đổi.\n"+outcome.text:"✳ Lượt này chưa được đánh giá. Lịch ôn không đổi.\n"+outcome.text):outcome.result==="independent"?"✳ Đã tự làm đúng, chưa dùng gợi ý. Ôn lại từ ngày "+outcome.nextDay+".\n"+outcome.text:outcome.result==="assisted"?"✳ Hoàn thành nhờ gợi ý hoặc thử lại. Ôn thêm từ ngày "+outcome.nextDay+".\n"+outcome.text:outcome.result==="sample"?"✳ Xem đáp án mẫu — không tính là tự làm đúng.\n"+outcome.text:"✳ Chưa đánh giá.\n"+outcome.text;
  $("nextBtn").textContent=practiceMode?(practiceIndex+1<practiceItems.length?"Câu luyện tiếp theo ↗":"Kết thúc lượt luyện ↗"):"Ôn câu tiếp theo ↗";
 }else $("notice").textContent=notice;
}
function submit(action){
 if(!currentId||outcome)return;
 var item=D.items.find(x=>x.id===currentId);
 if(item.kind==="typed"&&action.type==="answer")draft=$("typedAnswer").value;
 var result;
 try{result=practiceMode?C.practice(D,progress,currentId,action,day,CORE,story):C.act(D,progress,currentId,action,day,CORE,story)}
 catch(err){$("notice").textContent="Không thể xử lý lựa chọn này. Bạn thử lại nhé.";return}
 progress=result.state;persist();
 if(["independent","assisted","practice-independent","practice-assisted","sample","skipped"].includes(result.result)){outcome=result;notice=""}
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
$("nextBtn").addEventListener("click",function(){outcome=null;draft="";notice="";if(practiceMode){practiceIndex++;currentId=practiceItems[practiceIndex]&&practiceItems[practiceIndex].id||null}else currentId=null;render();$("exerciseCard").hidden?$("taskTitle").focus?.():$("questionPrompt").setAttribute("tabindex","-1");if(!$("exerciseCard").hidden)$("questionPrompt").focus?.()});
render();
})();
