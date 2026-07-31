import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PORTAL_BASE = (process.env.VIETAPI_PORTAL_BASE || "https://vietapi.tech").replace(/\/$/, "");
const CREDIT_DIVISOR = 600_000;
const MAX_BODY_KEYS = 4;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 12;

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

function maskKey(value: string) {
  const key = value.trim();
  if (key.length <= 12) return `${key.slice(0, 3)}…`;
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

function isLikelyApiKey(value: string) {
  return /^sk-[A-Za-z0-9_\-]{16,}$/i.test(value);
}

function clientIp(request: Request) {
  const xf = request.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function takeRateLimit(ip: string) {
  const now = Date.now();
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
  if (!value || value < 0) return "Không hết hạn";
  // portal dùng unix seconds
  const ms = value > 1e12 ? value : value * 1000;
  if (!Number.isFinite(ms) || ms <= 0) return "Không hết hạn";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(ms));
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
  const group = String(usage.user_group || usage.token_group || "").toLowerCase();
  const isPureDaily = group === "daily_payg";
  const unlimited = Boolean(usage.unlimited_quota);
  const planRemainRaw = Number(usage.user_remain_quota ?? usage.user_quota ?? usage.remain_quota ?? 0);
  const paygRaw = Number(usage.payg_quota ?? 0);
  const daily = usage.daily_wallet || {};
  const dailyActive = Boolean(daily.active);
  const dailyRemainRaw = dailyActive ? Number(daily.quota_remain ?? 0) : 0;

  const status =
    clean(usage.status_text, 80) ||
    clean(usage.token_status_text, 80) ||
    (usage.token_status === 1 ? "Hoạt động" : "Không hoạt động");

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
    primaryCredit = daily.exhausted ? "Đã hết" : formatCredit(dailyRemainRaw);
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
    active: /hoạt động/i.test(status) || usage.token_status === 1,
    maskedKey: clean(usage.masked_key, 80) || null,
    displayName: clean(usage.display_name || usage.username || usage.name, 80) || null,
    group: clean(usage.user_group || usage.token_group, 40) || null,
    primaryLabel,
    primaryCredit,
    planCredit: unlimited ? "Unlimited" : formatCredit(planRemainRaw),
    planRemainQuota: unlimited ? null : Math.max(0, planRemainRaw),
    dailyWallet: {
      active: dailyActive,
      exhausted: Boolean(daily.exhausted),
      remainCredit: dailyActive ? (daily.exhausted ? "Đã hết" : formatCredit(dailyRemainRaw)) : "—",
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
    data?: { usage?: PortalUsage };
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
  if (loginJson.data?.usage) {
    return loginJson.data.usage;
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
    data?: { usage?: PortalUsage };
  };

  if (!meRes.ok || meJson.success === false || !meJson.data?.usage) {
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

  return meJson.data.usage;
}

export async function POST(request: Request) {
  const started = Date.now();
  const ip = clientIp(request);
  const limit = takeRateLimit(ip);

  if (!limit.ok) {
    const retryAfter = Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        error: "Bạn check key hơi nhanh. Thử lại sau vài phút.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      }
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, valid: false, error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  if (Object.keys(payload || {}).length > MAX_BODY_KEYS) {
    return NextResponse.json({ ok: false, valid: false, error: "Payload không hợp lệ." }, { status: 400 });
  }

  // honeypot
  if (clean(payload.website) || clean(payload.company)) {
    return NextResponse.json({ ok: true, valid: true, status: "Hoạt động", primaryCredit: "—" });
  }

  const apiKey = clean(payload.apiKey ?? payload.api_key ?? payload.key, 256);

  if (!apiKey || !isLikelyApiKey(apiKey)) {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validFormat: false,
        maskedKey: apiKey ? maskKey(apiKey) : null,
        error: "Key chưa đúng định dạng. Cần dạng sk-... và đủ độ dài.",
        latencyMs: Date.now() - started,
      },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const usage = await portalLoginAndUsage(apiKey);
    const summary = summarizeUsage(usage);

    return NextResponse.json(
      {
        ...summary,
        validFormat: true,
        maskedKey: summary.maskedKey || maskKey(apiKey),
        latencyMs: Date.now() - started,
        source: "vietapi.portal",
        portalUrl: `${PORTAL_BASE}/login.html`,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
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

    return NextResponse.json(
      {
        ok: false,
        valid: false,
        validFormat: true,
        maskedKey: maskKey(apiKey),
        error: message,
        latencyMs: Date.now() - started,
        portalUrl: `${PORTAL_BASE}/login.html`,
      },
      {
        status: status === 401 || status === 403 ? 401 : status,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
}
