'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { audit, REQUIRED } = require('../scripts/audit-release.cjs');
const root = path.resolve(__dirname, '../..');

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
