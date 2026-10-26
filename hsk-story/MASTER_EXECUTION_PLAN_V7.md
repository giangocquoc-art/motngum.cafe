# 两个故乡 — MASTER PRODUCT & EXECUTION ROADMAP V7
Updated 2026-10-26. Production: https://hsk.motngum.cafe. Code: giangocquoc-art/motngum.cafe/hsk-story.

## Product invariants: user intent that all contributors must preserve
1. ONE unmistakable interactive experience: live as Vietnamese protagonist Minh An, move with mother to Chengdu, meet Xiao Yu, teacher Wang and Liu Nainai; acquire Mandarin by observing, listening, speaking, deciding and remembering. No unrelated quiz arcade/dashboard.
2. FIVE connected acts, HSK1 → HSK5 only. Act 1 newcomer and school; Act 2 first friendship and everyday Chengdu; Act 3 Vietnamese–Chinese spring cultural fair; Act 4 nuanced threat to Liu Nainai's neighborhood restaurant; Act 5 graduating and deciding what "two hometowns" means. End with a Chinese essay 我的两个故乡 OR Chinese→Vietnamese translation with separate rubrics, not a fabricated official HSK certificate.
3. Visual art direction remains original hand-inked 2D slice-of-life as in the chosen reference's general features: thin slightly uneven linework, muted cream/dusty rose/sage/ink palette, lived-in Chengdu interiors, expressive human-scale characters, paper-like print. Do not reproduce copyrighted composition or use mismatched 3D/glossy anime. Separate backgrounds, transparent sprites, dialogue text and motion.
4. Canon never drifts. Story choices affect relationships and local narrative but cannot bypass mandatory teaching or exam events.
5. Progression through a story is not proof of Mandarin mastery. Independent attempt, attempted after error, visible scaffolding, revealed sample, and transcript copied from speech recognition are distinct evidence. Never grant independence when the answer was already on screen.
6. Education is source-backed: explicit official HSK 3.0 syllabus edition and provenance must be mapped to lexicon/grammar/Hanzi/skills before any level-completeness claim; qualified Mandarin editorial review is required.

## Baseline after V6
The live pilot contains 10 graded HSK1 mini-scenes (7 practice, 3 school checkpoint), 5 unscored story interludes, 2 microbranches and local story memory, journal and phrase tiles, browser speech input/voice synthesis, opt-in revealed vocabulary and resume/retake. HSK 2–5 cards are unplayable. Artwork is SVG placeholders; no full curriculum mapping; no AI conversation or tone scoring. This truth must remain visible to users.

## Audit priorities leading to V7
**P0: tight coupling:** Dialogue prompt array, scene answer array, response array and chapter cards were coded inside a 37k character DOM runtime; editors cannot safely add or change stories.
**P0: scoring leakage:** Practice's phrase tiles initially expose much of the correct answer even without being clicked; typed re-entry could be incorrectly counted as unassisted.
**P1: migration:** Versioned v3 localStorage saves store numeric scene indices. Reordering existing scenes must be forbidden until scene-ID migration is designed and tested.
**P1: test visibility:** CI has been configured and earlier workflow runs are successful, but tests must expand to content integrity and newly-hidden scaffold controls.
**P1: educational depth:** Serial correct/incorrect scenes are not a full HSK1 learning journey.
**P2: operations:** Unrelated Vercel projects share a repo and may fail/trigger on HSK-only source pushes; migrate only via a deliberate deployment plan with rollback, not by editing root site.

## Architecture — scoped and testable
A. **Content manifest**: versioned immutable authoring source declaring chapters and every numbered dialogue + NPC response + accepted answer(s). V7 introduces HSKContent, extracts existing V6 content without changing IDs, and validates scene IDs, localized fields, answer presence and matching curriculum nodes. All story content edits go here, not into app.js. Later move to JSON schema with stable string identifiers.
B. **Curriculum manifest**: level-by-level competency and per-scene study objectives; explicit introduce→use→review→checkpoint references with source edition and qualified reviewer. No invented mastery counters.
C. **Story director**: canonical world facts, optional emotionally meaningful decisions and bounded reconvergence; AI can change conversational surface but never state validity or unlock conditions.
D. **Learning and grading core**: curated intent recognition for current demo, strict negative tests and an independent/assisted/no-credit model. Later add calibrated Mandarin rubric, speech and writing evidence, not freeform trust in LLM grades.
E. **Learner runtime**: browser HTML/CSS/JS interludes, choice, pronunciation listen/typed fallback, keyboard/mobile, journal prop, local progress. Every transition is deterministic and idempotent.
F. **Optional AI server (future)**: secure bounded story conversation, STT/TTS vendor adapters, level vocabulary budget and utterance approval, child/minor privacy and rate/cost limits, fallback to approved authored lines. Never put secrets in static JS.
G. **Art pipeline**: approved original character model sheets and layered assets with provenance, version, cropping/lineweight palette and QA. Chinese learning text stays selectable HTML.
H. **Operations**: CI tests, browser E2E, security/accessibility, preview QA, Vercel SHA match, custom domain/Cloudflare DNS, rollback procedure and opt-in analytics that do not store raw minors' recordings by default.

