
(function(){
"use strict";
var CHAPTERS=HSKContent.chapters,SCENES=HSKContent.scenes,REPLIES=HSKContent.replies;

var $=function(id){return document.getElementById(id)};
var KEY="hai-que-huong-progress-v3",PREVIOUS_KEY="hai-que-huong-progress-v2",OLD_KEY="hai-que-huong-progress-v1";
var state={step:0,history:[],done:false,pinyin:true,vi:true,attempts:0,hintUsed:false,solved:false,busy:false,recognizer:null,draft:"",examHelp:false,storyChoices:{},storyBeats:[],vocabSeen:[],encounter:HSKEncounter.initial(),encounterDraft:"",worldSeen:{},skillSampler:HSKSkillSampler.initial()};
var toastTimer=null,returnFocus=null,SCENE_TOTAL=SCENES.length,EXAM_START=HSKCurriculum.scenes.findIndex(function(x){return x.kind==="checkpoint"});
if(typeof HSKStoryGraph==="undefined"||HSKStoryGraph.validate(HSKContent,HSKCurriculum,HSKStoryBeats,HSKStoryDirector,HSKEncounter).length||typeof HSKSceneWorld==="undefined"||HSKSceneWorld.validate(HSKStoryGraph).length||typeof HSKSkillSampler==="undefined"||HSKSkillSampler.validate(HSKStoryGraph,HSKCurriculum).length||typeof HSKEncounter==="undefined"||HSKEncounter.validate().length||typeof HSKContent==="undefined"||HSKContent.validate(HSKCurriculum).length||typeof HSKLearningKit==="undefined"||typeof HSKStoryDirector==="undefined"||typeof HSKStoryBeats==="undefined"||HSKStoryBeats.validate(SCENE_TOTAL,EXAM_START).length||HSKStoryDirector.validate(SCENE_TOTAL,EXAM_START).length||HSKCurriculum.validate().length||HSKCurriculum.scenes.length!==SCENE_TOTAL||REPLIES.length!==SCENE_TOTAL)throw Error("Story content contract invalid");
function readSafe(k){try{return JSON.parse(localStorage.getItem(k)||"null")}catch(e){return null}}
function load(){
 var s=readSafe(KEY);
 if(s&&s.v===3&&Array.isArray(s.history)&&Number.isInteger(s.step)){
  state.history=s.history.slice(0,SCENE_TOTAL).map(function(x){return x&&["correct","assisted"].includes(x.status)?{status:x.status,attempts:Math.min(100,Math.max(0,Number(x.attempts)||0)),hint:!!x.hint}:null});
  state.step=HSKStoryGraph.resolve(s.sceneRef,s.step);state.done=!!s.done&&state.history.filter(Boolean).length===SCENE_TOTAL;
  state.pinyin=s.pinyin!==false;state.vi=s.vi!==false;state.draft=typeof s.draft==="string"?s.draft.slice(0,300):"";
  state.attempts=Math.min(100,Math.max(0,Number(s.attempts)||0));state.hintUsed=!!s.hintUsed;state.examHelp=!!s.examHelp;state.storyChoices=HSKStoryDirector.clean(s.storyChoices);state.storyBeats=HSKStoryBeats.migrate(s.storyBeats,state.step,state.history,state.done);state.vocabSeen=Array.isArray(s.vocabSeen)?s.vocabSeen.filter(x=>Number.isInteger(x)&&x>=0&&x<EXAM_START):[];state.encounter=HSKEncounter.migrate(s.encounter,state.step,state.history,state.done);state.encounterDraft=typeof s.encounterDraft==="string"?s.encounterDraft.slice(0,120):"";state.worldSeen=HSKSceneWorld.clean(s.worldSeen);state.skillSampler=HSKSkillSampler.migrate(s.skillSampler,state.step,state.history,state.done);
  return;
 }
 var old=readSafe(PREVIOUS_KEY);
 if(old&&old.v===2&&Array.isArray(old.history)){
  // Exam content changed. Do not preserve scores on previously untaught concepts.
  state.history=old.history.slice(0,EXAM_START);
  state.step=Math.min(EXAM_START,Math.max(0,Math.floor(Number(old.step)||0)));
  state.pinyin=old.pinyin!==false;state.vi=old.vi!==false;state.encounter=HSKEncounter.migrate(null,state.step,state.history,false);save();return;
 }
 state.step=0;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify({v:3,step:state.step,history:state.history,done:state.done,pinyin:state.pinyin,vi:state.vi,draft:state.draft,attempts:state.attempts,hintUsed:state.hintUsed,examHelp:state.examHelp,storyChoices:state.storyChoices,storyBeats:state.storyBeats,vocabSeen:state.vocabSeen,encounter:state.encounter,encounterDraft:state.encounterDraft,sceneRef:HSKStoryGraph.idAt(state.step),worldSeen:state.worldSeen,skillSampler:state.skillSampler}))}catch(e){}}
