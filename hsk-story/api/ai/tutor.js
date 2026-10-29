const PRACTICE_SCENES = new Set([
  "hsk1.e01.arrival-greeting",
  "hsk1.e01.school-introduction",
  "hsk1.e01.xiaoyu-friendship",
  "hsk1.e01.class-counting",
  "hsk1.e01.liu-noodle-order",
  "hsk1.e01.liu-payment",
  "hsk1.e01.walk-home",
]);

const MAX_MESSAGE_CHARS = 400;
const MAX_HISTORY = 6;
const MAX_RESPONSE_CHARS = 1400;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;
const MAX_PROVIDER_BUDGET_MS = 54_000;
const MIN_ATTEMPT_TIMEOUT_MS = 3_000;
const MAX_ATTEMPT_TIMEOUT_MS = 8_000;
const rateWindows = new Map();
let lastFailureAlertAt = 0;

const config = { maxDuration: 60 };

function reply(res, status, body) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.status(status).json(body);
}

function cleanText(value, max = MAX_MESSAGE_CHARS) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readKeys(env) {
  const list = [env.PSHAREHUB_API_KEYS, env.PSHAREHUB_API_KEY].filter(Boolean).join("\n");
  return [...new Set(list.split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean))].slice(0, 4);
}

function readConfiguredModels(env) {
  return [...new Set((env.PSHAREHUB_MODEL_IDS || "").split(/[\n,;]+/).map((x) => x.trim()).filter(Boolean))].slice(0, 4);
}

function sameOrigin(req) {
  const origin = req.headers?.origin;
  const host = String(req.headers?.host || "").toLowerCase();
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
    return parsed.origin === origin && parsed.host.toLowerCase() === host && (parsed.protocol === "https:" || (localHost && parsed.protocol === "http:"));
  } catch {
    return false;
  }
}

function isRateLimited(req) {
  const raw = req.headers?.["x-forwarded-for"] || req.socket?.remoteAddress || "unknown";
  const ip = String(raw).split(",")[0].trim().slice(0, 80);
  const now = Date.now();
  const prior = rateWindows.get(ip);
  if (!prior || now - prior.start >= RATE_WINDOW_MS) {
    rateWindows.set(ip, { start: now, count: 1 });
  } else if (prior.count >= RATE_LIMIT) {
    return true;
  } else {
    prior.count += 1;
  }
  if (rateWindows.size > 1000) {
    for (const [key, value] of rateWindows) if (now - value.start >= RATE_WINDOW_MS) rateWindows.delete(key);
  }
  return false;
}

async function fetchJson(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    let data = null;
    try { data = await response.json(); } catch { /* malformed upstream response */ }
    return { response, data };
  } finally {
    clearTimeout(timer);
  }
}

function upstreamContent(data) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim().slice(0, MAX_RESPONSE_CHARS);
  if (Array.isArray(content)) return content.map((part) => typeof part?.text === "string" ? part.text : "").join("\n").trim().slice(0, MAX_RESPONSE_CHARS);
  return "";
}

async function discoverModels(baseUrl, key, timeoutMs) {
  const { response, data } = await fetchJson(`${baseUrl}/models`, {
    method: "GET",
    headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
  }, timeoutMs);
  if (!response.ok) return { models: [], status: response.status };
  const candidates = Array.isArray(data?.data) ? data.data : Array.isArray(data?.models) ? data.models : [];
  const models = [...new Set(candidates.map((item) => typeof item?.id === "string" ? item.id.trim() : "").filter(Boolean))];
  return { models, status: response.status };
}

