const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const folder=path.resolve(__dirname,"..");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(folder,file),"utf8"),box);return box.module.exports}
const G=load("story-graph.js"),W=load("scene-world.js"),S=load("skill-sampler.js"),B=load("learning-blueprint.js"),F=load("future-acts.js");
const C=load("content-manifest.js"),K=load("curriculum-data.js"),D=load("story-director.js"),E=load("active-encounter.js"),Beats=load("story-beats.js");
test("V9 stable string IDs and graph/curriculum contract",()=>{
 assert.deepEqual(Array.from(G.validate(C,K,Beats,D,E)),[]);
 assert.equal(G.sceneIds.length,10);
 assert.equal(new Set(Array.from(G.sceneIds)).size,10);
 assert.equal(G.indexOf("hsk1.e01.school-introduction"),1);
});
test("V9 graph resolves old numeric save and stable reference safely",()=>{
 assert.equal(G.resolve(null,7),7);
 assert.equal(G.resolve("hsk1.e01.xiaoyu-friendship",7),2);
 assert.equal(G.resolve("forged",7),7);
 assert.equal(G.resolve("forged",-100),0);
 assert.equal(G.next(G.idAt(9)),null);
});
test("V9 optional scene objects do not change curriculum or scores",()=>{
 assert.deepEqual(Array.from(W.validate(G)),[]);
 let state={};
 state=W.inspect(state,G.idAt(0),"diary").state;
 state=W.inspect(state,G.idAt(0),"diary").state;
 assert.equal(state[G.idAt(0)].length,1);
 assert.equal(W.inspect(state,G.idAt(0),"window").object.zh,"这里是成都。");
 assert.throws(()=>W.inspect(state,G.idAt(7),"future-leak"));
 assert.equal(K.scenes.length,10);
});
test("V9 scene-world sanitizes forged localStorage object IDs",()=>{
 const input={"hsk1.e01.arrival-greeting":["fake","case","case"],hacked:["evil"]};
 const result=W.clean(input);
 assert.deepEqual(Array.from(result[G.idAt(0)]),["case"]);
 assert.equal(result.hacked,undefined);
});
test("V10 skill sample is located before school checkpoint, not official exam",()=>{
 assert.deepEqual(Array.from(S.validate(G,K)),[]);
 assert.equal(S.trigger,7);
 assert.equal(S.items.length,2);
 assert.deepEqual(Array.from(S.items,x=>x.mode),["reading","listening"]);
});
test("V10 reading comprehension correctness tracked once",()=>{
 let s=S.initial();s=S.answer(s,"xiaoyu");
 assert.equal(s.results[0].result,"correct");
 assert.equal(s.index,1);
 assert.throws(()=>S.answer(s,"invalid"));
});
test("V10 listening does not count without TTS playback",()=>{
 let s=S.answer(S.initial(),"teacher");
 s=S.answer(s,"tomorrow");
 assert.equal(s.results[1].result,"unassessed");
 assert.equal(S.summary(s).listening,"unassessed");
 assert.equal(S.summary(s).speaking,"unassessed");
});
test("V10 audio request is tracked distinctly and works only on listening item",()=>{
 let s=S.answer(S.initial(),"xiaoyu");
 assert.throws(()=>S.audio(s,false));
 s=S.audio(s,true);
 s=S.answer(s,"tomorrow");
 assert.equal(s.results[1].result,"correct");
 assert.equal(s.status,"done");
});
test("V10 skip, historic save and tampered result do not fabricate mastery",()=>{
 const old=S.migrate(null,9,[{},{},{},{},{},{},{},{},{}],false);
 assert.equal(old.status,"legacy");
 let skipped=S.skip(S.initial());skipped=S.skip(skipped);
 assert.equal(skipped.status,"done");
 assert.equal(S.summary(skipped).reading,"unassessed");
 const forged=S.clean({status:"done",results:[{result:"perfect"}]});
 assert.equal(forged.status,"pending");
 assert.equal(forged.results[0].result,"unassessed");
});
test("V10 traceability blueprint exposes missing proof instead of fabricated HSK1 certification",()=>{
 assert.deepEqual(Array.from(B.validate(K,C,S,E)),[]);
 const report=B.report();
 assert.equal(report.certifiedHSK1Coverage,false);
 assert.equal(report.officiallyVerifiedObjectives,0);
 assert.ok(report.awaitingMandarinReview>0);
 assert.equal(B.source.publisherPage,"https://www.chinesetest.cn/syllabus");
});
test("V13–V16 four drafted acts remain explicitly non-playable, with coherent episodic stakes",()=>{
 assert.deepEqual(Array.from(F.validate()),[]);
 assert.deepEqual(Array.from(F.acts,x=>x.level),[2,3,4,5]);
 assert.equal(F.acts.reduce((n,x)=>n+x.episodes.length,0),16);
 assert.ok(F.byLevel(5).episodes.some(e=>e.id==="graduation"));
 assert.ok(F.status.includes("NOT PLAYABLE"));
});
