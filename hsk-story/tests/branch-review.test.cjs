const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
function load(file){const box={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),box,{filename:file});return box.module.exports;}
const R=load("review-core.js"),D=load("review-data.js"),Core=load("game-core.js"),DAY="2026-10-29";
const entry=(status="correct",attempts=0,hint=false)=>({status,attempts,hint});
const history=count=>Array.from({length:count},()=>entry());
const plain=value=>JSON.parse(JSON.stringify(value));

test("branch learning opens the same existing review items as completed HSK tasks",()=>{
 assert.equal(R.report(D,R.combineProgress(null,[]),R.initial(),DAY).unlocked,0);
 assert.equal(R.report(D,R.combineProgress(null,history(1)),R.initial(),DAY).unlocked,2);
 const all=R.combineProgress(null,history(7));assert.equal(R.completedPrefix(all),7);assert.equal(R.queue(D,all,R.initial(),DAY).length,18);
 assert.equal(R.report(D,R.combineProgress(null,history(10)),R.initial(),DAY).unlocked,18);
});

test("valid canonical records take priority and branch evidence fills only missing records",()=>{
 const legacy={v:3,history:[entry("correct",2,false),{status:"unearned"},entry("assisted",4,true)]},branch=[entry("assisted",9,true),entry(),entry()];
 const before=JSON.stringify([legacy,branch]),combined=R.combineProgress(legacy,branch);
 assert.deepEqual(plain(combined.history.slice(0,3)),[entry("correct",2,false),entry(),entry("assisted",4,true)]);
 assert.equal(R.completedPrefix(combined),3);assert.equal(JSON.stringify([legacy,branch]),before);
 assert.equal(Object.isFrozen(combined),true);assert.equal(Object.isFrozen(combined.history),true);assert.equal(Object.isFrozen(combined.history[0]),true);
});

test("future records, personality flags, wrong save versions, and malformed entries cannot skip a prefix gap",()=>{
 const later=[entry(),null,entry(),entry(),entry(),entry(),entry()];
 assert.equal(R.completedPrefix(R.combineProgress({v:3,done:true,step:9,history:[]},later)),1);
 assert.equal(R.report(D,R.combineProgress({v:2,history:history(10)},null),R.initial(),DAY).unlocked,0);
 assert.equal(R.report(D,R.combineProgress(null,{version:1,flags:{"invite-friend":true},history:history(10)}),R.initial(),DAY).unlocked,0);
 assert.equal(R.completedPrefix(R.combineProgress(null,[{status:"certified"},entry()])),0);
 assert.equal(R.completedPrefix(R.combineProgress(null,[[],entry()])),0);
});

test("each storage source is parsed independently and read-only even when another is corrupt or blocked",()=>{
 const keys=[],store={getItem(key){keys.push(key);return key==="hai-que-huong-progress-v3"?"{bad":JSON.stringify(history(7));},setItem(){throw Error("must not write");}};
 assert.equal(R.completedPrefix(R.readStoryProgress(store)),7);assert.deepEqual(keys,["hai-que-huong-progress-v3","chimse-branch-learning-v1"]);
 const legacyOnly={getItem(key){if(key==="chimse-branch-learning-v1")throw Error("blocked");return JSON.stringify({v:3,history:history(2)});}};
 assert.equal(R.completedPrefix(R.readStoryProgress(legacyOnly)),2);
 assert.equal(R.completedPrefix(R.readStoryProgress({getItem(){throw Error("blocked");}})),0);
});

test("canonical learners retain the same review results and scheduling",()=>{
 const legacy={v:3,history:history(7)},combined=R.combineProgress(legacy,null),item=D.items[0],action={type:"answer",value:item.correct};
 assert.deepEqual(plain(R.report(D,combined,R.initial(),DAY)),plain(R.report(D,legacy,R.initial(),DAY)));
 assert.deepEqual(plain(R.act(D,R.initial(),item.id,action,DAY,Core,combined)),plain(R.act(D,R.initial(),item.id,action,DAY,Core,legacy)));
});

test("a broken branch save does not hide the return path to an intact legacy story",()=>{
 const old=JSON.stringify({v:3,history:history(2)}),branch=JSON.stringify({version:1,path:[]});
 const storage=values=>({getItem:key=>values[key]||null});
 assert.equal(R.storyHref(storage({"hai-que-huong-progress-v3":old,"hai-que-huong-branching-novel-v1":"{broken"})),"/?play=hsk1");
 assert.equal(R.storyHref(storage({"hai-que-huong-progress-v3":old,"hai-que-huong-branching-novel-v1":branch})),"/duong-re/");
 assert.equal(R.storyHref(storage({})),"/duong-re/");
});

test("branch learners can review without rewriting canonical, intro, or branch learning strings",()=>{
 const canonical='{"v":3,"history":[]}',intro='{"v":1,"step":4}',branch=JSON.stringify(history(7)),values=new Map([["hai-que-huong-progress-v3",canonical],["hai-que-huong-intro-v1",intro],["chimse-branch-learning-v1",branch]]),writes=[];
 const storage={getItem:key=>values.get(key)||null,setItem(key,value){writes.push(key);values.set(key,value);}};
 const story=R.readStoryProgress(storage),item=D.items[0],result=R.act(D,R.initial(),item.id,{type:"answer",value:item.correct},DAY,Core,story);
 assert.equal(result.result,"independent");assert.equal(R.write(storage,D,result.state),true);
 assert.deepEqual(writes,[R.key]);assert.equal(values.get("hai-que-huong-progress-v3"),canonical);assert.equal(values.get("hai-que-huong-intro-v1"),intro);assert.equal(values.get("chimse-branch-learning-v1"),branch);
 assert.equal(R.read(storage,D).items[item.id].status,"independent");
});
