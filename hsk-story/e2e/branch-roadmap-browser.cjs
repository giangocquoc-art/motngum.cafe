"use strict";
const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const BASE = process.env.BRANCH_ROADMAP_BASE_URL || process.env.BRANCH_BASE_URL || "http://127.0.0.1:4197/duong-re/";
const EXECUTABLE = process.env.HSK_BROWSER_BIN || chromium.executablePath();
const viewports = [
  { name: "phone-portrait", width: 320, height: 568 },
  { name: "phone-landscape", width: 667, height: 375 },
  { name: "desktop", width: 1280, height: 800 }
];
const rawWrongAnswer = "我不喜欢";
const longReply = ("Sẻ có thể giúp An hiểu câu này bằng cách nhìn vào tình huống. ").repeat(32).slice(0, 1400);

async function phase(page) { return page.locator("#branchShell").getAttribute("data-phase"); }
async function clickUntil(page, target, limit = 30) {
  for (let i = 0; i < limit; i++) {
    if (await phase(page) === target) return;
    const next = page.locator("#nextBtn");
    assert.equal(await next.isVisible(), true, `next button visible before ${target}`);
    await next.click();
  }
  const shell = await page.locator("#branchShell").evaluate(node => node.outerHTML.slice(0, 1200)).catch(() => "missing branch shell");
  throw new Error(`Could not reach ${target}; current phase=${await phase(page)}; url=${page.url()}; body=${(await page.locator("body").innerText()).slice(0, 500)}; shell=${shell}`);
}
async function toInput(page) { await clickUntil(page, "lesson"); }
async function layout(page, label, extraSelectors = []) {
  const result = await page.evaluate(selectors => {
    const viewport = { width: document.documentElement.clientWidth, height: document.documentElement.clientHeight };
    const visible = node => {
      if (!node || !node.isConnected || getComputedStyle(node).display === "none" || getComputedStyle(node).visibility === "hidden") return false;
      const rect = node.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || rect.left < -1 || rect.top < -1 || rect.right > viewport.width + 1 || rect.bottom > viewport.height + 1) return false;
      for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
        if (!["hidden", "clip"].includes(style.overflow + "") && !["hidden", "clip"].includes(style.overflowX) && !["hidden", "clip"].includes(style.overflowY)) continue;
        if (["hidden", "clip"].includes(style.overflowX) && (rect.left < box.left - 1 || rect.right > box.right + 1)) return false;
        if (["hidden", "clip"].includes(style.overflowY) && (rect.top < box.top - 1 || rect.bottom > box.bottom + 1)) return false;
      }
      return true;
    };
    const openDialog = document.querySelector("dialog[open]");
    let required = ["#journalToggle", "#speaker", "#pageLabel", "#sceneTitle", "#content", "#previousBtn", "#nextBtn", ...selectors];
    if (openDialog?.id === "branchTutorPanel") required = ["#stage", ...selectors];
    else if (openDialog?.id === "journalPanel") required = ["#journalPanel h2", ".journal-tabs button", "#journalContent", "#journalPrev", "#journalNext"];
    else if (openDialog?.id === "helpPanel") required = ["#helpPanel h2", "#helpContent", "#closeHelp"];
    const elements = Object.fromEntries(required.map(selector => {
      const node = document.querySelector(selector), style = node && getComputedStyle(node);
      const accessibleTitle = selector === "#sceneTitle" && style && (style.clipPath !== "none" || node.getBoundingClientRect().width <= 1);
      return [selector, accessibleTitle || visible(node)];
    }));
    const diagnostics = Object.fromEntries(required.filter(selector => !elements[selector]).map(selector => {
      const node = document.querySelector(selector), rect = node && node.getBoundingClientRect();
      return [selector, node && { rect: { x: rect.x, y: rect.y, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height }, client: { w: node.clientWidth, h: node.clientHeight }, scroll: { w: node.scrollWidth, h: node.scrollHeight }, open: node.open }];
    }));
    const doc = document.documentElement, body = document.body;
    return { elements, diagnostics, noDocumentScroll: doc.scrollWidth <= viewport.width + 1 && doc.scrollHeight <= viewport.height + 1 && body.scrollWidth <= viewport.width + 1 && body.scrollHeight <= viewport.height + 1 };
  }, extraSelectors);
  assert.equal(result.noDocumentScroll, true, `${label}: document scroll ${JSON.stringify(result)}`);
  for (const [selector, ok] of Object.entries(result.elements)) assert.equal(ok, true, `${label}: clipped or hidden ${selector}; ${JSON.stringify(result)}`);
}
async function textVisible(page, text, label) {
  const locator = page.getByText(text, { exact: true }).first();
  assert.equal(await locator.count() > 0, true, `${label}: missing text ${text}`);
  const rect = await locator.evaluate(node => {
    const range = document.createRange(); range.selectNodeContents(node);
    const r = range.getBoundingClientRect(), v = { w: document.documentElement.clientWidth, h: document.documentElement.clientHeight };
    return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, w: v.w, h: v.h };
  });
  assert.ok(rect.x >= -1 && rect.y >= -1 && rect.right <= rect.w + 1 && rect.bottom <= rect.h + 1, `${label}: text clipped ${JSON.stringify(rect)}`);
}
async function stageVisibleAboveTutor(page, label) {
  const bounds = await page.evaluate(() => {
    const scene = document.querySelector("#stage").getBoundingClientRect();
    const tutor = document.querySelector("#branchTutorPanel").getBoundingClientRect();
    return { scene: { top: scene.top, bottom: scene.bottom, left: scene.left, right: scene.right }, tutor: { top: tutor.top, bottom: tutor.bottom, left: tutor.left, right: tutor.right } };
  });
  const visibleAbove = Math.max(0, Math.min(bounds.scene.bottom, bounds.tutor.top) - bounds.scene.top);
  const visibleRatio = visibleAbove / Math.max(1, bounds.scene.bottom - bounds.scene.top);
  assert.ok(visibleRatio >= 0.4, `${label}: scene art should remain substantially visible above tutor ${JSON.stringify(bounds)} visible=${visibleRatio}`);
}
async function seed(page, target, completed = []) {
  await page.evaluate(({ target, completed }) => {
    const E = AnBranchEngine, D = AnBranchStory, L = ChimSeBranchLearning;
    const preferred = { "school-gate": "watch-first", "lost-diary": "solo-search", "staff-office": "say-clearly", canteen: "read-menu", "noodle-order": "mild", "walk-home": "tell-mother", night: "write-question", "day2-breakfast": "morning-ready", "day2-bird": "bird-quiet", "day2-liu": "liu-ask", "day2-night": "day2-letter-brave" };
    let state = E.fresh();
    for (let guard = 0; state.node !== target && guard < 60; guard++) {
      const node = D.byId[state.node];
      const desired = preferred[node.id];
      const option = node.kind === "choice" ? (E.availableOptions(node, state).find(item => item.id === desired) || E.availableOptions(node, state)[0]) : null;
      const moved = E.step(state, option ? option.id : "next");
      if (!moved.ok) throw new Error(`Fixture cannot pass ${state.node}: ${moved.error}`);
      state = moved.state;
    }
    if (state.node !== target) throw new Error(`Fixture did not reach ${target}; reached ${state.node}`);
    const history = Array(L.total).fill(null);
    completed.forEach(index => { history[index] = { status: "correct", attempts: 0, hint: false }; });
    localStorage.setItem(D.storageKey, E.exportSave(state));
    localStorage.setItem(L.storageKey, JSON.stringify(history));
    localStorage.setItem(L.objectiveStorageKey, JSON.stringify(L.objectiveEvidence(history)));
    for (const key of ["chimse-branch-lesson-draft-v1", "chimse-branch-pending-reply-v1", "chimse-branch-pending-feedback-v1"]) localStorage.removeItem(key);
  }, { target, completed });
  await page.reload();
}
async function stored(page) {
  return page.evaluate(() => ({
    history: JSON.parse(localStorage.getItem(ChimSeBranchLearning.storageKey) || "[]"),
    draft: JSON.parse(localStorage.getItem("chimse-branch-lesson-draft-v1") || "null"),
    save: JSON.parse(localStorage.getItem(AnBranchStory.storageKey) || "null")
  }));
}
async function openHelp(page) { await page.locator("#nextBtn").click(); assert.equal(await page.locator("#helpPanel").evaluate(node => node.open), true); }
async function reachSegmentLesson(page, target) { await seed(page, target); await toInput(page); assert.equal(await phase(page), "lesson"); }
function assertNoRawInEvidence(record, raw) {
  assert.ok(record && record.evidence && Array.isArray(record.evidence.events), "attempt evidence stored on completion record");
  assert.doesNotMatch(JSON.stringify(record.evidence), new RegExp(raw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), "raw response is not attempt evidence");
}

