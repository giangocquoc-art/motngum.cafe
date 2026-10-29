# KIỂM TOÁN LẦN 3 — V3: INTEGRATION GAPS, MONEY FLOW, AND PRODUCTION GATES
Date: 2026-10-29
Status: architecture amendment, NOT a deployed system.
Supersedes contradictory portions of `COMMERCE_REBUILD_MASTER_PLAN.md` and supplements `COMMERCE_GAP_AUDIT_V2.md`.
Product: multi-merchant SaaS similar to Haravan. Functional completeness and correctness first, aesthetics later.

## Critical verified facts and corrections
- Medusa Store Module permits multiple stores but does **not** natively solve multi-tenancy: https://docs.medusajs.com/resources/commerce-modules/store
- Medusa inventory reservations: `completeCartWorkflow` reserves on order placement; fulfillment decrements stocked AND reserved; canceled orders release reservations. It is **incorrect** to claim all abandoned carts reserve stock or to decrement inventory manually again during shipping: https://docs.medusajs.com/resources/commerce-modules/inventory/reservations-lifecycle
- Cloudflare for SaaS is a separate service needing enablement, fallback origin, custom-hostname creation and DNS/SSL validation. Plan limitations, quota and billing must be checked; Free includes 100 custom hostnames under the published plan, but wildcard custom hostnames not supported for non-Enterprise tiers: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/plans/ and https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/
- Vercel for Platforms supports multi-tenant wildcard and custom domains with certificate automation. Pick **one** authoritative provisioning path (Vercel for Platforms OR Cloudflare for SaaS) for each customer hostname; do not double-provision or casually mix incompatible proxy patterns: https://vercel.com/platforms
- Vercel Hobby is restricted to personal/non-commercial usage: https://vercel.com/legal/terms (19/10/2026).
- Vietnam e-commerce law 122/2025/QH15 effective 01/07/2026: https://vanban.chinhphu.vn/?clas-=&docid=216503&pageid=27160
- Vietnam personal data law 91/2025/QH15 effective 01/01/2026: https://bocongan.gov.vn/chinh-sach-phap-luat/co-so-du-lieu-van-ban/luat-bao-ve-du-lieu-ca-nhan-1753688803

## New missing items over V2 (do not confuse with already enumerated V2 groups)

### CRITICAL / NEW
- V3-C01 **Money flow and merchant of record**: before provider integration, choose who is legal seller/payee and how buyer money routes to merchant bank account, what platform collects as SaaS fees, chargeback exposure, returns, fraud holds and settlement reconciliation. This is not solved by generic Payment Adapter. GATE: separate merchant-vs-platform contracts, payment account ownership, settlement test and ledger postings for the two funds flows.
- V3-C02 **Shopper -> merchant vs merchant -> platform identity**: design AuthN/SSO mapping and session boundaries among control plane, Medusa admin, buyer accounts, Chatwoot. Prevent platform users becoming merchant operators by blindly sharing JWT. GATE: identity matrix and cross-domain cookie/SSO tests; revoked staff role blocks all merchant APIs.
- V3-C03 **Actual domain-service selection**: compare Vercel for Platforms and Cloudflare for SaaS, choose single primary custom-hostname issuer/routing owner; cost/quotas/SSL, DCV, hostname uniqueness, apex constraints, cert renewals, takeover, reconciling DNS. GATE: merchant custom-domain + subdomain + cert activation test and fail-closed unknown Host; existing HSK/portfolio/mail remain unaffected.
- V3-C04 **Lifecycle consistency with upstream Medusa**: use `completeCartWorkflow` reservations; never double decrement stocked/reserved. `createOrderWorkflow` may create orders without reservation, require explicit reservation for non-checkout import/POS channel. GATE: exact inventory deltas for cart, completed order, fulfillment, cancellation, partial fulfillment, return and external/POS order.
- V3-C05 **Multi-tenant cost reality**: tenant-per-instance is isolation-first but not a proven financially viable SaaS architecture. Gather actual RAM, CPU, DB connection, queue, storage, deployment and per-merchant cost metrics, pilot at 2 merchants then load test at 10/100; decide pooled/sharded workers only after security review. GATE: business-approved cost-per-shop envelope, tenant isolation proof and plan to scale with no cross-tenant leaks.
- V3-C06 **Canonical mapping across ALL systems**: versioned canonical IDs (merchant, branch, location, product, SKU, inventory item, customer, order, payment, shipment, chat contact, external platform account) with strict mapping tables and ownership. GATE: create/read/update flows cannot accidentally join same SKU/contact/order across merchants.
- V3-C07 **Missing deployable infrastructure ownership**: choose and provision an actual backend host, worker topology, secrets manager, queue, persistent Postgres and object storage BEFORE promising production. GATE: backend+worker boot and survive restart; environment parity; no ephemeral-only job.
- V3-C08 **Functional traceability**: Haravan-equivalence matrix of *each* feature -> exact upstream module/version -> plugin vs newly built -> API -> DB effects -> RBAC -> event -> failure recovery -> E2E evidence. Route rendering = 0% completion. GATE: all release-required features have passing traceable tests, no uncovered P0/P1 feature.
- V3-C09 **Repository integration strategy/upstream lifecycle**: pin upstream commit SHA and dependencies for all repos, generate SBOM, preserve licenses, security review, private patch inventory, automated upstream update/compatibility tests. Never copy unlicensed sample repo code solely because visible on GitHub. GATE: reproducible install/build in clean CI with verified origin and licenses.
- V3-C10 **Business operational pilot and real merchant onboarding**: setup wizard, terms, merchant/branch ownership verification, payment provider merchant contract and account setup, first catalog import, first real checkout. GATE: two clean demo merchants onboard with no manual SQL or operator-side configuration, then one real merchant sandbox acceptance.

