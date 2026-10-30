# HSK 3.0 curriculum source map (2025 edition)

**Status: complete level 1–6 source locator inventory; partial instructional crosswalk; no claim of full HSK coverage, exam readiness, or certification.** The inventory records stable IDs, printed pages, source hashes, and official section totals without copying the syllabus tables. It does not mark Chim Sẻ objectives as verified.

## Edition and source

- Issuer: 中外语言交流合作中心, *HSK 考试大纲 / Syllabus for the Chinese Proficiency Test*.
- Published: November 2025. Effective: July 2026. The official notice schedules worldwide HSK 3.0 launch for December 13, 2026; the syllabus effective date and exam rollout date are separate.
- Official launch notice: https://old.chinesetest.cn/gonewcontent.do?flag=kdnew&id=51336883
- Official landing page: https://www.chinesetest.cn/syllabus
- Direct official PDF: https://hsk.cn-bj.ufileos.com/3.0/%E6%96%B0%E7%89%88HSK%E8%80%83%E8%AF%95%E5%A4%A7%E7%BA%B21219.pdf
- Page numbers below are the printed page numbers in that PDF. The syllabus organizes each level by tasks, topics, vocabulary, Chinese characters, and grammar.

## Level map

Each page number is the section's starting page. These are locators for teacher review, not references to matched items. See `learning-blueprint.js` for the machine-readable objective registry, per-component review state, story stages, and release gates.

| HSK 3.0 level | Printed page starts: tasks · topics · vocabulary · characters · grammar | Story arc theme | Chim Sẻ content status |
| --- | --- | --- | --- |
| 1 | 2 · 56 · 77 · 353 · 383 | Ngày đầu xa nhà | Ten existing lesson/checkpoint records; eight candidate objectives; item alignment pending |
| 2 | 6 · 58 · 84 · 355 · 386 | Người bạn đầu tiên | Six curated story-spine candidates; candidate vocabulary rows and grammar/character locators recorded; item match and educator review pending |
| 3 | 11 · 60 · 89 · 356 · 389 | Hội chợ mùa xuân | Six curated story-spine candidates; candidate vocabulary rows and grammar/character locators recorded; item match and educator review pending |
| 4 | 18 · 63 · 102 · 358 · 392 | Khi mọi chuyện thay đổi | Six curated story-spine candidates; candidate vocabulary rows and grammar/character locators recorded; item match and educator review pending |
| 5 | 29 · 66 · 127 · 361 · 395 | Hai quê hương | Six curated story-spine candidates; candidate vocabulary rows and grammar/character locators recorded; item match and educator review pending |
| 6 | 37 · 69 · 167 · 364 · 398 | Những điều An muốn gửi lại | Six curated story-spine candidates; candidate vocabulary rows and grammar/character locators recorded; item match and educator review pending |

## Complete source locator inventory

`hsk30-syllabus-inventory.json` covers all five official sections for HSK 3.0 levels 1–6. It stores stable task, raw topic-page-row, geometry-derived topic-cell, vocabulary-row, recognition-character, grammar-page, and geometry-derived grammar-source-row IDs with printed-page locators, cell coordinates, and SHA-256 source checks; it does not reproduce the source lists or table wording. Topic parents follow merged cell geometry across page continuations. Grammar effective cells include explicit source-cell IDs and bounding boxes, so inherited categories remain traceable to the original page, table row, and column. Diagonal watermark spans are excluded during cell hashing. The pypdf zero-based page index is the printed page plus 2; the PDF's one-based page number is the printed page plus 3.

| HSK level | Tasks | Official topic nodes (tier 1 / 2 / 3) | Vocabulary rows | Recognition characters | Grammar pages | Extracted grammar source rows* |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 1 | 15 | 5 / 15 / 30 (50) | 300 | 246 | 3 | 70 |
| 2 | 17 | 5 / 18 / 34 (57) | 200 | 125 | 3 | 78 |
| 3 | 22 | 6 / 22 / 54 (82) | 500 | 284 | 3 | 96 |
| 4 | 30 | 7 / 31 / 77 (115) | 1,000 | 441 | 3 | 95 |
| 5 | 28 | 7 / 29 / 72 (108) | 1,600 | 431 | 3 | 70 |
| 6 | 24 | 7 / 25 / 68 (100) | 1,800 | 413 | 2 | 50 |
| **Total** | **136** | **37 / 140 / 335 (512)** | **5,400** | **1,940** | **17** | **459** |

*The syllabus publishes no grammar item IDs or row total. These 459 records are geometry-extracted physical table rows with a detail or grammar-content cell, not an official grammar-item count. Topic tier counts match the six printed footers; the topic table contains 512 cell nodes across 344 raw layout rows. A page-level geometry review on 2026-10-30 covered topic pp.56–71 and grammar pp.383–399. It found no visible missing/extra topic cells, broken topic parent links, or obvious grammar row-boundary errors; the headerless p399 continuation was checked against p398. This was a layout/geometry review, not a word-by-word source transcription check. Chinese cell text, grammar content, and educator alignment remain unverified. The locator inventory is not an instructional sequence or an item-level objective crosswalk.

## Objective registry and release state

