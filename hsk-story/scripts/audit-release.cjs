'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const REQUIRED = [
  'index.html', 'app.js', 'content-manifest.js', 'curriculum-data.js',
  'story-graph.js', 'story-runtime.js', 'scene-world.js', 'skill-sampler.js',
  'game-core.js', 'learning-kit.js', 'story-director.js', 'story-beats.js',
  'active-encounter.js', 'save-io.js', 'story-threads.js', 'scene-flat-art.js',
  'scene-manifest.js', 'scene-renderer.js', 'progress-core.js', 'account.js',
  'account.css', 'auth-sdk.js', 'branch-account.js', 'style.css', 'scene-layers.css',
  'readability.css', 'fonts.css', 'brand.css', 'theme.css',
  'duong-re/index.html', 'duong-re/branch-data.js', 'duong-re/branch-engine.js',
  'duong-re/branch-learning.js', 'duong-re/branch-scenes.js', 'duong-re/branch-ui.js',
  'duong-re/style.css', 'art/brand/flat-favicon.svg', 'art/brand/flat-sparrow.svg',
  // Runtime-only dependencies loaded by code/manifests instead of HTML or CSS references.
  'api/branch-progress.js', 'art/flat/characters/classmate-sage-v1.webp',
  'api/account.js', 'api/progress.js', 'api/auth-handler.js', 'api/ai/tutor.js',
  'nhap-mon.html', 'intro.css', 'intro-data.js', 'intro-core.js', 'intro.js',
  'ren-luyen.html', 'review.css', 'review-data.js', 'review-core.js', 'review.js',
  'art/backgrounds/kitchen/day2-kitchen-desktop-v1.webp',
  'art/backgrounds/kitchen/day2-kitchen-mobile-v1.webp',
  'art/backgrounds/kitchen/day2-kitchen-tablet-v1.webp',
  'art/backgrounds/kitchen/day2-kitchen-wide-v1.webp',
  'art/backgrounds/kitchen/day2-kitchen-compact-v1.webp',
];
const PRIVATE_INVENTORIES = ['hsk30-syllabus-inventory.json', 'candidate-source-index.json'];
const FUTURE_FILES = ['future-acts.js', 'future-branch-runtime.js', 'future-branch-decisions.json', 'learning-blueprint.js'];
function filesUnder(root) {
  return execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'buffer' }).toString().split('\0').filter(Boolean);
}
function read(root, name) { return fs.readFileSync(path.join(root, name), 'utf8'); }
function audit(root = path.resolve(__dirname, '../..'), trackedOverride, ignoreOverride) {
  const issues = [];
  const tracked = new Set(trackedOverride || filesUnder(root));
  const ignore = (ignoreOverride ?? read(root, 'hsk-story/.vercelignore')).replace(/\r/g, '');
  const rules = ignore.split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
  const globMatches = (pattern, value) => {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
    return new RegExp(`^${escaped}$`).test(value);
  };
  const ignores = (name) => {
    const parts = name.split('/');
    const prefixes = parts.map((_, index) => parts.slice(0, index + 1).join('/'));
    let excluded = false;
    for (const prefix of prefixes) {
      for (const rawRule of rules) {
        const negated = rawRule.startsWith('!');
        const pattern = rawRule.replace(/^!/, '').replace(/\/$/, '');
        if (globMatches(pattern, prefix)) excluded = !negated;
      }
    }
    return excluded;
  };
  for (const item of REQUIRED) {
    const full = path.join(root, 'hsk-story', item);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) issues.push(`required deployed file missing: hsk-story/${item}`);
    if (!tracked.has(`hsk-story/${item}`)) issues.push(`required deployed asset is not Git tracked: hsk-story/${item}`);
    if (ignores(item)) issues.push(`required deployed file excluded by .vercelignore: hsk-story/${item}`);
  }
  if (!/^\.env\*$/m.test(ignore) || !/^\*\*\/\.env\*$/m.test(ignore)) issues.push('.vercelignore must exclude root and nested .env* files');
  for (const item of [...PRIVATE_INVENTORIES, ...FUTURE_FILES]) {
    if (!ignores(item)) issues.push(`private inventory or unapproved future source is not excluded by .vercelignore: ${item}`);
  }
  for (const item of PRIVATE_INVENTORIES) {
    if (fs.existsSync(path.join(root, 'hsk-story', item)) && !ignores(item)) issues.push(`source inventory could enter deployment package: ${item}`);
  }
  const pages = ['index.html', 'duong-re/index.html', 'nhap-mon.html', 'ren-luyen.html'];
  for (const page of pages) {
    const html = read(root, `hsk-story/${page}`);
    const base = path.posix.dirname(page) === '.' ? '' : `${path.posix.dirname(page)}/`;
    const refs = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/gi)].map((m) => m[1]);
    for (const ref of refs) {
      if (/^(?:[a-z]+:|\/\/|#|data:|%)/i.test(ref)) continue;
      if (ref.endsWith('/')) continue;
      const cleanRef = ref.split(/[?#]/, 1)[0];
      const rel = path.posix.normalize(cleanRef.startsWith('/') ? cleanRef.slice(1) : path.posix.join(base, cleanRef.replace(/^\.\//, '')));
      if (rel.startsWith('../') || !fs.existsSync(path.join(root, 'hsk-story', rel))) issues.push(`local HTML asset missing: hsk-story/${rel} (referenced by ${page})`);
      else if (!tracked.has(`hsk-story/${rel}`)) issues.push(`local HTML asset is not Git tracked: hsk-story/${rel}`);
      else if (ignores(rel)) issues.push(`local HTML asset excluded by .vercelignore: hsk-story/${rel} (referenced by ${page})`);
    }
  }
  const cssFiles = new Set();
  for (const page of pages) {
    const html = read(root, `hsk-story/${page}`);
    for (const [, ref] of html.matchAll(/href=["']([^"']+\.css(?:\?[^"']*)?)["']/gi)) {
      const rel = ref.startsWith('/') ? ref.slice(1) : path.posix.join(path.posix.dirname(page), ref.split('?')[0]);
      if (fs.existsSync(path.join(root, 'hsk-story', rel))) cssFiles.add(rel);
    }
  }
  // The scene renderer loads these files from scene-manifest.js at runtime,
  // so they are not necessarily visible to the HTML/CSS reference scan above.
  try {
    const sceneBox = { module: { exports: {} } };
    const vm = require('node:vm');
    vm.runInNewContext(read(root, 'hsk-story/scene-manifest.js'), sceneBox, { filename: 'scene-manifest.js' });
    const sceneFiles = new Set();
    const addSceneFile = (value) => {
      if (typeof value === 'string' && /(?:^|\/)(?:art\/)?(?:flat|backgrounds|layers|characters)\/[^?#]+\.(?:svg|webp|png|jpe?g|avif|woff2|mp3|ogg|wav)$/i.test(value)) sceneFiles.add(value.replace(/^\//, ''));
    };
    const visitScene = (value, key = '', inBackgroundMap = false) => {
      if (typeof value === 'string') {
        if (inBackgroundMap || /^(?:asset|.*Asset)$/i.test(key)) addSceneFile(value);
      } else if (Array.isArray(value)) value.forEach((entry) => visitScene(entry, key, inBackgroundMap));
      else if (value && typeof value === 'object') {
        if (key === 'frameAssets') Object.values(value).forEach(addSceneFile);
        else Object.entries(value).forEach(([childKey, child]) => {
          if (childKey === 'metadata') return; // archivedRaster is authoring history, not a runtime URL.
          visitScene(child, childKey, inBackgroundMap || childKey === 'backgrounds');
        });
      }
    };
    visitScene(sceneBox.module.exports);
    for (const asset of sceneFiles) {
      const rel = asset.startsWith('art/') ? asset : `art/${asset}`;
      if (!fs.existsSync(path.join(root, 'hsk-story', rel))) issues.push(`scene manifest asset missing: hsk-story/${rel}`);
      else if (!tracked.has(`hsk-story/${rel}`)) issues.push(`scene manifest asset is not Git tracked: hsk-story/${rel}`);
      else if (ignores(rel)) issues.push(`scene manifest asset excluded by .vercelignore: hsk-story/${rel}`);
    }
  } catch (error) { issues.push(`scene manifest asset check failed: ${error.message}`); }
  for (const css of cssFiles) {
    const source = read(root, `hsk-story/${css}`);
    for (const [, raw] of source.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
      const ref = raw.trim();
      if (/^(?:[a-z]+:|\/\/|#|data:|%)/i.test(ref)) continue;
      const rel = path.posix.normalize(ref.startsWith('/') ? ref.slice(1) : path.posix.join(path.posix.dirname(css), ref.split('?')[0]));
      if (!fs.existsSync(path.join(root, 'hsk-story', rel))) issues.push(`local CSS asset missing: hsk-story/${rel} (referenced by ${css})`);
      else if (!tracked.has(`hsk-story/${rel}`)) issues.push(`local CSS asset is not Git tracked: hsk-story/${rel}`);
      else if (ignores(rel)) issues.push(`local CSS asset excluded by .vercelignore: hsk-story/${rel} (referenced by ${css})`);
    }
  }
  const manifestBox = { module: { exports: {} } };
  const vm = require('node:vm');
  let curriculumData = null;
  let roadmap = null;
  try {
    vm.runInNewContext(read(root, 'hsk-story/content-manifest.js'), manifestBox, { filename: 'content-manifest.js' });
    const curriculumBox = { module: { exports: {} } };
    vm.runInNewContext(read(root, 'hsk-story/curriculum-data.js'), curriculumBox, { filename: 'curriculum-data.js' });
    curriculumData = curriculumBox.module.exports;
    const errors = manifestBox.module.exports.validate(curriculumData);
    if (errors.length) issues.push(...Array.from(errors, (e) => `content manifest: ${e}`));
  } catch (error) { issues.push(`content manifest check failed: ${error.message}`); }
  try {
    const blueprintPath = path.join(root, 'hsk-story/learning-blueprint.js');
    const futureActsPath = path.join(root, 'hsk-story/future-acts.js');
    if (curriculumData && fs.existsSync(blueprintPath) && fs.existsSync(futureActsPath)) {
      const blueprint = require(blueprintPath);
      const futureActs = require(futureActsPath);
      const branchLearning = require(path.join(root, 'hsk-story/duong-re/branch-learning.js'));
      roadmap = blueprint.report(curriculumData, futureActs, branchLearning);
    }
  } catch (error) { issues.push(`roadmap state check failed: ${error.message}`); }
  const candidateObjectiveIds = [...new Set((curriculumData?.scenes || []).flatMap((scene) => Array.isArray(scene.objectiveIds) ? scene.objectiveIds : []))];
  const roadmapLevels = roadmap?.objectivesByLevel || [];
  const playableLevelIds = roadmapLevels.filter((level) => level.status === 'pilot-playable').map((level) => level.level);
  const lockedLevels = roadmapLevels.filter((level) => level.status !== 'pilot-playable').map((level) => level.level);
  return {
    schemaVersion: 1,
    release: {
      currentPlayableLevels: playableLevelIds.length,
      playableLevelIds,
      candidateObjectives: candidateObjectiveIds.length,
      reviewedObjectives: roadmap?.educatorReviewedObjectives ?? null,
      lockedLevels,
      releaseStatus: 'partial-pilot',
    },
    gates: {
      packageInputs: { status: issues.length ? 'fail' : 'pass', issues },
      exactShaCi: { status: 'pending' }, previewDeployment: { status: 'pending' }, previewHttpChecks: { status: 'pending' },
      previewRuntimeErrors: { status: 'pending' }, legacySaveBrowserCoverage: { status: 'pending' },
      mobileVisualAndAudioReview: { status: 'pending' }, qualifiedMandarinAndOfficialSyllabusReview: { status: 'pending' },
    },
    overall: issues.length ? 'fail' : 'local-package-ready-external-gates-pending',
  };
}
if (require.main === module) {
  const report = audit();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (process.argv.includes('--check') && report.gates.packageInputs.status !== 'pass') process.exitCode = 1;
}
module.exports = { audit, REQUIRED };
