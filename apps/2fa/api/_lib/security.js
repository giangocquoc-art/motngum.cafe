import { createCipheriv, createDecipheriv, createHmac, createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function normalizeLogin(value) {
  if (typeof value !== 'string') throw new Error('Tài khoản không hợp lệ');
  const login = value.trim().toLowerCase();
  if (login.length < 3 || login.length > 180 || /[\s<>]/.test(login)) throw new Error('Tài khoản không hợp lệ');
  return login;
}
export function normalizeSecret(value) {
  if (typeof value !== 'string') throw new Error('Khóa 2FA không hợp lệ');
  let raw = value.trim();
  if (raw.startsWith('otpauth://')) {
    const u = new URL(raw);
    if (u.protocol !== 'otpauth:' || u.hostname !== 'totp' || (u.searchParams.get('algorithm') || 'SHA1').toUpperCase() !== 'SHA1' || (u.searchParams.get('digits') || '6') !== '6' || (u.searchParams.get('period') || '30') !== '30') {
      throw new Error('Chỉ hỗ trợ TOTP SHA1, 6 chữ số, 30 giây');
    }
    raw = u.searchParams.get('secret') || '';
  }
  raw = raw.replace(/[\s\-=]/g, '').toUpperCase();
  if (!/^[A-Z2-7]{16,256}$/.test(raw)) throw new Error('Khóa 2FA phải ở dạng Base32 hợp lệ (tối thiểu 16 ký tự)');
  decodeBase32(raw);
  return raw;
}
export function decodeBase32(raw) {
  let bits = 0, count = 0;
  const bytes = [];
  for (const ch of raw) {
    const i = BASE32.indexOf(ch);
    if (i < 0) throw new Error('Base32 không hợp lệ');
    bits = (bits << 5) | i;
    count += 5;
    if (count >= 8) {
      bytes.push((bits >>> (count - 8)) & 255);
      count -= 8;
      bits &= (1 << count) - 1;
    }
  }
  if (bytes.length < 10) throw new Error('Khóa 2FA quá ngắn');
  return Buffer.from(bytes);
}
export function totp(secret, now = Date.now()) {
  const counter = Math.floor(now / 30000);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const hash = createHmac('sha1', decodeBase32(secret)).update(message).digest();
  const offset = hash[hash.length - 1] & 15;
  const num = (hash.readUInt32BE(offset) & 0x7fffffff) % 1_000_000;
  return { code: String(num).padStart(6, '0'), validFor: 30 - (Math.floor(now / 1000) % 30) };
}
export function encryptSecret(plain) {
  const key = Buffer.from(process.env.TOTP_ENC_KEY || '', 'hex');
  if (key.length !== 32) throw new Error('Server configuration error');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const content = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), content].map(x => x.toString('base64url')).join('.');
}
export function decryptSecret(encrypted) {
  const key = Buffer.from(process.env.TOTP_ENC_KEY || '', 'hex');
  if (key.length !== 32) throw new Error('Server configuration error');
  const [a,b,c] = String(encrypted).split('.');
  const d = createDecipheriv('aes-256-gcm', key, Buffer.from(a, 'base64url'));
  d.setAuthTag(Buffer.from(b, 'base64url'));
  return Buffer.concat([d.update(Buffer.from(c, 'base64url')), d.final()]).toString('utf8');
}
export function hashPass(pass) {
  if (typeof pass !== 'string' || pass.length < 8 || pass.length > 160) throw new Error('Mã truy cập phải có ít nhất 8 ký tự');
  const salt = randomBytes(16).toString('hex');
  return { salt, hash: scryptSync(pass, salt, 32).toString('hex') };
}
export function verifyPass(pass, salt, hash) {
  if (typeof pass !== 'string' || pass.length > 160 || pass.length < 1 || !/^[a-f0-9]{32}$/.test(salt || '') || !/^[a-f0-9]{64}$/.test(hash || '')) return false;
  const a = scryptSync(pass, salt, 32);
  const b = Buffer.from(hash, 'hex');
  return timingSafeEqual(a, b);
}
export function adminPasswordValid(password) {
  const [salt, hash] = (process.env.ADMIN_PASS_HASH || '').split(':');
  return verifyPass(password, salt, hash);
}
function mac(message) {
  const key = process.env.ADMIN_SESSION_KEY || '';
  if (key.length < 40) throw new Error('Server configuration error');
  return createHmac('sha256', key).update(message).digest('base64url');
}
export function makeSession() {
  const data = Buffer.from(JSON.stringify({ role: 'admin', exp: Date.now() + 10 * 3600000 })).toString('base64url');
  return data + '.' + mac(data);
}
export function hasAdminSession(req) {
  try {
    const cookies = String(req.headers.cookie || '').split(';').map(s => s.trim());
    const value = cookies.find(s => s.startsWith('vault_admin='))?.slice('vault_admin='.length);
    if (!value) return false;
    const [data, tag] = value.split('.');
    if (!data || !tag) return false;
    const got = Buffer.from(tag), expected = Buffer.from(mac(data));
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return false;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.role === 'admin' && Number.isFinite(payload.exp) && payload.exp > Date.now();
  } catch { return false; }
}
export function cookie(session, maxAge = 36000) {
  return `vault_admin=${session}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;
}
export function safeOrigin(req) {
  const origin = req.headers.origin;
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
  try { return !!origin && new URL(origin).protocol === 'https:' && new URL(origin).host.toLowerCase() === host; }
  catch { return false; }
}
export const bodyOf = req => typeof req.body === 'object' && req.body !== null ? req.body : typeof req.body === 'string' ? JSON.parse(req.body) : {};
export function noCache(res) { res.setHeader('Cache-Control', 'no-store, max-age=0'); res.setHeader('Pragma','no-cache'); }
export function rateKey(type, token) { return createHash('sha256').update(type + ':' + token).digest('hex'); }
export function clientIP(req) { return String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim().slice(0,100); }
