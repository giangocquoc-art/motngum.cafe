import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTAL_BASE = (process.env.VIETAPI_PORTAL_BASE || "https://vietapi.tech").replace(/\/$/, "");
const CREDIT_DIVISOR = 600_000;
const MAX_BODY_KEYS = 4;
const MAX_BODY_BYTES = 8 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;
const MAX_RATE_ENTRIES = 10_000;

type PortalUsage = {
  name?: string;
  username?: string;
  display_name?: string;
  status_text?: string;
  token_status_text?: string;
  token_status?: number;
  user_status?: number;
  unlimited_quota?: boolean;
  user_group?: string;
  token_group?: string;
  user_remain_quota?: number;
  user_quota?: number;
  remain_quota?: number;
  user_used_quota?: number;
  token_used_quota?: number;
  group_daily_cap?: number;
  payg_quota?: number;
  user_quota_expire_time?: number;
  token_expired_time?: number;
  masked_key?: string;
  daily_wallet?: {
    active?: boolean;
    exhausted?: boolean;
    quota_remain?: number;
    quota_used?: number;
    quota_total?: number;
    expires_at?: number;
  };
};

type RateBucket = { count: number; resetAt: number };

const rateMap = new Map<string, RateBucket>();

function clean(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function maskKey(value: string) {
  const key = value.trim();
  if (key.length <= 12) return `${key.slice(0, 3)}…`;
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

function isLikelyApiKey(value: string) {
  return /^sk-[A-Za-z0-9_\-]{16,}$/i.test(value);
}

function clientIp(request: Request) {
  // Prefer the provider-populated header when available. Cap the value so a
  // forged header cannot create an unbounded in-memory map key.
  const forwarded =
    request.headers.get("x-vercel-forwarded-for") ||
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  return (forwarded.split(",")[0]?.trim() || "unknown").slice(0, 100);
}

function takeRateLimit(ip: string) {
  const now = Date.now();

  // This is intentionally best-effort for a single Node instance. Pruning is
  // still important on long-lived servers so rotating IPs cannot grow memory
  // without bound; a shared store should be used for multi-instance limits.
  for (const [key, bucket] of rateMap) {
    if (bucket.resetAt <= now) rateMap.delete(key);
  }
  while (rateMap.size >= MAX_RATE_ENTRIES && !rateMap.has(ip)) {
    const oldest = rateMap.keys().next().value as string | undefined;
    if (oldest === undefined) break;
    rateMap.delete(oldest);
  }

  const current = rateMap.get(ip);

  if (!current || current.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateMap.set(ip, bucket);
    return { ok: true, remaining: RATE_LIMIT_MAX - 1, resetAt: bucket.resetAt };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  rateMap.set(ip, current);
  return { ok: true, remaining: RATE_LIMIT_MAX - current.count, resetAt: current.resetAt };
}

function toCredit(quota: number | null | undefined) {
  const raw = Number(quota || 0);
  if (!Number.isFinite(raw)) return 0;
  return Math.round((raw / CREDIT_DIVISOR) * 100) / 100;
}

function formatCredit(quota: number | null | undefined, unlimited = false) {
  if (unlimited) return "Unlimited";
  const credit = toCredit(quota);
  return `${new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(credit)} credit`;
}

function formatExpiry(ts: number | null | undefined) {
  const value = Number(ts || 0);
  if (!Number.isFinite(value) || value <= 0) return "Không hết hạn";
  // portal dùng unix seconds
  const ms = value > 1e12 ? value : value * 1000;
  // Date/Intl throw for values outside the valid ECMAScript Date range.
  if (!Number.isFinite(ms) || ms <= 0 || ms > 8.64e15) return "Không hết hạn";
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "Không hết hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function asBoolean(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function isActiveStatus(value: string) {
  const status = value.toLocaleLowerCase("vi-VN");
  if (/không\s+hoạt động|không\s+kích hoạt|inactive|disabled|expired|hết hạn|đã tắt/.test(status)) {
    return false;
  }
  return /hoạt động|kích hoạt|active|enabled/.test(status);
}

function parseSetCookie(headerValue: string | null) {
  if (!headerValue) return [] as string[];
  // Node fetch có thể gộp nhiều cookie; tách đơn giản theo ", " chỉ khi có "Expires=" phức tạp → ưu tiên getSetCookie
  return headerValue
    .split(/,(?=\s*[^;=]+=[^;]+)/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function cookieHeaderFromSetCookies(setCookies: string[]) {
  return setCookies
    .map((item) => item.split(";")[0]?.trim())
    .filter(Boolean)
    .join("; ");
}

function summarizeUsage(usage: PortalUsage) {
  const group = String(usage.user_group || usage.token_group || "").trim().toLowerCase();
  const isPureDaily = group === "daily_payg";
  const unlimited = asBoolean(usage.unlimited_quota);
  const planCandidate = Number(usage.user_remain_quota ?? usage.user_quota ?? usage.remain_quota ?? 0);
  const paygCandidate = Number(usage.payg_quota ?? 0);
  const planRemainRaw = Number.isFinite(planCandidate) ? planCandidate : 0;
  const paygRaw = Number.isFinite(paygCandidate) ? paygCandidate : 0;
  const daily = usage.daily_wallet || {};
  const dailyActive = asBoolean(daily.active);
  const dailyExhausted = asBoolean(daily.exhausted);
  const dailyRemainCandidate = Number(daily.quota_remain ?? 0);
  const dailyRemainRaw = dailyActive && Number.isFinite(dailyRemainCandidate) ? dailyRemainCandidate : 0;

  const status =
    clean(usage.status_text, 80) ||
    clean(usage.token_status_text, 80) ||
    (Number(usage.token_status) === 1 ? "Hoạt động" : "Không hoạt động");

  const expireSource = dailyActive
    ? daily.expires_at
    : usage.user_quota_expire_time ?? usage.token_expired_time;

  let primaryLabel = "Số dư chính";
  let primaryCredit = formatCredit(planRemainRaw, unlimited);

  if (unlimited) {
    primaryLabel = "Gói";
    primaryCredit = "Unlimited";
  } else if (isPureDaily && planRemainRaw <= 0 && paygRaw > 0) {
    primaryLabel = "Ví Pay-as-you-go";
    primaryCredit = formatCredit(paygRaw);
  } else if (isPureDaily && dailyActive) {
    primaryLabel = "Ví gói ngày";
    primaryCredit = dailyExhausted ? "Đã hết" : formatCredit(dailyRemainRaw);
  } else if (planRemainRaw <= 0 && paygRaw > 0) {
    primaryLabel = "Ví Pay-as-you-go";
    primaryCredit = formatCredit(paygRaw);
  } else {
    primaryLabel = "Gói tháng (Plan)";
    primaryCredit = formatCredit(planRemainRaw, unlimited);
  }

  return {
    ok: true,
    valid: true,
    status,
    active: Number(usage.token_status) === 1 || isActiveStatus(status),
    maskedKey: clean(usage.masked_key, 80) || null,
    displayName: clean(usage.display_name || usage.username || usage.name, 80) || null,
    group: clean(usage.user_group || usage.token_group, 40) || null,
    primaryLabel,
    primaryCredit,
    planCredit: unlimited ? "Unlimited" : formatCredit(planRemainRaw),
    planRemainQuota: unlimited ? null : Math.max(0, planRemainRaw),
    dailyWallet: {
      active: dailyActive,
      exhausted: dailyExhausted,
      remainCredit: dailyActive ? (dailyExhausted ? "Đã hết" : formatCredit(dailyRemainRaw)) : "—",
      usedCredit: dailyActive ? formatCredit(daily.quota_used) : null,
      totalCredit: dailyActive ? formatCredit(daily.quota_total) : null,
      expiresAt: dailyActive ? formatExpiry(daily.expires_at) : null,
    },
    paygCredit: formatCredit(paygRaw),
    paygRemainQuota: Math.max(0, paygRaw),
    expiresAt: formatExpiry(expireSource),
    usedTodayCredit: formatCredit(usage.user_used_quota ?? usage.token_used_quota),
    note:
      isPureDaily && planRemainRaw <= 0
        ? "Key gói daily/payg — ưu tiên đọc ví PAYG hoặc ví ngày."
        : "Số credit lấy từ portal VietAPI (1 credit = 600.000 quota token).",
  };
}

async function portalLoginAndUsage(apiKey: string) {
  const loginUrl = `${PORTAL_BASE}/api/portal/login`;
  const meUrl = `${PORTAL_BASE}/api/portal/me?logs_page=1&logs_page_size=1`;

  const loginRes = await fetch(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ api_key: apiKey }),
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
  });

  const loginJson = (await loginRes.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: { usage?: unknown };
  };

  if (!loginRes.ok || loginJson.success === false) {
    const message =
      clean(loginJson.message, 240) ||
      (loginRes.status === 401 || loginRes.status === 403
        ? "API key không hợp lệ hoặc đã bị tắt."
        : `VietAPI login HTTP ${loginRes.status}`);
    const error = new Error(message) as Error & { status?: number };
    error.status = loginRes.status || 401;
    throw error;
  }

  // Login đã trả usage — dùng luôn nếu có
  if (isRecord(loginJson.data?.usage)) {
    return loginJson.data.usage as PortalUsage;
  }

  const anyHeaders = loginRes.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies =
    typeof anyHeaders.getSetCookie === "function"
      ? anyHeaders.getSetCookie()
      : parseSetCookie(loginRes.headers.get("set-cookie"));
  const cookieHeader = cookieHeaderFromSetCookies(setCookies);

  const meRes = await fetch(meUrl, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: "no-store",
    signal: AbortSignal.timeout(12_000),
  });

  const meJson = (await meRes.json().catch(() => ({}))) as {
    success?: boolean;
    message?: string;
    data?: { usage?: unknown };
  };

  if (!meRes.ok || meJson.success === false || !isRecord(meJson.data?.usage)) {
    const message = clean(meJson.message, 240) || `VietAPI me HTTP ${meRes.status}`;
    const error = new Error(message) as Error & { status?: number };
    error.status = meRes.status || 502;
    throw error;
  }

  // best-effort logout — không chặn flow
  if (cookieHeader) {
    void fetch(`${PORTAL_BASE}/api/portal/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: "{}",
      cache: "no-store",
      signal: AbortSignal.timeout(4_000),
    }).catch(() => undefined);
  }

  return meJson.data.usage as PortalUsage;
}

export async function POST(request: Request) {
  const started = Date.now();
  const ip = clientIp(request);
  const limit = takeRateLimit(ip);

  if (!limit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return jsonResponse(
      {
        ok: false,
        valid: false,
        error: "Bạn check key hơi nhanh. Thử lại sau vài phút.",
      },
      429,
      { "Retry-After": String(retryAfter) }
    );
  }

  const contentLength = Number(request.headers.get("content-length") || "");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, valid: false, error: "Payload quá lớn." }, 413);
  }

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return jsonResponse({ ok: false, valid: false, error: "Dữ liệu không hợp lệ." }, 400);
  }

  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return jsonResponse({ ok: false, valid: false, error: "Payload quá lớn." }, 413);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse({ ok: false, valid: false, error: "Dữ liệu không hợp lệ." }, 400);
  }

  if (!isRecord(parsed)) {
    return jsonResponse({ ok: false, valid: false, error: "Dữ liệu không hợp lệ." }, 400);
  }

  const payload = parsed;

  if (Object.keys(payload).length > MAX_BODY_KEYS) {
    return jsonResponse({ ok: false, valid: false, error: "Payload không hợp lệ." }, 400);
  }

  // honeypot
  if (clean(payload.website) || clean(payload.company)) {
    return jsonResponse({ ok: true, valid: true, status: "Hoạt động", primaryCredit: "—" });
  }

  const apiKey = clean(payload.apiKey ?? payload.api_key ?? payload.key, 256);

  if (!apiKey || !isLikelyApiKey(apiKey)) {
    return jsonResponse(
      {
        ok: false,
        valid: false,
        validFormat: false,
        maskedKey: apiKey ? maskKey(apiKey) : null,
        error: "Key chưa đúng định dạng. Cần dạng sk-... và đủ độ dài.",
        latencyMs: Date.now() - started,
      },
      400
    );
  }

  try {
    const usage = await portalLoginAndUsage(apiKey);
    const summary = summarizeUsage(usage);

    return jsonResponse(
      {
        ...summary,
        validFormat: true,
        maskedKey: summary.maskedKey || maskKey(apiKey),
        latencyMs: Date.now() - started,
        source: "vietapi.portal",
        portalUrl: `${PORTAL_BASE}/login.html`,
      },
      200,
      { "X-RateLimit-Remaining": String(limit.remaining) }
    );
  } catch (error) {
    const err = error as Error & { status?: number };
    const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 502;
    const message =
      status === 401 || status === 403
        ? "API key không hợp lệ hoặc đã bị tắt."
        : clean(err.message, 240) || "Không kiểm tra được key lúc này. Thử lại sau.";

    // Không log raw key
    console.error("[vietapi/check-key]", {
      ip,
      status,
      masked: maskKey(apiKey),
      message,
    });

    return jsonResponse(
      {
        ok: false,
        valid: false,
        validFormat: true,
        maskedKey: maskKey(apiKey),
        error: message,
        latencyMs: Date.now() - started,
        portalUrl: `${PORTAL_BASE}/login.html`,
      },
      status === 401 || status === 403 ? 401 : status
    );
  }
}
