#!/usr/bin/env node
/**
 * Read-only release gate for motngum.cafe. NEVER modifies Vercel, DNS, Cloudflare
 * or billing. No fake successful results: absent or unknown evidence fails closed.
 */
import assert from 'node:assert/strict';

const REQUIRED = Object.freeze([
  'vercel_latest_commit_ready',
  'vercel_production_plan_compliant',
  'postgres_restore_test_passed',
  'merchant_provisioning_end_to_end',
  'email_verification_and_abuse_controls',
  'two_real_medusa_tenants_isolated',
  'medusa_server_and_workers_persistent',
  'inventory_order_fulfillment_refund_e2e',
  'payment_signature_and_duplicate_webhook_tests',
  'team_owner_member_cross_tenant_e2e',
  'apex_dns_and_legacy_app_rollback_verified'
]);

export function evaluate(evidence, edge) {
  const blockers = [];
  if (!evidence || typeof evidence !== 'object' || Array.isArray(evidence)) {
    blockers.push('release_evidence_missing');
  }
  for (const name of REQUIRED) {
    const entry = evidence?.[name];
    if (!entry || entry.passed !== true ||
        !Array.isArray(entry.proofUrls) || entry.proofUrls.length === 0 ||
        entry.proofUrls.some(u => typeof u !== 'string' || !u.startsWith('https://'))) {
      blockers.push(name);
    }
  }
  if (!edge || edge.productionReady !== true || edge.connectedCommerceEngines < 1 ||
      edge.verifiedActiveDomains < 1) blockers.push('edge_live_readiness_unconfirmed');
  if (evidence?.cutoverApproved !== true) blockers.push('explicit_cutover_approval_missing');
  return { canCutOver: blockers.length === 0, blockers };
}

async function fetchWithTimeout(url) {
  const res = await fetch(url, { headers: { Accept: 'application/json' },
    cache: 'no-store', signal: AbortSignal.timeout(6500) });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function main() {
  if (process.argv.includes('--self-test')) {
    const missing = evaluate({}, null);
    assert.equal(missing.canCutOver, false);
    assert.ok(missing.blockers.length >= REQUIRED.length);
    const complete = Object.fromEntries(REQUIRED.map(key => [key,
      { passed: true, proofUrls: ['https://example.invalid/proof'] }]));
    complete.cutoverApproved = true;
    const yes = evaluate(complete,
      { productionReady: true, connectedCommerceEngines: 2, verifiedActiveDomains: 2 });
    assert.equal(yes.canCutOver, true);
    const no = evaluate(complete,
      { productionReady: false, connectedCommerceEngines: 2, verifiedActiveDomains: 2 });
    assert.equal(no.canCutOver, false);
    console.log('PASS: absent evidence and unready edge prevent cutover.');
    return;
  }
  let evidence = null, edge = null;
  const evidencePath = process.env.RELEASE_EVIDENCE_PATH;
  if (evidencePath) {
    const { readFile } = await import('node:fs/promises');
    try { evidence = JSON.parse(await readFile(evidencePath, 'utf8')); }
    catch { console.error('Release evidence could not be read; fail closed.'); }
  }
  try {
    // The staging edge intentionally reports productionReady:false.
    // A future cutover must supply an explicit reviewed production edge URL.
    const url = process.env.RELEASE_EDGE_STATUS_URL;
    if (url && new URL(url).protocol === 'https:') edge = await fetchWithTimeout(url);
  } catch {
    console.error('Release Edge readiness could not be independently confirmed.');
  }
  const result = evaluate(evidence, edge);
  // Do not print environment variables or attached credentials.
  console.log(JSON.stringify({ status: result.canCutOver ? 'PASS' : 'BLOCKED',
    blockers: result.blockers, note: 'read-only gate; no DNS or Vercel mutations' }, null, 2));
  if (!result.canCutOver) process.exitCode = 1;
}
await main();
