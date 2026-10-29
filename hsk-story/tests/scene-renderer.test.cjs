const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const manifest = require('../art/manifest.json');
const flatBox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'scene-flat-art.js'), 'utf8'), flatBox);
const box = { HSKFlatArt: flatBox.HSKFlatArt };
vm.runInNewContext(fs.readFileSync(path.join(root, 'scene-manifest.js'), 'utf8'), box);
const runtime = JSON.parse(JSON.stringify(box.HSKSceneManifest));
vm.runInNewContext(fs.readFileSync(path.join(root, 'scene-renderer.js'), 'utf8'), box);
const layers = box.HSKSceneLayers;
const graphBox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'story-graph.js'), 'utf8'), graphBox);
const contentBox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'content-manifest.js'), 'utf8'), contentBox);
const content = contentBox.HSKContent;
const expected = [...graphBox.HSKStoryGraph.sceneIds.slice(0, 7), 'lost-notebook', ...graphBox.HSKStoryGraph.sceneIds.slice(7)];

const positions = ['data-layer="background"', 'data-layer="midground"', 'data-layer="background-characters"', 'data-layer="counter-occluder"', 'data-layer="tabletop"', 'data-layer="characters"', 'data-layer="foreground"'];

test('compiled scene data is current and preserves canonical story IDs and sprite semantics', () => {
  execFileSync(process.execPath, [path.join(root, 'scripts/build-scene-manifest.cjs'), '--check']);
  assert.deepEqual(Array.from(runtime.sceneIds), expected);
  assert.deepEqual(runtime.scenes, { ...manifest.scenes, ...manifest.auxiliaryScenes });
  assert.deepEqual(Array.from(layers.validate(Object.keys(runtime.scenes))), []);
  for (const [name, sprite] of Object.entries(runtime.sprites)) {
    assert.equal(sprite.format, 'svg', `${name} uses native SVG`);
    assert.equal('columns' in sprite || 'rows' in sprite, false, `${name} does not retain a raster atlas grid`);
    assert.equal(sprite.frameCount, manifest.spriteCharacters[name].frameCount);
  }
});

