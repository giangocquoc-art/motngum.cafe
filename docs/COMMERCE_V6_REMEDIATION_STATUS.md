# Motngum Commerce — V6 remediation execution (29 Oct 2026)

**Scope:** Isolated branch `commerce-rebuild-2026-10`; SaaS staging project, PostgreSQL staging and CI only. No change to `main`, apex DNS, unrelated subdomains, old Vercel apps, customer data, or paid plans.

## Final confirmed gate status

| V6 finding | Current result | Evidence / caveat |
|---|---|---|
| C01 CI ignored ordinary app edits | **FIXED + PASS** | `.github/workflows/commerce-saas-ci.yml` now triggers on control-plane files/PRs, edge, shared contracts, workflow changes; concurrency cancels obsolete runs. Standard code-change builds passed without touching `control-plane.trigger`. |
| C02 Vercel preview ERROR | **PARTIALLY FIXED / LATEST DEPLOY BLOCKED BY QUOTA** | A Vercel `READY` preview exists for Commerce branch commit `bd4868b86dfe915d8563d850fc53e83a3c6d6975`: `dpl_GPqLYrJ7f5GYjeJyicotbNpqtrhW`. Latest GitHub security commit is newer and NOT deployed. Creating an explicit new deployment returned HTTP 402 `api-deployments-free-per-day` (more than 100 deployments, retry one day); no upgrade authorized/performed. |
| C03 Neon schema but no Drizzle journal | **RECONCILED IN STAGING** | Verified empty user/team/member/invite tables. Using exact GitHub migration source and upstream Drizzle `sha256` + journal semantics, recorded the ALREADY applied `0000` baseline and then added `session_version`, unique `team_members(user_id,team_id)`, and `0001` journal entry in a single Neon transaction. Verified 2 journal rows, column present, unique index present, zero users/teams. CI separately passed the actual `pnpm db:migrate` on disposable Postgres. **Important:** Direct Neon SQL migration-journal reconciliation is not the same as running official drizzle-kit against live Neon. Verify official migrator no-op on staging at next approved deployment/migration operation. |
| C04 Unsafe public sign-up | **SAFELY DISABLED** | `ENABLE_PREVIEW_SIGNUP=false`, no email verification, Turnstile or throttling yet; MUST remain off. No claim public onboarding is ready. |
| C05 Missing PostgreSQL -> Cloudflare -> Medusa merchant provisioning | **BLOCKED / NOT IMPLEMENTED** | Cloudflare D1 has zero merchants/domains/ready Medusa services; Worker only allows GET/HEAD; continuous Medusa hosting still not provisioned on Free. No live checkout. |
| C06 No authenticated multi-user E2E proof | **PARTIAL TEST COVERAGE** | GitHub CI runs a real disposable Postgres + Next production build and HTTP signed-JWT test: user projection without password hash, signed JWT revocation upon version increment, dashboard redirect, `/api/team` isolation, uniqueness for memberships. Full owner/member action E2E (including concurrent removals) still pending. |

## Extra security hardening implemented
1. **Revocable sessions:** Added `users.session_version` with initial 0; signed JWT includes version. `getUser()` compares token to DB version on every lookup; password change, account deletion, removing a team member and explicit logout increment version. Middleware no longer renews JWT on every GET. Old cookies remain cryptographically signed but cannot pass the DB auth check. A server-side `dashboard/template.tsx` enforces `getUser()` before dashboard content.
2. **Owner/role safety:** Member removal re-checks current actor's role **inside** transaction *after* locking team, checks last owner, scopes target to team, and invalidates target user JWT. Duplicate `(user_id,team_id)` prevented by Postgres unique index. UI uses actual team role, not row position/global user role.
3. **No arbitrary tenant selection:** `getTeamForUser` and `getUserWithTeam` fail closed when multiple teams match until explicit activeTeamId exists.
4. **Signup/logging correctness:** Signup transaction and later cookie issuance have separate error handling; after DB commit an auth cookie failure reports account created and invites sign-in, not account creation failure. Sign-out clears cookie in finally, even if audit fails, with best-effort server-side JWT revocation when DB is reachable.
5. **Private team APIs:** `/api/team` now returns HTTP 401 unauthenticated, 409 when team context unavailable and sets private/no-store on success. `/api/user` already masks password hash and returns 401 unauthenticated.
6. **Billing remains disabled:** Stripe checkout callback never establishes user session. Price/billing flows remain off until provider test approval and idempotent webhook reconciliation.

## Verified tests
Latest clean HEAD CI: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40845192074 **SUCCESS**.
Signed-JWT+DB integration first clean run: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40845088950 **SUCCESS**.

Test flow:
- Postgres 15 starts; `pnpm db:migrate` creates both migrations on a fresh disposable database.
- `pnpm build` compiles production Next.js without fake Stripe tokens.
- Next server starts, `/api/user=401`, `/api/team=401`, Stripe endpoints disabled 404, and `/api/health` connects to both Postgres and real Cloudflare edge.
- CI inserts isolated test user/team, mints correctly signed JWT, reads safe user projection and team context, rejects duplicate membership, increments session_version, verifies revoked token gets 401 and dashboard redirect, verifies new token and deletion invalidation.
- Streaming Next.js redirects can return HTTP 200 with a redirect marker; the test checks redirect behavior rather than assuming a 307 status.

## Connected resource checks
- Neon `motngum_commerce_preview`: **5 business tables, session_version column, unique membership index, two Drizzle journal records, zero users/teams** as of final verification.
- Cloudflare `commerce-preview.motngum.cafe`: Worker and D1 staging, not an actual storefront.
- Vercel `motngum-commerce-saas-staging`: Git linked, Node 22, `POSTGRES_URL`, `AUTH_SECRET`, `BASE_URL`, billing/signup feature flags all present for **preview/development**. Latest deployed READY preview is not current HEAD due to free daily deployment API quota.
- Vercel project buildCommand restored to `pnpm build`; **do not run mutable migrations on every arbitrary preview build**.

## Remaining work (do NOT describe as completed)
- Vercel latest-HEAD preview deployment when free API deployments quota resets; inspect logs, deployment SHA, health, auth endpoints. Do not assign production domains.
- Server action owner/member E2E with two real users and concurrent mutation, secure invitation token + email verification + anti-abuse protection, active team selection and tested session revocation from actual UI.
- Persistent Medusa API+worker runtime, separate stock/order PostgreSQL, Redis, merchant provisioning saga with trusted Cloudflare D1 writer and idempotent retry. No hosted commercial checkout yet.
- Billing: plan allowlist, webhook event de-duplication, merchant PSP and settlement flow, refunds; all unimplemented/disabled.
- Production compliance, backup/recovery, monitoring, 2-tenant stock/order/customer isolation, then DNS cutover gates. All unrelated subdomains remain untouched.

**No more than these claims have been verified.**
