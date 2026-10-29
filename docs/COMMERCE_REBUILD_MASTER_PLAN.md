# MOTNGUM COMMERCE PLATFORM — MASTER INTEGRATION PLAN (V1 — SUPERSEDED)

> **CHÚ Ý — BẢN V1 ĐÃ ĐƯỢC KIỂM TOÁN VÀ THAY THẾ BỞI V2 (29/10/2026).**
> Xem [COMMERCE_GAP_AUDIT_V2.md](./COMMERCE_GAP_AUDIT_V2.md). Không triển khai trực tiếp theo P0–P7 ở dưới trước khi hoàn thành các gate G0–G8 trong V2. V1 còn thiếu SaaS multi-tenancy/merchant onboarding, subscriptions, CMS/site builder, store domains, tenant security, marketplace integration, licensing và legal compliance. Vercel team hiện Hobby, không được dùng cho hoạt động thương mại; dùng thử riêng phi thương mại được. Không sao chép mã vercel/platforms trước khi xác minh quyền sử dụng.

Date: 2026-10-29
Target: https://motngum.cafe
Scope: replace apex and www storefront with functional multichannel commerce platform inspired by Haravan. Prioritize correct business logic and reuse of existing OSS; cosmetic/UI work is out of scope.

## Grounded environment inspection
- GitHub account: giangocquoc-art; existing repo: giangocquoc-art/motngum.cafe; main is used by more than one deployment.
- Vercel team: peter-pans-projects-898306ed; project motngum-cafe id prj_X5AzZOGnSUoQAvFMkwj09nzFkjKx currently binds motngum.cafe, www.motngum.cafe, web.motngum.cafe, ngocphat.motngum.cafe and thuyduong.motngum.cafe.
- hsk.motngum.cafe is a separate Vercel project but has shared Git repo history; ktsthaiduc.motngum.cafe is also independent.
- Cloudflare zone motngum.cafe is active. DNS apex A currently points at 76.76.21.21, www CNAME points at cname.vercel-dns.com; HSK and portfolio DNS are separate.
- Existing root project has recent failed production builds; do not reuse it as the new platform's backend.

