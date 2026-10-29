# Motngum Commerce — Gate A execution and secure staging status
Date: 2026-10-29
Branch: `commerce-rebuild-2026-10`.
**Release: NOT READY.** This document records execution results, not an implied Haravan-compatible SaaS.

## Security fixes committed
- `app/api/user/route.ts`: explicit `id,name,email,role` projection, unauthorized HTTP 401, cache-control private no-store. No password hash returned.
- `app/(login)/actions.ts`: server-side team-owner authorization for member removal/invite; final owner protected; z.coerce numeric FormData; UI now depends on team membership role, not global user role or member row index.
- Sign-up is staging-flag-gated `ENABLE_PREVIEW_SIGNUP=true` (default false), has atomic user/team/membership/activity transaction, and issues JWT session after transaction commit. Numeric, insecure invitations are explicitly disabled until one-time token/expiry/email verification.
- Removed password and new-password reflection from action error states.
- JWT secret must exist with length >=32, invalid session handled as unauthenticated.
- `app/api/stripe/checkout`: removed `setSession()` on Stripe session callback, checks authenticated user's session ID association when billing enabled and does not mark paid. Billing disabled by default.
- `lib/payments/stripe.ts`: lazily create Stripe client, never with fake secret. If billing disabled, pricing page shows no fake subscription prices; webhook and checkout return 404.
- Remaining critical hardening before public signup: verified email, abuse limiting, secure invitations, multi-team context selection, role revocation/session rotation, Stripe webhook idempotency.

## Gate A test evidence
- TypeScript build and first secure smoke: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40833910245 — PASS.
- Full disposable PostgreSQL, `pnpm db:migrate`, `pnpm build`, Next runtime unauthorized user API/disabled Stripe smoke and real Cloudflare health check: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40834307041 — PASS.
- No production credentials used in CI. It is NOT a live Vercel deployment test.

## Connected resources — checked (not guesses)
- Cloudflare `motngum-commerce-staging` D1: 0 merchant, 0 merchant_domains, 0 ready Medusa backends. Worker `commerce-preview.motngum.cafe` deployed separately.
- Neon database `motngum_commerce_preview` owned by role `motngum_commerce_preview_owner`: 5 tables (`users`, `teams`, `team_members`, `activity_logs`, `invitations`), 0 seeded users. Initial starter migration SQL applied in one transaction. **Drizzle migration journal was not written by this manual schema application; run official `pnpm db:migrate` on isolated DB through the deployment pipeline before considering migration tracking initialized**.
- Vercel project A `motngum-commerce-preview` is an unused Next.js project with no deploy; do not call it live.
- Vercel project B `motngum-commerce-saas-staging` is linked to GitHub and uses framework Next.js, Node 22. It has encrypted `POSTGRES_URL` and `AUTH_SECRET`, plus `ENABLE_PREVIEW_SIGNUP=false`, `ENABLE_PLATFORM_BILLING=false`, and `BASE_URL` for preview/development. Secret was transferred within Vercel without exposing it in code.
- Vercel B prior preview `dpl_DKjAjsKSYndPxAYgHrkpSKZgFzFS` built `commerce-rebuild-2026-10` commit `da01c9d` and failed during data collection because POSTGRES_URL was absent **at time of that build**. Secrets have since been configured; a new branch preview deployment has not yet been confirmed READY. Legacy main deployment is also ERROR because the monorepo root does not exist on main.

## Remaining blocking steps
1. Rebuild the latest commit of `commerce-rebuild-2026-10` in project `motngum-commerce-saas-staging` as a **preview**. Verify the build actually reads configured Preview env and succeeds. Project deployments: https://vercel.com/peter-pans-projects-898306ed/motngum-commerce-saas-staging/deployments
2. After a successful preview deploy, test `/sign-in`, `/api/user` (401 without auth), `/api/stripe/checkout` (404), `/api/health` (200 if DB + Cloudflare), and `/api/commerce-integration`. This is **not** registration or commerce end-to-end.
3. Enable preview signup ONLY inside access-protected QA after email verification/rate limits, check transaction and ownership/role tests on disposable DB. Keep public signup disabled now.
4. Plan fully authenticated and idempotent SaaS provisioning from PostgreSQL -> Cloudflare D1 -> isolated Medusa backend. Worker currently READ-ONLY and Medusa is NOT deployed always-on.
5. Never change apex `motngum.cafe`/www or unrelated HSK, mail, portfolio DNS on Gate A.

## Current honest classification
- Code security mitigation: **implemented and CI-checked**, not externally pentested.
- Isolated Neon schema: **applied**, tracking pending `pnpm db:migrate`.
- Vercel preview: **NOT VERIFIED READY**; last confirmed preview ERROR, code and env now updated.
- End-to-end merchant flow and buyer payments: **NOT IMPLEMENTED**.
- Paid plan upgrades: **NONE**.
