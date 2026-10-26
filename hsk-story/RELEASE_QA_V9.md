# Hai que huong V9 + V10 foundation — release QA
Updated: 2026-10-26. Target: https://hsk.motngum.cafe

## Scoped deliverables
- V9: story-graph.js stable canonical scene IDs + events over numeric 0-9; sceneRef persisted with backward-compatible step; scene-world.js supplies 6 optional clickable narrative props in arrival street and walk home. All optional observations are ungraded.
- V10 PARTIAL: skill-sampler.js offers voluntary reading comprehension and browser-TTS listening before in-world checkpoint; skills stored outside history and checkpoint grading, with 'unassessed' when no audio/playback evidence. Speaking and writing remain unassessed; no HSK1 certificate/level-completion claim.
- V10 learning-blueprint.js maps eight DEMO language goals to learning scenes and practice/checkpoints. Exact HSK 3.0 primary-source item verification/qualified Mandarin review are PENDING.
- V13–V16 authored DRAFTS only: 16 episode summaries in future-acts.js, no live chapter unlock or unreviewed Chinese content.
- CODEX_HANDOFF_V11_V12.md defines secure bounded AI NPC/voice and original reference-consistent illustrated assets. Neither API provider nor graphics are deployed here.

## Release gate
1. GitHub Actions HSK regression must pass all Node syntax/logic/simulated UI checks on exact reviewed SHA.
2. Vercel hsk project READY and hsk.motngum.cafe HTML + app.js + new graph/scene/skill scripts + CSS HTTP 200.
3. No new runtime errors in checked window; no unrelated root website changes.
4. Verify old V3–V8 progress, story memories, notebook quest, 3/3 checkpoint retake, full replay and mini sampler no grade conflation.
5. Real Chromium/Playwright mobile screenshot visual QA, actual audio audible validation, native Mandarin specialist signoff and official syllabus matrix verification remain OPEN. No fabricated results.

## Reproduce
Run node --test hsk-story/tests/*.test.cjs .
CI workflow: .github/workflows/hsk-story-regression.yml .
Production outputs are not a substitute for physical-device end-to-end tests.

## Known risks
Numeric old SCENES indices are still immutable; sceneRef only is a foundation for deliberate future migration. TTS may not play even if playback is requested: the listening result is pilot-level evidence only, no certified skill inference. Security/privacy review needed before AI microphone services, especially for minors. Shared monorepo may trigger unrelated Vercel builds.
