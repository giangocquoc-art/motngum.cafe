import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
const ALLOWED_PACKAGES = new Set(["start", "launch", "grow"]);

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      name?: string;
      email?: string;
      phone?: string;
      packageId?: string;
      domain?: string;
      note?: string;
    };
    const name = body.name?.trim().slice(0, 120) ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !body.packageId || !ALLOWED_PACKAGES.has(body.packageId)) {
      return NextResponse.json({ ok: false, message: "Vui lòng kiểm tra tên, email và gói đã chọn." }, { status: 400 });
    }

    const id = `MN-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const paymentConfigured = Boolean(process.env.PAYMENT_BANK_ACCOUNT_NUMBER);
    const order = {
      id,
      status: paymentConfigured ? "awaiting_payment" : "received",
      name,
      email,
      phone: body.phone?.trim().slice(0, 30) ?? "",
      package_id: body.packageId,
      domain: body.domain?.trim().slice(0, 253) ?? "",
      note: body.note?.trim().slice(0, 1000) ?? "",
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("orders").insert(order);
      if (error) {
        console.error("Supabase order insert failed", error);
        return NextResponse.json({ ok: false, message: "Không thể lưu đơn hàng lúc này." }, { status: 503 });
      }
    }

    return NextResponse.json({
      ok: true,
      persisted: Boolean(supabase),
      order: {
        ...order,
        packageId: order.package_id,
        nextStep: paymentConfigured
          ? "Vui lòng chuyển khoản với nội dung là mã đơn hàng."
          : "Một Ngụm sẽ liên hệ để xác nhận phạm vi và báo giá cuối cùng.",
      },
      payment: paymentConfigured ? {
        method: "bank_transfer",
        bankName: process.env.PAYMENT_BANK_NAME ?? "",
        accountName: process.env.PAYMENT_BANK_ACCOUNT_NAME ?? "",
        accountNumber: process.env.PAYMENT_BANK_ACCOUNT_NUMBER ?? "",
        transferContent: id,
      } : null,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, message: "Không thể tạo yêu cầu lúc này." }, { status: 400 });
  }
}
