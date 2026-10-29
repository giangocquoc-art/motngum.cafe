// Runs ONLY against disposable GitHub Actions PostgreSQL and locally spawned Next.js.
// Exercises real signed cookies and HTTP API, not mocked JWT/DB behavior.
import assert from 'node:assert/strict';
import { SignJWT } from 'jose';
import postgres from 'postgres';

const base = 'http://127.0.0.1:3000';
const dbUrl = process.env.POSTGRES_URL;
const secret = process.env.AUTH_SECRET;
assert.ok(dbUrl && secret && secret.length >= 32);
if (process.env.CI !== 'true') throw new Error('This fixture is intended for a disposable CI database only');
const sql = postgres(dbUrl, { max: 1 });
async function token(userId, version) {
  return new SignJWT({
    user: { id: userId },
    version,
    expires: new Date(Date.now() + 3600000).toISOString(),
  }).setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt().setExpirationTime('1 hour')
    .sign(new TextEncoder().encode(secret));
}
async function check(path, jwt, expected) {
  const res = await fetch(base + path, {
    redirect: 'manual',
    headers: jwt ? { cookie: 'session=' + jwt } : {},
    cache: 'no-store',
  });
  assert.equal(res.status, expected, path + ': ' + res.status);
  return res;
}
try {
  const email = 'ci-auth-revocation@sample.invalid';
  const [user] = await sql`
    INSERT INTO users (email,password_hash,role) VALUES (${email},'ci-hash-not-used','owner')
    RETURNING id,session_version
  `;
  assert.equal(user.session_version, 0);
  const jwtV0 = await token(user.id, 0);
  let res = await check('/api/user', jwtV0, 200);
  const userJson = await res.json();
  assert.equal(userJson.id, user.id);
  assert.equal(userJson.email, email);
  assert.equal(Object.hasOwn(userJson, 'passwordHash'), false);
  assert.equal(Object.hasOwn(userJson, 'password_hash'), false);
  await check('/api/team', jwtV0, 409); // authenticated, no selected/owned team

  const [team] = await sql`INSERT INTO teams (name) VALUES ('CI isolation team') RETURNING id`;
  await sql`INSERT INTO team_members (user_id, team_id, role) VALUES (${user.id},${team.id},'owner')`;
  res = await check('/api/team', jwtV0, 200);
  const teamJson = await res.json();
  assert.equal(teamJson.id, team.id);
  assert.equal(teamJson.teamMembers[0].user.id, user.id);

  let uniqueEnforced = false;
  try {
    await sql`INSERT INTO team_members (user_id, team_id, role) VALUES (${user.id},${team.id},'owner')`;
  } catch (error) {
    uniqueEnforced = error.code === '23505';
  }
  assert.equal(uniqueEnforced, true, 'team membership must be unique at DB level');

  await sql`UPDATE users SET session_version = session_version + 1 WHERE id = ${user.id}`;
  await check('/api/user', jwtV0, 401); // revoked, even if signed token is not expired
  res = await fetch(base + '/dashboard', {
    redirect: 'manual', headers: { cookie: 'session=' + jwtV0 }, cache: 'no-store'
  });
  if (res.status === 200) {
    const html = await res.text();
    // Next.js streaming may render an HTTP 200 containing a real redirect marker.
    const marker = /__next-page-redirect[^>]*http-equiv=["']refresh["'][^>]*\/sign-in|NEXT_REDIRECT[^]*\/sign-in/i;
    assert.match(html, marker,
      'revoked dashboard session must redirect, not render private UI: ' + html.slice(-700));
  } else {
    assert.ok([303, 307, 308].includes(res.status), 'unexpected dashboard status: ' + res.status);
    assert.match(res.headers.get('location') || '', /\/sign-in/);
  }
  const jwtV1 = await token(user.id, 1);
  await check('/api/user', jwtV1, 200);
  await sql`UPDATE users SET deleted_at=now() WHERE id=${user.id}`;
  await check('/api/user', jwtV1, 401);
  console.log('PASS: signed-cookie identity, hashed-password omission, revoked/deleted JWT, team scope and unique membership.');
} finally {
  await sql.end();
}
