# Motngum Studio — staged integration handoff (2026-10-30)

## Scope
- Repository: giangocquoc-art/motngum.cafe
- Base branch: commerce-rebuild-2026-10. PR #11 remains draft.
- Feature branch: feature/visual-builder-recovery-20261029.
- Next.js app root: commerce-platform/control-plane.
- No main/apex production deployment, DNS change, merchant order or payment.

## Implemented
1. Catalog: 24 templates across six sectors and eight themes (lib/builder/catalog.ts). Every template provides three editable pages.
2. Editor: /builder-demo — 16 blocks, drag reorder, desktop/mobile/tablet preview, multi-page nav, import/export v2 JSON, v1 local draft migration, undo/redo.
3. Website manager: /dashboard/sites — choose a template, create a tenant-owned site, list/open websites and restore historical drafts.
4. Cloud persistence: /api/sites GET/POST and /api/sites/[siteId] GET/PATCH use the existing signed session and membership. Every read/write filters on teamId. PATCH performs an atomic draftVersion compare-and-swap and records a revision.
5. Private draft preview: /dashboard/sites/[siteId]/preview requires the correct account and organization.
6. Stage publish: /api/sites/[siteId]/publish is owner-only. Validated immutable snapshots become accessible at /s/[siteSlug] and /s/[siteSlug]/[pageSlug]. Middleware pre-checks publication and yields HTTP 404 for invalid/unpublished pages.
7. Recovery: /api/sites/[siteId]/revisions, /restore and /unpublish allow version inspection, copy-from-history into a new draft revision and public snapshot withdrawal. Publishing does not overwrite historical drafts.
8. Validation: maximum payload/pages/blocks; validated external URLs; no arbitrary HTML; duplicate IDs and duplicate page slugs denied. Known mock stats/testimonials, contact placeholders and broken internal links block publish. Public staging renderer has noindex.
9. PostgreSQL: tables builder_sites and builder_site_revisions. Migration 0003_builder_sites.sql, matching Drizzle journal and 0003_snapshot.json.

## CI acceptance
- GitHub workflow .github/workflows/commerce-saas-ci.yml: TypeScript, Next production build, disposable PostgreSQL migration and existing security tests.
- HTTP smoke: /api/sites unauthenticated 401 and /s/never-published HTTP 404.
- Test test/builder-site-e2e.mjs: real HTTP and DB with two isolated organizations, CSRF, create/load/update, concurrent version conflicts, public snapshot stability, fake-content gate, revision restore and unpublish.

## Not completed / must remain staging
- Puck is NOT installed. Existing editor is a native React prototype. Next gate: install pinned Puck core and versioned document mapping onto the now-shared block renderer in components/site-block.tsx.
- No managed media uploads. The connected Cloudflare R2 account currently requires enabling R2. Existing external images are placeholders.
- Cloud autosave is DEBOUNCED (1600 ms) and serialized; save errors/conflicts pause retries until a manual action. Browser leave warning protects unsaved cloud edits. Failed cloud loads are read-only. Cloud documents must not persist in a shared localStorage key.
- No verified domain routing, user-generated subdomain provisioning, real contact/newsletter forms, advanced SEO, analytics or billing.
- No Medusa backend runtime/merchant checkout or PSP confirmation. Commerce skeleton must remain isolated.
- Playwright real Chromium tests now cover editor drag/drop, undo/redo, theme, autosave, mocked network failure, stale version conflict, basic mobile viewport and failed cloud load. These use mocked cloud APIs; real HTTP/PostgreSQL tenant checks remain separate. Mobile touch gestures, page links, template modal, accessibility and screenshot parity still need E2E.
- Template stats, sample reviews and photo licenses require checking before production use.
- SaaS registration remains disabled. Production release needs secure user onboarding, supported stable Next.js, domain/hosting terms and operations.
- Latest Vercel preview may lag GitHub commits due to deployment quota; do not claim the final commit is live without verifying its SHA.

## Subsequent gates
1. Puck migration on top of v2 schema with controlled components and preservation of drafts.
2. Template adapters for compatible MIT repositories (shadcn/ui, Magic UI, Start Bootstrap, Magic UI Portfolio).
3. Media storage provider adapter with safe uploads/quotas, then public publishing/domain verification and SEO.
4. Browser/device E2E and observability, followed by request-scoped Medusa connectivity and verified test checkout.

Keep PR #11 draft. Do not touch other site projects, domains, production DNS or payment settings.

## Foundation stabilization (2026-10-30)
- Single shared renderer and design tokens for editor + published page: `components/site-block.tsx`.
- Cloud-load failure locks editing rather than falling back to default content and overwriting standalone localStorage drafts.
- Cloud autosave is debounced, serialized and fail-stops on errors; manual retry remains available.
- Transactionally enforced cap of 50 websites per organization.
- Public metadata+page data is deduplicated per request with React cache; separate pre-stream 404 gate remains for now.
- See `docs/STUDIO_FOUNDATION_GATES.md` for acceptance invariants and remaining browser tests.
- Vercel rollout intentionally deferred. Remain Draft regardless of CI status.

## Browser acceptance and Puck readiness (2026-10-30)
- `test/browser-builder.mjs` is run in GitHub Actions with Playwright Chromium pinned to `1.56.1`, installed in an isolated CI `/tmp` directory; application package/lockfile remain unchanged. Browser E2E does not connect production accounts.
- `test/builder-site-e2e.mjs` also rejects nine malformed/unsafe JSON v2 documents at the real API boundary.
- Editor imports `lib/builder/validation.ts:validateSiteDocument` directly; the duplicate browser-only document validator was removed.
- `docs/STUDIO_V2_PUCK_CONTRACT.md` defines Puck round-trip, stable IDs, versioning and editor/renderer requirements. **Puck is not installed yet.**
- No Vercel deployment is planned at this stage.
