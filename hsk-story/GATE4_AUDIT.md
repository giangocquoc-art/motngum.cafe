# GATE 4 — Audit / extraction review
Date: 2026-10-26. Branch `refactor/hsk-gate4-modular-shell`, stacked after PR #6. `main` / hsk.motngum.cafe production is left unchanged.

## What was actually done
1. **Source extraction preserving observable behavior**: move `tree`, `person`, `outline`, `sceneArt` functions from `app.js` into `scene-art.js`. Old call sites use `var sceneArt=HSKSceneArt.render`. SVG digests for street, school, class, canteen, exam, festival and graduation are locked to original production-branch output. Maintain fallback visuals until Codex art approved.
2. **Persistence module boundary**: `save-io.js` owns safe JSON reads, exact V3 field serialization and atomic-order V3 then V4-shadow write. `app.js` retains migration/loading state for now (don't rewrite V3 migration and risk old saves). Module accepts explicit graph dependency rather than using a hidden global; tests handle shadow failure, storage failure, and exact schema.
3. **Roadmap semantics**: HSK2–5 cards remain present, labelled `SẮP RA MẮT`, but no longer have `role=button`, key handlers or click toast. HSK1 demo remains focusable and keyboard operable.
4. **False inference fix**: world/context bridge no longer treats mere `intro.maxReached` as proof the learner specifically saw/recognized a glyph. Requires observed glyph interaction (`discovered`, `momRevealed`, both `lightParts`); no added score. This is especially important for first-time learner honesty.
5. **Document navigation**: `PRODUCT_SPEC.md` becomes the canonical scope/status statement, `docs/INDEX.md` separates live spec from historic V4–V9 roadmap/release documents without moving/deleting legacy paths.
6. **No speculative "speedup"**: app.js size ~49,773 → ~39,977 source chars; new scene-art.js ~9,546 and save-io.js ~1,177, so total JS source bytes and two network requests actually increase slightly. This is a *modularity* gate, not verified Core Web Vitals optimization. Future delay/lazy runtime should be benchmarked before implementation.

## Bugs/risks found & mitigated
- Procedural artwork interleaved with UI: handled with exact output hashes and maintained fallback.
- JSON state logic coupled to IIFE global variables: stable V3 writer I/O extracted; old loader remains untouched until separately versioned migration.
- False HSK2–5 button semantics: future roadmap cards now explicitly non-actionable.
- Potential false “you saw this character” from mere Chapter00 page navigation: fixed.
- Keeping documents and unused editorial JS in root does not affect page bundle; do not purge and break historical references.
- New scripts may increase requests; browser should load them before app in specified defer sequence; tests verify ordering and availability. Node mock tests inject the two pure modules, real browser test checks no JS errors.

## Exit criteria
- Existing 135 Node assertions + new module/semantics/persistence tests pass.
- Chromium desktop 1280 and mobile 360 complete Chapter00 and all HSK1 scenes, quest, choices, 3 internal checkpoints, V3/V4 save reload. An introduced actual error blocks merging; never hide or skip a test to mask a regression.
- Vercel preview `READY` and exact SHA, all script endpoints HTTP 200. Capture screenshot/JS error/loads in CI.
- Verify production still pinned to `cba551b` and untouched, safety snapshot intact.
- Real mobile visual review, native Mandarin audit and measured Core Web Vitals still pending; this gate doesn't promise them.

## Next safe iteration
When the stacked chain is manually approved, merge sequentially #3→#4→#5→#6→#7. Only then benchmark initial-load script bytes/request count in production, consider lazy authoring-only assets or a bundler **in a separate PR** with measured performance gain. Leave V4 primary reader, AI and full HSK1 coverage to their own verified gates.
