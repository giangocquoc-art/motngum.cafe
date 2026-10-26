const {test}=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const base=path.resolve(__dirname,"..");
function load(file){const x={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(base,file),"utf8"),x,{filename:file});return x.module.exports}
const D=load("review-data.js"),R=load("review-core.js"),Core=load("game-core.js");
const TODAY="2026-10-26";
const v3=(count)=>({v:3,step:Math.min(count,9),done:count===10,history:Array.from({length:count},()=>({status:"correct",hint:false,attempts:0}))});
const mem=()=>{const store=new Map;return {getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),dump:k=>store.get(k)}};
test("Gate6 pilot data: 18 audited-shape items, 7 reading, 7 Hanzi recognition, 4 typed (not full HSK1)",()=>{
 assert.deepEqual(Array.from(D.validate()),[]);
 assert.equal(D.items.length,18);for(const kind of ["reading","hanzi","typed"])assert.ok(D.items.some(x=>x.kind===kind));
 assert.equal(D.items.filter(x=>x.kind==="typed").length,4);
 assert.ok(D.source.syllabusStatus.includes("pending"));
});
test("Gate6 never unlock items for merely seeing chapter00 or accessing HSK index",()=>{
 assert.deepEqual(Array.from(R.queue(D,null,R.initial(),TODAY)),[]);
 assert.deepEqual(Array.from(R.queue(D,{v:2,history:Array(10).fill({status:"correct"})},R.initial(),TODAY)),[]);
 assert.equal(R.completedPrefix({v:3,history:[{status:"correct"},{status:"bogus"},{status:"correct"}]}),1);
 assert.equal(R.report(D,v3(0),R.initial(),TODAY).unlocked,0);
 assert.equal(R.report(D,v3(1),R.initial(),TODAY).unlocked,2);
 assert.equal(R.report(D,v3(7),R.initial(),TODAY).unlocked,18);
});
test("Gate6 output locked when a malicious client requests content from future story scenes",()=>{
 assert.throws(()=>R.act(D,R.initial(),"thank-again",{type:"answer",value:"谢谢"},TODAY,Core,v3(1)));
 assert.throws(()=>R.act(D,R.initial(),"character-bright",{type:"hint"},TODAY,Core,v3(3)));
});
test("Gate6 correct choice grants only guided reading evidence and schedules one day",()=>{
 let s=R.initial(),it=D.items[0];
 let out=R.act(D,s,it.id,{type:"answer",value:it.correct},TODAY,Core,v3(1));
 assert.equal(out.result,"independent");assert.equal(out.nextDay,"2026-10-27");
 assert.equal(out.state.items[it.id].stage,1);
 assert.equal(R.queue(D,v3(1),out.state,TODAY).length,1);
 assert.equal(R.act(D,out.state,it.id,{type:"answer",value:it.correct},TODAY,Core,v3(1)).result,"already-reviewed");
});
test("Gate6 spaced repeat intervals advance 1,3,7,14 days without same-day grinding",()=>{
 let s=R.initial(),it=D.items[0],dates=["2026-10-26","2026-10-27","2026-10-30","2026-11-06","2026-11-20"],due=["2026-10-27","2026-10-30","2026-11-06","2026-11-20","2026-12-04"];
 dates.forEach((day,i)=>{let o=R.act(D,s,it.id,{type:"answer",value:it.correct},day,Core,v3(1));s=o.state;assert.equal(o.nextDay,due[i]);assert.equal(s.items[it.id].stage,Math.min(i+1,4))});
});
test("Gate6 hint and wrong attempts never create independent mastery",()=>{
 const it=D.items[0];let x=R.act(D,R.initial(),it.id,{type:"hint"},TODAY,Core,v3(1));
 assert.equal(x.result,"hint");assert.equal(x.state.items[it.id].hinted,true);
 x=R.act(D,x.state,it.id,{type:"answer",value:it.correct},TODAY,Core,v3(1));
 assert.equal(x.result,"assisted");assert.equal(x.state.items[it.id].stage,0);
 const wrong=it.options.find(o=>o[0]!==it.correct)[0];
 let y=R.act(D,R.initial(),it.id,{type:"answer",value:wrong},TODAY,Core,v3(1));
 assert.equal(y.result,"incorrect");
 y=R.act(D,y.state,it.id,{type:"answer",value:it.correct},TODAY,Core,v3(1));
 assert.equal(y.result,"assisted");
});
test("Gate6 sample only after two incorrect trials; a sample never counts as recall",()=>{
 const it=D.items[0],wrong=it.options.find(o=>o[0]!==it.correct)[0];
 assert.throws(()=>R.act(D,R.initial(),it.id,{type:"sample"},TODAY,Core,v3(1)));
 let s=R.initial();for(let i=0;i<2;i++)s=R.act(D,s,it.id,{type:"answer",value:wrong},TODAY,Core,v3(1)).state;
 const o=R.act(D,s,it.id,{type:"sample"},TODAY,Core,v3(1));assert.equal(o.result,"sample");
 const count=R.report(D,v3(1),o.state,TODAY);
 assert.equal(count.independent,0);assert.equal(count.sample,1);assert.equal(count.due,1);
});
test("Gate6 typed task grades authored accepted Hanzi, rejects pinyin, negation and unknown answer",()=>{
 const it=D.items.find(x=>x.id==="self-introduction");
 assert.equal(R.act(D,R.initial(),it.id,{type:"answer",value:"我叫安"},TODAY,Core,v3(2)).result,"independent");
 assert.equal(R.act(D,R.initial(),it.id,{type:"answer",value:"wo jiao an"},TODAY,Core,v3(2)).result,"incorrect");
 assert.equal(R.act(D,R.initial(),it.id,{type:"answer",value:"我不叫安"},TODAY,Core,v3(2)).result,"incorrect");
 assert.throws(()=>R.act(D,R.initial(),it.id,{type:"answer",value:"我叫安"},TODAY,Core,v3(1)));
});
test("Gate6 skip does not give credit; it is due again tomorrow",()=>{
 const it=D.items[0],x=R.act(D,R.initial(),it.id,{type:"skip"},TODAY,Core,v3(1));
 assert.equal(x.result,"skipped");assert.equal(x.state.items[it.id].dueDay,"2026-10-27");
 assert.equal(R.report(D,v3(1),x.state,TODAY).skipped,1);
 assert.equal(R.queue(D,v3(1),x.state,"2026-10-27").length,2);
});
test("Gate6 corrupt or tampered review saves are sanitized; legacy V3 unchanged",()=>{
 const store=mem(),old=JSON.stringify(v3(7));store.setItem("hai-que-huong-progress-v3",old);
 store.setItem(R.key,JSON.stringify({v:1,items:{"mother-question":{status:"certified",dueDay:"notaday"},hack:{status:"independent"}}}));
 assert.equal(Object.keys(R.read(store,D).items).length,0);
 store.setItem(R.key,"{bad");
 assert.equal(Object.keys(R.read(store,D).items).length,0);
 let x=R.act(D,R.initial(),D.items[0].id,{type:"skip"},TODAY,Core,v3(7));
 assert.equal(R.write(store,D,x.state),true);
 assert.equal(store.dump("hai-que-huong-progress-v3"),old);
 assert.equal(R.read(store,D).items[D.items[0].id].status,"skipped");
});
test("Gate6 localStorage unavailable leaves in-memory learning possible but no false save promise",()=>{
 const deny={getItem(){throw Error("blocked")},setItem(){throw Error("blocked")}};
 assert.equal(Object.keys(R.read(deny,D).items).length,0);
 assert.equal(R.write(deny,D,R.initial()),false);
});
test("Gate6 learning practice page is separate, keyboard accessible and never loads a fake listening test",()=>{
 const html=fs.readFileSync(path.join(base,"ren-luyen.html"),"utf8");
 const home=fs.readFileSync(path.join(base,"index.html"),"utf8");
 assert.ok(html.includes('id="questionPrompt"')&&html.includes('id="typedAnswer"'));
 assert.ok(html.includes('aria-live="polite"')&&html.includes('href="/?play=hsk1"'));
 assert.ok(html.includes('src="/review-core.js"')&&html.includes('src="/review-data.js"'));
 assert.ok(home.includes('href="/ren-luyen.html"'));
 assert.ok(!html.includes("speechSynthesis")&&!html.includes("SpeechRecognition"));
});
