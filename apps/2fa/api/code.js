import { sql, checkLimit, failLimit } from './_lib/db.js';
import { normalizeLogin, decryptSecret, totp, noCache, bodyOf, rateKey, clientIP, safeOrigin } from './_lib/security.js';

export default async function handler(req, res) {
  noCache(res);
  if (req.method !== 'POST') return res.status(405).json({ error: 'Phương thức không hợp lệ' });
  if (!safeOrigin(req)) return res.status(403).json({ error: 'Yêu cầu không hợp lệ' });
  try {
    const login = normalizeLogin(bodyOf(req).account);
    const byAccount = rateKey('code-account', login);
    const byIP = rateKey('code-ip', clientIP(req));
    if (await checkLimit(byAccount, 12) || await checkLimit(byIP, 60)) {
      return res.status(429).json({ error: 'Có quá nhiều yêu cầu. Vui lòng thử lại sau 15 phút.' });
    }
    // Count all lookups, not only failures. Each identifier is its own access credential.
    await Promise.all([failLimit(byAccount), failLimit(byIP)]);
    const rows = await sql`SELECT secret_encrypted FROM vault_accounts WHERE login=${login} AND active=true LIMIT 1`;
    if (!rows.length) return res.status(404).json({ error: 'Không tìm thấy tài khoản hoặc tài khoản đã bị tắt.' });
    return res.status(200).json(totp(decryptSecret(rows[0].secret_encrypted)));
  } catch (e) {
    if (e.message === 'Tài khoản không hợp lệ' || e instanceof SyntaxError) {
      return res.status(400).json({ error: 'Tài khoản không hợp lệ.' });
    }
    return res.status(500).json({ error: 'Hệ thống gặp sự cố. Vui lòng thử lại.' });
  }
}
