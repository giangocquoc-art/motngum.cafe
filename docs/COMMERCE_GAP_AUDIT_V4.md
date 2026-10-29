# MOTNGUM COMMERCE — KIỂM TOÁN KIẾN TRÚC V4

> **BẢNG TRUY VẾT THỰC THI:** [COMMERCE_FEATURE_REGISTER_V4.csv](./COMMERCE_FEATURE_REGISTER_V4.csv), hiện liệt kê 60 hạng mục; tất cả chưa được triển khai hoặc đang bị chặn bởi yêu cầu tích hợp/giấy phép/kiểm chứng. Chỉ nâng trạng thái sau khi có kiểm thử và chứng cứ triển khai.

Ngày rà soát: 29/10/2026. Trạng thái: tài liệu thiết kế, **chưa phải mã triển khai**.
Hiệu lực: thay thế kết luận/giả định mâu thuẫn trong V1, V2 và V3. Các hạng mục đã đúng ở V2/V3 giữ nguyên và không tính lại là lỗi mới.

## Kết luận
V3 vẫn chưa đủ làm runbook giao cho coding agent triển khai vì có *rủi ro cụ thể chứng minh từ source code*, trong đó nổi bật nhất là DTC Starter giả định một backend + một publishable key ở thời điểm runtime/module load, trong khi mô hình SaaS chia shop có thể cần tới nhiều backend. Ngoài ra cần khóa thứ tự thực hiện và ma trận chứng cứ để ngăn các module mock/demo bị ghi nhận là hoàn thành.

### Nguồn kiểm chứng
- Medusa DTC frontend `apps/storefront/src/lib/config.ts`: global singleton SDK, `NEXT_PUBLIC_MEDUSA_BACKEND_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`; https://github.com/medusajs/dtc-starter/blob/main/apps/storefront/src/lib/config.ts
- `apps/storefront/src/lib/data/cookies.ts` và `apps/storefront/src/lib/data/cart.ts`: cookie `_medusa_jwt`, `_medusa_cart_id`, cache tag/force-cache; https://github.com/medusajs/dtc-starter/blob/main/apps/storefront/src/lib/data/cookies.ts
- Medusa publishable keys scope sales channels: https://docs.medusajs.com/resources/storefront-development/publishable-api-keys
- Medusa inventory/reservations: https://docs.medusajs.com/resources/commerce-modules/inventory/reservations-lifecycle
- Redis multi-instance locking: https://docs.medusajs.com/resources/infrastructure-modules/locking/redis
- Cloudflare for SaaS: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/
- Cloudflare Worker wildcard catch-all impacts existing zone hostnames: https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/advanced-settings/worker-as-origin/
- MedusaPOS plugin README pins Medusa 2.21.0 and requires shared locks on multi-instance; currently Medusa DTC backend uses 2.22.1. https://github.com/medusapos/app/tree/main/packages/medusa-plugin
- Puck React visual page builder MIT: https://github.com/puckeditor/puck
- Latest source truth: GitHub repository links, never assume upstream lockfiles or API schemas are frozen until pinning SHA.
 
## A. NEW CRITICAL defects / missing contracts (V4)
| ID | Vấn đề | Quyết định sửa | Gate xác nhận |
|---|---|---|---|
| V4-B01 | **Global storefront SDK hardcodes backend/key:** `config.ts` initializes an SDK singleton from NEXT_PUBLIC env. Can't safely switch that singleton per concurrent request. | Choose either isolated frontend deployment per tenant (simple but costs high) or one shared tenant-aware storefront with request-scoped SDK instantiated only after trusted Host lookup. No global variable mutation, no client-supplied backend URL. | Merchant A/B simultaneous requests hit intended backend/key; 100 concurrent requests no cross-tenant data. |
| V4-B02 | **Cookies, auth, carts, cache mismatch tenant context:** starter uses fixed cookie names `_medusa_jwt`, `_medusa_cart_id`, optional per-visitor cache tag. Shared storefront refactor must bind sessions, carts and cache to verified merchant and hostname. | Host-only cookie per storefront domain; per-tenant server authority; recompute cart/customer ownership and backend matching, avoid shared `Domain=.motngum.cafe` session. Cache keys include merchant/location/price-list/currency/sales-channel and avoid caching private data publicly. | A/B same email SKU and simultaneous cart/sign-in have no leakage even on route rewrites or domain changes. |
| V4-B03 | **Domain routing could hijack unrelated apps:** Cloudflare Worker wildcard route `*/*` catches HSK/mail/portfolio on the same SaaS zone unless explicit exceptions, routing plan V3 omitted this hazard. | Design explicit protected hostname allow/deny registry; exact routes/exclusions; inspect Cloudflare routes, Workers, Vercel domain associations and DNS together. Unknown hosts return safe 404, no fallback to other tenant. | `hsk`, `ktsthaiduc`, `mail`, `web`, `ngocphat`, `thuyduong` and apex/www remain correct before/after cutover. |
| V4-B04 | **Custom domain state machine incomplete:** DNS is not equivalent to ownership or SSL readiness. | States `requested -> ownership_pending -> cert_pending -> dns_pending -> active`, plus `failed/blocked/expired/detaching`, each with retry/timeout/error codes; activate only when hostname+SSL status active and DNS verified. Domain transfer has uniqueness lock and cooldown. | Failed ownership or certificate validation never receives another merchant's storefront; status/reporting recover without manual DB editing. |
| V4-B05 | **Multi-replica Medusa locking provider missing verified deployed config.** | Configure Redis or Postgres advisory distributed locks per tenant for all writers (Medusa API, Medusa workers, POS plugin) and transactional commands. Don't rely on single-process in-memory locks. | 10+ concurrent POS/web/marketplace writes and crash simulation -> invariant for order/stock, no oversell except explicit offline policy. |
| V4-B06 | **No machine-checkable feature proof matrix** in prior 3 versions. | Require feature registry: Haravan reference, status, upstream source path SHA, adapter, owner, DB migration, API endpoint, roles, payments/data impact, tests, provider entitlement and evidence URL. 'Done' only if proof exists. | release report generated from feature registry; zero P0/P1 cells without test evidence. |

