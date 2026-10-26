/* Actual Chromium end-to-end release gate. Run with NODE_PATH containing playwright,
 * HSK_URL=http://127.0.0.1:4173 and a static server rooted in hsk-story/.
 */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=process.env.HSK_URL||"http://127.0.0.1:4173";
const OUT=path.join(__dirname,"../test-results");
fs.mkdirSync(OUT,{recursive:true});
const errs=[];
function watch(page,label){page.on("pageerror",e=>errs.push(label+": "+e.message));}
async function visible(page,sel){return page.locator(sel).isVisible()}
async function goIntro(page,label){
 await page.goto(ROOT+"/nhap-mon.html",{waitUntil:"networkidle"});
 assert.match(await page.title(),/Nhập môn/);
 await page.locator('.glyph-option').first().click();
 assert.equal(await page.locator("#mainGlyph").innerText(),"人");
 assert.equal(await page.locator("#mainPinyin").innerText(),"rén");
 await page.reload();
 assert.equal(await page.locator("#mainGlyph").innerText(),"人");
 for(let i=0;i<6;i++)await page.locator("#nextBtn").click();
 assert.match(await page.locator("#position").innerText(),/07/);
 assert.equal(await page.locator("#curiosityDetails").count(),0,"Historical page must be optional");
 if(label==="desktop"){
  await page.locator("#interactive .number-button").first().click();
  assert.equal(await page.locator("#curiosityDetails").isVisible(),true);
  await page.screenshot({path:path.join(OUT,label+"-curiosity.png"),fullPage:true});
  await page.locator("#curiosityDetails .secondary").click();
  assert.equal(await page.locator("#curiosityDetails").count(),0);
 }
 await page.locator("#nextBtn").click();
 assert.match(await page.locator("#position").innerText(),/08/);
 let first=page.locator(".quiz-choice").first();
 await first.click();
 assert.equal(await page.locator(".quiz-choice:not([disabled])").count(),0);
 await page.locator("#nextBtn").click();
 assert.equal(await page.locator("#mainGlyph").innerText(),"众");
 await page.screenshot({path:path.join(OUT,label+"-intro.png"),fullPage:true});
}
async function goStory(page,label){
 await page.goto(ROOT+"/",{waitUntil:"networkidle"});
 const features=await page.evaluate(()=>({
  sceneArt:typeof HSKSceneArt==="object"&&typeof HSKSceneArt.render==="function",
  saveAdapter:typeof HSKSaveIO==="object"&&typeof HSKSaveIO.persist==="function",
  roadmap:[...document.querySelectorAll(".chapter.locked")].map(x=>({role:x.getAttribute("role"),tabIndex:x.getAttribute("tabindex"),disabled:x.getAttribute("aria-disabled")})),
  resources:performance.getEntriesByType("resource").filter(r=>new URL(r.name).origin===location.origin).map(r=>({name:new URL(r.name).pathname,transfer:r.transferSize,encoded:r.encodedBodySize,duration:Math.round(r.duration)})),
  viewport:window.innerWidth,scrollWidth:document.documentElement.scrollWidth
 }));
 assert.equal(features.sceneArt,true,"Separated scene-art module not loaded");
 assert.equal(features.saveAdapter,true,"Separated save-io module not loaded");
 assert.equal(features.roadmap.length,4);
 assert.ok(features.roadmap.every(x=>x.role===null&&x.tabIndex===null&&x.disabled==="true"),"HSK2–5 roadmap should not be actionable controls");
 fs.writeFileSync(path.join(OUT,label+"-resource-timings.json"),JSON.stringify(features,null,2));
 await page.locator("#startBtn").click();
 assert.equal(await visible(page,"#gameOverlay"),true);
 let finished=false,steps=0,practiceUsed=false,arrivalObserved=false,returnedTree=false;
 for(;steps<100;steps++){
  if(await visible(page,"#completionPane")){finished=true;break}
  if(await visible(page,"#storyInterlude")){await page.locator("#interludeContinue").click();continue}
  const stepText=await page.locator("#stepText").innerText();
  if(!arrivalObserved&&stepText.trim()==="01 / 10"&&await visible(page,"#worldPanel")){
   await page.locator("#worldActions button").first().click();
   assert.ok((await page.locator("#worldBridge").innerText()).includes("日"));
   await page.locator("#worldActions button").last().click();
   arrivalObserved=true;
   continue;
  }
  if(!returnedTree&&stepText.trim()==="07 / 10"&&await visible(page,"#worldPanel")){
   await page.locator("#worldActions button").first().click();
   assert.ok((await page.locator("#worldBridge").innerText()).includes("木"));
   assert.ok((await page.locator("#worldDescription").innerText()).includes("Sáng nay An"));
   returnedTree=true;
   continue;
  }
  if(await visible(page,"#encounterPanel")){
   if(await visible(page,"#encounterAnswerForm")){
    await page.locator("#encounterInput").fill("我叫安");
    await page.locator('#encounterAnswerForm button[type="submit"]').click();
   }else if(await visible(page,"#encounterContinue"))await page.locator("#encounterContinue").click();
   else{
    const action=page.locator("#encounterActions .encounter-action:not([disabled])").first();
    if(await action.count())await action.click();else throw Error("Encounter has no available action");
   }
   continue;
  }
  if(!practiceUsed&&label==="desktop"&&await visible(page,"#practiceOpenBtn")){
   await page.locator("#answerInput").fill("我叫");
   await page.locator("#practiceOpenBtn").click();
   assert.equal(await visible(page,"#skillPanel"),true);
   await page.locator("#skillSkip").click();
   await page.locator("#practiceCloseBtn").click();
   assert.equal(await page.locator("#answerInput").inputValue(),"我叫","Optional sidebranch lost learner draft");
   practiceUsed=true;continue;
  }
  if(await visible(page,"#skillPanel"))throw Error("Practice forced into mandatory main storyline");
  if(await visible(page,"#storyChoicePanel")){
   await page.locator("#storyChoiceOptions button").first().click();continue;
  }
  if(await visible(page,"#nextBtn")){await page.locator("#nextBtn").click();continue}
  if(await visible(page,"#answerForm")){
   const text=await page.evaluate(()=>{
    const i=Number(document.querySelector("#stepText").textContent.split("/")[0].trim())-1;
    return HSKContent.scenes[i].answers[0];
   });
   if(!text)throw Error("Missing authorized learner example answer");
   await page.locator("#answerInput").fill(text);
   await page.locator("#sendAnswer").click();continue;
  }
  throw Error("No valid next action at "+(await page.locator("#stepText").textContent()));
 }
 assert.equal(finished,true,"End-to-end story not finished after "+steps+" steps");
 const stats=await page.locator("#summaryStats").innerText();
 assert.match(stats,/3\/3 câu kiểm tra/);
 const v3=await page.evaluate(()=>JSON.parse(localStorage.getItem("hai-que-huong-progress-v3")));
 const v4=await page.evaluate(()=>JSON.parse(localStorage.getItem("hai-que-huong-progress-v4")));
 assert.equal(v3.done,true);assert.equal(v4.v,4);assert.equal(v4.storyId,"hsk1.e01");
 assert.equal(arrivalObserved,true,"Arrival observations must be accessible");
 assert.equal(returnedTree,true,"World callbacks must be accessible before final checkpoint");
 assert.equal(v3.worldFocus["hsk1.e01.arrival-greeting"],"diary");
 assert.equal(v3.worldFocus["hsk1.e01.walk-home"],"tree");
 assert.equal(v4.memory.worldFocus["hsk1.e01.walk-home"],"tree");
 if(label==="desktop"){assert.equal(practiceUsed,true);assert.equal(v3.skillSampler.results.length,1)}
 else assert.equal(v3.skillSampler.status,"pending","Mobile player should be able to skip optional practice entirely");
 await page.screenshot({path:path.join(OUT,label+"-ending.png"),fullPage:true});
 await page.goto(ROOT+"/?play=hsk1",{waitUntil:"networkidle"});
 assert.equal(await visible(page,"#gameOverlay"),true,"Deep-link HSK1 did not open saved story");
 assert.equal(await visible(page,"#completionPane"),true,"Completed progress did not survive reload");
}
async function testBrowser(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined,args:["--no-sandbox"]});
 try{
  for(const cfg of [{name:"desktop",viewport:{width:1280,height:800}},{name:"mobile",viewport:{width:360,height:800},isMobile:true,hasTouch:true}]){
   const ctx=await browser.newContext({viewport:cfg.viewport,isMobile:!!cfg.isMobile,hasTouch:!!cfg.hasTouch,locale:"vi-VN"});
   const page=await ctx.newPage();watch(page,cfg.name);
   await goIntro(page,cfg.name);
   // Independent progress: HSK is accessible and not a required continuation of prologue.
   await goStory(page,cfg.name);
   if(cfg.name==="mobile"){
    await page.goto(ROOT+"/nhap-mon.html",{waitUntil:"domcontentloaded"});
    const bad=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+5);
    assert.equal(bad,false,"Horizontal overflow in 360px pre-HSK introduction");
   }
   await ctx.close();
  }
  assert.deepEqual(errs,[]);
  console.log("Browser E2E: desktop 1280px + mobile 360px intro/Hanzi + full 10-scene HSK1 story + 3/3 checkpoint + save V3/V4 + reload: PASS");
 }finally{await browser.close()}
}
testBrowser().catch(e=>{console.error("Browser E2E failed:",e.stack||e);process.exitCode=1});