async function runViewport(browser, viewport) {
  const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height }, deviceScaleFactor: 1 });
  const page = await context.newPage(), errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.route("**/api/ai/tutor", async route => {
    const body = route.request().postDataJSON();
    const latest = body.messages.at(-1)?.content;
    if (latest === "delay please") {
      await new Promise(resolve => setTimeout(resolve, 1800));
      if (route.request().isNavigationRequest()) return;
      try { await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: "Too late" }) }); } catch (_) {}
      return;
    }
    if (latest === "fail once") return route.fulfill({ status: 429, contentType: "application/json", body: JSON.stringify({ error: "RATE_LIMITED" }) });
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ reply: longReply }) });
  });
  await page.goto(BASE);
  await page.evaluate(() => document.fonts.ready);
  await layout(page, `${viewport.name} initial`);

  // Wrong attempt survives reload as attempt evidence; finishing correctly keeps the raw input out of that evidence.
  await reachSegmentLesson(page, "arrival");
  await page.locator("#answerInput").fill(rawWrongAnswer);
  await page.locator(".lesson-form button.primary").click();
  assert.ok((await page.locator("#inputMessage").innerText()).length > 0, "incorrect attempt has feedback");
  let data = await stored(page);
  assert.equal(data.history[0], null);
  assert.equal(data.draft.draft, rawWrongAnswer, "unfinished answer draft can resume");
  assert.equal(data.draft.evidence.events[0].result, "incorrect");
  assert.doesNotMatch(JSON.stringify(data.draft.evidence), new RegExp(rawWrongAnswer));
  await page.reload();
  await toInput(page);
  assert.equal(await page.locator("#answerInput").inputValue(), rawWrongAnswer);
  await page.locator("#answerInput").fill("我很好");
  await page.locator(".lesson-form button.primary").click();
  data = await stored(page);
  assert.equal(data.history[0].status, "correct");
  assert.equal(data.history[0].attempts, 1);
  assertNoRawInEvidence(data.history[0], "我很好");
  assert.equal(data.history[0].evidence.events.map(event => event.result).join(","), "incorrect,correct");

  // Story, words, and review journal tabs stay readable and their controls remain in the viewport.
  await page.locator("#journalToggle").click();
  for (const [id, expected] of [["journalStory", "An đã trải qua"], ["journalWords", "An tự sửa"], ["journalReview", "Cần gặp lại"]]) {
    await page.locator(`#${id}`).click();
    await layout(page, `${viewport.name} journal ${id}`);
    assert.equal(await page.locator(`#${id}`).getAttribute("aria-pressed"), "true");
    const copy = await page.locator("#journalContent").innerText();
    assert.ok(copy.trim().length > 0, `${id} has readable content`);
    await textVisible(page, copy.split("\n").find(line => line.trim()) || expected, `${viewport.name} ${id}`);
  }
  await page.locator("#closeJournal").click();

  // At checkpoint 7, private previous learning prompts and answers do not appear in the journal.
  await seed(page, "day2-bird", [0, 1, 2, 3, 4, 5, 6]);
  await clickUntil(page, "request");
  await toInput(page);
  await layout(page, `${viewport.name} checkpoint`);
  await openHelp(page);
  assert.equal(await page.getByRole("button", { name: "Hỏi Sẻ thêm" }).count(), 0, "tutor is blocked at a checkpoint");
  await page.locator("#closeHelp").click();
  await page.locator("#journalToggle").click();
  assert.equal(await page.locator("#journalWords").isDisabled(), true);
  assert.equal(await page.locator("#journalReview").isDisabled(), true);
  const privateCopy = await page.locator("#journalContent").innerText();
  for (const prompt of await page.evaluate(() => HSKContent.scenes.slice(0, 7).map(scene => scene.request))) assert.ok(!privateCopy.includes(prompt), `checkpoint journal hides prior prompt: ${prompt}`);
  for (const answer of await page.evaluate(() => HSKContent.scenes.slice(0, 7).flatMap(scene => scene.answers))) assert.ok(!privateCopy.includes(answer), `checkpoint journal hides prior answer: ${answer}`);
  await layout(page, `${viewport.name} checkpoint journal`);
  await page.locator("#closeJournal").click();

  // On practice, the tutor cancels stale work, retries errors, pages a long reply, and restores focus.
  await reachSegmentLesson(page, "arrival");
  await openHelp(page);
  await page.getByRole("button", { name: "Hỏi Sẻ thêm" }).click();
  const panel = page.locator("#branchTutorPanel");
  assert.equal(await panel.evaluate(node => node.open), true);
  const tutorInput = panel.locator("[data-branch-tutor-input]");
  assert.equal(await tutorInput.evaluate(node => document.activeElement === node), true, "focus enters tutor prompt");
  await layout(page, `${viewport.name} tutor open`, ["#branchTutorPanel h2", "#branchTutorPanel textarea", "#branchTutorPanel [data-branch-tutor-send]"]);
  await stageVisibleAboveTutor(page, `${viewport.name} tutor open`);
  await tutorInput.fill("delay please");
  await panel.locator("[data-branch-tutor-send]").click();
  assert.match(await panel.locator("[data-branch-tutor-status]").innerText(), /đang nghĩ/i);
  assert.equal(await panel.locator("[data-branch-tutor-send]").isDisabled(), true);
  await panel.getByRole("button", { name: "Đóng Hỏi Sẻ" }).click();
  assert.equal(await phase(page), "lesson");
  assert.equal(await page.evaluate(() => document.activeElement.id), "nextBtn", "closing tutor returns focus to story control");
  await page.locator("#nextBtn").click();
  await page.getByRole("button", { name: "Hỏi Sẻ thêm" }).click();
  await panel.locator("[data-branch-tutor-input]").fill("fail once");
  await panel.locator("[data-branch-tutor-send]").click();
  await panel.locator("[data-branch-tutor-status]").waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector("[data-branch-tutor-status]")?.dataset.state === "retry");
  assert.match(await panel.locator("[data-branch-tutor-status]").innerText(), /thử lại/i);
  assert.equal(await panel.locator("[data-branch-tutor-send]").isEnabled(), true);
  await panel.locator("[data-branch-tutor-input]").fill("explain this phrase");
  await panel.locator("[data-branch-tutor-input]").press("Tab");
  assert.equal(await panel.locator("[data-branch-tutor-send]").evaluate(node => document.activeElement === node), true, "keyboard focus reaches send");
  await panel.locator("[data-branch-tutor-send]").press("Enter");
  const pages = panel.locator(".branch-tutor-reply-pages");
  await pages.waitFor({ state: "visible" });
  await page.waitForTimeout(150);
  await layout(page, `${viewport.name} tutor reply`, ["#branchTutorPanel h2", ".branch-tutor-reply-page", ".branch-tutor-reply-pages", "#branchTutorPanel textarea", "#branchTutorPanel [data-branch-tutor-send]"]);
  const counter = pages.locator("span");
  const pagePart = () => counter.innerText().then(value => value.split("·").at(-1).trim());
  const initialPage = await pagePart();
  const pageMatch = /^1 \/ (\d+)$/.exec(initialPage);
  const pagingMetrics = await page.evaluate(() => { const m = document.querySelector("[data-branch-tutor-messages]"), p = document.querySelector(".branch-tutor-reply-page"), d = document.querySelector("#branchTutorPanel"); return { panel: d.getBoundingClientRect().height, messages: { client: m.clientHeight, scroll: m.scrollHeight }, paragraph: { client: p.clientHeight, scroll: p.scrollHeight, textLength: p.textContent.length } }; });
  assert.ok(pageMatch && Number(pageMatch[1]) >= 1 && Number(pageMatch[1]) <= 50, `long reply has bounded paging: ${await counter.innerText()} metrics=${JSON.stringify(pagingMetrics)}`);
  if (viewport.width <= 667) assert.ok(Number(pageMatch[1]) > 1, `max-length reply should paginate on compact viewports: ${await counter.innerText()} captured=${pageMatch && pageMatch[1]} width=${viewport.width} metrics=${JSON.stringify(pagingMetrics)}`);
  const replyPages = [await panel.locator(".branch-tutor-reply-page").textContent()];
  while (await pages.getByRole("button", { name: /Trang ›/ }).isEnabled()) {
    assert.ok(replyPages.length < 50, "pagination is bounded");
    await pages.getByRole("button", { name: /Trang ›/ }).click();
    replyPages.push(await panel.locator(".branch-tutor-reply-page").textContent());
  }
  assert.ok(replyPages.slice(0, -1).every(part => part.length > 20), "page sizing uses available reader space rather than character-sized slices");
  assert.equal(replyPages.join(""), longReply.trim(), "pagination preserves the complete reply without dropped or duplicated text");
  while (await pages.getByRole("button", { name: /‹ Trang/ }).isEnabled()) await pages.getByRole("button", { name: /‹ Trang/ }).click();
  assert.equal(await pagePart(), initialPage);
  assert.equal(await phase(page), "lesson", "tutoring does not navigate the lesson");

  assert.deepEqual(errors, [], `${viewport.name} page errors`);
  await context.close();
  return viewport.name;
}

async function runZoom(browser) {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } }), page = await context.newPage();
  await page.goto(BASE);
  await page.evaluate(() => { document.body.style.zoom = "200%"; });
  await page.waitForTimeout(100);
  await layout(page, "200% browser zoom");
  await reachSegmentLesson(page, "arrival");
  await layout(page, "200% zoom practice");
  await openHelp(page);
  await layout(page, "200% zoom help");
  await context.close();
  return "200%-zoom";
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: EXECUTABLE }), results = [];
  try {
    if (process.argv.includes("--zoom-only")) results.push(await runZoom(browser));
    else for (const viewport of viewports) results.push(await runViewport(browser, viewport));
    if (!process.argv.includes("--no-zoom") && !process.argv.includes("--zoom-only")) results.push(await runZoom(browser));
    console.log(`PASS branch roadmap browser: ${results.join(", ")}`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
