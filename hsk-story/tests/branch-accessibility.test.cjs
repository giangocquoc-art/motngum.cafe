const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("keyboard focus remains visible on the Hỏi Sẻ textarea", () => {
  const css = fs.readFileSync(path.join(__dirname, "../duong-re/style.css"), "utf8");
  const rule = css.match(/([^{}]+):focus-visible\s*\{([^{}]+)\}/g) || [];
  const focusRule = rule.find((selector) => selector.includes("textarea:focus-visible"));
  assert.ok(focusRule, "the tutor textarea must have a visible keyboard focus rule");
  assert.match(focusRule, /outline:\s*3px solid/);
});
