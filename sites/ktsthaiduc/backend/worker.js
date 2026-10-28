const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
export default {
 async fetch(request,env){
  if(request.method==='GET')return json({service:'ktsthaiduc-contact',status:'ok'});
  if(request.method!=='POST')return json({error:'Method not allowed'},405);
  let data;try{data=await request.json()}catch{return json({error:'Invalid body'},400)}
  const {name,phone,email='',service='',message}=data||{};
  if(typeof name!=='string'||name.trim().length<2||name.length>90||typeof phone!=='string'||phone.length>20||typeof message!=='string'||message.trim().length<10||message.length>3000||typeof email!=='string'||email.length>160||typeof service!=='string'||service.length>100)return json({error:'Invalid fields'},400);
  const ip=request.headers.get('CF-Connecting-IP')||'unknown';
  const bytes=new TextEncoder().encode('ktsthaiduc-contact|'+ip);
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  const iphash=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE ip_hash=? AND created_at>=datetime('now','-15 minutes')").bind(iphash).first();
  if((count?.n||0)>=80)return json({error:'Rate limit exceeded'},429);
  const byPhone=await env.DB.prepare("SELECT COUNT(*) AS n FROM inquiries WHERE phone=? AND created_at>=datetime('now','-1 day')").bind(phone.trim()).first();
  if((byPhone?.n||0)>=3)return json({error:'Phone rate limit exceeded'},429);
  await env.DB.prepare('INSERT INTO inquiries (name,phone,email,service,message,ip_hash) VALUES(?,?,?,?,?,?)').bind(name.trim(),phone.trim(),email.trim(),service.trim(),message.trim(),iphash).run();
  return json({ok:true},201);
 }
};