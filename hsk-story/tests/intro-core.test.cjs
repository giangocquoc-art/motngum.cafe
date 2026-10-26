const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
function load(file){let sandbox={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),sandbox);return sandbox.module.exports}
const D=load("intro-data.js"),C=load("intro-core.js");
function plain(obj){return JSON.parse(JSON.stringify(obj))}
test("Pre-HSK nine story pages, four glyph previews and four non-HSK review questions",()=>{
 assert.deepEqual(plain(D.validate()),[]);assert.equal(D.stages.length,9);assert.equal(D.discovery.length,4);assert.equal(D.quizzes.length,4);
 assert.deepEqual(plain(D.stages.map(s=>s.id)),["prologue","strokes","forest","people","light","mother","legend","guess","ending"]);
});
test("Intro starts without assuming any knowledge of Chinese or gating HSK1",()=>{
 const s=C.initial();assert.equal(s.step,0);assert.equal(s.maxReached,0);assert.equal(s.finished,false);
 assert.equal(C.key,"hai-que-huong-intro-v1");assert.notEqual(C.key,"hai-que-huong-progress-v3");
});
test("Intro explores only authorized glyphs and does not increment duplicate observations",()=>{
 let x=C.visit(C.initial(),"木");x=C.visit(x,"木");assert.deepEqual(plain(x.discovered),["木"]);
 assert.throws(()=>C.visit(x,"姦"));
});
test("Intro stroke order is bounded to the three numbers 一 二 三",()=>{
 let x=C.initial();for(let i=0;i<7;i++)x=C.stroke(x);assert.equal(x.stroke,3);
});
test("Forest and crowd only support 1–3 meaning-preserving compositions",()=>{
 let s=C.setCount(C.initial(),"forest",3);s=C.setCount(s,"people",2);
 assert.equal(s.forest,3);assert.equal(s.people,2);
 assert.throws(()=>C.setCount(s,"forest",4));assert.throws(()=>C.setCount(s,"market",2));
});
test("Components 日 and 月 can be recognized independently",()=>{
 let s=C.light(C.initial(),"日");s=C.light(s,"日");s=C.light(s,"月");
 assert.deepEqual(plain(s.lightParts),["日","月"]);
 assert.throws(()=>C.light(s,"X"));
});
test("Intro cannot be marked complete before visiting ending",()=>{
 let s=C.initial();let spoof=C.clean({...s,finished:true});
 assert.equal(spoof.finished,false);for(let i=0;i<8;i++)s=C.move(s,"next");
 assert.equal(s.step,8);assert.equal(s.finished,true);
 s=C.move(s,"back");assert.equal(s.step,7);assert.equal(s.finished,true);
});
test("Quiz records selections, not an HSK grade or certification",()=>{
 let s=C.initial();s=C.quiz(s,D.quizzes[0].id,0,D.quizzes);
 assert.equal(s.quizResults.forest,0);s=C.nextQuiz(s,D.quizzes);
 assert.equal(s.quizIndex,1);assert.throws(()=>C.quiz(s,"forged",2,D.quizzes));
 assert.equal(s.skillScore,undefined);assert.equal(s.HSKCertificate,undefined);
});
test("Saved progress migration sanitizes forged steps, glyphs, and score keys",()=>{
 const corrupted={step:77,maxReached:77,discovered:["木","attack","木"],forest:100,people:-3,lightParts:["日","bad"],quizIndex:100,quizResults:{forest:2,attack:1,mother:4},finished:true,HSKLevel:5};
 const s=C.clean(corrupted);
 assert.equal(s.step,8);assert.deepEqual(plain(s.discovered),["木"]);assert.equal(s.forest,3);assert.equal(s.people,1);
 assert.deepEqual(plain(s.lightParts),["日"]);assert.equal(s.quizResults.attack,undefined);assert.equal(s.quizResults.mother,undefined);
 assert.equal(s.HSKLevel,undefined);
});
test("All factual claims and rare character caveats are explicit",()=>{
 const text=D.stages.find(x=>x.kind==="legend").tip;
 assert.ok(text.includes("奻")&&text.includes("姦")&&text.includes("không có nghĩa"));
 assert.ok(D.stages.find(x=>x.kind==="mother").tip.includes("gợi âm"));
 assert.ok(D.stages.find(x=>x.kind==="light").tip.includes("lịch sử"));
 assert.ok(D.sources.length>=3);
});
test("Source HTML contains accessible intro link and standalone module dependencies",()=>{
 const page=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
 const intro=fs.readFileSync(path.join(__dirname,"../nhap-mon.html"),"utf8");
 assert.ok(page.includes('href="/nhap-mon.html"'));assert.ok(intro.includes('lang="vi"'));
 for(const p of ["intro-data.js","intro-core.js","intro.js"])assert.ok(intro.includes('src="/'+p+'"'));
 assert.ok(intro.includes('aria-live="polite"'));
});
test("Dedicated introduction does not mutate existing HSK1 runtime",()=>{
 const app=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
 assert.ok(!app.includes("HSKIntroContent"));assert.ok(!app.includes("hai-que-huong-intro-v1"));
});

test("A glyph selected on the first page is the current pronunciation target and survives reload",()=>{
 let a=C.visit(C.initial(),"木");assert.equal(a.focusGlyph,"木");assert.equal(C.clean(JSON.parse(JSON.stringify(a))).focusGlyph,"木");
 let forged=C.clean({...a,focusGlyph:"姦"});assert.equal(forged.focusGlyph,null);
});
test("Intro first answer remains locked after correction is visible, without false mastery",()=>{
 let a=C.quiz(C.initial(),D.quizzes[0].id,0,D.quizzes);
 a=C.quiz(a,D.quizzes[0].id,D.quizzes[0].answer,D.quizzes);
 assert.equal(a.quizResults.forest,0);assert.equal(a.quizOutcomes.forest,"review");
 assert.equal(C.recap(a,D.quizzes).recognized,0);
});
test("Skipping means skipping exactly the current question, not the entire mini quiz",()=>{
 let a=C.skipQuiz(C.initial(),D.quizzes);assert.equal(a.quizResults.forest,-1);
 a=C.nextQuiz(a,D.quizzes);assert.equal(a.quizIndex,1);
 a=C.quiz(a,D.quizzes[1].id,D.quizzes[1].answer,D.quizzes);
 assert.equal(a.quizOutcomes.crowd,"recognized");
 const recap=C.recap(a,D.quizzes);assert.equal(recap.skipped,1);assert.equal(recap.recognized,1);
});
test("Revisiting four questions never destroys the learned story or independent HSK1 progress",()=>{
 let a=C.move(C.initial(),"next");a=C.visit(a,"人");a=C.quiz(a,D.quizzes[0].id,1,D.quizzes);
 const b=C.review(a);assert.equal(b.step,1);assert.deepEqual(plain(b.discovered),["人"]);assert.equal(b.quizIndex,0);
 assert.deepEqual(plain(b.quizResults),{});assert.equal(b.finished,false);
});
test("Existing Chapter 00 saved guesses are treated as legacy, not verified first-try recall",()=>{
 const old={step:7,maxReached:7,quizIndex:1,quizResults:{forest:1},discovered:["日"]};
 const x=C.clean(old);
 assert.equal(x.quizOutcomes.forest,"legacy");assert.equal(C.recap(x,D.quizzes).recognized,0);
 assert.equal(x.step,7);assert.equal(x.maxReached,7);
});
