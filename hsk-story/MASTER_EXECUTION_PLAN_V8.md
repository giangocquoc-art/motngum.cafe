# 两个故乡 — Master Execution Plan V8
Updated: 2026-10-26. Target: https://hsk.motngum.cafe. Source: giangocquoc-art/motngum.cafe/hsk-story.

## Product brief: preserve exact user intent
One immersive 2D Chinese-learning visual story, not a collection of unrelated quizzes or flashcards. You live as Minh An, a Vietnamese child who moves with mother to Chengdu with little Mandarin, carrying her gifted notebook. Recurring characters are 小雨 (first friend), 王老师 (teacher), 刘奶奶 (neighborhood food stall owner). One continuous path from HSK1 to HSK5, nothing beyond HSK5. At HSK5 graduation the player chooses a Chinese essay on 我的两个故乡 OR a Chinese→Vietnamese passage translation, assessed by separate rubrics. In-world assessments are NOT official HSK certificates.
Five plot acts: HSK1 newcomer and school; HSK2 friendship and daily life; HSK3 Vietnam–China spring cultural fair; HSK4 nuanced threat to Liu Nainai's eatery; HSK5 identity/return to Vietnam/two hometowns. Each act has growing language sophistication, consistent canon, natural consequences, language exposure, and an end-of-act school evaluation.
Visual invariant: original hand-inked everyday 2D drawing inspired by the supplied reference: irregular thin outlines, muted paper-like cream/terracotta/sage/blue-gray, restrained emotion, human proportions, lived-in Chinese places. Never copy a protected reference image, switch to glossy 3D/anime or embed required educational Hanzi as image text. Make backgrounds, sprites, HTML captions, movement separate. Current SVG is temporary artwork, NOT reference-quality final art.

## Audit: the V7 baseline and missing product experience
Already shipped: 5-level roadmap; HSK1 demo of ten stable numbered scenes (7 guided practice, 3 class checkpoints); five ungraded story pages; two microbranches, diary memories, beginner sentence tiles, opt-in vocabulary, hint-aware grading, saved progress/retake, versioned content manifest and source/curriculum linkage validation, successful GitHub Node regression suite.
Critical remaining product gap: player is still mostly in a "NPC asks → type answer → next" pattern. Learning transfers are not independently observed in different real-life situations. Emotional stakes are told but seldom experienced through interactive actions.
Technical constraints: older saves reference numeric scene indices; we MUST NOT insert/reorder them until deliberate data migration. Tests must verify all previous learning and story paths, and temporary browser speech must not be represented as phonetic/tonal assessment.

## V8 active story episode — the missing notebook
This is an authored, deterministic mid-episode microquest inserted BEFORE existing scene 4 (lunch), without changing any of the ten original scene IDs. The school notebook gifted by An's mother goes missing after class. Player investigates two distinct objects among classroom desk, schoolbag, classroom doorway; decides whether to ask Xiao Yu for help or seek guidance from Wang Laoshi; both choices converge at a school office. A staff member asks 你叫什么名字？, a genuinely different context for an expression already introduced in scene 1. Correct answer can be 我叫安, 我叫明安, or 我是安. The notebook is recovered. On the walk home (scene 6), later narration remembers who helped. In the ending, the diary/mother's first message returns with an emotional callback.
Quest includes no spontaneous LLM, no random result, no HSK test leakage. Inspect/decision actions do not count as vocabulary mastery. Personal-introduction transfer is recorded SEPARATELY from three school checkpoint questions. Support tiers: right on first attempt independently / correct after wrong trial / correct with explicit hint / viewed sample after two errors. Story stays playable for stuck users, but these outcomes get separate labels.

## V8 technical implementation
- active-encounter.js: localized content, validated object/route lists, explicit small state machine, deterministic transitions, feedback, source scene references, sanitization and old-save migration.
- app.js: quest render, inspect and choose, staff response typed input, hints and failure recovery, saved draft, safety gate so scene 4 cannot be bypassed while active, source diary callback at scene 6, story memory and chapter epilogue.
- index.html/style.css: in-world interactive panel styled consistently with parchment/ink UI, keyboard focus, screen reader labels/live feedback, responsive mobile layout, safe content.
- Tests: two branch routes, two unique clues required, invalid route/attempt rejected, wrong+retry, hint, sample, saved route/draft, checkpoint score unaffected, old save migration, replay and retake, future callback, state validation.
- All files scoped to hsk-story/, no parent root changes, no other Vercel or Cloudflare DNS changes.

## V8 definition of done
1. Quest appears between scene3→4 for NEW players and is NOT counted as an additional HSK official test; all existing scene IDs 0–9 unchanged.
2. Both routes return to mandatory scene4; neither route unlocks checkpoints or language mastery automatically.
3. Source practice concept is previously encountered in scene1, no unexpected skill required in transfer.
4. Assist usage, wrong attempts and sample are reliably separated; transfer result never affects original 3/3 class checkpoint score.
5. Notebook, chosen route and drafted answer survive reload; older users who already passed lunch skip the new quest rather than losing progress. Full replay begins it anew, retake checkpoints does not.
6. Lesson, narrative, 2 previous choices, 5 story pages and close/open game still work on mobile and desktop, with accessible controls.
7. GitHub Actions JavaScript syntax and Node tests green at the reviewed commit; Vercel HSK production same SHA READY, custom-domain HTML/CSS/JS 200 and runtime error scan no new issues.
8. Don't claim real browser E2E, native Mandarin/HSK3 curriculum approval, phonetic assessment, copyrighted reference-art recreation or whole HSK1 completion without distinct evidence.

## Subsequent roadmap, dependency order
V9: Extract complete authored first-episode graph with stable string scene IDs and deliberate legacy ID migration, three-act narrative, interactive observation and relationship callbacks, and authentic transfer evidence. Professional Mandarin editor reviews all Chinese/Pinyin/naturalness; pilot genuine beginners.
V10: Source-pin official HSK 3.0 vocabulary/Hanzi/grammar/skills edition; map every HSK1 target to introduction, reuse, delayed independent retrieval, multiple modalities and school exam; expand cohesive episodes until reviewed coverage complete. This is NOT an HSK certification.
V11: Add bounded realtime AI NPC: server-controlled Story Director, voice ASR/TTS provider benchmarks for Vietnamese-accent Mandarin, safety/privacy and minor protections, output validator preserving canon and HSK difficulty, rate/spend caps, no client secrets, typed fallback and actual accuracy/latency metrics.
V12: Produce the original approved 2D art kit: reference sheets for An (age progression), mother, Xiao Yu, Wang teacher and Liu Nainai; expressive transparent sprites, scene backgrounds, animation layers, asset rights/provenance and real mobile crops.
V13-16: Author and pedagogically validate HSK2→5 sequentially with relationship memory, escalating plot stakes and competency tests. HSK5 ends with essay or bilingual translation graded under separate calibrated rubrics.
Production: optional accounts only if multi-device sync needed, minimal personal data, child voice consent and deletion, security/abuse tests, performance/accessibility, browser E2E and rollback, isolate HSK from shared Vercel-repo unrelated-build churn through a separately approved migration.

## Non-goals and known risks
V8 is NOT full HSK1 coverage, official examination readiness, unrestricted AI roleplay, reliable tone grading or final illustration asset production. Real-device visual and browser tests still needed. Keep explicit progress labels and don't misstate a short demo as proficiency.
