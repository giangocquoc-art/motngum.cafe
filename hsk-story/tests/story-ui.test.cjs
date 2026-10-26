const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function loadModule(file,name){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box,{filename:file});return box.module.exports}
const C=loadModule("game-core.js"),M=loadModule("curriculum-data.js"),K=loadModule("learning-kit.js"),D=loadModule("story-director.js"),B=loadModule("story-beats.js"),Content=loadModule("content-manifest.js"),E=loadModule("active-encounter.js"),Graph=loadModule("story-graph.js"),Runtime=loadModule("story-runtime.js"),Art=loadModule("scene-art.js"),IO=loadModule("save-io.js"),World=loadModule("scene-world.js"),Skills=loadModule("skill-sampler.js"),Threads=loadModule("story-threads.js");
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8"),source=fs.readFileSync(path.join(folder,"app.js"),"utf8");
const ids=Array.from(html.matchAll(/id="([^"]+)"/g),x=>x[1]);
function dismissStory(e){if(!e.skillPanel.hidden){e.skillSkip.click();e.skillSkip.click()}if(!e.storyInterlude.hidden)e.interludeContinue.click()}
function finishEncounter(e,routeIndex=0){
 if(e.encounterPanel.hidden)return;
 e.encounterActions.children[0].click();e.encounterActions.children[1].click();
 e.encounterActions.children[routeIndex].click();
 e.encounterInput.value="我叫安";e.encounterInput.fire("input");e.encounterAnswerForm.fire("submit");
 e.encounterContinue.click();
}
function harness(sharedStorage={},options={}){
 let dom={},document,spoken=[];function element(id){return {id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",style:{},dataset:{},firstChild:{textContent:""},isConnected:true,children:[],attributes:{},listeners:{},
  classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)},toggle(k){this.s.has(k)?this.s.delete(k):this.s.add(k)}},
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},getClientRects(){return [1]},
  setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){document.activeElement=this},
  click(){(this.listeners.click||[]).forEach(f=>f({preventDefault(){}}))},fire(k,args={}){(this.listeners[k]||[]).forEach(f=>f({preventDefault(){},...args}))}
 }}
 ids.forEach(id=>dom[id]=element(id));
 ["gameOverlay","notebookPanel","completionPane","assistBtn","nextBtn","sentenceBuilder","retakeExamBtn","storyChoicePanel","storyChoiceOutcome","storyBeat","storyEcho","storyInterlude","vocabRevealBtn","learningStrip","encounterPanel","encounterAnswerForm","encounterContinue","encounterHint","encounterSample","skillPanel","skillListen","practiceOpenBtn","worldPanel"].forEach(id=>dom[id].hidden=true);
 const nav=element("nav");
 document={body:{style:{}},activeElement:null,listeners:{},getElementById(id){if(!dom[id])throw Error("Missing DOM ID "+id);return dom[id]},querySelector(q){return q==="nav"?nav:null},createElement(tag){return element("new-"+tag)},querySelectorAll(){return []},addEventListener(k,f){(this.listeners[k]??=[]).push(f)}};
 const localStorage={getItem(k){return sharedStorage[k]||null},setItem(k,v){sharedStorage[k]=v}};
 const window={speechSynthesis:{cancel(){},getVoices(){return []},speak(u){spoken.push(u.text);if(options.audioFailure){u.onerror?.({error:"synthesis-failed"})}else if(!options.audioNeverEnds){u.onend?.()}}}};
 if(options.autoStart){
  window.location={search:"?play=hsk1",pathname:"/",hash:""};
  window.history={replaceState(_x,_title,path){window.lastReplacedPath=path}};
 }
 function SpeechSynthesisUtterance(text){this.text=text}
 vm.runInNewContext(source,{HSKCore:C,HSKCurriculum:M,HSKLearningKit:K,HSKStoryDirector:D,HSKStoryBeats:B,HSKContent:Content,HSKEncounter:E,HSKStoryGraph:Graph,HSKStoryRuntime:Runtime,HSKSceneArt:Art,HSKSaveIO:IO,HSKSceneWorld:World,HSKSkillSampler:Skills,HSKStoryThreads:Threads,document,window,localStorage,setTimeout:()=>0,clearTimeout:()=>{},SpeechSynthesisUtterance,URLSearchParams,console},{filename:"app.js"});
 return {e:dom,document,sharedStorage,spoken,window}
}
test("story: sentence builder is helpful and notebook only shows past expressions",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.notebookPanel.hidden,true);
 e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,false);
 assert.equal(e.notebookWords.children.length,0); // current unexposed answer must not leak
 assert.ok(!e.notebookWords.children.some(r=>r.children[0].textContent==="面条"));
 e.notebookClose.click();
 e.hintBtn.click();e.notebookBtn.click();
 assert.ok(e.notebookWords.children.some(r=>r.children[0].textContent==="你好"));
 e.notebookWords.children[0].click();assert.equal(t.spoken[0],"你好");e.notebookClose.click();
 assert.equal(e.sentenceBuilder.hidden,true);assert.equal(e.openBuilderBtn.hidden,false);
 e.openBuilderBtn.click();assert.equal(e.sentenceBuilder.hidden,false);
 ["我","很","好"].forEach(token=>e.tileList.children.find(b=>b.textContent===token).click());
 assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");assert.equal(e.nextBtn.hidden,false);
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history[0].hint,true);
});
test("story: save/resume preserves answer status and typed draft",()=>{
 const state={};let t=harness(state),e=t.e;e.startBtn.click();
 dismissStory(e);e.answerInput.value="我很好";e.answerInput.fire("input");
 t=harness(state);e=t.e;e.resumeBtn.click();assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");
 t=harness(state);e=t.e;e.resumeBtn.click();
 assert.equal(e.answerInput.disabled,true);assert.equal(e.nextBtn.hidden,false);
 assert.equal(e.dialogueText.textContent,"好，我们一起去看看新学校吧！");
});
test("story: exams hide notebook and builder, retain independent grading",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const correct=["我很好","我叫安","我是学生","有三个学生","我想吃面条","谢谢","好","我叫安我是学生","十块钱","我想吃面条"];
 for(let i=0;i<correct.length;i++){
  finishEncounter(e);dismissStory(e);
  assert.equal(e.stepText.textContent,String(i+1).padStart(2,"0")+" / 10");
  if(i===7){assert.equal(e.sentenceBuilder.hidden,true);e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,true);}
  e.answerInput.value=correct[i];e.answerInput.fire("input");e.answerForm.fire("submit");
  if(i===2||i===4){assert.equal(e.nextBtn.hidden,true);assert.equal(e.storyChoicePanel.hidden,false);e.storyChoiceOptions.children[0].click();}
  assert.equal(e.nextBtn.hidden,false,"should solve "+i);
  e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.summaryStats.textContent.includes("3/3 câu kiểm tra không cần trợ giúp"));
 e.retakeExamBtn.click();
 assert.equal(e.stepText.textContent,"08 / 10");
 assert.equal(e.sentenceBuilder.hidden,true);
});

