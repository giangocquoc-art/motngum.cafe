const test = require('node:test');
const assert = require('node:assert/strict');
const inventory = require('../hsk30-syllabus-inventory.json');
const blueprint = require('../learning-blueprint.js');

const expected = {
  1: { tasks: 15, topics: [5, 15, 30], topicRows: 30, vocabulary: 300, characters: 246, grammarPages: 3 },
  2: { tasks: 17, topics: [5, 18, 34], topicRows: 34, vocabulary: 200, characters: 125, grammarPages: 3 },
  3: { tasks: 22, topics: [6, 22, 54], topicRows: 56, vocabulary: 500, characters: 284, grammarPages: 3 },
  4: { tasks: 30, topics: [7, 31, 77], topicRows: 79, vocabulary: 1000, characters: 441, grammarPages: 3 },
  5: { tasks: 28, topics: [7, 29, 72], topicRows: 74, vocabulary: 1600, characters: 431, grammarPages: 3 },
  6: { tasks: 24, topics: [7, 25, 68], topicRows: 71, vocabulary: 1800, characters: 413, grammarPages: 2 },
};

test('pinned source inventory covers all five components for HSK 3.0 levels 1–6', () => {
  assert.equal(inventory.edition, 'HSK 3.0 syllabus, 2025-11');
  assert.match(inventory.sourceSha256, /^[a-f0-9]{64}$/);
  assert.match(inventory.scope, /levels 1–6 only/);
  assert.match(inventory.scope, /HSK 7–9 task section begins on printed page 45/);
  assert.deepEqual(Object.keys(inventory.levelCounts), ['1', '2', '3', '4', '5', '6']);
  for (const [level, want] of Object.entries(expected)) {
    const counts = inventory.levelCounts[level];
    assert.equal(counts.tasks, want.tasks, `task count level ${level}`);
    assert.deepEqual(counts.topicsByTier, want.topics, `official topic footer level ${level}`);
    assert.equal(counts.vocabulary, want.vocabulary, `vocabulary count level ${level}`);
    assert.equal(counts.recognitionCharacters, want.characters, `character count level ${level}`);
    assert.equal(counts.grammarPages, want.grammarPages, `grammar page count level ${level}`);
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
    assert.match(topics.hierarchyStatus, /parent links require manual table reconciliation/);

    const chars = inventory.characters[level];
    assert.equal(chars.length, want.characters);
    assert.deepEqual(chars.map(item => item.ordinal), Array.from({ length: want.characters }, (_, i) => i + 1));
    assert.ok(chars.every((item, index) => item.id === `hsk30:l${level}:hanzi:${String(index + 1).padStart(3, '0')}` && item.level === Number(level) && /^[a-f0-9]{64}$/.test(item.sourceHash)));

    const grammarPages = inventory.grammarPages[level];
    assert.equal(grammarPages.length, want.grammarPages);
    assert.ok(grammarPages.every(page => page.level === Number(level) && page.id === `hsk30:l${level}:grammar:p${page.printedPage}` && /^[a-f0-9]{64}$/.test(page.sourceHash) && page.nonemptyLineCount > 0 && page.rowCount === null));
  }

  assert.equal(inventory.tasks['6'].at(-1).printedPage <= 44, true);
  assert.equal(inventory.vocabulary.length, 5400);
  assert.deepEqual(inventory.vocabulary.map(item => item.serial), Array.from({ length: 5400 }, (_, i) => i + 1));
  assert.equal(new Set(inventory.vocabulary.map(item => item.id)).size, 5400);
  assert.ok(inventory.vocabulary.every(item => item.id === `hsk30:vocab:${String(item.serial).padStart(4, '0')}` && /^[a-f0-9]{64}$/.test(item.sourceHash) && item.printedPage));
  assert.equal(Object.values(inventory.characters).flat().length, 1940);
  assert.equal(Object.values(inventory.grammarPages).flat().length, 17);
});

test('grammar and merged topics preserve source locators without copying tables or claiming false normalization', () => {
  assert.match(inventory.extraction.grammarPages, /no grammar serial IDs or official row total/);
  assert.match(inventory.extraction.topicRows, /Merged cells are not assigned guessed parent nodes/);
  assert.ok(Object.values(inventory.grammarPages).flat().every(page => page.nonemptyLineCount > 0 && !('sourceText' in page) && !('sourceLines' in page)));
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
