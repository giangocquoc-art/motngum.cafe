"use client";

import { FormEvent, useState } from "react";
import { BRAND } from "@/data/site";

type Status = "idle" | "sending" | "success" | "fallback" | "error";

export default function LeadForm({ defaultService = "" }: { defaultService?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source: window.location.pathname,
          utmSource: new URLSearchParams(window.location.search).get("utm_source") ?? "",
          utmMedium: new URLSearchParams(window.location.search).get("utm_medium") ?? "",
          utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") ?? "",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setMessage("Một Ngụm đã nhận thông tin. Tụi mình sẽ liên hệ lại sớm.");
        form.reset();
        return;
      }

      const subject = encodeURIComponent("Yêu cầu tư vấn từ motngum.cafe");
      const body = encodeURIComponent(
        `Họ tên: ${data.name}\nSố điện thoại: ${data.phone}\nDịch vụ: ${data.service}\nVấn đề: ${data.problem}\nNgân sách: ${data.budget}\nLời nhắn: ${data.note}`
      );
      setStatus("fallback");
      setMessage("Hệ thống gửi tự động chưa được cấu hình. Hãy dùng email dự phòng bên dưới.");
      window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
    } catch {
      setStatus("error");
      setMessage(`Không gửi được. Vui lòng gọi ${BRAND.phoneDisplay} hoặc email ${BRAND.email}.`);
    }
  }

  return (
    <form className="lead-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Họ và tên *</span>
          <input name="name" required autoComplete="name" placeholder="Tên của bạn" />
        </label>
        <label>
          <span>Số điện thoại *</span>
          <input name="phone" required inputMode="tel" autoComplete="tel" placeholder="09..." />
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" autoComplete="email" placeholder="Email không bắt buộc" />
        </label>
        <label>
          <span>Dịch vụ quan tâm</span>
          <select name="service" defaultValue={defaultService}>
            <option value="">Chưa xác định</option>
            <option value="thiet-ke-website">Thiết kế website</option>
            <option value="chatbot-ai">Chatbot AI</option>
            <option value="xu-ly-du-lieu">Xử lý dữ liệu</option>
            <option value="tu-dong-hoa-quy-trinh">Tự động hóa</option>
            <option value="ho-tro-dang-bai">Hỗ trợ đăng bài</option>
            <option value="ho-tro-tuong-tac">Hỗ trợ tương tác</option>
            <option value="quang-cao">Chạy quảng cáo</option>
            <option value="dao-tao-ai-co-ban">Đào tạo AI</option>
            <option value="tu-van-marketing">Tư vấn marketing miễn phí</option>
          </select>
        </label>
        <label className="span-2">
          <span>Vấn đề cần giải quyết *</span>
          <textarea name="problem" required rows={4} placeholder="Mô tả ngắn việc đang làm bạn mất thời gian hoặc khó tăng khách..." />
        </label>
        <label>
          <span>Ngân sách dự kiến</span>
          <select name="budget" defaultValue="">
            <option value="">Chưa xác định</option>
            <option>Dưới 1 triệu</option>
            <option>1–3 triệu</option>
            <option>3–10 triệu</option>
            <option>Trên 10 triệu</option>
          </select>
        </label>
        <label>
          <span>Thời gian liên hệ</span>
          <input name="contactTime" placeholder="Ví dụ: sau 18h" />
        </label>
        <label className="span-2">
          <span>Lời nhắn thêm</span>
          <textarea name="note" rows={3} placeholder="Thông tin bổ sung..." />
        </label>
        <label className="honeypot" aria-hidden="true">
          <span>Website</span>
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <button className="button button-dark submit-button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </button>

      {message && <p className={`form-status ${status}`}>{message}</p>}
      <p className="form-note">
        Hoặc gọi trực tiếp <a href={`tel:+84${BRAND.phone.slice(1)}`}>{BRAND.phoneDisplay}</a>.
      </p>
    </form>
  );
}