test('story memory survives browser refresh and changes the next scene',()=>{
 const st={};let t=harness(st),e=t.e;e.startBtn.click();dismissStory(e);
 const answers=['我很好','我叫安','我是学生','有三个学生','我想吃面条'];
 for(let i=0;i<answers.length;i++){
  finishEncounter(e);dismissStory(e);
  e.answerInput.value=answers[i];e.answerInput.fire('input');e.answerForm.fire('submit');
  if(i===2){assert.equal(e.nextBtn.hidden,true);e.storyChoiceOptions.children[1].click();}
  if(i===4)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.ok(e.storyBeat.textContent.includes('刘奶奶'));
 assert.equal(JSON.parse(st['hai-que-huong-progress-v3']).storyChoices.friendship,'ask-teacher');
 t=harness(st);e=t.e;e.resumeBtn.click();assert.ok(e.storyBeat.textContent.includes('刘奶奶'));
 e.notebookBtn.click();assert.ok(e.storyMemory.textContent.includes('cô Vương'));
});

test('V6 prologue blocks quiz until acknowledged and resumes after reload',()=>{
 const saved={};let t=harness(saved),e=t.e;e.startBtn.click();
 assert.equal(e.storyInterlude.hidden,false);assert.equal(e.answerForm.hidden,true);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 assert.equal(e.nextBtn.hidden,true);
 t=harness(saved);e=t.e;e.resumeBtn.click();
 assert.equal(e.storyInterlude.hidden,false);
 e.interludeContinue.click();
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.answerForm.hidden,false);
 assert.equal(e.learningStrip.hidden,true);
 assert.equal(e.vocabRevealBtn.hidden,true);
});
test('V6 scene help stays on demand and is recorded as assisted',()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.notebookBtn.click();assert.equal(e.notebookWords.children.length,0);e.notebookClose.click();
 assert.equal(e.vocabRevealBtn.hidden,true);e.hintBtn.click();assert.equal(e.feedback.textContent.startsWith("Gợi ý:"),true);
 assert.equal(JSON.parse(t.sharedStorage['hai-que-huong-progress-v3']).hintUsed,true);
 e.answerInput.value='我很好';e.answerForm.fire('submit');
 assert.ok(e.feedback.textContent.includes('sau hỗ trợ'));
});

