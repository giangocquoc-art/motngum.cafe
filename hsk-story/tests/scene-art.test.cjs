const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const artRoot = path.join(root, 'art');
const manifest = require('../art/manifest.json');
const sceneBox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'scene-manifest.js'), 'utf8'), sceneBox);
const sceneManifest = sceneBox.HSKSceneManifest;
const flatBox = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'scene-flat-art.js'), 'utf8'), flatBox);
const flat = flatBox.HSKFlatArt;
const catalog = JSON.parse(fs.readFileSync(path.join(artRoot, 'flat/catalog.json'), 'utf8'));

function readArt(relativePath) {
  const absolute = path.join(artRoot, relativePath);
  assert.ok(fs.existsSync(absolute), `Native SVG exists: ${relativePath}`);
  return fs.readFileSync(absolute, 'utf8').trim();
}

function svgSize(svg, label) {
  const match = svg.match(/^<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"[^>]*\bviewBox="([^"]+)"/);
  assert.ok(match, `${label} has explicit SVG width, height and viewBox`);
  const [, width, height, viewBox] = match;
  assert.deepEqual(viewBox.split(/\s+/).map(Number).slice(2), [Number(width), Number(height)], `${label} dimensions match its viewBox`);
}

test('native art catalog covers all responsive scenes and separate authored layers', () => {
  assert.equal(catalog.authoringSource, 'scene-flat-art.js');
  assert.match(catalog.authority, /Production hsk\.motngum\.cafe/);
  assert.deepEqual(Object.keys(catalog.backgrounds).sort(), Object.keys(manifest.backgrounds).sort());

  for (const [backgroundId, variants] of Object.entries(catalog.backgrounds)) {
    assert.deepEqual(Object.keys(variants).sort(), ['compact', 'desktop', 'mobile'], `${backgroundId} has desktop, mobile and compact plates`);
    for (const [variant, file] of Object.entries(variants)) {
      const svg = readArt(file);
      svgSize(svg, `${backgroundId}/${variant}`);
      assert.doesNotMatch(svg, /<text\b|<image\b|data-character=|class="cs-(?:wing|eyes-|bird-feet)/i, `${backgroundId}/${variant} contains no baked learning text or actors`);
      assert.doesNotMatch(svg, /sparrow|bird|xiaoyu|receptionist|classmates/i, `${backgroundId}/${variant} has no duplicate cast/Sẻ layer`);
      assert.equal(svg, flat.background(backgroundId, variant === 'mobile', variant === 'compact'), `${backgroundId}/${variant} matches the authored native output`);
    }
  }

  assert.deepEqual(Object.keys(catalog.props).sort(), ['bowl', 'counter', 'menu', 'steam', 'table-apron', 'table-top']);
  for (const [prop, variants] of Object.entries(catalog.props)) {
    for (const [variant, file] of Object.entries(variants)) {
      const svg = readArt(file);
      svgSize(svg, `${prop}/${variant}`);
      assert.equal(svg, flat.prop(prop, variant === 'mobile', variant === 'compact'), `${prop}/${variant} matches the authoring output`);
    }
  }
});

test('sprite specs retain semantic frame indices while resolving each expression to its own SVG', () => {
  assert.deepEqual(Object.keys(catalog.sprites).sort(), Object.keys(manifest.spriteCharacters).sort());
  for (const [name, spec] of Object.entries(manifest.spriteCharacters)) {
    const compiled = sceneManifest.sprites[name];
    const exported = catalog.sprites[name];
    assert.equal(spec.format, 'svg', `${name} uses native SVG`);
    assert.equal('columns' in spec || 'rows' in spec, false, `${name} has no raster atlas grid`);
    assert.equal(compiled.format, 'svg');
    assert.equal(compiled.frameCount, spec.frameCount, `${name} keeps semantic frame count`);
    assert.deepEqual({ ...compiled.frames }, { ...spec.frames }, `${name} frame aliases/indices are stable`);
    assert.deepEqual({ ...compiled.frameAssets }, { ...spec.frameAssets }, `${name} expression map is compiled`);
    assert.deepEqual({ ...exported.frameAssets }, { ...spec.frameAssets }, `${name} catalog points at each expression SVG`);
    assert.equal(exported.asset, spec.asset, `${name} default SVG matches manifest`);

    for (const [expression, frame] of Object.entries(spec.frames)) {
      assert.ok(Number.isInteger(frame) && frame >= 0 && frame < spec.frameCount, `${name}/${expression} retains valid frame index`);
      const file = spec.frameAssets[expression];
      assert.ok(file && file.startsWith('flat/characters/'), `${name}/${expression} has an independent character asset`);
      const svg = readArt(file);
      svgSize(svg, `${name}/${expression}`);
      assert.doesNotMatch(svg, /<text\b|<image\b/i, `${name}/${expression} contains no embedded dialogue or raster art`);
      const characterName = name === 'anNoodle' ? 'an' : name === 'xiaoyuNoodle' ? 'xiaoyu' : name;
      assert.equal(svg, flat.character(characterName, expression, /Noodle$/.test(name)), `${name}/${expression} matches authored character output`);
    }

    const byFrame = new Map();
    for (const [expression, frame] of Object.entries(spec.frames)) {
      const asset = spec.frameAssets[expression];
      const geometry = readArt(asset);
      if (byFrame.has(frame)) continue;
      byFrame.set(frame, geometry);
    }
    assert.equal(new Set(Object.values(spec.frameAssets)).size, Object.keys(spec.frames).length, `${name} keeps one independently addressable SVG per expression`);
    assert.equal(new Set(byFrame.values()).size, byFrame.size, `${name} gives different semantic frame indices distinct character geometry`);
  }
});

test('background, character and Sparrow art stay separate; each scene has exactly one Sparrow', () => {
  for (const [sceneId, scene] of Object.entries({ ...manifest.scenes, ...manifest.auxiliaryScenes })) {
    const allSceneAssets = [
      ...Object.values(scene.layers.background || {}),
      ...['midground', 'counter', 'tabletop', 'foreground'].flatMap(key => (scene.layers[key] || []).map(layer => layer.asset)),
      ...scene.layers.characters,
      scene.layers.sparrow
    ].filter(Boolean);
    for (const asset of allSceneAssets) assert.ok(asset.startsWith('flat/'), `${sceneId} references only native production art (${asset})`);
    assert.equal(scene.layers.sparrow, manifest.spriteCharacters.sparrow.asset, `${sceneId} keeps Sparrow as a dedicated layer`);
    const sceneSprites = [...scene.actors, ...Object.values(scene.companions || {})];
    for (const actor of sceneSprites) {
      const spec = manifest.spriteCharacters[actor.sprite || actor.character];
      assert.ok(spec, `${sceneId}/${actor.character} resolves to a sprite spec`);
      assert.ok(spec.frameAssets[actor.expression], `${sceneId}/${actor.character}/${actor.expression} has a native expression asset`);
    }
  }

  for (const sceneId of ['hsk1.e01.liu-noodle-order', 'hsk1.e01.liu-payment']) {
    const scene = manifest.scenes[sceneId];
    assert.ok(scene.layers.tabletop?.length, `${sceneId} has the shared tabletop plane`);
    assert.ok(scene.layers.counter?.length, `${sceneId} has a separate counter occlusion layer`);
    assert.ok(scene.layers.foreground.some(layer => layer.asset === 'flat/layers/table-apron.svg'), `${sceneId} masks seated torsos with apron art`);
    const hasBowl = scene.layers.foreground.some(layer => /\/bowl(?:-portrait|-compact)?\.svg$/.test(layer.asset));
    assert.equal(hasBowl, sceneId === 'hsk1.e01.liu-payment', `${sceneId} shows the bowl only after ordering`);
  }
});

test('seated noodle sprites render two hands at most, without inventing food or a tabletop', () => {
  for (const name of ['anNoodle', 'xiaoyuNoodle']) {
    const spec = manifest.spriteCharacters[name];
    for (const expression of Object.keys(spec.frames)) {
      const svg = flat.character(name === 'anNoodle' ? 'an' : 'xiaoyu', expression, true);
      // The two hand silhouettes use these authored palm path anchors; the tabletop/meal live in separate scene layers.
      const hands = (svg.match(/<path d="M(?:-24 82|16 82|5 29)/g) || []).length;
      assert.equal(hands, 2, `${name}/${expression} has exactly two hands`);
      assert.doesNotMatch(svg, /<ellipse[^>]+(?:rx="48"|cy="-12")|cs-steam|noodle/i, `${name}/${expression} has no baked bowl, steam or tabletop prop`);
    }
  }
});