function sceneSystemPrompt(sceneId, compact = false) {
  const style = compact
    ? "Hãy trả lời bằng tiếng Việt thật gọn (tối đa 2 câu ngắn, khoảng 120 ký tự) để đọc được trên màn hình điện thoại đang bật bàn phím."
    : "Hãy trả lời bằng tiếng Việt gần gũi, ngắn (tối đa 4 câu), giải thích từ vựng hoặc cấu trúc tiếng Trung trong cảnh hiện tại bằng ví dụ đơn giản.";
  return [
    "Bạn là Sẻ, chú chim xanh nhỏ đồng hành với Minh An trong một câu chuyện học tiếng Trung dành cho trẻ 11 tuổi.",
    style,
    "Không làm bài thay người học, không đưa nguyên câu trả lời để vượt qua một tình huống. Nếu được hỏi đáp án, hãy động viên và gợi ý cách nghĩ mà không viết câu cần nộp.",
    "Không bịa chi tiết truyện ngoài cảnh đã biết. Không yêu cầu tên thật, email, trường học, địa chỉ hoặc thông tin riêng tư.",
    `Mã cảnh luyện tập hiện tại: ${sceneId}.`,
  ].join(" ");
}

async function sendFailureAlert(env, eventId, attemptCount) {
  const accountId = env.CLOUDFLARE_ACCOUNT_ID;
  const token = env.CLOUDFLARE_EMAIL_API_TOKEN;
  const from = env.CLOUDFLARE_ALERT_FROM;
  if (!accountId || !token || !from || Date.now() - lastFailureAlertAt < 15 * 60_000) return false;
  lastFailureAlertAt = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const occurredAt = new Date().toISOString();
      const text = `Chim Sẻ không gọi được AI sau ${attemptCount} lượt thử.\nMã sự kiện: ${eventId}\nThời gian: ${occurredAt}\nKhông có nội dung câu hỏi hoặc API key nào được gửi trong cảnh báo.`;
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/email/sending/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: "admin@motngum.cafe", from, subject: "Chim Sẻ: tất cả AI provider đều lỗi", text }),
        signal: controller.signal,
      });
      const result = await response.json().catch(() => null);
      return response.ok && result?.success === true;
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return false;
  }
}

