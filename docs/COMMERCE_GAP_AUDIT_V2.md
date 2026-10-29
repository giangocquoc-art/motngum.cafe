# KIỂM TOÁN KẾ HOẠCH TÍCH HỢP — V2 (29/10/2026)

> Tài liệu bổ sung và **hiệu chỉnh bắt buộc** cho `docs/COMMERCE_REBUILD_MASTER_PLAN.md`. Nhiệm vụ: sản phẩm SaaS nhiều nhà bán kiểu Haravan tại `motngum.cafe`, không phải chỉ một website bán lẻ. Không ưu tiên giao diện, không tái sử dụng sản phẩm cũ, nhưng không phá các subdomain/dịch vụ ngoài phạm vi.

## 0. Kết luận kỹ thuật
Kế hoạch V1 chưa thể làm tiêu chí deploy vì Medusa DTC chỉ là một storefront+commerce engine; thiếu Control Plane để nhà bán tự đăng ký, thiết lập, quản lý gói và tạo storefront riêng; thiếu tenant isolation, billing, custom domains, CMS, plugin platform, offline POS và ma trận tính năng lõi đúng nghĩa. Medusa Store Module có thể quản lý nhiều store nhưng **không hỗ trợ multi-tenancy toàn diện sẵn có**, theo https://docs.medusajs.com/resources/commerce-modules/store.

**Kiến trúc được đề nghị**:
- **Control Plane** (`motngum.cafe`, `app.motngum.cafe`): danh tính chủ shop/nhân viên tổ chức, đăng ký, gói dịch vụ, provisioning, xác thực domain, cấu hình, quota, metering, support, system admin. Tham khảo `nextjs/saas-starter` (MIT); chỉ chọn module phù hợp, bỏ demo credentials và làm lại adapters subscription phù hợp pháp nhân/PSP.
- **Tenant Commerce Plane**: Medusa DTC Starter (MIT) cho từng merchant đã provision; trong lần triển khai đầu **tenant-per-instance / separate database & credentials** để tránh lộ dữ liệu do custom cross-store access. Reuse same pinned code image for tenants. Kiểm toán chi phí cố định; với tenant count lớn cần thiết kế shared/multi-tenant kỹ lưỡng + kiểm thử isolation trước khi đổi kiến trúc. Không thể chỉ thêm `merchant_id` vào UI. `Store Module` của Medusa không tự cô lập orders/customers/payment.
- **Storefront Router**: tại `<slug>.motngum.cafe` hoặc custom domain; lookup domain->tenant ở Control Plane, fail closed nếu domain chưa verify, không lấy tenant ID từ client. Kiểm tra alias/wildcard và existing DNS. Mẫu `vercel/platforms` rất hữu ích về ý tưởng routing nhưng repo hiện **không có tệp LICENSE ở root**, nên KHÔNG sao chép mã nếu chưa xác minh giấy phép cho phép.
- **CMS/site builder**: `payloadcms/payload` (MIT) và mẫu website của Payload, nhưng phải quyết định kiến trúc isolation, nơi lưu page revisions, media, tenant access và ranh giới SEO. Tránh dùng Payload Ecommerce engine làm nguồn order thứ hai.
- **Conversations**: Chatwoot triển khai riêng; quyền hỗ trợ/Inbox theo từng shop, API external IDs, webhook, tối thiểu hóa PII.
- **Automation**: Medusa Workflows hoặc custom event-rules executor cho tính năng workflow merchant tự cấu hình. n8n Community chỉ cho nội bộ tổ chức vận hành; nếu merchant tự tùy biến logic bằng n8n, phải có giấy phép thương mại thích hợp, https://support.n8n.io/article/can-i-use-your-license-for-my-use-case.
- **Infra**: Vercel frontend và control plane nếu có gói thương mại; host backend Medusa API + persistent worker tách, database Postgres và Redis, media object storage, Cloudflare DNS/security.
- **Không gom code thủ công của nhiều framework thành một runtime**. Import starter được cấp phép, dùng API/contracts/adapters và module boundaries.

