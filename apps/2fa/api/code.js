import { sql, checkLimit, failLimit, resetLimit } from './_lib/db.js';
import { normalizeLogin, decryptSecret, totp, verifyPass, noCache, bodyOf, rateKey, clientIP, safeOrigin } from './_lib/security.js';
export default async function handler(req,res) {
  noCache(res);
  if(req.method !== 'POST') return res.status(405).json({error:'Phương thức không hợp lệ'});
  if(!safeOrigin(req)) return res.status(403).json({error:'Yêu cầu không hợp lệ'});
  try {
    const b=bodyOf(req);
    const login=normalizeLogin(b.account);
    const pin=b.pin;
    if(typeof pin!=='string' || pin.length<1 || pin.length>160) return res.status(400).json({error:'Tài khoản hoặc mã truy cập không đúng'});
    const ip=clientIP(req);
    const perAccount=rateKey('code-account', login);
    const perIP=rateKey('code-ip', ip);
    if(await checkLimit(perAccount, 10) || await checkLimit(perIP, 60)) return res.status(429).json({error:'Có quá nhiều lần thử. Vui lòng thử lại sau 15 phút.'});
    const rows=await sql`SELECT secret_encrypted,access_salt,access_hash,active FROM vault_accounts WHERE login=${login} LIMIT 1`;
    const row=rows[0];
    // Always perform a comparable hash, even for non-existing accounts.
    const ok=verifyPass(pin, row?.access_salt || '00000000000000000000000000000000', row?.access_hash || '0000000000000000000000000000000000000000000000000000000000000000');
    if(!row || !row.active || !ok) {
      await Promise.all([failLimit(perAccount),failLimit(perIP)]);
      return res.status(401).json({error:'Tài khoản hoặc mã truy cập không đúng'});
    }
    await Promise.all([resetLimit(perAccount),resetLimit(perIP)]);
    const otp=totp(decryptSecret(row.secret_encrypted));
    return res.status(200).json(otp);
  } catch (e) {
    if(e.message==='Tài khoản không hợp lệ' || e instanceof SyntaxError) return res.status(400).json({error:'Tài khoản hoặc mã truy cập không đúng'});
    return res.status(500).json({error:'Hệ thống gặp sự cố. Vui lòng thử lại.'});
  }
}
