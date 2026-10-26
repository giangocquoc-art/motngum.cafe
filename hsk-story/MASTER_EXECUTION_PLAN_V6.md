# 两个故乡 / Hai quê hương — Master execution plan V6
Version: 2026-10-26. Current site: https://hsk.motngum.cafe. Isolated app in \`hsk-story/\` of \`giangocquoc-art/motngum.cafe\`, separate Vercel project. GitHub and Cloudflare remain the connected deployment infrastructure.

## 1. Product requirements frozen from user intent
- The one differentiator is an interactive, emotionally coherent 2D story where a Vietnamese learner *lives* through Mandarin situations, not a regular course website, game arcade, flashcard app or generic chatbot.
- Protagonist Minh An moves from Vietnam to Chengdu around age 11 with mother, receives a notebook, finds Xiao Yu 小雨, teacher Wang 王老师, and Liu Nainai 刘奶奶. All characters persist and grow with the same stable relationship facts across five HSK acts.
- Story progression: HSK1 newcomer and first school assessment → HSK2 friendship and ordinary city life → HSK3 Vietnam–China spring cultural fair and collaboration → HSK4 nuanced community dilemma involving Liu Nainai's restaurant → HSK5 identity, possible return to Vietnam and graduation.
- Final HSK5 expression: player chooses (a) write an original Chinese essay \`我的两个故乡\` or (b) translate an original Chinese passage into Vietnamese preserving meaning and tone. Each requires a distinct rubric and feedback; the game is NOT an official HSK certification.
- Visual law: original illustration inspired by user's image: thin irregular brown/dark ink outlines, muted flat nostalgic pastel cream/terracotta/sage, light paper print grain, detailed lived-in Chinese interiors, human-scale 2D characters; independent backgrounds, sprites, dialogue and movement. No 3D, glossy anime, direct copyrighted image copying or hardcoded Chinese text in artwork.
- Learning must feel incidental but demonstrate active comprehension/retrieval: listen, see, decide, speak/type, experience authentic reactions, encounter language again in a different situation, review and prove independent recall.
- Every school evaluation must test only skills previously introduced and practiced; supported answers cannot be scored like independent mastery. Story completion and language mastery are separate state variables.

## 2. V5 baseline and diagnosed risks
**Implemented before V6:** 7 short practice scenes + 3 internal checkpoints, authored Chinese/Pinyin/Vietnamese, browser-dependent Mandarin TTS/ASR, strict template evaluation, hints, beginner phrase tiles, in-story notebook, two canonical small choices, localStorage resume and exam retake. Only the first HSK1 *pilot*, NOT full HSK1.
**Critical learning flaw:** answer-bearing sample expression was displayed before learner attempted a scene, inflating "correct independently" metrics.
**Second content flaw:** journal could reveal a yet-unencountered response from the current scene.
**Narrative flaw:** a serial Q&A exercise with too few unscored interpersonal/atmospheric moments.
**Architectural flaw:** large app.js with multiple indexed arrays; need stable manifest and graph before bigger production.
**Operations risk:** HSK currently shares a repo with multiple Vercel projects, which can trigger unrelated builds; isolate the HSK application repo in a separately reviewed migration when deployment credentials and rollback are ready.
**Educational risk:** HSK 3.0 official syllabus mapping is incomplete, native-teacher signoff and authentic assessments absent.
**Safety risk:** minors may use product; consent, voice privacy and AI cost/security cannot be postponed until after live AI introduction.

## 3. Target architecture and invariants
### A. Story content and canon
Canonical \`StoryBible\`: person IDs, relationships, ages/timeline, locations, notebook origin, previous chapter events. Editor writes a graph \`Chapter -> Episode -> Scene\`. Each scene includes stable ID, place, time, speaker, emotional goal, required learning objective, prerequisite scene IDs, authored story pages, choices and story consequences. Major canon facts are invariant.
### B. Curriculum and learner
\`Curriculum\`: version-pinned official HSK 3.0 vocab/Hanzi/grammar/functional objectives for each act with source/section and professional review. Every item travels through **introduced → comprehended → used with help → retrieved independently → revisited after delay → transfer-tested**. Score by competence and modality; story choices don't award competence; answer revealed/hinted/retried never equals right-on-first-try.
### C. Deterministic runtime first
\`StoryDirector\` owns allowed scene movement, canonical memory and mandatory learning nodes. Optional emotional branches return to same required learning checkpoints. An \`InterludeDirector\` provides unscored narrative pages. Never let LLM mutate lesson progression. Make all transitions idempotent and persist stable state.
### D. Interface/asset pipeline
Layer 1 illustrated background, layer 2 character expression sprites, layer 3 accessible HTML Chinese/Pinyin/Vietnamese and speech controls, layer 4 restrained animation. Mobile 360px safe-crop; keyboard-only game possible; respect reduced motion. An's notebook is a story object, not a detached flashcard feature.
### E. Future AI and voice safety
Server-side Story Director, scoped prompt/tool schema, LLM output validation against HSK proficiency and allowed response acts, canonical memory, Mandarin speech recognition+voice synthesis benchmarking on Vietnamese accents, interruptions and robust text fallback. Protect tokens and spend; no exposed API keys; consent and retention controls around minors/voice. Measure costs and P50/P95 voice latency on real devices; do not invent targets/results.
### F. Operations
GitHub CI for Node unit/simulated integration, preview deployment gates, real Playwright/browser mobile+desktop E2E, TLS/domain/runtime checks on Vercel & Cloudflare, rollback, log minimization and release audit. Full HSK product should eventually move to independent repo to avoid triggering unrelated project builds; do NOT alter parent deployment automatically.

## 4. Milestones in dependency order

### M0: Core correctness (V2–V5) — COMPLETE AS PROTOTYPE
Template-scored conversation; explicit assisted/correct distinction; save/resume, notebook, tile builder, two authored canonical choices, three in-story classroom questions, pure logic tests. Limits: no real NLP, no meaningful oral proficiency measurement, no certified HSK1 mapping.

### M1: V6 narrative pacing and scoring integrity — IMPLEMENT NOW
- Five unscored illustrated story pages, placed before scene 0 arrival, scene 1 school, scene 4 lunch, scene 6 walk home, scene 7 classroom checkpoint; each authored bilingual Chinese/Pinyin/Vietnamese with longer Vietnamese context.
- Player acknowledges each once; page state separate from answer results. Reload and V5 migration preserve already-completed scene history without forcing full restart.
- Keep vocabulary hidden until learner asks for assistance; mark disclosure as help. Show words after answering for learning consolidation.
- Prevent the notebook from showing the current unencountered answer. Keep speech and assisted composition.
- Maintain existing two branch choices and all ten mandatory scenes. Don't let interludes bypass grading, unlock chapters or silently change language scores.
- Update tests and release docs; verify production HTTP and Vercel READY.
**DoD:** all 5 pages tested, 10 scene progression, 2 branch choices, input/save/reload/retake/replay, honest help scores, URL health, no unrelated source edits.

### M2: Author a *real* HSK1 Episode 1 — NEXT
- Separate monolithic SCENES/REPLIES into stable authoring manifests with JSON schema and version migration.
- Three-act self-contained script with beginning, small social conflict, learner decision, natural emotional outcome. Use brief neutral story moments and ambient interactive objects between assessed interactions. Avoid "talk→correct→next" as the only pattern.
- Qualified Mandarin reviewer checks all Chinese lines, Pinyin including tone sandhi, naturalness and Vietnamese translations. Do not teach phrases not mapped to target unit without comprehensible support.
- Design minimum one situation transferring an old phrase to a different context; independent recall after a delay; localized remediation for weak objectives.
- Pilot with real beginning learners; collect opt-in feedback on story, comprehension, session length, hint use, reading load and accessibility.
**DoD:** teacher-signed script, measurable independent transfer, coherent scene stakes, no unintroduced exam targets, keyboard/mobile Playwright passing.

### M3: Full HSK1 coverage and mastery — AFTER M2
- Parse and version the official CTI HSK 3.0 published list. Matrix maps every approved level-one item to introduction, contextual repetitions, graded recall, listening/reading/writing/speaking evidence and school assessment.
- Expand content in several well-authored episodes as dictated by coverage, not a fixed arbitrary episode count.
- Alternative checks and practice retries, tone/word evidence, confidence/calibration without fake "HSK certified" badge.
**DoD:** 100% of approved target matrix covered, teacher/editor review completed, pilot retention indicators documented.

### M4: Controlled AI dialogue and Mandarin speech
- Evaluate streaming voice stacks such as LiveKit Agents / Pipecat, AI/STT/TTS providers by cost and Mandarin accuracy; typed fallback mandatory.
- Approved response acts, HSK budget, constrained character memories, validator for canon and question-level goals, prompt injection and abuse testing.
- Rate limits, secure API route, consent, privacy retention, usage metering and retry/fallback; do not use a public arbitrary LLM chat as a shortcut.
**DoD:** evaluated dialogues follow canon and curriculum, measured accuracy and latency on actual mobile hardware, cost bounds recorded, safe recovery from AI failures.

### M5: Final hand-drawn assets
- Produce original licensed character reference sheets for Minh An (age progression), Xiao Yu, Wang teacher, Liu Nainai and mother.
- Original backgrounds for home, school gate, classroom, noodle shop, street, festival, debate, graduation. Art manifest with fixed palette, seed/model/reference history and review status. Export separate transparent sprites and background assets.
- Responsive composition, asset preloading, accessible HTML labels, mobile crop/contrast and reduced animation.
**DoD:** no placeholder illustration in released scenes, consistent art-review scorecards and provenance.

### M6: HSK2, HSK3, HSK4, HSK5 authoring sequentially
- HSK2: daily life, shopping/directions/transport, friendship misunderstandings, school semester test.
- HSK3: spring Vietnam–China culture fair, team choices and collaborative planning; school mini-presentation.
- HSK4: Liu Nainai's restaurant faces plausible financial/space/regulatory challenge; nuanced viewpoints and argument-driven proposal.
- HSK5: deeper identity and possible return to Vietnam, language of comparison/causality/personal viewpoint; notebook returns to graduation scene; creative Chinese essay or faithful Chinese-to-Vietnamese translation with two distinct rubrics, explanatory feedback and coherent final ending.
Each release checks level-specific official version coverage, learner transfer evidence, narrative consistency, native Chinese review and accessibility.

### M7: Public-scale release readiness
Age-appropriate onboarding/privacy and parental mechanisms where needed; optional account/multi-device sync, data deletion policy, rate limiting and token budgets, moderation, audit logging without raw speech by default, penetration review, uptime/error alerts, backup/restore, domain/TLS, CI and browser E2E.

## 5. Prioritized backlog: ship in this order
P0 integrity of score, story canon, saved state, no answer leakage, real test suite, deploy rollback.
P1 compelling authored HSK1 episode and complete official pedagogical mapping.
P2 AI and pronunciation quality with bounded costs and protections.
P3 professional original consistent 2D art.
P4 HSK2–5 story, curricula and writing exam.
P5 accounts, analytics with privacy, retention data and business readiness.

## 6. Release gate for each code change
[ ] Changes scoped to hsk-story/, preserving parent site, existing DNS, unrelated Vercel apps.
[ ] Story/curriculum manifests validate; learning objectives introduced before assessment.
[ ] No unrequested auto-answer help, user assistance recorded.
[ ] All mandatory scenes reachable from all story choices.
[ ] Interlude has no grading side effects.
[ ] Old local progress migration, resume, choice memory, school retake, full replay.
[ ] Node tests + syntax + actual browser E2E (when available).
[ ] Live custom domain HTML, CSS, JS HTTP 200; production commit READY; no new runtime crashes.
[ ] Native teacher signoff before claiming real syllabus coverage.
[ ] Art source rights and visual consistency before calling final design.

## 7. Important disclaimers
V6 is a HSK1 immersive-demo quality enhancement, **not** the completion of HSK1–5. Current SVG illustrations remain temporary relative to user's referenced 2D picture. Current scripted answers are not free conversational AI. Browser voice services don't grade tone or guarantee recognition. Official HSK 3.0 announcement from https://www.chinesetest.cn/ gives planned worldwide date 2026-12-13; course alignment requires separately verifying the actual syllabus, not relying only on an announcement.