## 1. Các thiếu sót theo mức độ, cách sửa và điều kiện nghiệm thu

### BLOCKER: BẮT BUỘC GIẢI QUYẾT TRƯỚC KHI TẠO TENANT THẬT
- B01 SaaS/one-store ambiguity: chốt đây là SaaS multi-merchant; phân biệt control plane và merchant plane. GATE: hai merchant có domain+DB+auth riêng.
- B02 Tenant isolation: DB, secrets, file storage, queue namespace, cache, logs, jobs, webhooks, connections; authorization server-side. GATE: merchant A không thể đọc hoặc sửa tài nguyên B bằng API, URL, ID đoán được, token, file URL hoặc webhook.
- B03 Merchant lifecycle/provisioning: register -> verify -> create org -> choose plan -> resource creation -> seed defaults -> ready -> suspension -> closure -> deletion/export. GATE: rollback provisioning giữa chừng không tạo orphan resources.
- B04 Two distinct payment systems: **merchant->platform subscription** vs **buyer->merchant retail**; tránh nhập chung ledger/payment provider. GATE: thanh toán thuê bao không bị nhầm là order bán hàng, merchant direct settlement không nhập vào ví platform nếu không được phép.
- B05 Billing/metering: trial, plan, renewal, grace, proration, failed payments, limits by staff/locations/channels, invoices and usage accounting; mỗi quota enforce trên server. GATE: vượt quota hoặc hết gói chặn đúng thao tác ghi nhưng bảo toàn quyền truy xuất dữ liệu hợp lệ.
- B06 Licensing: Medusa/Payload/Next SaaS MIT; Chatwoot enterprise riêng; n8n Sustainable Use License; `vercel/platforms` không tìm thấy LICENSE ở root, cần xác minh hoặc chỉ tham khảo ý tưởng; B2B starter MIT nhưng phải kiểm tra tương thích version.
- B07 Vercel Hobby plan: tài khoản kết nối là Hobby, chỉ dùng phi thương mại theo https://vercel.com/legal/terms (19/10/2026). GATE: trước khi mở SaaS thương mại chọn gói/host hợp lệ, có hạn mức và ngân sách.
- B08 Existing deployment ownership: `motngum-cafe` project phục vụ apex, www và các subdomain khác, cùng Git repo ảnh hưởng dự án HSK. GATE: không xóa repo cũ hoặc project Vercel cho đến khi các subdomain không thuộc phạm vi đã được tách và xác nhận không còn dependencies.

