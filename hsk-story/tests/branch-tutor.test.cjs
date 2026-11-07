const { test } = require("node:test");
const assert = require("node:assert/strict");
const createTutor = require("../duong-re/branch-tutor.js");

class Element {
  constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.listeners = {}; this.dataset = {}; this.attributes = {}; this.value = ""; this.disabled = false; this.open = false; this._text = ""; this.parentNode = null; this.className = ""; this.clientHeight = 0; this.style = {}; this.classList = { toggle: (name, on) => { const parts = this.className.split(/\s+/).filter(Boolean).filter((x) => x !== name); if (on) parts.push(name); this.className = parts.join(" "); } }; }
  append(...items) { for (const item of items) { item.parentNode = this; this.children.push(item); } }
  appendChild(item) { this.append(item); return item; }
  removeChild(item) { this.children = this.children.filter((child) => child !== item); item.parentNode = null; return item; }
  replaceChildren(...items) { for (const child of this.children) child.parentNode = null; this.children = []; this.append(...items); }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  addEventListener(name, fn) { (this.listeners[name] ||= []).push(fn); }
  emit(name, event = {}) { for (const fn of this.listeners[name] || []) fn({ preventDefault() {}, ...event }); }
  querySelector(selector) {
    const key = selector.match(/^\[data-(.+)\]$/)?.[1].replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const walk = (node) => { for (const child of node.children) { if (key && Object.hasOwn(child.dataset, key)) return child; const found = walk(child); if (found) return found; } return null; };
    return walk(this);
  }
  showModal() { this.open = true; }
  close() { this.open = false; this.emit("close"); }
  focus() {}
  get scrollHeight() { return this.tagName === "P" ? Math.max(20, Math.ceil(this.textContent.length / 30) * 20) : this.children.length; }
  set scrollTop(value) { this._scrollTop = value; }
  get textContent() { return this._text + this.children.map((child) => child.textContent).join(""); }
  set textContent(value) { this._text = String(value); this.replaceChildren(); }
}

function setup(fetch) {
  const panel = new Element("dialog");
  const doc = { createElement: (tag) => new Element(tag), getElementById: (id) => id === "branchTutorPanel" ? panel : null };
  const env = { document: doc, fetch, AbortController, visualViewport: null };
  const tutor = createTutor(env);
  const sceneId = "hsk1.e01.arrival-greeting";
  tutor.sync({ sceneId, available: true });
  assert.equal(tutor.open({ sceneId }), true);
  const messages = panel.querySelector("[data-branch-tutor-messages]");
  messages.clientHeight = 400;
  const input = panel.querySelector("[data-branch-tutor-input]");
  const send = panel.querySelector("[data-branch-tutor-send]");
  const form = panel.children.find((child) => child.tagName === "FORM");
  return { tutor, panel, messages, input, send, form, sceneId };
}

function response(reply, ok = true, status = ok ? 200 : 503, error = "") {
  return { ok, status, json: async () => reply && typeof reply === "object" ? reply : reply === null ? { error } : { reply } };
}
function deferred() { let resolve; const promise = new Promise((yes) => { resolve = yes; }); return { promise, resolve }; }

test("only current, non-checkpoint practice scenes can open or reach the server", async () => {
  let calls = 0;
  const panel = new Element("dialog"), doc = { createElement: (tag) => new Element(tag), getElementById: () => panel };
  const tutor = createTutor({ document: doc, fetch: async () => { calls++; return response("你好"); }, AbortController });
  assert.equal(tutor.open({ sceneId: "hsk1.e01.exam-greeting" }), false);
  assert.equal(tutor.sync({ sceneId: "hsk1.e01.exam-greeting", available: true }), false);
  assert.equal(tutor.open({ sceneId: "hsk1.e01.exam-greeting" }), false);
  assert.equal(calls, 0);
});

