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
  assert.equal((await request('/api/sites/'+site.id+'/unpublish',{jwt:b,method:'POST',body:{}})).status,404);
  r=await request('/api/sites/'+site.id+'/unpublish',{jwt:a,method:'POST',body:{}});
  assert.equal(r.status,200,JSON.stringify(r.data));
  assert.equal((await request('/s/'+slug)).status,404);
  console.log('PASS: two tenant isolation, CSRF, CAS draft save, revision restore, publish snapshot, unpublish and malicious URL checks');
}finally{await sql.end();}
