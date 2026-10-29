/* Actual Chromium end-to-end release gate. Run with NODE_PATH containing playwright,
 * HSK_URL=http://127.0.0.1:4173 and a static server rooted in hsk-story/.
 */
const {chromium}=require("playwright");
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const ROOT=process.env.HSK_URL||"http://127.0.0.1:4173";
const OUT=path.resolve(process.env.HSK_E2E_OUT_DIR||path.join(__dirname,"../test-results"));
fs.mkdirSync(OUT,{recursive:true});
async function qaContext(browser,options){const ctx=await browser.newContext(options);if(process.env.HSK_PREVIEW_ACCESS)await ctx.request.get(process.env.HSK_PREVIEW_ACCESS);return ctx}
const errs=[];
const layoutFindings=[];
const nativePreloadChecks=[];
let layoutChecks=0;
async function auditLayout(page,label,state){
 layoutChecks++;
 // Let ResizeObserver finish collision-aware mascot placement after scene swaps.
 // Wait for rendered SVG/raster assets to establish their intrinsic size first;
 // the scene renderer fits actors after image decode, so pre-load boxes are stale.
 await page.waitForFunction(()=>{
  const images=[...document.querySelectorAll('.cs-scene img')].filter(img=>!img.closest('[hidden]'));
  return images.length===0||images.every(img=>img.complete&&img.naturalWidth>0);
 });
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const result=await page.evaluate(()=>{
  const shell=document.querySelector('#gameOverlay:not([hidden])')||document.querySelector('.intro-screen')||document.querySelector('.review-screen')||document.body;
  const issues=[];
  if(document.documentElement.scrollWidth>innerWidth+2||document.documentElement.scrollHeight>innerHeight+2)issues.push({kind:'viewport-scroll',size:[document.documentElement.scrollWidth,document.documentElement.scrollHeight],viewport:[innerWidth,innerHeight]});
  const activeGame=document.querySelector('#gameOverlay:not([hidden])');if(activeGame){const home=document.querySelector('#heroArt');if(home&&getComputedStyle(home).visibility!=='hidden')issues.push({kind:'home-scene-visible-during-game'});const birds=[...document.querySelectorAll('.cs-sparrow')].filter(el=>getComputedStyle(el).visibility!=='hidden'&&getComputedStyle(el).display!=='none'&&el.getBoundingClientRect().width>0);if(birds.length!==1)issues.push({kind:'visible-sparrow-count',count:birds.length})}
  const interlude=shell.querySelector('#storyInterlude:not([hidden])'),player=shell.querySelector('.player-panel'),continueButton=shell.querySelector('#interludeContinue');
  if(interlude&&player&&continueButton){const panel=player.getBoundingClientRect(),button=continueButton.getBoundingClientRect(),bottomPadding=parseFloat(getComputedStyle(player).paddingBottom)||0;const unused=Math.round(panel.bottom-button.bottom-bottomPadding);if(unused>52)issues.push({kind:'unused-interlude-space',pixels:unused,viewport:[innerWidth,innerHeight]})}
  for(const el of shell.querySelectorAll('.player-panel,.story-ui,.interactive,.intro-learning,.book,.card,.notice,.curiosity-details,.notebook-panel,.world-panel,details.source-details[open]')){
   const r=el.getBoundingClientRect();if(!r.width||!r.height||el.closest('[hidden]'))continue;
   if(el.scrollHeight>el.clientHeight+2){
    const childMetrics=[...el.children].map(child=>{const cr=child.getBoundingClientRect(),cc=getComputedStyle(child);const descendants=[...child.children].map(grandchild=>{const gr=grandchild.getBoundingClientRect(),gc=getComputedStyle(grandchild);return {id:grandchild.id,className:typeof grandchild.className==='string'?grandchild.className:grandchild.getAttribute('class'),hidden:grandchild.hidden,display:gc.display,visibility:gc.visibility,client:[grandchild.clientWidth,grandchild.clientHeight],scroll:[grandchild.scrollWidth,grandchild.scrollHeight],rect:[Math.round(gr.left),Math.round(gr.top),Math.round(gr.right),Math.round(gr.bottom)],margin:gc.margin,padding:gc.padding,overflowY:gc.overflowY,text:(grandchild.textContent||'').trim().slice(0,80)}}).filter(x=>!x.hidden&&x.display!=='none'&&x.visibility!=='hidden');return {id:child.id,className:typeof child.className==='string'?child.className:child.getAttribute('class'),hidden:child.hidden,display:cc.display,visibility:cc.visibility,client:[child.clientWidth,child.clientHeight],scroll:[child.scrollWidth,child.scrollHeight],rect:[Math.round(cr.left),Math.round(cr.top),Math.round(cr.right),Math.round(cr.bottom)],margin:cc.margin,padding:cc.padding,overflowY:cc.overflowY,text:(child.textContent||'').trim().slice(0,100),children:descendants}}).filter(x=>!x.hidden&&x.display!=='none'&&x.visibility!=='hidden');
    const gameShell=activeGame?.querySelector('.game-shell');
    issues.push({kind:'panel-overflow',node:el.id||el.className,size:[el.clientHeight,el.scrollHeight],diagnostic:{mode:gameShell?.dataset.mode||null,gameShellClass:gameShell?.className||null,overlayClass:activeGame?.className||null,stepText:shell.querySelector('#stepText')?.textContent?.trim()||null,panel:{id:el.id,className:typeof el.className==='string'?el.className:el.getAttribute('class'),rect:(()=>{const r=el.getBoundingClientRect();return [Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]})(),client:[el.clientWidth,el.clientHeight],scroll:[el.scrollWidth,el.scrollHeight],margin:getComputedStyle(el).margin,padding:getComputedStyle(el).padding,overflowY:getComputedStyle(el).overflowY},visibleChildren:childMetrics}});
   }
  }
  for(const el of shell.querySelectorAll('button,input,textarea,a,summary,#interludeStory,#encounterBody,#dialogueText,#episodeReflection,#notebookPage p,#notebookResults,#worldDescription,#worldBridge')){
   const r=el.getBoundingClientRect(),cs=getComputedStyle(el),closedDetails=el.closest('details:not([open])');if(!r.width||!r.height||el.closest('[hidden]')||closedDetails&&!closedDetails.querySelector('summary')?.contains(el)||cs.visibility==='hidden'||cs.display==='none')continue;
   let clip={left:0,top:0,right:innerWidth,bottom:innerHeight},ancestor=el.parentElement;
   while(ancestor){const style=getComputedStyle(ancestor),a=ancestor.getBoundingClientRect();if(/hidden|clip|auto|scroll/.test(style.overflowY)){clip.top=Math.max(clip.top,a.top);clip.bottom=Math.min(clip.bottom,a.bottom)}if(/hidden|clip|auto|scroll/.test(style.overflowX)){clip.left=Math.max(clip.left,a.left);clip.right=Math.min(clip.right,a.right)}ancestor=ancestor.parentElement}
   if(r.top<clip.top-2||r.bottom>clip.bottom+2||r.left<clip.left-2||r.right>clip.right+2)issues.push({kind:'clipped-control-or-story',node:el.id||el.className,text:(el.textContent||'').trim().slice(0,55),rect:[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)],clip});
  }
  const rgb=value=>{const match=value.match(/rgba?\(([^)]+)\)/);if(!match)return null;const parts=match[1].split(',').map(Number);return {r:parts[0],g:parts[1],b:parts[2],a:parts[3]===undefined?1:parts[3]}};
  const linear=value=>{value/=255;return value<=.04045?value/12.92:Math.pow((value+.055)/1.055,2.4)};
  const luminance=value=>.2126*linear(value.r)+.7152*linear(value.g)+.0722*linear(value.b);
  const foregroundContrast=(front,back)=>{const a=luminance(front),b=luminance(back);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
  const solidBackground=el=>{for(let node=el;node;node=node.parentElement){const value=rgb(getComputedStyle(node).backgroundColor);if(value&&value.a>=.88)return value}return rgb(getComputedStyle(document.body).backgroundColor)};
  for(const control of shell.querySelectorAll('a,button,summary,input,textarea')){
   const r=control.getBoundingClientRect(),style=getComputedStyle(control),closedDetails=control.closest('details:not([open])');
   if(!r.width||!r.height||control.closest('[hidden]')||closedDetails&&!closedDetails.querySelector('summary')?.contains(control)||style.display==='none'||style.visibility==='hidden'||control.disabled)continue;
   const text=(control.textContent||control.value||control.getAttribute('aria-label')||'').trim(),fontSize=parseFloat(style.fontSize),front=rgb(style.color),back=solidBackground(control),ratio=front&&back?foregroundContrast(front,back):null;
   if(text&&fontSize<10)issues.push({kind:'small-action-text',node:control.id||control.className||control.tagName,text:text.slice(0,42),fontSize});
   if(r.width<24||r.height<24)issues.push({kind:'small-pointer-target',node:control.id||control.className||control.tagName,text:text.slice(0,42),size:[Math.round(r.width),Math.round(r.height)]});
   if(ratio!==null&&ratio<4.5)issues.push({kind:'low-control-contrast',node:control.id||control.className||control.tagName,text:text.slice(0,42),ratio:+ratio.toFixed(2),foreground:style.color,background:getComputedStyle((()=>{for(let n=control;n;n=n.parentElement){const c=rgb(getComputedStyle(n).backgroundColor);if(c&&c.a>=.88)return n}return document.body})()).backgroundColor});
  }
  const overlaps=(a,b)=>Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const tutor= shell.querySelector('.player-panel.ai-tutor-active'),dialogue=shell.querySelector('.story-ui');
  if(tutor&&dialogue&&overlaps(tutor.getBoundingClientRect(),dialogue.getBoundingClientRect())>1)issues.push({kind:'tutor-covers-story-dialogue',viewport:[innerWidth,innerHeight],tutor:(()=>{const r=tutor.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})(),dialogue:(()=>{const r=dialogue.getBoundingClientRect();return [r.left,r.top,r.right,r.bottom]})()});
  const visibleScenes=[...shell.querySelectorAll('.cs-scene')].filter(x=>!x.closest('[hidden]')&&x.getBoundingClientRect().width>0);
  if(visibleScenes.length!==1)issues.push({kind:'active-scene-count',count:visibleScenes.length});
  for(const actor of shell.querySelectorAll('.cs-actor')){
   const actorStyle=getComputedStyle(actor);
   if(actor.closest('[hidden]')||actorStyle.visibility==='hidden'||Number(actorStyle.opacity)===0||!actor.getBoundingClientRect().width)continue;
   const r=actor.getBoundingClientRect(),stage=actor.closest('.stage,.intro-scene,.review-scene,.hero-scene').getBoundingClientRect(),box=actor.dataset.face.split(',').map(Number);
   const face={left:r.left+r.width*box[0],top:r.top+r.height*box[1],right:r.left+r.width*box[2],bottom:r.top+r.height*box[3]};
   if(face.top<stage.top-1||face.bottom>stage.bottom+1||face.left<stage.left-1||face.right>stage.right+1)issues.push({kind:'clipped-face',character:actor.dataset.character,face,stage:[stage.left,stage.top,stage.right,stage.bottom]});
   if(face.bottom-face.top<24||face.right-face.left<24){const parent=actor.parentElement.getBoundingClientRect(),host=actor.closest('.chimse-art');issues.push({kind:'face-too-small',character:actor.dataset.character,faceSize:[+(face.right-face.left).toFixed(1),+(face.bottom-face.top).toFixed(1)],actorSize:[+r.width.toFixed(1),+r.height.toFixed(1)],container:actor.parentElement.className,containerRect:[+parent.left.toFixed(1),+parent.top.toFixed(1),+parent.width.toFixed(1),+parent.height.toFixed(1)],artVariables:host?['--actors-top','--actors-bottom','--actors-left','--actors-right'].map(k=>[k,host.style.getPropertyValue(k)]):[]});}
   // Foreground layer image boxes often span the whole scene even though their
   // painted alpha is only a narrow apron (for example the noodle table). Do
   // not treat that transparent box as a dialogue panel covering a face.
   for(const card of shell.querySelectorAll('.story-ui,.intro-dialogue,.glyph-frame,.opening,.hero-copy')){
    const c=card.getBoundingClientRect();if(!c.width||!c.height)continue;
    if(overlaps(face,c)>1)issues.push({kind:'face-covered-by-dialogue',character:actor.dataset.character,card:card.className,face:[face.left,face.top,face.right,face.bottom],overlay:[c.left,c.top,c.right,c.bottom],stage:[stage.left,stage.top,stage.right,stage.bottom],dialoguePosition:getComputedStyle(card).position,dialogueTop:getComputedStyle(card).top,dialogueBottom:getComputedStyle(card).bottom});
   }
  }
  for(const scene of shell.querySelectorAll('.cs-scene'))if(scene.querySelectorAll('[data-character="sparrow"]').length!==1)issues.push({kind:'sparrow-count',scene:scene.dataset.scene});
  return issues;
 });
 if(result.length){layoutFindings.push({label,state,issues:result});fs.writeFileSync(path.join(OUT,'layout-findings.json'),JSON.stringify(layoutFindings,null,2));if(result.some(issue=>issue.kind==='panel-overflow')){const shotName=`${label}-overflow-${state.replace(/[^a-z0-9-]+/gi,'-')}.png`;await page.screenshot({path:path.join(OUT,shotName),fullPage:true});fs.writeFileSync(path.join(OUT,'layout-findings.json'),JSON.stringify(layoutFindings,null,2));}}
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
 await page.screenshot({path:path.join(OUT,label+"-intro-ending.png"),fullPage:true});
 await page.screenshot({path:path.join(OUT,label+"-intro.png"),fullPage:true});
 await page.locator('#nextBtn').click();
 await page.waitForURL('**/duong-re/');
 assert.equal(await visible(page,'#branchShell'),true,'Intro ending must open the branching story directly');
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
 assert.equal(await page.locator("#branchStart").getAttribute("href"),"/duong-re/", "Home should start the branching story");
 await page.goto(ROOT+"/?play=hsk1",{waitUntil:"networkidle"});
 assert.equal(await visible(page,"#gameOverlay"),true);
 assert.equal(await page.locator("body").evaluate(el=>el.classList.contains("game-active")),true,"Opening the story should switch to the single-scene game view");
 assert.equal(await page.locator("#heroArt").evaluate(el=>getComputedStyle(el).visibility),"hidden","The home illustration must not render a second Sẻ behind the active story");
 assert.equal(await page.locator("#gameOverlay .cs-sparrow:visible").count(),1,"The active game view should show one Sẻ");
 let finished=false,steps=0,practiceUsed=false,supportUsed=false,arrivalObserved=false,returnedTree=false,streetEchoObserved=false,encounterResumeChecked=false;
 const capturedScenes=new Set();
 for(;steps<100;steps++){
  await auditLayout(page,label,'story-'+steps+'-'+(await page.locator('#stepText').innerText()));
  const artId=await page.locator('#stageIllustration .cs-scene').getAttribute('data-scene');
  if(!capturedScenes.has(artId)){
   await page.locator('#stageIllustration .cs-background img').evaluate(img=>img.decode());
   if(['hsk1.e01.liu-noodle-order','hsk1.e01.liu-payment'].includes(artId)){
     await page.waitForFunction(()=>{const menu=[...document.querySelectorAll('#stageIllustration .cs-midground img')],table=[...document.querySelectorAll('#stageIllustration .cs-tabletop img')];return menu.length===1&&table.length===1&&[...menu,...table].every(img=>img.getAttribute('src')&&img.complete&&img.naturalWidth>0)});
      await page.locator('#stageIllustration .cs-midground img').evaluate(img=>img.decode());
      await page.locator('#stageIllustration .cs-tabletop img').evaluate(img=>img.decode());
     const composition=await page.evaluate(async()=>{const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};async function paintedBounds(img){const xml=await(await fetch(img.currentSrc)).text(),parsed=new DOMParser().parseFromString(xml,'image/svg+xml'),source=parsed.documentElement,view=source.getAttribute('viewBox').split(/\s+/).map(Number),host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none';const copy=document.importNode(source,true);host.append(copy);document.body.append(host);const boxes=[...copy.querySelectorAll('path,ellipse,circle,rect,polygon')].map(node=>{const b=node.getBBox(),m=node.getCTM(),points=[[b.x,b.y],[b.x+b.width,b.y],[b.x,b.y+b.height],[b.x+b.width,b.y+b.height]].map(([x,y])=>({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f}));return {left:Math.min(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),right:Math.max(...points.map(p=>p.x)),bottom:Math.max(...points.map(p=>p.y))}});host.remove();const bounds={left:Math.min(...boxes.map(box=>box.left)),top:Math.min(...boxes.map(box=>box.top)),right:Math.max(...boxes.map(box=>box.right)),bottom:Math.max(...boxes.map(box=>box.bottom))},r=img.getBoundingClientRect(),sx=r.width/view[2],sy=r.height/view[3];return {left:r.left+(bounds.left-view[0])*sx,top:r.top+(bounds.top-view[1])*sy,right:r.left+(bounds.right-view[0])*sx,bottom:r.top+(bounds.bottom-view[1])*sy,width:(bounds.right-bounds.left)*sx,height:(bounds.bottom-bounds.top)*sy}}const bg=document.querySelector('#stageIllustration .cs-background img'),art=document.querySelector('#stageIllustration');const bowl=document.querySelector('#stageIllustration .cs-foreground img[data-asset*="/bowl"]');return {menu:await paintedBounds(document.querySelector('#stageIllustration .cs-midground img')),table:rect(document.querySelector('#stageIllustration .cs-tabletop img')),dialogue:rect(document.querySelector('#storyDialogue')),stage:rect(document.querySelector('#storyStage')),layout:art.dataset.composition,background:{naturalWidth:bg.naturalWidth,naturalHeight:bg.naturalHeight,src:bg.currentSrc},bowl:bowl?await paintedBounds(bowl):null}});
     const viewport=page.viewportSize();
     if(viewport.width<=900&&viewport.height>viewport.width){assert.equal(composition.background.naturalWidth,600,'Portrait tablet should use the 600px native SVG portrait plate: '+JSON.stringify(composition.background));if(viewport.width>690&&composition.stage.height>composition.stage.width*.72)assert.equal(composition.layout,'portrait','Tablet portrait should compose actors below the dialogue on its portrait plate')}
    await page.screenshot({path:path.join(OUT,label+'-noodle-'+artId+'-visual-gate.png')});
    assert.ok(composition.menu.width>0&&composition.menu.height>0,'Noodle menu must be visible: '+artId);
    assert.ok(composition.table.width>0&&composition.table.height>0,'Noodle table top must be visible: '+artId);
     assert.ok(composition.menu.right>composition.stage.left&&composition.menu.left<composition.stage.right&&composition.menu.bottom>composition.stage.top&&composition.menu.top<composition.stage.bottom,'Noodle menu must intersect the visible scene: '+JSON.stringify({viewport,composition}));
    assert.ok(composition.menu.right<=composition.dialogue.left||composition.menu.left>=composition.dialogue.right||composition.menu.bottom<=composition.dialogue.top||composition.menu.top>=composition.dialogue.bottom,'Menu is covered by dialogue: '+artId+' '+JSON.stringify(composition));
     if(artId==='hsk1.e01.liu-payment'){assert.ok(composition.bowl&&composition.bowl.width>40,'The price dialogue needs the served bowl in view: '+JSON.stringify({viewport,composition}));assert.ok(composition.bowl.top>=composition.stage.top-2&&composition.bowl.bottom<=composition.stage.bottom+2,'Bowl is clipped at the scene edge: '+JSON.stringify({viewport,composition}))}
    if(artId==='hsk1.e01.liu-noodle-order')assert.equal(composition.bowl,null,'No served food before the player chooses a dish');
   }
   await page.screenshot({path:path.join(OUT,label+'-scene-'+artId+'.png')});capturedScenes.add(artId);
  }
  if(await visible(page,"#completionPane")){finished=true;break}
  if(await visible(page,"#storyInterlude")){
   if(artId==='hsk1.e01.school-introduction'&&await page.locator('#storyInterlude').getAttribute('data-kind')!=='model')assert.equal(await page.locator('#stageIllustration [data-character="wang"]').getAttribute('data-expression'),'smile','Narrative beat keeps the teacher smile before her prompt');
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
  if(stepText.trim()==="07 / 10"){
   const savedEncounter=await page.evaluate(()=>JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}').encounter||{});
   const callbackText=await page.locator('#storyBeat').textContent();
   assert.equal(savedEncounter.stage,'done','The search encounter must finish before An walks home');
   assert.ok(callbackText.includes(savedEncounter.route==='friend'?'Tiểu Vũ nhìn quyển sổ An đang ôm':'An nhớ lại lúc mình nói'),'The walk-home callback must reflect the companion An chose');
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
   const saved=await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}');return {stage:p.encounter?.stage,route:p.encounter?.route,answer:p.encounter?.answer,draft:p.encounterDraft,sceneRef:p.sceneRef,step:p.step,historyCount:(p.history||[]).filter(Boolean).length,inspected:p.encounter?.inspected?.length||0}});
   const stage=saved.stage;
   assert.equal(saved.sceneRef,'hsk1.e01.liu-noodle-order','The encounter must remain anchored before learning scene 05');
   assert.equal(saved.step,4,'The encounter must not advance the canonical HSK1 index');
   assert.equal(saved.historyCount,4,'The encounter must not add to the four completed lessons');
   assert.ok(saved.step<7,'The encounter cannot enter the classroom checkpoint');
   const current=page.locator('#stageIllustration .cs-scene');
   if(stage==='inspect'||stage==='decide'){
    assert.equal(await current.getAttribute('data-scene'),'lost-notebook','Classroom search must keep its own scene');
    assert.equal(await page.locator('#stageIllustration [data-character="receptionist"]').count(),0,'Receptionist appears only after An reaches the office');
   }
   if(stage==='respond'||stage==='outcome'){
    assert.equal(await current.getAttribute('data-scene'),'lost-notebook-office','Responding to the receptionist must show the school office');
    assert.equal(await page.locator('#stageIllustration [data-character="receptionist"]').count(),1);
    const route=saved.route;
    const companion=route==='friend'?'xiaoyu':route==='teacher'?'wang':null;
    assert.equal(companion?await page.locator('#stageIllustration [data-character="'+companion+'"]').count():0,companion?1:0,'The chosen companion stays in the office scene');
    assert.equal(await page.locator('#stageIllustration [data-character="sparrow"]').count(),1,'The office scene contains one Sẻ');
    assert.equal(await page.locator('#stageIllustration [data-character="receptionist"]').getAttribute('data-expression'),stage==='respond'?'speaking':'reassuring','Receptionist reacts to the conversation beat');
    assert.match(await page.locator('#speaker').innerText(),stage==='respond'?/Cô trực/:/Minh An/,'The speaker label must follow the current story beat');
    if(stage==='outcome'){
     assert.equal(saved.answer,'independent','The correct first try must remain independently credited');
     assert.equal(await page.locator('#dialogueText').innerText(),'谢谢您。','An thanks the receptionist after she returns the notebook');
     assert.equal(await page.locator('#pinyinText').innerText(),'Xièxie nín.');
     assert.equal(await page.locator('#vietText').innerText(),'Cháu cảm ơn cô ạ.');
     assert.match(await page.locator('#encounterBody').innerText(),/Cô trực tìm thấy tên An trên trang đầu và trao lại quyển sổ/);
    }
   }
   const proofStage=stage==='inspect'?`inspect-${saved.inspected}`:stage;
   await page.locator('#stageIllustration .cs-background img').evaluate(img=>img.decode());
   await page.screenshot({path:path.join(OUT,`${label}-encounter-${proofStage}-${saved.route||'no-route'}.png`)});
   if(stage==='respond'&&label==='desktop'&&!encounterResumeChecked){
    await page.locator('#encounterInput').fill('我叫');
    const beforeReload=await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}');return {sceneRef:p.sceneRef,step:p.step,historyCount:p.history.filter(Boolean).length,stage:p.encounter.stage,route:p.encounter.route,draft:p.encounterDraft}});
    await page.reload({waitUntil:'networkidle'});
    await page.locator('.nav-progress').click();
    await page.locator('#encounterPanel').waitFor({state:'visible'});
    const afterReload=await page.evaluate(()=>{const p=JSON.parse(localStorage.getItem('hai-que-huong-progress-v3')||'{}');return {sceneRef:p.sceneRef,step:p.step,historyCount:p.history.filter(Boolean).length,stage:p.encounter.stage,route:p.encounter.route,draft:p.encounterDraft,input:document.querySelector('#encounterInput').value}});
    assert.deepEqual(afterReload,{...beforeReload,input:'我叫'},'Reload must resume the same encounter route and draft without changing the HSK checkpoint');
    encounterResumeChecked=true;
    continue;
   }
   if(await visible(page,"#encounterAnswerForm")){
    await page.locator("#encounterInput").fill(label==='desktop'?"我是安":"我叫安");
    await page.locator('#encounterAnswerForm button[type="submit"]').click();
   }else if(await visible(page,"#encounterContinue"))await page.locator("#encounterContinue").click();
   else{
    const actions=page.locator("#encounterActions .encounter-action:not([disabled])"),action=stage==='decide'&&label==='mobile'?actions.last():actions.first();
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
    assert.equal(await page.locator('#stageIllustration [data-layer="foreground"] img[data-asset*="/bowl"]').count(),0,'The order is selected before the bowl is served');
    await page.screenshot({path:path.join(OUT,label+'-scene-noodle-order-selected.png')});
   }
   continue;
  }
  if(await visible(page,"#nextBtn")){await page.locator("#nextBtn").click();continue}
  if(await visible(page,"#answerForm")){
   const artId=await page.locator('#stageIllustration .cs-scene').getAttribute('data-scene');
   const activeIndex=Number((await page.locator('#stepText').innerText()).split('/')[0].trim())-1;
   const speakerCharacter=await page.evaluate(i=>HSKContent.scenes[i].speakerCharacter,activeIndex);
   assert.ok(speakerCharacter,'Each active HSK question declares its visual speaker');
   assert.equal(await page.locator('#stageIllustration [data-character="'+speakerCharacter+'"]').getAttribute('data-expression'),'speaking','The active HSK speaker should use the speaking frame');
   if(['hsk1.e01.liu-noodle-order','hsk1.e01.liu-payment'].includes(artId))assert.equal(await page.locator('#stageIllustration [data-character="liu"]').getAttribute('data-expression'),'speaking','Liu should be speaking in both her order question and price line');
   if(!supportUsed){
     await page.waitForFunction(()=>{const stage=document.querySelector('#storyStage'),r=stage.getBoundingClientRect(),background=HSKSceneLayers.backgrounds['school-gate'],portrait=matchMedia('(max-width:900px) and (orientation:portrait)').matches&&r.height>r.width*.72,compact=r.height<300&&r.width>r.height,asset=compact&&background.compact?background.compact:portrait?background.mobile:background.desktop;return performance.getEntriesByType('resource').some(x=>x.name.endsWith('/art/'+asset))});
     const preload=await page.evaluate(()=>{const stage=document.querySelector('#storyStage'),r=stage.getBoundingClientRect(),background=HSKSceneLayers.backgrounds['school-gate'],portrait=matchMedia('(max-width:900px) and (orientation:portrait)').matches&&r.height>r.width*.72,compact=r.height<300&&r.width>r.height,variant=compact&&background.compact?'compact':portrait?'mobile':'desktop',asset=background[variant],resource=performance.getEntriesByType('resource').find(x=>x.name.endsWith('/art/'+asset));return {scene:'hsk1.e01.school-introduction',variant,asset,stage:{width:Math.round(r.width),height:Math.round(r.height)},resourceFound:!!resource}});
     assert.equal(preload.resourceFound,true,`Next scene background should be prefetched for the current viewport: ${JSON.stringify(preload)}`);nativePreloadChecks.push({device:label,...preload});
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
  assert.equal(await page.locator("#taskTitle").innerText(),"Chưa có bài để ôn");
  assert.match(await page.locator("#emptyCopy").innerText(),/Hoàn thành một cảnh HSK 1 để mở bài ôn đầu tiên/);
  assert.equal(await page.locator("#emptyLink").innerText(),"Bắt đầu HSK 1 cùng An ↗");
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
 assert.equal(await page.locator('#taskTitle').innerText(),'Hôm nay đã ôn xong');
 assert.equal(await page.locator('#emptyTitle').innerText(),'Hôm nay chưa có bài mới');
 assert.match(await page.locator('#emptyCopy').innerText(),/Bạn đã ôn hết những câu đến hạn hôm nay/);
 assert.equal(await page.locator('#emptyLink').innerText(),'Tiếp tục câu chuyện cùng An ↗');
 assert.equal(await page.evaluate(()=>localStorage.getItem('hai-que-huong-progress-v3')),oldV3,'Complete review mutated story progress');
 if(label==="mobile")assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+5),false,"Review page horizontal overflow at 360px");
}
async function testBrowser(){
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined,args:["--no-sandbox"]});
 try{
  const devices=[{name:"desktop",viewport:{width:1280,height:800}},{name:"mobile",viewport:{width:360,height:800},isMobile:true,hasTouch:true},{name:'phone-landscape',viewport:{width:844,height:390},isMobile:true,hasTouch:true},{name:'tablet',viewport:{width:768,height:1024},hasTouch:true},{name:'tablet-landscape',viewport:{width:1024,height:768},hasTouch:true}];
  const selected=process.env.HSK_QA_DEVICES?.split(',');
  for(const cfg of devices.filter(x=>!selected||selected.includes(x.name))){
   const ctx=await qaContext(browser,{viewport:cfg.viewport,isMobile:!!cfg.isMobile,hasTouch:!!cfg.hasTouch,locale:"vi-VN",reducedMotion:'reduce'});
   const page=await ctx.newPage();watch(page,cfg.name);
   page.setDefaultTimeout(8000);
   await goIntro(page,cfg.name);
   if(cfg.name==='phone-landscape')await verifySourcePopover(page,cfg.name);
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
  if(!selected||selected.includes('mobile')||selected.includes('phone-landscape'))await verifyNoodleComposition(browser);
  assert.deepEqual(errs,[]);
  fs.writeFileSync(path.join(OUT,'layout-findings.json'),JSON.stringify(layoutFindings,null,2));
  assert.equal(layoutFindings.length,0,'Layout violations in '+layoutFindings.length+' states; see test-results/layout-findings.json');
  fs.writeFileSync(path.join(OUT,'qa-summary.json'),JSON.stringify({generatedAt:new Date().toISOString(),scenarios:selected||devices.map(x=>x.name),layoutChecks,nativePreloadChecks,result:'PASS',limits:['No physical-device keyboard tested','Face rectangles are manually authored guides; original-reference style fidelity and alpha silhouettes still require visual review','AI provider response is mocked for keyboard checks']},null,2));
  console.log("Browser E2E: requested scenarios completed, "+layoutChecks+' measured layout states: PASS');
 }finally{await browser.close()}
}
async function verifySourcePopover(page,label){
 await page.goto(ROOT+'/nhap-mon.html',{waitUntil:'networkidle'});
 await page.locator('.source-details summary').click();
 await auditLayout(page,label,'source-note-open');
 const metrics=await page.locator('.source-details').evaluate(el=>{const r=el.getBoundingClientRect();return {top:r.top,bottom:r.bottom,client:el.clientHeight,scroll:el.scrollHeight,height:innerHeight}});
 assert.ok(metrics.top>=0&&metrics.bottom<=metrics.height,`Source note must stay within the viewport: ${JSON.stringify(metrics)}`);
 assert.ok(metrics.scroll<=metrics.client+2,`Source note must not scroll internally at 844x390: ${JSON.stringify(metrics)}`);
}
async function verifyNoodleComposition(browser){
 for(const device of [{name:'noodle-short-phone',width:320,height:568},{name:'noodle-phone',width:360,height:800},{name:'noodle-tablet',width:768,height:1024},{name:'noodle-landscape',width:844,height:390}]){
  const ctx=await qaContext(browser,{viewport:{width:device.width,height:device.height},isMobile:device.width<700,hasTouch:device.width<700,locale:'vi-VN'}),page=await ctx.newPage();
  try{
   await page.goto(ROOT+'/?play=hsk1',{waitUntil:'domcontentloaded'});await page.locator('#interludeContinue').click();
   for(const [sceneId,served] of [['hsk1.e01.liu-noodle-order',false],['hsk1.e01.liu-payment',true]]){
    await page.evaluate(([id,showForeground])=>HSKSceneLayers.mount(document.querySelector('#stageIllustration'),id,{dialogue:document.querySelector('#storyDialogue'),header:true,showForeground}),[sceneId,served]);
    await auditLayout(page,device.name,'composition-'+sceneId);await page.waitForTimeout(300);
    const composition=await page.evaluate(()=>{const actors=[...document.querySelectorAll('#stageIllustration .cs-actor')].map(el=>{const r=el.getBoundingClientRect(),f=el.dataset.face.split(',').map(Number);return {name:el.dataset.character,face:{left:r.left+f[0]*r.width,top:r.top+f[1]*r.height,right:r.left+f[2]*r.width,bottom:r.top+f[3]*r.height}}});const liu=actors.find(x=>x.name==='liu'),dialogue=document.querySelector('#storyDialogue').getBoundingClientRect(),host=document.querySelector('#stageIllustration'),stage=document.querySelector('#storyStage').getBoundingClientRect(),panel=document.querySelector('.player-panel').getBoundingClientRect(),table=host.querySelector('.cs-foreground img[data-asset*="table-apron"]'),tableRect=table?.getBoundingClientRect();return {actors,liuDialogueOverlap:{x:Math.max(0,Math.min(liu.face.right,dialogue.right)-Math.max(liu.face.left,dialogue.left)),y:Math.max(0,Math.min(liu.face.bottom,dialogue.bottom)-Math.max(liu.face.top,dialogue.top))},counter:!!document.querySelector('#stageIllustration .cs-counter-occluder'),bowl:!!host.querySelector('.cs-foreground img[data-asset*="/bowl"]'),artOverflow:getComputedStyle(host).overflow,stagePanelGap:panel.top-stage.bottom,tableCrossesStage:!!tableRect&&tableRect.bottom>stage.bottom+1}});
    const liu=composition.actors.find(x=>x.name==='liu');assert.ok(liu,'The noodle scene keeps bà Lưu visible');
    for(const other of composition.actors.filter(x=>x!==liu)){const overlapX=Math.max(0,Math.min(liu.face.right,other.face.right)-Math.max(liu.face.left,other.face.left)),overlapY=Math.max(0,Math.min(liu.face.bottom,other.face.bottom)-Math.max(liu.face.top,other.face.top));assert.ok(overlapX<=1||overlapY<=1,`${sceneId} ${device.name}: bà Lưu's face overlaps ${other.name} by ${overlapX.toFixed(1)}×${overlapY.toFixed(1)}px`)}
    assert.ok(composition.liuDialogueOverlap.x<=1||composition.liuDialogueOverlap.y<=1,`${sceneId} ${device.name}: dialogue covers bà Lưu's face`);
    assert.equal(composition.counter,true,'The shared table still occludes the children correctly');
    assert.equal(composition.artOverflow,'hidden','Every scene layer stays clipped inside the scene viewport');
    assert.ok(composition.stagePanelGap>=-1,'The artwork viewport does not cover the learning panel');
    // Compact art can either fit the stage or extend behind its overflow clip;
    // the invariant is that it never covers the learning panel (asserted above).
    assert.equal(composition.bowl,served,'Only the served/payment scene displays the bowl');
    await page.screenshot({path:path.join(OUT,`${device.name}-${sceneId}.png`)});
   }
  }finally{await ctx.close()}
 }
}
async function verifyKeyboard(browser,device){
 const full={width:device.width,height:device.height},contracted={width:device.width,height:device.visible};
 const ctx=await qaContext(browser,{viewport:full,isMobile:true,hasTouch:true,locale:'vi-VN'});
 await ctx.addInitScript(()=>{window.SpeechRecognition=undefined;window.webkitSpeechRecognition=undefined});
 const page=await ctx.newPage();watch(page,'keyboard');page.setDefaultTimeout(8000);
 try{
  await page.goto(ROOT+'/?play=hsk1',{waitUntil:'domcontentloaded'});
  for(let n=0;n<4&&await page.locator('#storyInterlude').isVisible();n++)await page.locator('#interludeContinue').click();
  if(device.name==='phone'){
   const insetStyle=await page.addStyleTag({content:'.game-top{padding-top:42px!important}'});
   await page.waitForFunction(()=>Math.abs(parseFloat(document.querySelector('#storyStage').style.getPropertyValue('--scene-header'))-document.querySelector('.game-top').getBoundingClientRect().bottom)<1);
   await auditLayout(page,device.name,'header-safe-inset');await insetStyle.evaluate(x=>x.remove());
  }
  await page.locator('#micBtn').click();assert.match(await page.locator('#toast').textContent(),/không có chức năng/);
  const tutorReply=device.name==='phone-landscape'?'你好 là lời chào. '.repeat(10).trim():'你好 là lời chào.';
  let compactTutorRequest=false;
  await page.route('**/api/ai/tutor',r=>{compactTutorRequest=JSON.parse(r.request().postData()).compact;return r.fulfill({status:200,contentType:'application/json',body:JSON.stringify({reply:tutorReply})})});
  await page.locator('#aiTutorBtn').click();await page.locator('#aiTutorInput').fill('你好 nghĩa là gì?');
  await page.setViewportSize(contracted);await page.waitForFunction(()=>document.querySelector('#gameShell').classList.contains('keyboard-open'));
  await auditLayout(page,device.name,'keyboard-ai');await page.locator('#aiTutorSend').click();
  await page.waitForFunction(reply=>[...document.querySelectorAll('.ai-tutor-assistant')].some(x=>x.textContent===reply),tutorReply);
  const transcript=await page.locator('.ai-tutor-messages').evaluate(el=>({client:el.clientHeight,scroll:el.scrollHeight,reply:el.querySelector('.ai-tutor-assistant:last-child')?.getBoundingClientRect().toJSON(),bounds:el.getBoundingClientRect().toJSON()}));
  assert.ok(transcript.client>0,'Hỏi Sẻ transcript remains visible with the keyboard open');
  assert.ok(transcript.scroll<=transcript.client+2,`Hỏi Sẻ transcript should not need inner scrolling: ${JSON.stringify(transcript)}`);
  assert.ok(transcript.reply&&transcript.reply.top>=transcript.bounds.top-1&&transcript.reply.bottom<=transcript.bounds.bottom+1,'Latest Hỏi Sẻ reply remains fully visible');
  assert.equal(compactTutorRequest,device.name==='phone-landscape','Hỏi Sẻ asks for a concise answer only when the keyboard leaves a short landscape viewport');
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
