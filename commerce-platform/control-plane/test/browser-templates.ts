/**
 * Chromium evidence for three MIT-normalized templates, in disposable CI.
 * Screenshots are artifacts for human review, not approved pixel baselines.
 */
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import postgres from 'postgres';
import {SignJWT} from 'jose';
import {SITE_TEMPLATES,buildTemplateDocument} from '../lib/builder/catalog';
import {publishIssues,validateSiteDocument} from '../lib/builder/validation';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE!);
const axeModule=await import(process.env.AXE_MODULE!);
const AxeBuilder=axeModule.default;
if(process.env.CI!=='true')throw Error('Browser evidence only in disposable CI');
const base='http://127.0.0.1:3000';
const sql=postgres(process.env.POSTGRES_URL!,{max:2});
const folder=join(process.cwd(),'artifacts','studio-template-evidence');
const items=[
 {source:'shadcn-card',pattern:'shadcn-card'},
 {source:'magic-border-beam',pattern:'magic-beam'},
 {source:'startbootstrap-agency',pattern:'agency-timeline'}
] as const;
let browser;
try{
  await mkdir(folder,{recursive:true});
  const tag=randomUUID().slice(0,8);
  const [user]=await sql.unsafe('INSERT INTO users(email,password_hash,role) VALUES ($1,$2,$3) RETURNING id',
    ['template-ci-'+tag+'@sample.invalid','fixture-only','owner']);
  const [team]=await sql.unsafe("INSERT INTO teams(name) VALUES ('Template visual acceptance') RETURNING id");
  await sql.unsafe("INSERT INTO team_members(user_id,team_id,role) VALUES ($1,$2,'owner')",
    [user.id,team.id]);
  const sites=[];
  for(const item of items){
    const template=SITE_TEMPLATES.find(t=>t.curatedSource===item.source);
    assert.ok(template);
    const doc=buildTemplateDocument(template);
    assert.deepEqual(validateSiteDocument(doc),doc);
    assert.ok(publishIssues(doc).length>0,'Unfinished templates must be blocked for normal publishing');
    const id=randomUUID(),slug=item.source+'-'+tag;
    // Only the disposable DB receives a fixture published snapshot. The normal
    // publish API still rejects sample contacts until users customize them.
    await sql.unsafe('INSERT INTO builder_sites (id,team_id,created_by,slug,title,draft_document,published_document,published_version,published_at) VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,1,NOW())',
      [id,team.id,user.id,slug,doc.title,JSON.stringify(doc),JSON.stringify(doc)]);
    sites.push({...item,id,slug,doc});
  }
  const token=await new SignJWT({user:{id:user.id},version:0,
    expires:new Date(Date.now()+3600000).toISOString()})
    .setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1 hour')
    .sign(new TextEncoder().encode(process.env.AUTH_SECRET!));
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  const desktop=await browser.newContext({baseURL:base,viewport:{width:1440,height:900},
    reducedMotion:'reduce',deviceScaleFactor:1});
  await desktop.addCookies([{name:'session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
  const page=await desktop.newPage();
  page.setDefaultTimeout(15000);
  const errors:string[]=[];
  page.on('pageerror',error=>errors.push(error.message));
  for(const site of sites){
    const result=await page.goto('/s/'+site.slug,{waitUntil:'domcontentloaded'});
    assert.equal(result?.status(),200);
    const locator=page.locator('[data-studio-pattern="'+site.pattern+'"]').first();
    await locator.waitFor();
    const desc=await locator.evaluate(node=>{
      const heading=node.querySelector('h2')!;
      const css=getComputedStyle(heading);
      return {title:heading.textContent?.trim(),font:css.fontFamily,weight:css.fontWeight};
    });
    assert.ok(desc.title?.length);
    await page.locator('main').screenshot({path:join(folder,site.source+'-desktop.png'),
      animations:'disabled'});
    const editorResult=await page.goto('/dashboard/sites/'+site.id+'/puck',
      {waitUntil:'domcontentloaded'});
    assert.equal(editorResult?.status(),200);
    const editor=page.frameLocator('#preview-frame')
      .locator('[data-studio-pattern="'+site.pattern+'"]').first();
    await editor.waitFor();
    const editDesc=await editor.evaluate(node=>{
      const heading=node.querySelector('h2')!;
      const css=getComputedStyle(heading);
      return {title:heading.textContent?.trim(),font:css.fontFamily,weight:css.fontWeight};
    });
    assert.deepEqual(editDesc,desc,'Shared renderer typography differs '+site.source);
    await editor.screenshot({path:join(folder,site.source+'-puck.png'),
      animations:'disabled'});
    console.log('PASS pattern parity '+site.source+' Puck iframe matches published typography');

    await page.goto('/s/'+site.slug,{waitUntil:'domcontentloaded'});
    const resultAxe=await new AxeBuilder({page})
      .withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    const severe=resultAxe.violations.filter((v:{impact:string})=>
      ['critical','serious'].includes(v.impact));
    assert.deepEqual(severe.map((v:{id:string,impact:string})=>[v.id,v.impact]),[],
      'Severe WCAG A/AA violations in '+site.source);
    console.log('PASS WCAG severe/critical '+site.source);
  }
  const touch=await browser.newContext({baseURL:base,viewport:{width:390,height:844},
    isMobile:true,hasTouch:true,reducedMotion:'reduce',deviceScaleFactor:2});
  await touch.addCookies([{name:'session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
  const mobile=await touch.newPage();
  mobile.setDefaultTimeout(15000);
  for(const site of sites){
    const res=await mobile.goto('/s/'+site.slug,{waitUntil:'domcontentloaded'});
    assert.equal(res?.status(),200);
    const widths=await mobile.evaluate(()=>({
      screen:window.innerWidth,content:document.documentElement.scrollWidth}));
    assert.ok(widths.content<=widths.screen+3,'Mobile horizontal overflow '+site.source+' '+JSON.stringify(widths));
    const section=mobile.locator('[data-studio-pattern="'+site.pattern+'"]').first();
    await section.waitFor();
    await mobile.locator('main').screenshot({path:join(folder,site.source+'-mobile.png'),
      animations:'disabled'});
    if(site.source==='magic-border-beam'){
      const animation=await section.locator('.studio-border-beam').first()
        .evaluate(node=>getComputedStyle(node,'::before').animationName);
      assert.equal(animation,'none','Reduced motion did not disable Magic beam');
    }
    if(site.source==='startbootstrap-agency')
      assert.ok(await section.locator('ol > li').count()>=3,'Timeline must be an ordered list');
    console.log('PASS mobile/touch layout '+site.source);
  }
  // Real mobile tap and keyboard-focus fallback instead of unreliable fake DnD.
  const first=sites[0];
  await mobile.goto('/dashboard/sites/'+first.id+'/puck',{waitUntil:'domcontentloaded'});
  await mobile.getByRole('heading',{name:/Puck Studio/}).first().waitFor();
  await mobile.getByRole('button',{name:/Giải pháp \/giai-phap/}).tap();
  await mobile.getByRole('combobox',{name:'Loại khối thêm nhanh'}).selectOption('text');
  const add=mobile.getByRole('button',{name:'Thêm khối vào trang'});
  await add.tap();
  let persisted=false;
  for(let i=0;i<72;i++){
    const [row]=await sql.unsafe('SELECT draft_document FROM builder_sites WHERE id=$1',[first.id]);
    const result=row.draft_document.pages.find((p:{slug:string})=>p.slug==='giai-phap');
    if(result?.blocks.length===4){persisted=true;break;}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(persisted,'Mobile tap insertion did not autosave to PostgreSQL');
  await add.focus();
  assert.equal(await add.evaluate(node=>node===document.activeElement),true);
  console.log('PASS Puck mobile touch insertion + keyboard focus and PostgreSQL autosave');
  assert.deepEqual(errors,[],'Uncaught public/Puck runtime browser errors');
  console.log('PASS curated visual + accessibility + mobile + shared renderer acceptance');
}finally{
  if(browser)await browser.close();
  await sql.end();
}
