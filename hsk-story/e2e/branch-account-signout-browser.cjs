const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 320, height: 568 } });
  const page = await context.newPage();
  let offline = false;
  const rows = new Map();
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('chimse-account-v1', JSON.stringify({ owner: 'alice', revision: 0, base: { v: 1 } }));
      sessionStorage.setItem('seeded', '1');
      sessionStorage.setItem('user', 'alice');
    }
    window.ChimseAuth = { create: () => ({
      getSession: async () => ({ data: { user: sessionStorage.getItem('user') ? { id: sessionStorage.getItem('user'), name: sessionStorage.getItem('user') } : null } }),
      signOut: async () => { sessionStorage.removeItem('user'); return {}; },
      signIn: { social: async () => ({}) }
    }) };
  });
  await page.route('**/api/account', r => r.fulfill({ json: { enabled: true } }));
  await page.route('**/api/progress', r => r.fulfill({ json: { revision: 0, snapshot: null } }));
  await page.route('**/api/branch-progress', async r => {
    if (offline) return r.abort('failed');
    const owner = r.request().headers()['x-chimse-owner'];
    let row = rows.get(owner) || { revision: 0, snapshot: null };
    if (r.request().method() === 'PUT') { const b = r.request().postDataJSON(); row = { revision: row.revision + 1, snapshot: b.snapshot }; rows.set(owner, row); }
    return r.fulfill({ json: row });
  });
  const url = process.env.BRANCH_BASE_URL || 'http://127.0.0.1:4190/duong-re/';
  await page.goto(url);
  await page.evaluate(() => window.chimseAccountReady);
  await page.locator('.account-open').click();
  await page.waitForFunction(() => !document.querySelector('#accountSigned').hidden);
  await page.locator('.account-close').click();
  await page.evaluate(() => {
    const s = AnBranchEngine.fresh(), n = AnBranchStory.byId[s.node];
    const r = AnBranchEngine.step(s, n.kind === 'choice' ? AnBranchEngine.availableOptions(n, s)[0].id : 'next');
    localStorage.setItem(AnBranchStory.storageKey, AnBranchEngine.exportSave(r.state));
    window.dispatchEvent(new Event('chimse-branch-changed'));
  });
  offline = true;
  await page.locator('.account-open').click();
  await page.locator('#accountSignout').click();
  await page.locator('#accountSignoutLocal').waitFor({ state: 'visible' });
  await Promise.all([page.waitForURL(url2 => url2.pathname === '/duong-re/'), page.locator('#accountSignoutLocal').click()]);
  await page.waitForFunction(() => !sessionStorage.getItem('user'));
  await page.waitForLoadState('load');
  let result = await page.evaluate(() => ({ guest: JSON.parse(localStorage.getItem('hai-que-huong-branching-novel-v1')), backups: JSON.parse(localStorage.getItem('chimse-branch-owner-backups-v1')) }));
  assert.ok(result.backups.alice.snapshot.path.length > 0);
  assert.equal(result.guest.path.length, 0);
  offline = false;
  await page.evaluate(() => sessionStorage.setItem('user', 'bob'));
  await page.evaluate(() => ChimseAccount.refresh());
  assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('hai-que-huong-branching-novel-v1')))).path.length, 0, 'Bob cannot see Alice’s local story');
  console.log('PASS: offline story save, explicit sign-out and separate account backup');
  await browser.close();
})().catch(e => { console.error(e); process.exitCode = 1; });
