const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("safe env template uses the exact PShareHub API model identifiers", () => {
  const example = fs.readFileSync(path.join(__dirname, "../.env.example"), "utf8");
  const line = example.split(/\r?\n/).find((entry) => entry.startsWith("PSHAREHUB_MODEL_IDS="));
  assert.ok(line, "PSHAREHUB_MODEL_IDS is required");
  assert.deepEqual(line.slice(line.indexOf("=") + 1).split(","), [
    "deepseek-ai/DeepSeek-V4.1-Flash",
    "gemma-26b-a4b-it",
    "glm-5.3-flash",
    "nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4",
  ]);
  assert.doesNotMatch(line, /(?:^|,)(?:nast|tdug)\//);
});

function responseCapture() {
  return {
    headers: {}, statusCode: 200, body: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request(sceneId = "hsk1.e01.arrival-greeting") {
  return {
    method: "POST", headers: { host: "hsk.motngum.cafe", origin: "https://hsk.motngum.cafe", "content-length": "90" },
    socket: { remoteAddress: "ai-test" },
    body: { sceneId, messages: [{ role: "user", content: "这是什么？" }] },
  };
}

test("AI tutor access, provider rotation and configuration", async (t) => {
  const { default: handler } = await import("../api/ai/tutor.js");
  const oldEnv = { ...process.env };
  const oldFetch = global.fetch;
  const configured = ["PSHAREHUB_API_KEYS", "PSHAREHUB_API_KEY", "PSHAREHUB_API_BASE_URL", "PSHAREHUB_MODEL_IDS", "PSHAREHUB_REQUEST_TIMEOUT_MS", "CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_EMAIL_API_TOKEN", "CLOUDFLARE_ALERT_FROM"];
  try {
    for (const key of configured) delete process.env[key];
    await t.test("rejects non-practice checkpoints without calling a provider", async () => {
      let called = false; global.fetch = async () => { called = true; throw Error("unexpected fetch"); };
      const res = responseCapture(); await handler(request("hsk1.e01.exam-greeting"), res);
      assert.equal(res.statusCode, 403); assert.equal(called, false);
    });
    await t.test("requires a same-origin HTTPS request (or local HTTP during development)", async () => {
      global.fetch = async () => { throw Error("unexpected fetch"); };
      const missingOrigin = request(); delete missingOrigin.headers.origin;
      const missingRes = responseCapture(); await handler(missingOrigin, missingRes);
      assert.equal(missingRes.statusCode, 403);
      const crossOrigin = request(); crossOrigin.headers.origin = "https://attacker.example";
      const crossRes = responseCapture(); await handler(crossOrigin, crossRes);
      assert.equal(crossRes.statusCode, 403);
      const insecureOrigin = request(); insecureOrigin.headers.origin = "http://hsk.motngum.cafe";
      const insecureRes = responseCapture(); await handler(insecureOrigin, insecureRes);
      assert.equal(insecureRes.statusCode, 403);
    });
    await t.test("returns a safe unavailable state when no API key is entered", async () => {
      let called = false; global.fetch = async () => { called = true; throw Error("unexpected fetch"); };
      const res = responseCapture(); await handler(request(), res);
      assert.equal(res.statusCode, 503); assert.equal(res.body.error, "AI_NOT_CONFIGURED"); assert.equal(called, false);
    });
    await t.test("rotates key/model pairs until one returns a useful answer", async () => {
      process.env.PSHAREHUB_API_KEYS = "key-a,key-b";
      process.env.PSHAREHUB_MODEL_IDS = "model-a,model-b";
      const calls = [];
      global.fetch = async (url, options) => {
        const body = JSON.parse(options.body); calls.push({ model: body.model, key: options.headers.Authorization });
        if (body.model === "model-b" && options.headers.Authorization === "Bearer key-b") {
          return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "这个是一本书。" } }] }) };
        }
        return { ok: false, status: 500, json: async () => ({ error: { message: "private upstream detail" } }) };
      };
      const res = responseCapture(); await handler(request(), res);
      assert.equal(res.statusCode, 200); assert.equal(res.body.reply, "这个是一本书。");
      assert.deepEqual(calls.map((x) => `${x.model}/${x.key}`), ["model-a/Bearer key-a", "model-b/Bearer key-b"]);
    });
    await t.test("gives chat completions enough time for model inference", async () => {
      process.env.PSHAREHUB_API_KEY = "key-a"; process.env.PSHAREHUB_MODEL_IDS = "model-a";
      const oldSetTimeout = global.setTimeout, oldClearTimeout = global.clearTimeout;
      const delays = [];
      try {
        global.setTimeout = (_callback, delay) => { delays.push(delay); return 0; };
        global.clearTimeout = () => {};
        global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "你好 là xin chào." } }] }) });
        const res = responseCapture(); await handler(request(), res);
        assert.equal(res.statusCode, 200); assert.equal(res.body.reply, "你好 là xin chào.");
        assert.equal(delays[0], 7000);
      } finally {
        global.setTimeout = oldSetTimeout; global.clearTimeout = oldClearTimeout;
      }
    });
    await t.test("continues through every configured key/model pair when requests time out", async () => {
      process.env.PSHAREHUB_API_KEYS = "key-a,key-b,key-c,key-d";
      process.env.PSHAREHUB_MODEL_IDS = "model-a,model-b,model-c,model-d";
      const oldSetTimeout = global.setTimeout;
      let calls = 0;
      try {
        // Make each AbortController deadline fire immediately, without waiting in the test.
        global.setTimeout = (callback) => { callback(); return 0; };
        global.fetch = async (_url, options) => {
          calls += 1;
          assert.equal(options.signal.aborted, true);
          throw new DOMException("The operation was aborted", "AbortError");
        };
        const res = responseCapture(); await handler(request(), res);
        assert.equal(res.statusCode, 503);
        assert.equal(calls, 16);
        assert.equal(res.body.error, "AI_TEMPORARILY_UNAVAILABLE");
      } finally {
        global.setTimeout = oldSetTimeout;
      }
    });
    await t.test("emails a generic Cloudflare alert after every provider attempt fails", async () => {
      process.env.PSHAREHUB_API_KEYS = "key-a"; process.env.PSHAREHUB_MODEL_IDS = "model-a";
      process.env.CLOUDFLARE_ACCOUNT_ID = "account-test"; process.env.CLOUDFLARE_EMAIL_API_TOKEN = "mail-secret"; process.env.CLOUDFLARE_ALERT_FROM = "chimse-alert@motngum.cafe";
      let alert = null;
      global.fetch = async (url, options) => {
        if (url.includes("api.cloudflare.com")) { alert = JSON.parse(options.body); return { ok: true, status: 200, json: async () => ({ success: true }) }; }
        return { ok: false, status: 502, json: async () => ({ error: "upstream detail must not be exposed" }) };
      };
      const res = responseCapture(); await handler(request(), res);
      assert.equal(res.statusCode, 503); assert.equal(alert.to, "admin@motngum.cafe");
      assert.match(alert.text, /1 lượt thử/); assert.doesNotMatch(alert.text, /upstream detail|key-a|mail-secret/);
    });
  } finally {
    global.fetch = oldFetch;
    for (const key of Object.keys(process.env)) if (!(key in oldEnv)) delete process.env[key];
    for (const key of Object.keys(oldEnv)) process.env[key] = oldEnv[key];
  }
});
