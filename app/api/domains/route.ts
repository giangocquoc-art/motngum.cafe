import { NextResponse } from "next/server";
import { getDomainProvider } from "@/lib/domain-provider";

export const runtime = "edge";
const TLDs = [".vn", ".com", ".com.vn", ".co", ".shop"];

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("name")?.trim().toLowerCase() ?? "";
  const baseName = value.replace(/^https?:\/\//, "").split("/")[0].replace(/\.[a-z.]+$/, "").replace(/[^a-z0-9-]/g, "").slice(0, 63);
  if (baseName.length < 2) return NextResponse.json({ ok: false, message: "Nhập ít nhất 2 ký tự." }, { status: 400 });
  const domains = await getDomainProvider().search(baseName, TLDs);
  return NextResponse.json({ ok: true, live: false, provider: "mock", domains }, { headers: { "Cache-Control": "no-store" } });
}