### HIGH / NEW
- V3-H01 **Migration/import adapters and merchant launch tools**: existing merchants need Excel CSV import for product/variants, customer/order/history optional, image import, dedup and dry-run, mapping reports, rollback.
- V3-H02 **Merchant compliance and abuse controls**: account verification where required, banned goods, impersonation, brand/domain claims, spam campaigns, take-down/dispute workflow and staff override audit.
- V3-H03 **Tenant-specific data portability**: export all tenant-owned data (orders and status, product, customers, content, assets, mapping/consent) in documented format; restore/transition without domain takeover. Deletion grace vs legal hold.
- V3-H04 **Subscription lifecycle beyond quota**: what happens to storefront, inbound webhooks, already paid but unfulfilled orders, refund rights, attachments and export when trial expires or subscription is suspended; policies and operational transition.
- V3-H05 **Idempotency keys for all outbound effects**: not just inbound webhook; creation of payment sessions, shipping labels, invoices, refund requests, stock push and support messages, persisted provider request IDs.
- V3-H06 **Event contracts and schema evolution**: versioned events, valid replay retention, outbox ordering by aggregate, concurrency conflict resolution, API version compatibility and rollback migrations. No free-form JSON from n8n controlling money/stock.
- V3-H07 **Source conflict & reconciliation**: define channel priority for SKU/title/price/stock, external seller-initiated edits, partial API outage and nightly diff/repair; most marketplaces do not permit full bidirectional support for every entity.
- V3-H08 **API limits per tenant and fair scheduling**: separate provider keys, quotas and backoff budgets; one merchant's abusive traffic must not delay all others.
- V3-H09 **Media object identity and access**: tenant-isolated object path/bucket, virus scan, MIME verification, upload limits, image transforms, signed download or public-storefront designation, CDN partition by tenant.
- V3-H10 **Cache correctness**: key by tenant+channel+locale+currency+price-list; explicitly invalidate on price change, stock change, promo start/end, domain transfer; never cache authenticated content across tenants.
- V3-H11 **Checkout integrity / prices**: one authoritative final server-side totals calculation, decimal money, rounding VAT/discount/shipping rules and payment reconciliation, never trusting browser price or coupon values.
- V3-H12 **Extensible but safe plugin architecture**: distinguish trusted internally installed connector code from external developer apps; no arbitrary JS execution in main application process; scope/token lifecycle and review.
- V3-H13 **Buyer trust and customer service**: fraud/disputes, abusive refunds, delivery claims, return inspection and chargeback handling with merchant/platform responsibilities; no automatic paid reversal until provider confirmation.
- V3-H14 **Operational rollout at scale**: per-tenant migrations, failed provisioning cleanup, rollback compatible with schema, secrets rotation, release ring/canary, bulk job throttles, incident isolation and recovery.
- V3-H15 **Notifications and templates**: business transactional vs marketing, localization templates, channel credentials, suppression, delivery status, bounce handling, opt-out, message idempotency, system email reputation.
- V3-H16 **Admin ownership**: distinguish storefront `motngum.cafe` as SaaS landing (not a generic merchant's demo shop), `app.motngum.cafe` Control Plane and tenant admin vs Medusa's native `/app`, role/gateway design and explicit supported routes.
- V3-H17 **Real POS offline reconciliation**: locally generated IDs, sale time vs sync time, dedup, offline reservation conflicts, payment reconciliation after connection recovery, negative stock policy. 'Works offline' only with a documented conflict policy.
- V3-H18 **CMS content security and uptime**: separate published/draft, global tenant theme settings and content version, preview auth, isolation and content injection/CSP; Medusa owns product prices and inventory.
- V3-H19 **Webhook verification across Host routing**: bind provider callback to verified merchant external account + signing secret, not just domain or query `merchant_id`. Test replay across merchants.
- V3-H20 **Legal classification by product mode**: SaaS website-builder vs marketplace/intermediary vs payment facilitator differ in KYC/e-commerce and PSP obligations; obtain legal and PSP guidance before collecting third-party proceeds.

## NEW tests and metrics beyond V2
- T01 Two merchants use same external SKU and same customer email -> orders and ledgers remain isolated.
- T02 Buyer carts one remaining item in two sessions -> stock not reserved by a normal add-to-cart; at order placement only one can reserve/complete under managed inventory.
- T03 POS/draft order created without checkout -> manual reservation or correct workflow integration before fulfillment.
- T04 Merchant changes domain while old domain still points to platform -> cannot hijack tenant; cert and hostname status gate release.
- T05 Merchant subscription overdue when buyer already paid -> existing order fulfill/refund remains allowed according to policy; no orphaned funds.
- T06 Two provider callbacks simultaneously + second API replay for refund/label -> only one financial/stock/shipping effect per logical operation.
- T07 Disable channel connector mid-backlog -> drain, stop or dead-letter with no lost canonical orders or unintended stock pushes.
- T08 Change Medusa upstream version with stored inventory reservations -> test state migrations and backward compatibility against production-like DB.
- T09 Cache key fuzz across tenants and price lists -> no cross-tenant response or wrong price.
- T10 Media upload with malicious MIME or other tenant's object ID -> rejected or isolated.
- T11 Billing invoices and merchant transaction payments remain different ledger sources and bank settlement entities.
- T12 A merchant launches by self-registration, catalog CSV import, site publish, test payment and order shipment with zero console SQL.
- T13 Provision 10 and 100 isolated test merchants, report measured cost, DB connections, memory and queue lag (not predicted success).
- T14 On site cutover, mail MX/TXT and all pre-existing subdomains remain unchanged and independently healthy.
- T15 One complete feature inventory row includes source repo SHA, code path, DB migrations, role, automated tests, status and known limitations.

## Updated release gates
G0: select business model, payee/legal/PSP model, SaaS plan, vendor rights and budget. Do not claim 'ready' before this.
G1: pick tenant hosting/DB strategy after cost test and isolation adversarial test; Control Plane and tenant identity.
G2: pick single domain/SSL platform and prove onboarding, DNS verification and custom domain lifecycle.
G3: import pinned Medusa DTC source; confirm native orders/reservation/payment interfaces; demo two isolated tenants.
G4: POS/warehouse/shipping/media/CMS with API-first adapters and reconciled business ledger.
G5: approve providers and finish verified payment and settlement in sandbox, separate SaaS billing.
G6: social, marketplace, loyalty, automation, B2B, developer apps based on realistic license and partner APIs.
G7: tracing/analytics/monitoring + owner runbook + incident handling + live merchant onboarding/contract checks.
G8: every Haravan parity function is mapped to evidence, security/compliance reviewed, staging tests pass, upgrade/restore drill.
G9: only then deploy new site; transfer apex and www; safely retire former root Vercel project without impacting shared HSK, mail, portfolio or other subdomains.

## Implementation state, hard stop
This document is **planning only**. No production service or DNS changes, no new backend deployments, no project deletion. Existing root GitHub `main` must remain untouched until the live subdomains are isolated, although user explicitly does not want old main website retained.
