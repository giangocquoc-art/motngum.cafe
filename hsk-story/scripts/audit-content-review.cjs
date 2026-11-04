'use strict';
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const REVIEW_SCOPES = ['language', 'source-match'];
const text = (value) => typeof value === 'string' && value.trim().length > 0;

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]));
  return value === undefined ? null : value;
}
function fingerprint(value) {
  return crypto.createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex');
}
function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value && date.getTime() <= Date.now();
}
function inventorySourceIds(value, result = new Set()) {
  if (Array.isArray(value)) value.forEach((entry) => inventorySourceIds(entry, result));
  else if (value && typeof value === 'object') {
    if (text(value.id)) result.add(value.id);
    Object.values(value).forEach((entry) => inventorySourceIds(entry, result));
  }
  return result;
}
function lessonPayload(scene, curriculumScene, objectives) {
  return {
    content: {
      id: scene.id, place: scene.place, speaker: scene.speaker, speakerCharacter: scene.speakerCharacter,
      tag: scene.tag, zh: scene.zh, py: scene.py, vi: scene.vi, request: scene.request, error: scene.error,
      acceptedAnswers: scene.answers, naturalAnswers: scene.naturalAnswers || [], guidedModel: scene.guidedModel || null,
      hint: scene.hint,
    },
    curriculum: curriculumScene,
    objectives: objectives.map((objective) => ({
      id: objective.id, level: objective.level, label: objective.label, topic: objective.topic,
      candidateTask: objective.candidateTask, candidateContent: objective.candidateContent || null,
      candidateFunctions: objective.candidateFunctions || [], candidateSourceRefs: objective.candidateSourceRefs,
      sourceComponents: objective.sourceComponents, officialItemIds: objective.officialItemIds,
      candidateSkillProfile: objective.candidateSkillProfile, storyStages: objective.storyStages || null,
      curriculumSceneIds: objective.curriculumSceneIds, prerequisiteIds: objective.prerequisiteIds,
      hintPolicy: objective.hintPolicy, candidateStoryActivityModes: objective.candidateStoryActivityModes,
    })),
  };
}
function objectivePayload(objective, futureActs) {
  const anchorIds = new Set([objective.id, ...Object.keys(objective.episodeRefs || {}), ...Object.values(objective.episodeRefs || {})]);
  const linkedEpisodes = (futureActs.acts || []).flatMap((act) => (act.episodes || [])
    .filter((episode) => (episode.learningAnchorIds || []).some((id) => anchorIds.has(id)) || anchorIds.has(episode.id))
    .map((episode) => ({ level: act.level, actId: act.id, episode })));
  return {
    objective: {
      id: objective.id, level: objective.level, label: objective.label, topic: objective.topic,
      candidateTask: objective.candidateTask, curriculumSceneIds: objective.curriculumSceneIds,
      prerequisiteIds: objective.prerequisiteIds, prerequisiteSemantics: objective.prerequisiteSemantics,
      prerequisiteStatus: objective.prerequisiteStatus, storyActId: objective.storyActId,
      episodeRefs: objective.episodeRefs || {}, candidateContent: objective.candidateContent || null,
      candidateFunctions: objective.candidateFunctions || [], candidateSourceRefs: objective.candidateSourceRefs,
      candidateSkillProfile: objective.candidateSkillProfile, storyStages: objective.storyStages || null,
      hintPolicy: objective.hintPolicy, candidateStoryActivityModes: objective.candidateStoryActivityModes,
      sourceComponents: objective.sourceComponents, officialItemIds: objective.officialItemIds,
      officialItemIdsByComponent: objective.officialItemIdsByComponent,
    },
    linkedFutureEpisodes: linkedEpisodes,
  };
}
function sourceCrosswalk(objective) {
  const components = objective.sourceComponents || [];
  const missing = components.filter((component) => component.matchStatus !== 'reviewed-match' || !Array.isArray(component.officialItemIds) || !component.officialItemIds.length);
  return {
    status: components.length > 0 && missing.length === 0 ? 'reviewed-match' : 'pending',
    missingComponents: missing.map((component) => component.component),
    officialItemIds: Array.isArray(objective.officialItemIds) ? objective.officialItemIds : [],
  };
}
function buildReport({ content, curriculum, blueprint, futureActs, inventory, ledger = { version: 1, receipts: [] } }) {
  const objectives = blueprint.allObjectives(curriculum, futureActs);
  const byId = new Map(objectives.map((objective) => [objective.id, objective]));
  const units = [];
  for (const scene of content.scenes) {
    const curriculumScene = curriculum.scenes.find((candidate) => candidate.id === scene.id);
    const linked = (curriculumScene?.objectiveIds || []).map((id) => byId.get(id)).filter(Boolean);
    const payload = lessonPayload(scene, curriculumScene, linked);
    const missingCrosswalkObjectives = linked.filter((objective) => sourceCrosswalk(objective).status !== 'reviewed-match').map((objective) => objective.id);
    const practiceSkills = [...new Set(linked.flatMap((objective) => objective.candidateSkillProfile?.candidatePracticeSkills || []))];
    units.push({
      unitId: `lesson:${scene.id}`, kind: 'lesson', level: 1, label: `Lesson ${scene.id + 1}: ${curriculumScene?.objective || scene.tag}`,
      fingerprint: fingerprint(payload), objectiveIds: linked.map((objective) => objective.id),
      sourceCrosswalk: { status: missingCrosswalkObjectives.length ? 'pending' : 'reviewed-match', missingObjectiveIds: missingCrosswalkObjectives },
      skills: { candidatePracticeSkills: practiceSkills, status: 'candidate-unvalidated' }, locked: false,
    });
  }
  for (const objective of objectives) {
    const crosswalk = sourceCrosswalk(objective);
    units.push({
      unitId: `objective:${objective.id}`, kind: 'objective', level: objective.level, label: objective.label,
      fingerprint: fingerprint(objectivePayload(objective, futureActs)), objectiveIds: [objective.id], sourceCrosswalk: crosswalk,
      skills: {
        candidatePracticeSkills: objective.candidateSkillProfile?.candidatePracticeSkills || [],
        officialExamSections: objective.candidateSkillProfile?.officialExamSections || [],
        status: objective.candidateSkillProfile?.status || 'candidate-unvalidated',
      },
      locked: objective.level > 1 || objective.readyForRelease !== true,
    });
  }

  const unitsById = new Map(units.map((unit) => [unit.unitId, unit]));
  const issues = [];
  const receipts = Array.isArray(ledger?.receipts) ? ledger.receipts : [];
  if (!ledger || ledger.version !== 1 || !Array.isArray(ledger.receipts)) issues.push({ code: 'invalid-ledger', message: 'Expected version 1 ledger with a receipts array.' });
  const grouped = new Map();
  receipts.forEach((receipt, index) => {
    const key = `${receipt?.unitId || ''}\u0000${receipt?.scope || ''}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push({ receipt, index });
  });
  const accepted = new Map();
  const knownSourceRefs = inventorySourceIds(inventory || {});
  for (const [key, entries] of grouped) {
    const [unitId, scope] = key.split('\u0000');
    const unit = unitsById.get(unitId);
    if (!unit) { entries.forEach(({ index }) => issues.push({ index, code: 'unknown-unit-id', unitId })); continue; }
    if (!REVIEW_SCOPES.includes(scope)) { entries.forEach(({ index }) => issues.push({ index, code: 'invalid-scope', unitId, scope })); continue; }
    if (entries.length > 1) { entries.forEach(({ index }) => issues.push({ index, code: 'duplicate-receipt', unitId, scope })); continue; }
    const { receipt, index } = entries[0];
    const missing = [];
    if (!text(receipt.reviewerId)) missing.push('reviewerId');
    if (!text(receipt.qualification)) missing.push('qualification');
    if (!validDate(receipt.date)) missing.push('date');
    if (!Array.isArray(receipt.sourceItemRefs) || !receipt.sourceItemRefs.length || receipt.sourceItemRefs.some((ref) => !text(ref))) missing.push('sourceItemRefs');
    const unknownSourceItemRefs = Array.isArray(receipt.sourceItemRefs) ? receipt.sourceItemRefs.filter((ref) => !knownSourceRefs.has(ref)) : [];
    if (unknownSourceItemRefs.length) { issues.push({ index, code: 'unknown-source-item-ref', unitId, scope, sourceItemRefs: unknownSourceItemRefs }); continue; }
    if (receipt.fingerprint !== unit.fingerprint) { issues.push({ index, code: 'stale-fingerprint', unitId, scope, currentFingerprint: unit.fingerprint }); continue; }
    if (missing.length) { issues.push({ index, code: 'missing-required-fields', unitId, scope, fields: missing }); continue; }
    accepted.set(key, receipt);
  }
  for (const unit of units) {
    unit.reviews = Object.fromEntries(REVIEW_SCOPES.map((scope) => {
      const receipt = accepted.get(`${unit.unitId}\u0000${scope}`);
      return [scope, receipt ? { status: 'reviewed', reviewerId: receipt.reviewerId, qualification: receipt.qualification, date: receipt.date, sourceItemRefs: receipt.sourceItemRefs } : { status: 'pending' }];
    }));
    unit.reviewStatus = REVIEW_SCOPES.every((scope) => unit.reviews[scope].status === 'reviewed') ? 'reviewed' : 'pending';
  }
  const roadmap = blueprint.report(curriculum, futureActs);
  const levels = roadmap.objectivesByLevel.map((level) => ({ level: level.level, objectiveCount: level.count, status: level.status, locked: level.status !== 'pilot-playable' }));
  const missingReviews = Object.fromEntries(REVIEW_SCOPES.map((scope) => [scope, units.filter((unit) => unit.reviews[scope].status !== 'reviewed').map((unit) => unit.unitId)]));
  const missingCrosswalk = units.filter((unit) => unit.sourceCrosswalk.status !== 'reviewed-match').map((unit) => ({ unitId: unit.unitId, missing: unit.sourceCrosswalk.missingComponents || unit.sourceCrosswalk.missingObjectiveIds }));
  const receiptReviewCounts = Object.fromEntries(REVIEW_SCOPES.map((scope) => [scope, units.filter((unit) => unit.reviews[scope].status === 'reviewed').length]));
  const completeObjectiveReceipts = units.filter((unit) => unit.kind === 'objective' && unit.reviewStatus === 'reviewed').length;
  return {
    schemaVersion: 1,
    summary: {
      lessons: content.scenes.length, currentPilotObjectives: roadmap.pilotObjectives,
      futurePlannedObjectives: roadmap.futureObjectiveProposals, educatorReviewedObjectives: roadmap.educatorReviewedObjectives,
      receiptReviewedUnits: receiptReviewCounts, objectivesWithBothReceipts: completeObjectiveReceipts,
      fullOfficialSyllabusInventoryComplete: roadmap.fullSyllabusInventoryComplete,
      objectiveCrosswalkComplete: roadmap.objectiveCrosswalkComplete,
      lockedLevels: levels.filter((level) => level.locked).map((level) => level.level),
      futureContentPlayable: false, gameplayUnlocksApplied: false,
    },
    levels, skills: { missingEvidenceModalities: roadmap.missingEvidenceModalities || [], status: 'candidate-unvalidated' },
    missingReviews, missingCrosswalk, invalidReceipts: issues, units,
  };
}
function loadInputs(root = path.resolve(__dirname, '..')) {
  const load = (file) => require(path.join(root, file));
  const ledgerPath = path.join(root, 'content-review.json');
  const ledger = fs.existsSync(ledgerPath) ? JSON.parse(fs.readFileSync(ledgerPath, 'utf8')) : { version: 1, receipts: [] };
  return {
    content: load('content-manifest.js'), curriculum: load('curriculum-data.js'), blueprint: load('learning-blueprint.js'),
    futureActs: load('future-acts.js'), inventory: load('hsk30-syllabus-inventory.json'), ledger,
  };
}
function main(argv) {
  let report;
  try { report = buildReport(loadInputs()); }
  catch (error) { process.stderr.write(`Content review audit failed: ${error.message}\n`); process.exitCode = 1; return; }
  if (argv.includes('--json')) process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  else {
    process.stdout.write(`HSK content review: ${report.summary.lessons} lessons; ${report.summary.currentPilotObjectives} pilot objectives; ${report.summary.futurePlannedObjectives} future planned objectives (locked).\n`);
    process.stdout.write(`Blueprint educator sign-offs: ${report.summary.educatorReviewedObjectives}; objectives with both receipts: ${report.summary.objectivesWithBothReceipts}.\n`);
    const missingByType = (scope) => {
      const missing = new Set(report.missingReviews[scope]);
      return {
        lessons: report.units.filter((unit) => unit.kind === 'lesson' && missing.has(unit.unitId)).length,
        pilotObjectives: report.units.filter((unit) => unit.kind === 'objective' && unit.level === 1 && missing.has(unit.unitId)).length,
        futureObjectives: report.units.filter((unit) => unit.kind === 'objective' && unit.level > 1 && missing.has(unit.unitId)).length,
      };
    };
    for (const scope of REVIEW_SCOPES) {
      const counts = missingByType(scope);
      process.stdout.write(`Missing ${scope} review: ${counts.lessons} lessons, ${counts.pilotObjectives} pilot objectives, ${counts.futureObjectives} future objectives.\n`);
    }
    const pendingObjectiveCrosswalks = report.units.filter((unit) => unit.kind === 'objective' && unit.sourceCrosswalk.status !== 'reviewed-match');
    const components = [...new Set(pendingObjectiveCrosswalks.flatMap((unit) => unit.sourceCrosswalk.missingComponents || []))];
    process.stdout.write(`Source crosswalk pending: ${pendingObjectiveCrosswalks.length} objectives; components: ${components.join(', ')}.\n`);
    process.stdout.write(`Unvalidated skill evidence: ${report.skills.missingEvidenceModalities.join(', ')}\n`);
    if (report.invalidReceipts.length) process.stdout.write(`Invalid receipts (${report.invalidReceipts.length}): ${report.invalidReceipts.map((issue) => `${issue.code}:${issue.unitId || ''}`).join(', ')}\n`);
    process.stdout.write('Review status is advisory only; approvals never unlock gameplay.\n');
  }
}
if (require.main === module) main(process.argv.slice(2));
module.exports = { buildReport, fingerprint, loadInputs, REVIEW_SCOPES };
