const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const base=process.env.BRANCH_BASE_URL||'http://127.0.0.1:4195/duong-re/';

(async()=>{
 const browser=await chromium.launch({headless:true});
 try{
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1280,height:800}]){
   const context=await browser.newContext({viewport});
   const page=await context.newPage();
   const errors=[];page.on('pageerror',error=>errors.push(error.message));
   await page.goto(base);
   await page.evaluate(()=>{
    const E=AnBranchEngine,D=AnBranchStory,L=ChimSeBranchLearning;
    let state=E.fresh(),history=L.clean([]),guard=0;
    while(state.node!=='day2-liu'){
     if(++guard>100)throw Error('Could not reach shared bà Lưu scene');
     const task=L.pending(state,history);
     if(task){history=L.record(history,task.index,{status:'correct',attempts:0,hint:false});continue;}
     const scene=D.byId[state.node],choice=scene.kind==='choice'?E.availableOptions(scene,state)[0].id:'next';
     const result=E.step(state,choice);if(!result.ok)throw Error(result.error);state=result.state;
    }
    localStorage.setItem(D.storageKey,E.exportSave(state));
    localStorage.setItem(L.storageKey,JSON.stringify(history));
   });
   await page.reload();
   let story='';
   for(let i=0;i<8;i++){
    assert.equal(await page.locator('#branchShell').getAttribute('data-node'),'day2-liu');
    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'),'read');
    story+=' '+await page.locator('#content').innerText();
    const fit=await page.evaluate(()=>({document:document.documentElement.scrollHeight<=innerHeight+1&&document.documentElement.scrollWidth<=innerWidth+1,content:document.querySelector('#content').scrollHeight<=document.querySelector('#content').clientHeight+2}));
    assert.equal(fit.document,true,`viewport overflow at ${viewport.width}x${viewport.height}`);
    assert.equal(fit.content,true,`story panel overflow at ${viewport.width}x${viewport.height}`);
    if(story.includes('这碗面十块钱'))break;
    await page.locator('#nextBtn').click();
   }
   assert.match(story,/我想吃面条/);assert.match(story,/这碗面十块钱/);assert.match(story,/Mình muốn ăn mì/);assert.match(story,/mười tệ/);
   assert.deepEqual(errors,[]);
   await context.close();
  }
  console.log('PASS shared noodle-return story: 320px phone, 390px phone, short landscape, desktop');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
