import { NextResponse } from "next/server";

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
    signal: AbortSignal.timeout(12_000),
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

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Một Ngụm <onboarding@resend.dev>",
      to: [receiver],
      subject: `Lead mới: ${lead.name} — ${lead.service || "Chưa chọn dịch vụ"}`,
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
  });

  if (!response.ok) throw new Error(`Resend HTTP ${response.status}`);
  return true;
}

export async function POST(request: Request) {
  let payload: LeadPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  if (clean(payload.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.name, 120);
  const phone = clean(payload.phone, 40);
  const problem = clean(payload.problem, 2000);

  if (!name || !phone || !problem) {
    return NextResponse.json({ error: "Thiếu họ tên, số điện thoại hoặc vấn đề." }, { status: 400 });
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
    return NextResponse.json(
      { error: "Chưa cấu hình nơi nhận dữ liệu.", fallback: true },
      { status: 503 }
    );
  }

  const deliveries = await Promise.allSettled([
    sheetsConfigured ? saveToGoogleSheets(lead) : Promise.resolve(false),
    emailConfigured ? sendLeadEmail(lead) : Promise.resolve(false),
  ]);

  const sheetsSaved = deliveries[0].status === "fulfilled" && deliveries[0].value;
  const emailSent = deliveries[1].status === "fulfilled" && deliveries[1].value;

  if (!sheetsSaved && !emailSent) {
    console.error("Lead delivery failed", deliveries);
    return NextResponse.json(
      { error: "Không lưu được yêu cầu tư vấn.", fallback: true },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, sheetsSaved, emailSent });
}
