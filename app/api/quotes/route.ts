import { NextResponse } from "next/server";

export const runtime = "edge";

const PACKAGES: Record<string, { name: string; price: number }> = {
  start: { name: "Bắt đầu", price: 4900000 },
  launch: { name: "Ra mắt", price: 8900000 },
  grow: { name: "Đi xa hơn", price: 14900000 },
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as { packageId?: string; domainPrice?: number };
    const selected = body.packageId ? PACKAGES[body.packageId] : undefined;
    if (!selected) return NextResponse.json({ ok: false, message: "Gói không hợp lệ." }, { status: 400 });
    const domainPrice = typeof body.domainPrice === "number" && body.domainPrice >= 0 && body.domainPrice <= 10000000 ? body.domainPrice : 0;
    const subtotal = selected.price + domainPrice;
    return NextResponse.json({ ok: true, quote: { package: selected.name, packagePrice: selected.price, domainPrice, subtotal, currency: "VND", expiresInMinutes: 30 } });
  } catch { return NextResponse.json({ ok: false, message: "Dữ liệu báo giá không hợp lệ." }, { status: 400 }); }
}
