# Motngum Commerce Platform — integrated source tree

**Status (2026-10-29): staging; NOT READY for customer orders or collecting money.**

## What's actually imported and deployed
- `commerce/`: unmodified official `medusajs/dtc-starter` at `6965d8ac4185740c521a2b26855258ea20817b8e`; backend/Admin/Next.js storefront from upstream; MIT. Repository copied by an auditable GitHub Actions import job.
- `control-plane/`: unmodified official `nextjs/saas-starter` at `6e33e58b1e553a41fe22e6b941a7229a002de361`; MIT. **Do not deploy upstream demo seeds.** Upstream currently includes Next.js 15 canary; review/upgrade before production.
- `edge/src/worker.mjs`: deployed separately as Cloudflare Worker `motngum-commerce-stage` with D1 binding `motngum-commerce-staging`. This is a read-only tenant/domain/connection registry and truthful readiness gateway, not a second order or product system.
- `packages/tenant-contract/`: request-scoped merchant resolution/hostname safety/SDK factory and idempotency contract with Node tests. Still needs wiring into the vendored storefront on a production backend.
- `docs/COMMERCE_GAP_AUDIT_V4.md` and `docs/COMMERCE_FEATURE_REGISTER_V4.csv` in the outer repository track functional parity gaps.

## Live *staging only*
https://commerce-preview.motngum.cafe/ 
- /health — real D1 connectivity (HTTP 200)
- /api/status — accurate module connection status (HTTP 200)
- /api/tenant/resolve — fail-closed without a verified active host (HTTP 404)
- /api/ready — commerce not connected; intentionally HTTP 503
- Modifying POST requests — intentionally HTTP 405 until authenticated Control Plane exists.

The Cloudflare DNS records for `motngum.cafe`, `www.motngum.cafe`, `hsk.motngum.cafe`, `ktsthaiduc.motngum.cafe`, `mail.motngum.cafe` etc were not changed. A new, isolated hostname `commerce-preview.motngum.cafe` was created. NO old project or code was deleted.

## Runtime boundaries and owners
| Subsystem | Technology | Source of truth | Runtime |
|---|---|---|---|
| SaaS organization/billing | Next.js SaaS Starter (adapting) | SaaS Control Plane PostgreSQL | Persistent-compatible Node/serverless selected later |
| Store products/orders/inventory/payment state | Medusa DTC | Medusa PostgreSQL | Long-lived backend API + worker; NOT raw Cloudflare Worker |
| Tenant domain/connection metadata | Cloudflare Worker+D1 | D1 registry, NOT merchant transactions | Cloudflare Workers |
| CMS/theme | Payload and Puck *candidate dependencies* | CMS tables, product read-only from Medusa | Not deployed |
| POS | MedusaPOS *beta candidate* | Medusa, plugin 2.21 mismatch with DTC 2.22.1 | Not deployed |
| Conversations | Chatwoot *candidate* | Chatwoot contacts/conversations; no order SoT | Not deployed |
| Internal automation | n8n *candidate* | Outbox and Medusa authoritative data | Not deployed; SaaS licensing restrictions apply |
| Shipping/PSP/social integrations | Official provider adapters | Medusa + financial ledger | Not deployed; credentials required |

## Why not Cloudflare Containers now?
Current connected Cloudflare account is on Free; listing Containers returned an explicit API error that Containers require Workers Paid. Medusa requires PostgreSQL and process-based backend/worker runtime, Chatwoot uses Rails and background jobs, and n8n requires persistent execution. Deploying these as a simple Workers script would not be a supported or correct architecture. **Choose a suitable paid compatible runtime/host after proving CI build, economics and legal PSP onboarding.** Vercel also has Services/Functions, but app compatibility and the account's permitted usage must be verified before claiming support.

## Import/workflow safety and upgrade policy
- Pinned official upstream commits and licenses are preserved; no copying third-party proprietary extensions.
- Sources are imported to a separate branch from legacy main. GitHub Actions builds/tests produce CI evidence.
- Do not update code by re-triggering import workflow: it deliberately refuses to overwrite existing imported directories. Create a reviewed upstream-update PR.
- Lock to supported stable versions before production; never copy default demo account/password or test payment provider into production.
- Use Medusa core APIs and workflows, not direct SQL writes from POS/Chatwoot/n8n into orders/inventory.
- No cross-tenant tokens, cookies, cache, domain mapping or API keys. Incoming provider events scoped by `(merchantId, provider, eventId)` with transactional dedup/outbox.
- Do not record payment as paid from a QR display or browser redirect; only verified PSP callback and reconciliation.
- Protect old subdomains when finally cutting over apex; detaching domain is not equivalent to deleting unrelated services.

## Deployment gates, truthfully
1. Imported source: **PASSED** official GitHub Actions run.
2. Cloudflare Edge + D1 schema + HTTPS: **PASSED** hosted smoke runs.
3. Tenant contracts: **PASSED** Node unit tests; **NOT** verified in running Medusa storefront.
4. Medusa real PostgreSQL/Redis CI build: see `.github/workflows/commerce-medusa-health.yml`; results determine if passed.
5. SaaS Control Plane auth/billing, tenant provisioning, Medusa backend hosting, actual storefront, real PSP, shipment integration: **NOT DONE**.
6. `motngum.cafe` apex cutover, deletion of old shared Vercel project: **NOT DONE**.

## Next integration step
Settle tenant runtime/cost model, stand up persistent Medusa staging, wire the request-scoped client into Next.js storefront (refactor the upstream global SDK), join merchant lifecycle via an authenticated Control Plane, prove checkout and D1 domain resolution with two isolated merchant fixtures, then expand integrations. Use the 60-feature register to gate each module on real persistence, cross-service consistency, role enforcement and evidence.

No simulated data is accepted as production proof.