## B. NEW HIGH operational and integration gaps
| ID | Mục thiếu | Hướng sửa | Gate |
|---|---|---|---|
| V4-H01 | Shared storefront vs one-deployment-per-shop never evaluated experimentally | ADR comparing cost per merchant, cert/custom domains, release velocity, backend URL routing, security + deployment quotas; test both at 2 tenants | Signed ADR and measured budget for 2,10,100 shops |
| V4-H02 | Merchant Admin vs platform Admin URL/cookie scopes ambiguous | map `motngum.cafe`, `app.motngum.cafe`, `<slug>.motngum.cafe`, merchant admin route, Medusa native `/app` per backend; central SSO only with explicit audience/scope | staff can't cross tenant by swapping URL or JWT; merchant operator must be able to run full CRUD |
| V4-H03 | Product catalog channel publication lifecycle not a working specification | consistent pricing/publishing to web/POS/sàn; snapshots + effective dates + regional price and tax display; stock reconciliation after failures | sale price and stock match selected source & effective time; no publish of unapproved items |
| V4-H04 | Money and side-effect ordering lacks an explicit distributed saga | use payment + order + fulfillment saga with awaited durable state, explicit compensate/repair; no cross-DB transaction assumptions, event dedup and timeout states | provider accepts charge but application fails before order persist -> automatic or operator reconciliation and no lost funds |
| V4-H05 | Multi-tenant global scheduled jobs/reporting could block other merchants | tenant fairness, queue partition, concurrency budgets, per-provider token bucket, per-shop dead-letter, queue billing metrics | one high-volume tenant does not delay others over accepted SLA |
| V4-H06 | Customer-owned custom-domain outbound notifications not defined | transactional vs marketing sending, SPF/DKIM/DMARC verification for merchant sender domains, fallback platform sender, preserve platform MX/Email Routing and configure opt-outs | test email deliverability, DNS conflicts, suppression and spoof protection |
| V4-H07 | POS order without checkout reservation may fail fulfillment | use appropriate Medusa reservations for externally created orders; test plugin version and offline negative-stock policy, cashier auth without global admin | POS/offline sale reconciles and does not unexpectedly fulfill unreserved order |
| V4-H08 | Draft/live store publication state and CMS ownership overlap | Puck for drag-and-drop component, Payload for content/publish/revisions, Medusa for catalog pricing and stock; versioned block schema and non-executable user config | publish draft to correct tenant only; rollback without mutating orders |
| V4-H09 | Time/currency conventions missing precise contracts | store UTC instants, merchant-specific IANA timezone; integer/Decimal money, VAT rounding policies, event-time vs processing-time, daily revenue time-window; snapshot FX if enabled | midnight cross-zone order and refund appears in correct shop/day/report |
| V4-H10 | Index/reports consistency SLO is unstated | define delay targets for stock sync, storefront cache invalidation, message delivery, analytics; visible `last_synced_at` and repair button | synthetic tests enforce max lag; report indicates stale vs final reconciled state |
| V4-H11 | Multi-merchant platform outages without safe degrade policy | storefront read-only vs checkout unavailable; admin read availability; suspend only risky writes during processor outage; maintenance/incident display | PSP unavailable -> no false paid status, user sees recovery path |
| V4-H12 | Product catalog import reference data and validation too broad | per-tenant CSV mapping, sample templates, validation of SKU/variant/UOM/barcodes, duplicate image, idempotent batch import, preview and report | import 1000 products twice yields unchanged canonical item counts and explainable error report |
| V4-H13 | Automated feature flags and rollback of custom modules missing | platform and merchant feature toggles, migration gating, dark launch, protected flags for money/stock paths, all critical flags auditable | disable broken connector without losing incoming events; rollback safe |
| V4-H14 | Payment/ERP provider onboarding costs are unknown | record actual contract, allowed use, sandbox availability, merchant provider account, settlement bank ownership and fees; providers without approvals remain NOT_AVAILABLE | real sandbox evidence for each claimed integration |
| V4-H15 | SaaS support responsibilities and escalation unclear | ticket-to-tenant links, tiered support, merchant incident report, maintenance windows, fraud/abuse suspension rules | simulate staff mistake and charge dispute; auditable owner and repair path |
| V4-H16 | Source repos can ship placeholder or demo admin, unfinished checkout features | full route->API->DB->error check, ban demo passwords and hardcoded Stripe test keys, do not infer production readiness from README | seed prod with no demo accounts, end-to-end checkout uses provider sandbox and passes |
| V4-H17 | Plugin installation without dependency isolation risks entire server | allow-listed and signed app integrations only, run untrusted app logic separately, scopes/encrypted credentials, version compatibility and install/uninstall migration strategy | malicious/buggy app cannot read other tenants or crash commerce core |
| V4-H18 | Per-tenant deletion and multi-system erasure not implemented as an executable job | event-driven export/delete with service receipts across Medusa, CMS, inbox, media, analytics, backups retention policies | request produces audit trail, data deletion/retention rationale and no orphan media |
| V4-H19 | GitHub upstream upgrades vs live customized instances not version pinned per tenant | each tenant records image digest/schema version/config revision; define control-plane API compatibility; release ring/canary and forward-fix | upgrade one sandbox merchant, then canary, no checkout breaking change |
| V4-H20 | Real storefront B2B vs B2C and tax/returns confusion | define plan-level availability, distinct quote/order workflow, who approves VAT invoice, price visibility per authenticated buyer and transfer of quote into canonical order | B2B price never visible to unrelated shopper; approval and tax totals verified |

