import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Keep this endpoint cheap to parse. A lead is tiny; accepting arbitrary JSON
// bodies only gives bots an easy way to consume memory before validation.
const MAX_BODY_BYTES = 32 * 1024;
const DELIVERY_TIMEOUT_MS = 12_000;

type LeadPayload = {
  name?: string;
  phone?: string;
  email?: string;
  service?: string;
  problem?: string;
  budget?: string;
  contactTime?: string;
  note?: string;
  website?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

function clean(value: unknown, max = 1500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function jsonResponse(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function saveToGoogleSheets(lead: Record<string, string>) {
  const url = process.env.GOOGLE_SHEETS_WEB_APP_URL;
  const secret = process.env.GOOGLE_SHEETS_WEB_APP_SECRET;

  if (!url || !secret) return false;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, secret }),
    cache: "no-store",
    redirect: "follow",
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Google Sheets HTTP ${response.status}`);

  const result = (await response.json()) as { ok?: boolean; error?: string };
  if (!result.ok) throw new Error(result.error || "Google Sheets từ chối dữ liệu");

  return true;
}

async function sendLeadEmail(lead: Record<string, string>) {
  const apiKey = process.env.RESEND_API_KEY;
  const receiver = process.env.LEAD_RECEIVER_EMAIL;

  if (!apiKey || !receiver) return false;

  // Resend requires a verified sender in production. Keep the old sandbox
  // value as a development fallback, while allowing deployments to configure
  // their own domain through an environment variable.
  const sender = process.env.RESEND_FROM_EMAIL || "Một Ngụm <onboarding@resend.dev>";
  const subjectService = (lead.service || "Chưa chọn dịch vụ").replace(/[\r\n]+/g, " ");
  const subjectName = lead.name.replace(/[\r\n]+/g, " ");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: sender,
      to: [receiver],
      subject: `Lead mới: ${subjectName} — ${subjectService}`,
      text: [
        `Họ tên: ${lead.name}`,
        `Điện thoại: ${lead.phone}`,
        `Email: ${lead.email}`,
        `Dịch vụ: ${lead.service}`,
        `Vấn đề: ${lead.problem}`,
        `Ngân sách: ${lead.budget}`,
        `Thời gian liên hệ: ${lead.contactTime}`,
        `Lời nhắn: ${lead.note}`,
        `Nguồn: ${lead.source}`,
        `UTM: ${lead.utmSource} / ${lead.utmMedium} / ${lead.utmCampaign}`,
      ].join("\n"),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
  });

  if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
  return true;
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") || "");
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Dữ liệu gửi lên quá lớn." }, 413);
  }

  let parsed: unknown;

  try {
    const raw = await request.text();
    // Content-Length is optional (chunked requests are common), so check the
    // actual UTF-8 payload as well before JSON.parse.
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
      return jsonResponse({ error: "Dữ liệu gửi lên quá lớn." }, 413);
    }
    parsed = JSON.parse(raw);
  } catch {
    return jsonResponse({ error: "Dữ liệu không hợp lệ." }, 400);
  }

  if (!isRecord(parsed)) {
    return jsonResponse({ error: "Dữ liệu không hợp lệ." }, 400);
  }

  const payload = parsed as LeadPayload;

  if (clean(payload.website)) {
    return jsonResponse({ ok: true });
  }

  const name = clean(payload.name, 120);
  const phone = clean(payload.phone, 40);
  const problem = clean(payload.problem, 2000);

  if (!name || !phone || !problem) {
    return jsonResponse({ error: "Thiếu họ tên, số điện thoại hoặc vấn đề." }, 400);
  }

  const lead = {
    name,
    phone,
    email: clean(payload.email, 180),
    service: clean(payload.service, 100),
    problem,
    budget: clean(payload.budget, 100),
    contactTime: clean(payload.contactTime, 100),
    note: clean(payload.note, 1500),
    source: clean(payload.source, 200),
    utmSource: clean(payload.utmSource, 100),
    utmMedium: clean(payload.utmMedium, 100),
    utmCampaign: clean(payload.utmCampaign, 100),
  };

  const sheetsConfigured = Boolean(
    process.env.GOOGLE_SHEETS_WEB_APP_URL && process.env.GOOGLE_SHEETS_WEB_APP_SECRET
  );
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.LEAD_RECEIVER_EMAIL);

  if (!sheetsConfigured && !emailConfigured) {
    return jsonResponse({ error: "Chưa cấu hình nơi nhận dữ liệu.", fallback: true }, 503);
  }

  const deliveries = await Promise.allSettled([
    sheetsConfigured ? saveToGoogleSheets(lead) : Promise.resolve(false),
    emailConfigured ? sendLeadEmail(lead) : Promise.resolve(false),
  ]);

  const sheetsSaved = deliveries[0].status === "fulfilled" && deliveries[0].value;
  const emailSent = deliveries[1].status === "fulfilled" && deliveries[1].value;

  if (!sheetsSaved && !emailSent) {
    console.error("Lead delivery failed", deliveries);
    return jsonResponse({ error: "Không lưu được yêu cầu tư vấn.", fallback: true }, 502);
  }

  return jsonResponse({ ok: true, sheetsSaved, emailSent });
}
