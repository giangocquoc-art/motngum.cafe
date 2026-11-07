/* Approved kitchen composition across story branches and responsive viewports. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const BASE=process.env.BRANCH_BASE_URL||'http://127.0.0.1:4181/duong-re/';
const OUT=path.resolve(process.env.BRANCH_TEST_OUTPUT||path.join(__dirname,'../test-results/kitchen-layout'));fs.mkdirSync(OUT,{recursive:true});
const sizes=[
 {name:'desktop',width:1365,height:900,variant:'day2-kitchen-wide-v1.webp'},
 {name:'phone-portrait',width:390,height:844,variant:'day2-kitchen-mobile-v1.webp'},
 {name:'tablet-portrait',width:768,height:1024,variant:'day2-kitchen-tablet-v1.webp'},
 {name:'phone-landscape',width:844,height:390,variant:'day2-kitchen-compact-v1.webp'},
 {name:'ultra-wide',width:1680,height:720,variant:'day2-kitchen-wide-v1.webp'}
];
const targets=['day2-arrival','day2-guest-arrives','day2-home-quiet','day2-breakfast','day2-confession','day2-mother-explains','day2-guest-prep'];
function expectedSpeakerCharacter(speaker){return /Mẹ/.test(speaker)?'mother':/小雨|Tiểu Vũ/.test(speaker)?'xiaoyu':null}

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined});
 let checks=0;
 try{
  for(const size of sizes){
   const context=await browser.newContext({viewport:{width:size.width,height:size.height},locale:'vi-VN'}),page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(BASE,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.AnBranchEngine&&window.HSKSceneManifest&&window.HSKSceneLayers);
    for(const target of targets){
     const fixture=await page.evaluate(targetId=>{
      const queue=[AnBranchEngine.fresh()],seen=new Set();let found=null;
      while(queue.length){const state=queue.shift();if(state.node===targetId){found=state;break}const key=state.node+JSON.stringify(state.flags);if(seen.has(key))continue;seen.add(key);const node=AnBranchStory.byId[state.node];if(!node||node.kind==='ending')continue;const choices=node.kind==='choice'?AnBranchEngine.availableOptions(node,state).map(option=>option.id):['next'];for(const choice of choices){const moved=AnBranchEngine.step(state,choice);if(moved.ok)queue.push(moved.state)}}
      if(!found)throw Error('No route to '+targetId);
      localStorage.setItem(AnBranchStory.storageKey,JSON.stringify({version:1,path:found.path}));
      return {path:found.path,speaker:AnBranchStory.byId[targetId].speaker};
     },target);
     await page.reload({waitUntil:'networkidle'});
     await page.waitForFunction(id=>document.querySelector('#branchShell')?.dataset.node===id,target);
     await page.waitForFunction(()=>{const img=document.querySelector('.cs-scene[data-background="day2-kitchen"] .cs-background img');return img?.complete&&img.naturalWidth>0});
     const rendered=await page.evaluate(()=>{
      const shell=document.querySelector('#branchShell'),scene=document.querySelector('.cs-scene'),img=scene.querySelector('.cs-background img'),content=document.querySelector('#content');
      const visible=[...document.querySelectorAll('.cs-sparrow')].filter(el=>getComputedStyle(el).display!=='none'&&getComputedStyle(el).visibility!=='hidden'&&el.getBoundingClientRect().width>0);
      const title=document.querySelector('#sceneTitle');
      return {node:shell.dataset.node,phase:shell.dataset.phase,composition:document.querySelector('.chimse-art').dataset.composition,background:img.currentSrc,speaker:document.querySelector('#speaker').textContent,actors:[...scene.querySelectorAll('.cs-actor')].map(el=>el.dataset.character),birds:visible.length,pageFits:document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1,contentFits:content.scrollHeight<=content.clientHeight+2,titleFocusVisible:title.matches(':focus-visible'),titleOutline:getComputedStyle(title).outlineStyle};
     });
     assert.equal(rendered.node,target,size.name+' story node');
     assert.ok(rendered.background.endsWith(size.variant),size.name+' uses its authored kitchen plate: '+rendered.background);
     assert.equal(rendered.birds,1,size.name+' '+target+' must render exactly one Sẻ');
     const speaking=expectedSpeakerCharacter(fixture.speaker);
     if(speaking)assert.ok(rendered.actors.includes(speaking),size.name+' '+target+' speaker sprite missing');
     assert.equal(rendered.pageFits,true,size.name+' '+target+' page overflow');
     assert.equal(rendered.contentFits,true,size.name+' '+target+' content overflow');
     assert.equal(rendered.titleOutline,'none',size.name+' '+target+' heading is programmatically focused, not an interactive control');
     assert.deepEqual(errors,[]);
     if(['day2-arrival','day2-confession','day2-guest-prep'].includes(target))await page.screenshot({path:path.join(OUT,size.name+'-'+target+'.png')});
     checks++;
    }
   }finally{await context.close();}
   console.log('Kitchen scene layout '+size.name+': PASS ('+targets.length+' scenes)');
  }
  console.log('Kitchen scene layout: '+checks+' integrated viewport states PASS');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
