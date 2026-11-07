# HSK1 story stages: current completion record

**Status:** partial, not released. Runtime tasks 10–14 now provide common delayed recall for noodle ordering, price, numbers, gratitude and farewell. The complete HSK1 map and Mandarin copy still need qualified educator review; this is not a claim of full HSK1 coverage or validated learning outcomes.

## Current state and stable IDs

Tasks 0–9 in `content-manifest.js` and `curriculum-data.js` retain their existing positions, accepted answers and recorded evidence. The branch-learning runtime appends five new rows; prior task IDs and the path/evidence split remain intact.

| Task | Common story anchor | Learning purpose | Response target |
|---:|---|---|---|
| 10 | `week-later-shop` | Order noodles from bà Lưu after a week-long story time-skip | `我想吃面条` and reviewed authored variants |
| 11 | `week-later-home` | Recall the quoted noodle price to Mẹ | `十块钱` and existing accepted variants |
| 12 | `week-later-count` | Count An, Tiểu Vũ and one classmate as a group | A three-person count using `个` |
| 13 | `week-later-thanks` | Thank Tiểu Vũ for lending An a pencil | `谢谢你` or `谢谢` |
| 14 | `week-later-goodbye` | Respond when Tiểu Vũ says she is heading home | `明天见` or `再见` |

These tasks are common to every story route. Each assesses one candidate objective. Tasks 10–14 now appear as separate delayed-recall entries in the machine-readable objective report; tasks 10–14 do not count as common story reuse. Wrong, assisted or skipped answers affect learning evidence only; they do not change story choices, relationship values or endings. The “one week later” interval is narrative time, not a validated real-world spacing schedule.

The task 14 prompt no longer displays an accepted Chinese answer before the learner responds. Tiểu Vũ says `我先回家了。`; the requested farewell model remains behind help. This protects the independent-recall attempt without changing its accepted variants.

The objective report links `day2-liu` to ordering, price and gratitude reuse; gratitude now has a brief unscored model when An receives his noodles, then retains delayed task 13 as its separate recall checkpoint. Numbers has a shared model in `day2-counting-group` before week-later task 12. That passage belongs to the school segment and shows An, Tiểu Vũ, a visually distinct classmate, cô Vương and one Sẻ perched on the classroom window sill. Greeting has common reuse at home before the price checkpoint but still lacks individually measured recall. Four sequences remain incomplete: greeting, self-introduction, student identity and farewell. No objective is release-ready; verified HSK item matches and educator approvals remain zero.

## Compatibility and continuity

- Learning rows 0–9 and all existing accepted-answer rubrics are retained. Old ten-row and twelve-row snapshots normalize to fifteen rows; new rows start unanswered.
- `week-later-ending` keeps its stable node ID and is now a passage into `week-later-count`. A save made at the former endpoint resumes there; the player can continue into the new shared recall segment without replaying earlier route choices.
- Story path and learning evidence remain separate. Rewinding a story choice does not erase recorded learning results.
- The route audit checks all 37 choice options for a reachable consequence and convergence to the next mandatory anchor. The common delayed-recall route reaches tasks 10–14 in order.

## Remaining gaps and review

Greeting, self-introduction and student-identity do not yet have separate delayed independent recall. Task 7 remains a historical combined response for self-introduction and student identity; its result must not be split or reinterpreted. Tasks 8–9 remain the existing early price/order recall and are not replaced by the new delayed tasks.

The curriculum mappings are candidates, not verified official HSK 3.0 item matches. Before marking a task approved, a qualified Mandarin educator should check the exact context, Chinese text, Pinyin, accepted alternatives and objective crosswalk. No public claim of HSK1 completeness, exam readiness or learning effectiveness is supported yet. Session duration remains an editorial 10–15 minute target and has not been measured with learners.

## Verification completed locally — 2026-11-07

- All 429 Node logic and integration tests passed, including delayed task-to-objective mapping, the meal-to-price-recall continuity bridge, the shared gratitude reuse and the task 14 no-answer-leak regression.
- Story audit passed: 53 nodes, 12 choice nodes, 37 options, 15 branch tasks, 10 segments and zero reachable-consequence or convergence gaps across 1,259,712 structural paths.
- Edge browser smoke passed 833 layout states. Edge branch integration covers four complete routes (652 states) at desktop, short-phone, phone-landscape and tablet-portrait sizes; each reaches all 15 learning rows, keeps one visible Sẻ and has no page or content overflow. Before responding, the gratitude and farewell checkpoints hide their accepted answers; simply viewing the unscored `day2-liu` story model does not change saved learning evidence. The common meal and greeting passages precede the price checkpoint without displaying its answer. A save-replay fixture also verifies that a prior day-two choice remains in the journal and retains its relationship effects after insertion of the unscored classroom passage.
- The approved kitchen passed 35 integrated Edge states covering seven scene branches and five responsive compositions. The save-migration check passed desktop and phone: a former-ending save resumed at its stable node, preserved old choices/results and legacy progress keys, then recorded tasks 10–11 without replaying story decisions. The classroom count now has a separate transparent WebP sprite with its PNG master and prompt in the repo. Edge captures were visually checked at desktop, 320 px phone and 768 px tablet portrait; the later home check-in copy matches the standing poses without inventing a sit or unseen bag action.

Teacher/native-speaker review, measured learner outcomes, signed-in Preview checks and physical-device checks remain release gates. The prior `dd222b2` story batch has a READY Vercel Preview; the gratitude-reuse edit in the current local branch is not included in that deployment yet.
