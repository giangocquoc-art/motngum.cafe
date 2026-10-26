const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
function code(f){return fs.readFileSync(path.join(root,f),"utf8")}
function load(f){const sandbox={module:{exports:{}}};vm.runInNewContext(code(f),sandbox);return sandbox.module.exports}
const D=load("intro-data.js"),C=load("intro-core.js");
const ids=[...code("nhap-mon.html").matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
function boot(store={}){
 let els={},doc,window;
 function e(id){return {id,className:"",textContent:"",innerHTML:"",value:"",disabled:false,style:{},children:[],listeners:{},
  classList:{set:new Set(),add(k){this.set.add(k)},remove(k){this.set.delete(k)},toggle(k,v){if(v===true)this.set.add(k);else if(v===false)this.set.delete(k);else if(this.set.has(k))this.set.delete(k);else this.set.add(k)},contains(k){return this.set.has(k)}},
  appendChild(c){this.children.push(c)},replaceChildren(){this.children=[]},
  addEventListener(k,fn){if(typeof fn!=="function")throw Error("Non-function listener "+id+" "+k);(this.listeners[k]??=[]).push(fn)},
  click(){for(const fn of this.listeners.click||[])fn({preventDefault(){}})},
  focus(){doc.activeElement=this}
 }}
 ids.forEach(id=>els[id]=e(id));doc={body:{textContent:""},createElement(tag){return e(tag)},getElementById(id){if(!els[id])throw Error("Missing DOM "+id);return els[id]}};
 window={scrollTo(){},confirm(){return true},location:{href:""},speechSynthesis:{cancel(){},speak(){}}};
 const ls={getItem(k){return store[k]??null},setItem(k,v){store[k]=v}};
 new Function("HSKIntroContent","HSKIntroCore","document","window","localStorage","SpeechSynthesisUtterance",code("intro.js"))(D,C,doc,window,ls,undefined);
 return {e:els,window,store,doc};
}
function saved(s){return JSON.parse(s.store[C.key])}
test("Intro story is navigable and saves progress without touching HSK1 storage",()=>{
 const storage={"hai-que-huong-progress-v3":"unchanged-hsk1-save"};
 let t=boot(storage),e=t.e;
 assert.equal(e.position.textContent,"TRANG 01 / 09");
 assert.equal(e.interactive.children[0].children.length,4);
 e.interactive.children[0].children[0].click();
 assert.deepEqual(saved(t).discovered,["人"]);
 e.nextBtn.click();assert.equal(e.mainGlyph.textContent,"一 二 三");
 e.interactive.children[2].children[0].click();
 assert.equal(saved(t).stroke,1);assert.equal(e.mainGlyph.textContent,"一");
 t=boot(storage);e=t.e;assert.equal(e.mainGlyph.textContent,"一");
 e.nextBtn.click();assert.equal(e.mainGlyph.textContent,"木");
 e.interactive.children[0].children[1].click();assert.equal(e.mainGlyph.textContent,"林");
 e.nextBtn.click();e.interactive.children[0].children[2].click();assert.equal(e.mainGlyph.textContent,"众");
 assert.equal(storage["hai-que-huong-progress-v3"],"unchanged-hsk1-save");
});
test("Intro explains semantic and phonetic parts, and distinguishes rare-character joke",()=>{
 const t=boot(),e=t.e;
 for(let i=0;i<4;i++)e.nextBtn.click();
 assert.equal(e.position.textContent,"TRANG 05 / 09");
 e.interactive.children[0].children[0].click();
 e.interactive.children[0].children[2].click();
 assert.deepEqual(saved(t).lightParts,["日","月"]);
 e.nextBtn.click();
 assert.ok(e.storyTip.textContent.includes("gợi âm"));
 e.interactive.children[1].click();assert.equal(saved(t).momRevealed,true);
 e.nextBtn.click();e.interactive.children[1].children[1].click();
 assert.equal(saved(t).legendRead,true);
 assert.ok(e.interactive.children.some(x=>x.children.some(c=>c.textContent==="奻")));
});
test("Intro four low-stakes visual guesses can be played through and revisited",()=>{
 const t=boot(),e=t.e;
 for(let i=0;i<7;i++)e.nextBtn.click();
 assert.equal(e.position.textContent,"TRANG 08 / 09");
 for(let i=0;i<4;i++){
  const q=D.quizzes[i];const grid=e.interactive.children.find(x=>x.className==="quiz-choices");
  grid.children[q.answer].click();e.nextBtn.click();
 }
 assert.equal(saved(t).quizIndex,4);
 e.nextBtn.click();
 assert.equal(e.position.textContent,"TRANG 09 / 09");assert.equal(saved(t).finished,true);
 assert.ok(e.interactive.children[0].children.some(x=>x.href==="/#hanh-trinh"));
 e.backBtn.click();assert.equal(e.position.textContent,"TRANG 08 / 09");
});
test("Intro reset affects only independent introduction key, never the HSK save",()=>{
 const t=boot({"hai-que-huong-progress-v3":"existing-hsk1"});
 t.e.nextBtn.click();t.e.resetBtn.click();
 assert.equal(saved(t).step,0);assert.equal(t.store["hai-que-huong-progress-v3"],"existing-hsk1");
});
test("Intro cannot auto-count speech or quiz answers as official HSK progress",()=>{
 const t=boot(),e=t.e;
 e.hearBtn.click();
 assert.equal(t.store["hai-que-huong-progress-v3"],undefined);
 assert.equal(t.store[C.key],undefined);
});
