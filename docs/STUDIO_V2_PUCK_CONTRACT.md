# Motngum Studio — SiteDocument v2 contract (Puck migration precondition)

This is the canonical interchange format for Motngum Studio's native editor, API, PostgreSQL drafts/revisions, public renderer and the future Puck adapter. **Puck's own Data JSON is not yet used for persistence.**

## Canonical source of truth

- TypeScript interfaces: \`lib/builder/catalog.ts\`: \`SiteDocument\`, \`SitePage\`, \`Block\`, \`BlockKind\`, \`BlockVariant\`, \`ThemeId\`.
- Validation: **only** \`lib/builder/validation.ts:validateSiteDocument()\`. Never implement a separate browser-only validator.
- Stable version discriminator: \`document.version === 2\`. Other values return a validation error, never silently reinterpret data.
- Runtime: one site document per tenant site, containing ordered pages and ordered blocks. Editing produces a new validated draft revision; publishing creates a separate validated snapshot.

## Schema

\`\`\`ts
type SiteDocument = {
  version: 2; title: string; themeId: ThemeId;
  pages: Array<{
    id: string; title: string; slug: string;
    blocks: Array<{
      id: string; kind: BlockKind; variant: BlockVariant;
      title: string; body: string; imageUrl: string;
      buttonLabel: string; buttonUrl: string; accent: string;
    }>;
  }>;
};
\`\`\`

Invariants:
- Title must not be empty/whitespace-only, max 120 characters.
- 1–12 pages; unique page ids and unique lowercase hyphenated page slugs (max 60 chars).
- 0–40 blocks/page and max 200/site; block IDs unique **across the site**, not just per page.
- All kinds, variants and themes are registered, not arbitrary user-provided React component names.
- Images: empty or HTTPS absolute URLs with no embedded credentials. Links: empty, whitelisted page/anchor references, HTTP or HTTPS absolute URLs with no embedded credentials.
- Accent: \`#RRGGBB\` hex. Text and string-length limits enforced at API boundary. Avoid treating custom text as HTML/JS.
- Publish additionally checks unresolved \`#page:slug\` links and identified placeholder/testimonial statistics. Publication validation is stricter than draft validation.
- Editing a page slug must rewrite all references in all pages; deleting a referenced page should ask for a replacement target in the editor.

## Round-trip requirements for Puck

1. Read and validate v2 JSON. Do not modify the live revision.
2. Convert each page into a Puck page **in memory**. Use registered \`block.kind\` as Puck type and preserve \`block.id\`, all props, page ID, page slug, position, theme and user copy.
3. Reconstitute a v2 \`SiteDocument\` from all Puck pages and run canonical validation again. Reject unrecognized types or incomplete blocks; never drop them silently.
4. Test \`decode(encode(document))\` against all 16 kinds, 8 variants, 8 themes, multiple pages, internal links, nested and Unicode text. The round trip must preserve stable IDs, ordering and semantics.
5. Only change the persisted discriminator to v3 after migrations, rollback and compatibility tests are complete. Existing v1 local drafts migrate to v2 first.
6. The public renderer must always use the same component registry and design tokens as the editor; Puck is an editing UI, not a second frontend renderer.
7. API revision-version CAS and team scope remain authoritative regardless of the editor implementation.

## Gates already implemented

- Real HTTP + disposable PostgreSQL lifecycle/ownership tests: \`test/builder-site-e2e.mjs\` includes malformed and unsafe v2 documents.
- Real Chromium editor behavior with isolated mocked API: \`test/browser-builder.mjs\` covers undo/redo, drag/drop, theme, autosave failure/retry, and local draft protection.
- Both suites run via \`.github/workflows/commerce-saas-ci.yml\`. Chromium's mocked API does **not** replace real backend or multi-tenant tests.

## Required before Puck rollout

- Implement and test actual reversible Puck adapters (not yet written).
- Browser tests for 409 simultaneous edit conflict, keyboard accessibility, mobile/touch, template switch/cancel, page rename/delete link handling.
- Browser visual regression between editor/preview/published pages across breakpoints.
- Recovery test when the browser closes unexpectedly during unsaved cloud draft edits.
- Keep PR Draft and do not deploy to Vercel until acceptance explicitly changes.
