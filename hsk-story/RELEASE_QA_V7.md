# HSK Story V7 Release Audit — 2026-10-26
Target: hsk.motngum.cafe. Separate Vercel project, shared GitHub repository.

## Shipped scope
- `content-manifest.js` contains the same five roadmap chapter descriptors, ten playable dialogue scenes and ten translated NPC replies previously embedded inside `app.js`.
- A linked content validator checks the curriculum-scene ID relationship, sequential legacy IDs, required Chinese/Pinyin/Vietnamese strings, NPC responses and accepted inputs.
- `app.js` now renders the manifest, reducing coupling; old scene IDs, HSK level ordering, names, scoring patterns, narration interludes and localStorage key are unchanged.
- Beginner phrase construction suggestions no longer appear until the player explicitly asks. Opting in immediately records help use, even if the player copies words by manually typing them. Exams never show this board.
- V7 story pages, current answer-hidden vocabulary, decision memory, notebook and V6 school checkpoints remain.

## Verification
- Pre-commit script syntax: `new Function` for manifests and runtime. Structural DOM ID checks validated with newly inserted openBuilderBtn.
- Mock UI end-to-end: **39 checks passed** across story interludes, independent vs aided grading, learning scene progression, both route choices, school checkpoints, completion, saved game resume and checkpoint retake.
- `tests/content-manifest.test.cjs` and extended `tests/story-ui.test.cjs` are committed. Node suite must be verified on GitHub Actions after push; mock UI tests are NOT a real browser.
- The release must be considered final only after matching SHA is READY in Vercel, custom domain HTML/app.js/content-manifest.js/style.css HTTP 200 and Actions conclusion.
- Other Vercel projects share this repository; unrelated builds may fail and are out of scope. Do not modify their production configuration without separate approval.

## Known future blockers
1. Native Mandarin teacher review and verified HSK 3.0 syllabus mapping remain incomplete. Current 10 scenes are an introductory demo, not full HSK1.
2. Chinese speech recognition/voice quality is device/vendor-dependent; no tone proficiency grading.
3. Real Playwright/mobile visual tests have not been completed for this V7 release.
4. Art assets remain procedural SVG placeholders rather than completed matching hand-drawn character sprites and backgrounds.
5. AI-generated unrestricted NPC conversation is not enabled.
6. The legacy save uses numeric scene IDs; new scenes may not be reordered or inserted before migration is implemented and tested.

## Reproduce in clone
`node --test hsk-story/tests/*.test.cjs`
`for f in hsk-story/*.js; do node --check "$f"; done`
See `MASTER_EXECUTION_PLAN_V7.md` for sequential product milestones and release gates.
