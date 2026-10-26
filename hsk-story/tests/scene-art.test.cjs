const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const art = path.join(root, 'art');
const manifest = JSON.parse(fs.readFileSync(path.join(art, 'manifest.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'scene-layers.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const introHtml = fs.readFileSync(path.join(root, 'nhap-mon.html'), 'utf8');
const introCss = fs.readFileSync(path.join(root, 'intro.css'), 'utf8');
const reviewHtml = fs.readFileSync(path.join(root, 'ren-luyen.html'), 'utf8');
const reviewCss = fs.readFileSync(path.join(root, 'review.css'), 'utf8');
const context = {};
vm.runInNewContext(source, context);
const layers = context.HSKSceneLayers;
const graphContext = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'story-graph.js'), 'utf8'), graphContext);
const graph = graphContext.HSKStoryGraph;
const allGraphIds = [...graph.sceneIds.slice(0, 7), 'lost-notebook', ...graph.sceneIds.slice(7)];
function webpMetadata(relativePath) {
  const bytes = fs.readFileSync(path.join(art, relativePath));
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `${relativePath} RIFF signature`);
  assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', `${relativePath} WebP signature`);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return { width: 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16), height: 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16), alpha: (bytes[20] & 0x10) !== 0 };
  if (chunk === 'VP8 ') return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff, alpha: false };
  if (chunk === 'VP8L') { const bits = bytes.readUInt32LE(21); return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >>> 14) & 0x3fff), alpha: (bits & 0x10000000) !== 0 }; }
  assert.fail(`${relativePath} uses unsupported WebP chunk ${chunk}`);
}

test('active character and noodle-shop assets exist with matching dimensions and alpha metadata', () => {
  for (const [assetPath, metadata] of Object.entries(manifest.assetCatalog)) {
    const actual = webpMetadata(assetPath);
    assert.deepEqual(actual, { ...metadata.dimensions, alpha: metadata.alpha }, `${assetPath} metadata`);
    assert.ok(metadata.role && metadata.prompt && metadata.master, `${assetPath} role, prompt and PNG master`);
    assert.ok(fs.existsSync(path.join(art, metadata.master)), `${assetPath} PNG master`);
    assert.equal(metadata.format, 'WebP', `${assetPath} served format`);
    assert.equal(metadata.masterFormat, 'PNG', `${assetPath} source format`);
    assert.equal(fs.statSync(path.join(art, assetPath)).size, metadata.bytes, `${assetPath} optimized byte size`);
  }
  assert.equal(manifest.characters.an.legacyPoses, 'characters/an-expressions.webp');
  assert.equal(manifest.characters.sparrow.legacySprite, 'characters/sparrow.webp');
  assert.equal(manifest.characters.supportingCast.legacySpriteSheet, 'characters/supporting-cast.webp');
  assert.equal(manifest.backgrounds['noodle-shop'].legacyDesktop, 'backgrounds/noodle-shop.webp');
  assert.deepEqual(manifest.characters.an.sheet, { columns: 3, rows: 2, cellOrder: 'row-major' });
  assert.deepEqual(manifest.characters.sparrow.sheet, { columns: 3, rows: 2, cellOrder: 'row-major' });
  assert.deepEqual(manifest.characters.supportingCast.sheet, { columns: 3, rows: 2, cellOrder: 'row-major', unusedCells: [5] });
});

test('all saved story scenes have responsive background assets and ordered art layers', () => {
  assert.deepEqual(Array.from(layers.validate(allGraphIds)), []);
  assert.deepEqual(Object.keys(manifest.scenes), allGraphIds);
  for (const [id, scene] of Object.entries(manifest.scenes)) {
    const runtimeScene = layers.scenes[id];
    const background = manifest.backgrounds[scene.background];
    assert.equal(runtimeScene.background, scene.background, `${id} renderer background`);
    assert.deepEqual(JSON.parse(JSON.stringify(runtimeScene.actors)), scene.actors, `${id} renderer actor positions`);
    assert.deepEqual(JSON.parse(JSON.stringify(runtimeScene.desktop)), scene.desktop, `${id} desktop composition`);
    assert.deepEqual(JSON.parse(JSON.stringify(runtimeScene.mobile)), scene.mobile, `${id} mobile composition`);
    assert.deepEqual(JSON.parse(JSON.stringify(runtimeScene.sparrow)), scene.sparrow, `${id} Sparrow positions`);
    assert.equal(runtimeScene.layers.midground, scene.layers.midground, `${id} midground mapping`);
    assert.equal(runtimeScene.layers.foreground.kind, scene.layers.foreground.kind, `${id} foreground layer kind`);
    assert.equal(runtimeScene.layers.foreground.asset || runtimeScene.layers.foreground.path, scene.layers.foreground.asset || scene.layers.foreground.path, `${id} foreground mapping`);
    assert.ok(background, `${id} background mapping`);
    assert.ok(fs.existsSync(path.join(art, background.desktop)), `${id} desktop fallback`);
    assert.ok(fs.existsSync(path.join(art, background.mobile)), `${id} mobile fallback`);
    assert.equal(scene.layers.background.desktop, background.desktop, `${id} background layer map`);
    assert.equal(scene.layers.background.mobile, background.mobile, `${id} mobile layer map`);
    assert.match(scene.layers.midground, /^layers\/.+\/midground\.webp$/, `${id} midground placeholder`);
    if (scene.layers.foreground.kind === 'image') {
      assert.ok(fs.existsSync(path.join(art, scene.layers.foreground.asset)), `${id} foreground image asset`);
    } else {
      assert.match(scene.layers.foreground.path, /^layers\/.+\/foreground\.webp$/, `${id} foreground placeholder`);
    }
    assert.equal(scene.sparrow.asset, manifest.characters.sparrow.sprite, `${id} Sparrow sprite`);
    assert.equal(scene.layers.sparrow, manifest.characters.sparrow.sprite, `${id} Sparrow layer asset`);
    assert.ok(scene.desktop && scene.mobile, `${id} scene layout by device`);
    assert.ok(scene.actors.length && scene.actors.some(actor => actor.character === 'an'), `${id} An actor`);
    for (const actor of scene.actors) {
      assert.ok(actor.desktop && actor.mobile, `${id}/${actor.character} responsive position`);
      assert.ok(actor.slot && actor.expression, `${id}/${actor.character} slot and expression`);
    }
  }
});