## Ordered releases and explicit acceptance
### V7 / P0 NOW — modular scripts and honest assistance
- Move CHAPTERS, SCENES and REPLIES verbatim from the UI IIFE into content-manifest.js without changing indices, references or user saves.
- Add runtime content-contract validation cross-checking curriculum data and schema fields; stop safely on corrupt content rather than silently grading wrong lessons.
- Keep Mandarin phrase tiles entirely hidden until an explicit "Mở bộ ghép câu" action; mark hintUsed when the learner reveals them, not only when a chip is tapped.
- Add tests: 5 chapters, stable [0..9] scene IDs, ten localized NPC replies, bad curriculum rejected, no leaked construction chips during practice/exams, unchanged saved progress/choices/retake.
- Do not move parent website files, project DNS or Vercel root. Confirm CI green and production SHA READY, HTTP 200 for scripts.
Gate: no semantic content changes; new module loads before runtime; no regressions for V6 old local save.

### V8 / P1 — complete Episode 1 instead of more disconnected scenes
- Professionally author an emotional three-act structure: arrival/mother's notebook → first school social difficulty → familiar faces on the way home. A decision matters in a later encounter.
- Use observation/interaction and branching between, not 10 consecutive "type the right answer" screens. Add a transfer task where old language is recalled in a NEW location.
- Each objective carries vocabulary/grammar/prerequisites, real sound, two later independent recall opportunities, meaning-preserving variation, Vietnamese guidance fading with confidence.
- Plan first beginner usability pilot, track consent-based story engagement, unanswered prompts, help requests and retention without collecting unrelated private data.
Gate: educator language review, natural feedback, accessible mobile UX, no untaught concepts on exam, validated transfer question.

### V9 / P2 — HSK1 chapter coverage
- Source-pin the official HSK 3.0 syllabus. Build traceability matrix: item→introduced scene→spaced repeat→skill evidence→exam item→reviewer approval.
- Expand interlinked episodes based on required coverage, not a fabricated fixed episode quota; teacher-reviewed listening, reading, spoken and writing tasks.
- Create remedial scene flows for weak objectives, not just reset all game progress. Calibrate exam scale and clearly state nonofficial nature.
Gate: approved coverage complete, independent modality-specific transfer evidence and piloted revisions.

### V10 / P3 — bounded realtime Mandarin NPC
- Evaluate LiveKit Agents vs Pipecat and provider ASR/TTS for Vietnamese-accented Mandarin, tone feedback reliability, latency and costs. Never assume a provider is free or always available.
- Backend-only model secrets, input validation, canonical memory and whitelisted response acts; controls for minors, logging consent, rate-limits and spend caps.
- LLM output is candidate dialogue, not authority over events, tests, chapters or grades; safe fallback to authored lines on errors.
Gate: measured real-device Mandarin comprehension, adversarial canon and prompt-injection tests, controllable running costs and privacy review.

### V11 / P4 — final storybook assets and UX
- Author/commission original reference sheets for Minh An (grows with levels), mother, Xiao Yu, Wang teacher, Liu Nainai; expressive sprites and place backgrounds, no hardcoded UI text in pictures.
- Consistency scoring, copyright/asset rights inventory, 360px/desktop safe crop, keyboard navigation and motion preference.
Gate: art review pass, provenance record and web performance tested on realistic mobile.

### V12–V15 / P5 — HSK2→5 sequential authoring
HSK2 friendship/miscommunication and Chengdu daily living; HSK3 culture fair planning; HSK4 balanced restaurant neighborhood challenge; HSK5 possible homecoming/identity and graduation diary. Each includes reviewed map of skill targets, natural story stakes, callbacks and an in-world exam. Final alternative essay vs translation rubrics separate; no "official HSK passed" badge.
Gate per act: syllabic/grammatical source provenance, native editorial signoff, transfer test, canonical continuity and learner pilot.

### P6 — launch operations
User identity only when multi-device progress sync is needed, age-appropriate notices, microphone permission and transcript retention, deletion, audit security/abuse/costs, real browser tests and rollback. Consider HSK-only GitHub repo after preview migration plan; do not break other Vercel projects.

## Definition of done for ANY future patch
- Whole HSK app under hsk-story/ except dedicated workflow changes.
- Script syntax and Node suite (not merely mocked statuses), scene/learning contracts, zero silent HSK exam leaks, story-mandatory path reachable through all choices.
- V3–V6 progress compatibility, replay and retake unaffected.
- Actual browser and mobile E2E gate needed before fully production-qualified claim; record exactly which tests ran.
- Vercel production commit corresponds to reviewed GitHub SHA, live custom-domain HTML/CSS/JS HTTP 200, runtime errors checked.
- Parent motngum.cafe unaffected in source; unrelated deployment failures investigated separately instead of falsely claiming resolved.

## Next actionable tickets after V7
1. Author first full three-act Episode 1 script in manifest with scene design and dialogue samples, native Mandarin proofreading request.
2. Implement authored scene graph with stable IDs + migration from numeric indices.
3. Design review/retrieval/transfer engine and better HSK1 exam blueprint.
4. Build original art reference/model sheets (source user-provided style direction; no reused image).
5. Start server-side constrained voice AI spike only once content rules and privacy controls are ready.