### HIGH: TOÀN BỘ LUỒNG NGHIỆP VỤ PHẢI THẬT, KHÔNG DÙNG MOCK
- H01 Website Builder: theme presets, pages/blocks, header/footer, menu, blog, media, draft/publish/preview, responsive, SEO metadata, canonical, sitemap, robots, 301 redirects. Không nhầm headless storefront starter với website builder.
- H02 Domain Lifecycle: slug reserve, blacklist collision with `hsk`, `ktsthaiduc`, `www`, `mail`, tenant subdomain, custom domain DNS challenge, certificate, status and transfer; DNS wildcard must not override exact existing records.
- H03 Platform IAM: platform super admin/operator/support vs merchant owner/manager/staff vs shopper. Invite, revoke, role scopes shop/location/channel, session revoke, MFA, staff audit. Account linkage via verified authorization.
- H04 Catalog advanced: variants, batch/expiry, UOM, bundle BOM, stock kit, localization, selling channel visibility, scheduled publication, B2B pricing. For each feature mark CORE / PLUGIN / CUSTOM, not claim supported by Medusa by default.
- H05 Stock and cost: rely on Medusa native inventory/reservation semantics first; **do not subtract reserved quantity twice**. Separate physical on-hand, reserved, available to promise, in-transit, safety buffer, returns inspection and costing. Transaction/reconciliation tests.
- H06 POS: hardware barcode/receipt/scales if needed, cashier shift, split tender, cash/debt, in-store returns, multi-location, interrupted-network handling, sync receipts without duplicate orders. Existing POS plugin must pass license/API version review; do not directly share SQL.
- H07 Order/payment lifecycle: cart -> draft/confirmed -> authorized/paid/partially paid/COD -> ship -> deliver -> return/refund; deposit rules, expiry, taxes, discounts, shipping splits, provider fees. Webhooks signed/replay-safe, provider polling when needed. QR generation alone never marks paid.
- H08 Vietnam shipping network: provider integration requirements, rate quotes, AWB, split parcels, multiple fulfillment centers, lost/damaged, RTO, COD reconciliation, non-standard tracking statuses, fallback.
- H09 Marketplace: OAuth approval, per-merchant account credentials, SKU/variant mapping, source-of-truth conflict policy, listing differences, order import, cancel/return, fee settlement, API rate-limits, retries, dead-letter and reconciliation. Do not claim Shopee/Zalo/TikTok integrations until credentials and official API approval are verified.
- H10 Social commerce: Chatwoot inbox is NOT an automated livestream comment-to-order system. Need comment parsing, anti-duplicate, campaign pricing, checkout customer consent, assignment and after-sales flow; platform-policy gates.
- H11 Customer/CRM: normalize channel identities, contact merge with confidence/consent, address book, VIP/RFM, loyalty points append-only ledger, expiry, redemptions/refunds, opt-in/out, consent/marketing suppression.
- H12 Marketing: email/SMS/Zalo/Meta sender permissions, message templates, regional policy, automation state machine and campaign attribution. Native workflow editor merchant-facing needs licensed alternative/custom builder.
- H13 Finance and tax: price tax-inclusive/exclusive, VAT, e-invoice integration, cost allocation, refund proration, append-only payment journal, COD/PSP fee reconciliation, reporting definitions (GMV/net revenue/profit); no unconditional ERPNext bidirectional write.
- H14 B2B: company member roles, approvals, price tiers, quote changes, credit terms and purchase orders; import Medusa B2B starter selectively, not as second engine.
- H15 App ecosystem: third-party developer app IDs, scopes, OAuth install/uninstall, version compatibility, webhooks signing, token rotation, platform review, billing per app, kill switch and tenant boundaries; do not call it an App Store without installation/security lifecycle.
- H16 Audit/reporting: immutable change log for stock, refunds, price, roles, domain, billing; event read models, export/API, dashboards; analytics must reconcile with canonical ledger, not only pageview counts.
- H17 Operational tooling: support console, impersonation with consent and logs, troubleshooting event trace, webhook replay/DLQ, failed sync inbox, per-tenant limits, shutdown/incident tools.
- H18 Docs + merchant onboarding: help center, API/docs portal, examples, training and admin settings; users need self-service setup, not only a developer README.
- H19 Search & localization: search indexing, facets, Vietnamese accents, non-latin slugs, multi-language/currency display, actual PSP settlement currency support, cache invalidation.
- H20 Data lifecycle and exports: customer request access/correct/delete, consent changes, tenant export, import tool, subscriptions cancellation, retention and legal hold, audit evidence.
- H21 AI: scope and permissions to customer data, human handoff, cost quotas, safe automation and traceability; no invented ‘AI available’ checkmark without integration and evaluations.

