import { NextResponse } from "next/server";
import { getDomainProvider } from "@/lib/domain-provider";

export const runtime = "edge";
const TLDs = [".vn", ".com", ".com.vn", ".net", ".org", ".shop"];

export async function GET(request: Request) {
  const value = new URL(request.url).searchParams.get("name")?.trim().toLowerCase() ?? "";
  const baseName = value.replace(/^https?:\/\//, "").split("/")[0].replace(/\.[a-z.]+$/, "").replace(/[^a-z0-9-]/g, "").slice(0, 63);
  if (baseName.length < 2) return NextResponse.json({ ok: false, message: "Nhập ít nhất 2 ký tự." }, { status: 400 });
  try {
    const live = process.env.INET_MODE === "live";
    const provider = getDomainProvider();
    const domains = await provider.search(baseName, TLDs);
    const suggestions = domains.some((domain) => domain.status === "registered")
      ? await provider.search(`${baseName}studio`, [".vn", ".com"])
      : [];
    return NextResponse.json(
      { ok: true, live, provider: live ? "inet-reseller" : "public-rdap", domains, suggestions },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Domain provider failed", error);
    return NextResponse.json(
      { ok: false, message: "iNET đang tạm thời không phản hồi. Vui lòng thử lại sau." },
      { status: 503 },
    );
  }
}
