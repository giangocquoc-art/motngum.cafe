/* A failed browser storage write must pause the action until the learner retries it. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const BASE = process.env.BRANCH_BASE_URL || 'http://127.0.0.1:4173/duong-re/';

async function reachLesson(page) {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const phase = await page.locator('#branchShell').getAttribute('data-phase');
    if (phase === 'lesson') return;
    if (phase === 'session-recall') {
      await page.locator('#sessionRecallInput').fill('我还好');
    }
    await page.locator('#nextBtn').click();
  }
  throw new Error(`Could not reach the first lesson; phase=${await page.locator('#branchShell').getAttribute('data-phase')}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.HSK_BROWSER_BIN || undefined });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const nativeSetItem = Storage.prototype.setItem;
      window.__saveFailure = { key: '', remaining: 0 };
      Storage.prototype.setItem = function (key, value) {
        if (key === window.__saveFailure.key && window.__saveFailure.remaining > 0) {
          window.__saveFailure.remaining -= 1;
          throw new DOMException('Simulated quota exhaustion', 'QuotaExceededError');
        }
        return nativeSetItem.call(this, key, value);
      };
    });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await reachLesson(page);

    const keys = await page.evaluate(() => ({ story: AnBranchStory.storageKey, learning: ChimSeBranchLearning.storageKey }));
    const before = await page.evaluate((key) => localStorage.getItem(key), keys.story);
    const answer = await page.evaluate(() => HSKContent.scenes[0].answers[0]);
    await page.locator('#answerInput').fill(answer);
    await page.evaluate((key) => { window.__saveFailure = { key, remaining: 1 }; }, keys.story);
    await page.locator('.lesson-form button.primary').click();

    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'), 'feedback', 'the story can continue in memory during a storage outage');
    assert.equal(await page.locator('#retrySaveBtn').isVisible(), true, 'failed writes expose the retry action');
    assert.match(await page.locator('#inputMessage').innerText(), /chưa lưu được/, 'the interface clearly marks the current progress as unsaved');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), keys.story), before, 'the failed story write rolls back');
    assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key) || '[]')[0] || null, keys.learning), null, 'unsaved learning evidence is not reported as durable');

    await page.locator('#retrySaveBtn').click();
    assert.equal(await page.locator('#retrySaveBtn').isVisible(), false, 'retry clears the save warning after success');
    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'), 'feedback', 'the pending response resumes after it is durable');
    assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key))[0].status, keys.learning), 'correct');

    const replyKey = 'chimse-branch-pending-reply-v1';
    await page.evaluate(() => {
      const history = Array.from({ length: ChimSeBranchLearning.total }, () => null);
      history[0] = { status: 'correct', attempts: 0, hint: false };
      const state = AnBranchEngine.fresh();
      localStorage.setItem(AnBranchStory.storageKey, AnBranchEngine.exportSave(state));
      localStorage.setItem(ChimSeBranchLearning.storageKey, JSON.stringify(history));
      localStorage.setItem(ChimSeBranchLearning.objectiveStorageKey, JSON.stringify(ChimSeBranchLearning.objectiveEvidence(history)));
      localStorage.removeItem('chimse-branch-pending-reply-v1');
      localStorage.removeItem('chimse-branch-pending-feedback-v1');
    });
    await page.reload({ waitUntil: 'networkidle' });
    if (await page.locator('#branchShell').getAttribute('data-phase') === 'read') await page.locator('#nextBtn').click();
    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'), 'choose', 'seeded first lesson opens its story choice');
    const oldRoute = await page.evaluate((key) => localStorage.getItem(key), keys.story);
    await page.evaluate((key) => { window.__saveFailure = { key, remaining: 1 }; }, replyKey);
    await page.locator('#nextBtn').click();
    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'), 'reply', 'choice reaction remains visible in memory while storage recovers');
    assert.equal(await page.locator('#retrySaveBtn').isVisible(), true, 'a failed reaction marker exposes the save retry');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), keys.story), oldRoute, 'the route does not persist without its reaction marker');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), replyKey), null, 'failed reaction marker is rolled back');
    await page.locator('#retrySaveBtn').click();
    const routeAndReply = await page.evaluate(({ storyKey, replyKey }) => ({
      route: JSON.parse(localStorage.getItem(storyKey)),
      reply: JSON.parse(localStorage.getItem(replyKey)),
    }), { storyKey: keys.story, replyKey });
    assert.deepEqual(routeAndReply.reply, routeAndReply.route.path, 'retry atomically saves the chosen route and reply marker');
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#branchShell').getAttribute('data-phase'), 'reply', 'reload restores the saved reaction');
    for (let pageIndex = 0; pageIndex < 4 && await page.locator('#branchShell').getAttribute('data-phase') === 'reply'; pageIndex += 1) {
      await page.locator('#nextBtn').click();
    }
    assert.notEqual(await page.locator('#branchShell').getAttribute('data-phase'), 'reply', 'reaction can be consumed');
    assert.equal(await page.evaluate((key) => localStorage.getItem(key), replyKey), null, 'continuing clears the reaction marker durably');
    await page.reload({ waitUntil: 'networkidle' });
    assert.notEqual(await page.locator('#branchShell').getAttribute('data-phase'), 'reply', 'a consumed reaction does not replay after another reload');
    assert.deepEqual(errors, []);
    await context.close();
    console.log('Branch save failure recovery: lesson completion and atomic choice-reply marker failures passed');
  } finally {
    await browser.close();
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
