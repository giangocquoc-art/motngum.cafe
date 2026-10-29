# Motngum Visual Builder — recovery handoff (2026-10-29)

## Background and scope
The previous ChatGPT thread about a drag-and-drop website builder is not itself available as an authoritative specification. The current repository's Commerce records only identify Puck + Payload as **candidates**, with no deployed visual builder or CMS. This handoff rebuilds a small independently testable starting point rather than claiming the earlier design is complete.

**Repository:** giangocquoc-art/motngum.cafe
**Base branch:** commerce-rebuild-2026-10
**Implementation branch:** feature/visual-builder-recovery-20261029
**App root:** commerce-platform/control-plane
**Route (preview only):** /builder-demo
**Vercel project:** motngum-commerce-saas-staging
**Current production apex / DNS:** unchanged

## Implemented — local-only interactive prototype
1. Five blocks: Hero, features, text, image, CTA.
2. Drag blocks from palette into an insertion zone; drag/reorder blocks already on the canvas.
3. Accessible up/down controls for users not dragging; remove block.
4. Select block to edit content, highlight color, image URL and CTA label/link; edit site title.
5. Desktop/mobile viewport toggle and read-only preview.
6. Automatic same-browser localStorage draft, export/import versioned JSON.
7. Import guard: version = 1; maximum 30 blocks, 128 KB JSON, bounded fields, duplicate ID rejection, whitelisted block kinds and hex color.
8. External link URLs limited to HTTP(S), hash anchors limited to safe pattern. Image preview uses URL validation. No arbitrary HTML is rendered.

## Security and product boundaries
- This is a PUBLIC demo route on *staging preview only*. It does not write to PostgreSQL, D1, R2 or Medusa, does not process payment, publish a site, provision a merchant, manage domains or upload assets.
- LocalStorage is limited to the browser. Never present it as cloud persistence or as shared organization data.
- Imported JSON is untrusted; only validated typed values enter React render. No dangerouslySetInnerHTML or arbitrary JS/CSS.
- Cloud images may contact third-party image hosts; no uploaded image storage yet.
- Never attach this preview to motngum.cafe until auth, tenancy, publishing and browser E2E pass.
- Do not alter HSK, mail, other domains or the legacy main branch.

## CI fix
The existing commerce-saas-ci.yml had a hard-coded actions/checkout ref, meaning a PR could pass by compiling the base branch rather than the proposed change. The recovery branch removes that override and adds an HTTP 200 smoke for /builder-demo. PR CI must prove TypeScript, Next production build and endpoint renders on the actual PR tree.

## Acceptance tests (staging browser)
- Add five different blocks and verify insertion order before/after another block.
- Drag an existing block from the end to the start; test up/down as keyboard-accessible alternative.
- Edit a CTA title/link and theme color; switch desktop/mobile; preview must reflect edits.
- Reload browser and verify local draft remains.
- Export JSON, reset template, import JSON and verify restoration.
- Import invalid JSON, duplicate IDs, unknown block kind, javascript: links; reject invalid documents or render links inert.
- Test 30-block cap, iPhone/desktop viewport and no horizontal overflow.
- Confirm no HTTP server mutation occurs from editing, imported assets or save.
- Confirm unauthenticated /dashboard is still redirected and /api/team returns 401.

## Next increments
**B1 — Production-grade editor:** Adopt measured/Puck with authored component config and a versioned schema migration, preview and component restrictions. Keep all page content as structured data rather than executable HTML. Use upstream OSS and pin dependency versions.

**B2 — Cloud persistence + organization scopes:** Authenticated API storing site/page revisions in PostgreSQL with organizationId and audit trail, optimistic concurrency, autosave and rollback; roles owner/editor/viewer, RBAC and two-tenant isolation E2E.

**B3 — Media and publishing:** R2 media asset ingestion via signed server APIs with validation and quotas. Staged preview, publish/unpublish immutable revisions; custom domain ownership verification, CDN routing, SEO meta/sitemap. Never route an arbitrary tenant domain until ownership confirmed.

**B4 — Commerce integration:** Resolve verified merchant+domain and render products as read-only components from Medusa; checkout server-side from a request-scoped tenant SDK; payment only after verified PSP webhook.

Current verdict: editor code is committed in an isolated branch, **NOT production-ready**. CI and browser acceptance evidence must be reviewed separately.
