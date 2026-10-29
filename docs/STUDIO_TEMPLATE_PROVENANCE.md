# Motngum Studio — curated template provenance, licenses and safe normalization

The three curated templates in this PR are **adaptations of identifiable open-source layout/component patterns**, not redistributed upstream demo websites. All user-edited content is a SiteDocument v2 block; no external template project, CMS or iframe is run per tenant. The same BlockPreview renders both Puck and public sites.

| Studio template | Verified upstream (MIT) | Precise adapted source | Result in Studio |
| --- | --- | --- | --- |
| Northstar — SaaS | https://github.com/shadcn-ui/ui | https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/new-york-v4/ui/card.tsx | Card / header / title / description composition as semantic feature cards; original source is MIT, UI rewritten as dependency-free v2 block markup |
| Orbit — Creative Lab | https://github.com/magicuidesign/magicui | https://github.com/magicuidesign/magicui/blob/main/apps/www/registry/magicui/border-beam.tsx | Border-beam visual principle rebuilt with native CSS, prefers-reduced-motion, no Motion runtime |
| Foundry — Agency | https://github.com/StartBootstrap/startbootstrap-agency | https://github.com/StartBootstrap/startbootstrap-agency/blob/master/src/scss/sections/_timeline.scss | Alternating numbered, responsive service timeline reimplemented with ordered-list semantics |

Original repositories and their MIT license files were checked on 2026-10-30. Retained copyright notices and MIT text are in docs/STUDIO_THIRD_PARTY_NOTICES.md.

**No upstream images, logos, typefaces, stock photography, marketing copy or brand assets were copied.** The section text is original, explicitly editable sample copy. Sample contact text is intentionally blocked by publishIssues() until replaced. No fake customer reviews, awards, partner names, analytics or revenue claims were put into curated templates.

## Architectural normalization

1. Source patterns are mapped to the already supported v2 kind/variant combinations, not foreign HTML: features/cards, features/banner and services/list. UI rendering is implemented in components/site-block.tsx; the lightweight CSS effect is components/studio-template-effects.css.
2. Three typed curated blueprints are in lib/builder/curated-templates.ts. catalog.ts exposes them alongside the original 24 seeds, now **27 templates**. These curated projects open the experimental Puck route; legacy seeds retain their old path.
3. One validator and v2↔Puck adapter govern all 27 templates. Nothing is persisted as raw untrusted markup or arbitrary React props.
4. Semantic layouts follow progressive enhancement, use existing Tailwind/container styles, honor reduced motion, and render even when CSS animation is disabled.
5. Publish verification rejects unfinished contact/sample blocks. Production release requires valid domain, asset-rights review, real contact details, and end-user acceptance.

## Verification and known limits

- Contract suite checks 27 template round-trips; three distinct source mappings, valid internal CTA routes, unique ids and the prohibition of fabricated statistics/testimonials.
- Browser acceptance checks actual public rendering, desktop/mobile screenshots, reduced motion, accessible semantics and theme parity against the Puck iframe.
- Screenshots are CI evidence for human review, **not approved pixel-perfect golden baselines** until a reviewer signs off. Device-specific touch gestures, all keyboard drag patterns and full commercial cutover remain separate gates.
- Puck and template integrations are intentionally isolated to Draft PR #11. Nothing is deployed to Vercel, main or production DNS.

## License notes

Each upstream is distributed under the MIT license; this does NOT grant ownership of independent external demo images/brand marks. The normalized design is fresh code using a small layout principle from those MIT-licensed resources. If copying any additional upstream files in the future, retain notices and audit every imported asset separately.
