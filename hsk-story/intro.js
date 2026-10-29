/* Optional chapter 0 / Pre-HSK story UI. No mutation of HSK1 progress. */
(function(){"use strict";
if(typeof HSKIntroContent==="undefined"||typeof HSKIntroCore==="undefined"||HSKIntroContent.validate().length){document.body.textContent="Không tải được dữ liệu tập nhập môn.";return;}
var Data=HSKIntroContent,Core=HSKIntroCore,$=function(id){return document.getElementById(id)};
var state=read(),last=Data.stages.length-1,feedback="",curiosityIndex=0;
function read(){try{return Core.clean(JSON.parse(localStorage.getItem(Core.key)||"null"))}catch(e){return Core.initial()}}
function save(){try{localStorage.setItem(Core.key,JSON.stringify(state));$("saveStatus").textContent="Đã giữ trang này trên máy"}catch(e){$("saveStatus").textContent="Trình duyệt không lưu được — vẫn có thể tiếp tục"}if(typeof window.CustomEvent==="function"&&typeof window.dispatchEvent==="function")window.dispatchEvent(new window.CustomEvent("chimse-progress-changed",{detail:{area:"intro",value:Core.clean(state)}}))}
function el(tag,cls,text){var node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node}
function button(label,handle,cls){var b=el("button",cls||"number-button",label);b.type="button";b.addEventListener("click",handle);return b}
function change(next,message){state=Core.clean(next);save();feedback=message||"";render()}
function say(text){if(!text)return;try{
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined")throw Error("TTS unavailable");
 window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang="zh-CN";u.rate=.78;window.speechSynthesis.speak(u);
 feedback="Đã yêu cầu trình duyệt đọc tiếng Trung. Giọng đọc tùy thiết bị."; $("feedback").textContent=feedback;
 }catch(e){feedback="Thiết bị này không hỗ trợ giọng đọc. Bạn vẫn có thể học bằng chữ và Pinyin.";$("feedback").textContent=feedback}
}
function showCard(char,pinyin,meaning){
 var result=el("div","character-result");result.setAttribute("role","status");
 var han=el("b","",char);han.lang="zh-CN";
 result.appendChild(han);result.appendChild(el("span","",pinyin+" · "+meaning));return result;
}
function topGlyph(stage){
 var ch=stage.hanzi,py=stage.pinyin;
 if(stage.kind==="discover"&&state.focusGlyph){var d=Data.discovery.find(g=>g.zi===state.focusGlyph);if(d){ch=d.zi;py=d.py}}
 if(stage.kind==="guess"){var q=Data.quizzes[state.quizIndex];ch=q?q.zi:"好";py=q?q.py:"hǎo"}
 if(stage.kind==="legend"&&state.curiosityOpen){ch=Data.curiosity.examples[curiosityIndex].zi;py=Data.curiosity.examples[curiosityIndex].py}
 if(stage.kind==="strokes"&&state.stroke){ch=["","一","二","三"][state.stroke];py=["","yī","èr","sān"][state.stroke]}
 if(stage.kind==="forest"){ch=["","木","林","森"][state.forest];py=["","mù","lín","sēn"][state.forest]}
 if(stage.kind==="people"){ch=["","人","从","众"][state.people];py=["","rén","cóng","zhòng"][state.people]}
 $("mainGlyph").textContent=ch;$("mainGlyph").classList.toggle("smaller",[...ch].length>2);
 $("mainPinyin").textContent=py;
 return [...ch].filter(x=>x.trim()).join("");
}
function renderDiscover(root){
 var grid=el("div","glyph-grid");
 Data.discovery.forEach(function(g){
  var seen=state.discovered.includes(g.zi),b=button("",function(){change(Core.visit(state,g.zi),g.zi+" · "+g.py+" · "+g.meaning+". "+g.note)}, "glyph-option");
  b.replaceChildren();
  var glyph=el("strong","",g.zi);glyph.lang="zh-CN";b.appendChild(glyph);
  b.appendChild(el("span","",seen?g.meaning:"Chạm"));
  b.appendChild(el("small","",seen?g.py:""));
  b.classList.toggle("selected",state.focusGlyph===g.zi);
  grid.appendChild(b);
 });
 root.appendChild(grid);
 root.appendChild(el("p","micro-note","Bạn có thể nghe từng chữ: hãy chạm vào một ô rồi dùng nút Nghe chữ này ở trang bên trái."));
}
function strokeSvg(n){
 var y=n===1?[81]:n===2?[56,107]:n===3?[39,77,116]:[];
 var width=n===3?[126,84,154]:n===2?[100,157]:[138];
 return '<svg class="stroke-drawing" viewBox="0 0 260 165" role="img" aria-label="'+(n?n+' nét ngang, theo thứ tự từ trên xuống':'Khung giấy trống chờ viết nét')+'"><path d="M35 13V151M225 13V151M10 31H250M10 138H250" stroke="#ddd0b7" stroke-width="1" stroke-dasharray="4 6" fill="none"/>'+y.map(function(pos,i){var x1=(260-width[i])/2,x2=260-x1;return '<line x1="'+x1+'" y1="'+pos+'" x2="'+x2+'" y2="'+pos+'"/>'}).join("")+'</svg>';
}
function renderStrokes(root){
 var holder=el("div","");holder.innerHTML=strokeSvg(state.stroke);root.appendChild(holder);
 root.appendChild(el("p","micro-note",state.stroke?("Đã có "+state.stroke+" nét. Chữ "+["","一","二","三"][state.stroke]+" nghĩa là "+["","một","hai","ba"][state.stroke]+"."):"Trang giấy đang trống. Thêm nét đầu tiên nhé."));
 var row=el("div","option-row");
 row.appendChild(button(state.stroke>=3?"Đã đủ 3 nét ✓":"+ Thêm một nét ngang →",function(){if(state.stroke<3)change(Core.stroke(state),"")},"primary"));
 row.appendChild(button("Viết lại",function(){change({...state,stroke:0},"")},"secondary"));root.appendChild(row);
}
function renderCount(root,kind){
 var options=kind==="forest"?[
 ["木","mù","Một cây: cây/gỗ"],["林","lín","Hai cây: rừng nhỏ/lùm cây"],["森","sēn","Ba cây: rừng rậm"]
 ]:[["人","rén","Một người"],["从","cóng","Hai người: đi theo"],["众","zhòng","Nhiều người: đám đông"]];
 var n=state[kind],row=el("div","option-row");
 options.forEach(function(o,i){var b=button((i+1)+(kind==="forest"?" cây":" người"),function(){change(Core.setCount(state,kind,i+1),"")},"number-button");b.classList.toggle("active",n===i+1);row.appendChild(b)});
 root.appendChild(row);root.appendChild(showCard(options[n-1][0],options[n-1][1],options[n-1][2]));
}
function renderLight(root){
 var row=el("div","parts");
 ["日","月"].forEach(function(zi,i){
  var b=button(zi,function(){change(Core.light(state,zi),"")},"part-button");
  b.lang="zh-CN";b.classList.toggle("active",state.lightParts.includes(zi));row.appendChild(b);
  if(i===0)row.appendChild(el("span","math-symbol","+"));
 });
 row.appendChild(el("span","math-symbol","="));
 row.appendChild(el("span","math-symbol",state.lightParts.length===2?"明":"?"));
 root.appendChild(row);
 if(state.lightParts.length===2)root.appendChild(showCard("明","míng","sáng, rõ ràng"));
 else root.appendChild(el("p","micro-note","Hãy chạm vào cả mặt trời 日 và mặt trăng 月 để ghép hình."));
}
function renderMother(root){
 var row=el("div","parts");
 var first=el("span","part-button","女"),second=el("span","part-button","马");
 first.lang="zh-CN";second.lang="zh-CN";row.appendChild(first);row.appendChild(el("span","math-symbol","+"));row.appendChild(second);
 row.appendChild(el("span","math-symbol","="));row.appendChild(el("span","math-symbol",state.momRevealed?"妈":"?"));root.appendChild(row);
 root.appendChild(button(state.momRevealed?"Đã phát hiện bí mật ✓":"Hóa ra chữ này đọc thế nào?",function(){change({...state,momRevealed:true},"")},"primary"));
 if(state.momRevealed)root.appendChild(showCard("妈","mā","mẹ — có bộ phận gợi âm và bộ phận gợi nghĩa"));
}
function renderLegend(root){
 var d=Data.curiosity;
 if(!state.curiosityOpen){
  root.appendChild(el("p","micro-note","安 là chữ mẹ dùng để viết tên An. Thử tìm lại chữ ấy trong trang sổ phía trên nhé."));
  root.appendChild(button(state.legendRead?"Xem lại góc chữ Hán kỳ lạ ↗":"✳ Tò mò? Mở trang chữ Hán kỳ lạ ↗",
   function(){curiosityIndex=0;change(Core.curiosity(state,true),"")},"number-button"));
  root.appendChild(el("p","micro-note","Bạn có thể đọc tiếp câu chuyện mà không cần mở trang này."));
  return;
 }
 var panel=el("section","curiosity-details");panel.id="curiosityDetails";
 panel.appendChild(el("h3","",d.title));
 if(curiosityIndex===0)panel.appendChild(el("p","",d.lead));
 [d.examples[curiosityIndex]].forEach(function(item){
  var row=el("div","curiosity-example");
  var glyph=el("strong","",item.zi);glyph.lang="zh-CN";row.appendChild(glyph);
  var info=el("span","");
  info.appendChild(el("b","",item.py+" · "+item.vi));info.appendChild(el("small","",item.note));
  row.appendChild(info);panel.appendChild(row);
 });
 if(curiosityIndex===d.examples.length-1)panel.appendChild(el("p","",d.closing));
 var nav=el("div","curiosity-pages");
 var back=button("← Chữ trước",function(){curiosityIndex--;render()},"secondary");back.disabled=curiosityIndex===0;
 var next=button("Chữ tiếp →",function(){curiosityIndex++;render()},"secondary");next.disabled=curiosityIndex===d.examples.length-1;
 nav.appendChild(back);nav.appendChild(el("span","",(curiosityIndex+1)+" / "+d.examples.length));nav.appendChild(next);panel.appendChild(nav);
 panel.appendChild(button("← Về An và mẹ",function(){change(Core.curiosity(state,false),"")},"secondary"));
 root.appendChild(panel);
}
function renderQuiz(root){
 var qi=state.quizIndex;
 if(qi>=Data.quizzes.length){
  root.appendChild(el("p","recap-story","An khép trang sổ lại. Có chữ cậu nhận ra ngay, có chữ cần gặp thêm vài lần. Mai nếu quên, cậu có thể mở sổ xem lại."));
  root.appendChild(button("Thử lại mấy chữ này ↻",function(){change(Core.review(state),"Mình thử lại nhé. Cứ nhìn hình chữ trước, chưa nhớ cũng không sao.")},"secondary"));
  return;
 }
 var q=Data.quizzes[qi],picked=state.quizResults[q.id],hasAnswer=Object.prototype.hasOwnProperty.call(state.quizResults,q.id);
 root.appendChild(el("p","micro-note","Câu "+(qi+1)+" / "+Data.quizzes.length+": "+q.question));
 var grid=el("div","quiz-choices");grid.hidden=hasAnswer;
 q.options.forEach(function(text,i){var b=button(text,function(){if(hasAnswer)return;change(Core.quiz(state,q.id,i,Data.quizzes),"")},"quiz-choice");b.classList.toggle("active",picked===i);b.disabled=hasAnswer;grid.appendChild(b)});
 root.appendChild(grid);
 if(hasAnswer){var result=el("p",picked===q.answer?"good":"again",
 (picked===-1?"✳ Đã bỏ qua câu này. ":picked===q.answer?"✳ Nhận ra đúng ngay lần chọn đầu tiên. ":"✳ Đây là chỗ mình vừa học thêm! Đáp án đúng: "+q.options[q.answer]+". ")+q.explain);result.setAttribute("role","status");root.appendChild(result)}
}
function renderEnding(root){
 var card=el("div","finish-card");
 var phrase=el("div","ending-phrase"),han=el("strong","","明天见！");
 han.lang="zh-CN";phrase.appendChild(han);phrase.appendChild(el("span","","Míngtiān jiàn!"));phrase.appendChild(el("b","","Hẹn gặp ngày mai!"));card.appendChild(phrase);
 var parts=el("div","ending-breakdown");
 [["明天","míngtiān","ngày mai"],["见","jiàn","gặp lại"]].forEach(function(word){
  var item=el("div","ending-word"),glyph=el("strong","",word[0]);glyph.lang="zh-CN";
  item.appendChild(glyph);item.appendChild(el("span","",word[1]));item.appendChild(el("small","",word[2]));parts.appendChild(item);
 });
 card.appendChild(parts);
 card.appendChild(el("p","ending-use","Dùng khi tạm biệt người sẽ gặp lại ngày mai."));
 root.appendChild(card);
}
function updateNav(stage){
 $("backBtn").disabled=state.step===0;
 if(stage.kind==="guess"&&state.quizIndex<Data.quizzes.length){
  var q=Data.quizzes[state.quizIndex];
  $("nextBtn").textContent=Object.prototype.hasOwnProperty.call(state.quizResults,q.id)?"Câu đoán tiếp theo ↗":"Bỏ qua câu này ↗";
 }else $("nextBtn").textContent=stage.kind==="ending"?"Bắt đầu HSK 1 ↗":"Trang tiếp theo ↗";
}
function render(){
 var stage=Data.stages[state.step];
 $("position").textContent="TRANG "+String(state.step+1).padStart(2,"0")+" / "+String(Data.stages.length).padStart(2,"0");
 $("storyProgress").value=state.step+1;
 $("chapterType").textContent="TRANG SỔ · "+String(state.step+1).padStart(2,"0");
 $("scenePlace").textContent=stage.scene;$("storyHeading").textContent=stage.label;
 $("narrative").textContent=stage.narrative;$("storyTip").textContent=stage.tip;
 $("learningKicker").textContent=stage.kind==="ending"?"MỘT CÂU AN MANG THEO":"MỘT TRANG TRONG CUỐN SỔ";
 $("learningTitle").textContent=stage.kind==="ending"?"Hẹn gặp ngày mai":"Khám phá cùng An";
 $("interactionLabel").textContent=stage.kind==="ending"?"":"✳ KHÁM PHÁ";
 $("inkLabel").textContent=stage.scene.toUpperCase();
 topGlyph(stage);
 $("interactive").replaceChildren();
 switch(stage.kind){
 case "discover":renderDiscover($("interactive"));break;
 case "strokes":renderStrokes($("interactive"));break;
 case "forest":case "people":renderCount($("interactive"),stage.kind);break;
 case "light":renderLight($("interactive"));break;
 case "mother":renderMother($("interactive"));break;
 case "legend":renderLegend($("interactive"));break;
 case "guess":renderQuiz($("interactive"));break;
 case "ending":renderEnding($("interactive"));break;
 }
 $("feedback").textContent=feedback;updateNav(stage);
 if(window.HSKSceneLayers)window.HSKSceneLayers.mount($("introArt"),"intro.bedroom",{dialogue:document.querySelector(".intro-dialogue"),glyph:document.querySelector(".glyph-frame"),anExpression:stage.kind==="ending"?"smile":stage.kind==="discover"?"curious":"thinking"});
}
function next(){
 if(state.step===last){window.location.href="/?play=hsk1";return}
 if(Data.stages[state.step].kind==="guess"&&state.quizIndex<Data.quizzes.length){
  var q=Data.quizzes[state.quizIndex];
  if(Object.prototype.hasOwnProperty.call(state.quizResults,q.id))change(Core.nextQuiz(state,Data.quizzes),"");
  else change(Core.nextQuiz(Core.skipQuiz(state,Data.quizzes),Data.quizzes),"Đã bỏ qua đúng một câu. Câu tiếp theo vẫn ở đây nếu bạn muốn thử.");
  return;
 }
 change(Core.move(state,"next"),"");window.scrollTo?.({top:0,behavior:"auto"});
}
function previous(){change(Core.move(state,"back"),"");window.scrollTo?.({top:0,behavior:"auto"})}
$("hearBtn").addEventListener("click",function(){say(topGlyph(Data.stages[state.step]))});
$("nextBtn").addEventListener("click",next);
$("backBtn").addEventListener("click",previous);
$("resetBtn").addEventListener("click",function(){if(window.confirm("Đọc lại toàn bộ tập nhập môn từ trang đầu? Tiến độ HSK 1–5 sẽ không bị ảnh hưởng.")){change(Core.restart(),"");window.scrollTo?.({top:0,behavior:"auto"})}});
Data.sources.forEach(function(s){var li=el("li");var a=el("a","",s.title);a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";li.appendChild(a);$("sourceList").appendChild(li)});
render();
})();
