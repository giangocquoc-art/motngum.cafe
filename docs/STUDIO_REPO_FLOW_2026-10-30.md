# Motngum Studio — dependency-driven integration flow (foundation-first)

This is the code-level counterpart of the Vietnamese architecture illustration. All changes occur on PR #11 (Draft); **no Vercel deployment, production DNS change, payment launch, or main-branch merge**.

## Canonical architecture

\`\`\`mermaid
flowchart TD
  A["Next.js SaaS control plane / tenant session"] --> B["SiteDocument v2 + validateSiteDocument"]
  C["Puck UI v0.24.0 (experimental route)"] --> D["Strict v2 ↔ Puck adapter"]
  D --> B
  E["MIT design components / repo templates"] --> F["Component + template normalization"]
  F --> B
  B --> G["Team-scoped drafts + revision CAS / PostgreSQL"]
  G --> H["Publish verified snapshot"]
  B --> I["One shared React block renderer"]
  H --> I
  I --> J["Editor preview / draft preview / public site"]
  K["Storage adapter (future)"] --> B
  L["Medusa commerce (future)"] -. "only after tenant boundaries and checkout tests" .-> B
\`\`\`

**Never** run different template repos as separate production apps or create another public-site renderer.

## Repo/component mapping

| Original repo / service | Purpose | Contract / insertion point | Stage |
| --- | --- | --- | --- |
| \`giangocquoc-art/motngum.cafe\` | Owns auth, team access, site API, renderer, tests | \`commerce-platform/control-plane\` | In use |
| \`puckeditor/puck\` — \`@puckeditor/core\` | Editing controls, canvas and drag/drop | \`lib/builder/puck-adapter.ts\`, \`puck-fields.ts\`, `components/studio-puck-client.tsx`, `/dashboard/sites/[siteId]/puck` | **Runtime installed, parallel editor (Draft)** |
| \`shadcn-ui/ui\` | Base UI primitives | Adapt into \`components/site-blocks\`; never store shadcn internals as site data | Candidate |
| \`magicuidesign/magicui\` | Motion, decorative sections | Adapt and make effects accessibility-safe, lazy and optional | Candidate |
| \`StartBootstrap/startbootstrap-agency\`, \`-creative\`, \`-freelancer\` | MIT layout patterns and sections | Convert designs into internal editable templates; audit asset licenses | Candidate |
| \`magicuidesign/portfolio\` | Portfolio layouts | Convert reusable sections and project displays | Candidate |
| \`medusajs/medusa\` / \`medusajs/dtc-starter\` | Independent commerce engine | Server-to-server tenant connector and secure signed order flows | Deferred |
| Cloudflare R2 | Object media storage | Provider-neutral signed media adapter and quotas | Deferred; not enabled |
| Playwright | Browser/device acceptance | \`test/browser-builder.mjs\` + staged future screenshot/touch tests | In use |
| Drizzle ORM + PostgreSQL | Site persistence, versions and publish snapshot | \`lib/db/schema.ts\`, migration 0003 | In use |

## Gate C: reversible Puck integration — precise conditions

1. **C1 — adapter (this PR):** all existing 24 seeds and 16 × 8 × 8 combinations round-trip without lost IDs, ordering, titles, slugs, Unicode, content, images, CTA URLs or themes. Reject custom Puck components, root data and nested zones until v3 can store them.
2. **C2 — package install:** select an exact tested \`@puckeditor/core\` version (0.23 and 0.24 have different API/release notes). Update \`package.json\` **and** \`pnpm-lock.yaml\` together, verify Next/React compatibility in CI.
3. **C3 — editor UI:** add a parallel guarded \`/studio-puck\` route for authorized teams; use adapter for one page at a time and preserve other pages. Reuse \`components/site-block.tsx\` as the sole renderer.
4. **C4 — save/publish:** Puck onChange must use existing debounced CAS update; Puck Publish must call existing owner-only backend publish endpoint only *after* a successful draft save. Handle 409 by freezing auto-retry and preserving local user work.
5. **C5 — accept:** Playwright smoke, keyboard/touch, editor-vs-public screenshots, lost connection and 409, draft restoration, limits and anti-XSS; keep old editor as rollback until all pass.

Do not silently import Puck's zones or arbitrary custom props into v2. A future nested-layout feature requires explicit SiteDocument v3 migration and tests.

## Next optional modules and gates

- **D — templates:** import 3 representative templates first (business, portfolio, commerce showcase), audit licenses/images, normalize each into block data and compare desktop/mobile screenshots. Avoid counting palette swaps as distinct designs.
- **E1 — media:** create storage adapter interface before selecting/enabling a provider; add content-type sniffing, private staging upload, quotas, image size limits, references and deletion lifecycle.
- **E2 — forms:** schema, spam control, opt-in, server-side storage, consent and notification. Never show dummy contact forms as active.
- **E3 — domain/SEO:** verified DNS ownership, TLS, draft noindex, published sitemap, canonical, metadata, cache invalidation.
- **E4 — commerce:** separate checkout gate with Medusa and provider-specific security reviews, never enabled on a staging-only builder.
- **E5 — operations:** backups/recovery drills, error tracking, audit trail, rate limiting, retention and stable dependency upgrade plan.

Source repository migration decision: \`puckeditor/puck\` is the canonical repository; references to \`measuredco/puck\` in the image are historical.

## Gate C2 — implemented experimental runtime (2026-10-30)
- Dependency `@puckeditor/core` is pinned to **0.24.0** in both `package.json` and `pnpm-lock.yaml`; the lock was generated using GitHub CI and the temporary write-enabled workflow was removed after use.
- Tenant-checked server route: `commerce-platform/control-plane/app/(dashboard)/dashboard/sites/[siteId]/puck/page.tsx`.
- Client: `components/studio-puck-client.tsx` with 1600ms debounce, serial revision-CAS save, 409 fail-stop, local JSON export, guarded owner-only publish after successful save, page switching without overwriting other pages, and a link back to the native editor.
- 16 component definitions: `components/studio-puck-config.tsx` wraps the existing `BlockPreview`, not a second renderer.
- Adapter accepts only Puck's synthetic `root.props.id=\`root\`` as metadata. Any other custom root fields or zones are rejected until a deliberate v3 migration.
- CI includes `test/browser-puck.mjs` using real Chromium + disposable PostgreSQL + cross-tenant access checks.
- **Not complete:** default-editor cutover, real-device touch, screenshot visual regression, lost-connection repair, and full accessibility audit. Do not enable production.
