// Real Chromium editor acceptance; isolated fixture API, no real accounts or deployments.
import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base='http://127.0.0.1:3000';
const doc={version:2,title:'Browser Fixture',themeId:'coffee',pages:[
  {id:'page-home',slug:'trang-chu',title:'Trang chủ',blocks:[
    {id:'block-hero',kind:'hero',variant:'full',title:'Hello Browser',body:'Fixture nội dung',
      imageUrl:'',buttonLabel:'Liên hệ',buttonUrl:'#page:lien-he',accent:'#a65a32'}]},
  {id:'page-contact',slug:'lien-he',title:'Liên hệ',blocks:[
    {id:'block-text',kind:'text',variant:'minimal',title:'Liên hệ',body:'Thông tin liên hệ',
      imageUrl:'',buttonLabel:'',buttonUrl:'',accent:'#a65a32'}]}
]};
const clone=x=>JSON.parse(JSON.stringify(x));
let current=clone(doc),version=1,failSave=false,saveCount=0;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1380,height:900},baseURL:base});
page.setDefaultTimeout(12000);
const check=async(name,fn)=>{await fn();console.log('PASS browser: '+name);};
try{
  await page.route('**/api/sites/test-browser',async route=>{
    const method=route.request().method();
    if(method==='GET')return route.fulfill({json:{site:{id:'test-browser',slug:'test-browser',version,
      document:current,publishedVersion:null}}});
    if(method==='PATCH'){
      if(failSave)return route.fulfill({status:503,json:{error:'simulated_offline'}});
      const body=route.request().postDataJSON();
      if(body.version!==version)return route.fulfill({status:409,json:{error:'stale_document'}});
      current=clone(body.document);version++;saveCount++;
      return route.fulfill({json:{site:{id:'test-browser',slug:'test-browser',title:current.title,version},saved:true}});
    }
    return route.continue();
  });
  await check('cloud fixture loads and remains editable',async()=>{
    await page.goto('/builder-demo?site=test-browser',{waitUntil:'domcontentloaded'});
    await page.locator('input[maxlength="120"]').waitFor();
    assert.equal(await page.locator('input[maxlength="120"]').inputValue(),'Browser Fixture');
  });
  await check('undo and redo restore typed content',async()=>{
    const field=page.locator('input[maxlength="120"]');
    await field.fill('Browser Edited');
    await page.getByRole('button',{name:'Hoàn tác'}).click();
    assert.equal(await field.inputValue(),'Browser Fixture');
    await page.getByRole('button',{name:'Làm lại'}).click();
    assert.equal(await field.inputValue(),'Browser Edited');
  });
  await check('theme and drag/drop autosave into versioned JSON',async()=>{
    await page.getByRole('button',{name:'Theme',exact:true}).click();
    await page.getByRole('button',{name:/Forest/}).click();
    await page.getByRole('button',{name:'Khối',exact:true}).click();
    await page.getByRole('button',{name:'Điểm nổi bật',exact:true})
      .dragTo(page.getByText('Thả một khối vào cuối trang'));
    await page.waitForFunction(()=>document.querySelector('button')!==null);
    const until=Date.now()+14000;
    while(Date.now()<until && !(current.themeId==='forest'&&current.pages[0].blocks.length===2))
      await page.waitForTimeout(300);
    assert.equal(current.themeId,'forest');assert.equal(current.pages[0].blocks.length,2);
    assert.ok(saveCount>0);
  });
  await check('network failure stops autosave until explicit retry',async()=>{
    failSave=true;
    await page.locator('input[maxlength="120"]').fill('Offline Browser Edit');
    await page.getByRole('button',{name:'Thử lưu lại'}).waitFor({timeout:14000});
    assert.notEqual(current.title,'Offline Browser Edit');
    failSave=false;
    await page.getByRole('button',{name:'Thử lưu lại'}).click();
    const until=Date.now()+12000;
    while(Date.now()<until&&current.title!=='Offline Browser Edit')await page.waitForTimeout(250);
    assert.equal(current.title,'Offline Browser Edit');
  });
  await check('failed cloud loads never overwrite independent local drafts',async()=>{
    const local=await browser.newPage({baseURL:base});
    await local.goto('/builder-demo',{waitUntil:'domcontentloaded'});
    const saved=clone(doc);saved.title='Retain my private draft';
    await local.evaluate(value=>localStorage.setItem('motngum.visual-builder-demo.v2',JSON.stringify(value)),saved);
    await local.route('**/api/sites/broken-cloud',r=>r.fulfill({status:503,json:{error:'offline'}}));
    await local.goto('/builder-demo?site=broken-cloud',{waitUntil:'domcontentloaded'});
    await local.getByRole('heading',{name:'Không thể mở website trên cloud'}).waitFor();
    const after=await local.evaluate(()=>JSON.parse(localStorage.getItem('motngum.visual-builder-demo.v2')));
    assert.equal(after.title,saved.title);
    await local.close();
  });
  console.log('PASS: all Chromium editor foundation checks');
}catch(e){
  console.error('FAIL Chromium:',e);
  process.exitCode=1;
}finally{await browser.close();}