test('renderer emits one Sparrow and the declared art layers/assets per scene', () => {
  assert.match(css, /an-expressions-v3\.webp/);
  assert.match(css, /supporting-cast-v2\.webp/);
  assert.match(css, /sparrow-expressions-v2\.webp/);
  assert.match(css, /background-size:300% 200%/);
  assert.match(css, /\.cast-receptionist\{background-position:50% 100%\}/);
  assert.match(css, /\.sparrow-expression-wave\{background-position:100% 100%\}/);
  assert.deepEqual(Object.entries(manifest.scenes).filter(([, scene]) => scene.layers.foreground.kind === 'image').map(([id]) => id), ['hsk1.e01.liu-noodle-order', 'hsk1.e01.liu-payment']);
  for (const [id, scene] of Object.entries(manifest.scenes)) {
    const markup = layers.render('street', id, {}, {});
    assert.equal((markup.match(/class="scene-sparrow sparrow-expression-[\w-]+"/g) || []).length, 1, `${id} has exactly one Sparrow node`);
    assert.match(markup, /class="scene-background"/);
    assert.match(markup, /class="scene-midground"[^>]*data-asset-placeholder="layers\//);
    assert.match(markup, /class="scene-actors"/);
    assert.match(markup, /data-assets="characters\/an-expressions-v3\.webp,characters\/supporting-cast-v2\.webp"/);
    const foregroundMarkup = markup.match(/<div class="scene-foreground"[^>]*>(.*?)<\/div>/)?.[0] || '';
    const foregroundImages = foregroundMarkup.match(/<img\b/g) || [];
    if (scene.layers.foreground.kind === 'image') {
      assert.equal(foregroundImages.length, 1, `${id} foreground image count`);
      assert.match(foregroundMarkup, new RegExp(`<img src="/art/${scene.layers.foreground.asset}" data-asset="${scene.layers.foreground.asset}" alt="">`));
    } else {
      assert.equal(foregroundImages.length, 0, `${id} has no foreground image`);
      assert.match(foregroundMarkup, /data-asset-placeholder="layers\//);
    }
    assert.match(markup, new RegExp(`class="scene-sparrow sparrow-expression-[\\w-]+" data-asset="${manifest.characters.sparrow.sprite}"`));
    assert.match(markup, new RegExp(`data-background-asset="${manifest.backgrounds[scene.background].desktop}"`));
    assert.match(markup, new RegExp(`data-mobile-background-asset="${manifest.backgrounds[scene.background].mobile}"`));
    assert.match(markup, /@media\(max-width:690px\)/, `${id} device-specific positions`);
    assert.equal((markup.match(/data-asset="characters\/an-expressions-v3\.webp"/g) || []).length, 1, `${id} An sprite`);
  }
});

test('scene registry preserves every canonical ID plus the existing notebook encounter', () => {
  assert.deepEqual(Array.from(layers.sceneIds), allGraphIds);
  assert.equal(layers.scenes['lost-notebook'].id, 'lost-notebook');
  assert.equal(manifest.layers.sparrow.countPerScene, 1);
});

test('Nhập môn and review use the shared artwork instead of placeholder scene figures', () => {
  for (const relativePath of [
    'backgrounds/bedroom-v2.webp',
    'backgrounds/mobile/mobile-bedroom-v2.webp',
    'characters/an-expressions-v3.webp',
    'characters/sparrow-expressions-v2.webp',
    'backgrounds/classroom.webp',
    'backgrounds/mobile/mobile-classroom.webp',
  ]) assert.ok(fs.existsSync(path.join(art, relativePath)), relativePath);
  assert.match(introHtml, /bedroom-v2\.webp/);
  assert.match(introCss, /an-expressions-v3\.webp/);
  assert.match(introCss, /sparrow-expressions-v2\.webp/);
  assert.match(reviewHtml, /review-characters/);
  assert.match(reviewCss, /an-expressions-v3\.webp/);
  assert.match(reviewCss, /sparrow-expressions-v2\.webp/);
  assert.doesNotMatch(reviewHtml, /review-scene-mark/);
});
