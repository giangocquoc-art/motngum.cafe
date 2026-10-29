# MOTNGUM COMMERCE — Gate B staging implementation, 2026-10-29

**Scope:** Only `commerce-rebuild-2026-10`, the isolated Neon database, Cloudflare Worker `motngum-commerce-stage`, and Vercel `motngum-commerce-saas-staging`. **Do not alter main, apex `motngum.cafe`, MX, HSK, portfolios or unrelated projects.** No payments or public signup are authorized.

## What is implemented in source
1. **SaaS durable merchant record:** `merchant_provisions` in Control Plane PostgreSQL. Enforces one store per team and globally unique slug, UUID canonical ID, retry counter, `requested/edge_pending/waiting_backend/active/failed` states, timestamps and last sync status. Drizzle migration `0002_merchant_provisioning.sql` and snapshot/journal registered.
2. **Owner-only API:** `GET/POST /api/merchants` uses signed session and fresh Postgres membership. Requires team owner, same-origin request, strict slug/display validation, row lock on `teams`, rechecked permission inside lock, and idempotent return of existing merchant. Same team/different requested shop -> 409; slug collision -> 409; no duplicate writes. `ENABLE_MERCHANT_PREVIEW_PROVISIONING=false` disables POST before any write.
3. **Durable sync:** After PG commit, the same merchant UUID is sent to the Cloudflare Worker. If D1 fails, state becomes `edge_pending`; repeat identical POST performs a safe retry. If D1 accepts, PG state is `waiting_backend`, never `active` (Medusa runtime is not connected).
4. **Cloudflare D1 writer:** `POST /internal/merchants` requires a high-entropy `PROVISIONING_TOKEN` Worker secret. It rejects missing/mismatched token and malformed IDs/slugs. `INSERT OR IGNORE` with identity check is idempotent. It records only an inactive `provisioning` row; does NOT create domains, URLs, fake products, active paid status or orders. Existing GET health/status/ready unchanged.
5. **Owner dashboard:** `/dashboard/commerce` displays true persisted merchant status, D1 synchronization and unconnected Medusa status. The form is hidden until the same authenticated preview feature gate has been deliberately enabled. No fabricated shopping cart/checkout.

## Verified infrastructure
- Cloudflare `motngum-commerce-stage`: updated module Worker successfully via API with original D1 binding and current source. A missing `PROVISIONING_TOKEN` yields HTTP 503 (fail closed); no provision calls are allowed without configured service credential.
- D1 `motngum-commerce-staging`: zero merchants, zero domains, zero service connections after deployment.
- Neon `motngum_commerce_preview`: migration `0002` applied with a verified PostgreSQL SHA-256 journal hash; now three migration entries. Zero users, zero teams, zero merchants after application.
- CI: Postgres migrations, Next build and signed-cookie tests, D1 Worker auth/replay/no activation tests (Node with controlled D1 adapter) have passed. Latest run includes a deployed Cloudflare unauthenticated write smoke and merchant ownership/status HTTP tests.
- Vercel staging: last confirmed READY preview is older than Gate B code (`bd4868b...`). A new explicit deployment attempt for Gate B HEAD returned 402 `api-deployments-free-per-day`; must **not** be represented as READY. No paid upgrades made.
- **Important:** An attempt to set a shared secret automatically in both providers was blocked by tooling, so **no shared provisioning secret has been configured**. `EDGE_PROVISIONING_TOKEN` is not assumed to exist and creation remains disabled.

## Manual secret provisioning for future protected QA (do not paste secrets in chat)
1. Generate a unique cryptographic random value of at least 48 bytes on a trusted device. Do not reuse `AUTH_SECRET`, API keys, Stripe secrets or passwords.
2. In Cloudflare Dashboard -> Workers & Pages -> `motngum-commerce-stage` -> Settings/Variables & Secrets, add **encrypted secret** `PROVISIONING_TOKEN`. Never use plaintext vars.
3. In Vercel -> isolated project `motngum-commerce-saas-staging` -> Settings -> Environment Variables, add **encrypted** `EDGE_PROVISIONING_TOKEN` with **exactly the same value**, scoped to Preview only. Do not enable for production.
4. After a reviewed latest-commit Vercel Preview deployment successfully runs with encrypted secrets, use a test owner on a protected preview, then set `ENABLE_MERCHANT_PREVIEW_PROVISIONING=true` **only for that preview**. Keep it false until test sessions, CSRF protections and database isolation are verified. Rotating one side without the other blocks writes safely.
5. Keep `ENABLE_PREVIEW_SIGNUP=false` and `ENABLE_PLATFORM_BILLING=false`. Public signup needs verified email/rate limits first.

## Required tests before accepting Gate B
- Reject anonymous POST and cross-origin POST. Reject staff POST (403), allow only owner.
- Owner creates a shop once (PG row + D1 `provisioning` row), replay same details (same UUID, no duplicate), retry after simulated Edge timeout, reject conflicting slug or display name (409).
- Two unrelated teams: no cross-team read, no shared merchant ID, and no cross-org role escalation; independent D1 host resolution. In initial release multi-team users are rejected until active-team selection exists.
- Readiness stays false without verified domain, isolated Medusa backend and signed payment. The `/api/ready` endpoint must still produce 503.
- Verify no DNS / origin / HSK or unrelated app changes.
- Only after actual Medusa API+worker+Postgres/Redis hosting: connect an isolated merchant backend, then do product/cart/order/stock/payment-sandbox tests.

**Current classification:** source implementation and CI-tested safety gates; Worker code deployed in *fail-closed* staging; merchant creation **not publicly enabled and not merchant-to-Medusa end-to-end complete**.
