import { NextResponse } from "next/server";

export const runtime = "edge";
const ALLOWED_PACKAGES = new Set(["start", "launch", "grow"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as { name?: string; email?: string; phone?: string; packageId?: string; domain?: string; note?: string };
    const name = body.name?.trim().slice(0, 120) ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !body.packageId || !ALLOWED_PACKAGES.has(body.packageId)) {
      return NextResponse.json({ ok: false, message: "Vui lòng kiểm tra tên, email và gói đã chọn." }, { status: 400 });
    }
    const orderId = `MN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    return NextResponse.json({ ok: true, order: { id: orderId, status: "received", name, email, phone: body.phone?.trim().slice(0, 30) ?? "", packageId: body.packageId, domain: body.domain?.trim().slice(0, 253) ?? "", note: body.note?.trim().slice(0, 1000) ?? "", nextStep: "Một Ngụm sẽ liên hệ để xác nhận phạm vi và báo giá cuối cùng." } }, { status: 201 });
  } catch { return NextResponse.json({ ok: false, message: "Không thể tạo yêu cầu lúc này." }, { status: 400 }); }
}
