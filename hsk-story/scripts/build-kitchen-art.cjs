/* Generate the responsive day-two kitchen from the current production-native art source. */
const fs = require('node:fs');
const path = require('node:path');
const art = require('../scene-flat-art.js');

const root = path.resolve(__dirname, '..', 'art');
const variants = [
  ['day2-kitchen.svg', false, false, false, false],
  ['day2-kitchen-portrait.svg', true, false, false, false],
  ['day2-kitchen-tablet.svg', false, false, false, true],
  ['day2-kitchen-wide.svg', false, false, true, false],
  ['day2-kitchen-compact.svg', false, true, false, false]
];

let stale = false;
for (const [file, mobile, compact, wide, tablet] of variants) {
  const destination = path.join(root, 'flat', 'backgrounds', file);
  const generated = art.background('day2-kitchen', mobile, compact, wide, tablet);
  if (process.argv.includes('--check')) {
    if (!fs.existsSync(destination) || fs.readFileSync(destination, 'utf8').trim() !== generated) {
      console.error(`Stale kitchen art: art/flat/backgrounds/${file}`);
      stale = true;
    }
  } else {
    fs.writeFileSync(destination, `${generated}\n`);
  }
}
if (stale) process.exitCode = 1;
