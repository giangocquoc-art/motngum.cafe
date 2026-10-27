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
const layoutFindings=[];
let layoutChecks=0;
async function auditLayout(page,label,state){
 layoutChecks++;
 const result=await page.evaluate(()=>{
  const shell=document.querySelector('#gameOverlay:not([hidden])')||document.querySelector('.intro-screen')||document.querySelector('.review-screen')||document.body;
  const issues=[];
  if(document.documentElement.scrollWidth>innerWidth+2||document.documentElement.scrollHeight>innerHeight+2)issues.push({kind:'viewport-scroll',size:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],viewport:[innerWidth,innerHeight]});
  const interlude=shell.querySelector('#storyInterlude:not([hidden])'),player=shell.querySelector('.player-panel'),continueButton=shell.querySelector('#interludeContinue');
  if(interlude&&player&&continueButton){const panel=player.getBoundingClientRect(),button=continueButton.getBoundingClientRect(),bottomPadding=parseFloat(getComputedStyle(player).paddingBottom)||0;const unused=Math.round(panel.bottom-button.bottom-bottomPadding);if(unused>52)issues.push({kind:'unused-interlude-space',pixels:unused,viewport:[innerWidth,innerHeight]})}
  for(const el of shell.querySelectorAll('.player-panel,.story-ui,.interactive,.intro-learning,.book,.card,.notice,.curiosity-details,.notebook-panel,.world-panel')){
   const r=el.getBoundingClientRect();if(!r.width||!r.height||el.closest('[hidden]'))continue;
   if(el.scrollHeight>el.clientHeight+2)issues.push({kind:'panel-overflow',node:el.id||el.className,size:[el.clientHeight,el.scrollHeight]});
  }
  for(const el of shell.querySelectorAll('button,input,textarea,a,#interludeStory,#encounterBody,#dialogueText,#episodeReflection,#notebookPage p,#notebookResults,#worldDescription,#worldBridge')){
   const r=el.getBoundingClientRect(),cs=getComputedStyle(el),closedDetails=el.closest('details:not([open])');if(!r.width||!r.height||el.closest('[hidden]')||closedDetails&&!closedDetails.querySelector('summary')?.contains(el)||cs.visibility==='hidden'||cs.display==='none')continue;
   let clip={left:0,top:0,right:innerWidth,bottom:innerHeight},ancestor=el.parentElement;
   while(ancestor){const style=getComputedStyle(ancestor),a=ancestor.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(style.overflowY)){clip.top=Math.max(clip.top,a.top);clip.bottom=Math.min(clip.bottom,a.bottom)}if(/hidden|clip|auto|scroll/.test(style.overflowX)){clip.left=Math.max(clip.left,a.left);clip.right=Math.min(clip.right,a.right)}ancestor=ancestor.parentElement}
   if(r.top<clip.top-2||r.bottom>clip.bottom+2||r.left<clip.left-2||r.right>clip.right+2)issues.push({kind:'clipped-control-or-story',node:el.id||el.className,text:(el.textContent||'').trim().slice(0,55),rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)],clip});
  }
  const overlaps=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const visibleScenes=[...shell.querySelectorAll('.cs-scene')].filter(x=>!x.closest('[hidden]')&&x.getBoundingClientRect().width>0);
  if(visibleScenes.length!==1)issues.push({kind:'active-scene-count',count:visibleScenes.length});
  for(const actor of shell.querySelectorAll('.cs-actor')){
   if(actor.closest('[hidden]')||!actor.getBoundingClientRect().width)continue;
   const r=actor.getBoundingClientRect(),stage=actor.closest('.stage,.intro-scene,.review-scene,.hero-scene').getBoundingClientRect(),box=actor.dataset.face.split(',').map(Number);
   const face={left:r.left+r.width*box[0],top:r.top+r.height*box[1],right:r.left+r.width*box[2],bottom:r.top+r.height*box[3]};
   if(face.top<stage.top-1||face.bottom>stage.bottom+1||face.left<stage.left-1||face.right>stage.right+1)issues.push({kind:'clipped-face',character:actor.dataset.character,face,stage:[stage.left,stage.top,stage.right,stage.bottom]});
   if(face.bottom-face.top<24||face.right-face.left<24)issues.push({kind:'face-too-small',character:actor.dataset.character});
   for(const card of shell.querySelectorAll('.story-ui,.intro-dialogue,.glyph-frame,.opening,.hero-copy,.cs-foreground img,.cs-sparrow')){
    const c=card.getBoundingClientRect();if(!c.width||!c.height)continue;
    if(overlaps(face,c)>1)issues.push({kind:'face-covered-by-dialogue',character:actor.dataset.character,card:card.className,face:[face.left,face.top,face.right,face.bottom],overlay:[c.left,c.top,c.right,c.bottom]});
   }
  }
  for(const scene of shell.querySelectorAll('.cs-scene'))if(scene.querySelectorAll('[data-character="sparrow"]').length!==1)issues.push({kind:'sparrow-count',scene:scene.dataset.scene});
  return issues;
 });
 if(result.length){layoutFindings.push({label,state,issues:result});fs.writeFileSync(path.join(OUT,'layout-findings.json'),JSON.stringify(layoutFindings,null,2));}
}
function watch(page,label){page.on("pageerror",e=>errs.push(label+": "+e.message));}
async function assertSingleSparrowPresentation(page,label){const mark=page.locator('.sparrow-brand-mark');if(await mark.count()){const value=await mark.evaluate(el=>({text:el.textContent.trim(),image:getComputedStyle(el).backgroundImage}));assert.equal(value.text,'雀',label+' uses a text seal in place of a second bird drawing');assert.ok(!value.image.includes('sparrow-icon-v2'),label+' header must not duplicate the scene mascot')}}
async function visible(page,sel){return page.locator(sel).isVisible()}
async function auditWorld(page,label){
 const count=await page.locator('#worldActions button').count();
 for(let i=0;i<count;i++){
  await page.locator('#worldActions button').nth(i).click();await auditLayout(page,label,'observation-'+i);
  if(await visible(page,'#worldNext')){await page.locator('#worldNext').click();await auditLayout(page,label,'observation-bridge-'+i);await page.locator('#worldPrev').click()}
 }
}
async function goIntro(page,label){
 await page.goto(ROOT+"/nhap-mon.html",{waitUntil:"networkidle"});
 await assertSingleSparrowPresentation(page,label+' intro');
 assert.match(await page.title(),/Chim Sẻ/);
 await auditLayout(page,label,'intro-start');
 await page.locator('.glyph-option').first().click();
 assert.equal(await page.locator("#mainGlyph").innerText(),"人");
 assert.equal(await page.locator("#mainPinyin").innerText(),"rén");
 await page.reload();
 assert.equal(await page.locator("#mainGlyph").innerText(),"人");
 for(let i=1;i<4;i++)await page.locator('.glyph-option').nth(i).click();
 await auditLayout(page,label,'intro-discovered');await page.locator('#nextBtn').click();
 for(let i=0;i<3;i++)await page.locator('#interactive .primary').click();
 await auditLayout(page,label,'intro-strokes-complete');await page.locator('#nextBtn').click();
 for(const kind of ['forest','people']){await page.locator('#interactive .number-button').last().click();await auditLayout(page,label,'intro-'+kind);await page.locator('#nextBtn').click()}
 await page.locator('#interactive .parts button').first().click();await page.locator('#interactive .parts button').last().click();
 await auditLayout(page,label,'intro-light');await page.locator('#nextBtn').click();
 await page.locator('#interactive>.primary').click();await auditLayout(page,label,'intro-mother');await page.locator('#nextBtn').click();
 assert.match(await page.locator("#position").innerText(),/07/);
 assert.equal(await page.locator("#curiosityDetails").count(),0,"Historical page must be optional");
 {
  await page.locator("#interactive .number-button").first().click();
  assert.equal(await page.locator("#curiosityDetails").isVisible(),true);
  await auditLayout(page,label,'intro-curiosity');
  for(let i=1;i<3;i++){await page.locator('.curiosity-pages button').last().click();await auditLayout(page,label,'intro-curiosity-'+i)}
  await page.screenshot({path:path.join(OUT,label+"-curiosity.png"),fullPage:true});
  await page.locator("#curiosityDetails>.secondary").click();
  assert.equal(await page.locator("#curiosityDetails").count(),0);
 }
 await page.locator("#nextBtn").click();
 assert.match(await page.locator("#position").innerText(),/08/);
 for(let i=0;i<4;i++){
  if(i!==1){const answer=await page.evaluate(i=>HSKIntroContent.quizzes[i].answer,i);await page.locator('.quiz-choice').nth(i===0?(answer+1)%3:answer).click();assert.equal(await page.locator('.quiz-choice:not([disabled])').count(),0)}
  await auditLayout(page,label,'intro-quiz-'+i);await page.locator('#nextBtn').click();
 }
 await auditLayout(page,label,'intro-recap');await page.locator('#nextBtn').click();await auditLayout(page,label,'intro-ending');
 await page.screenshot({path:path.join(OUT,label+"-intro.png"),fullPage:true});
 await page.locator('#interactive .finish-card a').click();
 await page.locator('#gameOverlay').waitFor({state:'visible'});
 assert.equal(await visible(page,'#gameOverlay'),true,'Intro ending must open the story directly');
}
async function goStory(page,label){
 await page.goto(ROOT+"/",{waitUntil:"networkidle"});
 await assertSingleSparrowPresentation(page,label+' story');
 await auditLayout(page,label,'opening-scene');
 const features=await page.evaluate(()=>({
  sceneArt:typeof HSKSceneLayers==="object"&&typeof HSKSceneLayers.mount==="function",
  saveAdapter:typeof HSKSaveIO==="object"&&typeof HSKSaveIO.persist==="function",
  roadmap:[...document.querySelectorAll(".chapter.locked")].map(x=>({role:x.getAttribute("role"),tabIndex:x.getAttribute("tabindex"),disabled:x.getAttribute("aria-disabled"),visible:!!x.getClientRects().length})),
  resources:performance.getEntriesByType("resource").filter(r=>new URL(r.name).origin===location.origin).map(r=>({name:new URL(r.name).pathname,transfer:r.transferSize,encoded:r.encodedBodySize,duration:Math.round(r.duration)})),
  viewport:window.innerWidth,scrollWidth:document.documentElement.scrollWidth
 }));
 assert.equal(features.sceneArt,true,"Separated scene-art module not loaded");
 if(label==="mobile")assert.ok(features.scrollWidth<=features.viewport+5,"Homepage has horizontal overflow at 360px: "+features.scrollWidth);
 assert.equal(features.saveAdapter,true,"Separated save-io module not loaded");
 assert.ok(features.roadmap.every(x=>!x.visible),'Unplayable roadmap cards should be absent from the opening scene');
 assert.ok(features.roadmap.every(x=>x.role===null&&x.tabIndex===null&&x.disabled==="true"),"HSK2–5 roadmap should not be actionable controls");
 fs.writeFileSync(path.join(OUT,label+"-resource-timings.json"),JSON.stringify(features,null,2));
 await page.locator("#startBtn").click();
 assert.equal(await visible(page,"#gameOverlay"),true);
 let finished=false,steps=0,practiceUsed=false,supportUsed=false,arrivalObserved=false,returnedTree=false,streetEchoObserved=false;
 const capturedScenes=new Set();
 for(;steps<100;steps++){
  await auditLayout(page,label,'story-'+steps+'-'+(await page.locator('#stepText').innerText()));
  const artId=await page.locator('#stageIllustration .cs-scene').getAttribute('data-scene');
  if(!capturedScenes.has(artId)){
   await page.locator('#stageIllustration .cs-background img').evaluate(img=>img.decode());
   if(['hsk1.e01.liu-noodle-order','hsk1.e01.liu-payment'].includes(artId)){
     await page.waitForFunction(()=>{const img=document.querySelector('#stageIllustration .cs-midground img');return img&&img.getAttribute('src')&&img.complete&&img.naturalWidth>0});
     await page.locator('#stageIllustration .cs-midground img').evaluate(img=>img.decode());
     const composition=await page.evaluate(()=>{const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};const bg=document.querySelector('#stageIllustration .cs-background img'),art=document.querySelector('#stageIllustration');return {menu:rect(document.querySelector('#stageIllustration .cs-midground img')),dialogue:rect(document.querySelector('#storyDialogue')),stage:rect(document.querySelector('#storyStage')),layout:art.dataset.composition,background:{naturalWidth:bg.naturalWidth,naturalHeight:bg.naturalHeight,src:bg.currentSrc},bowl:document.querySelector('#stageIllustration .cs-foreground img')?rect(document.querySelector('#stageIllustration .cs-foreground img')):null}});
     const viewport=page.viewportSize();
     if(viewport.width<=900&&viewport.height>viewport.width){assert.equal(composition.background.naturalWidth,1024,'Portrait tablet should use the native portrait shop background: '+JSON.stringify(composition.background));if(viewport.width>690&&composition.stage.height>composition.stage.width*.72)assert.equal(composition.layout,'portrait','Tablet portrait should compose actors below the dialogue on its portrait plate')}
    assert.ok(composition.menu.width>0&&composition.menu.height>0,'Noodle menu must be visible: '+artId);
     assert.ok(composition.menu.right>composition.stage.left&&composition.menu.left<composition.stage.right&&composition.menu.bottom>composition.stage.top&&composition.menu.top<composition.stage.bottom,'Noodle menu must intersect the visible scene: '+JSON.stringify({viewport,composition}));
    assert.ok(composition.menu.right<=composition.dialogue.left||composition.menu.left>=composition.dialogue.right||composition.menu.bottom<=composition.dialogue.top||composition.menu.top>=composition.dialogue.bottom,'Menu is covered by dialogue: '+artId+' '+JSON.stringify(composition));
     if(artId==='hsk1.e01.liu-payment'){assert.ok(composition.bowl&&composition.bowl.width>40,'The price dialogue needs the served bowl in view: '+JSON.stringify({viewport,composition}));assert.ok(composition.bowl.top>=composition.stage.top-2&&composition.bowl.bottom<=composition.stage.bottom+2,'Bowl is clipped at the scene edge: '+JSON.stringify({viewport,composition}))}
    if(artId==='hsk1.e01.liu-noodle-order')assert.equal(composition.bowl,null,'No served food before the player chooses a dish');
   }
   await page.screenshot({path:path.join(OUT,label+'-scene-'+artId+'.png')});capturedScenes.add(artId);
  }
  if(await visible(page,"#completionPane")){finished=true;break}
  if(await visible(page,"#storyInterlude")){
   if((await page.locator('#interludeHeading').innerText())==='Mùi hương trong ngõ'){
    assert.equal((await page.locator('#dialogueText').innerText()).trim(),'安和小雨在面馆里。','Noodle-shop illustration must match the narrated place');
    assert.equal(await page.locator('#interludeTranslation').count(),0,'Story translation is already shown in the dialogue layer');
    assert.equal(await page.locator('#stageIllustration [data-character="sparrow"]').count(),1,'The scene must show exactly one Sẻ');
   }
   await page.locator("#interludeContinue").click();continue
  }
  const stepText=await page.locator("#stepText").innerText();
  if((!arrivalObserved&&stepText.trim()==='01 / 10'||!returnedTree&&stepText.trim()==='07 / 10')&&!await visible(page,'#worldPanel')&&await visible(page,'#worldOpenBtn'))await page.locator('#worldOpenBtn').click();
  if(!streetEchoObserved&&stepText.trim()==="07 / 10"&&await visible(page,"#storyEcho")){
   const echo=await page.locator("#storyEcho").innerText();
   assert.ok(echo.includes("明天见"),"The walk-home scene did not reuse a known expression");
   assert.ok(echo.includes("Tiểu Vũ")||echo.includes("An nhận ra"),"Missing continuity from earlier story choices");
   streetEchoObserved=true;
  }
  if(!arrivalObserved&&stepText.trim()==="01 / 10"&&await visible(page,"#worldPanel")){
   await auditWorld(page,label);
   await page.locator("#worldActions button").first().click();
   assert.ok((await page.locator("#worldBridge").innerText()).includes("日"));
   await page.locator("#worldActions button").last().click();
   await page.locator('#notebookBtn').click();await auditLayout(page,label,'notebook-from-observation');await page.locator('#notebookClose').click();
   arrivalObserved=true;
   continue;
  }
  if(!returnedTree&&stepText.trim()==="07 / 10"&&await visible(page,"#worldPanel")){
   await auditWorld(page,label);
   await page.locator("#worldActions button").first().click();
   assert.ok((await page.locator("#worldBridge").innerText()).includes("木"));
   assert.ok((await page.locator("#worldDescription").innerText()).includes("Sáng nay An"));
   await page.locator('#worldCloseBtn').click();
   returnedTree=true;
   continue;
  }
  if(await visible(page,"#encounterPanel")){
   const stage=await page.evaluate(()=>JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}').encounter?.stage);
   const current=page.locator('#stageIllustration .cs-scene');
   if(stage==='inspect'||stage==='decide'){
    assert.equal(await current.getAttribute('data-scene'),'lost-notebook','Classroom search must keep its own scene');
    assert.equal(await page.locator('#stageIllustration [data-character="receptionist"]').count(),0,'Receptionist appears only after An reaches the office');
   }
   if(stage==='respond'||stage==='outcome'){
    assert.equal(await current.getAttribute('data-scene'),'lost-notebook-office','Responding to the receptionist must show the school office');
    assert.equal(await page.locator('#stageIllustration [data-character="receptionist"]').count(),1);
   }
   if(await visible(page,"#encounterAnswerForm")){
    await page.locator("#encounterInput").fill("我叫安");
    await page.locator('#encounterAnswerForm button[type="submit"]').click();
   }else if(await visible(page,"#encounterContinue"))await page.locator("#encounterContinue").click();
   else{
    const route=await page.evaluate(()=>JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}').encounter?.stage);
    const actions=page.locator("#encounterActions .encounter-action:not([disabled])"),action=route==='decide'&&label==='mobile'?actions.last():actions.first();
    if(await action.count())await action.click();else throw Error("Encounter has no available action");
   }
   continue;
  }
  if(!practiceUsed&&label==="desktop"&&await visible(page,"#practiceOpenBtn")){
   await page.locator("#answerInput").fill("我叫");
   await page.locator("#practiceOpenBtn").click();
   assert.equal(await visible(page,"#skillPanel"),true);
   await auditLayout(page,label,'optional-practice-open');
   await page.locator("#skillSkip").click();
   await auditLayout(page,label,'optional-practice-after-skip');
   await page.screenshot({path:path.join(OUT,label+'-practice-current.png')});
   await page.locator("#practiceCloseBtn").click();
   assert.equal(await page.locator("#answerInput").inputValue(),"我叫","Optional sidebranch lost learner draft");
   practiceUsed=true;continue;
  }
  if(await visible(page,"#skillPanel"))throw Error("Practice forced into mandatory main storyline");
  if(await visible(page,"#storyChoicePanel")){
   const choices=page.locator("#storyChoiceOptions button");await (label==='mobile'?choices.last():choices.first()).click();
   if((await page.locator('#stepText').innerText()).trim()==='05 / 10'){
    assert.equal(await page.locator('#stageIllustration .cs-scene').getAttribute('data-scene'),'hsk1.e01.liu-noodle-order');
    assert.equal(await page.locator('#stageIllustration img[data-asset="layers/noodle-bowl-v3.webp"]').count(),0,'The order is selected before the bowl is served');
    await page.screenshot({path:path.join(OUT,label+'-scene-noodle-order-selected.png')});
   }
   continue;
  }
  if(await visible(page,"#nextBtn")){await page.locator("#nextBtn").click();continue}
  if(await visible(page,"#answerForm")){
   if(!supportUsed){
    await page.waitForFunction(()=>performance.getEntriesByType('resource').some(x=>x.name.endsWith('/art/'+HSKSceneLayers.backgrounds['school-gate'][matchMedia('(max-width:900px) and (orientation:portrait)').matches?'mobile':'desktop'])));
    if(await visible(page,'#worldPanel'))await page.locator('#worldCloseBtn').click();
    assert.equal(await visible(page,'#sparrowWhisper'),false,'Ambient speech must not cover the lesson');
    const prompt=await page.locator('#dialogueText').textContent();await page.locator('#sparrowTalkBtn').click();
    await auditLayout(page,label,'sparrow-conversation');assert.equal(await visible(page,'#dialogueText'),false);
    await page.locator('#sparrowTalkClose').click();assert.equal(await page.locator('#dialogueText').textContent(),prompt);
    await page.locator('#answerInput').fill('不知道');await page.locator('#sendAnswer').click();
    assert.equal(await page.locator('#stageIllustration [data-character="an"]').getAttribute('data-expression'),'awkward');
    await auditLayout(page,label,'answer-wrong');if(await visible(page,'#worldPanel'))await page.locator('#worldCloseBtn').click();await page.locator('#hintBtn').click();
    await auditLayout(page,label,'answer-hint');await page.locator('#notebookBtn').click();
    await auditLayout(page,label,'notebook-first-hint');await page.locator('#notebookClose').click();
    await page.locator('#openBuilderBtn').click();await auditLayout(page,label,'answer-builder');
    for(const token of ['我','很','好'])await page.locator('#tileList button').filter({hasText:new RegExp('^'+token+'$')}).click();
    await auditLayout(page,label,'answer-built');assert.equal(await page.locator('#answerInput').inputValue(),'不知道我很好');
    await page.locator('#tileClear').click();for(const token of ['我','很','好'])await page.locator('#tileList button').filter({hasText:new RegExp('^'+token+'$')}).click();
    supportUsed=true;
   }
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
 if(!finished){await page.screenshot({path:path.join(OUT,label+'-stuck.png')});console.error(await page.evaluate(()=>({step:document.querySelector('#stepText').textContent,feedback:document.querySelector('#feedback').textContent,answer:document.querySelector('#answerInput').value,panels:['storyInterlude','encounterPanel','skillPanel','storyChoicePanel','nextBtn','answerForm'].map(id=>[id,!document.getElementById(id).hidden])})))}
 assert.equal(finished,true,"End-to-end story not finished after "+steps+" steps");
 const expectedCaptures=await page.evaluate(()=>[...HSKSceneLayers.sceneIds,'lost-notebook-office'].sort());
 assert.deepEqual([...capturedScenes].sort(),expectedCaptures,'Every state-authored story/encounter scene needs a real decoded-image capture');
 const stats=await page.locator("#summaryStats").textContent();
 assert.match(stats,/3\/3 câu kiểm tra/);
 const v3=await page.evaluate(()=>JSON.parse(localStorage.getItem("hai-que-huong-progress-v3")));
 const v4=await page.evaluate(()=>JSON.parse(localStorage.getItem("hai-que-huong-progress-v4")));
 assert.equal(v3.done,true);assert.equal(v4.v,4);assert.equal(v4.storyId,"hsk1.e01");
 assert.equal(v3.history[0].hint,true,'Using the builder must retain assistance credit');
 assert.equal(streetEchoObserved,true,"Existing language thread not observed at the walk-home scene");
 const ending=await page.locator("#episodeReflection").innerText();
 assert.ok(ending.length>0&&ending.includes("An"),"Story ending does not reflect the player's choices");
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
 const beforeNotebook=await page.evaluate(()=>localStorage.getItem('hai-que-huong-progress-v3'));
 await page.locator('#notebookBtn').click();await auditLayout(page,label,'notebook-completed');
 await page.screenshot({path:path.join(OUT,label+'-notebook.png')});
 const collectedWords=[];
 for(const section of ['Words','Memory','Learning','Settings']){
  await page.locator('#notebook'+section+'Tab').click();let n=0;
  while(true){
   await auditLayout(page,label,'notebook-'+section+'-'+n);
   if(section==='Words')collectedWords.push(...await page.locator('#notebookWords button:visible .notebook-hanzi').allTextContents());
   if(await page.locator('#notebookNext').isDisabled())break;
   assert.ok(++n<40,'Notebook pagination must terminate');await page.locator('#notebookNext').click();
  }
 }
 assert.deepEqual(collectedWords,await page.locator('#notebookWords .notebook-hanzi').allTextContents(),'Every learned word must be accessible once across pages');
 await page.locator('#notebookClose').click();
 assert.equal(await page.evaluate(()=>localStorage.getItem('hai-que-huong-progress-v3')),beforeNotebook,'Reading the notebook must not mutate story progress');
}
async function goReview(page,label,withStory){
 await page.goto(ROOT+"/ren-luyen.html",{waitUntil:"networkidle"});
 await assertSingleSparrowPresentation(page,label+' review');
 await auditLayout(page,label,withStory?'review-unlocked':'review-empty');
 const locked=await page.locator("#unlockedCount").textContent();
 if(!withStory){
  assert.equal(locked,"0","New learner must not see future story answer prompts");
  assert.equal(await page.locator("#exerciseCard").isVisible(),false);
  assert.equal(await page.locator("#taskTitle").innerText(),"Mở trang đầu tiên của câu chuyện");
  return;
 }
 assert.equal(locked,"18","Full demo should unlock all authored review items");
 assert.equal(await page.locator("#dueCount").textContent(),"18");
 const oldV3=await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v3"));
 const oldV4=await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v4"));
 const first=await page.evaluate(()=>HSKReviewData.items[0]);
 const idx=first.options.findIndex(x=>x[0]===first.correct);
 await page.locator("#choiceOptions button").nth(idx).click();
 await auditLayout(page,label,'review-first-feedback');
 assert.equal(await page.locator("#independentCount").textContent(),"1");
 assert.equal(await page.locator("#dueCount").textContent(),"17");
 await page.locator("#nextBtn").click();
 await page.locator("#hintBtn").click();
 const second=await page.evaluate(()=>HSKReviewData.items[1]);
 await page.locator("#choiceOptions button").nth(second.options.findIndex(x=>x[0]===second.correct)).click();
 assert.equal(await page.locator("#assistedCount").textContent(),"1");
 await page.locator("#nextBtn").click();
 await page.locator("#skipBtn").click();
 await page.locator("#nextBtn").click();
 assert.equal(await page.locator("#taskKind").innerText(),"NHẬP CHỮ HÁN");
 await page.locator("#typedAnswer").fill("我叫安");
 await page.locator("#submitTyped").click();
 assert.equal(await page.locator("#independentCount").textContent(),"2");
 assert.equal(await page.locator("#dueCount").textContent(),"14");
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("hai-que-huong-review-v1")));
 assert.equal(saved.items["self-introduction"].status,"independent");
 assert.equal(saved.items["arrived-city"].status,"assisted");
 assert.equal(saved.items["name-character"].status,"skipped");
 assert.equal(await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v3")),oldV3,"Optional review mutated canonical story V3 save");
 assert.equal(await page.evaluate(()=>localStorage.getItem("hai-que-huong-progress-v4")),oldV4,"Optional review mutated V4 shadow");
 await page.screenshot({path:path.join(OUT,label+"-spaced-review.png"),fullPage:true});
 await page.reload({waitUntil:"networkidle"});
 assert.equal(await page.locator("#dueCount").textContent(),"14","Review schedule did not survive reload");
 for(let n=0;n<14;n++){
  await auditLayout(page,label,'review-item-'+(n+5));
  const item=await page.evaluate(()=>HSKReviewData.items.find(x=>x.question===document.querySelector('#questionPrompt').textContent));
  assert.ok(item,'Active review item must be authored');
  if(item.kind==='typed'){await page.locator('#typedAnswer').fill(item.answers[0]);await page.locator('#submitTyped').click()}
  else await page.locator('#choiceOptions button').nth(item.options.findIndex(x=>x[0]===item.correct)).click();
  await auditLayout(page,label,'review-feedback-'+(n+5));await page.locator('#nextBtn').click();
 }
 assert.equal(await page.locator('#dueCount').textContent(),'0');await auditLayout(page,label,'review-finished');
 assert.equal(await page.evaluate(()=>localStorage.getItem('hai-que-huong-progress-v3')),oldV3,'Complete review mutated story progress');
 if(label==="mobile")assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+5),false,"Review page horizontal overflow at 360px");
}
async function testBrowser(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined,args:["--no-sandbox"]});
 try{
  const devices=[{name:"desktop",viewport:{width:1280,height:800}},{name:"mobile",viewport:{width:360,height:800},isMobile:true,hasTouch:true},{name:'phone-landscape',viewport:{width:844,height:390},isMobile:true,hasTouch:true},{name:'tablet',viewport:{width:768,height:1024},hasTouch:true},{name:'tablet-landscape',viewport:{width:1024,height:768},hasTouch:true}];
  const selected=process.env.HSK_QA_DEVICES?.split(',');
  for(const cfg of devices.filter(x=>!selected||selected.includes(x.name))){
   const ctx=await browser.newContext({viewport:cfg.viewport,isMobile:!!cfg.isMobile,hasTouch:!!cfg.hasTouch,locale:"vi-VN",reducedMotion:'reduce'});
   const page=await ctx.newPage();watch(page,cfg.name);
   page.setDefaultTimeout(8000);
   await goIntro(page,cfg.name);
   await goReview(page,cfg.name,false);
   // Independent progress: HSK is accessible and not a required continuation of prologue.
   await goStory(page,cfg.name);
   await goReview(page,cfg.name,true);
   if(cfg.name==="mobile"){
    await page.goto(ROOT+"/nhap-mon.html",{waitUntil:"domcontentloaded"});
    const bad=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+5);
    assert.equal(bad,false,"Horizontal overflow in 360px pre-HSK introduction");
   }
   await ctx.close();
   console.log('Browser flow '+cfg.name+': completed');
  }
  if(!selected||selected.includes('mobile')||selected.includes('keyboard')){
   for(const device of [{name:'phone',width:390,height:844,visible:500},{name:'phone-landscape',width:844,height:390,visible:240},{name:'tablet',width:768,height:1024,visible:500}])await verifyKeyboard(browser,device);
  }
  assert.deepEqual(errs,[]);
  fs.writeFileSync(path.join(OUT,'layout-findings.json'),JSON.stringify(layoutFindings,null,2));
  assert.equal(layoutFindings.length,0,'Layout violations in '+layoutFindings.length+' states; see test-results/layout-findings.json');
  fs.writeFileSync(path.join(OUT,'qa-summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),scenarios:selected||devices.map(x=>x.name),layoutChecks,result:'PASS',limits:['No physical-device keyboard tested','Face rectangles are manually authored guides; original-reference style fidelity and alpha silhouettes still require visual review','AI provider response is mocked for keyboard checks']},null,2));
  console.log("Browser E2E: requested scenarios completed, "+layoutChecks+' measured layout states: PASS');
 }finally{await browser.close()}
}
async function verifyKeyboard(browser,device){
 const full={width:device.width,height:device.height},contracted={width:device.width,height:device.visible};
 const ctx=await browser.newContext({viewport:full,isMobile:true,hasTouch:true,locale:'vi-VN'});
 await ctx.addInitScript(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined});
 const page=await ctx.newPage();watch(page,'keyboard');page.setDefaultTimeout(8000);
 try{
  await page.goto(ROOT+'/?play=hsk1',{waitUntil:'networkidle'});
  await page.locator('#interludeContinue').click();
  if(device.name==='phone'){
   const insetStyle=await page.addStyleTag({content:'.game-top{padding-top:42px!important}'});
   await page.waitForFunction(()=>Math.abs(parseFloat(document.querySelector('#storyStage').style.getPropertyValue('--scene-header'))-document.querySelector('.game-top').getBoundingClientRect().bottom)<1);
   await auditLayout(page,device.name,'header-safe-inset');await insetStyle.evaluate(x=>x.remove());
  }
  await page.locator('#micBtn').click();assert.match(await page.locator('#toast').textContent(),/không có chức năng/);
  await page.route('**/api/ai/tutor',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:'你好 là lời chào.'})}));
  await page.locator('#aiTutorBtn').click();await page.locator('#aiTutorInput').fill('你好 nghĩa là gì?');
  await page.setViewportSize(contracted);await page.waitForFunction(()=>document.querySelector('#gameShell').classList.contains('keyboard-open'));
  await auditLayout(page,device.name,'keyboard-ai');await page.locator('#aiTutorSend').click();
  await page.waitForFunction(()=>[...document.querySelectorAll('.ai-tutor-assistant')].some(x=>x.textContent==='你好 là lời chào.'));
  await page.locator('#aiTutorClose').click();await page.setViewportSize(full);
  await page.locator('#answerInput').fill('我很好');
  assert.equal(await page.locator('#gameShell').evaluate(x=>x.classList.contains('keyboard-open')),false,'Focus alone should not move submit controls');
  await page.setViewportSize(contracted);await page.waitForFunction(()=>document.querySelector('#gameShell').classList.contains('keyboard-open'));
  await auditLayout(page,device.name,'keyboard-answer');await page.locator('#openBuilderBtn').click();await auditLayout(page,device.name,'keyboard-builder');await page.locator('#builderClose').click();await page.locator('#sendAnswer').click();
  assert.equal(await visible(page,'#nextBtn'),true,'Focus moving to Send must preserve the pointer click');
  await page.setViewportSize(full);await page.waitForFunction(()=>!document.querySelector('#gameShell').classList.contains('keyboard-open'));
  console.log('Keyboard '+device.name+': sent AI question and story answer');
 }finally{await ctx.close()}
}
testBrowser().catch(e=>{console.error("Browser E2E failed:",e.stack||e);process.exitCode=1});
