# Motngum Commerce — Apex cutover decision (2026-10-29)

**Decision: HOLD THE APEX CUTOVER.** The user authorized final deployment, but switching `motngum.cafe` today would replace a running web project with an unprovisioned commerce service. This is a reversible production change only after the release gates turn green; no workaround via mock payment or fake Medusa backend.

## What was actually deployed before this report
- Cloudflare Worker `motngum-commerce-stage` deployed on `commerce-preview.motngum.cafe`. It has a D1 tenant registry and inactive, fail-closed provisioning API (no configured `PROVISIONING_TOKEN`). D1 has **zero** merchants, domains and linked Medusa backends.
- GitHub isolated branch `commerce-rebuild-2026-10`: Medusa DTC source, SaaS control plane, Docker/PG/Redis integration CI, authorized merchant ledger, signed JWT session revocation, owner-scoped merchant provisioning, secure team selection and staging UI.
- Neon preview database `motngum_commerce_preview`: applied migrations 0000, 0001 and 0002; **zero** users/teams/merchants. This DB is not the Medusa transactional database.
- Vercel project `motngum-commerce-saas-staging` is separate from the existing website. The only confirmed READY Commerce branch preview deployment is **old commit** `bd4868b86dfe915d8563d850fc53e83a3c6d6975` at `motngum-commerce-saas-staging-mei6afbuh.vercel.app`; most recent source code has NOT been deployed because Vercel returned 402 `api-deployments-free-per-day`.
- The test-only CI passes built Next and Postgres migrations, private auth endpoints, Cloudflare D1 provisioning security, JWT revocation and (after the latest test run passes) signed team selection with two merchants. This is **not** proof of two real Medusa order backends.

## Current domain owner (must preserve during staging)
- Cloudflare apex DNS: `motngum.cafe` A `76.76.21.21`, not proxied, serving the existing Vercel website.
- Vercel apex domain `motngum.cafe` is assigned to **old project** `motngum-cafe`, ID `prj_X5AzZOGnSUoQAvFMkwj09nzFkjKx`.
- `www.motngum.cafe` assigned to same old project and redirects to apex (308).
- `hsk.motngum.cafe` project `prj_tewfOEAAuRCu31AVp2fagZZdDdXX`.
- Other subdomains host existing user projects; Cloudflare MX/TXT/SPF records are unrelated to Commerce and MUST remain untouched.

## Readiness gate (no implicit waiver)
Apex routing must not change unless **all** independently evidenced:
1. Latest Git commit deployed as a Vercel `READY` build and HTTP smoke tested on **Preview**, with env isolation, rollback and reviewed deployment SHA.
2. Backend Medusa running 24/7 in server and worker modes, its OWN Postgres and Redis, with appropriate secrets and verified health; store A and store B are isolated.
3. Merchant Control Plane creates two real stores and their verified hostname mappings through an authenticated service, with idempotent provision/replay, suspension/retry and no cross-tenant cache/cookie leakage.
4. Login has verification/anti-abuse and secure invitations; owner/staff action and team selection tests pass.
5. Order end-to-end: product, price, stock, cart, sandbox payment confirmation by signed webhook, fulfillment, cancellation, refund, accounting. No QR is marked paid just by being displayed.
6. Backup/restore, observability, incident plan and domain DNS rollback rehearsal. The current web site's structure, its content and unrelated subdomains remain available.
7. Pricing/legal: Vercel Hobby is non-commercial only, so a real paid commerce SaaS must use an authorized commercial hosting plan/provider; no plan purchase is automatic.

`commerce-platform/scripts/apex-release-gate.mjs` is a read-only, fail-closed safety check. `.github/workflows/commerce-production-preflight.yml` can be manually started; it **must fail while the above evidence is missing**. Even a successful preflight does not automatically edit domains or trigger a deployment.

## Safe sequence once prerequisites are genuinely met
1. Preserve/export current Vercel domain assignments, Cloudflare DNS zone and old deployment URL.
2. Test the reviewed Commerce HEAD behind its own dedicated Preview URL + protected test account, THEN a Commerce custom subdomain such as `commerce.motngum.cafe` if domain verification succeeds.
3. Verify all readiness conditions and management approval; have exact rollback procedure to old Vercel project ID and A/CNAME records, plus health checks for mail/HSK/portfolio.
4. Move apex Vercel domain association to the new qualified Commerce project during a controlled release window. Verify `motngum.cafe`, `www`, TLS, auth, checkout and other unrelated subdomains. Roll back immediately on any critical failure.
5. Never delete or mutate the old site/repository during the initial cutover; archive only after validated stable operation.

## Current blockers external to code
- Vercel Hobby quota: HTTP 402 `api-deployments-free-per-day` (100 deployments/day) at last explicit request.
- Shared Cloudflare Worker provisioning secret remains unconfigured; do not bypass by weakening authentication.
- No continuous Medusa backend/worker and Redis. Cloudflare Workers Free cannot simply run the Medusa Docker image as an always-on container.
- No merchant payment provider credentials, signed callback/settlement, shipping partners, email verification sender or end-to-end live checkout.
- No real customer, merchant or order data (zero test merchant rows on connected staging DBs).

**User-facing truth:** Merchant infrastructure/flows are being implemented and CI-validated, but the main website has NOT been replaced and Motngum Commerce is NOT a fully operational Haravan equivalent.