test('V6 reading a story page before exam does not create fake exam help',()=>{
 const st={};
 st['hai-que-huong-progress-v3']=JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:'correct',hint:false,attempts:0})),storyBeats:['arrival','gate','lunch','way-home'],skillSampler:{status:'legacy'}});
 const t=harness(st),e=t.e;e.startBtn.click();
 assert.equal(e.storyInterlude.hidden,false);
 e.toggleVietnamese.click();
 assert.equal(JSON.parse(st['hai-que-huong-progress-v3']).hintUsed,false);
 e.interludeContinue.click();
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.pinyinText.hidden,true);
 assert.equal(e.vietText.hidden,true);
});

test('V6 story narration playback and keyboard focus follow the visible page',()=>{
 const t=harness(),e=t.e;e.startBtn.click();
 assert.equal(t.document.activeElement.id,'interludeContinue');
 e.listenBtn.click();assert.equal(t.spoken[0],'妈妈说：“别着急。”');
 e.interludeContinue.click();
 assert.equal(t.document.activeElement.id,'answerInput');
 e.listenBtn.click();assert.equal(t.spoken[1],'安，我们到了。你好吗？');
});

test("V7 phrase suggestions cannot leak before learner opts in",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.sentenceBuilder.hidden,true);
 assert.equal(e.openBuilderBtn.hidden,false);
 assert.equal(e.learningStrip.hidden,true);
 e.answerInput.value="我很好";e.answerInput.fire("input");e.answerForm.fire("submit");
 const saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.history[0].hint,false);
});
test("V7 opening phrase suggestions always counts as help before typing",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.openBuilderBtn.click();
 assert.equal(e.sentenceBuilder.hidden,false);
 assert.equal(e.openBuilderBtn.hidden,true);
 const pre=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(pre.hintUsed,true);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history[0].hint,true);
});
test("V7 checkpoint never exposes construction hints",()=>{
 const s={'hai-que-huong-progress-v3':JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",attempts:0,hint:false})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(s),e=t.e;e.startBtn.click();
 assert.equal(e.openBuilderBtn.hidden,true);
 assert.equal(e.sentenceBuilder.hidden,true);
 e.openBuilderBtn.click();
 assert.notEqual(JSON.parse(s["hai-que-huong-progress-v3"]).hintUsed,true);
});

test("V8 lost notebook episode requires observed clues and retrievable personal introduction",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 const learned=["我很好","我叫安","我是学生","有三个学生"];
 for(let i=0;i<4;i++){
  dismissStory(e);e.answerInput.value=learned[i];e.answerForm.fire("submit");
  if(i===2)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.equal(e.stepText.textContent,"05 / 10");assert.equal(e.encounterPanel.hidden,false);
 assert.equal(e.answerForm.hidden,true);assert.equal(e.encounterActions.children.length,3);
 e.answerInput.value="我想吃面条";e.answerForm.fire("submit");
 assert.equal(e.encounterPanel.hidden,false);
 e.encounterActions.children[0].click();
 assert.equal(e.encounterActions.children.length,3);
 e.encounterActions.children[1].click();
 assert.equal(e.encounterActions.children.length,2);
 e.encounterActions.children[1].click();
 assert.equal(e.encounterAnswerForm.hidden,false);
 assert.ok(e.encounterBody.textContent.includes("Vương"));
 e.encounterInput.value="我叫安";e.encounterInput.fire("input");
 let saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.encounterDraft,"我叫安");assert.equal(saved.encounter.stage,"respond");
 e.encounterAnswerForm.fire("submit");saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.encounter.answer,"independent");
 assert.equal(e.encounterContinue.hidden,false);
 e.encounterContinue.click();
 assert.equal(e.encounterPanel.hidden,true);
 assert.equal(e.storyInterlude.hidden,false);
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history.length,4);
});
test("V8 transfer encounter can resume a route and preserves distinction from classroom examination",()=>{
 const storage={};
 let t=harness(storage),e=t.e;e.startBtn.click();dismissStory(e);
 for(const [i,answer] of ["我很好","我叫安","我是学生","有三个学生"].entries()){
  dismissStory(e);e.answerInput.value=answer;e.answerForm.fire("submit");
  if(i===2)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 e.encounterActions.children[0].click();e.encounterActions.children[1].click();
 e.encounterActions.children[0].click();
 e.encounterInput.value="我不叫安";e.encounterInput.fire("input");e.encounterAnswerForm.fire("submit");
 assert.equal(JSON.parse(storage["hai-que-huong-progress-v3"]).encounter.attempts,1);
 t=harness(storage);e=t.e;e.resumeBtn.click();
 assert.equal(e.encounterAnswerForm.hidden,false);
 assert.equal(e.encounterInput.value,"我不叫安");
 e.encounterHint.click();e.encounterInput.value="我叫安";e.encounterAnswerForm.fire("submit");
 assert.equal(JSON.parse(storage["hai-que-huong-progress-v3"]).encounter.answer,"helped");
 e.encounterContinue.click();dismissStory(e);
 const remaining=["我想吃面条","谢谢","好","我叫安我是学生","十块钱","我想吃面条"];
 for(let i=0;i<remaining.length;i++){
  dismissStory(e);e.answerInput.value=remaining[i];e.answerForm.fire("submit");
  if(i===0)e.storyChoiceOptions.children[0].click();
  e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.summaryStats.textContent.includes("3/3 câu kiểm tra không cần trợ giúp"));
 assert.ok(e.encounterSummary.textContent.includes("đúng nhờ gợi ý"));
 assert.ok(e.episodeEnding.textContent.includes("Mẹ")===false||e.episodeEnding.textContent.includes("An"));
});
test("V8 migrates V7 completed story without forcing new content replay",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:9,done:true,history:Array.from({length:10},()=>({status:"correct",attempts:0,hint:false})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.completionPane.hidden,false);
 assert.equal(e.encounterPanel.hidden,true);
 assert.ok(e.encounterSummary.textContent.includes("bỏ qua"));
 e.retakeExamBtn.click();assert.equal(JSON.parse(store["hai-que-huong-progress-v3"]).encounter.stage,"legacy");
});

