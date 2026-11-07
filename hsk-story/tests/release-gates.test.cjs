'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { audit, REQUIRED } = require('../scripts/audit-release.cjs');
const root = path.resolve(__dirname, '../..');
const baseIgnore = fs.readFileSync(path.join(root, 'hsk-story/.vercelignore'), 'utf8');

test('release audit validates package inputs while preserving unverified external gates as pending', () => {
  const report = audit(root);
  assert.ok(['pass', 'fail'].includes(report.gates.packageInputs.status));
  assert.ok(Array.isArray(report.gates.packageInputs.issues));
  assert.equal(report.release.currentPlayableLevels, 1);
  assert.deepEqual(report.release.playableLevelIds, [1]);
  assert.equal(report.release.candidateObjectives, 8);
  assert.equal(report.release.reviewedObjectives, 0);
  assert.deepEqual(report.release.lockedLevels, [2, 3, 4, 5, 6]);
  assert.equal(report.gates.mobileVisualAndAudioReview.status, 'pending');
  assert.equal(report.gates.qualifiedMandarinAndOfficialSyllabusReview.status, 'pending');
  assert.equal(report.gates.previewDeployment.status, 'pending');
  assert.equal('productionDeployment' in report.gates, false);
  assert.ok(['fail', 'local-package-ready-external-gates-pending'].includes(report.overall));
});

test('release audit fails when a required deployed asset is absent from the tracked package', () => {
  const tracked = REQUIRED.map((name) => `hsk-story/${name}`).filter((name) => name !== 'hsk-story/style.css');
  const report = audit(root, tracked);
  assert.equal(report.gates.packageInputs.status, 'fail');
  assert.ok(report.gates.packageInputs.issues.some((issue) => issue.includes('required deployed asset is not Git tracked: hsk-story/style.css')));
});

test('release audit detects HTML, CSS and runtime-only files excluded by Vercel rules', () => {
  const html = audit(root, undefined, `${baseIgnore}\nduong-re/branch-tutor.js`);
  assert.ok(html.gates.packageInputs.issues.some((issue) => issue.includes('local HTML asset excluded by .vercelignore: hsk-story/duong-re/branch-tutor.js')));

  const css = audit(root, undefined, `${baseIgnore}\nart/fonts/noto-sans-sc-game-v1.woff2`);
  assert.ok(css.gates.packageInputs.issues.some((issue) => issue.includes('local CSS asset excluded by .vercelignore: hsk-story/art/fonts/noto-sans-sc-game-v1.woff2')));

  const api = audit(root, undefined, `${baseIgnore}\napi/branch-progress.js`);
  assert.ok(api.gates.packageInputs.issues.some((issue) => issue.includes('required deployed file excluded by .vercelignore: hsk-story/api/branch-progress.js')));

  const sprite = audit(root, undefined, `${baseIgnore}\nart/flat/characters/*.webp`);
  assert.ok(sprite.gates.packageInputs.issues.some((issue) => issue.includes('required deployed file excluded by .vercelignore: hsk-story/art/flat/characters/classmate-sage-v1.webp')));

  const intro = audit(root, undefined, `${baseIgnore}\nintro.css`);
  assert.ok(intro.gates.packageInputs.issues.some((issue) => issue.includes('local HTML asset excluded by .vercelignore: hsk-story/intro.css')));
  const apiAccount = audit(root, undefined, `${baseIgnore}\napi/account.js`);
  assert.ok(apiAccount.gates.packageInputs.issues.some((issue) => issue.includes('required deployed file excluded by .vercelignore: hsk-story/api/account.js')));
  const sceneAsset = audit(root, undefined, `${baseIgnore}\nart/flat/backgrounds/school-gate.svg`);
  assert.ok(sceneAsset.gates.packageInputs.issues.some((issue) => issue.includes('scene manifest asset excluded by .vercelignore: hsk-story/art/flat/backgrounds/school-gate.svg')));
});
