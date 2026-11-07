"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const story = require("../duong-re/branch-data.js");
const engine = require("../duong-re/branch-engine.js");
const blueprint = require("../learning-blueprint.js");
const content = require("../content-manifest.js");
const curriculum = require("../curriculum-data.js");
const learning = require("../duong-re/branch-learning.js");
const plan = require("../story-session-plan.js");
const { audit, canReach, nextAnchor } = require("../scripts/audit-story-plan.cjs");

test("session plan partitions all 49 nodes, 15 branch tasks, and eight candidate objectives", () => {
  assert.deepEqual(plan.validate(story, blueprint, content, learning, curriculum), []);
  assert.equal(plan.segments.length, 10);
  assert.deepEqual(plan.segments.map(segment => segment.order), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  assert.ok(plan.segments.every(segment => segment.durationMinutes.min === 10 && segment.durationMinutes.max === 15));
  assert.ok(plan.segments.every(segment => segment.choiceSceneIds.length <= 2));
  assert.ok(plan.segments.every(segment => segment.primaryObjectiveIds.length >= 1 && segment.primaryObjectiveIds.length <= 2));
  assert.equal(new Set(plan.segments.flatMap(segment => segment.sceneIds)).size, 49);
  assert.deepEqual(plan.segments.flatMap(segment => segment.taskIds).sort((a, b) => a - b), Array.from({ length: 15 }, (_, index) => index));
  assert.deepEqual([...new Set(plan.segments.flatMap(segment => segment.primaryObjectiveIds))].sort(), blueprint.objectives.map(objective => objective.id).sort());
  assert.equal(plan.getSegmentForScene("missing-node"), null);
  assert.equal(plan.getSegmentForTask(15), null);
});

test("common tasks keep guided exposure separate from independent recall", () => {
  const arrival = plan.segmentById.arrival;
  assert.deepEqual(arrival.independentRecall, { sceneId: "school-gate", after: ["arrival-street", "arrival-mother"], beforeTaskId: 1, scored: false });
  assert.match(arrival.stageNote, /unscored recall prompt appears before task 1/);
  for (let index = 0; index < 7; index++) {
    assert.equal(curriculum.scenes[index].kind, "practice");
    assert.match(plan.getSegmentForTask(index).stage, /practice|reuse/);
  }
  for (let index = 7; index < 10; index++) {
    assert.equal(curriculum.scenes[index].kind, "checkpoint");
    assert.equal(plan.getSegmentForTask(index).stage, "separate-independent-recall");
  }
  assert.deepEqual([learning.metaAt(10).assessmentObjectiveIds[0], learning.metaAt(11).assessmentObjectiveIds[0]], ["order-noodles", "price"]);
  assert.equal(plan.getSegmentForTask(10).id, "week-later-recall");
  assert.equal(plan.getSegmentForTask(11).id, "week-later-recall");
  assert.deepEqual([12,13,14].map(index=>learning.metaAt(index).assessmentObjectiveIds[0]), ["numbers","gratitude","farewell"]);
  assert.equal(plan.getSegmentForTask(12).id, "back-at-school");
  assert.equal(plan.getSegmentForTask(13).id, "back-at-school");
  assert.equal(plan.getSegmentForTask(14).id, "school-goodbye");
  const dayTwo = plan.getSegmentForTask(7);
  assert.match(dayTwo.stageNote, /not listening assessment/);
  assert.equal(learning.anchors.flatMap(anchor => anchor.tasks).length, 15);
});

test("all 37 selected options have a reachable later consequence and reach the next common anchor", () => {
  const report = audit();
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.visibleConsequences, []);
  assert.deepEqual(report.convergence, []);
  assert.equal(report.optionCount, 37);
  for (const scene of story.scenes.filter(node => node.kind === "choice")) {
    for (const option of scene.options) {
      const target = story.scenes.find(node => node.id !== scene.id && canReach(option.to, node.id) && (node.echoes || []).some(echo => echo.if === option.id))
        || story.scenes.find(node => node.id !== scene.id && story.callbacks.some(callback => callback.choice === option.id && callback.at === node.id) && canReach(option.to, node.id));
      assert.ok(target, `${scene.id}/${option.id} should have a later selected-only consequence`);
      assert.ok(engine.conditionText(target, { flags: { [option.id]: true } }).length > 0, `${scene.id}/${option.id} consequence should render when selected`);
      const anchor = nextAnchor(scene.id);
      if (anchor) assert.ok(canReach(option.to, anchor), `${scene.id}/${option.id} should converge at ${anchor}`);
    }
  }
});

test("conditional routes and gated options retain their authored behavior and converge", () => {
  let state = engine.fresh();
  for (const choice of ["look-around", "watch-first", "friend-search", "say-clearly", "help-liu", "tell-mother", "write-people", "morning-ready"]) {
    const owner = story.scenes.find(node => node.kind === "choice" && node.options.some(option => option.id === choice));
    while (state.node !== owner.id) {
      const node = story.byId[state.node];
      const moved = engine.step(state, node.kind === "choice" ? engine.availableOptions(node, state)[0].id : "next");
      assert.equal(moved.ok, true, state.node);
      state = moved.state;
    }
    const moved = engine.step(state, choice);
    assert.equal(moved.ok, true, choice);
    state = moved.state;
  }
  while (state.node !== "day2-bird") {
    const node = story.byId[state.node];
    const move = engine.step(state, node.kind === "choice" ? engine.availableOptions(node, state)[0].id : "next");
    assert.equal(move.ok, true, state.node);
    state = move.state;
  }
  const bird = story.byId[state.node];
  assert.ok(engine.availableOptions(bird, state).some(option => option.id === "bird-with-friend"));
  for (const option of engine.availableOptions(bird, state)) assert.ok(canReach(option.to, "day2-liu"));
  const route = story.byId["day2-arrival"];
  assert.equal(route.routes.find(item => engine.meets(item.requires, { flags: { "invite-friend": true } })).to, "day2-guest-arrives");
});
