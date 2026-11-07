# HSK1 story stages: current completion record

**Status:** partial, not released. Runtime tasks 10–17 provide common delayed recall for greeting, self-introduction, student identity, noodle ordering, price, numbers, gratitude and farewell. The complete HSK1 map and Mandarin copy still need qualified educator review; this is not a claim of full HSK1 coverage or validated learning outcomes.

## Current state and stable IDs

Tasks 0–9 in `content-manifest.js` and `curriculum-data.js` retain their existing positions, accepted answers and recorded evidence. The branch-learning runtime appends five new rows; prior task IDs and the path/evidence split remain intact.

| Task | Common story anchor | Learning purpose | Response target |
|---:|---|---|---|
| 10 | `week-later-shop` | Order noodles from bà Lưu after a week-long story time-skip | `我想吃面条` and reviewed authored variants |
| 11 | `week-later-home` | Recall the quoted noodle price to Mẹ | `十块钱` and existing accepted variants |
| 12 | `week-later-count` | Count An, Tiểu Vũ and one classmate as a group | A three-person count using `个` |
| 13 | `week-later-thanks` | Thank Tiểu Vũ for lending An a pencil | `谢谢你` or `谢谢` |
| 14 | `week-later-goodbye` | Respond when Tiểu Vũ says she is heading home | `明天见` or `再见` |
| 15 | `week-later-home-checkin` | Answer Mẹ's check-in before An's reply is narrated | `我还好，谢谢` and authored variants |
| 16 | `week-later-count` | Introduce An to a new classmate | `我叫安`, `我叫明安` or `我是安` |
| 17 | `week-later-count` | Tell the new classmate that An is a student | `我是学生` and reviewed authored variants |

These tasks are common to every story route. Each assesses one candidate objective. Tasks 10–17 appear as separate delayed-recall entries in the machine-readable objective report; they do not count as common story reuse. Wrong, assisted or skipped answers affect learning evidence only; they do not change story choices, relationship values or endings. The “one week later” interval is narrative time, not a validated real-world spacing schedule.

The task 14 prompt no longer displays an accepted Chinese answer before the learner responds. Tiểu Vũ says `我先回家了。`; the requested farewell model remains behind help. This protects the independent-recall attempt without changing its accepted variants.

The objective report links `day2-liu` to ordering, price and gratitude reuse; gratitude has a brief unscored model when An receives his noodles, then retains delayed task 13 as its separate recall checkpoint. Numbers has a shared model in `day2-counting-group` before week-later task 12. The later school scene now gives the new classmate a clear reason to ask An's name and whether he studies there; tasks 16–17 recall those objectives separately without splitting task 7's historical combined evidence. The greeting checkpoint appears after Mẹ's question and before An's narrated reply. No objective is release-ready; verified HSK item matches and educator approvals remain zero.

## Compatibility and continuity

- Learning rows 0–14 and all existing accepted-answer rubrics are retained. Old ten-row, twelve-row and fifteen-row snapshots normalize to eighteen rows; appended rows start unanswered.
- `week-later-ending` keeps its stable node ID and is now a passage into `week-later-count`. A save made at the former endpoint resumes there; the player can continue into the new shared recall segment without replaying earlier route choices.
- Story path and learning evidence remain separate. Rewinding a story choice does not erase recorded learning results.
- The route audit checks all 37 choice options for a reachable consequence and convergence to the next mandatory anchor. The common delayed-recall route reaches tasks 10–14 in order.

## Remaining gaps and review

Tasks 15–17 add separate delayed recall for greeting, self-introduction and student identity. Task 7 remains a historical combined response for self-introduction and student identity; its result is not split or reinterpreted. Tasks 8–9 remain the existing early price/order recall and are not replaced by the new delayed tasks.

The curriculum mappings are candidates, not verified official HSK 3.0 item matches. Before marking a task approved, a qualified Mandarin educator should check the exact context, Chinese text, Pinyin, accepted alternatives and objective crosswalk. No public claim of HSK1 completeness, exam readiness or learning effectiveness is supported yet. Session duration remains an editorial 10–15 minute target and has not been measured with learners.

## Verification completed locally — 2026-11-07

- All 434 Node logic and integration tests passed, including delayed task-to-objective mapping, the meal-to-price-recall continuity bridge, separate greeting/name/identity recall, the shared gratitude reuse and no-answer-leak checks.
- The current story audit covers 53 nodes, 12 choice nodes, 37 options, 18 learning tasks and 10 segments; no reachable-consequence or convergence gaps across 1,259,712 structural paths.
- Edge browser smoke passed 833 layout states. Edge branch integration covers four complete routes (702 states) at desktop, short-phone, phone-landscape and tablet-portrait sizes; each reaches all 18 learning rows and has no page or content overflow. Sẻ appears once in the story stage and leaves the three authored home scenes. A save-replay fixture verifies that old route choices and ten existing learning rows remain intact while tasks 10, 15 and 11 continue in story order; desktop and phone passed. The gratitude and farewell checkpoints hide their accepted answers, and the `day2-liu` model does not change saved learning evidence.
- The approved kitchen now uses five separately generated background plates (desktop, square phone, portrait-tablet stage, ultra-wide and short landscape) with PNG masters, optimized WebP files and prompt records in the repo. Backgrounds contain no birds or characters; An, Mẹ and one Sẻ remain separate renderer layers. Edge captures were visually checked at desktop, 390 px phone, 768 px tablet and short landscape; the kitchen passed 35 integrated states across seven branches and five responsive compositions.
- Latest Edge regression covers four complete story routes in 702 states; each reached all 18 learning rows. All 434 Node tests, the 53-node story graph audit and release package-input audit pass. Old save migration, route choice replay, single-Sẻ visibility and viewport/content fit remain covered.

Teacher/native-speaker review, measured learner outcomes, signed-in Preview checks and physical-device checks remain release gates. Vercel currently reports a READY Preview for `ba7d131`; the local delayed-recall and new kitchen-image changes are not included in that deployment yet. No Production deployment or custom-domain change was made.
