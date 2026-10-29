
(function(){
"use strict";
var SCENES=HSKContent.scenes,REPLIES=HSKContent.replies;

var $=function(id){return document.getElementById(id)};
var KEY="hai-que-huong-progress-v3",PREVIOUS_KEY="hai-que-huong-progress-v2",OLD_KEY="hai-que-huong-progress-v1";
var state={step:0,history:[],done:false,pinyin:true,vi:true,attempts:0,hintUsed:false,solved:false,busy:false,recognizer:null,draft:"",examHelp:false,storyChoices:{},storyBeats:[],vocabSeen:[],encounter:HSKEncounter.initial(),encounterDraft:"",worldSeen:{},worldFocus:{},worldOpen:false,skillSampler:HSKSkillSampler.initial(),practiceOpen:false};
var toastTimer=null,returnFocus=null,SCENE_TOTAL=SCENES.length,EXAM_START=HSKCurriculum.scenes.findIndex(function(x){return x.kind==="checkpoint"});
if(typeof HSKStoryThreads==="undefined"||HSKStoryThreads.validate(HSKCurriculum,HSKContent).length||typeof HSKSceneLayers==="undefined"||typeof HSKSaveIO==="undefined"||typeof HSKStoryRuntime==="undefined"||HSKStoryRuntime.version!==4||typeof HSKStoryGraph==="undefined"||HSKStoryGraph.validate(HSKContent,HSKCurriculum,HSKStoryBeats,HSKStoryDirector,HSKEncounter).length||typeof HSKSceneWorld==="undefined"||HSKSceneWorld.validate(HSKStoryGraph).length||typeof HSKSkillSampler==="undefined"||HSKSkillSampler.validate(HSKStoryGraph,HSKCurriculum).length||typeof HSKEncounter==="undefined"||HSKEncounter.validate().length||typeof HSKContent==="undefined"||HSKContent.validate(HSKCurriculum).length||typeof HSKLearningKit==="undefined"||typeof HSKStoryDirector==="undefined"||typeof HSKStoryBeats==="undefined"||HSKStoryBeats.validate(SCENE_TOTAL,EXAM_START).length||HSKStoryDirector.validate(SCENE_TOTAL,EXAM_START).length||HSKCurriculum.validate().length||HSKCurriculum.scenes.length!==SCENE_TOTAL||REPLIES.length!==SCENE_TOTAL)throw Error("Story content contract invalid");
function readSafe(k){return HSKSaveIO.readSafe(localStorage,k)}
window.addEventListener("chimse-ai-helped",function(event){
 var sceneId=event&&event.detail&&event.detail.sceneId,scene=HSKCurriculum.scenes[state.step];
 if(typeof sceneId!=="string"||!scene||scene.kind!=="practice"||state.step>=EXAM_START||state.done||state.solved||state.history[state.step]||HSKStoryGraph.idAt(state.step)!==sceneId)return;
 if(!state.hintUsed){state.hintUsed=true;save()}
});
function load(){
 var s=readSafe(KEY);
 if(s&&s.v===3&&Array.isArray(s.history)&&Number.isInteger(s.step)){
  state.history=s.history.slice(0,SCENE_TOTAL).map(function(x){return x&&["correct","assisted"].includes(x.status)?{status:x.status,attempts:Math.min(100,Math.max(0,Number(x.attempts)||0)),hint:!!x.hint}:null});
  state.step=HSKStoryGraph.resolve(s.sceneRef,s.step);state.done=!!s.done&&state.history.filter(Boolean).length===SCENE_TOTAL;
  state.pinyin=s.pinyin!==false;state.vi=s.vi!==false;state.draft=typeof s.draft==="string"?s.draft.slice(0,300):"";
  state.attempts=Math.min(100,Math.max(0,Number(s.attempts)||0));state.hintUsed=!!s.hintUsed;state.examHelp=!!s.examHelp;state.storyChoices=HSKStoryDirector.clean(s.storyChoices);state.storyBeats=HSKStoryBeats.migrate(s.storyBeats,state.step,state.history,state.done);state.vocabSeen=Array.isArray(s.vocabSeen)?s.vocabSeen.filter(x=>Number.isInteger(x)&&x>=0&&x<EXAM_START):[];state.encounter=HSKEncounter.migrate(s.encounter,state.step,state.history,state.done);state.encounterDraft=typeof s.encounterDraft==="string"?s.encounterDraft.slice(0,120):"";state.worldSeen=HSKSceneWorld.clean(s.worldSeen);state.worldFocus=HSKSceneWorld.cleanFocus(s.worldFocus,state.worldSeen);state.skillSampler=HSKSkillSampler.migrate(s.skillSampler,state.step,state.history,state.done);state.practiceOpen=s.practiceOpen===true&&state.step>=EXAM_START&&!state.done&&!!HSKSkillSampler.current(state.skillSampler);
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
function save(){try{HSKSaveIO.persist(localStorage,KEY,state,HSKStoryGraph,HSKStoryRuntime)}catch(e){}if(typeof window.CustomEvent==="function"&&typeof window.dispatchEvent==="function")window.dispatchEvent(new window.CustomEvent("chimse-progress-changed",{detail:{area:"story",value:HSKSaveIO.snapshot(state,HSKStoryGraph)}}))}

function notify(msg){var el=$("toast");el.textContent=msg;el.classList.add("visible");clearTimeout(toastTimer);toastTimer=setTimeout(function(){el.classList.remove("visible")},3300)}
function updateToggles(){
 var canShow=!practiceActive()&&(!!HSKStoryBeats.pending(state.step,state.storyBeats)||state.step<EXAM_START||state.solved||state.examHelp);
 $("pinyinText").hidden=!(state.pinyin&&canShow);
 $("vietText").hidden=!(state.vi&&canShow);
 $("togglePinyin").setAttribute("aria-pressed",String(state.pinyin&&canShow));
 $("toggleVietnamese").setAttribute("aria-pressed",String(state.vi&&canShow));
 $("togglePinyin").textContent="Pinyin "+(state.step>=EXAM_START&&!canShow?"(trợ giúp)":state.pinyin?"✓":"○");
 $("toggleVietnamese").textContent="Tiếng Việt "+(state.step>=EXAM_START&&!canShow?"(trợ giúp)":state.vi?"✓":"○");
 $("checkpointHelpBtn").hidden=state.step<EXAM_START||state.done||state.solved||state.examHelp||practiceActive()||!!HSKStoryBeats.pending(state.step,state.storyBeats);
}

var notebookSection="words",notebookPage=0,notebookData={memory:[],learning:[]};
function notebookAllowed(){return !practiceActive()&&!HSKEncounter.pending(state.step,state.encounter)&&!HSKStoryBeats.pending(state.step,state.storyBeats)&&!pendingModel()&&(state.step<EXAM_START||state.solved||state.done)}
function setNotebook(open){
 if(open&&!notebookAllowed()){
  notify(practiceActive()?"Thử xong lượt này rồi mình mở sổ nhé.":HSKEncounter.pending(state.step,state.encounter)?"Mình tìm lại quyển sổ của An trước nhé.":HSKStoryBeats.pending(state.step,state.storyBeats)||pendingModel()?"Đọc tiếp đoạn này rồi mình mở sổ nhé.":"Cô Vương đang kiểm tra. Sổ tay mở lại sau câu trả lời; cần phụ đề thì nhờ cô nhé.");return;
 }
 $("notebookPanel").hidden=!open;
 $("notebookBtn").setAttribute("aria-expanded",String(open));
 if(open){
  if(window.ChimSeTutor)window.ChimSeTutor.close();
  state.worldOpen=false;renderWorld();
  closeSparrow(false);
  notebookSection="words";notebookPage=0;refreshNotebook();$("notebookClose").focus();
 }else $("notebookBtn").focus();
 $("gameShell").classList[open?"add":"remove"]("notebook-open");
 $("storyStage").inert=open;
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
 var threads=HSKStoryThreads.trace(state.history,state.worldSeen);
 notebookData.learning=threads.map(function(t){
  var first=t.first==="seen-in-context"?"đã gặp qua hội thoại, chưa tự dùng riêng cụm này":t.first==="independent"?"tự trả lời đúng lần đầu":t.first==="supported"?"trả lời sau khi cần hỗ trợ hoặc thử lại":"đã xem mẫu";
  var check=t.checkpoint==="not-applicable"?"chưa có checkpoint riêng":t.checkpoint==="not-attempted"?"chưa đến checkpoint":t.checkpoint==="independent"?"tự làm đúng checkpoint bằng nhập chữ":t.checkpoint==="supported"?"checkpoint cần trợ giúp hoặc thử lại":"đã xem mẫu checkpoint";
  return {target:"notebookThreads",text:t.title+" · "+t.model+"\n"+first+"; "+check+(t.revisited?"; đã xem lại trong cảnh vật":"")};
 });
 if(state.done)["summaryStats","summaryDescription","encounterSummary","skillSummary"].forEach(function(id){notebookData.learning.push({target:"notebookResults",text:$(id).textContent})});
 weak.forEach(function(w){notebookData.learning.push({target:"notebookReview",text:"Một điều để thử lại: "+w.objective})});
 if(!notebookData.learning.length)notebookData.learning.push({target:"notebookThreads",text:"An chưa ghi lại câu nào. Cứ bước tiếp câu chuyện nhé."});
 notebookData.learning.push({target:"notebookResults",text:"Sổ ghi lại những lần An dùng chữ Hán trong truyện. Đây chưa phải kết quả thi HSK hoặc đánh giá phát âm."});
 notebookData.memory=HSKStoryDirector.memory(state.storyChoices).map(function(m){return m.note});
 if(state.encounter.stage==="done")notebookData.memory.push("An tìm lại được quyển sổ mẹ tặng. "+(state.encounter.answer==="independent"?"An tự giới thiệu tên ngay lần đầu.":"An đã luyện lại cách tự giới thiệu để lấy sổ."));
 if(!notebookData.memory.length)notebookData.memory.push("Những trang lựa chọn của An đang còn trống. Một ngày mới vừa bắt đầu.");
 renderNotebookPage();
}
function renderNotebookPage(){
 var short=window.matchMedia&&window.matchMedia("(max-height: 620px)").matches,perPage=short?2:3;
 var rows=Array.from($("notebookWords").children),total=notebookSection==="words"?Math.max(1,Math.ceil(rows.length/perPage)):notebookSection==="memory"?notebookData.memory.length:notebookSection==="learning"?notebookData.learning.length:1;
 notebookPage=Math.min(Math.max(0,notebookPage),total-1);
 ["notebookWords","notebookResults","notebookReview","notebookThreads","storyMemory","notebookProgress","notebookOptions","notebookPracticeLink"].forEach(function(id){$(id).hidden=true});
 ["words","memory","learning","settings"].forEach(function(section,i){$(["notebookWordsTab","notebookMemoryTab","notebookLearningTab","notebookSettingsTab"][i]).setAttribute("aria-pressed",String(notebookSection===section))});
 $("notebookCaption").textContent="";
 if(notebookSection==="words"){
  $("notebookWords").hidden=false;rows.forEach(function(row,i){row.hidden=i<notebookPage*perPage||i>=(notebookPage+1)*perPage});
  $("notebookCaption").textContent=rows.length?"Chạm một từ để nghe lại.":"Sổ chưa có từ nào. An sẽ ghi lại những từ mình gặp.";
 }else if(notebookSection==="memory"){
  $("storyMemory").hidden=false;$("storyMemory").textContent=notebookData.memory[notebookPage];
 }else if(notebookSection==="learning"){
  var entry=notebookData.learning[notebookPage];$(entry.target).hidden=false;$(entry.target).textContent=entry.text;
  $("notebookPracticeLink").hidden=false;
 }else{
  $("notebookProgress").hidden=false;$("notebookOptions").hidden=false;
 }
 $("notebookPrev").disabled=notebookPage===0;$("notebookNext").disabled=notebookPage===total-1;
 $("notebookPageStatus").textContent=(notebookPage+1)+" / "+total;
}
function renderTiles(){
 var allowed=state.step<EXAM_START&&!state.solved&&!state.done;
 $("sentenceBuilder").hidden=true;$("gameShell").classList.remove("builder-open");$("openBuilderBtn").hidden=!allowed;if(!allowed)return;
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
 $("gameShell").classList.add("builder-open");
 $("builderNotice").textContent="Chạm từ để ghép lời của An · có trợ giúp";
 $("tileList").children[0]?.focus();
}
function useTile(token){
 if(state.solved||state.done||state.step>=EXAM_START||HSKStoryBeats.pending(state.step,state.storyBeats)||pendingModel())return;
 state.draft=HSKLearningKit.compose($("answerInput").value,token);
 $("answerInput").value=state.draft;
 state.hintUsed=true;save();
 $("builderNotice").textContent="Chạm từ để ghép lời của An · có trợ giúp";
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

/* In-world optional practice branch. Never gate the classroom story automatically. */
function practiceActive(){return state.practiceOpen&&state.step>=EXAM_START&&!state.done&&!!HSKSkillSampler.current(state.skillSampler)}
function openPractice(){
 if(state.done||state.step<EXAM_START||!HSKSkillSampler.current(state.skillSampler)||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 state.practiceOpen=true;save();renderStep();$("skillOptions").children[0]?.focus();
}
function closePractice(){
 state.practiceOpen=false;
 if("speechSynthesis" in window&&window.speechSynthesis&&window.speechSynthesis.cancel)window.speechSynthesis.cancel();
 save();renderStep();$("practiceOpenBtn").focus();
}
/* Optional tactile story objects. Never alter school exam scores. */
var worldPage=0;
function renderWorld(){
 var id=HSKStoryGraph.idAt(state.step),site=HSKSceneWorld.site(id);
 var blocked=!!(state.done||HSKEncounter.pending(state.step,state.encounter)||practiceActive()||HSKStoryBeats.pending(state.step,state.storyBeats)||pendingModel());
 var available=!!site&&!blocked;$("worldOpenBtn").hidden=!available;$("worldOpenBtn").setAttribute("aria-expanded",String(state.worldOpen));
 $("worldPanel").hidden=!available||!state.worldOpen;$("worldActions").replaceChildren();
 $("worldDescription").textContent="Chọn một đồ vật để hiểu thêm cảnh này. Không tính điểm.";
 $("worldBridge").textContent="";
 if(!available||!state.worldOpen){syncPlayLayout();return}
 $("worldTitle").textContent=site.title;
 var visited=state.worldSeen[id]||[];
 $("worldProgress").textContent="Quan sát theo ý thích · "+visited.length+"/"+site.objects.length+" chi tiết đã xem";
 site.objects.forEach(function(object,index){
  var b=document.createElement("button");b.type="button";b.className="world-action";
  b.textContent=object.icon+" "+object.label+(visited.includes(object.id)?" ✓":"");
  if(state.worldFocus[id]===object.id)b.classList.add("selected");
  b.addEventListener("click",function(){
   if(state.done||HSKEncounter.pending(state.step,state.encounter)||practiceActive()||HSKStoryBeats.pending(state.step,state.storyBeats))return;
   var next=HSKSceneWorld.inspect(state.worldSeen,id,object.id);
   state.worldSeen=next.state;state.worldFocus[id]=object.id;worldPage=0;save();renderWorld();$("worldActions").children[index]?.focus();
  });
  $("worldActions").appendChild(b);
 });
 var focus=HSKSceneWorld.cleanFocus(state.worldFocus,state.worldSeen)[id];
 if(focus){
  var note=HSKSceneWorld.describe(id,focus,state.worldSeen,readSafe("hai-que-huong-intro-v1"));
  $("worldDescription").textContent=note.vi+"  ·  "+note.zh+(note.callbackText?"  ✳ "+note.callbackText:"")+(note.memory?"  ✳ "+note.memory:"");
  $("worldBridge").textContent=note.bridgeText;
 }
 renderWorldPage();syncPlayLayout();
}
function renderWorldPage(){
 var bridge=!!$("worldBridge").textContent;
 if(!bridge)worldPage=0;
 $("worldDescription").hidden=worldPage===1;$("worldBridge").hidden=worldPage===0;
 $("worldPages").hidden=!bridge;$("worldPrev").disabled=worldPage===0;$("worldNext").disabled=worldPage===1;
 $("worldPageStatus").textContent=(worldPage+1)+" / 2";
}
/* V10 formative skill sample. Speech-to-text or TTS playback is NOT a verified language exam. */
function renderSkillSampler(){
 var active=practiceActive();
 $("skillPanel").hidden=!active;
 if(!active)return false;
 $("practiceOpenBtn").hidden=true;
 var item=HSKSkillSampler.current(state.skillSampler);
 $("answerForm").hidden=true;$("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=true;
 $("storyInterlude").hidden=true;$("encounterPanel").hidden=true;$("storyChoicePanel").hidden=true;
 $("worldPanel").hidden=true;$("worldOpenBtn").hidden=true;$("storyBeat").hidden=true;$("learningStrip").hidden=true;
 $("vocabRevealBtn").hidden=true;$("hintBtn").hidden=true;$("assistBtn").hidden=true;$("nextBtn").hidden=true;
 $("sceneDay").textContent="MẤY TRANG AN MUỐN NHỚ";
 $("speaker").textContent="Sổ tay của An";$("sceneTag").textContent="XEM LẠI CÂU ĐÃ GẶP";
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
   if(!practiceActive())return;
   state.skillSampler=HSKSkillSampler.answer(state.skillSampler,option.id);
   if(!HSKSkillSampler.current(state.skillSampler))state.practiceOpen=false;
   save();renderStep();
  });
  $("skillOptions").appendChild(btn);
 });
 updateToggles();return true;
}
function skipSampler(){
 if(!practiceActive())return;
 state.skillSampler=HSKSkillSampler.skip(state.skillSampler);if(!HSKSkillSampler.current(state.skillSampler))state.practiceOpen=false;save();renderStep();
}
function playSkillSample(){
 var item=HSKSkillSampler.current(state.skillSampler);
 if(!item||item.mode!=="listening")return;
 var id=item.id;
 $("skillAudioNotice").textContent="Đang phát thử giọng tiếng Trung của trình duyệt…";
 var ok=speak(item.audioZh,function(){
  // Completing speech playback is stronger than requesting it; never score a failed request.
  var active=HSKSkillSampler.current(state.skillSampler);
  if(!active||active.id!==id||$("gameOverlay").hidden||!practiceActive())return;
  state.skillSampler=HSKSkillSampler.audio(state.skillSampler,true);save();
  $("skillAudioNotice").textContent="Trình duyệt đã báo phát xong. Đây chỉ là luyện nghe thử; không kiểm định tai nghe, âm lượng hay năng lực HSK.";
 },function(){
  if(!practiceActive())return;
  $("skillAudioNotice").textContent="Âm thanh không hoàn tất. Mục này vẫn chưa được đánh giá nghe hiểu.";
 });
 if(!ok)$("skillAudioNotice").textContent="Không có giọng đọc khả dụng. Chọn Bỏ qua để tiếp tục; kết quả nghe vẫn chưa đánh giá.";
}

function renderEncounter(){
 var active=HSKEncounter.pending(state.step,state.encounter);
 $("encounterPanel").hidden=!active;if(!active)return false;
 var data=HSKEncounter.content,progress=state.encounter;
 paintScene("class",["respond","outcome"].includes(progress.stage)?"lost-notebook-office":"lost-notebook",{companion:progress.route||""});
 if(progress.stage==="respond")HSKSceneLayers.setExpression($("stageIllustration"),"receptionist","speaking");
 else if(progress.stage==="outcome"){
  HSKSceneLayers.setExpression($("stageIllustration"),"receptionist","reassuring");
  HSKSceneLayers.setExpression($("stageIllustration"),"an","smile");
 }
 $("sceneDay").textContent="QUYỂN SỔ THẤT LẠC";
 $("speaker").textContent=progress.stage==="respond"?"Cô trực phòng hành chính":"安 · Minh An";
 $("sceneTag").textContent="QUYỂN SỔ BIẾN MẤT";
 $("dialogueText").textContent=progress.stage==="respond"?data.promptZh:progress.stage==="outcome"?data.outcomeZh:data.startZh;
 $("pinyinText").textContent=progress.stage==="respond"?data.promptPy:progress.stage==="outcome"?data.outcomePy:data.startPy;
 $("vietText").textContent=progress.stage==="respond"?data.promptVi:progress.stage==="outcome"?data.outcomeVi:data.startVi;
 $("storyInterlude").hidden=true;$("storyBeat").hidden=true;$("storyEcho").hidden=true;$("storyChoicePanel").hidden=true;
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
  $("encounterBody").textContent="An đã nhìn quanh, nhưng vẫn chưa biết quyển sổ đang ở đâu. Cậu có thể nhờ Tiểu Vũ đi cùng hoặc hỏi cô Vương đường tới phòng trực. Lựa chọn này không chấm điểm ngôn ngữ.";
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

function pendingModel(){
 return !state.done&&state.step<EXAM_START&&!state.history[state.step]&&!state.vocabSeen.includes(state.step)?SCENES[state.step].guidedModel:null;
}
function renderStoryInterlude(){
 var story=HSKStoryBeats.pending(state.step,state.storyBeats),model=!story&&pendingModel(),b=story||model;
 $("storyInterlude").hidden=!b;
 $("storyInterlude").dataset.kind=model?"model":"story";
 if(!b)return false;
 $("interludeHeading").textContent=b.title;$("interludeStory").textContent=b.story;
 $("speaker").textContent=model?(model.speaker||SCENES[state.step].speaker)+" · nhắc An":"旁白 · Người kể chuyện";$("sceneTag").textContent=model?"CÂU AN TẬP NÓI":"TRANG TRUYỆN";
 $("interludeContinue").textContent=model?"Thử nói cùng An ↗":"Đọc tiếp câu chuyện ↗";
 if(model&&(model.speakerCharacter||SCENES[state.step].speakerCharacter))HSKSceneLayers.setExpression($("stageIllustration"),model.speakerCharacter||SCENES[state.step].speakerCharacter,"speaking");
 $("dialogueText").textContent=b.zh;$("pinyinText").textContent=b.py;$("vietText").textContent=b.vi;
 $("userInstruction").hidden=true;$("sceneObjective").hidden=true;
 $("answerForm").hidden=true;$("sentenceBuilder").hidden=true;$("learningStrip").hidden=true;
 $("vocabRevealBtn").hidden=true;$("openBuilderBtn").hidden=true;$("hintBtn").hidden=true;$("assistBtn").hidden=true;
 $("storyBeat").hidden=true;$("storyEcho").hidden=true;$("storyChoicePanel").hidden=true;$("nextBtn").hidden=true;
 updateToggles();return true;
}
function continueStoryInterlude(){
 if($("gameOverlay").hidden)return;
 var b=HSKStoryBeats.pending(state.step,state.storyBeats);
 if(b)state.storyBeats=HSKStoryBeats.mark(state.storyBeats,b.id);
 else if(pendingModel()){state.hintUsed=true;state.vocabSeen.push(state.step)}
 else return;
 save();renderStep();($("storyInterlude").hidden?(state.solved?$("nextBtn"):$("answerInput")):$("interludeContinue")).focus();
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
   save();paintScene("noodle-shop",HSKStoryGraph.idAt(state.step));renderStoryChoice();$("nextBtn").hidden=false;syncPlayLayout();$("nextBtn").focus();
  });
  $("storyChoiceOptions").appendChild(btn);
 });
 return true;
}
function updateResumeLabel(){
 $("resumeBtn").firstChild.textContent=state.done?"Xem lại câu chuyện ":"Tiếp tục câu chuyện ";
}
function showCompletion(){
 var summary=HSKCore.summarize(state.history,SCENE_TOTAL,EXAM_START);
 $("completionPane").hidden=false;$("sentenceBuilder").hidden=true;$("answerForm").hidden=true;$("nextBtn").hidden=true;$("assistBtn").hidden=true;$("hintBtn").hidden=true;
 $("userInstruction").textContent="✳ Bạn đã đi hết tập truyện thử nghiệm: Ngày đầu xa nhà.";
 $("summaryStats").textContent=summary.independently+"/"+summary.total+" câu tự giải không cần gợi ý · "+summary.hinted+" câu đúng sau gợi ý · "+summary.assisted+" câu xem đáp án mẫu · "+summary.examCorrect+"/"+summary.examTotal+" câu kiểm tra không cần trợ giúp.";
 $("episodeEnding").textContent=HSKEncounter.content.endingZh+" — "+HSKEncounter.content.endingVi;
 $("episodeReflection").textContent=HSKStoryThreads.ending(state.storyChoices,state.encounter);
 var skillSummary=HSKSkillSampler.summary(state.skillSampler);$("skillSummary").textContent="Luyện đọc: "+skillSummary.reading+" · Luyện nghe: "+skillSummary.listening+" · Nói/viết: chưa đánh giá riêng. Đây không phải điểm thi HSK.";
 $("summaryDescription").textContent=summary.examCorrect===summary.examTotal&&summary.assisted===0&&summary.hinted===0?"Rất tốt! Bạn đã tự xử lý tất cả câu hỏi trong tập thử nghiệm. Đây chưa phải kết quả thi HSK 1 chính thức.":"Bạn đã hoàn thành câu chuyện. Những câu cần xem mẫu là gợi ý để ôn lại — không được tính là trả lời đúng độc lập. Đây không phải chứng nhận trình độ HSK.";
 $("progressBar").style.width="100%";$("retakeExamBtn").hidden=false;$("storyChoicePanel").hidden=true;$("storyChoiceOutcome").hidden=true;$("storyInterlude").hidden=true;$("storyEcho").hidden=true;$("vocabRevealBtn").hidden=true;$("openBuilderBtn").hidden=true;$("encounterPanel").hidden=true;$("skillPanel").hidden=true;$("practiceOpenBtn").hidden=true;$("worldPanel").hidden=true;$("worldOpenBtn").hidden=true;
 $("feedback").textContent="";$("feedback").className="feedback";
 $("encounterSummary").textContent=state.encounter.stage==="done"?"Quyển sổ đã được tìm lại · Vận dụng lời giới thiệu: "+(state.encounter.answer==="independent"?"tự trả lời ngay lần đầu":state.encounter.answer==="retried"?"đúng sau khi thử lại":state.encounter.answer==="helped"?"đúng nhờ gợi ý":"xem đáp án mẫu"): "Tình huống tìm lại sổ đã được bỏ qua theo tiến độ phiên bản cũ.";
 $("completionReview").textContent=(function(){var weak=HSKLearningKit.needsReview(state.history,HSKCurriculum.scenes);return weak.length?"Sổ tay của An nhắc bạn luyện thêm: "+weak.map(function(w){return w.objective}).join("; ")+".":"Các câu luyện trong tập này chưa ghi nhận chỗ cần xem lại."})();
 syncPlayLayout();
}
function syncPlayLayout(){
 var mode=state.done?"completed":!$("encounterPanel").hidden?"encounter":!$("skillPanel").hidden?"practice":!$("storyInterlude").hidden?"interlude":!$("worldPanel").hidden?"world":!$("storyChoicePanel").hidden?"choice":state.solved?"resolved":"answer";
 $("gameShell").dataset.mode=mode;
 closeSparrow(false);
 $("sparrowTalkBtn").hidden=state.step>=EXAM_START||!["answer","resolved"].includes(mode);
 if(window.ChimSeTutor)window.ChimSeTutor.sync();
}
function paintScene(place,sceneId,options){
 var host=$("stageIllustration");
 var showForeground=sceneId==="hsk1.e01.liu-noodle-order"&&!!state.storyChoices["noodle-taste"];
 HSKSceneLayers.mount(host,sceneId,Object.assign({dialogue:$("storyDialogue"),header:true,showForeground:showForeground},options||{}));
 HSKSceneLayers.preload(HSKStoryGraph.idAt(Math.min(state.step+1,SCENE_TOTAL-1)));
}
function showAnFeeling(expression){var host=$("stageIllustration");if(host.dataset.artScene)HSKSceneLayers.setExpression(host,"an",expression)}
function showSparrowFeeling(expression){var host=$("stageIllustration");if(host.dataset.artScene)HSKSceneLayers.setExpression(host,"sparrow",expression)}
function narrateSparrow(index){
 var lines=[
  "Tớ đang giả vờ biết đường. Cậu đừng hỏi nhé.",
  "Cánh cổng này cao hơn tớ tưởng. Cậu có thấy vậy không?",
  "Tiểu Vũ cười với cậu kìa. Tớ nghĩ cậu ấy cũng hơi ngại.",
  "Tớ đếm nhầm mấy lần rồi. Cứ nhìn nét mặt của cô thôi.",
  "Mùi thơm quá. Tớ xin ngồi cạnh cửa sổ thêm một chút.",
  "Bà Lưu còn nhớ cậu thích ít cay hay muốn thử một chút đấy. Tớ thích cách bà chờ cậu nói.",
  "Con đường này vẫn lạ, nhưng giờ đã có người đi cùng.",
  "Tớ đợi ngoài cửa sổ nhé. Cậu cứ từ từ.",
  "Tớ chẳng biết giá mì đâu. Hôm qua tớ mải nhìn cái bát.",
  "Dù cậu nói thế nào, tớ vẫn sẽ chờ ở bậu cửa."
 ];
 var el=$("sparrowWhisper");if(!el)return;
 closeSparrow(false);$("sparrowWhisperText").textContent=lines[Math.max(0,Math.min(lines.length-1,index|0))];
}
function closeSparrow(focus){
 $("sparrowWhisper").hidden=true;$("storyDialogue").classList.remove("sparrow-speaking");$("sparrowTalkBtn").setAttribute("aria-expanded","false");
 if(focus)$("sparrowTalkBtn").focus();
}
function renderStep(){
 state.worldOpen=false;
 var s=SCENES[state.step],meta=HSKCurriculum.scenes[state.step];state.busy=false;state.solved=false;
 paintScene(s.place,HSKStoryGraph.idAt(state.step));
 $("aiTutorPanel").dataset.sceneId=HSKStoryGraph.idAt(state.step);if(window.ChimSeTutor)window.ChimSeTutor.sync();
 narrateSparrow(state.step);
 $("sceneDay").textContent=meta.kind==="checkpoint"?"CÔ VƯƠNG HỎI AN":s.place==="noodle-shop"?"QUÁN MÌ CỦA BÀ LƯU":"NGÀY ĐẦU Ở THÀNH ĐÔ";
 $("speaker").textContent=s.speaker;$("sceneTag").textContent=s.tag;
 $("dialogueText").textContent=s.zh;$("pinyinText").textContent=s.py;$("vietText").textContent=s.vi;
 var speakerName=s.speaker||"";$("sendAnswer").textContent=(speakerName.indexOf("Mẹ")>=0?"Nói với mẹ":speakerName.indexOf("Tiểu Vũ")>=0?"Nói với bạn":speakerName.indexOf("Bà Lưu")>=0?"Nói với bà":speakerName.indexOf("Cô Vương")>=0?"Nói với cô":"Nói câu này")+" ↗";
 $("hintBtn").textContent="Nhờ "+(speakerName.indexOf("Mẹ")>=0?"mẹ":speakerName.indexOf("Tiểu Vũ")>=0?"bạn":speakerName.indexOf("Bà Lưu")>=0?"bà":speakerName.indexOf("Cô Vương")>=0?"cô":"Sẻ");
 $("userInstruction").textContent=(meta.kind==="checkpoint"?"✎ ":"✦ ")+s.request;
 $("stepText").textContent=String(state.step+1).padStart(2,"0")+" / "+String(SCENE_TOTAL).padStart(2,"0");
 $("progressBar").style.width=(100*state.step/SCENE_TOTAL)+"%";
 $("answerInput").value=state.draft;$("answerInput").disabled=false;
 $("answerInput").placeholder="An nói gì đây?";
 $("sendAnswer").disabled=false;$("micBtn").disabled=false;
 $("feedback").textContent="";$("feedback").className="feedback";
 $("answerForm").hidden=false;$("nextBtn").hidden=true;$("hintBtn").hidden=meta.kind==="checkpoint";$("assistBtn").hidden=state.attempts<2;
 $("completionPane").hidden=true;$("retakeExamBtn").hidden=true;$("practiceOpenBtn").hidden=true;$("encounterPanel").hidden=true;$("skillPanel").hidden=true;$("worldPanel").hidden=true;$("worldOpenBtn").hidden=true;$("storyChoicePanel").hidden=true;$("storyChoiceOutcome").hidden=true;$("storyInterlude").hidden=true;$("userInstruction").hidden=false;$("sceneObjective").hidden=meta.kind!=="checkpoint";
 var beat=HSKStoryDirector.beat(state.step,state.storyChoices),callback=HSKEncounter.callback(state.step,state.encounter);$("storyBeat").hidden=!beat&&!callback;$("storyBeat").textContent=[beat,callback].filter(Boolean).map(x=>"✳ "+x.zh+" — "+x.vi).join("  ");
 var echo=meta.kind==="practice"?HSKStoryThreads.echo(state.step,state.history,state.storyChoices,state.encounter):null;
 $("storyEcho").hidden=!echo;$("storyEcho").textContent=echo?"✳ "+echo.zh+" ("+echo.py+") — "+echo.vi+" · Gặp lại trong câu chuyện, không chấm điểm.":"";
 $("builderNotice").textContent="Chạm từ để ghép câu nếu chưa biết gõ chữ Hán. Dùng ghép câu được tính là trợ giúp.";renderTiles();
 if(!$("notebookPanel").hidden)setNotebook(false);
 $("attemptCounter").textContent="Lượt thử: "+state.attempts;
 $("learningStrip").hidden=true;
 $("vocabRevealBtn").hidden=true;
 $("learningStrip").textContent=meta.kind==="practice"?"✳ "+meta.topic+" · "+meta.words.map(function(w){return w[0]+" ("+w[1]+") — "+w[2]}).join("  ·  "):"";
 $("sceneObjective").textContent=meta.kind==="checkpoint"?"Kiểm tra nhớ lại · "+meta.objective+" · Phụ đề/gợi ý tính là có hỗ trợ.":"Mục tiêu hôm nay · "+meta.objective;
 updateToggles();
 if(state.done)showCompletion();
 else {
  var blocked=renderEncounter()||renderSkillSampler()||renderStoryInterlude();
  if(!blocked&&SCENES[state.step].speakerCharacter)HSKSceneLayers.setExpression($("stageIllustration"),SCENES[state.step].speakerCharacter,"speaking");
  if(!blocked&&state.history[state.step])displayResolved();
  $("practiceOpenBtn").hidden=blocked||state.done||state.step<EXAM_START||!HSKSkillSampler.current(state.skillSampler)||!!HSKStoryBeats.pending(state.step,state.storyBeats);
  renderWorld();
 }
 syncPlayLayout();
}
function displayResolved(){
 var saved=state.history[state.step];if(!saved)return;
 state.solved=true;$("answerInput").disabled=true;$("sendAnswer").disabled=true;$("micBtn").disabled=true;
 $("assistBtn").hidden=true;$("hintBtn").hidden=true;
 var reply=REPLIES[state.step];
 $("dialogueText").textContent=reply.zh;$("pinyinText").textContent=reply.py;$("vietText").textContent=reply.vi;
 $("sceneTag").textContent="PHẢN HỒI CỦA NHÂN VẬT";updateToggles();
 $("feedback").className="feedback "+(saved.status==="correct"?"good":"neutral");
 $("feedback").textContent=saved.status==="correct"?(saved.hint?"✓ An đã nói được câu này sau hỗ trợ.":"✓ Nhân vật đã hiểu bạn. Đọc phản hồi rồi nhấn Tiếp tục."):"✦ Bạn đã xem câu mẫu và đi tiếp; câu này không tính là tự làm đúng.";
 $("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=true;$("learningStrip").hidden=state.step>=EXAM_START;$("vocabRevealBtn").hidden=true;
 $("nextBtn").hidden=renderStoryChoice();$("nextBtn").textContent=state.step===SCENE_TOTAL-1?"Xem tổng kết ↗":"Tiếp tục câu chuyện ↗";
 syncPlayLayout();
}
function openGame(){
 returnFocus=document.activeElement;document.body.classList.add("game-active");document.body.style.overflow="hidden";$("gameOverlay").hidden=false;renderStep();$("notebookBtn").setAttribute("aria-expanded","false");
 var phone=window.matchMedia&&window.matchMedia("(max-width: 690px)").matches;
 if(state.done)$("replayBtn").focus();else if(!$("skillPanel").hidden)$("skillOptions").children[0]?.focus();else if(!$("encounterPanel").hidden){if(phone&&state.encounter.stage==="respond")$("encounterActions").children[0]?.focus();else encounterFocus()}else if(!$("storyInterlude").hidden)$("interludeContinue").focus();else if(state.solved)$("nextBtn").focus();else if(phone)$("notebookBtn").focus();else $("answerInput").focus();
}
function closeGame(){
 if(window.ChimSeTutor)window.ChimSeTutor.close();
 $("notebookPanel").hidden=true;$("notebookBtn").setAttribute("aria-expanded","false");
 $("gameShell").classList.remove("notebook-open");$("storyStage").inert=false;
 if("speechSynthesis" in window)window.speechSynthesis.cancel();
 if(state.recognizer){try{state.recognizer.abort()}catch(e){}state.recognizer=null}
 $("micBtn").classList.remove("listening");$("gameOverlay").hidden=true;document.body.classList.remove("game-active");document.body.style.overflow="";updateResumeLabel();
 if(returnFocus&&returnFocus.isConnected)returnFocus.focus();
}
function speak(text,onFinished,onError){
 if(!("speechSynthesis" in window)||typeof SpeechSynthesisUtterance==="undefined"){
  if(typeof onError==="function")onError();
  else notify("Thiết bị chưa hỗ trợ phát âm tự động; bạn vẫn có thể đọc phụ đề.");
  return false;
 }
 try{
  window.speechSynthesis.cancel();var utter=new SpeechSynthesisUtterance(text);utter.lang="zh-CN";utter.rate=.78;
  var voices=typeof window.speechSynthesis.getVoices==="function"?window.speechSynthesis.getVoices():[];
  var voice=voices.find(function(v){return v.lang&&v.lang.toLowerCase().startsWith("zh")});
  if(voice)utter.voice=voice;
  if(typeof onFinished==="function")utter.onend=onFinished;
  if(typeof onError==="function")utter.onerror=onError;
  window.speechSynthesis.speak(utter);return true;
 }catch(e){if(typeof onError==="function")onError();else notify("Không phát được âm thanh; hãy đọc phụ đề.");return false}
}
function finishCurrent(status){
 if(state.recognizer){try{state.recognizer.abort()}catch(e){}state.recognizer=null;$("micBtn").classList.remove("listening")}
 state.history[state.step]={status:status,attempts:state.attempts,hint:state.hintUsed};state.draft="";state.busy=false;
 save();displayResolved();showAnFeeling(status==="correct"?"smile":"awkward");showSparrowFeeling(status==="correct"?"happy":"worried");$("nextBtn").focus();
}
function submitAnswer(e){
 e.preventDefault();if(state.busy||state.solved||state.done)return;
 if(practiceActive()||HSKEncounter.pending(state.step,state.encounter)||HSKStoryBeats.pending(state.step,state.storyBeats)||pendingModel())return;
 var scene=SCENES[state.step],value=$("answerInput").value;
 var result=HSKCore.evaluate(scene,value),feed=$("feedback");
 if(result.ok){state.busy=true;finishCurrent("correct");return}
 if(!value.trim()){feed.className="feedback bad";feed.textContent=result.reason;return}
 state.attempts++;save();$("attemptCounter").textContent="Lượt thử: "+state.attempts;
 feed.className="feedback bad";feed.textContent="Mình thử lại nhé. "+result.reason;
 showAnFeeling("awkward");showSparrowFeeling("worried");
 if(state.attempts>=2)$("assistBtn").hidden=false;
}
function nextScene(){
 var ref=HSKStoryGraph.idAt(state.step);
 var transition=HSKStoryRuntime.advance(ref,{
  solved:state.solved,
  sampler:practiceActive(),
  encounter:HSKEncounter.pending(state.step,state.encounter),
  interlude:!!HSKStoryBeats.pending(state.step,state.storyBeats)||!!pendingModel(),
  choice:!!HSKStoryDirector.pending(state.step,state.storyChoices)
 },HSKStoryGraph);
 if(!transition.ok)return;
 if(transition.done){state.done=true;save();showCompletion();updateResumeLabel();notify("✳ Đã hoàn thành tập truyện đầu tiên!");return}
 state.step=HSKStoryGraph.indexOf(transition.sceneRef);
 if(state.step<0)throw Error("Unknown target node "+transition.sceneRef);
 state.draft="";state.attempts=0;state.hintUsed=false;state.examHelp=false;save();renderStep();
 if(!$("encounterPanel").hidden)encounterFocus();else if(!$("skillPanel").hidden)$("skillOptions").children[0]?.focus();else if(!$("storyInterlude").hidden)$("interludeContinue").focus();else $("answerInput").focus();
}
function revealHint(){
 var s=SCENES[state.step];state.hintUsed=true;save();
 $("feedback").className="feedback neutral";$("feedback").textContent="Gợi ý: "+s.hint;
 $("assistBtn").hidden=false;save();
 showAnFeeling("thinking");showSparrowFeeling("thinking");
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
 if(state.solved||practiceActive()||HSKEncounter.pending(state.step,state.encounter)||HSKStoryBeats.pending(state.step,state.storyBeats)||pendingModel())return;
 if(state.recognizer){try{state.recognizer.stop()}catch(e){}return}
 var r=new API();r.lang="zh-CN";r.interimResults=false;r.maxAlternatives=1;state.recognizer=r;
 var btn=$("micBtn");btn.classList.add("listening");btn.setAttribute("aria-label","Dừng micro");
 r.onresult=function(e){if(state.solved||$("gameOverlay").hidden)return;$("answerInput").value=e.results[0][0].transcript;state.draft=$("answerInput").value;save();notify("Đã nhận lời nói. Hãy kiểm tra và nhấn Gửi; đây chưa phải đánh giá phát âm.")};
 r.onerror=function(e){notify(e.error==="not-allowed"?"Micro bị từ chối quyền truy cập.":"Không nhận diện được lời nói. Bạn có thể nhập chữ Hán.")};
 r.onend=function(){btn.classList.remove("listening");btn.setAttribute("aria-label","Sử dụng micro");state.recognizer=null};
 try{r.start()}catch(e){btn.classList.remove("listening");state.recognizer=null;notify("Không thể mở micro trên thiết bị này.")}
}
load();updateResumeLabel();
HSKSceneLayers.mount($("homeArt"),"home.arrival",{bottomAvoid:document.querySelector(".hero-copy"),header:true});
["startBtn","resumeBtn","endingBtn"].forEach(function(id){$(id).addEventListener("click",openGame)});
$("closeGame").addEventListener("click",closeGame);
$("answerForm").addEventListener("submit",submitAnswer);$("answerInput").addEventListener("input",function(){if(state.solved)return;state.draft=$("answerInput").value.slice(0,300);save()});
$("listenBtn").addEventListener("click",function(){if(practiceActive()){playSkillSample();return}speak($("dialogueText").textContent)});
$("hintBtn").addEventListener("click",revealHint);
$("assistBtn").addEventListener("click",showAnswerAndMove);
$("nextBtn").addEventListener("click",nextScene);
$("micBtn").addEventListener("click",microphone);
$("notebookBtn").addEventListener("click",function(){setNotebook($("notebookPanel").hidden)});
$("notebookClose").addEventListener("click",function(){setNotebook(false)});
$("sparrowTalkBtn").addEventListener("click",function(){
 if($("sparrowTalkBtn").hidden)return;
 showSparrowFeeling("listening");HSKSceneLayers.react($("stageIllustration"),"sparrow");$("sparrowWhisper").hidden=false;$("storyDialogue").classList.add("sparrow-speaking");$("sparrowTalkBtn").setAttribute("aria-expanded","true");$("sparrowTalkClose").focus();
});
$("sparrowTalkClose").addEventListener("click",function(){closeSparrow(true)});
[["notebookWordsTab","words"],["notebookMemoryTab","memory"],["notebookLearningTab","learning"],["notebookSettingsTab","settings"]].forEach(function(tab){$(tab[0]).addEventListener("click",function(){notebookSection=tab[1];notebookPage=0;renderNotebookPage()})});
$("notebookPrev").addEventListener("click",function(){notebookPage--;renderNotebookPage()});
$("notebookNext").addEventListener("click",function(){notebookPage++;renderNotebookPage()});
$("tileUndo").addEventListener("click",function(){useTile("__undo")});
$("tileClear").addEventListener("click",function(){useTile("__clear")});
$("openBuilderBtn").addEventListener("click",openBuilder);
$("builderClose").addEventListener("click",function(){$("sentenceBuilder").hidden=true;$("openBuilderBtn").hidden=false;$("gameShell").classList.remove("builder-open");$("openBuilderBtn").focus()});
$("interludeContinue").addEventListener("click",continueStoryInterlude);
$("skillListen").addEventListener("click",playSkillSample);
$("practiceOpenBtn").addEventListener("click",openPractice);
$("practiceCloseBtn").addEventListener("click",closePractice);
$("skillSkip").addEventListener("click",skipSampler);
$("encounterAnswerForm").addEventListener("submit",function(e){e.preventDefault();encounterDispatch({type:"submit",value:$("encounterInput").value})});
$("encounterInput").addEventListener("input",function(){if(!HSKEncounter.pending(state.step,state.encounter))return;state.encounterDraft=$("encounterInput").value.slice(0,120);save()});
$("encounterHint").addEventListener("click",function(){encounterDispatch({type:"hint"})});
$("encounterSample").addEventListener("click",function(){encounterDispatch({type:"sample"})});
$("encounterContinue").addEventListener("click",function(){encounterDispatch({type:"continue"});renderStep();if(!$("storyInterlude").hidden)$("interludeContinue").focus();else $("answerInput").focus()});
$("vocabRevealBtn").addEventListener("click",revealWords);
$("worldOpenBtn").addEventListener("click",function(){state.worldOpen=!state.worldOpen;worldPage=0;renderWorld();if(state.worldOpen)$("worldCloseBtn").focus()});
$("worldCloseBtn").addEventListener("click",function(){state.worldOpen=false;renderWorld();$("worldOpenBtn").focus()});
$("worldPrev").addEventListener("click",function(){worldPage=0;renderWorldPage()});
$("worldNext").addEventListener("click",function(){worldPage=1;renderWorldPage()});
$("togglePinyin").addEventListener("click",function(){if(practiceActive())return;else if(HSKStoryBeats.pending(state.step,state.storyBeats)){state.pinyin=!state.pinyin}else if(state.step>=EXAM_START&&!state.solved){state.hintUsed=true;state.examHelp=true;state.pinyin=true}else state.pinyin=!state.pinyin;updateToggles();save()});
$("toggleVietnamese").addEventListener("click",function(){if(practiceActive())return;else if(HSKStoryBeats.pending(state.step,state.storyBeats)){state.vi=!state.vi}else if(state.step>=EXAM_START&&!state.solved){state.hintUsed=true;state.examHelp=true;state.vi=true}else state.vi=!state.vi;updateToggles();save()});
$("checkpointHelpBtn").addEventListener("click",function(){
 if(state.step<EXAM_START||state.solved||state.done||practiceActive()||HSKStoryBeats.pending(state.step,state.storyBeats))return;
 state.hintUsed=true;state.examHelp=true;state.pinyin=true;state.vi=true;updateToggles();save();
 notify("Cô nhắc lại câu hỏi bằng phụ đề. Lượt này được ghi là có hỗ trợ.");
 $("answerInput").focus();
});
function replay(){state.step=0;state.done=false;state.history=[];state.attempts=0;state.hintUsed=false;state.draft="";state.examHelp=false;state.storyChoices={};state.storyBeats=[];state.vocabSeen=[];state.encounter=HSKEncounter.initial();state.encounterDraft="";state.worldSeen={};state.worldFocus={};state.skillSampler=HSKSkillSampler.initial();state.practiceOpen=false;state.solved=false;save();updateResumeLabel();renderStep();$("answerInput").focus();notify("Bắt đầu lại tập truyện. Thành tích cũ đã được đặt lại.")}
function retakeExam(){state.step=EXAM_START;state.done=false;state.history=state.history.slice(0,EXAM_START);state.attempts=0;state.hintUsed=false;state.draft="";state.examHelp=false;state.solved=false;state.practiceOpen=false;save();updateResumeLabel();renderStep();$("answerInput").focus();notify("Đã mở lại ba câu kiểm tra. Tiến độ câu chuyện vẫn được giữ.")}
$("retakeExamBtn").addEventListener("click",retakeExam);
$("resetGame").addEventListener("click",replay);$("replayBtn").addEventListener("click",replay);
document.addEventListener("keydown",function(e){
 if(e.defaultPrevented||e.isComposing||$("gameOverlay").hidden||document.querySelector("dialog[open]")||!$("aiTutorPanel").hidden)return;
 if(e.key==="Escape"){if(!$("notebookPanel").hidden){setNotebook(false);return}if(!$("sparrowWhisper").hidden){closeSparrow(true);return}if(!$("worldPanel").hidden){state.worldOpen=false;renderWorld();$("worldOpenBtn").focus();return}closeGame();return}
 if(e.key==="Tab"){var scope=$("notebookPanel").hidden?$("gameOverlay"):$("notebookPanel");var f=Array.from(scope.querySelectorAll("button:not([hidden]):not([disabled]),input:not([disabled]):not([hidden]),a[href],textarea:not([disabled])")).filter(function(el){return el.getClientRects().length>0});if(!f.length)return;var first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}
});
var keyboardFullHeight=window.innerHeight||0,keyboardViewportWidth=window.innerWidth||0;
function syncKeyboardLayout(target){
 var input=target===$("answerInput")||target===$("encounterInput")||target===$("aiTutorInput");
 var compactInput=window.matchMedia&&window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
 var shell=$("gameShell"),visible=window.visualViewport?window.visualViewport.height:window.innerHeight;
 var stillContracted=!!(compactInput&&shell.classList.contains("keyboard-open")&&visible<keyboardFullHeight-100);
 if(keyboardViewportWidth!==window.innerWidth){keyboardViewportWidth=window.innerWidth;if(!stillContracted)keyboardFullHeight=window.innerHeight||visible}
 if(!compactInput||!input&&!shell.classList.contains("keyboard-open"))keyboardFullHeight=visible;
 keyboardFullHeight=Math.max(keyboardFullHeight||0,visible||0);
 // Keep the contracted layout through input → button focus; a pointer click must not move its target.
 var open=!!(compactInput&&visible<keyboardFullHeight-100&&!$("gameOverlay").hidden);shell.classList.toggle("keyboard-open",open);
 if(open){shell.style.setProperty("--chimse-visible-height",Math.max(160,Math.floor(visible))+"px")}
 else shell.style.removeProperty("--chimse-visible-height");
}
document.addEventListener("focusin",function(e){if(e.target===$("answerInput")||e.target===$("aiTutorInput"))closeSparrow(false);syncKeyboardLayout(e.target)});
document.addEventListener("focusout",function(){setTimeout(function(){syncKeyboardLayout(document.activeElement)},0)});
if(window.visualViewport)window.visualViewport.addEventListener("resize",function(){syncKeyboardLayout(document.activeElement)});
window.addEventListener?.("resize",function(){syncKeyboardLayout(document.activeElement);if(!$("notebookPanel").hidden)renderNotebookPage()});
/* Direct handoff from the optional Chapter 00; existing learner saves are untouched. */
if(window.location&&typeof window.location.search==="string"&&window.location.search.indexOf("play=hsk1")>=0){
 try{
  var q=new URLSearchParams(window.location.search);
  if(q.get("play")==="hsk1"){
   if(window.history&&typeof window.history.replaceState==="function")window.history.replaceState(null,"",window.location.pathname+(window.location.hash||""));
   openGame();
  }
 }catch(e){/* Browser without URLSearchParams still allows the normal start button. */}
}
})();