async function handler(req, res) {
  if (req.method !== "POST") return reply(res, 405, { error: "METHOD_NOT_ALLOWED" });
  if (!sameOrigin(req)) return reply(res, 403, { error: "ORIGIN_NOT_ALLOWED" });
  if (Number(req.headers?.["content-length"] || 0) > 6000) return reply(res, 413, { error: "REQUEST_TOO_LARGE" });
  if (isRateLimited(req)) return reply(res, 429, { error: "RATE_LIMITED", message: "Sẻ xin nghỉ một chút. Mình thử lại sau nhé." });

  let body = req.body && typeof req.body === "object" ? req.body : {};
  if (typeof req.body === "string") {
    try { body = JSON.parse(req.body); } catch { return reply(res, 400, { error: "INVALID_JSON" }); }
  }
  const sceneId = cleanText(body.sceneId, 80);
  const compact = body.compact === true;
  if (!PRACTICE_SCENES.has(sceneId)) return reply(res, 403, { error: "TUTOR_UNAVAILABLE", message: "Sẻ chỉ giúp giải thích trong lúc luyện tập." });
  const messages = Array.isArray(body.messages) ? body.messages.slice(-MAX_HISTORY) : [];
  if (!messages.length || messages.length > MAX_HISTORY) return reply(res, 400, { error: "INVALID_MESSAGES" });
  const safeMessages = [];
  for (const item of messages) {
    if (!item || !["user", "assistant"].includes(item.role)) return reply(res, 400, { error: "INVALID_MESSAGES" });
    const content = cleanText(item.content, MAX_MESSAGE_CHARS);
    if (!content) return reply(res, 400, { error: "EMPTY_MESSAGE" });
    safeMessages.push({ role: item.role, content });
  }
  if (safeMessages.at(-1)?.role !== "user") return reply(res, 400, { error: "INVALID_MESSAGES" });
  if (JSON.stringify(safeMessages).length > 5000) return reply(res, 413, { error: "REQUEST_TOO_LARGE" });

  const keys = readKeys(process.env);
  if (!keys.length) return reply(res, 503, { error: "AI_NOT_CONFIGURED", message: "Sẻ chưa được nối với dịch vụ AI. Bạn vẫn có thể tiếp tục câu chuyện." });
  const baseUrl = (process.env.PSHAREHUB_API_BASE_URL || "https://api.psharehub.com/v1").replace(/\/+$/, "");
  let models = readConfiguredModels(process.env);
  const timeoutMs = Math.min(MAX_ATTEMPT_TIMEOUT_MS, Math.max(MIN_ATTEMPT_TIMEOUT_MS, Number(process.env.PSHAREHUB_REQUEST_TIMEOUT_MS) || 7000));
  const requestId = crypto.randomUUID();
  const attempts = [];
  const unusableKeys = new Set();
  const providerStartedAt = Date.now();
  const remainingProviderBudget = () => Math.max(0, MAX_PROVIDER_BUDGET_MS - (Date.now() - providerStartedAt));

  if (!models.length) {
    for (let keyIndex = 0; keyIndex < keys.length && !models.length; keyIndex += 1) {
      const remaining = remainingProviderBudget();
      if (remaining < MIN_ATTEMPT_TIMEOUT_MS) break;
      try {
        const catalog = await discoverModels(baseUrl, keys[keyIndex], Math.min(timeoutMs, remaining));
        if ((catalog.status === 401 || catalog.status === 403 || catalog.status === 429) || !catalog.models.length) {
          attempts.push({ keyIndex: keyIndex + 1, stage: "models", status: catalog.status || 502 });
          if (catalog.status === 401 || catalog.status === 403 || catalog.status === 429) unusableKeys.add(keyIndex);
          continue;
        }
        models = catalog.models.slice(0, 4);
      } catch {
        attempts.push({ keyIndex: keyIndex + 1, stage: "models", status: 0 });
      }
    }
  }
  if (!models.length) {
    const alertSent = await sendFailureAlert(process.env, requestId, attempts.length);
    console.error("[chimse-ai] model discovery exhausted", JSON.stringify({ requestId, attemptCount: attempts.length, alertSent }));
    return reply(res, 503, { error: "AI_TEMPORARILY_UNAVAILABLE", message: "Sẻ chưa gọi được bạn bè ở đám mây. Mình cứ tiếp tục câu chuyện nhé.", requestId });
  }

  // Interleave models and keys so a bounded request budget tests every model before
  // spending all of its time on keys for a single model.
  for (let offset = 0; offset < keys.length; offset += 1) {
    for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
      const remaining = remainingProviderBudget();
      if (remaining < MIN_ATTEMPT_TIMEOUT_MS) break;
      const keyIndex = (modelIndex + offset) % keys.length;
      if (unusableKeys.has(keyIndex)) continue;
      const model = models[modelIndex];
      try {
        const { response, data } = await fetchJson(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { Authorization: `Bearer ${keys[keyIndex]}`, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: sceneSystemPrompt(sceneId, compact) }, ...safeMessages],
            temperature: 0.3,
            max_tokens: compact ? 80 : 220,
            stream: false,
          }),
        }, Math.min(timeoutMs, remaining));
        const content = response.ok ? upstreamContent(data) : "";
        if (response.ok && content) return reply(res, 200, { reply: content, model, requestId });
        attempts.push({ keyIndex: keyIndex + 1, model, status: response.status || 502 });
        if (response.status === 401 || response.status === 403 || response.status === 429) unusableKeys.add(keyIndex);
      } catch {
        attempts.push({ keyIndex: keyIndex + 1, model, status: 0 });
      }
    }
  }

  const alertSent = await sendFailureAlert(process.env, requestId, attempts.length);
  console.error("[chimse-ai] provider attempts exhausted", JSON.stringify({ requestId, attemptCount: attempts.length, alertSent, statuses: attempts.map((item) => item.status) }));
  return reply(res, 503, { error: "AI_TEMPORARILY_UNAVAILABLE", message: "Sẻ chưa gọi được bạn bè ở đám mây. Mình cứ tiếp tục câu chuyện nhé.", requestId });
}

module.exports = handler;
module.exports.config = config;
