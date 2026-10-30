const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../hsk30-syllabus-inventory.json');
const blueprint = require('../learning-blueprint.js');

const expected = {
  1: { tasks: 15, topics: [5, 15, 30], topicRows: 30, topicNodes: 50, vocabulary: 300, characters: 246, grammarPages: 3, grammarRows: 70, grammarPageRows: [27, 31, 12] },
  2: { tasks: 17, topics: [5, 18, 34], topicRows: 34, topicNodes: 57, vocabulary: 200, characters: 125, grammarPages: 3, grammarRows: 78, grammarPageRows: [34, 31, 13] },
  3: { tasks: 22, topics: [6, 22, 54], topicRows: 56, topicNodes: 82, vocabulary: 500, characters: 284, grammarPages: 3, grammarRows: 96, grammarPageRows: [31, 33, 32] },
  4: { tasks: 30, topics: [7, 31, 77], topicRows: 79, topicNodes: 115, vocabulary: 1000, characters: 441, grammarPages: 3, grammarRows: 95, grammarPageRows: [32, 30, 33] },
  5: { tasks: 28, topics: [7, 29, 72], topicRows: 74, topicNodes: 108, vocabulary: 1600, characters: 431, grammarPages: 3, grammarRows: 70, grammarPageRows: [32, 34, 4] },
  6: { tasks: 24, topics: [7, 25, 68], topicRows: 71, topicNodes: 100, vocabulary: 1800, characters: 413, grammarPages: 2, grammarRows: 50, grammarPageRows: [34, 16] },
};

test('pinned source inventory covers all five components for HSK 3.0 levels 1–6', () => {
  assert.equal(inventory.schemaVersion, 2);
  assert.equal(inventory.normalizationVersion, 2);
  assert.equal(inventory.edition, 'HSK 3.0 syllabus, 2025-11');
  assert.equal(inventory.sourceSha256, 'ec74ce0439e837bbb15154be13e747ae798903b2fd3a331629df6c3b45504941');
  assert.match(inventory.scope, /levels 1–6 only/);
  assert.match(inventory.scope, /HSK 7–9 task section begins on printed page 45/);
  assert.deepEqual(Object.keys(inventory.levelCounts), ['1', '2', '3', '4', '5', '6']);
  for (const [level, want] of Object.entries(expected)) {
    const counts = inventory.levelCounts[level];
    assert.equal(counts.tasks, want.tasks, `task count level ${level}`);
    assert.deepEqual(counts.topicsByTier, want.topics, `official topic footer level ${level}`);
    assert.equal(counts.topicNodes, want.topicNodes);
    assert.equal(counts.vocabulary, want.vocabulary, `vocabulary count level ${level}`);
    assert.equal(counts.recognitionCharacters, want.characters, `character count level ${level}`);
    assert.equal(counts.grammarPages, want.grammarPages, `grammar page count level ${level}`);
    assert.equal(counts.grammarSourceRows, want.grammarRows, 'mechanically extracted physical source rows');
    assert.equal(counts.grammarItemCount, null, 'the PDF does not publish a grammar item count');

    const tasks = inventory.tasks[level];
    assert.equal(tasks.length, want.tasks);
    assert.deepEqual(tasks.map(item => item.ordinal), Array.from({ length: want.tasks }, (_, i) => i + 1));
    assert.ok(tasks.every((item, index) => item.id === `hsk30:l${level}:task:${String(index + 1).padStart(3, '0')}` && item.level === Number(level) && /^[a-f0-9]{64}$/.test(item.sourceHash) && item.requirementCount > 0));
    assert.ok(tasks.every(item => item.printedPage >= 2 && item.printedPage <= 44));

    const topics = inventory.topics[level];
    assert.deepEqual(topics.officialTierCounts, want.topics);
    assert.equal(topics.rows.length, want.topicRows);
    assert.equal(new Set(topics.rows.map(row => row.id)).size, want.topicRows);
    assert.ok(topics.rows.length > 0 && topics.rows.every(row => row.level === Number(level) && row.printedPage >= 56 && row.printedPage <= 71 && row.id === `hsk30:l${level}:topic:p${row.printedPage}:r${String(row.rowOrdinal).padStart(3, '0')}` && /^[a-f0-9]{64}$/.test(row.sourceHash) && row.visibleCellCount > 0));
    const nodes = topics.nodes;
    assert.equal(nodes.length, want.topicNodes);
    assert.deepEqual([1, 2, 3].map(tier => nodes.filter(node => node.tier === tier).length), want.topics);
    assert.equal(new Set(nodes.map(node => node.id)).size, want.topicNodes);
    const nodesById = new Map(nodes.map(node => [node.id, node]));
    assert.ok(nodes.every(node => {
      const tierCode = ['a', 'b', 'c'][node.tier - 1];
      const segment = `${tierCode}${String(node.siblingOrdinal).padStart(2, '0')}`;
      const prefix = `hsk30:2025-11:l${level}:topic:`;
      const expectedId = node.tier === 1 ? prefix + segment : `${node.parentId}.${segment}`;
      const parent = node.parentId === null ? null : nodesById.get(node.parentId);
      return node.id === expectedId && node.level === Number(level) && node.columnOrdinal === node.tier && node.printedPage >= 56 && node.printedPage <= 71 && /^[a-f0-9]{64}$/.test(node.sourceHash) && Array.isArray(node.cellBoundingBox) && node.cellBoundingBox.length === 4 && (node.tier === 1 ? parent === null : parent?.tier === node.tier - 1);
    }));
    assert.match(topics.hierarchyStatus, /Visual reconciliation.*pending/);

    const chars = inventory.characters[level];
    assert.equal(chars.length, want.characters);
    assert.deepEqual(chars.map(item => item.ordinal), Array.from({ length: want.characters }, (_, i) => i + 1));
    assert.ok(chars.every((item, index) => item.id === `hsk30:l${level}:hanzi:${String(index + 1).padStart(3, '0')}` && item.level === Number(level) && /^[a-f0-9]{64}$/.test(item.sourceHash)));

    const grammarPages = inventory.grammarPages[level];
    assert.equal(grammarPages.length, want.grammarPages);
    assert.ok(grammarPages.every((page, index) => page.level === Number(level) && page.id === `hsk30:l${level}:grammar:p${page.printedPage}` && /^[a-f0-9]{64}$/.test(page.sourceHash) && page.nonemptyLineCount > 0 && page.rowCount === null && page.extractedSourceRowCount === want.grammarPageRows[index]));

    const grammarRows = inventory.grammarSourceRows[level];
    assert.equal(grammarRows.length, want.grammarRows);
    assert.ok(grammarRows.every((row, index) => {
      const pageRowOrdinal = grammarRows.slice(0, index + 1).filter(item => item.printedPage === row.printedPage).length;
      return row.id === `hsk30:2025-11:l${level}:grammar:p${row.printedPage}:r${String(pageRowOrdinal).padStart(3, '0')}` && row.ordinal === index + 1 && row.pageRowOrdinal === pageRowOrdinal && /^[a-f0-9]{64}$/.test(row.sourceHash) && Array.isArray(row.sourceCellHashes) && row.sourceCellHashes.length === 4 && row.sourceCellHashes.some(Boolean) && row.sourceCellHashes.every(hash => hash === null || /^[a-f0-9]{64}$/.test(hash)) && Array.isArray(row.effectiveCellHashes) && row.effectiveCellHashes.length === 4 && Array.isArray(row.cellBoundingBoxes) && row.cellBoundingBoxes.length === 4 && row.cellBoundingBoxes.every((box, column) => row.sourceCellHashes[column] ? Array.isArray(box) && box.length === 4 : box === null);
    }));
  }

  assert.equal(inventory.tasks['6'].at(-1).printedPage <= 44, true);
  assert.equal(inventory.vocabulary.length, 5400);
  assert.deepEqual(inventory.vocabulary.map(item => item.serial), Array.from({ length: 5400 }, (_, i) => i + 1));
  assert.equal(new Set(inventory.vocabulary.map(item => item.id)).size, 5400);
  assert.ok(inventory.vocabulary.every(item => item.id === `hsk30:vocab:${String(item.serial).padStart(4, '0')}` && /^[a-f0-9]{64}$/.test(item.sourceHash) && item.printedPage));
  assert.equal(Object.values(inventory.characters).flat().length, 1940);
  assert.equal(Object.values(inventory.grammarPages).flat().length, 17);
  assert.equal(Object.values(inventory.grammarSourceRows).flat().length, 459);
  assert.equal(Object.values(inventory.topics).flatMap(level => level.nodes).length, 512);
});

