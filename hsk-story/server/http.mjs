export function originFor(req) {
  const host = String(req.headers.host || '');
  const protocol = /^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? 'http' : 'https';
  const origin = protocol + '://' + host;
  const allowed = new Set(['https://hsk.motngum.cafe', 'http://localhost:4178', 'http://127.0.0.1:4178']);
  if (process.env.VERCEL_URL) allowed.add('https://' + process.env.VERCEL_URL);
  if (!allowed.has(origin)) throw Object.assign(new Error('Origin not allowed'), { status: 403 });
  if (req.headers.origin && req.headers.origin !== origin) throw Object.assign(new Error('Origin not allowed'), { status: 403 });
  return origin;
}
export function json(res, status, data) {
  res.setHeader('Cache-Control', 'private, no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Vary', 'Cookie, Origin');
  res.statusCode = status;
  res.end(JSON.stringify(data));
}
export function bodyJSON(req, max = 131072) {
  const size = Number(req.headers['content-length'] || 0);
  if (size > max) throw Object.assign(new Error('Body too large'), { status: 413 });
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) throw Object.assign(new Error('JSON required'), { status: 415 });
  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { throw Object.assign(new Error('Invalid JSON'), { status: 400 }); }
  if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > max) throw Object.assign(new Error('Invalid body'), { status: 400 });
  return body;
}
export function publicError(res, error) {
  const status = error.status || 503;
  json(res, status, { error: status === 401 ? 'Bạn đăng nhập lại để lưu mốc nhé.' : status === 409 ? 'Mốc học vừa thay đổi trên thiết bị khác.' : status < 500 ? 'Yêu cầu chưa hợp lệ. Bạn thử lại nhé.' : 'Chưa nối được với sổ đã lưu. Mốc trên máy vẫn còn nguyên.' });
}
