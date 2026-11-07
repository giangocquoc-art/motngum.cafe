#!/usr/bin/env node
"use strict";
const story = require("../duong-re/branch-data.js");
const engine = require("../duong-re/branch-engine.js");
const plan = require("../story-session-plan.js");
const blueprint = require("../learning-blueprint.js");
const content = require("../content-manifest.js");
const learning = require("../duong-re/branch-learning.js");
const curriculum = require("../curriculum-data.js");

const requiredAnchors = ["school-gate", "lost-diary", "staff-office", "canteen", "noodle-order", "walk-home", "night", "epilogue", "day2-arrival", "day2-breakfast", "day2-bird", "day2-liu", "day2-night", "week-later-shop", "week-later-meal", "week-later-home-checkin", "week-later-home-answer", "week-later-home", "week-later-count", "week-later-thanks", "week-later-goodbye"];
function edges(node) {
  if (node.kind === "ending") return [];
  if (node.kind === "route") return node.routes.map(route => route.to);
  if (node.kind === "choice") return node.options.map(option => option.to);
  return [node.to];
}
function canReach(start, target) {
  const seen = new Set(), stack = [start];
  while (stack.length) {
    const id = stack.pop();
    if (id === target) return true;
    if (seen.has(id)) continue;
    seen.add(id);
    const node = story.byId[id];
    if (node) edges(node).forEach(next => stack.push(next));
  }
  return false;
}
function nextAnchor(nodeId) {
  const sourceIndex = story.scenes.findIndex(node => node.id === nodeId);
  return requiredAnchors.find(id => story.scenes.findIndex(node => node.id === id) > sourceIndex) || null;
}
function audit() {
  const errors = [], visibleConsequences = [], convergence = [], options = story.scenes.filter(node => node.kind === "choice").flatMap(node => node.options.map(option => ({ node, option })));
  errors.push(...plan.validate(story, blueprint, content, learning, curriculum).map(error => "session plan: " + error));
  errors.push(...engine.validate().errors.map(error => "story engine: " + error));
  for (const { node, option } of options) {
    const echo = story.scenes.find(target => target.id !== node.id && canReach(option.to, target.id) && (target.echoes || []).some(item => item.if === option.id));
    const callback = story.callbacks.find(item => item.choice === option.id && item.at !== node.id && canReach(option.to, item.at));
    if (!echo && !callback) visibleConsequences.push({ nodeId: node.id, choiceId: option.id, issue: "no reachable later echo or selected-choice callback" });
    const anchor = nextAnchor(node.id);
    if (anchor && !canReach(option.to, anchor)) convergence.push({ nodeId: node.id, choiceId: option.id, missingAnchor: anchor });
    if (option.requires) {
      const requiredFlags = [option.requires.flag, option.requires.notFlag, ...(option.requires.anyFlags || [])].filter(Boolean);
      const unknown = requiredFlags.filter(flag => !options.some(candidate => candidate.option.id === flag));
      if (unknown.length) errors.push("Condition references unknown selected option: " + node.id + "/" + option.id + " → " + unknown.join(","));
    }
  }
  visibleConsequences.forEach(item => errors.push("choice consequence: " + item.nodeId + "/" + item.choiceId));
  convergence.forEach(item => errors.push("choice convergence: " + item.nodeId + "/" + item.choiceId + " cannot reach " + item.missingAnchor));
  for (const source of story.scenes) for (const targetId of edges(source)) {
    if (plan.getSegmentForScene(targetId).order < plan.getSegmentForScene(source.id).order) errors.push("non-forward story edge: " + source.id + " → " + targetId);
  }
  return { errors, nodeCount: story.scenes.length, choiceNodeCount: story.scenes.filter(node => node.kind === "choice").length, optionCount: options.length, taskCount: learning.total, legacyTaskCount: content.scenes.length, objectiveCount: blueprint.objectives.length, segmentCount: plan.segments.length, structuralPaths: engine.validate().structuralPaths, visibleConsequences, convergence };
}
if (require.main === module) {
  const report = audit();
  console.log(`Story session audit: ${report.errors.length ? "FAIL" : "PASS"}`);
  console.log(`${report.nodeCount} nodes; ${report.choiceNodeCount} choice nodes; ${report.optionCount} options; ${report.taskCount} branch tasks (${report.legacyTaskCount} legacy HSK1 lesson scenes retained); ${report.objectiveCount} HSK1 candidate objectives; ${report.segmentCount} segments.`);
  console.log(`Engine validator confirms ${report.structuralPaths} structural paths; checks are graph-based and do not enumerate those paths.`);
  console.log(`Later consequence gaps: ${report.visibleConsequences.length}; next-anchor convergence gaps: ${report.convergence.length}.`);
  report.errors.forEach(error => console.error("- " + error));
  process.exitCode = report.errors.length ? 1 : 0;
}
module.exports = { audit, canReach, nextAnchor };
