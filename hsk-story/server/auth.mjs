import { betterAuth } from 'better-auth';
import pg from 'pg';
export const SITE_ORIGIN = 'https://hsk.motngum.cafe';
export function configured() {
  return process.env.CHIMSE_AUTH_ENABLED === 'true' && !!(process.env.CHIMSE_AUTH_SECRET && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.CHIMSE_DATABASE_URL);
}
let instance;
export function auth() {
  if (!configured()) throw Object.assign(new Error('Not configured'), { status: 503 });
  if (!instance) instance = betterAuth({
    appName: 'Chim Sẻ', baseURL: SITE_ORIGIN, basePath: '/api/auth',
    secret: process.env.CHIMSE_AUTH_SECRET,
    database: new pg.Pool({ connectionString: process.env.CHIMSE_DATABASE_URL, max: 3, connectionTimeoutMillis: 10000, idleTimeoutMillis: 10000, query_timeout: 10000 }),
    trustedOrigins: [SITE_ORIGIN],
    socialProviders: { google: { clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET } },
    user: { modelName: 'chimse_user' },
    session: { modelName: 'chimse_session', expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    account: { modelName: 'chimse_account', encryptOAuthTokens: true },
    verification: { modelName: 'chimse_verification' },
    onAPIError: { errorURL: SITE_ORIGIN + '/?account=1' },
    advanced: { cookiePrefix: 'chimse', useSecureCookies: true, defaultCookieAttributes: { httpOnly: true, secure: true, sameSite: 'lax' } },
    logger: { disabled: true },
  });
  return instance;
}
export async function proxy(request) { return auth().handler(request); }
export function forwardCookies(response, res) {
  const cookies = response.headers.getSetCookie();
  if (cookies.length) res.setHeader('Set-Cookie', cookies);
}
export async function userFor(req, res, origin) {
  if (!configured()) throw Object.assign(new Error('Not configured'), { status: 503 });
  if (!req.headers.cookie) throw Object.assign(new Error('No session'), { status: 401 });
  const response = await proxy(new Request(SITE_ORIGIN + '/api/auth/get-session', {
    headers: { Cookie: req.headers.cookie },
  }));
  if (response.status >= 500) throw Object.assign(new Error('Auth unavailable'), { status: 503 });
  forwardCookies(response, res);
  const data = await response.json();
  if (!response.ok || !data?.session || typeof data?.user?.id !== 'string' || !data.user.id.length || data.user.id.length > 128 || data.user.banned) throw Object.assign(new Error('No session'), { status: 401 });
  return data.user;
}
