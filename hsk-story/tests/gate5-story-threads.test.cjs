const {test}=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const base=path.resolve(__dirname,"..");
function load(file){const scope={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(base,file),"utf8"),scope,{filename:file});return scope.module.exports;}
const T=load("story-threads.js"),C=load("content-manifest.js"),K=load("curriculum-data.js"),B=load("story-beats.js");
const h=Array.from({length:10},()=>null);
function done(at){const result=h.slice();for(const i of at)result[i]={status:"correct",hint:false,attempts:0};return result;}
test("Gate5 curated language threads pass schema, never declare official HSK completion",()=>{
 assert.deepEqual(Array.from(T.validate(K,C)),[]);
 assert.equal(T.lines.length,5);
 assert.ok(T.lines.filter(t=>t.checkpoint!==null).every(t=>t.checkpoint>=7));
 assert.equal(K.levels[0].status,"demo");
 assert.ok(K.levels.slice(1).every(l=>l.status==="planned"));
 assert.equal(K.scenes[8].topic.includes("Nghe"),false);
});
test("Gate5 no future retrieval leak for a new reader or when a story task is incomplete",()=>{
 assert.equal(T.echo(1,[],{},null),null);
 assert.equal(T.echo(3,done([1]),{friendship:"sit-with-friend"},null),null);
 assert.equal(T.echo(5,done([4]),{},null),null);
 assert.equal(T.echo(6,done([0,1,2,3,4]),{},null),null);
 assert.deepEqual(Array.from(T.trace([],{})),[]);
});
test("Gate5 actual story reuse: greeting recurs with teacher, never counted as speaking skill",()=>{
 const x=T.echo(1,done([0]),{},null);
 assert.ok(x.zh.includes("你好"));assert.ok(x.vi.includes("mẹ"));assert.equal(x.kind,"language-reappearance");
 assert.equal(T.echo(7,done([0,1,2,3,4,5,6]),{},null),null);
 assert.equal(T.echo(8,done([0,1,2,3,4,5,6,7]),{},null),null);
});
test("Gate5 both friendship choices have different humane consequences and no grade writes",()=>{
 const a=T.echo(3,done([1,2]),{friendship:"sit-with-friend"},null);
 const b=T.echo(3,done([1,2]),{friendship:"ask-teacher"},null);
 assert.ok(a.vi.includes("chủ động"));assert.ok(b.vi.includes("nhờ cô"));
 assert.notEqual(a.vi,b.vi);assert.ok(a.zh.includes("同学"));
});
test("Gate5 both food choices change the thank-you moment and later memory",()=>{
 const a=T.echo(5,done([4]),{"noodle-taste":"mild"},null);
 const b=T.echo(5,done([4]),{"noodle-taste":"try-spicy"},null);
 assert.ok(a.vi.includes("ớt riêng"));assert.ok(b.vi.includes("cốc nước"));
 const endA=T.ending({friendship:"sit-with-friend","noodle-taste":"mild"},{stage:"done"});
 const endB=T.ending({friendship:"ask-teacher","noodle-taste":"try-spicy"},{stage:"done"});
 assert.ok(endA.includes("ngồi cạnh"));assert.ok(endB.includes("cô Vương"));
 assert.ok(endA.includes("quyển sổ")||endA.includes("Quyển sổ"));
 assert.notEqual(endA,endB);
});
test("Gate5 walk-home reflection appears only after real prior episodes, remembers completed diary",()=>{
 const a=T.echo(6,done([5]),{friendship:"ask-teacher","noodle-taste":"mild"},{stage:"done"});
 assert.ok(a.zh.includes("明天见"));assert.ok(a.vi.includes("Tiểu Vũ"));assert.ok(a.vi.includes("sổ"));
 const b=T.echo(6,done([5]),{},null);
 assert.ok(!b.vi.includes("sổ mẹ tặng đã được tìm lại"));
});
test("Gate5 independent-vs-hinted-vs-sample explicitly preserved through checkpoint evidence",()=>{
 let h=done([1,2,4,5,6]);
 h[7]={status:"correct",attempts:1,hint:false};
 h[8]={status:"assisted",attempts:2,hint:true};
 h[9]={status:"correct",attempts:0,hint:false};
 const rows=Array.from(T.trace(h,{}));
 const introduce=rows.find(x=>x.id==="introduce"),order=rows.find(x=>x.id==="order"),price=rows.find(x=>x.id==="price");
 assert.equal(introduce.first,"independent");
 assert.equal(introduce.checkpoint,"supported");
 assert.equal(order.checkpoint,"independent");
 assert.equal(price.first,"seen-in-context"); // at scene5 user answered thanks, NOT the price
 assert.equal(price.checkpoint,"sample");
 const tomorrow=rows.find(x=>x.id==="tomorrow");
 assert.equal(tomorrow.first,"seen-in-context"); // response "好" does not prove ability to use 明天见
 assert.equal(T.result(null),"not-attempted");
});
test("Gate5 authentic story observations are optional; viewing an unrelated prop is no recall credit",()=>{
 const h=done([5]);
 const no=Array.from(T.trace(h,{})).find(t=>t.id==="thanks");
 const yes=Array.from(T.trace(h,{"hsk1.e01.walk-home":["store"]})).find(t=>t.id==="thanks");
 assert.equal(no.revisited,false);assert.equal(yes.revisited,true);
 assert.equal(T.trace(h,{}).some(t=>t.id==="introduce"),false);
});
test("Gate5 chapter chronology: notebook was opened the previous evening, not handed over twice",()=>{
 const intro=fs.readFileSync(path.join(base,"intro-data.js"),"utf8");
 assert.ok(intro.includes("Đêm trước buổi học đầu tiên"));
 assert.ok(B.beats[0].story.includes("Sáng hôm sau"));
 assert.ok(B.beats[0].story.includes("tối qua"));
	 assert.equal(C.scenes[0].tag,"TRƯỚC CỔNG TRƯỜNG MỚI");
 assert.equal(C.scenes[0].id,0);
});

test("Gate5 no pre-answer callback leaks any exact accepted Chinese answer for the current scene",()=>{
 const all=done([0,1,2,3,4,5]);
 const choices={friendship:"sit-with-friend","noodle-taste":"mild"};
 for(const scene of [1,3,5,6]){
  const echo=T.echo(scene,all,choices,{stage:"done"});
  assert.ok(echo,"expected a contextual story echo at "+scene);
  const question=C.scenes[scene];
  for(const candidate of question.answers){
   const normalized=candidate.replace(/[\s，。！？,.!?]/g,"");
   assert.equal(echo.zh.replace(/[\s，。！？,.!?]/g,"").includes(normalized),false,
    "Direct answer leaked in Chinese callback at scene "+scene+": "+candidate);
  }
 }
});
