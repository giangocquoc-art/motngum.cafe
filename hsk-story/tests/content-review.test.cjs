'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { buildReport, loadInputs } = require('../scripts/audit-content-review.cjs');
const sourceRef = loadInputs().inventory.tasks['1'][0].id;

function fixture(ledger = { version: 1, receipts: [] }) { return { ...loadInputs(), ledger }; }
function receipt(unit, extra = {}) {
  return {
    unitId: unit.unitId, scope: 'language', reviewerId: 'reviewer-fixture', qualification: 'qualified Mandarin educator (test fixture)',
    date: '2026-11-04', fingerprint: unit.fingerprint, sourceItemRefs: [sourceRef], ...extra,
  };
}

test('report fingerprints ten current lessons, eight pilot objectives, and thirty locked future proposals', () => {
  const report = buildReport(fixture());
  assert.equal(report.units.filter((unit) => unit.kind === 'lesson').length, 10);
  assert.equal(report.units.filter((unit) => unit.kind === 'objective' && unit.level === 1).length, 8);
  assert.equal(report.units.filter((unit) => unit.kind === 'objective' && unit.level > 1).length, 30);
  assert.deepEqual(report.summary.lockedLevels, [2, 3, 4, 5, 6]);
  assert.equal(report.summary.futureContentPlayable, false);
  assert.equal(report.summary.gameplayUnlocksApplied, false);
  assert.ok(report.units.every((unit) => /^[a-f0-9]{64}$/.test(unit.fingerprint)));
  assert.ok(report.missingReviews.language.includes('lesson:0'));
  assert.ok(report.missingCrosswalk.length > 0);
  assert.ok(report.skills.missingEvidenceModalities.includes('speaking'));
});

test('a content change invalidates an approval fingerprint', () => {
  const base = fixture();
  const current = buildReport(base).units.find((unit) => unit.unitId === 'lesson:0');
  const changedContent = {
    ...base.content,
    scenes: base.content.scenes.map((scene) => scene.id === 0 ? { ...scene, hint: `${scene.hint} edited` } : scene),
  };
  const changed = buildReport({ ...base, content: changedContent, ledger: { version: 1, receipts: [receipt(current)] } });
  assert.ok(changed.invalidReceipts.some((issue) => issue.code === 'stale-fingerprint' && issue.unitId === 'lesson:0'));
  assert.equal(changed.units.find((unit) => unit.unitId === 'lesson:0').reviews.language.status, 'pending');
});

test('future proposal fingerprints include their linked planned story episode', () => {
  const base = fixture();
  const unitId = 'objective:hsk2.time-and-repair';
  const original = buildReport(base).units.find((unit) => unit.unitId === unitId);
  const alteredActs = {
    ...base.futureActs,
    acts: base.futureActs.acts.map((act) => ({
      ...act,
      episodes: act.episodes.map((episode) => episode.learningAnchorIds?.includes('hsk2.time-and-repair')
        ? { ...episode, conflict: `${episode.conflict} revised` } : episode),
    })),
  };
  const changed = buildReport({ ...base, futureActs: alteredActs });
  assert.notEqual(changed.units.find((unit) => unit.unitId === unitId).fingerprint, original.fingerprint);
});

test('incomplete reviewer qualification cannot count as a review', () => {
  const base = fixture();
  const unit = buildReport(base).units.find((candidate) => candidate.unitId === 'lesson:0');
  const item = receipt(unit, { qualification: '' });
  const report = buildReport(fixture({ version: 1, receipts: [item] }));
  assert.ok(report.invalidReceipts.some((issue) => issue.code === 'missing-required-fields' && issue.fields.includes('qualification')));
  assert.equal(report.units.find((candidate) => candidate.unitId === 'lesson:0').reviews.language.status, 'pending');
});

test('unknown unit IDs are rejected and valid receipts never unlock gameplay', () => {
  const base = fixture();
  const unit = buildReport(base).units.find((candidate) => candidate.unitId === 'lesson:0');
  const report = buildReport(fixture({ version: 1, receipts: [receipt(unit, { unitId: 'objective:unknown-id' })] }));
  assert.ok(report.invalidReceipts.some((issue) => issue.code === 'unknown-unit-id'));
  const languageOnly = buildReport(fixture({ version: 1, receipts: [receipt(unit)] }));
  const current = languageOnly.units.find((candidate) => candidate.unitId === 'lesson:0');
  assert.equal(current.reviews.language.status, 'reviewed');
  assert.equal(current.reviews['source-match'].status, 'pending');
  assert.equal(current.locked, false);
  assert.equal(languageOnly.summary.gameplayUnlocksApplied, false);
  assert.equal(languageOnly.units.find((candidate) => candidate.unitId === 'objective:hsk2.time-and-repair').locked, true);
});

test('unknown official source item references are rejected', () => {
  const base = fixture();
  const unit = buildReport(base).units.find((candidate) => candidate.unitId === 'lesson:0');
  const report = buildReport(fixture({ version: 1, receipts: [receipt(unit, { sourceItemRefs: ['unknown-official-item'] })] }));
  assert.ok(report.invalidReceipts.some((issue) => issue.code === 'unknown-source-item-ref'));
  assert.equal(report.units.find((candidate) => candidate.unitId === 'lesson:0').reviews.language.status, 'pending');
});
