# MASTER PLAN - Hai que huong - 2026-10-26

## Product vision
One core feature: an immersive, continuous, illustrated 2D Mandarin-learning story. The player becomes Minh An, a Vietnamese child who moves to Chengdu, grows up with Xiao Yu, Wang Laoshi and Liu Nainai and learns Mandarin by using it. Five acts correspond to HSK1 through HSK5. A school exam closes each act. HSK5 ends in a Chinese essay on 我的两个故乡 OR a Chinese-to-Vietnamese translation; these are separate assessments with separate rubrics.

## Non-negotiable product rules
- Story never feels like a disjointed quiz hub: observe a meaningful setting, hear Mandarin, reply, get natural character feedback, reuse earlier language later.
- Every assessed language objective must have been taught and practiced BEFORE assessment.
- Narrative facts are canonical (names, ages, relationships, school, possessions); AI may vary dialogue but never rewrite canonical events.
- An in-world exam is not an official HSK examination. HSK 3.0 must be mapped to official published vocabulary, characters, grammar and skills and reviewed by qualified Mandarin educators before any proficiency claim.
- Choice branches may affect characters and dialogue, but must return to mandatory learning objectives, not skip them.
- Hints, translations and answer reveals do not count as independent mastery; users may continue the story with assistance and review later.
- One consistent original 2D hand-inked storybook visual identity: irregular ink outlines, muted paper colors, small lived-in Chinese urban details. Background, character sprite, dialogue HTML and motion are separate assets. Do not copy the reference artwork itself.
- No always-on microphone; use explicit interaction, alternative typed input, and explain platform speech-service privacy. No user secrets in frontend code.
- User progress and story history are versioned with forward migration and replay / checkpoint-retake support.

## Runtime architecture target
1. Curriculum data: five level descriptors, level-specific skills, scenes with IDs, teaching words, prerequisite scene references, vocabulary/grammar references and assessment specifications.
2. Story director: a deterministic graph of chapter → episode → scene → response act → story consequence. Locks story canon, speaking turns and promotion logic. Authoring/test contracts are checked at build time.
3. Learning engine: track independent responses, hinted success, revealed answers, attempts and follow-up weak skills. Learner mastery is separate from mere story completion.
4. Realtime AI conversation engine (later): secure backend supports Mandarin ASR, constrained LLM narrative paraphrase, safety checks, voice synthesis and fallbacks. All produced Chinese is checked against scene goals and level budgets. Never put model API keys in the browser.
5. Frontend: an accessible responsive 2D illustrated scene renderer, tappable objects, character sprites, dialogue with toggleable pinyin/translation and a restrained interaction panel.
6. Storage: local v3 checkpoint for this prototype; production adds encrypted profile syncing only after privacy/legal needs and auth boundaries are specified.
7. Deployment: independent Vercel project from repository folder hsk-story and existing Cloudflare hsk.motngum.cafe DNS; no changes to root motngum.cafe site or other domains.

## Phases, deliverables, release gates
### P0 - Integrity and coherent demo (execute now)
Deliver: v3 authored curriculum metadata, fix unintroduced exam questions, checkpoint help leakage, save and restore typed draft / attempt / solved scene state, targeted retake, smoke and logic tests, documented migration.
Acceptance: no arbitrary substring accept; story scene count matches metadata; all exam questions cite earlier learning; no hints silently count as exam mastery; refresh does not erase submitted response or draft; complete episode and retake work; production asset URLs return 200.

### P1 - Real HSK1 coverage / pedagogy (next highest priority)
Deliver: source-pinned official HSK3 syllabus mapping, validated word/hanzi/grammar skill matrix, 5–8 authored episodes (number provisional), vocabulary and grammar acquisition through multiple natural contexts, spaced recall, graded help, class test that samples listening, reading and production rather than just template copying.
Acceptance: educator signs off curriculum coverage and Mandarin naturalness; alpha learners can complete without forced answers; no unlearned mandatory exam concepts; program makes no official certification claim. Target 20+ pilot learners for usability study (not yet performed).

### P2 - Voice + AI guided roleplay
Deliver: hosted streaming agent prototype with provider-agnostic speech recognition / TTS, latency budget, story-move schema, prompt and tool-output validation, per-session cost caps, age-appropriate privacy and abuse controls.
Acceptance: bench-tested Mandarin accuracy and conversational latency on real hardware; no storyline or syllabus escapes in evaluation scenarios; graceful fallback to deterministic story when provider fails; costs per learner quantified.

### P3 - Visual-production pipeline
Deliver: licensed and visually locked character reference sheets, expressions/poses, consistent scene illustrations, original color/ink style guide, export manifest, mobile safe crop, composition and character-layer animation. All Chinese educational text stays renderable/accessibility-friendly HTML.
Acceptance: every public scene has reviewed provenance and consistent assets, tested mobile layouts and reduced-motion support, no reused copyrighted reference image without rights.

### P4 - HSK2 through HSK5 sequential writing
HSK2: explore city with Xiao Yu, markets, routines, plans; semester test.
HSK3: Vietnamese-Chinese spring fair, planning and cooperation; mini presentation.
HSK4: Liu Nainai's restaurant closure conflict and community advocacy; read/argue/write an evidence-based proposal.
HSK5: identity/homecoming and graduation; essay 我的两个故乡 (suggested 300-500 Hanzi as a game challenge) OR a 200-300 Hanzi original Chinese passage translated meaningfully to Vietnamese. These suggested lengths are NOT official exam requirements.
Each release gate: fully authored and assessed story, HSK objectives validated, narrative continuity test, passing learner usability and QA checks.

### P5 - Production release and maintenance
Deliver: secure identity/account sync, data deletion, privacy documentation for minors and parents where applicable, third-party API disclosure, cost monitoring, abuse control and rate limits, content versioning, moderation, CI, performance, accessibility and browser E2E regression, rollback.
Acceptance: release audit cleared; SLA targets tested; secrets server-side; observability active; data governance reviewed.

## Next prioritized backlog
- P0: content contract, scoring integrity, saved state recovery, test retake, QA
- P1: full HSK1 teaching and vocab revisitation, actual listening and speech evaluation
- P2: AI speech engine and story continuity guardrails
- P3: original scene sprite art and scene composition
- P4: HSK2-5 content
- P5: production auth/privacy/commercial readiness

## Official references
ChineseTest official portal: https://www.chinesetest.cn/
ChineseTest syllabus: https://www.chinesetest.cn/syllabus
HSK 3.0 announced global rollout 2026-12-13. Keep syllabus version explicit and do not invent certificate-equivalent scores.

## Status at authorship
Current deployment is a guided static prototype with browser-dependent SpeechRecognition and SpeechSynthesis. NOT a live AI tutor. SVG artwork is illustrative placeholder rather than final licensed storybook art. Future phases require dedicated content and AI work.
