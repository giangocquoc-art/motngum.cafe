import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const endpoint = process.env.WORDPRESS_API_URL?.trim().replace(/\/$/, "");
  if (!endpoint) return NextResponse.json({ ok: true, source: "fallback", catalog: null });

  try {
    const response = await fetch(`${endpoint}/wp-json/motngum/v1/catalog`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`WordPress HTTP ${response.status}`);
    return NextResponse.json({ ok: true, source: "wordpress", catalog: await response.json() }, {
      headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    console.error("WordPress catalog unavailable", error);
    return NextResponse.json({ ok: true, source: "fallback", catalog: null });
  }
}
