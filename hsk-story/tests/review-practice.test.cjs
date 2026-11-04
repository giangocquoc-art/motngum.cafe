const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
function load(file) { const x = { module: { exports: {} } }; vm.runInNewContext(fs.readFileSync(path.join(root, file), "utf8"), x); return x.module.exports; }
const D = load("review-data.js"), R = load("review-core.js"), Core = load("game-core.js");
const DAY = "2026-11-04";
const legacy = (count = 10) => ({ v: 3, history: Array.from({ length: count }, () => ({ status: "correct", attempts: 0, hint: false })) });

test("voluntary practice is immediate, unlocked-only, and leaves scheduled due dates unchanged", () => {
  const item = D.items[0], story = legacy(1);
  const scheduled = R.act(D, R.initial(), item.id, { type: "answer", value: item.correct }, DAY, Core, story);
  const before = structuredClone(scheduled.state.items[item.id]);
  const beforeDue = R.queue(D, story, scheduled.state, DAY).map((x) => x.id);
  const practice = R.practice(D, scheduled.state, item.id, { type: "answer", value: item.correct }, DAY, Core, story);
  assert.equal(practice.result, "practice-independent");
  assert.equal(JSON.stringify(practice.state.items[item.id]), JSON.stringify(before));
  assert.deepEqual(R.queue(D, story, practice.state, DAY).map((x) => x.id), beforeDue);
  assert.throws(() => R.practice(D, scheduled.state, "thank-again", { type: "hint" }, DAY, Core, story), /Locked or missing/);
});

test("practice session contains only unlocked past items and is hard-capped at five", () => {
  const story = legacy(10), items = R.practiceQueue(D, story, 100);
  assert.equal(items.length, 5);
  assert.ok(items.every((item) => R.unlocked(item, story)));
  assert.equal(R.practiceQueue(D, legacy(0), 5).length, 0);
});

test("practice wrong answer, hint, sample and skip are recorded separately from scheduled results", () => {
  const item = D.items[0], story = legacy(1), wrong = item.options.find((x) => x[0] !== item.correct)[0];
  let state = R.initial();
  for (let i = 0; i < 2; i++) {
    const out = R.practice(D, state, item.id, { type: "answer", value: wrong }, DAY, Core, story);
    state = out.state;
    assert.equal(out.result, "incorrect");
  }
  assert.equal(R.practiceAttempts(state, item.id), 2);
  const sample = R.practice(D, state, item.id, { type: "sample" }, DAY, Core, story);
  assert.equal(sample.result, "sample");
  const skipped = R.practice(D, sample.state, item.id, { type: "skip" }, DAY, Core, story);
  assert.equal(skipped.result, "skipped");
  assert.equal(skipped.state.items[item.id], undefined, "practice creates no scheduled record");
  assert.equal(JSON.stringify(Array.from(skipped.state.events[item.id].tail, (x) => x.result)), JSON.stringify(["incorrect", "incorrect", "sample", "skipped"]));
  assert.throws(() => R.practice(D, R.initial(), item.id, { type: "sample" }, DAY, Core, story), /gated/);

  const hinted = R.practice(D, R.practice(D, R.initial(), item.id, { type: "hint" }, DAY, Core, story).state,
    item.id, { type: "answer", value: item.correct }, DAY, Core, story);
  assert.equal(hinted.result, "practice-assisted");
});

test("bounded per-item attempt events survive scheduled results and do not fabricate legacy history", () => {
  const item = D.items[0], story = legacy(1), old = { v: 1, items: { [item.id]: { status: "independent", attempts: 0, hinted: false, stage: 2, lastDay: DAY, dueDay: "2026-11-11" } } };
  const cleanOld = R.clean(old, D);
  assert.equal(Object.keys(cleanOld.events).length, 0);
  let state = cleanOld;
  for (let i = 0; i < 40; i++) state = R.practice(D, state, item.id, { type: "answer", value: item.correct }, DAY, Core, story).state;
  const roundTrip = R.clean(state, D);
  assert.equal(roundTrip.events[item.id].retained, R.maxEventsPerItem);
  assert.ok(roundTrip.events[item.id].tail.every((event) => event.mode === "practice"));
  assert.equal(roundTrip.events[item.id].total, 40);
  assert.equal(roundTrip.events[item.id].dropped, 10);
  assert.equal(roundTrip.events[item.id].summary.practice, 40);
  assert.equal(roundTrip.items[item.id].dueDay, "2026-11-11");
  const scheduled = R.act(D, roundTrip, item.id, { type: "answer", value: item.correct }, "2026-11-11", Core, story);
  assert.equal(scheduled.result, "independent");
  assert.equal(scheduled.state.events[item.id].tail.at(-1).mode, "scheduled");
  const accountContext = { module: { exports: {} } };
  const snapshot = JSON.stringify(JSON.stringify({ v: 1, review: scheduled.state }));
  vm.runInNewContext(fs.readFileSync(path.join(root, "progress-core.js"), "utf8") +
    "\nmodule.exports=ChimseProgress.clean(JSON.parse(" + snapshot + "));", accountContext);
  assert.equal(accountContext.module.exports.review.events[item.id].retained, R.maxEventsPerItem);
});

test("today-empty review offers a five-item authored practice route with explicit schedule distinction", () => {
  const html = fs.readFileSync(path.join(root, "ren-luyen.html"), "utf8");
  const js = fs.readFileSync(path.join(root, "review.js"), "utf8");
  assert.match(html, /id="practiceLink"[^>]*href="\/ren-luyen\.html\?mode=practice"/);
  assert.match(js, /practiceQueue\(D,story,5\)/);
  assert.match(js, /không đổi lịch ôn/i);
  assert.match(js, /không phải ôn nhớ sau một khoảng thời gian/i);
});
