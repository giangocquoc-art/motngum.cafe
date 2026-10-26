/* Optional chapter 0 / Pre-HSK story UI. No mutation of HSK1 progress. */
(function(){"use strict";
if(typeof HSKIntroContent==="undefined"||typeof HSKIntroCore==="undefined"||HSKIntroContent.validate().length){document.body.textContent="Không tải được dữ liệu tập nhập môn.";return;}
var Data=HSKIntroContent,Core=HSKIntroCore,$=function(id){return document.getElementById(id)};
var state=read(),last=Data.stages.length-1,feedback="";
function read(){try{return Core.clean(JSON.parse(localStorage.getItem(Core.key)||"null"))}catch(e){return Core.initial()}}
function save(){try{localStorage.setItem(Core.key,JSON.stringify(state));$("saveStatus").textContent="Đã lưu tiến độ trên thiết bị"}catch(e){$("saveStatus").textContent="Trình duyệt không lưu được — vẫn có thể tiếp tục"}}
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
 var result=el("div","character-result");
 var han=el("b","",char);han.lang="zh-CN";
 result.appendChild(han);result.appendChild(el("span","",pinyin+" · "+meaning));return result;
}
function topGlyph(stage){
 var ch=stage.hanzi,py=stage.pinyin;
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
  var seen=state.discovered.includes(g.zi),b=button("",function(){}, "glyph-option");
  b.replaceChildren();
  var glyph=el("strong","",g.zi);glyph.lang="zh-CN";b.appendChild(glyph);
  b.appendChild(el("span","",seen?g.meaning:"Chạm để khám phá"));
  b.appendChild(el("small","",seen?g.py:""));
  b.classList.toggle("selected",seen);
  b.addEventListener("click",function(){change(Core.visit(state,g.zi),g.zi+" · "+g.py+" · "+g.meaning+". "+g.note)});
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
 row.appendChild(button(state.stroke>=3?"Đã đủ 3 nét ✓":"+ Thêm một nét ngang →",function(){if(state.stroke<3)change(Core.stroke(state),"Viết từ trên xuống, nét ngang kéo từ trái sang phải.")},"primary"));
 row.appendChild(button("Viết lại",function(){change({...state,stroke:0},"Bắt đầu lại từ một trang giấy trống.")},"secondary"));root.appendChild(row);
}
function renderCount(root,kind){
 var options=kind==="forest"?[
 ["木","mù","Một cây: cây/gỗ"],["林","lín","Hai cây: rừng nhỏ/lùm cây"],["森","sēn","Ba cây: rừng rậm"]
 ]:[["人","rén","Một người"],["从","cóng","Hai người: đi theo"],["众","zhòng","Nhiều người: đám đông"]];
 var n=state[kind],row=el("div","option-row");
 options.forEach(function(o,i){var b=button((i+1)+(kind==="forest"?" cây":" người"),function(){change(Core.setCount(state,kind,i+1),o[0]+" · "+o[1]+": "+o[2]+".")},"number-button");b.classList.toggle("active",n===i+1);row.appendChild(b)});
 root.appendChild(row);root.appendChild(showCard(options[n-1][0],options[n-1][1],options[n-1][2]));
 root.appendChild(el("p","micro-note",kind==="people"?"Đây là cách liên tưởng giúp nhớ các dạng chữ hiện nay; không phải mọi chữ Hán đều ghép nghĩa bằng cách cộng số người.":"Một số chữ Hán gợi nghĩa bằng những bộ phận lặp lại. Các chữ khác có thể được cấu tạo để gợi âm."));
}
function renderLight(root){
 var row=el("div","parts");
 ["日","月"].forEach(function(zi,i){
  var b=button(zi,function(){change(Core.light(state,zi),"Đã nhận ra "+zi+(i===0?" — mặt trời/ngày.":" — mặt trăng/tháng."))},"part-button");
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
 root.appendChild(button(state.momRevealed?"Đã phát hiện bí mật ✓":"Hóa ra chữ này đọc thế nào?",function(){change({...state,momRevealed:true},"女 (nǚ) gợi nghĩa, 马 (mǎ) gợi âm. 妈 đọc mā — âm ma, thanh 1.")},"primary"));
 if(state.momRevealed)root.appendChild(showCard("妈","mā","mẹ — có bộ phận gợi âm và bộ phận gợi nghĩa"));
}
function renderLegend(root){
 root.appendChild(el("p","micro-note","Mẹo vui trên mạng: “Ghép hai hoặc ba chữ 女 sẽ thành cái chợ?”"));
 var row=el("div","option-row");
 row.appendChild(button("😄 Hồi đó mình cũng tin!",function(){change({...state,legendRead:true},"Một câu đùa khiến mình tò mò là điều tốt. Nhưng chữ 奻 và 姦 không có nghĩa là chợ.")},"number-button"));
 row.appendChild(button("📖 Xem chữ thật",function(){change({...state,legendRead:true},"Câu đùa không đúng nghĩa từ điển. Chữ 奻 là chữ cổ hiếm gặp; 姦 mang nghĩa tiêu cực và phản ánh định kiến giới lịch sử.")},"number-button"));
 root.appendChild(row);
 if(state.legendRead){
  root.appendChild(showCard("女","nǚ","phụ nữ"));
  root.appendChild(showCard("奻","nuán","chữ cổ: tranh cãi; gần như không dùng hiện đại"));
  root.appendChild(showCard("姦","jiān","chữ cổ có nghĩa tiêu cực; không phải “chợ”"));
  root.appendChild(el("p","micro-note","Một số cách cấu tạo chữ phản ánh định kiến trong xã hội cổ. Chúng ta tìm hiểu lịch sử để hiểu chữ, không dùng những nghĩa đó để đánh giá con người ngày nay."));
 }
}
function renderQuiz(root){
 var qi=state.quizIndex;
 if(qi>=Data.quizzes.length){
  var correct=Data.quizzes.filter(q=>state.quizResults[q.id]===q.answer).length;
  root.appendChild(el("div","finish-card","Bạn nhận ra "+correct+" / "+Data.quizzes.length+" chữ qua những câu đố nhỏ. Không có điểm đậu hay rớt — đây chỉ là bước làm quen."));
  return;
 }
 var q=Data.quizzes[qi],picked=state.quizResults[q.id];
 root.appendChild(el("p","micro-note","Câu "+(qi+1)+" / "+Data.quizzes.length+": "+q.question));
 var grid=el("div","quiz-choices");
 q.options.forEach(function(text,i){var b=button(text,function(){change(Core.quiz(state,q.id,i,Data.quizzes),i===q.answer?"Đúng rồi! "+q.explain:"Một dự đoán thú vị. "+q.explain)},"quiz-choice");b.classList.toggle("active",picked===i);grid.appendChild(b)});
 root.appendChild(grid);
 if(Number.isInteger(picked)){var result=el("p",picked===q.answer?"good":"again",(picked===q.answer?"✳ Chính xác. ":"✳ Đáp án đúng: "+q.options[q.answer]+". ")+q.explain);root.appendChild(result)}
}
function renderEnding(root){
 var correct=Data.quizzes.filter(q=>state.quizResults[q.id]===q.answer).length;
 var card=el("div","finish-card");
 card.appendChild(el("div","seal","好"));
 card.appendChild(el("p","", "An đã nhận ra nét chữ, bộ phận gợi nghĩa và cả bí mật gợi âm. "+(Object.keys(state.quizResults).length?"Bạn đã thử "+Object.keys(state.quizResults).length+" câu đoán chữ (đúng "+correct+"). ":"")+"Không cần học thuộc tất cả ngay hôm nay."));
 var link=el("a","","Bước sang HSK 1 — gặp cô Vương ↗");link.href="/#hanh-trinh";card.appendChild(link);
 root.appendChild(card);
}
function updateNav(stage){
 $("backBtn").disabled=state.step===0;
 if(stage.kind==="guess"&&state.quizIndex<Data.quizzes.length){
  var q=Data.quizzes[state.quizIndex];
  $("nextBtn").textContent=Number.isInteger(state.quizResults[q.id])?"Câu đoán tiếp theo ↗":"Bỏ qua câu đố này ↗";
 }else $("nextBtn").textContent=stage.kind==="ending"?"Về hành trình HSK 1 ↗":"Trang tiếp theo ↗";
}
function render(){
 var stage=Data.stages[state.step];
 $("position").textContent="TRANG "+String(state.step+1).padStart(2,"0")+" / "+String(Data.stages.length).padStart(2,"0");
 $("storyProgress").value=state.step+1;
 $("chapterType").textContent="TRANG SỔ · "+String(state.step+1).padStart(2,"0");
 $("scenePlace").textContent=stage.scene;$("storyHeading").textContent=stage.label;
 $("narrative").textContent=stage.narrative;$("storyTip").textContent=stage.tip;
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
}
function next(){
 if(state.step===last){window.location.href="/#hanh-trinh";return}
 if(Data.stages[state.step].kind==="guess"&&state.quizIndex<Data.quizzes.length){
  var q=Data.quizzes[state.quizIndex];
  if(Number.isInteger(state.quizResults[q.id]))change(Core.nextQuiz(state,Data.quizzes),"");
  else change({...state,quizIndex:Data.quizzes.length},"Không sao: bạn có thể học lại lúc khác mà không ảnh hưởng tiến độ HSK.");
  return;
 }
 change(Core.move(state,"next"),"");window.scrollTo?.({top:0,behavior:"auto"});
}
function previous(){change(Core.move(state,"back"),"");window.scrollTo?.({top:0,behavior:"auto"})}
$("hearBtn").addEventListener("click",function(){var stage=Data.stages[state.step],str=topGlyph(stage);if(stage.kind==="legend")str="女";if(stage.kind==="guess")str="林";say(str)});
$("nextBtn").addEventListener("click",next);
$("backBtn").addEventListener("click",previous);
$("resetBtn").addEventListener("click",function(){if(window.confirm("Đọc lại toàn bộ tập nhập môn từ trang đầu? Tiến độ HSK 1–5 sẽ không bị ảnh hưởng.")){change(Core.restart(),"");window.scrollTo?.({top:0,behavior:"auto"})}});
Data.sources.forEach(function(s){var li=el("li");var a=el("a","",s.title);a.href=s.url;a.target="_blank";a.rel="noopener noreferrer";li.appendChild(a);$("sourceList").appendChild(li)});
render();
})();
