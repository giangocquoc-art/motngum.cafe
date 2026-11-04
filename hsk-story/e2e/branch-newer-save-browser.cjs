/* Run the newer-save recovery surface in Edge without using a signed-in profile. */
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const BASE=process.env.BRANCH_BASE_URL||'http://127.0.0.1:4173/duong-re/';
const KEYS=['hai-que-huong-branching-novel-v1','chimse-branch-learning-v1','chimse-branch-objective-evidence-v1','chimse-branch-lesson-draft-v1','chimse-branch-pending-reply-v1','chimse-branch-pending-feedback-v1'];
const LEGACY=['hai-que-huong-progress-v3','hai-que-huong-intro-v1'];
const sizes=[{name:'desktop',width:1280,height:800},{name:'short-phone',width:320,height:568},{name:'phone-landscape',width:667,height:375}];
const future=JSON.stringify({schemaVersion:2,version:2,path:[],futurePayload:{keep:'original bytes'}});
async function snapshot(page){return page.evaluate(keys=>Object.fromEntries(keys.map(key=>[key,localStorage.getItem(key)])),KEYS.concat(LEGACY));}
async function assertNotice(page,label){
 await page.waitForFunction(()=>document.querySelector('#branchShell')?.dataset.phase==='save-newer');
 await page.evaluate(()=>document.fonts.ready);
 assert.match(await page.locator('#content').innerText(),/Mốc truyện này cần bản Chim Sẻ mới hơn/);
 assert.equal(await page.locator('#nextBtn').innerText(),'Tải lại trang');
 assert.equal(await page.locator('#previousBtn').innerText(),'Về Chim Sẻ');
 assert.equal(await page.locator('#journalToggle').isDisabled(),true);
 assert.equal(await page.locator('#sparrowBtn').isDisabled(),true);
 const metrics=await page.evaluate(()=>{
  const d=document.documentElement,content=document.querySelector('#content');
  const controls=['nextBtn','previousBtn'].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.left>=-1&&r.top>=-1&&r.right<=innerWidth+1&&r.bottom<=innerHeight+1;});
  return {pageFits:d.scrollWidth<=innerWidth+1&&d.scrollHeight<=innerHeight+1,textFits:content.scrollHeight<=content.clientHeight+2,controlsFit:controls.every(Boolean)};
 });
 assert.deepEqual(metrics,{pageFits:true,textFits:true,controlsFit:true},label);
}
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.HSK_BROWSER_BIN||undefined});
 let checks=0;
 try{
  for(const size of sizes){
   for(const key of [KEYS[0],KEYS[2],KEYS[3]]){
    const context=await browser.newContext({viewport:{width:size.width,height:size.height},locale:'vi-VN'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
     await page.addInitScript(({key,future,legacy})=>{
      if(sessionStorage.getItem('newer-save-fixture'))return;
      localStorage.setItem(key,future);for(const old of legacy)localStorage.setItem(old,'unchanged-legacy-bytes');
      sessionStorage.setItem('newer-save-fixture','seeded');
     },{key,future,legacy:LEGACY});
     await page.goto(BASE,{waitUntil:'networkidle'});await assertNotice(page,size.name+' '+key);
     const before=await snapshot(page);
     assert.deepEqual(before,Object.fromEntries(KEYS.concat(LEGACY).map(name=>[name,name===key?future:LEGACY.includes(name)?'unchanged-legacy-bytes':null])),'initial recovery must not initialize or rewrite sibling saves');
     await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.keyboard.press('ArrowRight')]);await assertNotice(page,size.name+' reload');
     assert.deepEqual(await snapshot(page),before,'reloading the recovery screen preserves every stored byte');
     assert.equal(await page.evaluate(key=>localStorage.getItem(key),key),future);
     assert.deepEqual(errors,[]);checks++;
    }finally{await context.close();}
   }
   for(const event of ['next-interaction','storage','chimse-branch-restored']){
    const context=await browser.newContext({viewport:{width:size.width,height:size.height},locale:'vi-VN'}),page=await context.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    try{
     await page.goto(BASE,{waitUntil:'networkidle'});
     await page.waitForFunction(()=>document.querySelector('#branchShell')&&document.querySelector('#branchShell').dataset.phase!=='save-newer');
     await page.evaluate(({key,future})=>localStorage.setItem(key,future),{key:KEYS[3],future});
     const before=await snapshot(page);
     if(event==='next-interaction')await page.locator('#nextBtn').click();
     else if(event==='storage')await page.evaluate(key=>window.dispatchEvent(new StorageEvent('storage',{key})),KEYS[3]);
     else await Promise.all([page.waitForNavigation({waitUntil:'networkidle'}),page.evaluate(()=>window.dispatchEvent(new Event('chimse-branch-restored')))]);
     await assertNotice(page,size.name+' '+event);
     assert.deepEqual(await snapshot(page),before,'a live newer record blocks subsequent branch writes');
     assert.deepEqual(errors,[]);checks++;
    }finally{await context.close();}
   }
   console.log('Newer-save browser recovery '+size.name+': PASS');
  }
  console.log('Newer-save browser recovery: '+checks+' cases PASS');
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
