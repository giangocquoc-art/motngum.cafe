const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
function code(f){return fs.readFileSync(path.join(root,f),"utf8")}
function load(f){const sandbox={module:{exports:{}}};vm.runInNewContext(code(f),sandbox);return sandbox.module.exports}
test("phone introduction keeps the main audio action readable",()=>{
 const css=code("readability.css");
 assert.match(css,/@media \(max-width: 690px\)[\s\S]*?\.intro-screen \.hear\s*\{[^}]*min-height:\s*40px[^}]*font-size:\s*12px/s);
 assert.match(css,/\.intro-screen \.book-nav button\s*\{[^}]*min-height:\s*40px[^}]*font-size:\s*12px/s,
  "page navigation uses the actual parent structure and keeps a 40px hit area");
 assert.match(css,/\.intro-screen \.source-details a\s*\{[^}]*min-height:\s*32px[^}]*font-size:\s*12px/s,
  "expanded source links remain readable and easy to tap");
 assert.match(code("intro.css"),/@media\(max-width:690px\)[\s\S]*?\.intro-screen \.brand small\{display:none\}/,
  "the narrow intro header keeps the product name inside its fixed-height bar");
 assert.match(code("intro.css"),/\.intro-screen>\.topbar \.source-details\[open\]\{position:absolute!important;top:calc\(100% \+ 5px\)!important;right:9px!important;bottom:auto!important;max-height:calc\(100dvh - 64px\)!important\}/,
  "the open source note stays below the header and can use the available viewport height");
});
test("home review entry reads as a clear secondary action",()=>{
 const css=code("readability.css");
 assert.match(css,/\.sparrow-hero \.review-entry-button\s*\{[^}]*min-height:\s*44px[^}]*font-size:\s*14px\s*!important/s,
  "the review link should be visibly secondary but large enough to read and tap");
});
const D=load("intro-data.js"),C=load("intro-core.js");
const ids=[...code("nhap-mon.html").matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
function boot(store={}){
 let els={},doc,window;
 function e(id){return {id,className:"",textContent:"",innerHTML:"",value:"",disabled:false,style:{},children:[],listeners:{},
  classList:{set:new Set(),add(k){this.set.add(k)},remove(k){this.set.delete(k)},toggle(k,v){if(v===true)this.set.add(k);else if(v===false)this.set.delete(k);else if(this.set.has(k))this.set.delete(k);else this.set.add(k)},contains(k){return this.set.has(k)}},
  appendChild(c){this.children.push(c)},replaceChildren(){this.children=[]},
  setAttribute(k,v){(this.attributes??={})[k]=String(v)},
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
 assert.equal(e.interactive.children[0].children[0].children[1].textContent,"Chạm","unseen characters use a short one-word action so mobile options do not wrap into clipped cards");
 e.interactive.children[0].children[0].click();
 assert.deepEqual(saved(t).discovered,["人"]);
 assert.equal(e.mainGlyph.textContent,"人");assert.equal(e.mainPinyin.textContent,"rén");
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
 e.nextBtn.click();
 assert.equal(saved(t).legendRead,false);
 assert.equal(saved(t).curiosityOpen,false);
 assert.ok(!e.interactive.children.some(x=>x.className==="curiosity-details"));
 e.interactive.children[1].click();
 assert.equal(saved(t).legendRead,true);
 assert.equal(saved(t).curiosityOpen,true);
 assert.ok(e.interactive.children.some(x=>x.className==="curiosity-details"));
 assert.equal(e.mainGlyph.textContent,"女");
 for(let i=1;i<3;i++){
  const panel=e.interactive.children.find(x=>x.className==='curiosity-details');
  panel.children.find(x=>x.className==='curiosity-pages').children[2].click();
  assert.equal(e.mainGlyph.textContent,D.curiosity.examples[i].zi);
  const current=e.interactive.children.find(x=>x.className==='curiosity-details');
  assert.equal(current.children.find(x=>x.className==='curiosity-example').children[1].children[1].textContent,D.curiosity.examples[i].note);
  assert.equal(saved(t).step,6);
 }
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
 assert.match(e.nextBtn.textContent,/HSK 1/);e.nextBtn.click();assert.equal(t.window.location.href,"/?play=hsk1");
 e.backBtn.click();assert.equal(e.position.textContent,"TRANG 08 / 09");
});
test("Intro ending teaches the phrase shown in the scene instead of a different lesson",()=>{
 const t=boot(),e=t.e;for(let i=0;i<7;i++)e.nextBtn.click();for(let i=0;i<4;i++)e.nextBtn.click();e.nextBtn.click();
 const card=e.interactive.children.find(x=>x.className==="finish-card");assert.ok(card);
 const phrase=card.children.find(x=>x.className==="ending-phrase");
 assert.equal(phrase.children[0].textContent,"明天见！");
 assert.equal(phrase.children[1].textContent,"Míngtiān jiàn!");
 assert.equal(phrase.children.length,2,"show the translation after the learner makes a meaning choice");
 assert.match(D.stages[8].narrative,/Mẹ.*“明天见！”/);
 const question=card.children.find(x=>x.className==="ending-question");
 assert.match(question.textContent,/Mẹ vừa nói câu này/);
 const choices=card.children.find(x=>x.className==="quiz-choices ending-choices");
 assert.deepEqual(choices.children.map(x=>x.textContent),["Hẹn gặp ngày mai","Xin chào","Cảm ơn"]);
 choices.children[0].click();
 const answered=e.interactive.children.find(x=>x.className==="finish-card");
 assert.equal(answered.children.find(x=>x.className==="ending-phrase").children[2].textContent,"Hẹn gặp ngày mai!");
 const parts=answered.children.find(x=>x.className==="ending-breakdown");
 assert.deepEqual(parts.children.map(x=>x.children.map(y=>y.textContent)),[["明天","míngtiān","ngày mai"],["见","jiàn","gặp lại"]]);
 assert.match(answered.children.find(x=>x.className==="good ending-answer").textContent,/明天.*ngày mai.*见.*gặp lại/);
 assert.equal(e.learningTitle.textContent,"Hẹn gặp ngày mai");
 assert.equal(e.interactionLabel.textContent,"");
 assert.match(D.stages[8].tip,/明天 là ngày mai.*见 là gặp lại/);
 assert.doesNotMatch(answered.textContent,/你好吗|我很好|好 \(hǎo\)/,"the ending must teach the phrase shown in its scene");
});
test("Intro ending gently corrects a wrong meaning choice without adding score data",()=>{
 const t=boot(),e=t.e;for(let i=0;i<7;i++)e.nextBtn.click();for(let i=0;i<4;i++)e.nextBtn.click();e.nextBtn.click();
 const choices=e.interactive.children.find(x=>x.className==="finish-card").children.find(x=>x.className==="quiz-choices ending-choices");
 choices.children[1].click();
 const card=e.interactive.children.find(x=>x.className==="finish-card");
 assert.match(card.children.find(x=>x.className==="again ending-answer").textContent,/明天见.*Hẹn gặp ngày mai/);
 assert.deepEqual(Object.keys(saved(t).quizResults),["forest","crowd","mother","bright"],"ending recall is not folded into the low-stakes character guesses");
});
test("Visual-guess recap speaks gently without turning the story into a score panel",()=>{
 const t=boot(),e=t.e;for(let i=0;i<7;i++)e.nextBtn.click();
 for(let i=0;i<D.quizzes.length;i++){const q=D.quizzes[i];e.interactive.children.find(x=>x.className==="quiz-choices").children[q.answer].click();e.nextBtn.click()}
 assert.equal(e.position.textContent,"TRANG 08 / 09");
 assert.match(e.interactive.children[0].textContent,/An khép trang sổ lại/);
 assert.doesNotMatch(e.interactive.children[0].textContent,/nhận ra ngay \d|bỏ qua \d|đậu\/rớt/);
 assert.equal(e.interactive.children[1].textContent,"Thử lại mấy chữ này ↻");
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

test("Intro visual question stays on first answer and shows correction without fabricated first-try success",()=>{
 const t=boot(),e=t.e;for(let i=0;i<7;i++)e.nextBtn.click();
 const q=D.quizzes[0];assert.equal(e.mainGlyph.textContent,q.zi);
 e.interactive.children.find(x=>x.className==="quiz-choices").children[0].click();
 assert.equal(saved(t).quizResults.forest,0);
 assert.equal(saved(t).quizOutcomes.forest,"review");
 const options=e.interactive.children.find(x=>x.className==="quiz-choices").children;
 assert.equal(options.every(b=>b.disabled===true),true);
 options[q.answer].click(); // replayed click event cannot overwrite original answer
 assert.equal(saved(t).quizOutcomes.forest,"review");
 assert.equal(saved(t).quizResults.forest,0);
});
test("Intro skipping one question retains the remaining three visual questions",()=>{
 const t=boot(),e=t.e;for(let i=0;i<7;i++)e.nextBtn.click();
 e.nextBtn.click();
 assert.equal(saved(t).quizIndex,1);
 assert.equal(saved(t).quizOutcomes.forest,"skipped");
 assert.ok(e.storyHeading.textContent.includes("đoán"));
 assert.equal(e.mainGlyph.textContent,"众");
 e.interactive.children.find(x=>x.className==="quiz-choices").children[0].click();
 assert.equal(saved(t).quizOutcomes.crowd,"recognized");
});
test("Intro review-only action restarts guesses without resetting story discoveries",()=>{
 const t=boot(),e=t.e;e.interactive.children[0].children[0].click();
 for(let i=0;i<7;i++)e.nextBtn.click();
 for(let i=0;i<4;i++)e.nextBtn.click(); // skip one at a time
 assert.equal(saved(t).quizIndex,4);
 const review=e.interactive.children.find(x=>x.className==="secondary");
 assert.ok(review);review.click();
 assert.equal(saved(t).quizIndex,0);
 assert.deepEqual(saved(t).discovered,["人"]);
 assert.equal(saved(t).step,7);
});

test("Gate3B: optional Hanzi curiosity can be bypassed without loading archaic meanings or changing page count",()=>{
 const t=boot(),e=t.e;for(let i=0;i<6;i++)e.nextBtn.click();
 assert.equal(saved(t).step,6);assert.equal(saved(t).curiosityOpen,false);
 assert.equal(e.mainGlyph.textContent,"安");
 assert.equal(e.interactive.children.find(x=>x.className==="curiosity-details"),undefined);
 e.nextBtn.click();
 assert.equal(saved(t).step,7);assert.equal(saved(t).legendRead,false);
 assert.equal(e.mainGlyph.textContent,"林");
});
test("Gate3B: curiosity opens/closes returning to the same page, retaining progress and HSK1 save",()=>{
 const store={"hai-que-huong-progress-v3":"preserved-hsk1"};
 const t=boot(store),e=t.e;
 for(let i=0;i<6;i++)e.nextBtn.click();
 e.interactive.children[1].click();
 assert.equal(saved(t).step,6);assert.equal(saved(t).curiosityOpen,true);
 assert.equal(saved(t).legendRead,true);
 const panel=e.interactive.children.find(x=>x.className==="curiosity-details");
 assert.ok(panel);
 assert.ok(panel.children.some(x=>x.className==="curiosity-example"));
 panel.children[panel.children.length-1].click();
 assert.equal(saved(t).curiosityOpen,false);
 assert.equal(saved(t).step,6);
 assert.equal(e.mainGlyph.textContent,"安");
 assert.equal(store["hai-que-huong-progress-v3"],"preserved-hsk1");
 e.interactive.children[1].click();
 const reopened=boot(store);
 assert.equal(reopened.e.mainGlyph.textContent,"女");
 assert.equal(saved(reopened).curiosityOpen,true);
 reopened.e.nextBtn.click();
 assert.equal(saved(reopened).curiosityOpen,false);
 assert.equal(saved(reopened).step,7);
});