### NONFUNCTIONAL/LEGAL/OPERATIONS — RELEASE-BLOCKING
- N01 Personal data law 91/2025/QH15 effective 01/01/2026, https://www.bocongan.gov.vn/bai-viet/luat-bao-ve-du-lieu-ca-nhan-chinh-thuc-co-hieu-luc-thi-hanh-tu-ngay-01-01-2026-1767186124. Map controller/processor roles, notices, consent, retention, access/deletion, transfers and security incident procedures; request legal review.
- N02 E-commerce law 122/2025/QH15 effective 01/07/2026, and implementing decree; classify SaaS website builder vs direct-selling / intermediary marketplace carefully before declaring registration/notification obligations. Source https://www.idea.gov.vn/ (notice 14/10/2026). From 01/01/2027 identify applicability of seller/live-seller ID verification to intermediary platforms. Request legal review.
- N03 Security: MFA, privileged support/tenant access, password hash, encryption in transit/rest, payment tokenization, PCI scope, signed URLs, SSRF protections for custom-webhook URLs, CSRF/XSS, CSP, rate limit, bot checks, secrets rotation.
- N04 Operational reliability: SLO and owner, error budget, structured logs/trace IDs, per-tenant monitoring, slow query alerts, queue depth, audit log retention, DLQ operations, automated data correction workflow.
- N05 Restore/recovery: define RPO/RTO, encrypted automatic backup, tested restore, schema migration rollback/forward, payment-provider reconciliation on recovery. User wants old website removed; backup here means **NEW PLATFORM transaction protection only**, not archiving old website.
- N06 Cost/capacity: price per merchant instance/DB/queue/worker/storage, 1/10/100 tenant stress profiles, billing break-even, provider pricing/egress cost and protection against noisy neighbors.
- N07 QA environment: staging credential separation, seeded demo merchant accounts with NO production/default passwords, contract tests, branch protection, dependency SBOM/license scan, CI/CD gates.
- N08 Subdomain cutover: test new hostname before attaching apex, verify SSL/MX/TXT unchanged, detach `motngum.cafe` and `www` from root project only after new release passes; old project deletion after other domains migrate. Preserve `hsk`, `ktsthaiduc`, `mail` and unscoped domains. Document DNS TTL and routing tests.
- N09 Real user acceptance: merchant creates shop, staff member registers, buyer pays, shipping and refund works; no demo-state-only screenshots or hardcoded order paths.
- N10 Contract & content: templates/plugins license attribution, intellectual property of logos/theme assets, payment provider contracts, user terms, privacy, merchant liability boundary, deletion/offboarding policy.

## 2. Repo reuse map, with explicit DON'T MIX
| Capability | Reuse | Status |
|---|---|---|
| Core store, checkout, catalog, order and inventory | medusajs/dtc-starter | Confirmed upstream MIT; baseline |
| B2B modules | medusajs/b2b-starter | MIT; selective port only, compatibility gate |
| SaaS Control Plane landing, org/team RBAC, subscription starter | nextjs/saas-starter | MIT; hardcoded sample admin account in README seed: NEVER use unchanged |
| Tenant hostname router | vercel/platforms | Reference design only until license verified; no LICENSE root on 2026-10-29 |
| CMS/page editor and SEO | payloadcms/payload official website template | MIT; avoid second product/order system |
| Customer support inbox | chatwoot/chatwoot | MIT core, proprietary Enterprise directory |
| Internal automation | n8n-io/n8n | Internal-only unless licensed; buyer/merchant workflow builder must not rely on Community |
| POS | TBD licensed Medusa compatible POS | Not verified; do not claim ready |
| Shopee/Lazada/TikTok/Zalo | Official API adapters (per account entitlement) | Not available out of box |
| VN PSP / e-invoice / shipping | Official provider SDK/API adapters | Not available out of box |
| Staff IAM | reuse compatible libraries + additional scopes | Control-plane IAM != Medusa admin user != storefront shopper |

