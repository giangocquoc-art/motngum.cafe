# PRODUCT_SPEC — Hai quê hương (current canonical product contract)
**Baseline:** production `main` at `cba551bd7810d7bd86f70611f1bb8f46a289f23a`. The following gates remain staged in dependent Draft PR branches as of 2026-10-26, not automatically live on hsk.motngum.cafe.

## Non-negotiable user goal
A 2D illustrated, choice-based Chinese-learning story about 11-year-old Minh An (An/安) arriving in Chengdu with their mother, meeting 小雨, 王老师 and 刘奶奶; a lost notebook, social relationships and memories connect HSK1 toward a planned HSK5 ending “Hai quê hương”. A zero-literacy child should recognize Hanzi by visual curiosity and then reuse language in context. Never confuse playful mnemonic, verified dictionary meaning, audio playback, independent language assessment, and official HSK certification.

## Release truth table
| Component | Current project state | User-facing claim |
| --- | --- | --- |
| Chapter00 `/nhap-mon.html` | 9-page interactive optional introduction; separate `hai-que-huong-intro-v1` save | Not HSK0 official. Rare glyph folk joke optional in Gate3B |
| HSK1 | 10-scene **demo**, lost-notebook quest, 2 authored relationship choices, 3 internal checkpoints | Not full HSK1 curriculum or official proficiency |
| HSK2–5 | 4 roadmap cards and draft manuscripts (16 future-episode outlines) | **Not playable**, no false button/academic-completion claim |
| Story Graph V4 | 10 stable IDs, direct edges, pure gate reducer | Staged PR #3, numeric legacy scene index preserved |
| Save V4 | Exact derived `hai-que-huong-progress-v4` shadow | **Not** authoritative reader; V3 keeps authority |
| Practice sampler | 2 unscored optional reading/listening questions | Staged PR #4, browser TTS completion not verified ear/HSK skill |
| Hanzi curiosity | Historical 奻/姦 note kept as optional lore on chapter00 page7 | Staged PR #5, respectful context |
| World observations | 6 objects in 2 scenes, past-scene callbacks, non-graded introductory glyph reexposure | Staged PR #6; **text buttons**, not genuine image-coordinate hotspots |
| Gate4 | separated procedural SVG fallback and V3 serializer, honest roadmap cards, CI byte baselines, canonical docs | Staged PR #7 only; visuals and saved field structure unchanged |
| AI + original art | user wants Codex to implement V11 AI and V12 layered 2D artwork | **Not deployed**. Browser TTS is not AI tutoring |

## Source authority and responsibilities
1. `STORY_BIBLE.md`: fixed canon, timeline, characters, motives; story author signs off changes.
2. `CONTENT_CONTRACT.md`: chapter/scene learning content, source map, accepted answers and checkpoint contracts.
3. `STREAMLINING_MASTER_PLAN_20261026.md`: safety-first roadmap, Gate0–5; on planning branch; see `docs/INDEX.md`.
4. This spec: states what the product is vs is not. Historic plans V4–V9 are archived editorial reference, not requirements to reimplement blindly.
5. `RUNTIME_V4_GATE1_GATE2.md`, `PRACTICE_SIDEPATH_GATE3A.md`, `INTRO_CURIOSITY_GATE3B.md`, `WORLD_CONTEXT_GATE3B.md`, `GATE4_AUDIT.md`: evidence records for staged changes.
6. Mandarin educator: verifies historical character glosses, idiomatic Chinese, tone/pinyin, official HSK syllabus. Codex: new visuals and future AI integrations on feature branches. Engineering: golden tests, browser smoke, schema migrations.

## Architecture at Gate4
`index.html` defer-chain: content-manifest, story-graph, story-runtime, scene-world, skill-sampler, game-core, curriculum, learning-kit, story-director, story-beats, active-encounter, **scene-art**, **save-io**, app.js, intro-landing.js. Code modules are global/static and deliberately do not need React/framework or network APIs.

App-shell `app.js` owns UI and state; `scene-art.js` owns **byte-identical SVG fallbacks**; `save-io.js` owns V3 serialization/storage and V4 shadow write. NO migration of numeric scene IDs, no user localStorage cleanup. Further extractions require parity proof, never wholesale rewrite.

### Runtime invariants
- V3 is saved first and always loaded; V4 is a stale/tamper-detectable shadow and never reads as authority.
- HSKIntro v1 key is **read only** by optional world glyph bridges and never rewritten by the HSK1 app.
- A learner's HSK status must not be inferred from having visited a page, hearing browser speech synthesis or receiving a hint.
- Past-scene callbacks only if the learner inspected that prior object; no future spoiler or grade changes.
- HSK2–5 roadmap is informational, not keyboard actionable buttons; HSK1 remains focusable and operable.
- Original procedural SVG preserved (hash parity). V12 art previews must ship with fallback and explicit user approval.
- Intro legacy saves, replay/retake, resuming inside optional practice, broken localStorage, mobile accessible fallback continue to work.

## Release gate / branch isolation
Staged chain: PR #3 `refactor/hsk-runtime-graph-v4` → PR #4 `feature/hsk-practice-sidepath` → PR #5 `feature/hsk-intro-curiosity` → PR #6 `feature/hsk-world-context-bridge` → PR #7 `refactor/hsk-gate4-modular-shell`. Do not merge out of order. Verify exact SHA and CI before discussing production deployment. Safety snapshot `safety/hsk-story-pre-streamline-20261026` preserved.

## Not delivered by code-only Gates
- No full HSK1 coverage / teacher reviewed assessments, no HSK2–5 playable stories.
- No original sprite/animation art; no verified audio listening/speaking score.
- No performance improvement claim merely because `app.js` got shorter; separately test total script transfer bytes/network and mobile rendering.
- No real learner pilot, accessibility audit by a human, penetration test or real Android/iOS device signoff.

## Gate 5 — staged (PR #8)
Author-controlled `story-threads.js` reuses prior Mandarin expressions through branch-aware reflections, adds an evidence-honest learning-thread section in An’s notebook and a choice-sensitive episode coda. Scene 0 is chronologically the morning after Chapter 00, with the notebook already in An’s possession. HSK1 remains 10-scene demo; this is narrative and pedagogical progress, **not full official syllabus alignment**. See [GATE5_AUDIT.md](GATE5_AUDIT.md).

## Staged in-world HSK1 review (Gate 6)
See HSK1_COVERAGE_MATRIX.md and HSK1_REVIEW_GATE.md. Eighteen optional items at /ren-luyen.html; local independent storage, explicit evidence categories and schedule. Not yet full HSK1 syllabus, Mandarin educator-reviewed, listening/speaking/handwriting or certified examination.
