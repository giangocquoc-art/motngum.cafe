# V4 IMPLEMENTATION AND NEXT RELEASE PLAN — 2026-10-26
## The single core experience
The user becomes Minh An, a Vietnamese child living in Chengdu. Every visit is an illustrated, interactive story: follow a scene, hear Chinese, respond and experience narrative consequences. The medium is an original hand-inked 2D slice-of-life storybook, not 3D, shiny anime, quiz menus, or a detached flashcard app.

## Content continuity
HSK1 newcomer → HSK2 friendship and daily life → HSK3 spring cultural fair → HSK4 save Liu Nainai's restaurant → HSK5 reflect on two hometowns and graduate. Continuous notebook and remembered interactions. HSK5 culminates in one choice: write an original Chinese essay "我的两个故乡", or translate an authored Chinese passage into Vietnamese; rubrics differ, and neither is an official HSK certification.

## Logical release gates and dependencies
A. Canon and curriculum: verify HSK 3.0 vocabulary, characters, grammar, and skill outcomes against official edition, map every learning objective to real story situations, review with qualified teacher, confirm character age/timeline, and prevent untaught material in exams.
B. Story engine: move scenes to versioned data manifests and graph of scene IDs, controlled choices, stable narrative facts, fixed event outcomes, transitions, and checkpoint/replay. AI never owns canonical facts.
C. Learner support: scaffold with prompt → hint → sentence tiles → sample; record assistance and attempts; avoid conflating completion with independent mastery. Put vocabulary in Minh An's in-story notebook.
D. Learning science: revisit phrases across different contexts, track evidence by modality (reading/listening/speaking/writing), distinguish formative practice from summative checkpoints; evaluate retention and genuine skill rather than just scene reach.
E. Voice AI: choose verified low-latency streaming Mandarin voice pipeline, a Story Director with approved acts and vocabulary budgets, ASR/TTS service behind backend, tone feedback with validated benchmarks, transcript privacy controls and graceful typed fallback; token and cost limits, prompt-injection testing.
F. Visual quality: character models for Minh An, Xiao Yu, mother, Wang Laoshi, Liu Nainai; original hand-drawn background and transparent sprites, expression states, licensing/provenance, consistent print-like outlines/palette. Chinese content in HTML overlays.
G. Scale: complete HSK1 first then implement HSK2–5 in order, each with curated episodes, exam narrative, dialogue states, reviews and a validated skills matrix. No fabricated completion percentage for unreleased chapters.
H. Production hardening: account optional until multi-device sync needed, security/privacy/child protections, server-side keys only, rate limits, abuse control, analytics without default raw voice storage, accessibility/performance audits, regression tests and rollback.

## V4 shipped work scope (not full roadmap)
- Add original in-story notebook: previously encountered Chinese expressions, pinyin and Vietnamese meanings; count independent/assisted scenes and targeted review topics.
- Add beginner sentence builder: clickable Mandarin phrase tiles alongside input/mic, only in practice; using it counts as assistance; hidden in examination.
- Close notebook during exams until question resolved. Keep test scoring honest.
- Correct two logically incorrect NPC replies (price and noodle order), and remove a falsely introduced word from demo learning metadata.
- Add pure learning-kit functions and automated regression cases, plus local UI state simulation and deployment verification.

## Acceptance gates before calling a release successful
1. Story game still loads, dialogs work, no missing DOM IDs or script syntax errors.
2. Sentence tiles can produce a correct Chinese answer and mark it as assisted, never independent.
3. Notebook lists no future words, is blocked during unsolved exam, and supports ESC close.
4. Existing V3 local save loads without reset; solved state, draft, exam scores and retake continue to work.
5. Checked production HTML, CSS and JS each return HTTP 200; Vercel latest commit READY; root motngum.cafe not modified.
6. Browser E2E on desktop/mobile, Mandarin native review and art QA remain required; never falsely claim these were performed if not.

## Highest-priority NEXT milestone
Author a complete HSK1 Episode 1 with true story branching, repeated vocab in later contexts, reliable Mandarin audio and final competency sampling, then take a teacher review before further chapter release. Add real AI only after passing narrative constraint tests.
