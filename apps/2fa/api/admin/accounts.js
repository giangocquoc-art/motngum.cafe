import {sql} from '../_lib/db.js';
import {hasAdminSession,noCache,safeOrigin,bodyOf,normalizeLogin,normalizeSecret,encryptSecret} from '../_lib/security.js';
const clean = x => typeof x==='string' ? x.trim() : '';
const privateLogin = value => { const login=normalizeLogin(value); if(!/^[a-f0-9]{32}$/.test(login)) throw new Error('Mã tài khoản phải là 32 ký tự hex ngẫu nhiên. Hãy nhấn Tạo mã tài khoản.'); return login; };
export default async function handler(req,res){
  noCache(res);
  if(!hasAdminSession(req)) return res.status(401).json({error:'Vui lòng đăng nhập admin'});
  if(!['GET','POST','PATCH','DELETE'].includes(req.method)) return res.status(405).json({error:'Phương thức không hợp lệ'});
  if(req.method!=='GET'&&!safeOrigin(req)) return res.status(403).json({error:'Yêu cầu không hợp lệ'});
  try{
    if(req.method==='GET'){
      const rows=await sql`SELECT id,login,label,active,created_at,updated_at FROM vault_accounts ORDER BY created_at DESC LIMIT 500`;
      return res.status(200).json({accounts:rows});
    }
    const b=bodyOf(req);
    if(req.method==='POST'){
      const login=privateLogin(b.login);
      const label=clean(b.label).slice(0,120);
      const secret=encryptSecret(normalizeSecret(b.secret));
      await sql`INSERT INTO vault_accounts(login,label,secret_encrypted,access_salt,access_hash) VALUES(${login},${label},${secret},'token-v2','token-v2')`;
      return res.status(201).json({ok:true});
    }
    if(!/^[0-9a-f-]{36}$/.test(b.id||'')) return res.status(400).json({error:'ID không hợp lệ'});
    if(req.method==='DELETE') {
      await sql`DELETE FROM vault_accounts WHERE id=${b.id}::uuid`;
      return res.status(200).json({ok:true});
    }
    const login= b.login===undefined? null:privateLogin(b.login);
    const label= b.label===undefined?null:clean(b.label).slice(0,120);
    const secret= b.secret?encryptSecret(normalizeSecret(b.secret)):null;
    const active= typeof b.active==='boolean'?b.active:null;
    const rotateToken=login!==null;
    await sql`UPDATE vault_accounts SET login=COALESCE(${login},login),label=COALESCE(${label},label),secret_encrypted=COALESCE(${secret},secret_encrypted),access_salt=CASE WHEN ${rotateToken} THEN 'token-v2' ELSE access_salt END,access_hash=CASE WHEN ${rotateToken} THEN 'token-v2' ELSE access_hash END,active=COALESCE(${active},active),updated_at=now() WHERE id=${b.id}::uuid`;
    return res.status(200).json({ok:true});
  }catch(e){
    if(e.code==='23505')return res.status(409).json({error:'Tài khoản đã tồn tại'});
    if(/(không hợp lệ|tối thiểu|ít nhất|Chỉ hỗ trợ|quá ngắn)/.test(e.message||''))return res.status(400).json({error:e.message});
    return res.status(500).json({error:'Không thể thực hiện thao tác'});
  }
}