test("V9 stable scene reference is persisted and existing V8 save still resumes correctly",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:2,history:[{status:"correct",hint:false,attempts:0},{status:"correct",hint:false,attempts:0}],storyBeats:["arrival","gate"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.stepText.textContent,"03 / 10");
 e.answerInput.value="我是学生";e.answerForm.fire("submit");
 e.storyChoiceOptions.children[0].click();
 const saved=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(saved.sceneRef,"hsk1.e01.xiaoyu-friendship");
 assert.equal(saved.history.length,3);
});
test("V9 inspecting scene objects adds notebook atmosphere but no learner score",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldActions.children.length,3);
 e.worldActions.children[0].click();
 const saved=JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]);
 assert.equal(saved.worldSeen["hsk1.e01.arrival-greeting"].length,1);
 assert.equal(saved.history.length,0);
 e.worldActions.children[0].click();
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).worldSeen["hsk1.e01.arrival-greeting"].length,1);
});
test("V10 real reading and browser-synthesized listening practice remain separate from school scores",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 assert.equal(e.practiceOpenBtn.hidden,false);
 e.practiceOpenBtn.click();
 assert.equal(e.skillPanel.hidden,false);
 assert.equal(e.answerForm.hidden,true);
 assert.equal(e.skillOptions.children.length,3);
 e.skillOptions.children[0].click();
 assert.equal(e.skillPanel.hidden,false);
 assert.ok(e.skillStep.textContent.includes("Nghe hiểu"));
 e.skillListen.click();
 e.skillOptions.children[1].click();
 const saved=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(saved.skillSampler.status,"done");
 assert.equal(saved.skillSampler.results[0].result,"correct");
 assert.equal(saved.skillSampler.results[1].result,"correct");
 assert.equal(saved.history.length,7);
 assert.equal(e.storyInterlude.hidden,true);
 assert.equal(e.answerForm.hidden,false);
});
test("V10 unsupported audio is explicitly unassessed; checkpoint retake retains skill evidence",()=>{
 const store={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(store),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillSkip.click();
 e.skillOptions.children[1].click();
 let state=JSON.parse(store["hai-que-huong-progress-v3"]);
 assert.equal(state.skillSampler.results[0].result,"unassessed");
 assert.equal(state.skillSampler.results[1].result,"unassessed");
 assert.equal(e.skillPanel.hidden,true);
 for(const answer of ["我叫安我是学生","十块钱","我想吃面条"]){
  e.answerInput.value=answer;e.answerForm.fire("submit");e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.skillSummary.textContent.includes("unassessed"));
 e.retakeExamBtn.click();
 assert.equal(JSON.parse(store["hai-que-huong-progress-v3"]).skillSampler.status,"done");
});

test("Chapter 00 direct handoff opens existing HSK1 episode without overwriting old progress",()=>{
 const stored={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:1,history:[{status:"correct",attempts:0,hint:false}],storyBeats:["arrival"]}),
  "hai-que-huong-intro-v1":JSON.stringify({step:8,maxReached:8,finished:true})};
 const before=stored["hai-que-huong-intro-v1"],t=harness(stored,{autoStart:true});
 assert.equal(t.e.gameOverlay.hidden,false);
 assert.equal(t.e.stepText.textContent,"02 / 10");
 assert.equal(t.window.lastReplacedPath,"/");
 assert.equal(stored["hai-que-huong-intro-v1"],before);
});

