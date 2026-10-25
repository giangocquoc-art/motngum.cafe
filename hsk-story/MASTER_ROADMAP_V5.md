# HSK Story — MASTER ROADMAP V5 (2026-10-26)
Project: Hai quê hương / 两个故乡. Isolated source: motngum.cafe/hsk-story. Deployed: hsk.motngum.cafe.

## Product thesis
One flagship capability developed extremely deeply: a Vietnamese learner *lives* as Minh An, an 11-year-old Vietnamese child relocating to Chengdu. Learning is contextual: listen to a character, decide, speak or type Chinese, observe consequences, encounter expressions again later. An's little notebook carries story memories and what the learner encountered. The 2D visual identity is original hand-inked, muted pastel editorial slice-of-life, based on the general features of the provided reference rather than copying artwork.

## Continuity locked to HSK 1–5
1. HSK1: newcomer, school, meeting teacher Wang, Xiao Yu, Liu Nainai, first exam at school.
2. HSK2: first friend, Chengdu everyday life, routes, commerce, repairing small misunderstandings.
3. HSK3: spring Việt–Trung cultural fair, collaboration, planning, explanation, presentation at school.
4. HSK4: Liu Nainai's eatery faces a realistic community problem; listen to sides, debate, evidence, community proposal.
5. HSK5: possible return to Vietnam, identity and belonging, school graduation; produce a Chinese essay 我的两个故乡 or translate a coherent Chinese source text into Vietnamese. Different scoring rubrics; game-only assessment, not an official certificate.

## Separation of concerns
Story State = canonical people, choices, memories, in-world events; never derives mastery from a choice.
Learning State = independently demonstrated Mandarin competence by speech act/skill, recorded attempts, hint usage, assisted success, review schedule.
Curriculum State = approved level objectives, prerequisite scenes, introduction/recall/assessment, versioned authoritative source to be mapped to official HSK3 syllabus.
Story Director = stable typed graph of episodes/scenes and bounded optional branching; can vary flavor but cannot skip mandatory teaching/exams.
Presentation = background/sprite/dialogue/animation separate, subtitle in HTML, accessible input and voice fallback.

## Ordered dependencies and release gates
P0 V2–V4 complete (prototype foundation): guided 10-scene demo, input, hint-aware scores, persistence, small school checkpoint, beginner sentence tiles, in-story notebook. Not complete HSK1.
P1 V5 delivered scope: two genuine scene choices with immediate authored consequences, persisted canonical choice memory, branching-line translation, and safeguards keeping every student on the required learning path. Validation and regression tests. This is deterministic branching, not free-form AI.
P2 V6 full HSK1 episode: replace fixed indexed arrays with data-driven validated graph, natural non-quiz interludes, story stakes and recap, repeated expressions in separate contexts, instructor-reviewed HSK3 curricular mapping, pilot feedback. No claimed level completion without coverage evidence.
P3 V7 realtime AI: LiveKit/Pipecat evaluation of streaming Chinese ASR/TTS and LLM with server-side secrets, bounded act selection, narration canon guard, hard rate limits, logging without raw speech by default, age-appropriate safety, real-device P50/P95 benchmarks and fallback to text.
P4 V8 art identity: model sheets for five named characters, expression sprites, original 2D backgrounds and crop-aware composition in all released scenes, rights/provenance inventory, hand-inked consistent aesthetic and UI accessibility review.
P5 V9–V12 HSK2→HSK5 authoring: each new act validated by native editor and subject specialist, meaningful spaced retrieval/competency exams, continuing story memory. HSK5 final long-form writing OR translation with rubric, teacher-calibrated examples, never fabricated official exam grades.
P6 operational readiness: auth only if needed for sync, secure AI proxy, child/minor privacy and consent review, observability, abuse protections and spend caps, rollback strategy, mobile/desktop E2E and usability testing.

## V5 objective tests
- Each choice's options have zh+vi, unique stable IDs, no skips; graph validates nextScene=afterScene+1, before exam.
- User must decide once after scenes 2 & 4 before moving on, without affecting HSK scoring.
- Choice changes follow-up narration at scenes 3 & 5; persisted choice appears in notebook.
- Old progress is compatible; choice doesn't reappear after reload, retake preserves choices, full replay resets.
- HTML/CSS/JS syntax/DOM refs; mock interaction regression; deployment READY and production assets HTTP 200.
- Real browser E2E, official syllabus coverage, native Mandarin language review and user image-reference art production are NOT yet completed.

## Risk/priority
Highest remaining risk is shallow pedagogy: ten template-graded scenes cannot establish HSK1 proficiency. Focus the next sprint on *quality and depth of episode one* rather than scattering shallow filler to HSK2–5. Second risk: art drift, resolve with approved art bible and original sprite pipeline; third: expensive, unsafe uncontrolled AI; build backend only with limits and evaluators.