The registry contains eight HSK1 candidate goals linked to the existing ten lesson/checkpoint records, plus six curated story-spine candidates for each of HSK2–6. Each future candidate includes vocabulary serials and exact printed pages checked against `candidate-source-index.json`, target-level grammar entries with page locators, and every candidate Hanzi's recognition-list level, ordinal, and printed page. Candidate references link to stable IDs in the full locator inventory. Task/topic cues, planned practice skills, exam-section references, prerequisites, episode intro/reuse/checkpoint links, and hint policy are also recorded. These candidates are **not a complete instructional map or teacher-approved match**.

`candidate-source-index.json` is a focused extraction fixture for the pinned official PDF. It records 78 selected vocabulary row references, 151 per-level character locators, and 46 target-level grammar entry locators. Validators compare candidate content against this independent fixture, including the selected row Hanzi/Pinyin/page, character-list ordinal/page, and target-level grammar source/page. The fixture improves traceability but does not replace human review of task/topic alignment, grammar use in dialogue, Pinyin, glosses, or instructional suitability.

Each objective carries a stable ID, level, topic, candidate task, prerequisite IDs, five section locators, item-review status for each component, candidate language content, story practice stages, hint rules, and educator sign-off. A component may later be marked `reviewed-match` only when exact official item IDs are recorded; `reviewed-no-match` records a reviewed gap without claiming a match. A level remains locked until its objectives, language content, practice sequence, official mapping, and educator review are complete.

The current pilot has eight candidate goals and zero verified official items. All eight have authored introduction, later reuse, and recall opportunities. Some reuse/checkpoint activities live in optional spaced review rather than the mandatory story route; these are editorial opportunities, not evidence of full HSK1 coverage. HSK2–6 now have authored branch treatments and six candidate learning strands per level, but no approved item crosswalks, educator sign-off, authored assessments, or playable content. All remain locked.

Future objective stages are ordered as introduction in context, later reuse, and a separate independent recall beat. Prerequisite links are explicitly soft prior-exposure suggestions, never mastery gates or runtime unlocks. HSK1 retains author-proposed links; HSK2–6 have no mapped prerequisite links yet because their item crosswalk and educator review are still pending. Validation rejects links whose introductory exposure would occur after the dependent goal. The recall beat may be a distinct assessment beat inside the capstone episode; it must follow the story interaction and use a non-revealing prompt. `future-branch-decisions.json` records two authored options for each of the 20 future episodes: each has its own reaction, memory value and later callback, then rejoins before the same six candidate learning anchors for its level. `future-branch-runtime.js` compiles only HSK2 into an internal author-preview graph and exhaustively checks its 16 routes. A declarative route-matrix test enumerates all 16 authored choice combinations for every HSK2–6 act; HSK3–6 are still not runtime graphs. None of these plans is loaded by the game; HSK2–6 remain locked, no HSK1 save schema is changed, and no branch may skip a common learning objective.

## Existing level 1 objective crosswalk

The labels below are authored lesson goals. Their HSK 3.0 page references are candidate review locations, **not verified item matches**. The current map has no official syllabus item IDs or educator sign-off, so the official match count stays zero. `curriculumSceneIds` preserve the current 10-record lesson/checkpoint contract; their IDs remain stable. `assessmentObjectiveIds` separately records only goals directly evaluated by each accepted answer, avoiding credit for language that merely appears in a scene.

| Stable objective ID | Current lesson/checkpoint scene IDs | Candidate source level | Alignment |
| --- | --- | --- | --- |
| `greeting` | 0, 1 | 1 | Scene 0 checks the reply to a check-in; optional reuse practices both the check-in response and a hello, with a combined independent recall item |
| `introduce-self` | 1, 2, 7 | 1 | Exact task, topic, word, character, and grammar matching pending |
| `student-identity` | 2, 3, 7 | 1 | Exact task, topic, word, character, and grammar matching pending |
| `numbers` | 3 | 1 | Scene 3 checks counting; optional recognition/reading cards provide later practice and recall |
| `order-noodles` | 4, 5, 9 | 1 | Exact task, topic, word, character, and grammar matching pending |
| `price` | 5, 8 | 1 | Scene 8 is text-based recall, not listening evidence; `price-ten` is optional reuse |
| `gratitude` | 5 | 1 | Scene 5 evaluates thanks; reuse and typed recall are optional review items |
| `farewell` | 6 | 1 | Scene 6 evaluates accepting the invitation; later reading and typed recall are optional review items |

## Verification gaps

- Level 1: map each authored objective to exact official rows/items across all five syllabus components; confirm the Chinese, Pinyin, Vietnamese glosses, accepted variants, difficulty, and scene sequencing with a qualified Mandarin/HSK educator. The three in-story checkpoints and optional review cards are formative tasks, not official exam items.
- Levels 2–6: the source locator inventory is complete, but six curated story-spine candidates per level are not a complete set of instructional objectives. The page-level geometry review is complete; perform a full cell-text and item transcription check, then verify every candidate row, Chinese form, Pinyin, Vietnamese gloss, grammar structure, topic/task relationship, character list, and skill activity with a qualified educator. Expand the crosswalk to the level's complete planned learning objectives before authoring playable lessons.
- Exam section references are separated from Chim Sẻ practice claims: the current official pages list listening/reading for levels 1–2 and listening/reading/writing for levels 3–6. The app has no validated native listening, speaking, handwriting, or exam-grade writing evidence.
- Do not infer listening or speaking proficiency from browser TTS or speech recognition; no validated native recordings, pronunciation rubric, or handwriting evidence is established here.
- Keep story choice outcomes separate from learning evidence. Lesson completion is not HSK readiness or a certificate.
- Recheck the official source and any replacement edition before future release claims.
