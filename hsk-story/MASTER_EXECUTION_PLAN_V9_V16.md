# Hai quê hương — Execution ledger V9–V16 (2026-10-26)

Production target: https://hsk.motngum.cafe. One emotionally coherent five-act story for Minh An in Chengdu; HSK1 new school, HSK2 friendship, HSK3 spring cultural fair, HSK4 help Liu Nainai with a nuanced neighborhood dispute, HSK5 graduation and two hometowns. Finale: original Chinese essay 我的两个故乡 OR meaningful Chinese-to-Vietnamese translation, different rubrics, no official certificate.

## Scope implemented now
V9: stable string story IDs layered over legacy 0–9 scene indices, authored graph of interludes, branches, active diary quest, learner sampler; backward-compatible localStorage sceneRef plus numeric fallback. Optional scene objects in arrival street and walk home (6 objects, observations are NOT graded). Player remains in the same one story, no detached exercise dashboard.
V10 partial foundation: 8 DEMO learning objectives with specific scenes and source-linked review status, two-item optional reading/listening practice before internal school checkpoint. Reading is text comprehension; listening uses browser TTS which can be unavailable and therefore must remain unassessed if not played. No fabricated speaking or writing proficiency. School score unchanged. NOT a full official HSK1 curriculum.
V11 and V12: NOT implemented here; Codex handoff defines server-side safe AI NPC, STT/TTS and original 2D hand-drawn visual system. User will use Codex for actual providers and image generation.
V13–V16: 16 episode outlines authored across four acts with conflict, choice, skill goals, callback and resolution, stored in future-acts.js. They remain NOT PLAYABLE until professionally reviewed and built.

## Curriculum source and quality gates
Chinese Test official syllabus: https://www.chinesetest.cn/syllabus . HSK framework: https://www.chinesetest.cn/HSK . Official HSK3.0 launch notice: https://old.chinesetest.cn/gonewcontent.do?flag=kdnew&id=51336883 , dated to launch on 2026-12-13.
All 8 pilot objectives remain awaiting official item-by-item match and Mandarin native educator review. Only declare HSK1 coverage after obtaining the actual authoritative edition-pinned source, mapping every task, topic, vocabulary term, Hanzi and grammar item, then verifying introduction, repeat, independent transfer, skills and exam rubric. Do not invent pass marks based on limited internal checkpoints.
Past V8 pilot: 10 scenes (7 practice, 3 in-world school test), 5 interludes, 2 choice points and a lost-notebook story quest, saved progress, notebook and beginner scaffolds. Existing scene IDs and stories must not be reordered; future graph expansions require a deliberate versioned migration.

## Architecture and dependencies
Story Graph is canonical scene-ref identity and event prerequisite map, separate from story text and DOM. The interface persists sceneRef while preserving numeric step for old saves, records optional explored objects under worldSeen, and skillSampler outcomes separately from school history. Choices, diary retrieval, notes and learning evidence must remain distinct. Future LLM must never write canonical event/story state or grade unvalidated language.
Artwork must preserve user-selected original ink-lined 2D everyday picture-book style, faded cream/pink/sage/brown and natural human figures, with layered backgrounds, transparent character sprites, accessible HTML for Hanzi/translation; current SVG is placeholder.

## Next milestones / release conditions
1. Complete REAL HSK1 program: teacher-reviewed official HSK3.0 target matrix; many authored scenes and listening/reading/speaking/writing evidence with authentic sources, independent recall at later occasions, accessibility and beginner pilot.
2. Codex AI V11: safe independent server, model output constrained by Story Director, Mandarin ASR/TTS evaluated on Vietnamese-accented Mandarin, real cost/latency data, minimal audio retention, explicit mic consent and fallback typing. No client API keys.
3. Codex art V12: first approved scene model sheet and five stable characters, background/sprite layers and original licensed visuals; then scale to full scenes after human review and 360px/desktop QA.
4. HSK2–5: expand 16 planned episodes in order with source-mapped Chinese dialogue and internal exam; maintain mother/notebook and relationships. HSK5 essay/translation separate rubrics.
5. Security/operations: age-appropriate privacy for minors, optional account only for real sync, rate limits, CI, real browser mobile/desktop screenshots, rollback, Vercel exact SHA and HTTP/TLS. Do not modify parent website or unrelated Vercel apps.

## Release definition
Automated Node tests and syntax checks green, exact Git SHA READY in HSK Vercel project, live hsk.motngum.cafe HTML/CSS/JS 200 and no runtime error clusters. Still report real browser E2E and qualified Mandarin/art review as outstanding if unverified. A partial release is better than claiming V10, V11–V16 fully shipped.