test('grammar and merged topics preserve source locators without copying tables or claiming false normalization', () => {
  assert.match(inventory.extraction.grammarPages, /not official grammar item counts/);
  assert.match(inventory.extraction.topicRows, /geometry-derived tier-cell IDs/);
  assert.ok(Object.values(inventory.grammarPages).flat().every(page => page.nonemptyLineCount > 0 && !('sourceText' in page) && !('sourceLines' in page)));
  assert.ok(Object.values(inventory.topics).flatMap(level => level.nodes).every(node => !('sourceText' in node) && !('label' in node)));
  assert.ok(Object.values(inventory.grammarSourceRows).flat().every(row => !('sourceText' in row) && !('expression' in row)));
  assert.ok(inventory.vocabulary.every(item => !('headword' in item) && !('pinyin' in item)));
  assert.ok(Object.values(inventory.characters).flat().every(item => !('character' in item) && !('codePoint' in item)));
});

test('runtime inventory completeness fails closed when a topic row is missing or duplicated', () => {
  const rows = blueprint.syllabusInventory.topics['1'].rows;
  const removed = rows.pop();
  try {
    assert.equal(blueprint.report(null, null).completeSourceInventory, false);
  } finally {
    rows.push(removed);
  }

  const original = rows[0];
  rows[0] = { ...original, id: rows[1].id };
  try {
    assert.equal(blueprint.report(null, null).completeSourceInventory, false);
  } finally {
    rows[0] = original;
  }

  assert.equal(blueprint.report(null, null).completeSourceInventory, true);
});

test('runtime completeness also rejects missing topic nodes and grammar source rows', () => {
  const nodes = blueprint.syllabusInventory.topics['1'].nodes;
  const node = nodes.pop();
  try {
    assert.equal(blueprint.report(null, null).completeSourceInventory, false);
  } finally {
    nodes.push(node);
  }

  const grammarRows = blueprint.syllabusInventory.grammarSourceRows['1'];
  const grammarRow = grammarRows.pop();
  try {
    assert.equal(blueprint.report(null, null).completeSourceInventory, false);
  } finally {
    grammarRows.push(grammarRow);
  }

  assert.equal(blueprint.report(null, null).completeSourceInventory, true);
});