test("V4 shadow has verified V3 source, but old save remains the actual source of truth",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.answerInput.value="我很好";e.answerForm.fire("submit");
 const v3=t.sharedStorage["hai-que-huong-progress-v3"],v4=JSON.parse(t.sharedStorage["hai-que-huong-progress-v4"]);
 assert.equal(v4.v,4);assert.equal(v4.sceneRef,"hsk1.e01.arrival-greeting");
 assert.equal(Runtime.validateShadow(v4,v3,Graph),true);
 assert.equal(JSON.parse(v3).history.length,1);
 t.sharedStorage["hai-que-huong-progress-v4"]=JSON.stringify({...v4,sceneRef:"hsk5.graduation"});
 assert.equal(Runtime.readShadow({getItem:k=>t.sharedStorage[k]},"hai-que-huong-progress-v3",Graph),null);
 const resumed=harness(t.sharedStorage),e2=resumed.e;e2.resumeBtn.click();
 assert.equal(e2.stepText.textContent,"01 / 10"); // V3 not poisoned by tampered shadow
});
test("Listening sample needs speech completion event; queued-only speech is unassessed",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save,{audioNeverEnds:true}),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillOptions.children[0].click();e.skillListen.click();e.skillOptions.children[1].click();
 const st=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(st.skillSampler.results[1].result,"unassessed");
});
test("Failed browser speech never grants listening credit",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save,{audioFailure:true}),e=t.e;e.resumeBtn.click();
 e.practiceOpenBtn.click();e.skillOptions.children[0].click();e.skillListen.click();e.skillOptions.children[1].click();
 const st=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(st.skillSampler.results[1].result,"unassessed");
});

