/**
 * Real Puck 0.24 runtime acceptance against disposable PostgreSQL/Next.js CI.
 * Runs only under CI=true; never touches a user's site or external deployment.
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import postgres from 'postgres';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');

if(process.env.CI!=='true')throw Error('Puck browser acceptance only runs in CI');
const base='http://127.0.0.1:3000';
const dbUrl=process.env.POSTGRES_URL,secret=process.env.AUTH_SECRET;
assert.ok(dbUrl&&secret&&secret.length>=32);
const sql=postgres(dbUrl,{max:2});
const id=randomUUID(),tag=randomUUID().slice(0,8),slug='puck-ci-'+tag;
const original={version:2,title:'CI Puck Studio '+tag,themeId:'coffee',
  pages:[
    {id:randomUUID(),title:'Trang chủ',slug:'trang-chu',blocks:[
      {id:randomUUID(),kind:'hero',variant:'split',title:'Puck kiểm thử thật',
       body:'Giữ nguyên toàn bộ dữ liệu gốc',imageUrl:'',buttonLabel:'Liên hệ',
       buttonUrl:'#page:lien-he',accent:'#a65a32'}
    ]},
    {id:randomUUID(),title:'Liên hệ',slug:'lien-he',blocks:[
      {id:randomUUID(),kind:'text',variant:'minimal',title:'Thông tin liên hệ',
       body:'Trích từ PostgreSQL',imageUrl:'',buttonLabel:'',buttonUrl:'',accent:'#a65a32'}
    ]}
  ]};
let browser,context,page;
async function until(fn,description,ms=18000){
  const end=Date.now()+ms;
  while(Date.now()<end) {
    if(await fn())return;
    await new Promise(resolve=>setTimeout(resolve,300));
  }
  throw Error('Timeout: '+description);
}
async function saved(){
  const [row]=await sql.unsafe('SELECT draft_document,draft_version FROM builder_sites WHERE id=$1',[id]);
  return row;
}
try{
  const [user]=await sql.unsafe('INSERT INTO users (email,password_hash,role) VALUES ($1,$2,$3) RETURNING id',
    ['ci-puck-'+tag+'@sample.invalid','ci-only-hash','owner']);
  const [team]=await sql.unsafe("INSERT INTO teams (name) VALUES ('Puck browser test tenant') RETURNING id");
  await sql.unsafe("INSERT INTO team_members (user_id,team_id,role) VALUES ($1,$2,'owner')",[user.id,team.id]);
  await sql.unsafe(
    'INSERT INTO builder_sites(id,team_id,created_by,slug,title,draft_document) VALUES ($1,$2,$3,$4,$5,$6::jsonb)',
    [id,team.id,user.id,slug,original.title,JSON.stringify(original)]
  );
  const token=await new SignJWT({user:{id:user.id},version:0,
    expires:new Date(Date.now()+3600_000).toISOString()})
    .setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1 hour')
    .sign(new TextEncoder().encode(secret));
  browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  context=await browser.newContext({baseURL:base,viewport:{width:1440,height:900}});
  await context.addCookies([{name:'session',value:token,url:base,httpOnly:true,sameSite:'Lax'}]);
  page=await context.newPage();
  page.setDefaultTimeout(18000);
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const res=await page.goto('/dashboard/sites/'+id+'/puck',{waitUntil:'domcontentloaded'});
  assert.equal(res.status(),200);
  await page.locator('[data-studio="puck"]').waitFor();
  await page.getByRole('heading',{name:/Puck Studio/}).first().waitFor();
  // Puck's canvas is iframe-backed by default; Playwright must enter that frame.
  await page.frameLocator('#preview-frame').getByText('Puck kiểm thử thật').first().waitFor();
  assert.equal(errors.length,0,'Puck renderer emitted unexpected browser errors: '+errors.join('; '));
  console.log('PASS Puck browser: authenticated team site opens Puck v0.24 runtime with real draft');

  // An actual Puck canvas selection + field edit must reach the same v2
  // PostgreSQL draft, not merely update a separate in-memory Puck document.
  await page.frameLocator('#preview-frame').getByText('Puck kiểm thử thật').first().click();
  const field=page.locator('input[title="Tiêu đề"]').first();
  await field.waitFor();
  await field.fill('Tiêu đề đã sửa trực tiếp bằng Puck');
  await until(async()=>(await saved())?.draft_document?.pages?.[0]?.blocks?.[0]?.title===
    'Tiêu đề đã sửa trực tiếp bằng Puck','Puck field autosave');
  console.log('PASS Puck browser: field edit inside Puck canvas saves actual v2 block via CAS');

  const theme=page.getByRole('combobox',{name:'Chọn theme'});
  await theme.selectOption('forest');
  await until(async()=>(await saved())?.draft_document?.themeId==='forest','Puck theme persisted');
  let row=await saved();
  assert.ok(row.draft_version>=3);
  assert.deepEqual(row.draft_document.pages.map(p=>p.id),original.pages.map(p=>p.id));
  assert.equal(row.draft_document.pages[0].blocks[0].buttonUrl,'#page:lien-he');
  console.log('PASS Puck browser: theme is autosaved with CAS, page IDs and CTA link preserved');

  await page.getByRole('button',{name:/Liên hệ \/lien-he/}).click();
  await until(async()=>{
    const nav=page.getByRole('button',{name:/Liên hệ \/lien-he/});
    return (await nav.getAttribute('aria-current'))==='page';
  },'Switch Puck page');
  const after=await saved();
  assert.equal(after.draft_document.pages[0].blocks[0].title,'Tiêu đề đã sửa trực tiếp bằng Puck');
  assert.equal(after.draft_document.pages[0].blocks[0].buttonUrl,original.pages[0].blocks[0].buttonUrl);
  assert.deepEqual(after.draft_document.pages[1].blocks,original.pages[1].blocks);
  assert.equal(errors.length,0,'Page-switch runtime errors: '+errors.join('; '));
  console.log('PASS Puck browser: switching to second page does not rewrite sibling blocks');

  // Full multi-page authoring with actual Puck + real revisioned PostgreSQL writes.
  async function dialogs(answers,action){
    const pending=[...answers];
    const handler=dialog=>{
      const answer=pending.shift();
      if(answer===undefined)throw Error('Unexpected editor dialog '+dialog.type());
      void dialog.accept(answer);
    };
    page.on('dialog',handler);
    try{await action();}finally{page.off('dialog',handler);}
    assert.equal(pending.length,0,'All requested prompts/confirms must appear');
  }
  await dialogs(['ket-noi'],async()=>page.getByRole('button',{name:'Đổi slug'}).click());
  await until(async()=>{
    const d=(await saved()).draft_document;
    return d.pages[1].slug==='ket-noi'&&d.pages[0].blocks[0].buttonUrl==='#page:ket-noi';
  },'page slug and inbound CTA rewrite');
  console.log('PASS Puck browser: slug rename rewrites cross-page CTA in PostgreSQL');

  await dialogs(['Kết nối thực tế'],async()=>page.getByRole('button',{name:'Đổi tên'}).click());
  await until(async()=>(await saved()).draft_document.pages[1].title==='Kết nối thực tế',
    'page title persisted without rewriting slug');
  await dialogs(['Giới thiệu','gioi-thieu'],
    async()=>page.getByRole('button',{name:'Thêm trang'}).click());
  await until(async()=>(await saved()).draft_document.pages.length===3,'new page persisted');
  const withNew=await saved();
  assert.equal(withNew.draft_document.pages[2].slug,'gioi-thieu');
  assert.equal(withNew.draft_document.pages[2].blocks.length,0);
  assert.equal(new Set(withNew.draft_document.pages.map(p=>p.id)).size,3);
  console.log('PASS Puck browser: create a blank new page without sample/demo data');

  await page.getByRole('button',{name:/Kết nối thực tế \/ket-noi/}).click();
  await dialogs(['ket-noi-copy'],async()=>page.getByRole('button',{name:'Nhân bản trang'}).click());
  await until(async()=> (await saved()).draft_document.pages.length===4,
    'duplicate page with unique IDs');
  const copied=(await saved()).draft_document;
  assert.equal(copied.pages[2].slug,'ket-noi-copy');
  assert.notEqual(copied.pages[1].id,copied.pages[2].id);
  assert.notEqual(copied.pages[1].blocks[0].id,copied.pages[2].blocks[0].id);
  await page.getByRole('button',{name:'↑ Đưa lên'}).click();
  await until(async()=> (await saved()).draft_document.pages[1].slug==='ket-noi-copy',
    'reorder page without changing blocks');
  console.log('PASS Puck browser: duplicate + reorder preserves unique component IDs');

  await page.getByRole('button',{name:/Kết nối thực tế \/ket-noi/}).click();
  await dialogs(['gioi-thieu',''],async()=>page.getByRole('button',{name:'Xóa trang'}).click());
  await until(async()=>{
    const d=(await saved()).draft_document;
    return d.pages.length===3 && !d.pages.some(p=>p.slug==='ket-noi') &&
      d.pages[0].blocks[0].buttonUrl==='#page:gioi-thieu';
  },'delete linked page with explicit CTA replacement');
  console.log('PASS Puck browser: deleting a referenced page redirects CTA and keeps 3 valid pages');

  await until(async()=>(await page.getByRole('button',{name:'Đã lưu'}).isVisible()).valueOf(),
    'saved before publish');
  await dialogs([''],async()=>{
    await page.locator('[data-studio="puck"]').getByRole('button',{name:/publish|xuất bản/i}).first().click();
  });
  await until(async()=>{
    const [entry]=await sql.unsafe('SELECT published_version FROM builder_sites WHERE id=$1',[id]);
    return typeof entry?.published_version==='number';
  },'owner publish snapshot');
  const snapshot=await page.request.get('/s/'+slug);
  assert.equal(snapshot.status(),200);
  assert.match(await snapshot.text(),/Puck kiểm thử thật|Tiêu đề đã sửa trực tiếp bằng Puck/);
  console.log('PASS Puck browser: owner publish after CAS saves immutable public snapshot');

  // A URL containing another tenant's site UUID must not disclose its draft,
  // even when the visitor is logged in to a valid unrelated organization.
  const outsider=await sql.unsafe('INSERT INTO users(email,password_hash,role) VALUES ($1,$2,$3) RETURNING id',
    ['ci-puck-outsider-'+tag+'@sample.invalid','ci-only-hash','owner']);
  const [team2]=await sql.unsafe("INSERT INTO teams(name) VALUES ('Puck unrelated tenant') RETURNING id");
  await sql.unsafe("INSERT INTO team_members(user_id,team_id,role) VALUES ($1,$2,'owner')",[outsider[0].id,team2.id]);
  const outsiderToken=await new SignJWT({user:{id:outsider[0].id},version:0,
    expires:new Date(Date.now()+3600_000).toISOString()})
    .setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1 hour')
    .sign(new TextEncoder().encode(secret));
  const isolated=await browser.newContext({baseURL:base});
  await isolated.addCookies([{name:'session',value:outsiderToken,url:base,httpOnly:true,sameSite:'Lax'}]);
  const outsiderPage=await isolated.newPage();
  const outsiderRes=await outsiderPage.goto('/dashboard/sites/'+id+'/puck',{waitUntil:'networkidle'});
  const outsiderHtml=await outsiderPage.content();
  assert.ok(outsiderRes.status()===404||/404|This page could not be found/i.test(outsiderHtml));
  assert.doesNotMatch(outsiderHtml,/Puck kiểm thử thật/);
  await isolated.close();
  console.log('PASS Puck browser: cross-tenant editor access denied');

  console.log('PASS: Puck runtime + real PostgreSQL + tenant integration checks');
}catch(error){
  console.error('FAIL: Puck runtime browser integration:',error);
  if(page)try{await page.screenshot({path:'/tmp/studio-puck-failure.png',fullPage:true,timeout:4000});}
    catch{}
  process.exitCode=1;
}finally{
  if(browser)await browser.close();
  await sql.end();
}
