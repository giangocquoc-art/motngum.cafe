import { sql, checkLimit, failLimit, resetLimit } from './_lib/db.js';
import { normalizeLogin, decryptSecret, totp, verifyPass, noCache, bodyOf, rateKey, clientIP, safeOrigin } from './_lib/security.js';
function decodeToken(value) {
  if (typeof value !== 'string' || value.length > 512) return null;
  const match = /^M2\.([A-Za-z0-9_-]{4,250})\.([A-Za-z0-9_-]{8,250})$/.exec(value.trim());
  if (!match) return null;
  try {
    if (match[1] !== Buffer.from(match[1], 'base64url').toString('base64url') ||
        match[2] !== Buffer.from(match[2], 'base64url').toString('base64url')) return null;
    const login = normalizeLogin(Buffer.from(match[1], 'base64url').toString('utf8'));
    const pin = Buffer.from(match[2], 'base64url').toString('utf8');
    if (!pin || pin.length > 160) return null;
    return {login, pin};
  } catch { return null; }
}
export default async function handler(req,res) {
  noCache(res);
  if (req.method !== 'POST') return res.status(405).json({error:'Phương thức không hợp lệ'});
  if (!safeOrigin(req)) return res.status(403).json({error:'Yêu cầu không hợp lệ'});
  const invalid={error:'Mã truy cập không đúng hoặc đã hết hiệu lực'};
  try {
    const ipKey=rateKey('code-ip',clientIP(req));
    if(await checkLimit(ipKey,60)) return res.status(429).json({error:'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.'});
    const b=bodyOf(req);
    const parsed=decodeToken(b.access);
    if(!parsed) {
      await failLimit(ipKey);
      return res.status(401).json(invalid);
    }
    const accountKey=rateKey('code-account',parsed.login);
    if(await checkLimit(accountKey,10)) return res.status(429).json({error:'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.'});
    const rows=await sql`SELECT secret_encrypted,access_salt,access_hash,active FROM vault_accounts WHERE login=${parsed.login} LIMIT 1`;
    const row=rows[0];
    const ok=verifyPass(parsed.pin,row?.access_salt||'00000000000000000000000000000000',row?.access_hash||'0000000000000000000000000000000000000000000000000000000000000000');
    if(!row||!row.active||!ok) {
      await Promise.all([failLimit(accountKey),failLimit(ipKey)]);
      return res.status(401).json(invalid);
    }
    await Promise.all([resetLimit(accountKey),resetLimit(ipKey)]);
    return res.status(200).json(totp(decryptSecret(row.secret_encrypted)));
  } catch {
    return res.status(500).json({error:'Hệ thống gặp sự cố. Vui lòng thử lại.'});
  }
}
