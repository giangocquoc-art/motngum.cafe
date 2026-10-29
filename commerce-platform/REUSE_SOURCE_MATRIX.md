# Reuse-first source selection — verified 2026-10-29
> Goal: multimerchant commerce SaaS / Haravan-inspired. This matrix separates **imported live code** from planned plugin integrations and provider-dependent adapters. Do not call non-imported repos installed or deployed.

| Business subsystem | Actual source repo | Decision & integration boundary | Status |
|---|---|---|---|
| Commerce Core: products, variants, prices, cart, order, stock, reservations, returns | https://github.com/medusajs/dtc-starter | MIT; pinned 6965d8a; imported under commerce/, actual PostgreSQL+Redis CI build/health proven | Imported + CI |
| Merchant SaaS: accounts, teams, plan UI, basic subscription | https://github.com/nextjs/saas-starter | MIT; pinned 6e33e58; imported under control-plane/, needs stable Next upgrade, billing isolation, tenancy provisioning, no sample seed | Imported; integration pending |
| Edge tenant registry, TLS-only domain lookup, closed-fail readiness | Cloudflare Worker + D1 (native bindings) | own minimal orchestration glue (not a commerce clone) under edge/. Custom preview domain live | Staging deployed + smoke tests |
| Request-scoped Medusa SDK binding | Medusa JS SDK (from official storefront) + tenant-contract/ | static DTC singleton unsuitable for shared frontend; tests prove 100 independent SDK configs with mocked transport | Contract unit tests only |
| Visual site builder | https://github.com/puckeditor/puck | MIT component dependency; pair with CMS for revisions/publish; use Puck, not another full commerce engine | Planned |
| CMS/blog/theming/SEO | https://github.com/payloadcms/payload | MIT (repo metadata); separate content model and media, never own product prices or orders | Planned |
| POS / offline cash register | https://github.com/medusapos/app | MIT, beta; Medusa plugin v2.21 compatibility failure until adapter against 2.22.1 tested; unsafe default negative stock logic needs policy | Evaluation blocked |
| B2B company, quote, approval | https://github.com/medusajs/b2b-starter | MIT, selective module port to same Medusa core; don't run duplicate engines | Planned |
| Customer conversation inbox | https://github.com/chatwoot/chatwoot | MIT for core; Enterprise directory separate license; Rails and background jobs must be independently deployed; no order DB ownership | Planned |
| Marketing/internal operator automation | https://github.com/n8n-io/n8n | Sustainable Use License; internal automation only, not merchant-facing workflow SaaS without license | Planned / licensing limitation |
| Financial accounting / purchasing | https://github.com/frappe/erpnext | GPL-3; downstream ERP service API/export, optional, **never** another order or inventory system of record | Optional |
| Search/indexing | https://github.com/meilisearch/meilisearch | Mixed MIT + BUSL-1.1 enterprise modules; use MIT scope only after license and hosting review | Optional |
| CRM enterprise | https://github.com/twentyhq/twenty | Mostly AGPL-3 with separate enterprise features; duplicative with Chatwoot and Medusa, do NOT add now | Rejected for MVP |
| Alternative commerce engine | https://github.com/vendurehq/vendure | Valid competitor but running it alongside Medusa creates duplicate orders/inventory | Rejected |
| Alternative ERP commerce core | https://github.com/odoo/odoo | Broad functionality but combining ERP backend and Medusa commerce DB creates two order authorities | Rejected |
| TikTok/Shopee/Lazada/Zalo | Official partner API/SDK per merchant | No verifiable drop-in repo with complete entitlement and Vietnam coverage; write minimal adapters after per-partner API credentials, contract, sandbox | Blocked by integration access |
| Payment gateway / VietQR / e-invoice | Official PSP / bank / invoice providers | Must verify signed provider callbacks, merchant payee, refund/settlement; no generic QR = paid | Blocked by provider onboarding |
| Shipping/COD provider | Official carriers GHN/GHTK/Viettel Post etc. | Adapter per approved provider; verify waybill statuses, returned parcels, COD ledger | Blocked by provider onboarding |
| Storage/runtime | PostgreSQL 15+, Redis, Cloudflare Workers+D1, compatible container host | Cloudflare Free cannot run Cloudflare Containers; persistent Medusa/Chatwoot/n8n production requires separate paid compatible runtime | Live edge only |

## Repo-mixing rules
1. **Service composition, not one giant code paste.** Vendor only the Medusa and SaaS foundation source at exact SHA. Use packages/dependencies for Puck and other libraries; use API integration for Chatwoot/ERPNext, official PSP/carrier.
2. Commerce data is exclusively owned by Medusa transaction backend; no second product/order/stock write authority. Financial ledger is separately reconciled with PSP settlement, not disconnected from order state.
3. Merchant lifecycle and subscription money belong to SaaS Control Plane. Buyer retail payments belong to each merchant's Medusa PSP adapter.
4. The next critical code refactor is tenant-aware storefront SDK and cookie/cache scopes, because upstream DTC is a single-store starter. Tenant host must resolve via Cloudflare registry; no user-controlled backend URLs.
5. Merchant data export, audit, warranty, batch/expiry, stock transfers, company approvals, online POS/offline POS, Facebook livestream and full editor are NOT automatically covered by importing a source repo.
6. Use `docs/COMMERCE_FEATURE_REGISTER_V4.csv` for each feature status. `IMPORTED` is not `INTEGRATED`; `INTEGRATED` is not `RELEASED`.
7. CI of Medusa with PostgreSQL is temporary evidence; a running GitHub Actions service is not the deployment host.
8. Don't cut over apex domain until two-tenant isolation, payments, orders, fulfillment and domain verification are end-to-end proven and Cloudflare routing can't touch existing HSK/mail/portfolio projects.

## Current critical blockers
- Cloudflare account Workers Free lacks Containers (API refused access).
- No always-on Medusa backend host and database provisioned for an independent customer-facing stage.
- No official merchant account/PSP credentials for verifying actual local payment+refund.
- Control Plane not wired to Medusa provisioning and tenant-aware login.
- Existing root Vercel project is shared with other subdomains and GitHub main; deletion unsafe without isolation.

## Evidence
- Upstream import: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40827696996
- Edge Worker D1 HTTP smoke: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40828197347
- Cloudflare custom HTTPS stage: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40828370196
- Tenant request-local contracts: https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40828590863
- Medusa build and PG/Redis health (baseline): https://github.com/giangocquoc-art/motngum.cafe/actions/runs/40828726263
