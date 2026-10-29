"use strict";
const {chromium}=require("playwright"),fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const BASE=process.env.BRANCH_BASE_URL||"http://127.0.0.1:4173/duong-re/";
const OUT=path.join(__dirname,"../test-results-branch");
fs.mkdirSync(OUT,{recursive:true});
async function read(page){return page.evaluate(()=>{const E=window.AnBranchEngine,D=window.AnBranchStory;const s=E.load(localStorage.getItem(D.storageKey));const n=D.byId[s.node];return {node:s.node,done:s.done,path:s.path.length,flags:s.flags,choices:E.availableOptions(n,s).map(o=>o.id)};});}
async function proceed(page,map,stop){for(let i=0;i<60;i++){const state=await read(page);if(state.node===stop||state.done)return state;const opts=state.choices,choice=opts.length?(map[state.node]||opts[0]):"next";await page.locator('#choices [data-choice="'+choice+'"]').click();}throw Error("Loop or unbounded journey before "+stop);}
async function runCase(name,width,height,choices){
 const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(String(e)));page.on("console",msg=>{if(msg.type()==="error"&&!msg.text().includes("fonts.googleapis")&&!msg.text().includes("fonts.gstatic"))errors.push("console: "+msg.text())});
 try{
  await page.goto(BASE,{waitUntil:"domcontentloaded"});
  await page.locator("#choices [data-choice]").first().waitFor();
  await page.evaluate(()=>{localStorage.setItem("hai-que-huong-progress-v3","untouched-original-save");localStorage.setItem("hai-que-huong-intro-v1","untouched-intro-save");});
  assert.equal(await page.locator("#speakerPortrait svg").count(),1);
  assert.equal(await page.locator("#emotionCaption").innerText().then(x=>x.length>0),true);
  const day1=await proceed(page,choices,"epilogue");
  assert.equal(day1.node,"epilogue");assert.equal(day1.done,false);
  assert.ok((await page.locator(".milestone-card").innerText()).includes("HẾT NGÀY THỨ NHẤT"));
  await page.screenshot({path:path.join(OUT,name+"-day-one.png"),fullPage:true});
  const oldKey=await page.evaluate(()=>localStorage.getItem(window.AnBranchStory.storageKey));
  await page.reload({waitUntil:"domcontentloaded"});await page.locator("#choices [data-choice]").first().waitFor();
  assert.equal((await read(page)).node,"epilogue");assert.equal(await page.evaluate(()=>localStorage.getItem(window.AnBranchStory.storageKey)),oldKey);
  await page.locator('#choices [data-choice="next"]').click();const morning=await read(page);assert.equal(morning.node,"day2-arrival");
  await page.locator('#choices [data-choice="next"]').click();const beginning=await read(page);
  assert.equal(beginning.node,choices["walk-home"]==="invite-friend"?"day2-guest-arrives":"day2-home-quiet");
  await page.locator('#choices [data-choice="next"]').click();const breakfast=await read(page);assert.equal(breakfast.node,"day2-breakfast");
  if(choices["walk-home"]==="invite-friend"){
    assert.ok(breakfast.choices.includes("prepare-for-guest"));
    assert.equal(await page.locator('#choices [data-choice="prepare-for-guest"] .unlocked-note').count(),1);
  }else{
    assert.ok(!breakfast.choices.includes("prepare-for-guest"));
    assert.equal(await page.locator('#choices [data-choice="prepare-for-guest"]').count(),0);
  }
  // Preserve the source state and prove invalid Mandarin does not grant a choice.
  const beforeInvalid=await read(page);
  await page.locator("#typedAnswer").fill("今天的天气很好");
  await page.locator("#typedForm button").click();
  assert.equal((await read(page)).node,beforeInvalid.node);
  await page.locator("#inputMessage").getAttribute("role");
  const end=await proceed(page,choices,"day2-epilogue");assert.equal(end.done,true);
  assert.equal(end.node,"day2-epilogue");
  const epilogue=await page.locator("#endingPanel").innerText();assert.ok(epilogue.includes("An học cách")&&epilogue.includes("Một ngày không quyết định"));
  assert.equal(await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v3")),"untouched-original-save");
  assert.equal(await page.evaluate(()=>localStorage.getItem("hai-que-huong-intro-v1")),"untouched-intro-save");
  assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth))<=5,"Horizontal overflow at "+width+"px");
  await page.screenshot({path:path.join(OUT,name+"-day-two.png"),fullPage:true});
  // Rewind once from a real completed story to verify a different An can start from the opening.
  await page.locator("#journalToggle").click();await page.locator(".rewind-btn").first().waitFor();
  page.once("dialog",dialog=>dialog.accept());await page.locator(".rewind-btn").first().click();
  const replay=await read(page);assert.equal(replay.node,"arrival");assert.equal(replay.path,0);
  assert.equal(await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v3")),"untouched-original-save");
  assert.equal(errors.length,0,"JavaScript errors: "+errors.join("; "));
  return {name,view:width,steps:end.path,ending:epilogue.slice(0,65),sourceUnchanged:true};
 }finally{await browser.close();}
}
(async()=>{
 const invite={"arrival":"hold-mother","school-gate":"ask-friend","lost-diary":"friend-search","staff-office":"say-simple","canteen":"help-liu","noodle-order":"share-bowl","walk-home":"invite-friend","night":"write-people","day2-breakfast":"prepare-for-guest","day2-bird":"bird-with-friend","day2-liu":"liu-stock","day2-night":"day2-letter-kind"};
 const curiosity={"arrival":"look-around","school-gate":"watch-first","lost-diary":"solo-search","staff-office":"ask-again","canteen":"read-menu","noodle-order":"try-hot","walk-home":"keep-secret","night":"write-question","day2-breakfast":"ask-diary-question","day2-bird":"bird-quiet","day2-liu":"liu-menu","day2-night":"day2-letter-curious"};
 const results=[];results.push(await runCase("desktop-invitation",1280,900,invite));results.push(await runCase("mobile-curiosity",360,780,curiosity));
 fs.writeFileSync(path.join(OUT,"browser-result.json"),JSON.stringify(results,null,2));
 console.log("Branch Novel real Chromium E2E:",JSON.stringify(results));
})().catch(err=>{console.error(err);process.exitCode=1});
