# Motngum Studio — foundation-first release gates

Decision (2026-10-30): **do not deploy to Vercel or change domain during foundation work.** This PR is draft, targets `commerce-rebuild-2026-10`, and must not modify `main`, production DNS or payment settings.

## Shared architecture contracts

1. **Tenant ownership:** every site belongs to one authorized team. Every edit/read/revision/publish/restore/unpublish operation checks team membership in the backend, never trusts a team ID supplied by the browser.
2. **Data contract:** v2 JSON is validated at API boundaries. A site has exactly one draft with integer version; revision history is append-only. Site create has a transactionally enforced cap of 50 sites per team.
3. **Save concurrency:** PATCH uses compare-and-swap `draftVersion`. No autosave or manual save may retry a 409 by overwriting the newer remote version.
4. **Cloud load safety:** an editor URL carrying `?site=<uuid>` must never fall back to an editable, auto-saved default template when cloud loading fails. The error state is read-only with explicit retry; standalone local drafts remain separate.
5. **Autosave:** debounced by 1600 ms after editing; one request in flight; if interrupted by later edits, preserve the dirty flag and save again after completion. Any network/conflict error blocks automatic retries until a deliberate manual retry.
6. **One renderer:** `components/site-block.tsx` owns all 16 block implementations and all variants for both the editor and published pages. `studioColors()` defines the same tokens for both. Public route uses real navigation URLs while editor uses canvas navigation.
7. **Publish isolation:** draft and published JSON are independent snapshots. Only the owner can publish/unpublish; broken internal links and known template placeholder content block publication.
8. **Public routing:** unpublished/missing routes must return an actual HTTP 404, not an HTML 404 with HTTP 200. Public staging pages are `noindex`.
9. **Runtime:** Node.js + PostgreSQL and the existing Next.js control plane; do not add a second CMS/database/editor while these contracts are being validated.

## Automated evidence and further verification

The existing GitHub Actions workflow is the minimum gate:
- TypeScript and production build
- Drizzle migration against disposable PostgreSQL
- Signed-session and tenant separation tests
- HTTP lifecycle: create/load/edit/CAS, publish, unchanged old snapshot, restore and unpublish
- Public full hero image layout, accessible CTA foreground, working internal links
- Organization site-count quota

**Still required before promoting to ready for user acceptance:**
- **Implemented:** real Chromium Playwright checks for draft hydration, undo/redo, drag/drop, theme selection, autosave failure/retry, stale revision rejection, mobile viewport and cloud-load protection. Tests use an isolated mocked API; real PostgreSQL + auth remain covered by separate HTTP tests.
- **Still needed:** browser checks for page link/rename/delete flows, template switch/cancel, keyboard controls, accessibility and all interactive dialogs.
- **Covered:** mocked network failure, conflicting revision and failed cloud load. **Still needed:** expired JWT and crash/close-before-save recovery using browser test fixtures.
- Screenshot comparison of editor preview and public page across desktop/tablet/mobile.
- Migrate editor to pinned Puck core with v2 data migration and a shared component registry.
- Media upload adapter, quotas/storage plan, verified asset licenses, functional forms and SEO/domain workflows.
- Load test and cache/publication invalidation; verify cross-tenant access under concurrent requests.
- Stable maintained Next.js release and hosting with acceptable commercial terms before production.

## Repositories policy
Use code from the existing SaaS starter, Puck, compatible MIT template sources, and Medusa where applicable. Each third-party component must be normalized to one versioned site schema and one shared renderer. Do not run separate hosted CMS/storefront apps for individual visual themes. Pay attention to upstream licenses and image rights.

## Promotion policy
`Draft PR -> CI -> browser/device acceptance -> separate staging deploy -> production release review -> explicit production cutover`.
Staging deployment is postponed by project decision. Passing GitHub CI is not proof that the latest commit is running on Vercel.

## Gate B acceptance snapshot (2026-10-30)
- Browser E2E: `commerce-platform/control-plane/test/browser-builder.mjs`, Chromium Playwright pinned `1.56.1` installed only inside the ephemeral CI runner (`/tmp/motngum-browser`), **not** in the application dependency/lockfile. Includes no deployment.
- HTTP + DB E2E: `test/builder-site-e2e.mjs`, including nine malformed v2 documents and tenant isolation.
- Editor now imports server's canonical `validateSiteDocument`, with duplicate validator removed. See `docs/STUDIO_V2_PUCK_CONTRACT.md` for future Puck adapter requirements.
- These prove baseline behavior, NOT complete visual/mobile-touch user acceptance.
