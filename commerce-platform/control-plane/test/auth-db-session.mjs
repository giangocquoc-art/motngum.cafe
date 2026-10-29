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
async function check(path, jwt, expected, method = 'GET') {
  const res = await fetch(base + path, {
    method, redirect: 'manual',
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

  // Merchant creation is owner-scoped and fail-closed until the shared D1 service
  // secret and explicit staging feature gate have been provisioned.
  res = await check('/api/merchants', jwtV0, 200);
  assert.equal((await res.json()).merchant, null);
  await check('/api/merchants', null, 401);
  await check('/api/merchants', jwtV0, 503, 'POST');

  const merchantId = '31c6c50c-a33c-44ec-a550-c765e8d9be03';
  await sql`INSERT INTO merchant_provisions (id,team_id,slug,display_name)
    VALUES (${merchantId}, ${team.id}, 'ci-first-shop', 'CI First Shop')`;
  res = await check('/api/merchants', jwtV0, 200);
  const merchantData = await res.json();
  assert.equal(merchantData.merchant.id, merchantId);
  assert.equal(merchantData.merchant.state, 'requested');
  assert.equal(merchantData.merchant.backendConnected, false);
  let merchantUniqueEnforced = false;
  try {
    await sql`INSERT INTO merchant_provisions (id,team_id,slug,display_name)
      VALUES ('81e0476d-1049-4021-8a69-d84df201d29f', ${team.id}, 'another-shop', 'Another Shop')`;
  } catch (error) { merchantUniqueEnforced = error.code === '23505'; }
  assert.equal(merchantUniqueEnforced, true, 'One merchant per team during initial staging');

  // A second owner, team and merchant must be isolated from the first.
  const [secondOwner] = await sql`INSERT INTO users (email,password_hash,role)
    VALUES ('ci-owner-two@sample.invalid','ci-hash-not-used','owner') RETURNING id`;
  const [secondTeam] = await sql`INSERT INTO teams (name)
    VALUES ('CI second independent team') RETURNING id`;
  await sql`INSERT INTO team_members (user_id, team_id, role)
    VALUES (${secondOwner.id},${secondTeam.id},'owner')`;
  const secondMerchantId = 'ac7f976a-6a2e-4882-b680-b56a9bacce5c';
  await sql`INSERT INTO merchant_provisions (id,team_id,slug,display_name)
    VALUES (${secondMerchantId},${secondTeam.id},'ci-second-shop','CI Second Shop')`;
  const ownerTwoJwt = await token(secondOwner.id, 0);
  res = await check('/api/merchants', ownerTwoJwt, 200);
  const secondMerchant = (await res.json()).merchant;
  assert.equal(secondMerchant.id, secondMerchantId);
  assert.notEqual(secondMerchant.id, merchantId);
  assert.equal(secondMerchant.slug, 'ci-second-shop');
  res = await check('/api/merchants', jwtV0, 200);
  assert.equal((await res.json()).merchant.id, merchantId);
  // A team member can inspect their own merchant, but cannot bypass the disabled write gate.
  const [staff] = await sql`INSERT INTO users (email,password_hash,role)
    VALUES ('ci-staff@sample.invalid','ci-hash-not-used','member') RETURNING id`;
  await sql`INSERT INTO team_members (user_id, team_id, role)
    VALUES (${staff.id},${team.id},'member')`;
  const staffJwt = await token(staff.id, 0);
  res = await check('/api/merchants', staffJwt, 200);
  assert.equal((await res.json()).merchant.id, merchantId);
  await check('/api/merchants', staffJwt, 503, 'POST');
  // Until explicit tenant selection ships, fail closed on multi-team staff.
  await sql`INSERT INTO team_members (user_id, team_id, role)
    VALUES (${staff.id},${secondTeam.id},'member')`;
  await check('/api/team', staffJwt, 409);
  await check('/api/merchants', staffJwt, 409);
  // Explicit team selection must be signed into the cookie ONLY after server-side membership check.
  const forbidden = await fetch(base + '/api/teams', {
    method: 'POST', headers: { cookie: 'session=' + staffJwt,
      origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ teamId: 999999 })
  });
  assert.equal(forbidden.status, 403);
  const crossOrigin = await fetch(base + '/api/teams', {
    method: 'POST', headers: { cookie: 'session=' + staffJwt,
      origin: 'https://attacker.invalid', 'content-type': 'application/json' },
    body: JSON.stringify({ teamId: secondTeam.id })
  });
  assert.equal(crossOrigin.status, 403);
  const teamSelection = await fetch(base + '/api/teams', {
    method: 'POST', headers: { cookie: 'session=' + staffJwt,
      origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ teamId: secondTeam.id })
  });
  assert.equal(teamSelection.status, 200);
  assert.equal((await teamSelection.json()).activeTeamId, secondTeam.id);
  const selectedCookie = teamSelection.headers.get('set-cookie')?.match(/session=([^;]+)/)?.[1];
  assert.ok(selectedCookie, 'signed tenant-specific session must be returned');
  const response = await fetch(base + '/api/merchants', {
    headers: { cookie: 'session=' + selectedCookie }, cache: 'no-store'
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).merchant.id, secondMerchantId);
  const firstTeamSelection = await fetch(base + '/api/teams', {
    method: 'POST', headers: { cookie: 'session=' + selectedCookie,
      origin: base, 'content-type': 'application/json' },
    body: JSON.stringify({ teamId: team.id })
  });
  assert.equal(firstTeamSelection.status, 200);
  const firstTeamCookie = firstTeamSelection.headers.get('set-cookie')?.match(/session=([^;]+)/)?.[1];
  assert.ok(firstTeamCookie);
  const firstTeamResponse = await fetch(base + '/api/merchants', {
    headers: { cookie: 'session=' + firstTeamCookie }, cache: 'no-store'
  });
  assert.equal(firstTeamResponse.status, 200);
  assert.equal((await firstTeamResponse.json()).merchant.id, merchantId);
  console.log('PASS: team switch requires membership+same-origin, signed session isolates both merchants.');
  console.log('PASS: two teams/two merchants isolated, staff limited to own team, multi-team ambiguity denied.');

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
