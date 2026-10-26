const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function loadModule(file,name){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box,{filename:file});return box.module.exports}
const C=loadModule("game-core.js"),M=loadModule("curriculum-data.js"),K=loadModule("learning-kit.js"),D=loadModule("story-director.js"),B=loadModule("story-beats.js"),Content=loadModule("content-manifest.js"),E=loadModule("active-encounter.js"),Graph=loadModule("story-graph.js"),World=loadModule("scene-world.js"),Skills=loadModule("skill-sampler.js");
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
 let dom={},document,spoken=[];function element(id){return {id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",style:{},firstChild:{textContent:""},isConnected:true,children:[],attributes:{},listeners:{},
  classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)},toggle(k){this.s.has(k)?this.s.delete(k):this.s.add(k)}},
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},getClientRects(){return [1]},
  setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){document.activeElement=this},
  click(){(this.listeners.click||[]).forEach(f=>f({preventDefault(){}}))},fire(k,args={}){(this.listeners[k]||[]).forEach(f=>f({preventDefault(){},...args}))}
 }}
 ids.forEach(id=>dom[id]=element(id));
 ["gameOverlay","notebookPanel","completionPane","assistBtn","nextBtn","sentenceBuilder","retakeExamBtn","storyChoicePanel","storyChoiceOutcome","storyBeat","storyInterlude","vocabRevealBtn","learningStrip","encounterPanel","encounterAnswerForm","encounterContinue","encounterHint","encounterSample","skillPanel","skillListen","worldPanel"].forEach(id=>dom[id].hidden=true);
 const nav=element("nav");
 document={body:{style:{}},activeElement:null,listeners:{},getElementById(id){if(!dom[id])throw Error("Missing DOM ID "+id);return dom[id]},querySelector(q){return q==="nav"?nav:null},createElement(tag){return element("new-"+tag)},querySelectorAll(){return []},addEventListener(k,f){(this.listeners[k]??=[]).push(f)}};
 const localStorage={getItem(k){return sharedStorage[k]||null},setItem(k,v){sharedStorage[k]=v}};
 const window={speechSynthesis:{cancel(){},getVoices(){return []},speak(u){spoken.push(u.text)}}};
 if(options.autoStart){
  window.location={search:"?play=hsk1",pathname:"/",hash:""};
  window.history={replaceState(_x,_title,path){window.lastReplacedPath=path}};
 }
 function SpeechSynthesisUtterance(text){this.text=text}
 vm.runInNewContext(source,{HSKCore:C,HSKCurriculum:M,HSKLearningKit:K,HSKStoryDirector:D,HSKStoryBeats:B,HSKContent:Content,HSKEncounter:E,HSKStoryGraph:Graph,HSKSceneWorld:World,HSKSkillSampler:Skills,document,window,localStorage,setTimeout:()=>0,clearTimeout:()=>{},SpeechSynthesisUtterance,URLSearchParams,console},{filename:"app.js"});
 return {e:dom,document,sharedStorage,spoken,window}
}
test("story: sentence builder is helpful and notebook only shows past expressions",()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 assert.equal(e.notebookPanel.hidden,true);
 e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,false);
 assert.equal(e.notebookWords.children.length,0); // current unexposed answer must not leak
 assert.ok(!e.notebookWords.children.some(r=>r.children[0].textContent==="面条"));
 e.notebookClose.click();
 e.vocabRevealBtn.click();e.notebookBtn.click();
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
 assert.equal(e.vocabRevealBtn.hidden,false);
});
test('V6 vocabulary opt-in is recorded as assisted',()=>{
 const t=harness(),e=t.e;e.startBtn.click();dismissStory(e);
 e.notebookBtn.click();assert.equal(e.notebookWords.children.length,0);e.notebookClose.click();
 e.vocabRevealBtn.click();assert.equal(e.learningStrip.hidden,false);
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
 assert.equal(e.worldPanel.hidden,false);
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
 e.skillSkip.click();
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