test("Optional practice never gates the teacher's actual checkpoint and can be closed preserving draft",()=>{
 const stored={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(stored),e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,true);
 assert.equal(e.answerForm.hidden,false);
 assert.equal(e.practiceOpenBtn.hidden,false);
 e.answerInput.value="我叫";e.answerInput.fire("input");
 e.practiceOpenBtn.click();
 assert.equal(e.skillPanel.hidden,false);assert.equal(e.answerForm.hidden,true);
 assert.equal(JSON.parse(stored["hai-que-huong-progress-v3"]).practiceOpen,true);
 e.practiceCloseBtn.click();
 assert.equal(e.skillPanel.hidden,true);assert.equal(e.answerInput.value,"我叫");
 assert.equal(JSON.parse(stored["hai-que-huong-progress-v3"]).practiceOpen,false);
 e.answerInput.value="我叫安我是学生";e.answerForm.fire("submit");
 assert.equal(e.nextBtn.hidden,false);
 e.nextBtn.click();
 assert.equal(e.stepText.textContent,"09 / 10");
 const state=JSON.parse(stored["hai-que-huong-progress-v3"]);
 assert.equal(state.skillSampler.status,"pending");
 assert.equal(state.history.length,8);
});
test("Optional sampler in progress resumes only when learner actually opened it",()=>{
 const saved={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home","school-test"],practiceOpen:true})};
 let t=harness(saved),e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,false);
 e.practiceCloseBtn.click();
 t=harness(saved);e=t.e;e.resumeBtn.click();
 assert.equal(e.skillPanel.hidden,true);
 assert.equal(e.answerForm.hidden,false);
});

