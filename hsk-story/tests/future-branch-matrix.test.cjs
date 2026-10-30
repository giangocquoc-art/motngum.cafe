const test = require('node:test');
const assert = require('node:assert/strict');
const futureActs = require('../future-acts.js');

function buildDeclarativeRoute(act, selections) {
  const episodes = act.episodes;
  const selected = episodes.map((episode, sourceIndex) => {
    const option = episode.decision.choices.find(choice => choice.id === selections[episode.id]);
    assert.ok(option, `valid choice is required for ${act.level}/${episode.id}`);
    const targetIndex = episodes.findIndex(candidate => candidate.id === option.laterConsequence.episodeId);
    assert.ok(targetIndex >= sourceIndex, `callback cannot precede its choice: ${episode.id}/${option.id}`);
    assert.ok(targetIndex >= 0, `callback target must exist: ${episode.id}/${option.id}`);
    return { sourceIndex, targetIndex, episode, option };
  });

  const route = [];
  for (let targetIndex = 0; targetIndex < episodes.length; targetIndex += 1) {
    const episode = episodes[targetIndex];
    const incomingCallbacks = selected
      .filter(item => item.targetIndex === targetIndex && item.sourceIndex < targetIndex)
      .sort((a, b) => a.sourceIndex - b.sourceIndex);
    for (const item of incomingCallbacks) {
      route.push({ type: 'callback', id: item.option.laterConsequence.sceneId, episodeId: episode.id });
    }

    route.push({ type: 'decision', id: episode.decision.id, episodeId: episode.id });
    const chosen = selected[targetIndex];
    route.push({ type: 'reaction', id: chosen.option.branchSceneId, episodeId: episode.id });
    route.push({ type: 'join', id: episode.decision.convergenceSceneId, episodeId: episode.id });
    if (chosen.targetIndex === targetIndex) {
      route.push({ type: 'callback', id: chosen.option.laterConsequence.sceneId, episodeId: episode.id });
    }
  }

  for (const objectiveId of act.commonLearningAnchorIds) {
    route.push({ type: 'learning-anchor', id: objectiveId, episodeId: null });
  }
  return { route, selected };
}

function selectionSets(episodes) {
  return Array.from({ length: 1 << episodes.length }, (_, mask) => Object.fromEntries(
    episodes.map((episode, index) => [episode.id, episode.decision.choices[(mask >> index) & 1].id]),
  ));
}

test('all HSK2–6 authored branch matrices enumerate 16 declarative routes with shared learning anchors', () => {
  assert.equal(futureActs.validate().length, 0, futureActs.validate().join('; '));
  assert.equal(futureActs.acts.length, 5);

  for (const act of futureActs.acts) {
    const episodes = act.episodes;
    assert.equal(episodes.length, 4, `HSK ${act.level} has four authored episodes`);
    assert.equal(act.commonLearningAnchorIds.length, 6, `HSK ${act.level} has six common objectives`);
    assert.equal(new Set(act.commonLearningAnchorIds).size, 6);
    assert.ok(episodes.every(episode => episode.decision.choices.length === 2), `HSK ${act.level} decisions stay binary`);

    const allBranchIds = new Set(episodes.flatMap(episode => episode.decision.choices.map(choice => choice.branchSceneId)));
    const allCallbackIds = new Set(episodes.flatMap(episode => episode.decision.choices.map(choice => choice.laterConsequence.sceneId)));
    const allJoinIds = new Set(episodes.map(episode => episode.decision.convergenceSceneId));
    const allDecisionIds = new Set(episodes.map(episode => episode.decision.id));
    assert.equal(allBranchIds.size, 8, `HSK ${act.level} reactions have unique scene IDs`);
    assert.equal(allCallbackIds.size, 8, `HSK ${act.level} callbacks have unique scene IDs`);
    assert.equal(allJoinIds.size, 4, `HSK ${act.level} convergence scenes have unique IDs`);
    assert.equal(allDecisionIds.size, 4, `HSK ${act.level} decisions have unique IDs`);

    const structuralIds = [...allBranchIds, ...allCallbackIds, ...allJoinIds, ...allDecisionIds, ...act.commonLearningAnchorIds];
    assert.equal(new Set(structuralIds).size, structuralIds.length, `HSK ${act.level} branch, callback, join, decision, and anchor IDs do not collide`);

    const routes = selectionSets(episodes);
    assert.equal(routes.length, 16, `HSK ${act.level} covers all combinations`);
    const seenSelections = new Set();
    for (const selections of routes) {
      const selectionKey = episodes.map(episode => selections[episode.id]).join('|');
      assert.ok(!seenSelections.has(selectionKey), `HSK ${act.level} combination is unique`);
      seenSelections.add(selectionKey);

      const { route, selected } = buildDeclarativeRoute(act, selections);
      const routeIds = route.map(node => node.id);
      assert.equal(new Set(routeIds).size, routeIds.length, `HSK ${act.level} route has no repeated scene IDs`);
      assert.deepEqual(route.filter(node => node.type === 'decision').map(node => node.id), episodes.map(episode => episode.decision.id));
      assert.deepEqual(route.filter(node => node.type === 'reaction').map(node => node.id), selected.map(item => item.option.branchSceneId));
      assert.deepEqual(route.filter(node => node.type === 'join').map(node => node.id), episodes.map(episode => episode.decision.convergenceSceneId));

      const expectedCallbacks = selected
        .slice()
        .sort((a, b) => a.targetIndex - b.targetIndex || a.sourceIndex - b.sourceIndex)
        .map(item => item.option.laterConsequence.sceneId);
      assert.deepEqual(route.filter(node => node.type === 'callback').map(node => node.id), expectedCallbacks);

      const chosenBranchIds = new Set(selected.map(item => item.option.branchSceneId));
      const chosenCallbackIds = new Set(selected.map(item => item.option.laterConsequence.sceneId));
      assert.deepEqual(route.filter(node => allBranchIds.has(node.id)).map(node => node.id), [...chosenBranchIds]);
      assert.deepEqual(route.filter(node => allCallbackIds.has(node.id)).map(node => node.id), expectedCallbacks);

      for (const item of selected) {
        const branchPosition = routeIds.indexOf(item.option.branchSceneId);
        const joinPosition = routeIds.indexOf(item.option.joinsAtSceneId);
        const callbackPosition = routeIds.indexOf(item.option.laterConsequence.sceneId);
        assert.ok(branchPosition < joinPosition, `HSK ${act.level} selected branch rejoins after its reaction`);
        assert.ok(joinPosition < callbackPosition, `HSK ${act.level} callback follows its choice and join`);
        for (const other of item.episode.decision.choices) {
          if (other.id === item.option.id) continue;
          assert.ok(!routeIds.includes(other.branchSceneId), `unchosen reaction is absent: ${other.branchSceneId}`);
          assert.ok(!routeIds.includes(other.laterConsequence.sceneId), `unchosen callback is absent: ${other.laterConsequence.sceneId}`);
        }
      }

      const anchorNodes = route.filter(node => node.type === 'learning-anchor');
      assert.deepEqual(anchorNodes.map(node => node.id), act.commonLearningAnchorIds, `HSK ${act.level} gives every route the same six learning objectives`);
      assert.deepEqual(route.slice(-act.commonLearningAnchorIds.length).map(node => node.id), act.commonLearningAnchorIds, `HSK ${act.level} declarative route terminates at its common anchor sequence`);
    }
    assert.equal(seenSelections.size, 16, `HSK ${act.level} exhaustively enumerates its authored combinations`);
  }
});
