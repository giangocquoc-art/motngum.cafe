# Story session plan — HSK1 pilot

This file describes editorially targeted 10–15 minute reading sessions for the current branching story. The ten segments partition all 49 story nodes, including route and ending nodes. Three common delayed-recall segments were added for numbers, gratitude and farewell; prior scene IDs and task positions 0–9 stay stable. Session duration is not measured yet.

All eight HSK1 objective links are candidate editorial crosswalks. The syllabus item mapping and qualified Mandarin educator review remain pending. The plan does not claim full HSK1 coverage, exam readiness, or teacher approval. HSK2–6 remain outline-only.

## Runtime-facing API

`story-session-plan.js` exports `ChimSeStorySessionPlan` in browsers and a CommonJS module in Node:

```js
const plan = require("./story-session-plan.js");
const segment = plan.getSegmentForScene("lost-diary");
const taskSegment = plan.getSegmentForTask(3);
```

The public methods are `getSegmentForScene(sceneId)`, `getSegmentForTask(index)`, `listSegments()`, and `validate(story, blueprint, content, learning, curriculum)`. A missing lookup returns `null`. Segment fields include stable `id`, `order`, `title`, target `durationMinutes`, `sceneIds`, `choiceSceneIds`, `taskIds`, per-task `taskObjectiveRefs`, `primaryObjectiveIds`, `stage`, and an editorial `stageNote`.

Treat the lookup as display metadata. It is not a route selector, lesson prerequisite, unlock, score, save field, or progress gate. `validate` is for authoring and audit only.

## Ordered segments

| # | Segment | Story choices | Common tasks | Candidate objectives |
|---:|---|---|---|---|
| 1 | Đến trường mới | `arrival` | 0 | `greeting` |
| 2 | Lớp học mới | `school-gate` | 1 | `introduce-self`, `student-identity` |
| 3 | Tìm quyển sổ | `lost-diary`, `staff-office` | 2, 3 | `numbers`, `introduce-self` |
| 4 | Bữa mì đầu tiên | `canteen`, `noodle-order` | 4 | `order-noodles`, `price` |
| 5 | Trên đường về và trang sổ | `walk-home`, `night` | 5, 6 | `gratitude`, `farewell` |
| 6 | Sáng thứ hai và chú chim sẻ | `day2-breakfast`, `day2-bird` | 7, 8, 9 | `introduce-self`, `student-identity` |
| 7 | Gặp lại bà Lưu | `day2-liu`, `day2-night` | — | `price`, `order-noodles` |
| 8 | Nhớ lại bữa mì | `week-later-shop`, `week-later-home`, `week-later-ending` | 10, 11 | `order-noodles`, `price` |
| 9 | Đếm nhóm, cảm ơn bạn | `week-later-count`, `week-later-thanks` | 12, 13 | `numbers`, `gratitude` |
| 10 | Hẹn gặp ngày mai | `week-later-goodbye`, `week-later-final` | 14 | `farewell` |

The ordered task-to-segment mapping is total and unique. Tasks 7–9 remain grouped at their existing `day2-bird` anchor. Tasks 10–14 add shared delayed recall for ordering, price, numbers, gratitude and farewell. Segment-level `primaryObjectiveIds` limit the number of goals shown together; `taskObjectiveRefs` separately preserve the task-to-assessment-objective crosswalk. These links are candidate mappings pending educator review; they do not assert that every story passage teaches or assesses an objective.

At the end of either arrival route (`arrival-street` or `arrival-mother`), the player reaches an unscored recall prompt at `school-gate`, before common task 1. It reminds the learner that An's mother asked whether he was okay, without showing Chinese text before the first attempt. It is an authored retention probe for the first practice, not a graded HSK checkpoint or mastery claim, and not yet validated with learners. A wrong answer can be retried; optional help is gated until after an attempt; skipping records only that it was skipped. Raw text is not persisted. Story route memories and learning evidence remain unchanged.

## Exposure and evidence

Tasks 0–6 are the existing guided practice scenes. Their appearance in a story segment means practice in context; a response there is not relabeled as an independent checkpoint. Tasks 7–9 remain the existing separate typed-response checkpoints. Tasks 10–14 add delayed independent responses after a week-later story visit; wrong, assisted and skipped responses record learning evidence only and do not alter narrative state. Task 8 is not an independent listening assessment. Story choices, callbacks and route memories create no language evidence.

The blueprint report's `pilotStageCoverage` separates introduction, common-story reuse, individually measured independent recall and optional review. The new delayed tasks provide a second independent opportunity for numbers, gratitude and farewell; they do not complete the full objective set. Task 7 remains one historical combined response for name and student identity, so it does **not** count as separate evidence for either objective. Source matching, educator review and learning-outcome validation remain open.

The segment durations are editorial targets, not measured session analytics. A future interface may show the target duration or chapter name, but must continue to use the established story and learning runtimes for actual progression and evidence.

## Audit

Run `node scripts/audit-story-plan.cjs`. The audit checks that the plan covers every story node, choice node, common task, and HSK1 candidate objective; it checks the segment caps and ordering, asks the existing story engine validator to check graph invariants, verifies that each of the 37 options has a later reachable selected-only echo or callback, and checks that each choice reaches the next mandatory story anchor.

The graph has 1,259,712 structural paths. The audit checks each choice edge and uses memoized node reachability instead of enumerating those paths. It validates structural route reachability and the engine's condition invariants; it does not simulate every combination of historical flags or measure actual player duration.
