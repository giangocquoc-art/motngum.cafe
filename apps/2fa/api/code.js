import { sql, checkLimit, failLimit } from './_lib/db.js';
import { normalizeLogin, decryptSecret, totp, verifyPass, noCache, bodyOf, rateKey, clientIP, safeOrigin } from './_lib/security.js';

const isPrivateID = value => /^[a-f0-9]{32}$/.test(value);
function parseLegacyCode(input) {
  const match = /^M2\.([A-Za-z0-9_-]{4,250})\.([A-Za-z0-9_-]{8,250})$/.exec(input);
  if (!match) return null;
  try {
    if (match[1] !== Buffer.from(match[1],'base64url').toString('base64url') ||
        match[2] !== Buffer.from(match[2],'base64url').toString('base64url')) return null;
    const login = normalizeLogin(Buffer.from(match[1],'base64url').toString('utf8'));
    const pin = Buffer.from(match[2],'base64url').toString('utf8');
    return pin.length >= 8 && pin.length <= 160 ? {login,pin} : null;
  } catch { return null; }
}

export default async function handler(req,res) {
  noCache(res);
  if(req.method!=='POST') return res.status(405).json({error:'Phương thức không hợp lệ'});
  if(!safeOrigin(req)) return res.status(403).json({error:'Yêu cầu không hợp lệ'});
  try {
    const raw=bodyOf(req).account;
    const input=typeof raw==='string'&&raw.length<=512?raw.trim():'';
    const privateID=input.toLowerCase();
    const credential=isPrivateID(privateID)?{login:privateID,pin:null}:parseLegacyCode(input);
    const ipKey=rateKey('code-ip',clientIP(req));
    if(await checkLimit(ipKey,60)) return res.status(429).json({error:'Có quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'});
    if(!credential) {
      await failLimit(ipKey);
      return res.status(401).json({error:'Mã tài khoản không hợp lệ'});
    }
    const accountKey=rateKey('code-account',credential.login);
    if(await checkLimit(accountKey,12)) return res.status(429).json({error:'Có quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.'});
    await Promise.all([failLimit(accountKey),failLimit(ipKey)]);
    const rows=await sql`SELECT secret_encrypted,access_salt,access_hash,active FROM vault_accounts WHERE login=${credential.login} LIMIT 1`;
    const row=rows[0];
    const isPrivateCredential=credential.pin===null && row?.access_salt==='token-v2' && row?.access_hash==='token-v2';
    const isLegacyCredential=credential.pin!==null && row && verifyPass(credential.pin,row.access_salt,row.access_hash);
    if(!row || !row.active || !(isPrivateCredential||isLegacyCredential)) {
      return res.status(401).json({error:'Mã tài khoản không đúng hoặc đã bị tắt'});
    }
    return res.status(200).json(totp(decryptSecret(row.secret_encrypted)));
  } catch {
    return res.status(500).json({error:'Hệ thống gặp sự cố. Vui lòng thử lại.'});
  }
}
