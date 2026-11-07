/* Browser coverage for migrated branch saves that ended at the former week-later ending. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const BASE=process.env.BRANCH_BASE_URL||'http://127.0.0.1:4181/duong-re/';
const sizes=[{name:'desktop',width:1280,height:800},{name:'phone',width:390,height:844}];
const LEGACY=['hai-que-huong-progress-v3','hai-que-huong-intro-v1'];

(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined});
 let checks=0;
 try{
  for(const size of sizes){
   const context=await browser.newContext({viewport:{width:size.width,height:size.height},locale:'vi-VN'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.goto(BASE,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>window.AnBranchEngine&&window.ChimSeBranchLearning&&window.HSKSceneLayers);
    const fixture=await page.evaluate(legacyKeys=>{
     let state=AnBranchEngine.fresh(),limit=0;
     while(state.node!=='week-later-ending'){
      if(++limit>70)throw Error('Could not build a legacy path to the old ending');
      const node=AnBranchStory.byId[state.node];
      const choice=node.kind==='choice'?AnBranchEngine.availableOptions(node,state)[0].id:'next';
      const moved=AnBranchEngine.step(state,choice);
      if(!moved.ok)throw Error(moved.error);
      state=moved.state;
     }
     const legacyPath=JSON.stringify({version:1,path:state.path});
     localStorage.setItem(AnBranchStory.storageKey,legacyPath);
     localStorage.setItem(ChimSeBranchLearning.storageKey,JSON.stringify(Array.from({length:10},()=>({status:'correct',attempts:1,hint:false}))));
     for(const key of legacyKeys)localStorage.setItem(key,'legacy-sentinel');
     return {legacyPath,choiceCount:state.path.filter(item=>AnBranchStory.byId[item.at].kind==='choice').length};
    },LEGACY);
    await page.reload({waitUntil:'networkidle'});
    await page.waitForSelector('#branchShell');
    const resumed=await page.evaluate(()=>({node:document.querySelector('#branchShell').dataset.node,phase:document.querySelector('#branchShell').dataset.phase,lesson:document.querySelector('#branchShell').dataset.lesson,stored:localStorage.getItem(AnBranchStory.storageKey),learning:localStorage.getItem(ChimSeBranchLearning.storageKey)}));
    assert.equal(resumed.node,'week-later-ending',size.name+' resumes at the former story endpoint');
    assert.equal(resumed.phase,'read');
    assert.equal(resumed.lesson,'');
    await page.locator('#nextBtn').click();
    await page.waitForFunction(()=>document.querySelector('#branchShell')?.dataset.lesson==='10');
    assert.equal(await page.locator('#branchShell').getAttribute('data-lesson'),'10',size.name+' should resume at the first newly added recall task');
    assert.equal(await page.evaluate(key=>localStorage.getItem(key), 'hai-que-huong-branching-novel-v1'),fixture.legacyPath,'resume must preserve the old route through the former ending');
    assert.equal(await page.locator('.cs-sparrow').count(),1,'the scene keeps one Sẻ');
    for(const taskId of [10,15,11]){
     try{await page.waitForFunction(id=>document.querySelector('#branchShell')?.dataset.lesson===String(id),taskId,{timeout:5000});}
     catch(error){const view=await page.evaluate(()=>({node:document.querySelector('#branchShell')?.dataset.node,phase:document.querySelector('#branchShell')?.dataset.phase,lesson:document.querySelector('#branchShell')?.dataset.lesson,learning:localStorage.getItem(ChimSeBranchLearning.storageKey)}));throw new Error('Could not reach learning task '+taskId+': '+JSON.stringify(view)+'; '+error.message)}
     const answer=await page.evaluate(id=>ChimSeBranchLearning.sceneAt(id).answers[0],taskId);
     for(let step=0;step<30;step++){
      const state=await page.evaluate(id=>({phase:document.querySelector('#branchShell')?.dataset.phase,done:ChimSeBranchLearning.clean(JSON.parse(localStorage.getItem(ChimSeBranchLearning.storageKey)||'null'))[id]?.status==='correct'}),taskId);
      if(state.done)break;
      if(state.phase==='lesson'){
       await page.locator('#answerInput').fill(answer);
       await page.locator('.lesson-form button.primary').click();
      }else await page.locator('#nextBtn').click();
     }
     await page.waitForFunction(id=>ChimSeBranchLearning.clean(JSON.parse(localStorage.getItem(ChimSeBranchLearning.storageKey)||'null'))[id]?.status==='correct',taskId);
     if([10,15].includes(taskId))await page.locator('#nextBtn').click();
    }
    const result=await page.evaluate(({legacyKeys})=>({
     learning:ChimSeBranchLearning.clean(JSON.parse(localStorage.getItem(ChimSeBranchLearning.storageKey)||'null')),node:AnBranchEngine.load(localStorage.getItem(AnBranchStory.storageKey)).node,lesson:document.querySelector('#branchShell').dataset.lesson,
     path:AnBranchEngine.load(localStorage.getItem(AnBranchStory.storageKey)).path,
     choiceCount:AnBranchEngine.load(localStorage.getItem(AnBranchStory.storageKey)).path.filter(item=>AnBranchStory.byId[item.at].kind==='choice').length,
     legacy:Object.fromEntries(legacyKeys.map(key=>[key,localStorage.getItem(key)])),
     layout:{page:document.documentElement.scrollWidth<=innerWidth+1&&document.documentElement.scrollHeight<=innerHeight+1,content:(()=>{const node=document.querySelector('#content');return node.scrollHeight<=node.clientHeight+2})(),birds:document.querySelectorAll('.cs-sparrow').length}
    }),{legacyKeys:LEGACY});
    assert.equal(result.learning.length,18);
    assert.ok(result.learning.slice(0,10).every(item=>item?.status==='correct'&&item.attempts===1),'the migration must retain prior learning rows');
    assert.ok(result.learning[10]&&result.learning[11]&&result.learning[15],'the newly reached recall tasks must be recorded');
    assert.equal(result.choiceCount,fixture.choiceCount,'the old route must not replay or add choices during migration');
    assert.deepEqual(result.legacy,Object.fromEntries(LEGACY.map(key=>[key,'legacy-sentinel'])));
    assert.equal(result.layout.page,true);assert.equal(result.layout.content,true);assert.equal(result.layout.birds,result.lesson==='11'||result.node==='week-later-home'?0:1,JSON.stringify({node:result.node,lesson:result.lesson,birds:result.layout.birds}));
    assert.deepEqual(errors,[]);
    checks++;
   }finally{await context.close();}
   console.log('Legacy story resume '+size.name+': PASS');
  }
  console.log('Legacy story resume: '+checks+' viewport cases PASS');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