test('renderer emits inline native characters and exactly one separate Sparrow per scene', () => {
  for (const [id, scene] of Object.entries(runtime.scenes)) {
    const markup = layers.render(null, id);
    assert.equal((markup.match(/class="cs-sparrow(?: is-flying)?"/g) || []).length, 1, `${id} has one Sparrow sprite`);
    assert.equal((markup.match(/data-character="sparrow"/g) || []).length, 1, `${id} has one Sparrow semantic actor`);
    assert.equal((markup.match(/class="cs-actor"/g) || []).length, scene.actors.length, `${id} keeps all declared actors`);
    assert.ok(markup.includes('data-layer="characters"'));
    assert.ok(markup.includes('data-asset="'+runtime.sprites.sparrow.frameAssets[scene.sparrow.expression]+'"'), `${id} uses its selected Sparrow expression asset`);
    assert.doesNotMatch(markup, /<img[^>]+data-character=|background-image:url\(/, `${id} does not render actors from raster atlases`);
    assert.equal((markup.match(/<svg\b/g) || []).length, scene.actors.length + 1, `${id} renders one inline SVG per actor, including Sparrow`);

    const bgAssets = Object.values(scene.layers.background);
    assert.equal(bgAssets.length, 2, `${id} has explicit desktop and portrait backgrounds`);
    for (const asset of bgAssets) assert.ok(asset.startsWith('flat/backgrounds/'), `${id} background is native flat art`);
    for (const actor of [...scene.actors, ...Object.values(scene.companions || {})]) {
      const sprite = runtime.sprites[actor.sprite || actor.character];
      assert.ok(sprite?.frameAssets[actor.expression], `${id}/${actor.character}/${actor.expression} has a frame asset`);
    }
  }
});

test('scene DOM order preserves independent counter/table/actor/apron depth', () => {
  for (const id of ['hsk1.e01.liu-noodle-order', 'hsk1.e01.liu-payment']) {
    const markup = layers.render(null, id);
    let previous = -1;
    for (const marker of positions) {
      const index = markup.indexOf(marker);
      assert.ok(index > previous, `${id} layers ordered as background → midground → rear cast → counter → tabletop → cast/Sparrow → apron`);
      previous = index;
    }
    assert.ok(markup.indexOf('data-character="liu"') < markup.indexOf('data-layer="counter-occluder"'), `${id} counter mask occludes Liu`);
    assert.ok(markup.indexOf('data-layer="counter-occluder"') < markup.indexOf('data-layer="tabletop"'), `${id} tabletop follows counter edge`);
    assert.ok(markup.indexOf('data-layer="tabletop"') < markup.indexOf('data-character="an"'), `${id} actors sit in front of tabletop`);
    assert.ok(markup.indexOf('data-character="an"') < markup.indexOf('data-layer="foreground"'), `${id} apron overlays lower bodies`);
    assert.equal((markup.match(/data-layer-index=/g) || []).length, (manifest.scenes[id].layers.midground || []).length + (manifest.scenes[id].layers.counter || []).length + (manifest.scenes[id].layers.tabletop || []).length + (manifest.scenes[id].layers.foreground || []).length, `${id} every layered prop has a data index`);
    assert.match(markup, /class="cs-tabletop"/);
    assert.match(markup, /class="cs-counter-occluder"/);
  }
  const order = layers.render(null, 'hsk1.e01.liu-noodle-order');
  const payment = layers.render(null, 'hsk1.e01.liu-payment');
  assert.doesNotMatch(order, /flat\/layers\/(?:bowl|steam)(?:-portrait|-compact)?\.svg/, 'Order scene has no served bowl/steam');
  assert.match(payment, /flat\/layers\/bowl\.svg/, 'Payment scene serves the meal');
  assert.match(payment, /flat\/layers\/steam\.svg/, 'Payment scene includes separate animated steam');
  assert.match(payment, /cs-steam-layer/, 'Steam layer exposes its motion class');
});

test('expression changes update the inline SVG in place and preserve the single Sparrow', () => {
  const actor = { dataset: { sprite: 'an', expression: 'awkward' }, innerHTML: '', style: {} };
  const bird = { dataset: { sprite: 'sparrow', expression: 'curious' }, innerHTML: '', style: {} };
  const host = { querySelector(selector) { return selector === '.cs-sparrow' ? bird : selector.includes('data-character="an"') ? actor : null; } };
  assert.equal(layers.setExpression(host, 'an', 'smile'), true);
  assert.equal(actor.dataset.expression, 'smile');
  assert.match(actor.innerHTML, /<svg\b/);
  assert.equal(actor.dataset.asset, runtime.sprites.an.frameAssets.smile);
  assert.equal(layers.setExpression(host, 'sparrow', 'happy'), true);
  assert.equal(bird.dataset.expression, 'happy');
  assert.equal(bird.dataset.asset, runtime.sprites.sparrow.frameAssets.happy);
  assert.match(bird.innerHTML, /class="cs-wing"/);
  assert.throws(() => layers.setExpression(host, 'an', 'missing'), /Missing expression/);
  assert.equal((layers.render(null, 'hsk1.e01.liu-noodle-order').match(/class="cs-sparrow/g) || []).length, 1);
  assert.throws(() => layers.render(null, 'missing-scene'), /Unknown art scene/);
});

test('lost-notebook route variants and speaking roles keep existing story contracts', () => {
  const office = runtime.scenes['lost-notebook-office'];
  assert.ok(runtime.sceneIds.includes('lost-notebook'));
  for (const [route, expectedCharacter, other] of [['friend', 'xiaoyu', 'wang'], ['teacher', 'wang', 'xiaoyu']]) {
    const markup = layers.render(null, 'lost-notebook-office', { companion: route });
    assert.equal((markup.match(new RegExp('data-character="'+expectedCharacter+'"', 'g')) || []).length, 1);
    assert.equal((markup.match(new RegExp('data-character="'+other+'"', 'g')) || []).length, 0);
    assert.equal((markup.match(/data-character="sparrow"/g) || []).length, 1);
  }
  assert.equal(office.companions.friend.character, 'xiaoyu');
  assert.equal(office.companions.teacher.character, 'wang');

  for (const [index, scene] of content.scenes.entries()) {
    const id = graphBox.HSKStoryGraph.idAt(index);
    const actor = runtime.scenes[id].actors.find(item => item.character === scene.speakerCharacter);
    assert.ok(actor, `${id} has its declared speaker on stage`);
    assert.ok(runtime.sprites[actor.sprite || actor.character].frames.speaking !== undefined, `${id} speaker has a speaking state`);
  }
});

test('native renderer targets the Sparrow wing with cancellable reduced-motion-aware reactions', () => {
  const source = fs.readFileSync(path.join(root, 'scene-renderer.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'scene-layers.css'), 'utf8');
  assert.match(source, /target\.querySelector\('\.cs-wing'\)/, 'reaction animation targets the actual Sparrow wing geometry');
  assert.match(source, /reactions\.get\(target\).*?\.cancel\(\)/s, 'a new reaction cancels an in-flight reaction');
  assert.match(source, /prefers-reduced-motion:reduce/, 'reaction respects reduced motion');
  assert.match(css, /\.cs-wing\{animation:none!important/, 'ambient wing animation is disabled for reduced-motion users');
});
