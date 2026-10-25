const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function loadModule(file,name){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box,{filename:file});return box.module.exports}
const C=loadModule("game-core.js"),M=loadModule("curriculum-data.js"),K=loadModule("learning-kit.js");
const html=fs.readFileSync(path.join(folder,"index.html"),"utf8"),source=fs.readFileSync(path.join(folder,"app.js"),"utf8");
const ids=Array.from(html.matchAll(/id="([^"]+)"/g),x=>x[1]);
function harness(sharedStorage={}){
 let dom={},document,spoken=[];function element(id){return {id,hidden:false,disabled:false,value:"",textContent:"",innerHTML:"",style:{},firstChild:{textContent:""},isConnected:true,children:[],attributes:{},listeners:{},
  classList:{s:new Set,add(k){this.s.add(k)},remove(k){this.s.delete(k)},contains(k){return this.s.has(k)},toggle(k){this.s.has(k)?this.s.delete(k):this.s.add(k)}},
  addEventListener(k,f){(this.listeners[k]??=[]).push(f)},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},getClientRects(){return [1]},
  setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},focus(){document.activeElement=this},
  click(){(this.listeners.click||[]).forEach(f=>f({preventDefault(){}}))},fire(k,args={}){(this.listeners[k]||[]).forEach(f=>f({preventDefault(){},...args}))}
 }}
 ids.forEach(id=>dom[id]=element(id));
 ["gameOverlay","notebookPanel","completionPane","assistBtn","nextBtn","sentenceBuilder","retakeExamBtn"].forEach(id=>dom[id].hidden=true);
 const nav=element("nav");
 document={body:{style:{}},activeElement:null,listeners:{},getElementById(id){if(!dom[id])throw Error("Missing DOM ID "+id);return dom[id]},querySelector(q){return q==="nav"?nav:null},createElement(tag){return element("new-"+tag)},querySelectorAll(){return []},addEventListener(k,f){(this.listeners[k]??=[]).push(f)}};
 const localStorage={getItem(k){return sharedStorage[k]||null},setItem(k,v){sharedStorage[k]=v}};
 const window={speechSynthesis:{cancel(){},getVoices(){return []},speak(u){spoken.push(u.text)}}};
 function SpeechSynthesisUtterance(text){this.text=text}
 vm.runInNewContext(source,{HSKCore:C,HSKCurriculum:M,HSKLearningKit:K,document,window,localStorage,setTimeout:()=>0,clearTimeout:()=>{},SpeechSynthesisUtterance,console},{filename:"app.js"});
 return {e:dom,document,sharedStorage,spoken}
}
test("story: sentence builder is helpful and notebook only shows past expressions",()=>{
 const t=harness(),e=t.e;e.startBtn.click();
 assert.equal(e.notebookPanel.hidden,true);
 e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,false);
 assert.ok(e.notebookWords.children.some(r=>r.children[0].textContent==="你好"));
 assert.ok(!e.notebookWords.children.some(r=>r.children[0].textContent==="面条"));
 e.notebookWords.children[0].click();assert.equal(t.spoken[0],"你好");
 e.notebookClose.click();
 ["我","很","好"].forEach(token=>e.tileList.children.find(b=>b.textContent===token).click());
 assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");assert.equal(e.nextBtn.hidden,false);
 assert.equal(JSON.parse(t.sharedStorage["hai-que-huong-progress-v3"]).history[0].hint,true);
});
test("story: save/resume preserves answer status and typed draft",()=>{
 const state={};let t=harness(state),e=t.e;e.startBtn.click();
 e.answerInput.value="我很好";e.answerInput.fire("input");
 t=harness(state);e=t.e;e.resumeBtn.click();assert.equal(e.answerInput.value,"我很好");
 e.answerForm.fire("submit");
 t=harness(state);e=t.e;e.resumeBtn.click();
 assert.equal(e.answerInput.disabled,true);assert.equal(e.nextBtn.hidden,false);
 assert.equal(e.dialogueText.textContent,"好，我们一起去看看新学校吧！");
});
test("story: exams hide notebook and builder, retain independent grading",()=>{
 const t=harness(),e=t.e;e.startBtn.click();
 const correct=["我很好","我叫安","我是学生","有三个学生","我想吃面条","谢谢","好","我叫安我是学生","十块钱","我想吃面条"];
 for(let i=0;i<correct.length;i++){
  assert.equal(e.stepText.textContent,String(i+1).padStart(2,"0")+" / 10");
  if(i===7){assert.equal(e.sentenceBuilder.hidden,true);e.notebookBtn.click();assert.equal(e.notebookPanel.hidden,true);}
  e.answerInput.value=correct[i];e.answerInput.fire("input");e.answerForm.fire("submit");
  assert.equal(e.nextBtn.hidden,false,"should solve "+i);
  e.nextBtn.click();
 }
 assert.equal(e.completionPane.hidden,false);
 assert.ok(e.summaryStats.textContent.includes("3/3 câu kiểm tra không cần trợ giúp"));
 e.retakeExamBtn.click();
 assert.equal(e.stepText.textContent,"08 / 10");
 assert.equal(e.sentenceBuilder.hidden,true);
});
