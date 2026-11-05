import { neon } from '@neondatabase/serverless';
export const sql = neon(process.env.DATABASE_URL);
export async function checkLimit(key, max = 5) {
  const rows = await sql`SELECT attempts, window_started FROM access_limits WHERE rate_key=${key}`;
  return rows.length && rows[0].attempts >= max && Date.now() - new Date(rows[0].window_started).getTime() < 15*60*1000;
}
export async function failLimit(key) {
  await sql`INSERT INTO access_limits (rate_key,attempts,window_started) VALUES (${key},1,now()) ON CONFLICT (rate_key) DO UPDATE SET attempts = CASE WHEN access_limits.window_started < now() - interval '15 minutes' THEN 1 ELSE access_limits.attempts + 1 END, window_started = CASE WHEN access_limits.window_started < now() - interval '15 minutes' THEN now() ELSE access_limits.window_started END`;
}
export async function resetLimit(key) { await sql`DELETE FROM access_limits WHERE rate_key=${key}`; }