test("sends bounded question history and reports assistance only for a valid reply", async () => {
  let payload;
  const context = setup(async (_url, options) => { payload = JSON.parse(options.body); return response("  Từ này nghĩa là xin chào.  "); });
  const helped = [];
  context.tutor.close();
  context.tutor.open({ sceneId: context.sceneId, onHelp: (detail) => helped.push(detail) });
  context.input.value = "x".repeat(500);
  context.form.emit("submit");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(payload.sceneId, context.sceneId);
  assert.equal(payload.messages.length, 1);
  assert.equal(payload.messages[0].content.length, 400);
  assert.equal(payload.messages[0].role, "user");
  assert.deepEqual(helped, [{ sceneId: context.sceneId }]);
  assert.match(context.messages.textContent, /Từ này nghĩa là xin chào/);
});

test("late replies after scene change and close cannot attach or mark help", async () => {
  const waiting = deferred();
  const context = setup(() => waiting.promise);
  let helped = 0;
  context.tutor.close();
  context.tutor.open({ sceneId: context.sceneId, onHelp: () => helped++ });
  context.input.value = "Câu hỏi";
  context.form.emit("submit");
  context.tutor.sync({ sceneId: "hsk1.e01.school-introduction", available: true });
  waiting.resolve(response("câu trả lời cũ"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(helped, 0);
  assert.doesNotMatch(context.messages.textContent, /câu trả lời cũ/);
  assert.equal(context.panel.open, false);
});

test("close aborts the request and reopening permits a clean retry", async () => {
  let signal;
  const requests = [];
  const context = setup((_url, options) => { signal = options.signal; const item = deferred(); requests.push(item); return item.promise; });
  let helped = 0;
  context.tutor.close();
  context.tutor.open({ sceneId: context.sceneId, onHelp: () => helped++ });
  context.input.value = "lần cũ"; context.form.emit("submit");
  context.tutor.close();
  assert.equal(signal.aborted, true);
  context.tutor.open({ sceneId: context.sceneId, onHelp: () => helped++ });
  context.input.value = "lần mới"; context.form.emit("submit");
  requests[1].resolve(response("gợi ý mới"));
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(helped, 1);
  assert.match(context.messages.textContent, /gợi ý mới/);
  assert.doesNotMatch(context.messages.textContent, /lần cũ/);
});

test("server errors are generic and do not trigger assistance callbacks", async () => {
  const context = setup(async () => response({ error: "AI_TEMPORARILY_UNAVAILABLE", message: "private provider key secret" }, false, 503));
  let helped = 0;
  context.tutor.close(); context.tutor.open({ sceneId: context.sceneId, onHelp: () => helped++ });
  context.input.value = "hỏi"; context.form.emit("submit");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(helped, 0);
  assert.doesNotMatch(context.messages.textContent, /private provider key secret/);
  assert.match(context.messages.textContent, /Sẻ chưa gọi được bạn bè/);
});

test("long replies are paginated and empty replies stay retryable without marking help", async () => {
  const long = setup(async () => response("中".repeat(1400)));
  let helped = 0;
  long.messages.clientHeight = 120;
  long.tutor.close(); long.tutor.open({ sceneId: long.sceneId, onHelp: () => helped++ });
  long.input.value = "hỏi"; long.form.emit("submit");
  await new Promise((resolve) => setImmediate(resolve));
  const reply = long.messages.children[0];
  assert.ok(reply);
  assert.ok(reply.children[0].textContent.length >= 60 && reply.children[0].textContent.length <= 100);
  assert.ok(reply.className.includes("branch-tutor-paged"));
  reply.children[1].children[3].emit("click");
  assert.ok(reply.children[0].textContent.length > 0);
  assert.match(reply.children[1].children[2].textContent, /\d+ \/ \d+ · 2 \/ \d+/);
  assert.equal(helped, 1);

  const empty = setup(async () => response("   "));
  let falseHelp = 0;
  empty.tutor.close(); empty.tutor.open({ sceneId: empty.sceneId, onHelp: () => falseHelp++ });
  empty.input.value = "hỏi"; empty.form.emit("submit");
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(falseHelp, 0);
  assert.match(empty.messages.textContent, /chưa nghĩ ra câu trả lời/);
  assert.equal(empty.send.disabled, false);
});