function notify(msg){var el=$("toast");el.textContent=msg;el.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove("visible")},3300)}
function updateToggles(){
 var canShow=!HSKSkillSampler.pending(state.step,state.skillSampler)&&(!!HSKStoryBeats.pending(state.step,state.storyBeats)||state.step<EXAM_START||state.solved||state.examHelp);
 $("pinyinText").hidden=!(state.pinyin&&canShow);
 $("vietText").hidden=!(state.vi&&canShow);
 $("togglePinyin").setAttribute("aria-pressed",String(state.pinyin&&canShow));
 $("toggleVietnamese").setAttribute("aria-pressed",String(state.vi&&canShow));
 $("togglePinyin").textContent="Pinyin "+(state.step>=EXAM_START&&!canShow?"(trợ giúp)":state.pinyin?"✓":"○");
 $("toggleVietnamese").textContent="Tiếng Việt "+(state.step>=EXAM_START&&!canShow?"(trợ giúp)":state.vi?"✓":"○");
}
function tree(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-10 105 Q-3 46 4 0 M1 58 L-34 23 M4 43 L40 13" fill="none" stroke="#524939" stroke-width="8" stroke-linecap="round"/><path d="M-65 5 Q-87-25-54-48 Q-50-84-13-71 Q15-101 45-71 Q85-79 91-42 Q119-23 93 13 Q72 44 35 30 Q-3 50-38 32 Q-62 33-65 5Z" fill="#aebf9b" stroke="#343536" stroke-width="2.3"/><path d="M-54-28 Q-37-56-7-47 M20-67 Q44-46 55-22 M-34 6 Q6 21 28 7 M52 20 Q69 3 88-6" stroke="#778e79" stroke-width="2" fill="none"/></g>'}
function person(x,y,scale,coat,style){var head=style==="child"?17:20;return '<g transform="translate('+x+' '+y+') scale('+scale+')"><ellipse cx="0" cy="138" rx="40" ry="7" fill="#434343" opacity=".16"/><path d="M-16 99 L-18 134 Q-17 146-2 140 L5 104 M12 100 L19 135 Q30 149 42 138 L27 94" fill="#445254" stroke="#303237" stroke-width="2.2"/><path d="M-34 44 Q-43 74-34 108 Q-6 119 33 105 L28 50 Q18 28-4 30 Q-27 25-34 44Z" fill="'+coat+'" stroke="#303237" stroke-width="2.3"/><path d="M-34 52 Q-52 75-43 90 M28 51 Q48 77 39 90" stroke="#303237" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M-8 27 L-8 37 Q0 45 7 34 L7 25" stroke="#303237" stroke-width="2" fill="#e9b798"/><ellipse cx="0" cy="7" rx="'+head+'" ry="25" fill="#efbd9d" stroke="#303237" stroke-width="2.4"/><path d="M-'+head+' 0 Q-'+head+'-34 1-25 Q18-27 20 4 Q8-2 3-12 Q-7 2-'+head+' 0Z" fill="#242b31" stroke="#303237" stroke-width="2"/><path d="M-10 7 l2 1 M8 7 l2 1 M-3 19 Q2 22 6 18" stroke="#303237" stroke-width="1.7" fill="none" stroke-linecap="round"/><path d="M-16 87 L27 87" stroke="#313334" stroke-width="1.4" opacity=".6"/></g>'}
function outline(){return '<path d="M1 1 H1199 V619 H1Z" fill="none" stroke="#383534" stroke-width="2" />'}
function sceneArt(place,thumb){var bg='<rect width="1200" height="620" fill="#e9cdbb"/><path d="M0 0 H1200 V230 H0Z" fill="#e6d7c9"/><path d="M0 475 L1200 420 V620 H0Z" fill="#b9b4a5"/>';
if(place==="street"||place==="school"){bg='<rect width="1200" height="620" fill="#d4d5c9"/><path d="M0 0H1200V325H0Z" fill="#f5dfbf"/><circle cx="950" cy="110" r="43" fill="#f7cf82" stroke="#a88266" stroke-width="2"/><path d="M0 490Q600 448 1200 500V620H0Z" fill="#bdb9b0"/><path d="M515 340H704V610H515Z" fill="#cdc9b7" stroke="#5c5a53" stroke-width="2"/><path d="M565 376L569 570 M626 376L628 565" stroke="#f5e5c9" stroke-width="3"/><path d="M0 500L1200 524" stroke="#858783" stroke-width="2" stroke-dasharray="18 28"/>';
if(place==="school"){bg+='<path d="M119 196L450 110L885 130L1097 230V469H108Z" fill="#d6a896" stroke="#303338" stroke-width="3"/><path d="M81 208L440 91L913 105L1138 218" stroke="#534b46" stroke-width="18" fill="none" stroke-linecap="square"/><path d="M475 320H741V485H475Z" fill="#b4c2b5" stroke="#3b4140" stroke-width="3"/><path d="M602 325V479" stroke="#3b4140" stroke-width="4"/><path d="M237 278H361V394H237ZM833 280H953V392H833Z" fill="#e5f1e6" stroke="#3c4141" stroke-width="4"/><path d="M299 276V394M892 278V392" stroke="#52534c" stroke-width="2"/><path d="M465 175H753V237H465Z" fill="#f7e8b6" stroke="#3b4140" stroke-width="4"/><text x="609" y="217" font-family="Noto Sans SC" font-size="27" text-anchor="middle" fill="#51392c">成都小学</text>'+tree(85,282,1.2)+tree(1090,285,1.1)+person(977,347,1.4,"#b27758","adult")+person(850,394,1.04,"#e4a04d","child");}
else{bg+='<path d="M0 195 L205 172L205 490H0Z" fill="#e6ae98" stroke="#3c3833" stroke-width="3"/><path d="M220 105L476 105V473H220Z" fill="#e3c5a1" stroke="#403b38" stroke-width="3"/><path d="M480 170L822 170V455H480Z" fill="#dbc0ae" stroke="#403b38" stroke-width="3"/><path d="M843 128H1187V499H843Z" fill="#b9c9b6" stroke="#403b38" stroke-width="3"/><path d="M220 106L350 48L489 105" fill="#a8634f" stroke="#3c3833" stroke-width="3"/><path d="M487 170L664 102L828 169" fill="#a86d59" stroke="#3c3833" stroke-width="3"/><path d="M895 210H1074V360H895Z" fill="#e4e1d0" stroke="#454545" stroke-width="3"/><path d="M983 210V360M895 284H1074" stroke="#454545" stroke-width="2"/><path d="M265 190H433V303H265Z" fill="#b4c9bd" stroke="#47423b" stroke-width="3"/><path d="M355 191V302" stroke="#47423b" stroke-width="3"/><path d="M561 200H733V275H561Z" fill="#e7e2d0" stroke="#494740" stroke-width="3"/><path d="M645 199V276" stroke="#494740" stroke-width="2"/><path d="M0 167H200V197H0Z" fill="#aa5948" stroke="#423a36" stroke-width="3"/><path d="M521 145H788V192H521Z" fill="#d17f5b" stroke="#453a35" stroke-width="3"/><text x="659" y="181" font-size="25" font-family="Noto Sans SC" fill="#352f2c" text-anchor="middle">小吃店</text>'+tree(92,258,1.4)+person(322,380,1.15,"#e6a042","child")+person(470,376,1.08,"#778e86","child")+person(875,385,1.21,"#8d6551","adult");}
}else if(place==="class"||place==="exam"){bg='<rect width="1200" height="620" fill="#eddbc2"/><path d="M0 0H1200V450H0Z" fill="#edd5b7"/><path d="M0 440L1200 410V620H0Z" fill="#c8b5a1"/><path d="M90 85H409V346H90Z" fill="#bad0c4" stroke="#45413d" stroke-width="8"/><path d="M250 85V346M90 216H409" stroke="#45413d" stroke-width="6"/><path d="M140 292Q216 224 294 285L406 240V343H91Z" fill="#a7b69c"/><path d="M557 87H1066V331H557Z" fill="#567c6c" stroke="#7f644b" stroke-width="16"/><path d="M612 165Q702 142 783 161M665 210H926M668 240H828" fill="none" stroke="#dbdfcb" stroke-width="4" stroke-linecap="round"/><path d="M0 493L1198 481" stroke="#8e897b" stroke-width="3"/><path d="M121 448H431V486H121ZM523 471H853V515H523ZM886 429H1190V479H886Z" fill="#b97d53" stroke="#333" stroke-width="3"/><path d="M145 480V620M401 480V620M557 509V620M825 509V620M917 466V620M1155 466V620" fill="none" stroke="#53493e" stroke-width="14"/>'+person(770,289,1.25,"#9e7d5b","adult")+person(370,370,1.08,"#e6a149","child")+person(997,358,1.05,"#aec0af","child");if(place==="exam"){bg+='<path d="M687 86H985V290H687Z" fill="#f8e5bb" stroke="#4b443b" stroke-width="4"/><text x="838" y="164" font-family="Noto Sans SC" font-size="35" text-anchor="middle" fill="#8b4d3b">期末考试</text><text x="838" y="212" font-family="Noto Sans SC" font-size="20" text-anchor="middle" fill="#5e584f">加油！</text>'}}
else if(place==="canteen"||place==="cafe"){bg='<rect width="1200" height="620" fill="#e2c6b9"/><path d="M0 0H1200V380H0Z" fill="#e8c7a7"/><path d="M0 428L1200 427V620H0Z" fill="#b5b3ab"/><path d="M90 71H1120V236H90Z" fill="#f1d68d" stroke="#4a3e35" stroke-width="5"/>';var signs=["担担面","小笼包","牛肉面","包子"];for(var i=0;i<4;i++){var px=107+i*245;bg+='<path d="M'+px+' 94h223v119H'+px+'Z" fill="'+(i%2?"#f2d6b3":"#d9b0a1")+'" stroke="#483f37" stroke-width="3"/><circle cx="'+(px+112)+'" cy="140" r="28" fill="#f0e1b7" stroke="#453b34" stroke-width="2"/><text x="'+(px+112)+'" y="195" font-family="Noto Sans SC" font-size="22" fill="#56402d" text-anchor="middle">'+signs[i]+'</text>'}
bg+='<path d="M0 310H1200V395H0Z" fill="#b5b8a8" stroke="#48453d" stroke-width="4"/><path d="M0 395H1200V435H0Z" fill="#e3d6bb" stroke="#4a4238" stroke-width="4"/><path d="M0 432H1200V465H0Z" fill="#ba926e" stroke="#4a4238" stroke-width="3"/><path d="M0 465H1200V483H0Z" fill="#e7d9c6" stroke="#4a4238" stroke-width="3"/><path d="M20 466v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100m42-100v100" stroke="#b8ada0" stroke-width="1.7"/><path d="M285 488H655V510H285Z" fill="#8b513f" stroke="#403732" stroke-width="3"/><path d="M320 504V610M615 504V610" stroke="#493a33" stroke-width="14"/><ellipse cx="445" cy="489" rx="65" ry="18" fill="#f7dfac" stroke="#3a3733" stroke-width="3"/><path d="M395 486q51 20 98 0" stroke="#a85e47" stroke-width="8" fill="none"/>'+person(180,325,1.18,"#c2a37f","adult")+person(735,386,1.12,"#e69e44","child")+person(963,360,1.18,"#a58058","adult");}
else{bg+='<path d="M0 256H1200V470H0Z" fill="#e6b8a5" stroke="#55423d" stroke-width="3"/><path d="M0 468L1200 440V620H0Z" fill="#c4b1a2"/><path d="M290 240H910V490H290Z" fill="#f0dab1" stroke="#4a4038" stroke-width="3"/><path d="M320 267H876V427H320Z" fill="#a9c2b1" stroke="#4a4038" stroke-width="4"/><path d="M580 272V423" stroke="#52443a" stroke-width="4"/>'+tree(130,265,1.3)+tree(1100,255,1.3)+person(500,362,1.05,"#e3a453","child")+person(755,334,1.3,"#6d897e","adult");}
if(place==="festival"){bg+='<path d="M55 120Q590 215 1160 117" fill="none" stroke="#745e4b" stroke-width="3"/>';for(var z=0;z<8;z++){bg+='<path d="M'+(100+z*138)+' '+(142+z%2*20)+'q20-8 34 0l-4 38q-16 20-27 0Z" fill="#c47d61" stroke="#3e3834" stroke-width="2"/>'}}
if(place==="graduation"){bg+='<path d="M100 220H1090V445H100Z" fill="#eac1ad" stroke="#493c35" stroke-width="4"/><path d="M340 270H850V390H340Z" fill="#f3e5c5" stroke="#493c35" stroke-width="2"/><text x="595" y="341" font-family="Noto Sans SC" font-size="39" text-anchor="middle" fill="#8f513a">毕业快乐</text>'}
var svg='<svg viewBox="0 0 1200 620" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g stroke-linejoin="round" stroke-linecap="round">'+bg+'</g>'+outline()+'</svg>';return svg}



/* Notebook is a story object, not a separate flashcard app. Exam access is disabled until resolved. */
function notebookAllowed(){return !HSKSkillSampler.pending(state.step,state.skillSampler)&&!HSKEncounter.pending(state.step,state.encounter)&&!HSKStoryBeats.pending(state.step,state.storyBeats)&&(state.step<EXAM_START||state.solved||state.done)}
function setNotebook(open){
 if(open&&!notebookAllowed()){notify("Cô Vương đang kiểm tra. Sổ tay chỉ được mở sau khi trả lời xong.");return}
 $("notebookPanel").hidden=!open;
 $("notebookBtn").setAttribute("aria-expanded",String(open));
 if(open){refreshNotebook();$("notebookClose").focus()}else $("notebookBtn").focus();
}
function refreshNotebook(){
 var words=HSKLearningKit.notebook(HSKCurriculum.scenes,state.history,state.done||state.solved||state.hintUsed||state.vocabSeen.includes(state.step)?state.step:state.step-1,state.done);
 var weak=HSKLearningKit.needsReview(state.history,HSKCurriculum.scenes);
 var counts=HSKLearningKit.counts(state.history,HSKCurriculum.scenes);
 $("notebookProgress").textContent=counts.finished+"/"+counts.total+" tình huống đã trải qua · "+counts.independent+" tự giải đúng ngay lần đầu · "+weak.length+" tình huống cần ôn";
 var list=$("notebookWords");list.replaceChildren();
 words.forEach(function(w){
  var row=document.createElement("button");row.type="button";row.className="notebook-word";row.setAttribute("aria-label","Nghe từ tiếng Trung: "+w.hanzi);row.addEventListener("click",function(){speak(w.hanzi)});
  var left=document.createElement("span");left.className="notebook-hanzi";left.textContent=w.hanzi;
  var mid=document.createElement("span");mid.className="notebook-pinyin";mid.textContent=w.pinyin;
  var right=document.createElement("span");right.className="notebook-meaning";right.textContent=w.vietnamese;
  row.appendChild(left);row.appendChild(mid);row.appendChild(right);list.appendChild(row);
 });
 $("notebookReview").textContent=weak.length?("Nên luyện lại: "+weak.map(function(w){return w.topic}).join(" · ")):"Những tình huống đã hoàn thành chưa ghi nhận nhu cầu ôn thêm.";
 $("storyMemory").textContent=(function(){var m=HSKStoryDirector.memory(state.storyChoices),rec=state.encounter;
 var lines=m.map(x=>x.note);if(rec.stage==="done")lines.push("An tìm lại được quyển sổ mẹ tặng. "+(rec.answer==="independent"?"An tự giới thiệu tên ngay lần đầu.":"An đã luyện lại cách tự giới thiệu để lấy sổ."));
 return lines.length?"Những điều An đã quyết định: "+lines.join(" · "):"Những trang lựa chọn của An đang còn trống.";
})();
}
function renderTiles(){
 var allowed=state.step<EXAM_START&&!state.solved&&!state.done;
 $("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=!allowed;if(!allowed)return;
 $("tileList").replaceChildren();
 HSKLearningKit.tiles(state.step).forEach(function(token){
  var b=document.createElement("button");b.type="button";b.className="sentence-tile";
  b.textContent=token;b.addEventListener("click",function(){useTile(token)});
  $("tileList").appendChild(b);
 });
}
function openBuilder(){
 if(state.done||state.solved||state.step>=EXAM_START||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 state.hintUsed=true;save();
 $("sentenceBuilder").hidden=false;$("openBuilderBtn").hidden=true;
 $("builderNotice").textContent="✳ Đã mở bộ từ. Câu này được tính là có trợ giúp dù bạn tự nhập lại.";
 $("tileList").children[0]?.focus();
}
function useTile(token){
 if(state.solved||state.done||state.step>=EXAM_START||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 state.draft=HSKLearningKit.compose($("answerInput").value,token);
 $("answerInput").value=state.draft;
 state.hintUsed=true;save();$("answerInput").focus();
 $("builderNotice").textContent="✳ Đã dùng ghép câu. Câu này sẽ được đánh dấu có hỗ trợ.";
}



/* V8 independent story encounter at scene 4; it has no effect on HSK school test grade. */
function encounterFocus(){
 var stage=state.encounter.stage;
 if(stage==="respond")$("encounterInput").focus();
 else if(stage==="outcome")$("encounterContinue").focus();
 else {var node=$("encounterActions").children[0];if(node&&node.focus)node.focus()}
}
function encounterDispatch(action){
 if(!HSKEncounter.pending(state.step,state.encounter)||state.done)return;
 try{
  state.encounter=HSKEncounter.move(state.encounter,action,HSKCore);
  if(action.type==="submit"&&state.encounter.stage==="outcome")state.encounterDraft="";
  save();renderEncounter();encounterFocus();
 }catch(e){notify("Không thể thực hiện thao tác ở giai đoạn này.")}
}

/* Optional tactile story objects. Never alter school exam scores. */
function renderWorld(){
 var id=HSKStoryGraph.idAt(state.step),site=HSKSceneWorld.site(id);
 var blocked=state.done||HSKEncounter.pending(state.step,state.encounter)||HSKSkillSampler.pending(state.step,state.skillSampler)||HSKStoryBeats.pending(state.step,state.storyBeats);
 $("worldPanel").hidden=!site||blocked;$("worldActions").replaceChildren();if(!site||blocked)return;
 $("worldTitle").textContent=site.title;
 var visited=state.worldSeen[id]||[];
 $("worldProgress").textContent=visited.length+"/"+site.objects.length+" chi tiết đã quan sát · Không chấm điểm";
 site.objects.forEach(function(object){
  var b=document.createElement("button");b.type="button";b.className="world-action";
  b.textContent=object.icon+" "+object.label+(visited.includes(object.id)?" ✓":"");
  b.addEventListener("click",function(){
   if(state.done||HSKEncounter.pending(state.step,state.encounter)||HSKSkillSampler.pending(state.step,state.skillSampler)||HSKStoryBeats.pending(state.step,state.storyBeats))return;
   var next=HSKSceneWorld.inspect(state.worldSeen,id,object.id);
   state.worldSeen=next.state;save();
   $("worldDescription").textContent=next.object.vi+"  ·  "+next.object.zh;
   renderWorld();
  });
  $("worldActions").appendChild(b);
 });
}
/* V10 formative skill sample. Speech-to-text or TTS playback is NOT a verified language exam. */
function renderSkillSampler(){
 var active=HSKSkillSampler.pending(state.step,state.skillSampler);
 $("skillPanel").hidden=!active;
 if(!active)return false;
 var item=HSKSkillSampler.current(state.skillSampler);
 $("answerForm").hidden=true;$("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=true;
 $("storyInterlude").hidden=true;$("encounterPanel").hidden=true;$("skillPanel").hidden=true;$("worldPanel").hidden=true;$("storyChoicePanel").hidden=true;
 $("worldPanel").hidden=true;$("storyBeat").hidden=true;$("learningStrip").hidden=true;
 $("vocabRevealBtn").hidden=true;$("hintBtn").hidden=true;$("assistBtn").hidden=true;$("nextBtn").hidden=true;
 $("sceneDay").textContent="CHƯƠNG 01 · ÔN TẬP KỸ NĂNG";
 $("speaker").textContent="Sổ tay của An";$("sceneTag").textContent="LUYỆN KỸ NĂNG · KHÔNG PHẢI ĐỀ HSK";
 $("dialogueText").textContent=item.mode==="reading"?item.hanzi:"请听。";
 $("pinyinText").textContent="";$("vietText").textContent="";
 $("userInstruction").hidden=true;$("sceneObjective").hidden=true;
 $("skillStep").textContent=(state.skillSampler.index+1)+" / "+HSKSkillSampler.items.length+" · "+(item.mode==="reading"?"Đọc hiểu":"Nghe hiểu");
 $("skillQuestion").textContent=item.prompt;
 $("skillListen").hidden=item.mode!=="listening";
 $("skillAudioNotice").textContent=item.mode==="listening"?"Âm thanh do trình duyệt tổng hợp. Không xác thực phát âm hay kết quả kỳ thi.":"Đọc dòng chữ Hán trong cảnh và chọn ý hiểu.";
 $("skillOptions").replaceChildren();
 item.options.forEach(function(option){
  var btn=document.createElement("button");btn.type="button";btn.className="skill-option";btn.textContent=option.text;
  btn.addEventListener("click",function(){
   if(!HSKSkillSampler.pending(state.step,state.skillSampler))return;
   state.skillSampler=HSKSkillSampler.answer(state.skillSampler,option.id);save();
   if(HSKSkillSampler.pending(state.step,state.skillSampler))renderStep();else renderStep();
  });
  $("skillOptions").appendChild(btn);
 });
 updateToggles();return true;
}
function skipSampler(){
 if(!HSKSkillSampler.pending(state.step,state.skillSampler))return;
 state.skillSampler=HSKSkillSampler.skip(state.skillSampler);save();renderStep();
}
function playSkillSample(){
 var item=HSKSkillSampler.current(state.skillSampler);
 if(!item||item.mode!=="listening")return;
 if(!window.speechSynthesis||typeof SpeechSynthesisUtterance!=="function"){
  $("skillAudioNotice").textContent="Trình duyệt không hỗ trợ âm thanh. Hãy chọn Bỏ qua; mục này không được chấm nghe hiểu.";return;
 }
 try{ speak(item.audioZh);state.skillSampler=HSKSkillSampler.audio(state.skillSampler,true);save();
  $("skillAudioNotice").textContent="Đã yêu cầu trình duyệt đọc tiếng Trung. Đây chỉ là hoạt động luyện nghe thử nghiệm.";}
 catch(e){$("skillAudioNotice").textContent="Không phát được âm thanh. Hãy bỏ qua; không ghi nhận nghe hiểu."}
}

function renderEncounter(){
 var active=HSKEncounter.pending(state.step,state.encounter);
 $("encounterPanel").hidden=!active;if(!active)return false;
 var data=HSKEncounter.content,progress=state.encounter;
 $("stageIllustration").innerHTML=sceneArt("class",false);
 $("sceneDay").textContent="CHƯƠNG 01 · SỰ KIỆN";
 $("speaker").textContent=progress.stage==="respond"?"Cô trực phòng hành chính":"安 · Minh An";
 $("sceneTag").textContent="QUYỂN SỔ BIẾN MẤT";
 $("dialogueText").textContent=progress.stage==="respond"?data.promptZh:data.startZh;
 $("pinyinText").textContent=progress.stage==="respond"?data.promptPy:data.startPy;
 $("vietText").textContent=progress.stage==="respond"?data.promptVi:data.startVi;
 $("storyInterlude").hidden=true;$("storyBeat").hidden=true;$("storyChoicePanel").hidden=true;
 $("answerForm").hidden=true;$("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=true;
 $("learningStrip").hidden=true;$("vocabRevealBtn").hidden=true;
 $("hintBtn").hidden=true;$("assistBtn").hidden=true;$("nextBtn").hidden=true;
 $("userInstruction").hidden=true;$("sceneObjective").hidden=true;
 $("encounterHeading").textContent=data.title;
 $("encounterActions").replaceChildren();
 $("encounterAnswerForm").hidden=progress.stage!=="respond";
 $("encounterContinue").hidden=progress.stage!=="outcome";
 $("encounterHint").hidden=progress.stage!=="respond";
 $("encounterSample").hidden=progress.stage!=="respond"||progress.attempts<2;
 $("encounterInput").value=state.encounterDraft;
 $("encounterFeedback").textContent=progress.feedback||"";
 function actionButton(label,handle,used){
  var b=document.createElement("button");b.type="button";b.className="encounter-action";b.textContent=label;
  b.disabled=!!used;b.addEventListener("click",handle);$("encounterActions").appendChild(b);
 }
 if(progress.stage==="inspect"){
  $("encounterBody").textContent="An sờ vào quai cặp. Quyển sổ mẹ tặng không thấy đâu. Hãy nhìn quanh ít nhất hai nơi để tìm manh mối ("+progress.inspected.length+"/2).";
  data.objects.forEach(o=>actionButton(o.label,()=>encounterDispatch({type:"inspect",id:o.id}),progress.inspected.includes(o.id)));
 }else if(progress.stage==="decide"){
  $("encounterBody").textContent="Một manh mối dẫn tới phòng trực. An phải quyết định nhờ ai đồng hành. Lựa chọn này không chấm điểm ngôn ngữ.";
  data.routes.forEach(o=>actionButton(o.label,()=>encounterDispatch({type:"route",id:o.id}),false));
 }else if(progress.stage==="respond"){
  var path=HSKEncounter.route(progress.route);
  $("encounterBody").textContent=path.vi+" Cô trực giữ một quyển sổ nhỏ, nhưng cần biết tên người nhận. "+data.prompt+" Đây là tình huống vận dụng, được ghi nhận riêng với bài thi trên lớp.";
  $("encounterAttempt").textContent="Lượt thử chưa đúng: "+progress.attempts;
 }else if(progress.stage==="outcome"){
  var route=HSKEncounter.route(progress.route);
  $("encounterBody").textContent=(route?route.vi+" ":"")+"Cô trực tìm thấy tên An trên trang đầu và trao lại quyển sổ. An mở sổ: lời mẹ dặn vẫn ở đó. "+(progress.answer==="independent"?"An đã tự nói tên trong tình huống mới ngay lần đầu.":progress.answer==="sample"?"An đã xem mẫu để tiếp tục câu chuyện.":"An đã nhận được trợ giúp hoặc thử lại; câu này sẽ được ôn tiếp.");
  $("encounterFeedback").textContent="Kết quả vận dụng: "+(progress.answer==="independent"?"Tự diễn đạt ngay lần đầu":progress.answer==="retried"?"Đúng sau khi thử lại":progress.answer==="helped"?"Đúng với gợi ý":"Xem câu mẫu");
 }
 updateToggles();return true;
}

function renderStoryInterlude(){
 var b=HSKStoryBeats.pending(state.step,state.storyBeats);
 $("storyInterlude").hidden=!b;
 if(!b)return false;
 $("interludeHeading").textContent=b.title;$("interludeStory").textContent=b.story;
 $("interludeTranslation").textContent=b.vi;
 $("speaker").textContent="旁白 · Người kể chuyện";$("sceneTag").textContent="TRANG TRUYỆN";
 $("dialogueText").textContent=b.zh;$("pinyinText").textContent=b.py;$("vietText").textContent=b.vi;
 $("userInstruction").hidden=true;$("sceneObjective").hidden=true;
 $("answerForm").hidden=true;$("sentenceBuilder").hidden=true;$("learningStrip").hidden=true;
 $("vocabRevealBtn").hidden=true;$("openBuilderBtn").hidden=true;$("hintBtn").hidden=true;$("assistBtn").hidden=true;
 $("storyBeat").hidden=true;$("storyChoicePanel").hidden=true;$("nextBtn").hidden=true;
 updateToggles();return true;
}
function continueStoryInterlude(){
 var b=HSKStoryBeats.pending(state.step,state.storyBeats);if(!b||$("gameOverlay").hidden)return;
 state.storyBeats=HSKStoryBeats.mark(state.storyBeats,b.id);save();renderStep();(state.solved?$("nextBtn"):$("answerInput")).focus();
}
function revealWords(){
 if(state.done||state.solved||state.step>=EXAM_START||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 state.hintUsed=true;if(!state.vocabSeen.includes(state.step))state.vocabSeen.push(state.step);
 save();$("learningStrip").hidden=false;$("vocabRevealBtn").hidden=true;
 $("feedback").className="feedback neutral";$("feedback").textContent="✳ Đã xem từ vựng. Câu này được ghi là hoàn thành với trợ giúp.";
}

function renderStoryChoice(){
 var p=HSKStoryDirector.pending(state.step,state.storyChoices);
 $("storyChoicePanel").hidden=!p;$("storyChoiceOptions").replaceChildren();$("storyChoiceOutcome").hidden=true;
 if(!p){
  var selected=HSKStoryDirector.point(state.step);
  if(selected&&state.storyChoices[selected.id]){
   var m=HSKStoryDirector.memory(state.storyChoices).find(x=>x.id===selected.id);
   $("storyChoiceOutcome").textContent=m?"Ghi vào sổ của An: "+m.note:"";
   $("storyChoiceOutcome").hidden=false;
  }
  return false;
 }
 $("storyChoiceTitle").textContent=p.prompt;
 p.options.forEach(function(o){
  var btn=document.createElement("button");btn.type="button";btn.className="story-choice-option";
  var zh=document.createElement("strong");zh.textContent=o.zh;zh.lang="zh-CN";
  var vi=document.createElement("span");vi.textContent=o.vi;
  btn.appendChild(zh);btn.appendChild(vi);
  btn.addEventListener("click",function(){
   if(!state.solved||state.done)return;
   state.storyChoices=HSKStoryDirector.select(state.storyChoices,p.id,o.id);
   save();renderStoryChoice();$("nextBtn").hidden=false;$("nextBtn").focus();
  });
  $("storyChoiceOptions").appendChild(btn);
 });
 return true;
}
function chapters(){
 var grid=$("chapterGrid");grid.innerHTML="";
 CHAPTERS.forEach(function(c){
  var item=document.createElement("article");item.className="chapter "+(c.lvl===1?"active":"locked");
  item.innerHTML='<div class="chapter-art" style="background:'+c.accent+'">'+sceneArt(c.place,true)+'</div><div class="chapter-body"><span class="chapter-index">CHAPTER 0'+c.lvl+' · HSK '+c.lvl+'</span><h3>'+c.title+'</h3><div class="sub">'+c.cn+' · '+c.sub+'</div><p>'+c.desc+'</p><div class="chapter-footer"><span>'+(c.lvl===1?(state.done?"XEM TỔNG KẾT":"CHƠI BẢN DEMO"):"SẮP RA MẮT")+'</span><span class="chapter-arrow">'+(c.lvl===1?"↗":"⌁")+'</span></div></div>';
  item.tabIndex=0;item.role="button";item.setAttribute("aria-label",c.lvl===1?"Chơi tập truyện HSK 1":"HSK "+c.lvl+" chưa mở");
  item.addEventListener("click",function(){if(c.lvl===1)openGame();else notify("Chương HSK "+c.lvl+" hiện là lộ trình dự kiến, chưa có nội dung chơi.")});
  item.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();item.click()}});
  grid.appendChild(item);
 });
 $("resumeBtn").firstChild.textContent=state.done?"Xem tổng kết ":"Tiếp tục câu chuyện ";
}
function showCompletion(){
 var summary=HSKCore.summarize(state.history,SCENE_TOTAL,EXAM_START);
 $("completionPane").hidden=false;$("sentenceBuilder").hidden=true;$("answerForm").hidden=true;$("nextBtn").hidden=true;$("assistBtn").hidden=true;$("hintBtn").hidden=true;
 $("userInstruction").textContent="✳ Bạn đã đi hết tập truyện thử nghiệm: Ngày đầu xa nhà.";
 $("summaryStats").textContent=summary.independently+"/"+summary.total+" câu tự giải không cần gợi ý · "+summary.hinted+" câu đúng sau gợi ý · "+summary.assisted+" câu xem đáp án mẫu · "+summary.examCorrect+"/"+summary.examTotal+" câu kiểm tra không cần trợ giúp.";
 $("episodeEnding").textContent=HSKEncounter.content.endingZh+" — "+HSKEncounter.content.endingVi;
 var skillSummary=HSKSkillSampler.summary(state.skillSampler);$("skillSummary").textContent="Luyện đọc: "+skillSummary.reading+" · Luyện nghe: "+skillSummary.listening+" · Nói/viết: chưa đánh giá riêng. Đây không phải điểm thi HSK.";
 $("summaryDescription").textContent=summary.examCorrect===summary.examTotal&&summary.assisted===0&&summary.hinted===0?"Rất tốt! Bạn đã tự xử lý tất cả câu hỏi trong tập thử nghiệm. Đây chưa phải kết quả thi HSK 1 chính thức.":"Bạn đã hoàn thành câu chuyện. Những câu cần xem mẫu là gợi ý để ôn lại — không được tính là trả lời đúng độc lập. Đây không phải chứng nhận trình độ HSK.";
 $("progressBar").style.width="100%";$("retakeExamBtn").hidden=false;$("storyChoicePanel").hidden=true;$("storyChoiceOutcome").hidden=true;$("storyInterlude").hidden=true;$("vocabRevealBtn").hidden=true;$("openBuilderBtn").hidden=true;$("encounterPanel").hidden=true;$("skillPanel").hidden=true;$("worldPanel").hidden=true;
 $("feedback").textContent="";$("feedback").className="feedback";
 $("encounterSummary").textContent=state.encounter.stage==="done"?"Quyển sổ đã được tìm lại · Vận dụng lời giới thiệu: "+(state.encounter.answer==="independent"?"tự trả lời ngay lần đầu":state.encounter.answer==="retried"?"đúng sau khi thử lại":state.encounter.answer==="helped"?"đúng nhờ gợi ý":"xem đáp án mẫu"): "Tình huống tìm lại sổ đã được bỏ qua theo tiến độ phiên bản cũ.";
 $("completionReview").textContent=(function(){var weak=HSKLearningKit.needsReview(state.history,HSKCurriculum.scenes);return weak.length?"Sổ tay của An nhắc bạn luyện thêm: "+weak.map(function(w){return w.objective}).join("; ")+".":"Các câu luyện trong tập này chưa ghi nhận chỗ cần xem lại."})();
}
function renderStep(){
 var s=SCENES[state.step],meta=HSKCurriculum.scenes[state.step];state.busy=false;state.solved=false;
 $("stageIllustration").innerHTML=sceneArt(s.place,false);
 $("sceneDay").textContent=meta.kind==="checkpoint"?"CHƯƠNG 01 · KIỂM TRA THỬ":"CHƯƠNG 01 · "+(s.place==="canteen"?"CĂNG TIN":"THÀNH ĐÔ");
 $("speaker").textContent=s.speaker;$("sceneTag").textContent=s.tag;
 $("dialogueText").textContent=s.zh;$("pinyinText").textContent=s.py;$("vietText").textContent=s.vi;
 $("userInstruction").textContent=(meta.kind==="checkpoint"?"✎ ":"✦ ")+s.request;
 $("stepText").textContent=String(state.step+1).padStart(2,"0")+" / "+String(SCENE_TOTAL).padStart(2,"0");
 $("progressBar").style.width=(100*state.step/SCENE_TOTAL)+"%";
 $("answerInput").value=state.draft;$("answerInput").disabled=false;
 $("answerInput").placeholder=meta.kind==="checkpoint"?"Nhập câu trả lời bằng chữ Hán...":"Gõ câu trả lời bằng tiếng Trung...";
 $("sendAnswer").disabled=false;$("micBtn").disabled=false;
 $("feedback").textContent="";$("feedback").className="feedback";
 $("answerForm").hidden=false;$("nextBtn").hidden=true;$("hintBtn").hidden=meta.kind==="checkpoint";$("assistBtn").hidden=state.attempts<2;
 $("completionPane").hidden=true;$("retakeExamBtn").hidden=true;$("encounterPanel").hidden=true;$("storyChoicePanel").hidden=true;$("storyChoiceOutcome").hidden=true;$("storyInterlude").hidden=true;$("userInstruction").hidden=false;$("sceneObjective").hidden=false;
 var beat=HSKStoryDirector.beat(state.step,state.storyChoices),callback=HSKEncounter.callback(state.step,state.encounter);$("storyBeat").hidden=!beat&&!callback;$("storyBeat").textContent=[beat,callback].filter(Boolean).map(x=>"✳ "+x.zh+" — "+x.vi).join("  ");
 $("builderNotice").textContent="Chạm từ để ghép câu nếu chưa biết gõ chữ Hán. Dùng ghép câu được tính là trợ giúp.";renderTiles();
 if(!$("notebookPanel").hidden)setNotebook(false);
 $("attemptCounter").textContent="Lượt thử: "+state.attempts;
 $("learningStrip").hidden=meta.kind!=="practice"||!state.vocabSeen.includes(state.step);
 $("vocabRevealBtn").hidden=meta.kind!=="practice"||state.vocabSeen.includes(state.step);
 $("learningStrip").textContent=meta.kind==="practice"?"✳ "+meta.topic+" · "+meta.words.map(function(w){return w[0]+" ("+w[1]+") — "+w[2]}).join("  ·  "):"";
 $("sceneObjective").textContent=meta.kind==="checkpoint"?"Kiểm tra nhớ lại · "+meta.objective+" · Phụ đề/gợi ý tính là có hỗ trợ.":"Mục tiêu hôm nay · "+meta.objective;
 updateToggles();
 if(state.done)showCompletion();
 else {
  var blocked=renderEncounter()||renderSkillSampler()||renderStoryInterlude();
  if(!blocked&&state.history[state.step])displayResolved();
  renderWorld();
 }
}
function displayResolved(){
 var saved=state.history[state.step];if(!saved)return;
 state.solved=true;$("answerInput").disabled=true;$("sendAnswer").disabled=true;$("micBtn").disabled=true;
 $("assistBtn").hidden=true;$("hintBtn").hidden=true;
 var reply=REPLIES[state.step];
 $("dialogueText").textContent=reply.zh;$("pinyinText").textContent=reply.py;$("vietText").textContent=reply.vi;
 $("sceneTag").textContent="PHẢN HỒI CỦA NHÂN VẬT";updateToggles();
 $("feedback").className="feedback "+(saved.status==="correct"?"good":"neutral");
 $("feedback").textContent=saved.status==="correct"?(saved.hint?"✓ Đã trả lời đúng sau hỗ trợ. Câu này nên ôn thêm.":"✓ Nhân vật đã hiểu bạn. Đọc phản hồi rồi nhấn Tiếp tục."):"✦ Bạn đã xem câu mẫu và đi tiếp; câu này không tính là tự làm đúng.";
 $("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=true;$("learningStrip").hidden=state.step>=EXAM_START;$("vocabRevealBtn").hidden=true;
 $("nextBtn").hidden=renderStoryChoice();$("nextBtn").textContent=state.step===SCENE_TOTAL-1?"Xem tổng kết ↗":"Tiếp tục câu chuyện ↗";
}
function openGame(){
 returnFocus=document.activeElement;document.body.style.overflow="hidden";$("gameOverlay").hidden=false;renderStep();$("notebookBtn").setAttribute("aria-expanded","false");
 if(state.done)$("replayBtn").focus();else if(!$("skillPanel").hidden)$("skillOptions").children[0]?.focus();else if(!$("skillPanel").hidden)$("skillOptions").children[0]?.focus();else if(!$("encounterPanel").hidden)encounterFocus();else if(!$("storyInterlude").hidden)$("interludeContinue").focus();else if(state.solved)$("nextBtn").focus();else $("answerInput").focus();
}
function closeGame(){
 $("notebookPanel").hidden=true;$("notebookBtn").setAttribute("aria-expanded","false");
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
 if(state.recognizer){try{state.recognizer.abort()}catch(e){}state.recognizer=null}
 $("micBtn").classList.remove("listening");$("gameOverlay").hidden=true;document.body.style.overflow="";chapters();
 if(returnFocus&&returnFocus.isConnected)returnFocus.focus();
}
function speak(text){
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){notify("Thiết bị chưa hỗ trợ phát âm tự động; bạn vẫn có thể đọc phụ đề.");return}
 window.speechSynthesis.cancel();var utter=new SpeechSynthesisUtterance(text);utter.lang="zh-CN";utter.rate=.78;
 var voice=window.speechSynthesis.getVoices().find(function(v){return v.lang.toLowerCase().startsWith("zh")});
 if(voice)utter.voice=voice;window.speechSynthesis.speak(utter);
}
function finishCurrent(status){
 if(state.recognizer){try{state.recognizer.abort()}catch(e){}state.recognizer=null;$("micBtn").classList.remove("listening")}
 state.history[state.step]={status:status,attempts:state.attempts,hint:state.hintUsed};state.draft="";state.busy=false;
 save();displayResolved();$("nextBtn").focus();
}
function submitAnswer(e){
 e.preventDefault();if(state.busy||state.solved||state.done)return;
 if(HSKSkillSampler.pending(state.step,state.skillSampler)||HSKEncounter.pending(state.step,state.encounter)||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 var scene=SCENES[state.step],value=$("answerInput").value;
 var result=HSKCore.evaluate(scene,value),feed=$("feedback");
 if(result.ok){state.busy=true;finishCurrent("correct");return}
 if(!value.trim()){feed.className="feedback bad";feed.textContent=result.reason;return}
 state.attempts++;save();$("attemptCounter").textContent="Lượt thử: "+state.attempts;
 feed.className="feedback bad";feed.textContent="Chưa đúng ý. "+result.reason;
 if(state.attempts>=2)$("assistBtn").hidden=false;
}
function nextScene(){
 if(!state.solved||HSKSkillSampler.pending(state.step,state.skillSampler)||HSKEncounter.pending(state.step,state.encounter)||HSKStoryBeats.pending(state.step,state.storyBeats)||HSKStoryDirector.pending(state.step,state.storyChoices))return;
 if(state.step===SCENE_TOTAL-1){state.done=true;save();showCompletion();chapters();notify("✳ Đã hoàn thành tập truyện đầu tiên!");return}
 state.step++;state.draft="";state.attempts=0;state.hintUsed=false;state.examHelp=false;save();renderStep();if(!$("encounterPanel").hidden)encounterFocus();else if(!$("storyInterlude").hidden)$("interludeContinue").focus();else $("answerInput").focus();
}
function revealHint(){
 var s=SCENES[state.step];state.hintUsed=true;save();
 $("feedback").className="feedback neutral";$("feedback").textContent="Gợi ý: "+s.hint;
 $("assistBtn").hidden=false;save();
}
function showAnswerAndMove(){
 if(state.solved)return;
 var s=SCENES[state.step];$("answerInput").value=s.answers[0];
 $("feedback").className="feedback neutral";$("feedback").textContent="Đáp án mẫu: "+s.answers[0];
 state.hintUsed=true;finishCurrent("assisted");
}
function microphone(){
 var API=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!API){notify("Trình duyệt này không có chức năng nhận diện tiếng Trung. Hãy gõ câu trả lời.");return}
 if(state.solved||HSKSkillSampler.pending(state.step,state.skillSampler)||HSKEncounter.pending(state.step,state.encounter)||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 if(state.recognizer){try{state.recognizer.stop()}catch(e){}return}
 var r=new API();r.lang="zh-CN";r.interimResults=false;r.maxAlternatives=1;state.recognizer=r;
 var btn=$("micBtn");btn.classList.add("listening");btn.setAttribute("aria-label","Dừng micro");
 r.onresult=function(e){if(state.solved||$("gameOverlay").hidden)return;$("answerInput").value=e.results[0][0].transcript;state.draft=$("answerInput").value;save();notify("Đã nhận lời nói. Hãy kiểm tra và nhấn Gửi; đây chưa phải đánh giá phát âm.")};
 r.onerror=function(e){notify(e.error==="not-allowed"?"Micro bị từ chối quyền truy cập.":"Không nhận diện được lời nói. Bạn có thể nhập chữ Hán.")};
 r.onend=function(){btn.classList.remove("listening");btn.setAttribute("aria-label","Sử dụng micro");state.recognizer=null};
 try{r.start()}catch(e){btn.classList.remove("listening");state.recognizer=null;notify("Không thể mở micro trên thiết bị này.")}
}
load();$("heroArt").innerHTML=sceneArt("street",false);chapters();
["startBtn","resumeBtn","endingBtn"].forEach(function(id){$(id).addEventListener("click",openGame)});
$("closeGame").addEventListener("click",closeGame);
$("answerForm").addEventListener("submit",submitAnswer);$("answerInput").addEventListener("input",function(){if(state.solved)return;state.draft=$("answerInput").value.slice(0,300);save()});
$("listenBtn").addEventListener("click",function(){if(HSKSkillSampler.pending(state.step,state.skillSampler)){playSkillSample();return}var b=HSKStoryBeats.pending(state.step,state.storyBeats),q=HSKEncounter.pending(state.step,state.encounter);speak(q?(state.encounter.stage==="respond"?HSKEncounter.content.promptZh:HSKEncounter.content.startZh):b?b.zh:state.solved?REPLIES[state.step].zh:SCENES[state.step].zh)});
$("hintBtn").addEventListener("click",revealHint);
$("assistBtn").addEventListener("click",showAnswerAndMove);
$("nextBtn").addEventListener("click",nextScene);
$("micBtn").addEventListener("click",microphone);
$("notebookBtn").addEventListener("click",function(){setNotebook($("notebookPanel").hidden)});
$("notebookClose").addEventListener("click",function(){setNotebook(false)});
$("tileUndo").addEventListener("click",function(){useTile("__undo")});
$("tileClear").addEventListener("click",function(){useTile("__clear")});
$("openBuilderBtn").addEventListener("click",openBuilder);
$("interludeContinue").addEventListener("click",continueStoryInterlude);
$("skillListen").addEventListener("click",playSkillSample);
$("skillSkip").addEventListener("click",skipSampler);
$("encounterAnswerForm").addEventListener("submit",function(e){e.preventDefault();encounterDispatch({type:"submit",value:$("encounterInput").value})});
$("encounterInput").addEventListener("input",function(){if(!HSKEncounter.pending(state.step,state.encounter))return;state.encounterDraft=$("encounterInput").value.slice(0,120);save()});
$("encounterHint").addEventListener("click",function(){encounterDispatch({type:"hint"})});
$("encounterSample").addEventListener("click",function(){encounterDispatch({type:"sample"})});
$("encounterContinue").addEventListener("click",function(){encounterDispatch({type:"continue"});renderStep();if(!$("storyInterlude").hidden)$("interludeContinue").focus();else $("answerInput").focus()});
$("vocabRevealBtn").addEventListener("click",revealWords);
$("togglePinyin").addEventListener("click",function(){if(HSKSkillSampler.pending(state.step,state.skillSampler))return;else if(HSKStoryBeats.pending(state.step,state.storyBeats)){state.pinyin=!state.pinyin}else if(state.step>=EXAM_START&&!state.solved){state.hintUsed=true;state.examHelp=true;state.pinyin=true}else state.pinyin=!state.pinyin;updateToggles();save()});
$("toggleVietnamese").addEventListener("click",function(){if(HSKSkillSampler.pending(state.step,state.skillSampler))return;else if(HSKStoryBeats.pending(state.step,state.storyBeats)){state.vi=!state.vi}else if(state.step>=EXAM_START&&!state.solved){state.hintUsed=true;state.examHelp=true;state.vi=true}else state.vi=!state.vi;updateToggles();save()});
function replay(){state.step=0;state.done=false;state.history=[];state.attempts=0;state.hintUsed=false;state.draft="";state.examHelp=false;state.storyChoices={};state.storyBeats=[];state.vocabSeen=[];state.encounter=HSKEncounter.initial();state.encounterDraft="";state.worldSeen={};state.skillSampler=HSKSkillSampler.initial();state.solved=false;save();chapters();renderStep();$("answerInput").focus();notify("Bắt đầu lại tập truyện. Thành tích cũ đã được đặt lại.")}
function retakeExam(){state.step=EXAM_START;state.done=false;state.history=state.history.slice(0,EXAM_START);state.attempts=0;state.hintUsed=false;state.draft="";state.examHelp=false;state.solved=false;save();chapters();renderStep();$("answerInput").focus();notify("Đã mở lại ba câu kiểm tra. Tiến độ câu chuyện vẫn được giữ.")}
$("retakeExamBtn").addEventListener("click",retakeExam);
$("resetGame").addEventListener("click",replay);$("replayBtn").addEventListener("click",replay);
$("mobileMenu").addEventListener("click",function(){var nav=document.querySelector("nav");nav.classList.toggle("open");$("mobileMenu").setAttribute("aria-expanded",String(nav.classList.contains("open")))});
document.addEventListener("keydown",function(e){
 if($("gameOverlay").hidden)return;
 if(e.key==="Escape"){if(!$("notebookPanel").hidden){setNotebook(false);return}closeGame();return}
 if(e.key==="Tab"){var f=Array.from($("gameOverlay").querySelectorAll("button:not([hidden]):not([disabled]),input:not([disabled]):not([hidden])")).filter(function(el){return el.getClientRects().length>0});if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
})();
