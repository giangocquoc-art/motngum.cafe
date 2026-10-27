const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const art = path.join(root, 'art');
const manifest = JSON.parse(fs.readFileSync(path.join(art, 'manifest.json'), 'utf8'));
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
  assert.equal(manifest.backgrounds.bedroom.desktop, 'backgrounds/bedroom-v3.webp');
  assert.equal(manifest.backgrounds.bedroom.mobile, 'backgrounds/mobile/mobile-bedroom-v3.webp');
  assert.equal(manifest.backgrounds.classroom.desktop, 'backgrounds/classroom-v2.webp');
  assert.equal(manifest.backgrounds.classroom.mobile, 'backgrounds/mobile/mobile-classroom-v2.webp');
  assert.equal(manifest.backgrounds['arrival-street'].desktop, 'backgrounds/arrival-street-v2.webp');
  assert.equal(manifest.backgrounds['arrival-street'].mobile, 'backgrounds/mobile/mobile-arrival-street-v2.webp');
  assert.equal(manifest.backgrounds['school-gate'].desktop, 'backgrounds/school-gate-v3.webp');
  assert.equal(manifest.backgrounds['school-gate'].mobile, 'backgrounds/mobile/mobile-school-gate-v3.webp');
  assert.deepEqual(manifest.scenes['hsk1.e01.arrival-greeting'].layers.background, {
    desktop: 'backgrounds/arrival-street-v2.webp',
    mobile: 'backgrounds/mobile/mobile-arrival-street-v2.webp'
  });
  assert.deepEqual(manifest.characters.an.sheet, { columns: 3, rows: 2, cellOrder: 'row-major' });
  assert.deepEqual(manifest.characters.sparrow.sheet, { columns: 3, rows: 2, cellOrder: 'row-major' });
  assert.deepEqual(manifest.characters.supportingCast.sheet, { columns: 3, rows: 2, cellOrder: 'row-major', unusedCells: [5] });
});