## C. Operational acceptance checklist for first working slice
**Minimal viable architecture is NOT all of Haravan**. The first proof must be:
1. Two self-created merchant records; no manual SQL.
2. Two complete, isolated Medusa stores and databases with users/customers, payment configurations and stock.
3. One runtime architecture chosen; all storefront requests resolve from trusted Host to correct backend and sales channel.
4. Buyers for A/B can each login, browse, cart, checkout, pay via verified TEST gateway, and view order; no cross-shop leakage.
5. An admin receives their own orders, reserves stock, pays/refunds, fulfills, processes returns; duplicate webhook/HTTP retry handled.
6. 10 POS/Web orders concurrently share correct distributed lock behavior.
7. Duplicate external order event can be safely replayed with no duplicate order/payment/stock movement.
8. Domain change and SSL pending state never cause wrong merchant to be served.
9. Automated full stack tests including failures, security, rate limits and DB restore; CI logs; distinct credentials for production/preview.
10. No fake dashboards, demo-only data or pages labeled `Done` without tests and persistence.

## D. Hard decisions before using any non-trivial code
- One merchant-per-instance backend vs shared Medusa backend: V2/V3 chose first for safety but **must re-evaluate costs**. Do not auto-provision large numbers of instances until viability evidence. Use a shared frontend only after V4-B01/B02 isolation refactor, else deploy isolated storefront per merchant.
- One domain controller: Cloudflare SaaS vs Vercel for Platforms. Never put new wildcard Worker `*/*` on the existing zone without first proving an exception strategy for all current apps and email.
- Puck is a builder component, Payload CMS handles content metadata, Medusa handles transactional catalog. No second ecommerce backend.
- MedusaPOS Beta: license MIT; plugin Medusa 2.21 vs DTC 2.22.1 = integration blocked pending compatibility tests; privileged admin account workaround is unacceptable by default.
- n8n remains internal-only unless suitable commercial license; merchant-facing automation based on licensed engine/Medusa workflows.
- Payment movement: merchants receive their own sale proceeds through approved payment provider settlement; platform subscription fees are separate absent explicit regulated/contractual facilitator model.

## E. Plan tracking fields
Each feature has `feature_id`, `business_flow`, `upstream_repo`, `upstream_ref_sha`, `source_path`, `reuse_mode` = native/plugin/adapter/custom, `api_contract`, `state_owner`, `tenant_scope`, `permissions`, `tests`, `provider_approval`, `proof_url`, `status`.
Statuses: NOT_STARTED, RESEARCHED, IMPORTED, INTEGRATED, VERIFIED, RELEASED, BLOCKED.
No source path or proof URL = NOT VERIFIED; label honestly.

## F. Truthful current status
As of 2026-10-29, this is an audit only. No code import, no deployment of Medusa/POS/CMS/Control Plane, no payment integration, no production DNS change, no old project deletion. Keeping existing apex and unrelated subdomains unchanged during planning.
