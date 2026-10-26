const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function loadModule(file,name){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box,{filename:file});return box.module.exports}
const C=loadModule("game-core.js"),M=loadModule("curriculum-data.js"),K=loadModule("learning-kit.js"),D=loadModule("story-director.js"),B=loadModule("story-beats.js"),Content=loadModule("content-manifest.js");
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8"),source=fs.readFileSync(path.join(folder,"app.js"),"utf8");
const ids=Array.from(html.matchAll(/id="([^"]+)"/g),x=>x[1]);
function dismissStory(e){if(!e.storyInterlude.hidden)e.interludeContinue.click()}
function harness(sharedStorage={}){
 let dom={},document,spoken=[];function element(id){return {id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",style:{},firstChild:{textContent:""},isConnected:true,children:[],attributes:{},listeners:{},
  classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)},toggle(k){this.s.has(k)?this.s.delete(k):this.s.add(k)}},
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},getClientRects(){return [1]},
  setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){document.activeElement=this},
  click(){(this.listeners.click||[]).forEach(f=>f({preventDefault(){}}))},fire(k,args={}){(this.listeners[k]||[]).forEach(f=>f({preventDefault(){},...args}))}
 }}
 ids.forEach(id=>dom[id]=element(id));
 ["gameOverlay","notebookPanel","completionPane","assistBtn","nextBtn","sentenceBuilder","retakeExamBtn","storyChoicePanel","storyChoiceOutcome","storyBeat","storyInterlude","vocabRevealBtn","learningStrip"].forEach(id=>dom[id].hidden=true);
 const nav=element("nav");
 document={body:{style:{}},activeElement:null,listeners:{},getElementById(id){if(!dom[id])throw Error("Missing DOM ID "+id);return dom[id]},querySelector(q){return q==="nav"?nav:null},createElement(tag){return element("new-"+tag)},querySelectorAll(){return []},addEventListener(k,f){(this.listeners[k]??=[]).push(f)}};
 const localStorage={getItem(k){return sharedStorage[k]||null},setItem(k,v){sharedStorage[k]=v}};
 const window={speechSynthesis:{cancel(){},getVoices(){return []},speak(u){spoken.push(u.text)}}};
 function SpeechSynthesisUtterance(text){this.text=text}
 vm.runInNewContext(source,{HSKCore:C,HSKCurriculum:M,HSKLearningKit:K,HSKStoryDirector:D,HSKStoryBeats:B,HSKContent:Content,document,window,localStorage,setTimeout:()=>0,clearTimeout:()=>{},SpeechSynthesisUtterance,console},{filename:"app.js"});
 return {e:dom,document,sharedStorage,spoken}
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
  dismissStory(e);
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
  dismissStory(e);
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
 st['hai-que-huong-progress-v3']=JSON.stringify({v:3,step:7,history:Array.from({length:7},()=>({status:'correct',hint:false,attempts:0})),storyBeats:['arrival','gate','lunch','way-home']});
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
