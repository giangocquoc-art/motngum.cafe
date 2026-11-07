const test=require("node:test");
const assert=require("node:assert/strict");
const Recall=require("../duong-re/session-recall.js");
const {boot}=require("./helpers/branch-ui-fixture.cjs");

test("session recall starts cleanly and stores only bounded outcome state",()=>{
 const started=Recall.start(null);
 assert.deepEqual(started,{version:2,status:"in-progress",attempts:0,helpUsed:false,boundary:"pending"});
 assert.deepEqual(Recall.clean({...started,answer:"我很好",pinyin:"private"}),started);
 assert.equal(Recall.storageKey,"chimse-branch-session-recall-v1");
});

test("wrong answers retry without finishing or changing narrative state",()=>{
 let state=Recall.start(Recall.fresh());
 state=Recall.fail(state);state=Recall.fail(state);
 assert.deepEqual(state,{version:2,status:"in-progress",attempts:2,helpUsed:false,boundary:"pending"});
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
 assert.equal(Recall.finish(started,"correct").status,"unassisted");
 assert.equal(Recall.clean({version:1,status:"independent",attempts:1,helpUsed:false}).status,"unassisted");
 const skipped=Recall.finish(Recall.fail(started),"skipped");
 assert.equal(skipped.status,"skipped");assert.equal(skipped.attempts,1);
 assert.equal(Recall.finish(skipped,"correct").status,"skipped");
});

test("malformed and newer sidecars are not normalized into a fresh answer",()=>{
 assert.throws(()=>Recall.clean({version:3,status:"independent",attempts:1,helpUsed:false}),error=>error.code==="newer");
 assert.throws(()=>Recall.clean({version:1,status:"in-progress",attempts:-1,helpUsed:false}));
 assert.throws(()=>Recall.finish(Recall.start(null),"answer"));
});

test("session boundary pauses and resumes without changing the story path",()=>{
 let state=Recall.finish(Recall.start(null),"correct");
 assert.equal(state.boundary,"pending");
 state=Recall.pause(state);assert.equal(state.boundary,"paused");
 assert.equal(Recall.continueSession(state).boundary,"continued");
 assert.equal(Recall.pause(Recall.start(null)).boundary,"pending");
 assert.throws(()=>Recall.clean({version:2,status:"in-progress",attempts:1,helpUsed:false,boundary:"paused"}));
 assert.throws(()=>Recall.clean({version:2,status:"unassisted",attempts:1,helpUsed:false,boundary:"invalid"}));
 const legacy=Recall.clean({version:1,status:"unassisted",attempts:1,helpUsed:false});
 assert.deepEqual(legacy,{version:2,status:"unassisted",attempts:1,helpUsed:false,boundary:"continued"});
});

test("completed recall offers a saved pause before entering class",()=>{
 const ui=boot("school-gate",1,{seed:{[Recall.storageKey]:JSON.stringify({version:2,status:"unassisted",attempts:1,helpUsed:false,boundary:"pending"})}});
 assert.equal(ui.phase(),"session-close");
 const storyBefore=ui.values.get("hai-que-huong-branching-novel-v1"),historyBefore=ui.values.get("chimse-branch-learning-v1");
 let visible=ui.get("content").children.map(x=>x.textContent).join(" ");assert.match(visible,/An chợt nhớ được câu trả lời/);
 ui.get("content").children.flatMap(x=>x.children||[]).find(x=>x.textContent.includes("Dừng ở đây")).click();
 assert.equal(JSON.parse(ui.values.get(Recall.storageKey)).boundary,"paused");assert.equal(ui.phase(),"session-close");
 const resumed=boot("school-gate",1,{seed:{[Recall.storageKey]:ui.values.get(Recall.storageKey)}});
 assert.equal(resumed.phase(),"session-close");assert.match(resumed.get("content").children.map(x=>x.textContent).join(" "),/Đã lưu ở cổng trường/);
 resumed.get("nextBtn").click();assert.equal(JSON.parse(resumed.values.get(Recall.storageKey)).boundary,"continued");assert.equal(resumed.phase(),"read");
 assert.equal(resumed.values.get("hai-que-huong-branching-novel-v1"),storyBefore);assert.equal(resumed.values.get("chimse-branch-learning-v1"),historyBefore);
});

test("arrival recall shows only a Vietnamese cue before the first attempt",()=>{
 const ui=boot("school-gate",1);
 assert.equal(ui.phase(),"session-recall");
 const content=ui.get("content");
 const visible=JSON.stringify(content.children.map(child=>({text:child.textContent,children:child.children?.map(item=>item.textContent)})));
 assert.match(visible,/Mẹ hỏi An có ổn không\. An muốn nói mình vẫn ổn/);
 assert.doesNotMatch(visible,/[\u3400-\u9fff]|pinyin|đáp án|gợi ý|ví dụ|我很好/i);
 assert.equal(ui.get("sessionRecallInput").value,"");
 assert.equal(ui.get("journalToggle").disabled,true);
 assert.equal(ui.get("sparrowBtn").disabled,true);
 assert.equal(JSON.parse(ui.values.get(Recall.storageKey)).status,"in-progress");
});

test("plot choices are clearly separated from graded language answers",()=>{
 const ui=boot("arrival",0);while(ui.phase()!=="lesson")ui.get("nextBtn").click();
 ui.get("answerInput").value="我很好";ui.get("content").children.find(child=>child.tagName==="FORM").fire("submit");
 assert.equal(ui.phase(),"feedback");ui.get("nextBtn").click();assert.equal(ui.phase(),"choose");
 assert.ok(ui.get("content").children.flatMap(child=>[child,...child.children]).some(child=>child.textContent.includes("Theo ý tiếng Việt")&&child.textContent.includes("chưa cần học thuộc")));
});

test("a natural check-in reply is taught with Hanzi, Pinyin, and Vietnamese before recall",()=>{
 const ui=boot("arrival",0);while(ui.phase()!=="model")ui.get("nextBtn").click();
 const copy=ui.get("content").children.map(child=>child.textContent).join(" ");
 assert.match(copy,/我还好。/);assert.match(copy,/Wǒ hái hǎo\./);assert.match(copy,/Con vẫn ổn ạ\./);
 assert.match(copy,/很好。 \/ 还好。/);assert.match(copy,/Hěn hǎo\. \/ Hái hǎo\./);assert.match(copy,/Ổn ạ\. \/ Vẫn ổn ạ\./);
 assert.match(copy,/我很好，谢谢。/);assert.match(copy,/Wǒ hěn hǎo, xièxie\./);assert.match(copy,/Con ổn ạ, cảm ơn mẹ\./);
 assert.match(copy,/我还好，谢谢。/);assert.match(copy,/Wǒ hái hǎo, xièxie\./);assert.match(copy,/Con vẫn ổn ạ, cảm ơn mẹ\./);
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
 assert.match(ui.get("inputMessage").textContent,/Mẹ đang hỏi xem An có ổn không/);
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