test("Gate3B inspecting street object shows Hanzi bridge and preserves selected object on V3/V4 reload",()=>{
 const storage={"hai-que-huong-intro-v1":JSON.stringify({maxReached:5,discovered:["日","木"],momRevealed:true,lightParts:["日","月"]})};
 let t=harness(storage),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldBridge.textContent,"");
 e.worldActions.children[0].click();
 assert.ok(e.worldBridge.textContent.includes("日"));
 assert.ok(e.worldBridge.textContent.includes("Bạn từng nhìn thấy"));
 assert.ok(e.worldBridge.textContent.includes("Không tính điểm"));
 let state=JSON.parse(storage["hai-que-huong-progress-v3"]);
 assert.equal(state.worldFocus["hsk1.e01.arrival-greeting"],"window");
 assert.equal(state.history.length,0);
 const shadow=JSON.parse(storage["hai-que-huong-progress-v4"]);
 assert.equal(shadow.memory.worldFocus["hsk1.e01.arrival-greeting"],"window");
 t=harness(storage);e=t.e;e.resumeBtn.click();dismissStory(e);e.worldOpenBtn.click();
 assert.ok(e.worldBridge.textContent.includes("日"));
 assert.ok(e.worldDescription.textContent.includes("Ngoài cửa xe"));
});
test("Gate3B scene observation never leaks a previous scene description into unrelated scene",()=>{
 const storage={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:6,history:Array.from({length:6},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch","way-home"],worldSeen:{"hsk1.e01.arrival-greeting":["window","diary"]},worldFocus:{"hsk1.e01.arrival-greeting":"window"}})};
 const t=harness(storage),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.worldPanel.hidden,true);e.worldOpenBtn.click();assert.equal(e.worldPanel.hidden,false);
 assert.equal(e.worldBridge.textContent,"");
 assert.ok(e.worldDescription.textContent.includes("Chọn một đồ vật"));
 e.worldActions.children[0].click();
 assert.ok(e.worldDescription.textContent.includes("Sáng nay An"));
 const state=JSON.parse(storage["hai-que-huong-progress-v3"]);
 assert.equal(state.history.length,6);
 assert.equal(state.worldSeen["hsk1.e01.walk-home"].length,1);
 assert.equal(state.worldFocus["hsk1.e01.walk-home"],"tree");
});

test("Gate 4 roadmap HSK2–5 are non-interactive content; HSK1 remains keyboard-operable",()=>{
 const t=harness(),nodes=t.e.chapterGrid.children;
 assert.equal(nodes.length,5);
 assert.equal(nodes[0].role,"button");
 assert.equal(nodes[0].tabIndex,0);
 for(const card of nodes.slice(1)){
  assert.equal(card.attributes["aria-disabled"],"true");
  assert.equal((card.listeners.click||[]).length,0);
  assert.equal((card.listeners.keydown||[]).length,0);
 }
 nodes[0].click();assert.equal(t.e.gameOverlay.hidden,false);
});

test("Gate5 authored teacher greeting echo appears only after the prior mother greeting is resolved",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:1,history:[{status:"correct",attempts:0,hint:false}],storyBeats:["arrival"]})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.storyEcho.hidden,false);
 assert.ok(e.storyEcho.textContent.includes("你好"));
 assert.ok(e.storyEcho.textContent.includes("không chấm điểm"));
 const existing=JSON.parse(save["hai-que-huong-progress-v3"]);
 assert.equal(existing.history.length,1);
});
test("Gate5 friendship and noodle choices reappear in scene six, after actual earlier answers",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:6,history:Array.from({length:6},()=>({status:"correct",hint:false,attempts:0})),storyBeats:["arrival","gate","lunch"],storyChoices:{friendship:"ask-teacher","noodle-taste":"mild"},encounter:{stage:"done",inspected:["desk","bag"],route:"friend",answer:"independent"}})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 assert.equal(e.storyEcho.hidden,false);
 assert.ok(e.storyEcho.textContent.includes("Tiểu Vũ"));
 assert.ok(e.storyEcho.textContent.includes("bà Lưu"));
 assert.ok(e.storyEcho.textContent.includes("sổ"));
 assert.ok(!e.storyEcho.textContent.includes("điểm thi HSK"));
});
test("Gate5 notebook language thread separates context exposure and independent assessment",()=>{
 const save={"hai-que-huong-progress-v3":JSON.stringify({v:3,step:9,history:[...Array.from({length:8},()=>({status:"correct",hint:false,attempts:0})),{status:"assisted",hint:true,attempts:2}],storyBeats:["arrival","gate","lunch","way-home","school-test"]})};
 const t=harness(save),e=t.e;e.resumeBtn.click();dismissStory(e);
 e.notebookBtn.click();
 // Exam blocks notebook until current test solved, so use completed prior test note without forcing exam.
 assert.equal(e.notebookPanel.hidden,true);
 const rows=Threads.trace(JSON.parse(save["hai-que-huong-progress-v3"]).history,{});
 const price=Array.from(rows).find(x=>x.id==="price");
 assert.equal(price.first,"seen-in-context");
 assert.equal(price.checkpoint,"sample");
 assert.equal(e.storyEcho.hidden,true);
});
