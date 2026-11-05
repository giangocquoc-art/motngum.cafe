import { checkLimit, failLimit, resetLimit } from '../_lib/db.js';
import {adminPasswordValid, makeSession, cookie, safeOrigin, noCache, bodyOf, rateKey, clientIP} from '../_lib/security.js';
export default async function handler(req,res) {
  noCache(res);
  if(req.method!=='POST') return res.status(405).json({error:'Phương thức không hợp lệ'});
  if(!safeOrigin(req)) return res.status(403).json({error:'Yêu cầu không hợp lệ'});
  try{
    const b=bodyOf(req);
    const key=rateKey('admin',clientIP(req));
    if(await checkLimit(key, 5)) return res.status(429).json({error:'Tạm khóa đăng nhập 15 phút'});
    if(b.username!=='admin' || !adminPasswordValid(b.password)){
      await failLimit(key);
      return res.status(401).json({error:'Thông tin đăng nhập không đúng'});
    }
    await resetLimit(key);
    res.setHeader('Set-Cookie',cookie(makeSession()));
    return res.status(200).json({ok:true});
  } catch {return res.status(500).json({error:'Hệ thống gặp sự cố'});}
}