## 3. Route and storage boundaries
- `motngum.cafe`: marketing, price table, register, docs and status.
- `app.motngum.cafe`: SaaS Control Plane merchant administration, own PostgreSQL DB.
- `<shop>.motngum.cafe`: merchant storefront after verified slug.
- `<shop custom domain>`: merchant storefront after domain verification and certificate issuance.
- Merchant backend API: authenticated backend service provisioned for each merchant in initial architecture, independent credentials/DB/queue. API routes must not leak tenant internals.
- `platform-admin` is internal only with SSO/MFA; `merchant-admin` is tenant-scoped; `shopper` is store customer.
- Separate storage: Medusa tenant DB, platform DB, Chatwoot DB, automation DB, Redis/cache namespaces, buckets with access controls. No cross-DB SQL joins across trust boundaries.
- Existing `hsk.motngum.cafe`, `ktsthaiduc.motngum.cafe`, `mail.motngum.cafe` must remain unchanged; assess other domain associations before deletion.

## 4. Corrected release phase order
**G0** Inventory live infrastructure + choose SaaS definition + tenant isolation strategy + licensing/payment/legal feasibility + cost forecast. No destructive operations.
**G1** Control Plane: merchant register/verify, organization, plans, quotas, provisioning worker, cleanup on failure, tenant domain mapping and 2 separated merchant accounts.
**G2** Commerce Plane: pinned Medusa backend per merchant, separate databases, use official DTC storefront and admin, e2e order with sandbox payments.
**G3** Storefront platform: Payload-based CMS/theme/config with tenant isolation, custom domain, SSL, SEO route; SKU/product read-only render from Medusa.
**G4** Inventory/POS/fulfillment: native reservations and complex stock, cashier branch, returns and official shipping adapter; reconciliation gates.
**G5** VN payments/settlements/taxes & platform subscription billing; signatures, currency, COD, partial pay, refunds; dual ledger and provider reconciliation.
**G6** CRM/social/marketplaces with Chatwoot, connector certification, stock order dedup, replay support.
**G7** Marketing/loyalty/B2B/workflow/self-service application platform and reporting, enforce plan limits.
**G8** End-to-end, chaos/security, legal checks, recovery drills, cost/load SLO, domain cutover; then decommission only old apex project resources after isolating other subdomains.

Gating rule: do not call a module **Done** because it renders; it must have API, DB effects, tests, permissions, error flows, provider sandbox proof, logs and operator recovery path. Live real-money use also needs PSP agreements, legal classification and controls.

## 5. Must-pass end-to-end acceptance scenarios
1. Merchant A creates tenant and domain; Merchant B cannot query/alter A resources through URL, signed media, order ID or APIs.
2. A adds staff with limited branch permissions; forbidden action is 403 server-side; role changes invalidate prior auth.
3. A publishes a Payload page, edits product in Medusa, search/index refreshes and correct storefront domain reflects inventory/price only for A.
4. Two simultaneous buyers compete for last unit; at most one completes reservation; refund/expiry replenishes correctly.
5. Payment webhooks out of order, duplicate or delayed never mark unrelated tenant as paid and never charge twice.
6. COD partially returns; provider COD settlements/fees/order discounts align with finance ledger.
7. Facebook/Shop order arrives twice; maps to one canonical order with stable external ID; no double decrement.
8. Shipping provider fails; retry and manual replay do not create duplicate labels or AWBs.
9. Loyalty redeemed then order refunded; points and liability are corrected in ledger.
10. SaaS subscription expires while customer has paid pending orders; read/refund/support policies remain safe, no data loss.
11. Shop custom domain verification fails; no tenant takeover by changing Host header, stale DNS or cache.
12. Recreate infrastructure from GitHub + env secret store and restore a NEW platform tenant DB within documented RTO/RPO.
13. HSK, architecture portfolio and mail/DNS subdomains stay reachable during and after apex change.
14. App uninstall revokes tokens and webhook permissions; access to formerly authorized customer data ceases.
15. Customer personal-data request and marketing opt-out are executed across commerce, Chatwoot, automation and analytics per applicable requirements.

## 6. Clarified status at audit time
Inspection and architecture review: performed. Code imports, control plane, tenant provisioning, production DB and backend are **NOT BUILT**. No Vercel/Cloudflare production mutation; no old project deletion. This document is a corrected planning artifact, not proof of feature completion.
