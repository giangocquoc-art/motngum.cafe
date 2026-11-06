"use strict";
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const base=process.env.BRANCH_BASE_URL||"http://127.0.0.1:4198/duong-re/";
const executable=process.env.HSK_BROWSER_BIN||"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:executable,args:["--no-sandbox"]});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on("pageerror",error=>errors.push(error.message));
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  await page.evaluate(()=>{
   const E=AnBranchEngine,D=AnBranchStory,L=ChimSeBranchLearning;let s=E.fresh();
   for(let i=0;s.node!=="school-gate"&&i<60;i++){const n=D.byId[s.node],o=n.kind==="choice"?E.availableOptions(n,s)[0]:null;const r=E.step(s,o?o.id:"next");if(!r.ok)throw Error(r.error);s=r.state}
   const h=Array(L.total).fill(null);h[0]={status:"correct",attempts:0,hint:false};
   localStorage.setItem(D.storageKey,E.exportSave(s));localStorage.setItem(L.storageKey,JSON.stringify(h));localStorage.setItem("chimse-branch-session-recall-v1",JSON.stringify({version:1,status:"unseen",attempts:0,helpUsed:false}));
  });await page.reload();
  assert.equal(await page.locator("#branchShell").getAttribute("data-phase"),"session-recall");
  const initial=await page.locator("#content").innerText();assert.match(initial,/Mẹ hỏi An có ổn không\. An muốn nói mình vẫn ổn/);assert.doesNotMatch(initial,/[\u3400-\u9fff]|Pinyin|Gợi ý:/);
  await page.locator("#sessionRecallInput").fill("答错");await page.locator("#nextBtn").click();assert.match(await page.locator("#inputMessage").innerText(),/Mẹ đang hỏi xem An có ổn không/);
  let saved=JSON.parse(await page.evaluate(()=>localStorage.getItem("chimse-branch-session-recall-v1")));assert.equal(saved.attempts,1);assert.equal(saved.status,"in-progress");assert.doesNotMatch(JSON.stringify(saved),/答错/);
  await page.reload();assert.equal(await page.locator("#branchShell").getAttribute("data-phase"),"session-recall");assert.equal(await page.locator("#sessionRecallInput").inputValue(),"");
  await page.getByRole("button",{name:"Nhắc An một chút"}).click();assert.match(await page.locator("#content").innerText(),/có thể bắt đầu câu trả lời bằng 我/);
  for(const viewport of [{width:320,height:568},{width:667,height:375},{width:1024,height:768}]){
   await page.setViewportSize(viewport);await page.waitForTimeout(160);
   const geometry=await page.evaluate(()=>{const shell=document.querySelector("#branchShell"),next=document.querySelector("#nextBtn"),stage=document.querySelector("#stage"),reader=document.querySelector(".branch-reader"),r=next.getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth||document.documentElement.scrollHeight>innerHeight,buttonVisible:r.width>0&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,stageHeight:stage.getBoundingClientRect().height,readerHeight:reader.getBoundingClientRect().height,shellHeight:shell.getBoundingClientRect().height,viewportHeight:innerHeight}});
   assert.equal(geometry.overflow,false,JSON.stringify({viewport,geometry}));assert.equal(geometry.buttonVisible,true,JSON.stringify({viewport,geometry}));assert.ok(geometry.stageHeight>0&&geometry.readerHeight>0,JSON.stringify({viewport,geometry}));assert.ok(geometry.shellHeight<=geometry.viewportHeight+1,JSON.stringify({viewport,geometry}));
  }
  await page.locator("#sessionRecallInput").fill("我还好");await page.locator("#nextBtn").click();saved=JSON.parse(await page.evaluate(()=>localStorage.getItem("chimse-branch-session-recall-v1")));assert.equal(saved.status,"assisted");assert.deepEqual(errors,[]);
  console.log("session recall Edge smoke passed: first attempt, safe retry, reload, gated help, assisted completion");
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