## Decision: one commerce system of record
Primary source repo: https://github.com/medusajs/dtc-starter (MIT).
- apps/backend: Medusa API, Admin, commerce modules, workflows.
- apps/storefront: Next.js storefront and customer account; deploy to Vercel.
Adjunct services:
- Chatwoot (https://github.com/chatwoot/chatwoot) as a separately deployed customer-conversation service. Core MIT with separately licensed Enterprise folder. Never assign ownership of orders or inventory to Chatwoot.
- n8n (https://github.com/n8n-io/n8n) optional internal-only automation; Sustainable Use License (restricted), not a white-label embedded user-facing SaaS builder.
- PostgreSQL for Medusa, dedicated PostgreSQL for Chatwoot, Redis for queues and workers; no cross-service direct SQL queries.
- ERPNext optionally later as an accounting/ERP downstream integration; never deploy it as a second source for product/order/stock.
- Medusa B2B Starter selectively for B2B code compatible with selected Medusa version. Check licenses and module dependency versions first.
- Payment, shipping, tax and local social-commerce connectors only by audited provider APIs, with production credentials and approval when needed.

## Nonnegotiable platform invariants
1. One canonical order lifecycle: Medusa owns Order ID, totals, fulfillment and refund status; map external channel IDs in a separate integration table.
2. Money and currency precision: integer smallest currency unit or Decimal; never binary floating point for payment ledgers.
3. One canonical available-to-sell calculation: on-hand - reserved - safety stock with per-location scope, transaction-backed reservation, compensating release on cancel/expiry.
4. Stock adjustment only through typed stock movement commands, never a webhook directly setting quantity.
5. Checkout creates one canonical payment intent; paid state only after verified provider callback or reconciliation, NEVER by client redirect or generated QR display.
6. External webhook deduplication key = provider + event ID; if unavailable use a stable composite key; persist payload hash and ingestion metadata.
7. Outbox/inbox events with at-least-once delivery; handlers idempotent. A failure in Chatwoot/n8n must not roll back a completed sale.
8. Access control server-side, RBAC scoped to store/company/branch. Secure data boundaries if multi-tenant SaaS is enabled.
9. Every background job has retry with exponential backoff, dead-letter/manual replay, audit trail and metrics.
10. User-facing features are NOT done when the route renders: require actual database persistence, role checks and end-to-end tests.

## Service boundaries & ownership
| Domain | SoT | Integrations |
|---|---|---|
| Catalog/variant/SKU/prices | Medusa | channel export, web |
| Inventory/reservations/transfers | Medusa + custom location ledger | POS, marketplace sync |
| Cart/checkout/payment | Medusa + PSP adapter | external gateway |
| Order/returns/refunds/fulfillment | Medusa | shipping, marketplace |
| Customer identity/profile | Medusa customer, isolated staff IAM | Chatwoot external ID |
| Support conversations | Chatwoot | Medusa customer/order link |
| Campaign automation | n8n internal | Medusa events, Chatwoot events |
| Accounting/taxes | dedicated finance adapter / optional ERPNext | append-only journal/report |
| Analytics/reporting | read-model from Medusa event stream | aggregated dashboards |

## Code architecture
- apps/storefront = upstream Medusa DTC Next.js starter.
- apps/backend = upstream Medusa DTC backend and Admin.
- services/chatwoot = independently deployed official upstream service (not copied into Next.js).
- services/workflows = n8n as internal optional service with credentials and isolated data, no user-facing embedding without commercial license.
- packages/contracts = generated OpenAPI/DTO schemas for events, IDs, payload validation.
- packages/connectors = external provider adapters; every adapter implements inbound verify/map/dedup + outbound map/retry.
- packages/finance = journal, payment reconciliation, invoice adapters and export.
- packages/tenant = tenancy and permissions only if product mode SaaS is explicitly enabled; do not retro-fit tenancy by hiding UI alone.
- infra = nonsecret manifests, deployment and healthcheck scripts, environment templates.

## Phases (each phase must pass release gate before proceeding)
P0 — Audit and isolation
  - Document each existing Vercel project mapping, Cloudflare DNS, code branch and deployment. Do not wipe shared GitHub main.
  - Decide if apex replacement is a single store or multi-merchant SaaS. Data model must account for merchant isolation before taking live customers.
  - Choose backend host suitable for persistent background consumers; confirm billing and limits. Do not treat Vercel Functions as a persistent worker VM.
  - Pin upstream dependency versions/commit SHAs; audit licenses and CVEs.
  Gate: no dependent hsk/other subdomains at risk; tenancy, runtime and costs documented.

P1 — Reuse upstream Medusa DTC as-is
  - Import upstream starter into isolated new code branch/repository retaining LICENSE and upstream attribution.
  - Provision PostgreSQL + Redis; configure environment variables privately.
  - Run official migrations and create first Admin user.
  - Deploy backend to suitable runtime, expose health endpoint. Deploy frontend preview on Vercel.
  Gate: storefront can browse seeded products, real cart, real checkout using TEST provider, customer account and admin order view; tests use real DB not static mocks.

P2 — Product, pricing and inventory
  - Import product data using Medusa APIs; implement variants, price lists, promotions, category management and multi-location stock.
  - Implement receipt, transfer, adjustment, stock reservation, cancellation and return movement ledger using transactional invariants.
  - Integrate or reuse compatible POS module after license/dependency check; avoid separate POS stock database.
  Gate: concurrency tests prove no oversell and balance conservation; Stock Ledger reconciles to available inventory.

P3 — Orders, shipping, payments and refunds
  - Add Vietnam domestic provider adapters only after selecting supported providers and sandbox credentials.
  - Verified signature/webhook; payment intent lifecycle; deposit/partial pay, refund, chargeback and reconciliation.
  - Shipping adapter, COD state, label/tracking, return-to-origin, partial fulfillment and multi-warehouse routing.
  Gate: cart -> order -> stock reservation -> paid webhook -> fulfillment -> stock decrement -> refund/return, including double webhook and failure cases.

P4 — Chatwoot integration
  - Deploy official Chatwoot separately with its own database/Redis and channels.
  - Map Chatwoot contact/external_id to commerce customer ID; show order read-model in support context.
  - Add consent and access protections. Do not sync passwords or raw payment credentials.
  Gate: one customer conversation creates or links exactly one canonical customer and resulting order remains Medusa-owned.

P5 — Automation and marketplace connectors
  - Deploy n8n only as INTERNAL automation, never a resale/white-label execution service.
  - Catalog, order, stock connectors for supported marketplace providers where credentials/API entitlement exist.
  - Implement OAuth token rotation, rate limits, webhooks, polling fallback and replay facilities.
  Gate: imported external order is deduplicated; outbound stock updates acknowledged/reconciled; failed jobs recover without duplicating sale.

P6 — CRM, loyalty, finance and analytics
  - Customer segmentation, loyalty ledger, refunds audit, marketing consent, reports based on reconciled order & stock data.
  - Optional ERPNext export via audited API (no dual writes and no ERPNext directly mutating commerce tables).
  - Data retention/privacy controls and least privilege.
  Gate: report totals reconcile to canonical financial events; no double-counted channels.

P7 — Production hardening and domain cutover
  - Unit, contract, integration and E2E tests; canary checkout, load tests, auth/CSRF/XSS, rate-limit and backup-restore tests.
  - Production release goes to new Vercel project, tested deployment is verified before moving apex and www.
  - Update Vercel project-domain assignment and change Cloudflare A/CNAME only if required. Keep MX/TXT/HSK/other records intact.
  - Preserve unrelated subdomains by relocating them to their own projects before deleting old root project.
  - Remove old root Vercel project through approved dashboard deletion after proving no unrelated domains/dependencies remain; user requested no backup of old website, but NEVER delete unrelated assets or break DNS.
  Gate: new apex + www routes healthy; live payments verified; database integrity; monitoring & rollback mechanism; old project safely removable.

## Functional test matrix (minimum)
Auth & RBAC: login/logout, password reset, account profile; staff cannot reach other branches/stores.
Catalog: variant price/inventory/restrictions, promotion stack, out-of-stock, catalog publishing.
Cart/checkout: duplicate submit, coupon, shipping rates, taxes, address, abandoned checkout.
Payment: signed callback, replay, partial pay, refund, chargeback and provider reconciliation.
Inventory: concurrent carts, reservations, returns, transfer, stock audit and zero-negative checks.
Orders: split shipments, cancel after auth, partial item return, COD failed delivery, cross-branch routing.
Social: same customer across platforms, delayed webhook, duplicate comments/orders, consent/PII.
Accounting: double-entry or independently reconciled statements, COD settlement, fees, negative balances.
Operations: job retry/dead-letter, secret rotation, backup restore, staging/prod isolation, alerts, deploy rollback.
Performance: cache invalidation after price update, search correctness, locale/currency, SEO route support.
Enterprise: tenant isolation, quotas, subscription billing and domain mapping ONLY if SaaS explicitly chosen.

## Deployment plan by infrastructure
Vercel: apps/storefront; optionally thin BFF/API entry endpoints; Vercel previews and healthchecks.
Backend host (must select and provision): Medusa Node.js API + event subscribers + workers, Chatwoot Rails process, n8n process; explicit persistent compute rather than merely a static frontend.
Data: PostgreSQL 15+, separate DBs per service, Redis queues, object storage for media/attachments.
Cloudflare: DNS/TLS/WAF/Turnstile/CDN. Never change other subdomains or existing mail MX records.
GitHub: code source; CI for tests/license/security; protected production releases; avoid committing secrets.
Monitoring: logs, tracing, dead-letter, checkout/provider reconciliation dashboard.

## Current run status
- Discovery of GitHub, Vercel and Cloudflare accounts: COMPLETE (2026-10-29).
- Existing apex/domain mappings: COMPLETE.
- Target architecture and repo license review: COMPLETE at planning level.
- New Medusa source imported: NOT DONE.
- Backend, Redis, PostgreSQL provisioned: NOT DONE.
- Integrated application deployed: NOT DONE.
- Domain switched: NOT DONE.
- Old project deleted: NOT DONE.

CRITICAL: Do not claim the platform is complete or promote a placeholder page. The user values working logic over visual appearance.
