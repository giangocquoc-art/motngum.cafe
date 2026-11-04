# Story session plan — HSK1 pilot

This file describes optional 10–15 minute reading sessions for the existing two-day branching story. The seven segments partition all 42 story nodes, including route and ending nodes. They organize the existing story; they do not change its choices, routes, saves, learning tasks, or progress rules.

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

The ordered task-to-segment mapping is total and unique: tasks 0–9 map to segments 1–6, with tasks 7–9 grouped in segment 6 because the existing learning runtime presents them at the `day2-bird` anchor. Segment 7 contains story reuse and no learning task. Segment-level `primaryObjectiveIds` limit the number of goals shown together; `taskObjectiveRefs` separately preserve the existing task-to-assessment-objective crosswalk (including all checkpoint objectives for tasks 7–9). These links are candidate mappings pending educator review; they do not assert that every story passage teaches or assesses an objective.

## Exposure and evidence

Tasks 0–6 are the existing guided practice scenes. Their appearance in a story segment means practice in context; a response there is not relabeled as an independent checkpoint. Tasks 7–9 are the existing separate typed-response checkpoints for self-introduction, recalling the price previously read in story context, and ordering. Task 8 is not an independent listening assessment. Story choices, callbacks, route memories, and narrative reuse create no language evidence.

The segment durations are editorial targets, not measured session analytics. A future interface may show the target duration or chapter name, but must continue to use the established story and learning runtimes for actual progression and evidence.

## Audit

Run `node scripts/audit-story-plan.cjs`. The audit checks that the plan covers every story node, choice node, common task, and HSK1 candidate objective; it checks the segment caps and ordering, asks the existing story engine validator to check graph invariants, verifies that each of the 37 options has a later reachable selected-only echo or callback, and checks that each choice reaches the next mandatory story anchor.

The graph has 1,259,712 structural paths. The audit checks each choice edge and uses memoized node reachability instead of enumerating those paths. It validates structural route reachability and the engine's condition invariants; it does not simulate every combination of historical flags or measure actual player duration.
