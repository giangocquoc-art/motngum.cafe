// Disposable PostgreSQL + live Next server test; never run against a production database.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SignJWT } from 'jose';
import postgres from 'postgres';

const base='http://127.0.0.1:3000',dbUrl=process.env.POSTGRES_URL,secret=process.env.AUTH_SECRET;
assert.ok(dbUrl&&secret&&secret.length>=32);
if(process.env.CI!=='true')throw Error('Disposable CI database only');
const sql=postgres(dbUrl,{max:1});
async function token(id) {
  return new SignJWT({user:{id},version:0,expires:new Date(Date.now()+3600000).toISOString()})
    .setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('1 hour')
    .sign(new TextEncoder().encode(secret));
}
const doc={
  version:2,title:'CI Motngum Bakery',themeId:'coffee',
  pages:[
    {id:randomUUID(),title:'Trang chủ',slug:'trang-chu',blocks:[
      {id:randomUUID(),kind:'hero',variant:'split',title:'Bánh ngon mỗi ngày',
        body:'Bánh được làm tươi mỗi sáng',imageUrl:'',buttonLabel:'Liên hệ',buttonUrl:'#page:lien-he',accent:'#a65a32'}
    ]},
    {id:randomUUID(),title:'Liên hệ',slug:'lien-he',blocks:[
      {id:randomUUID(),kind:'text',variant:'minimal',title:'Liên hệ',body:'Vui lòng gặp chúng tôi tại quầy',
       imageUrl:'',buttonLabel:'',buttonUrl:'',accent:'#a65a32'}
    ]}
  ]
};
async function request(path,{jwt,method='GET',body,origin=base}={}){
  const headers={...(jwt?{cookie:'session='+jwt}:{}),...(body?{'content-type':'application/json',origin}: {})};
  const response=await fetch(base+path,{method,headers,...(body?{body:JSON.stringify(body)}:{}),redirect:'manual'});
  const text=await response.text();
  let data;try{data=JSON.parse(text)}catch{data=text}
  return {status:response.status,data};
}
try {
  const tag=randomUUID().slice(0,12);
  const [u1]=await sql.unsafe('INSERT INTO users (email,password_hash,role) VALUES ($1,$2,$3) RETURNING id',[tag+'-studio1@sample.invalid','ci-hash','owner']);
  const [u2]=await sql.unsafe('INSERT INTO users (email,password_hash,role) VALUES ($1,$2,$3) RETURNING id',[tag+'-studio2@sample.invalid','ci-hash','owner']);
  const [t1]=await sql.unsafe("INSERT INTO teams (name) VALUES ('CI builder tenant A') RETURNING id");
  const [t2]=await sql.unsafe("INSERT INTO teams (name) VALUES ('CI builder tenant B') RETURNING id");
  await sql.unsafe('INSERT INTO team_members (user_id,team_id,role) VALUES ($1,$2,$3),($4,$5,$6)',[u1.id,t1.id,'owner',u2.id,t2.id,'owner']);
  const a=await token(u1.id),b=await token(u2.id);
  assert.equal((await request('/api/sites')).status,401);
  assert.equal((await request('/api/sites',{jwt:a,method:'POST',body:{document:doc},origin:'https://attacker.invalid'})).status,403);
  // One versioned contract is shared by editor import/cloud hydration and API writes.
  // Malformed documents fail closed before any site row is created.
  for (const mutate of [
    d=>{d.title='   ';},
    d=>{d.pages[1].slug=d.pages[0].slug;},
    d=>{d.pages[1].blocks[0].id=d.pages[0].blocks[0].id;},
    d=>{d.pages[0].blocks[0].imageUrl='javascript:alert(1)';},
    d=>{d.pages[0].blocks[0].buttonUrl='data:text/html,malicious';},
    d=>{d.version=99;},
    d=>{d.pages[0].blocks[0].accent='not-a-color';},
    d=>{d.pages[0].blocks[0].body='x'.repeat(2001);},
    d=>{d.metadata={seo:'should not be silently stripped'};},
    d=>{d.pages[0].layout={columns:3};},
    d=>{d.pages[0].blocks[0].fontSize=24;},
    d=>{d.pages=[];}
  ]) {
    const bad=structuredClone(doc);mutate(bad);
    const response=await request('/api/sites',{jwt:a,method:'POST',body:{document:bad}});
    assert.equal(response.status,422,JSON.stringify(response.data));
    assert.equal(response.data.error,'invalid_site_document');
  }
  let r=await request('/api/sites',{jwt:a,method:'POST',body:{document:doc}});
  assert.equal(r.status,201,JSON.stringify(r.data));
  const site=r.data.site,slug=site.slug;
  assert.ok(site.id&&site.version===1);
  assert.equal((await request('/api/sites/'+site.id,{jwt:b})).status,404);
  assert.equal((await request('/api/sites/'+site.id)).status,401);
  assert.equal((await request('/api/sites',{jwt:b})).data.sites.length,0);
  assert.equal((await request('/s/'+slug)).status,404);
  r=await request('/api/sites/'+site.id,{jwt:a});
  assert.equal(r.status,200);assert.deepEqual(r.data.site.document,doc);
  assert.equal((await request('/api/sites/'+site.id+'/publish',{jwt:b,method:'POST',body:{version:1}})).status,404);
  r=await request('/api/sites/'+site.id+'/publish',{jwt:a,method:'POST',body:{version:1}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  r=await request('/s/'+slug);assert.equal(r.status,200);assert.match(r.data,/Bánh được làm tươi mỗi sáng/);
  const next=structuredClone(doc);next.pages[0].blocks[0].body='Bánh từ lò làm bằng tay - phiên bản mới';
  assert.equal((await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:0,document:next}})).status,422);
  assert.equal((await request('/api/sites/'+site.id,{jwt:b,method:'PATCH',body:{version:1,document:next}})).status,409);
  r=await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:1,document:next}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.site.version,2);
  assert.equal((await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:1,document:doc}})).status,409);
  r=await request('/s/'+slug);assert.equal(r.status,200);assert.match(r.data,/Bánh được làm tươi mỗi sáng/);assert.doesNotMatch(r.data,/phiên bản mới/);
  r=await request('/api/sites/'+site.id+'/publish',{jwt:a,method:'POST',body:{version:2}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  r=await request('/s/'+slug);assert.equal(r.status,200);assert.match(r.data,/phiên bản mới/);
  const broken=structuredClone(next);broken.pages[0].blocks[0].buttonUrl='javascript:alert(1)';
  assert.equal((await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:2,document:broken}})).status,422);
  const fake=structuredClone(next);fake.pages[0].blocks[0].body='120+|Khách hàng tin tưởng';
  r=await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:2,document:fake}});
  assert.equal(r.status,200);
  r=await request('/api/sites/'+site.id+'/publish',{jwt:a,method:'POST',body:{version:3}});
  assert.equal(r.status,422);assert.equal(r.data.error,'publish_validation_failed');
  assert.equal((await request('/api/sites/'+site.id+'/revisions',{jwt:b})).status,404);
  r=await request('/api/sites/'+site.id+'/revisions',{jwt:a});
  assert.equal(r.status,200);assert.deepEqual(r.data.revisions.map(v=>v.version),[3,2,1]);
  r=await request('/api/sites/'+site.id+'/restore',{jwt:a,method:'POST',body:{version:1,expectedCurrentVersion:3}});
  assert.equal(r.status,200,JSON.stringify(r.data));assert.equal(r.data.version,4);
  assert.equal((await request('/api/sites/'+site.id+'/restore',{jwt:a,method:'POST',body:{version:1,expectedCurrentVersion:3}})).status,409);
  r=await request('/api/sites/'+site.id,{jwt:a});assert.equal(r.data.site.document.pages[0].blocks[0].body,doc.pages[0].blocks[0].body);
  r=await request('/s/'+slug);assert.equal(r.status,200);assert.match(r.data,/phiên bản mới/);
  r=await request('/api/sites/'+site.id+'/publish',{jwt:a,method:'POST',body:{version:4}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  r=await request('/s/'+slug);assert.equal(r.status,200);assert.match(r.data,/Bánh được làm tươi mỗi sáng/);
  assert.equal((await request('/api/sites/'+site.id+'/unpublish',{jwt:b,method:'POST',body:{publishedVersion:4}})).status,404);
  assert.equal((await request('/api/sites/'+site.id+'/unpublish',{jwt:a,method:'POST',body:{}})).status,422);
  r=await request('/api/sites/'+site.id+'/unpublish',{jwt:a,method:'POST',body:{publishedVersion:3}});
  assert.equal(r.status,409,'Stale tab must not remove a newer publication');
  assert.equal((await request('/s/'+slug)).status,200,'stale unpublish must leave public snapshot intact');
  r=await request('/api/sites/'+site.id+'/unpublish',{jwt:a,method:'POST',body:{publishedVersion:4}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  assert.equal((await request('/api/sites/'+site.id+'/unpublish',{jwt:a,method:'POST',body:{publishedVersion:4}})).status,409);
  assert.equal((await request('/s/'+slug)).status,404);
  // Renderer parity: same block must support full-width hero image and readable CTA
  // in published HTML (these variants previously existed only inside the editor).
  const fullDoc=structuredClone(doc);
  fullDoc.title='CI Full Hero Layout';
  fullDoc.pages[0].blocks[0].variant='full';
  fullDoc.pages[0].blocks[0].accent='#f5ecb4';
  fullDoc.pages[0].blocks[0].imageUrl='https://images.unsplash.com/photo-1501339847302-ac426a4cbb?w=1400';
  let full=await request('/api/sites',{jwt:a,method:'POST',body:{document:fullDoc}});
  assert.equal(full.status,201,JSON.stringify(full.data));
  const fullSite=full.data.site;
  full=await request('/api/sites/'+fullSite.id+'/publish',{jwt:a,method:'POST',body:{version:1}});
  assert.equal(full.status,200,JSON.stringify(full.data));
  full=await request('/s/'+fullSite.slug);
  assert.equal(full.status,200);
  assert.match(full.data,/photo-1501339847302-ac426a4cbb/,'Full hero image must render publicly');
  assert.match(full.data,/linear-gradient/,'Full hero must use same image overlay variant as editor');
  assert.match(full.data,/#000000/,'Light hero accent must use readable dark foreground');
  assert.match(full.data,new RegExp('/s/'+fullSite.slug+'/lien-he'),'Internal page CTA must work on public URL');
  console.log('PASS: shared block renderer preserves full hero background, contrast and internal CTA after publish');
  // Public contact & newsletter: consent, idempotency, isolation and rate limiting.
  const formDoc=structuredClone(doc);
  formDoc.title='CI Forms Private Inbox';
  formDoc.pages[1].blocks=[
    {...formDoc.pages[1].blocks[0],id:randomUUID(),kind:'contact',
      body:'Liên hệ với chúng tôi qua biểu mẫu này.',title:'Thông tin liên hệ'},
    {...formDoc.pages[1].blocks[0],id:randomUUID(),kind:'newsletter',
      body:'Đăng ký nhận thông tin khi có cập nhật.',title:'Nhận tin'}
  ];
  let form=await request('/api/sites',{jwt:a,method:'POST',body:{document:formDoc}});
  assert.equal(form.status,201,JSON.stringify(form.data));
  const formSite=form.data.site;
  form=await request('/api/sites/'+formSite.id+'/publish',{jwt:a,method:'POST',body:{version:1}});
  assert.equal(form.status,200,JSON.stringify(form.data));
  const contact=formDoc.pages[1].blocks[0],news=formDoc.pages[1].blocks[1];
  const submit='/api/public-sites/'+formSite.slug+'/submit';
  const payload={requestId:randomUUID(),blockId:contact.id,name:'Tester',email:'guest@example.test',
    message:'Kiểm thử biểu mẫu thật',website:'',consent:true};
  assert.equal((await request(submit,{method:'POST',body:{...payload,consent:false}})).status,422);
  assert.equal((await request(submit,{method:'POST',body:{...payload,blockId:randomUUID()}})).status,404);
  form=await request(submit,{method:'POST',body:payload});
  assert.equal(form.status,201,JSON.stringify(form.data));
  form=await request(submit,{method:'POST',body:payload});
  assert.equal(form.status,200,JSON.stringify(form.data));
  assert.equal(form.data.duplicate,true);
  form=await request(submit,{method:'POST',body:{
    ...payload,requestId:randomUUID(),blockId:news.id,name:'',message:''
  }});
  assert.equal(form.status,201,JSON.stringify(form.data));
  const received=await request('/api/sites/'+formSite.id+'/submissions',{jwt:a});
  assert.equal(received.status,200,JSON.stringify(received.data));
  assert.equal(received.data.submissions.length,2);
  assert.equal(received.data.submissions[0].email,'guest@example.test');
  assert.equal((await request('/api/sites/'+formSite.id+'/submissions',{jwt:b})).status,404);
  assert.equal((await request('/api/sites/'+formSite.id+'/submissions')).status,401);
  const publicForm=await request('/s/'+formSite.slug+'/lien-he');
  assert.equal(publicForm.status,200);
  assert.match(publicForm.data,/Gửi thông tin/);
  await sql.unsafe("INSERT INTO site_submissions(id,request_id,site_id,team_id,block_id,kind,email) SELECT gen_random_uuid(),gen_random_uuid(),$1,$2,$3,'contact','rate@example.test' FROM generate_series(1,24)",
    [formSite.id,t1.id,contact.id]);
  const exceeded=await request(submit,{method:'POST',body:{...payload,requestId:randomUUID()}});
  assert.equal(exceeded.status,429,JSON.stringify(exceeded.data));
  console.log('PASS: public forms consent, PostgreSQL inbox, idempotency, per-site rate limit and cross-tenant isolation');
  // Bound total sites per tenant to prevent free-plan database abuse and ensure
  // concurrent creation is serialized by the organization's database row lock.
  for(let i=0;i<48;i++){
    const extraId=randomUUID();
    await sql.unsafe(
      'INSERT INTO builder_sites (id,team_id,created_by,slug,title,draft_document) VALUES ($1,$2,$3,$4,$5,$6::jsonb)',
      [extraId,t1.id,u1.id,'ci-quota-'+extraId,'CI quota item',JSON.stringify(doc)]);
  }
  const limited=await request('/api/sites',{jwt:a,method:'POST',body:{document:doc}});
  assert.equal(limited.status,429,JSON.stringify(limited.data));
  assert.equal(limited.data.error,'team_site_quota_reached');
  assert.equal((await request('/api/sites',{jwt:b})).data.sites.length,0,
    'Other team remains isolated from quota and sites');
  console.log('PASS: atomic team-level 50-site quota while independent team stays isolated');

  // The quota is durable across instances and keyed to the actual user/team.
  await sql.unsafe("INSERT INTO activity_logs(team_id,user_id,action) SELECT $1,$2,'studio:save' FROM generate_series(1,55)",[t1.id,u1.id]);
  const rateSave=await request('/api/sites/'+site.id,{jwt:a,method:'PATCH',body:{version:4,document:doc}});
  assert.equal(rateSave.status,429,'Per-user save throttle must reject a sustained burst');
  assert.equal(rateSave.data.error,'rate_limited');
  await sql.unsafe("INSERT INTO activity_logs(team_id,user_id,action) SELECT $1,$2,'studio:create' FROM generate_series(1,8)",[t1.id,u1.id]);
  const rateCreate=await request('/api/sites',{jwt:a,method:'POST',body:{document:doc}});
  assert.equal(rateCreate.status,429,'Creation rate limit must be independent of DB site quota');
  assert.equal(rateCreate.data.error,'rate_limited');
  console.log('PASS: PostgreSQL-backed tenant/user rate throttling for site creation and CAS saves');
  console.log('PASS: two tenant isolation, CSRF, CAS draft save, revision restore, publish snapshot, unpublish and malicious URL checks');
}finally{await sql.end();}
