const test=require("node:test");
const assert=require("node:assert/strict");
const Recall=require("../duong-re/session-recall.js");
const {boot}=require("./helpers/branch-ui-fixture.cjs");

test("session recall starts cleanly and stores only bounded outcome state",()=>{
 const started=Recall.start(null);
 assert.deepEqual(started,{version:1,status:"in-progress",attempts:0,helpUsed:false});
 assert.deepEqual(Recall.clean({...started,answer:"我很好",pinyin:"private"}),started);
 assert.equal(Recall.storageKey,"chimse-branch-session-recall-v1");
});

test("wrong answers retry without finishing or changing narrative state",()=>{
 let state=Recall.start(Recall.fresh());
 state=Recall.fail(state);state=Recall.fail(state);
 assert.deepEqual(state,{version:1,status:"in-progress",attempts:2,helpUsed:false});
 assert.equal(Recall.isFinished(state),false);
 assert.equal(Recall.fail({...state,attempts:100}).attempts,100);
});

test("help is unavailable before a real attempt and finishes as assisted",()=>{
 let state=Recall.start(null);
 assert.equal(Recall.help(state).helpUsed,false);
 state=Recall.fail(state);state=Recall.help(state);
 assert.equal(state.helpUsed,true);
 state=Recall.finish(state,"correct");
 assert.equal(state.status,"assisted");assert.equal(state.attempts,2);assert.equal(Recall.isFinished(state),true);
});

test("unassisted success and skip remain distinct terminal outcomes",()=>{
 const started=Recall.start(null);
 assert.equal(Recall.finish(started,"correct").status,"independent");
 const skipped=Recall.finish(Recall.fail(started),"skipped");
 assert.equal(skipped.status,"skipped");assert.equal(skipped.attempts,1);
 assert.equal(Recall.finish(skipped,"correct").status,"skipped");
});

test("malformed and newer sidecars are not normalized into a fresh answer",()=>{
 assert.throws(()=>Recall.clean({version:2,status:"independent",attempts:1,helpUsed:false}),error=>error.code==="newer");
 assert.throws(()=>Recall.clean({version:1,status:"in-progress",attempts:-1,helpUsed:false}));
 assert.throws(()=>Recall.finish(Recall.start(null),"answer"));
});

test("arrival recall shows only a Vietnamese cue before the first attempt",()=>{
 const ui=boot("school-gate",1);
 assert.equal(ui.phase(),"session-recall");
 const content=ui.get("content");
 const visible=JSON.stringify(content.children.map(child=>({text:child.textContent,children:child.children?.map(item=>item.textContent)})));
 assert.match(visible,/An nhớ lại cuộc trò chuyện với mẹ/);
 assert.doesNotMatch(visible,/[\u3400-\u9fff]|pinyin|đáp án|gợi ý|ví dụ|我很好/i);
 assert.equal(ui.get("sessionRecallInput").value,"");
 assert.equal(ui.get("journalToggle").disabled,true);
 assert.equal(ui.get("sparrowBtn").disabled,true);
 assert.equal(JSON.parse(ui.values.get(Recall.storageKey)).status,"in-progress");
});

test("the same recall follows both arrival choices and keeps their story memories separate",()=>{
 const seen=[];
 for(const option of ["look-around","hold-mother"]){
  const ui=boot("school-gate",1,{choices:{arrival:option}});
  assert.equal(ui.phase(),"session-recall",option);
  const story=ui.box.AnBranchEngine.load(ui.values.get(ui.box.AnBranchStory.storageKey));
  assert.equal(story.flags[option],true,option);
  assert.equal(story.journal.length,1,option);
  seen.push(story.journal[0].memory);
 }
 assert.notEqual(seen[0],seen[1]);
});

test("failed recall retries, help is gated, and accepted answer stores no raw text",()=>{
 const ui=boot("school-gate",1);
 const storyBefore=ui.values.get("hai-que-huong-branching-novel-v1"),historyBefore=ui.values.get("chimse-branch-learning-v1");
 ui.get("sessionRecallInput").value="不对";
 ui.get("nextBtn").click();
 let state=JSON.parse(ui.values.get(Recall.storageKey));
 assert.equal(state.attempts,1);assert.equal(state.status,"in-progress");
 assert.equal(ui.values.get("hai-que-huong-branching-novel-v1"),storyBefore);
 assert.equal(ui.values.get("chimse-branch-learning-v1"),historyBefore);
 assert.doesNotMatch(ui.values.get(Recall.storageKey),/不对/);
 const help=ui.get("content").children.flatMap(child=>child.children||[]).find(child=>child.textContent==="Nhắc An một chút");
 assert.ok(help,"help action appears after an attempt");help.click();
 state=JSON.parse(ui.values.get(Recall.storageKey));assert.equal(state.helpUsed,true);
 ui.get("sessionRecallInput").value="我还好";ui.get("nextBtn").click();
 state=JSON.parse(ui.values.get(Recall.storageKey));assert.equal(state.status,"assisted");
 assert.equal(ui.values.get("hai-que-huong-branching-novel-v1"),storyBefore);
 assert.equal(ui.values.get("chimse-branch-learning-v1"),historyBefore);
 assert.doesNotMatch(ui.values.get(Recall.storageKey),/我还好/);
});

test("reload resumes attempt count without retaining input; skip is unscored",()=>{
 const resumed=boot("school-gate",1,{seed:{[Recall.storageKey]:JSON.stringify({version:1,status:"in-progress",attempts:1,helpUsed:false})}});
 assert.equal(resumed.phase(),"session-recall");assert.equal(resumed.get("sessionRecallInput").value,"");
 const storyBefore=resumed.values.get("hai-que-huong-branching-novel-v1"),historyBefore=resumed.values.get("chimse-branch-learning-v1");
 const skip=resumed.get("content").children.flatMap(child=>child.children||[]).find(child=>child.textContent==="Bỏ qua câu này");
 assert.ok(skip);skip.click();
 assert.equal(JSON.parse(resumed.values.get(Recall.storageKey)).status,"skipped");
 assert.equal(resumed.values.get("hai-que-huong-branching-novel-v1"),storyBefore);
 assert.equal(resumed.values.get("chimse-branch-learning-v1"),historyBefore);
});
