"use client";

import { FormEvent, useId, useState } from "react";
import { BRAND } from "@/data/site";

type Status = "idle" | "sending" | "success" | "fallback" | "error";

export default function LeadForm({ defaultService = "", defaultModel = "" }: { defaultService?: string; defaultModel?: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const baseId = useId();

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
      setMessage("Hệ thống gửi tự động chưa kết nối. Ứng dụng email của bạn sẽ mở để gửi yêu cầu.");
      window.location.href = `mailto:${BRAND.email}?subject=${subject}&body=${body}`;
    } catch {
      setStatus("error");
      setMessage(`Không gửi được. Vui lòng gọi ${BRAND.phoneDisplay} hoặc email ${BRAND.email}.`);
    }
  }

  const statusId = `${baseId}-status`;

  return (
    <form className="lead-form" onSubmit={handleSubmit} aria-describedby={statusId}>
      <fieldset className="form-grid">
        <legend className="form-legend">Thông tin tư vấn</legend>

        <p className="form-field">
          <label htmlFor={`${baseId}-name`}>Họ và tên *</label>
          <input id={`${baseId}-name`} name="name" required autoComplete="name" placeholder="Tên của bạn" />
        </p>
        <p className="form-field">
          <label htmlFor={`${baseId}-phone`}>Số điện thoại *</label>
          <input id={`${baseId}-phone`} name="phone" required inputMode="tel" autoComplete="tel" placeholder="09..." />
        </p>
        <p className="form-field">
          <label htmlFor={`${baseId}-email`}>Email</label>
          <input id={`${baseId}-email`} name="email" type="email" autoComplete="email" placeholder="Email không bắt buộc" />
        </p>
        <p className="form-field">
          <label htmlFor={`${baseId}-service`}>Bạn quan tâm dịch vụ nào?</label>
          <select id={`${baseId}-service`} name="service" defaultValue={defaultService}>
            <option value="">Chưa xác định</option>
            <option value="api-vietapi">API VietAPI</option>
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
        </p>
        <input type="hidden" name="model" value={defaultModel} />
        <p className="form-field span-2">
          <label htmlFor={`${baseId}-problem`}>Bạn đang vướng gì? *</label>
          <textarea id={`${baseId}-problem`} name="problem" required rows={4} placeholder="Mô tả ngắn việc đang làm bạn mất thời gian hoặc khiến bạn khó có thêm khách..." />
        </p>
        <p className="form-field">
          <label htmlFor={`${baseId}-budget`}>Ngân sách dự kiến</label>
          <select id={`${baseId}-budget`} name="budget" defaultValue="">
            <option value="">Chưa xác định</option>
            <option>Dưới 1 triệu</option>
            <option>1–3 triệu</option>
            <option>3–10 triệu</option>
            <option>Trên 10 triệu</option>
          </select>
        </p>
        <p className="form-field">
          <label htmlFor={`${baseId}-contactTime`}>Khung giờ tiện liên hệ</label>
          <input id={`${baseId}-contactTime`} name="contactTime" placeholder="Ví dụ: sau 18h" />
        </p>
        <p className="form-field span-2">
          <label htmlFor={`${baseId}-note`}>Thông tin thêm</label>
          <textarea id={`${baseId}-note`} name="note" rows={3} placeholder="Thông tin bổ sung..." />
        </p>
        <p className="form-field honeypot" aria-hidden="true">
          <label htmlFor={`${baseId}-website`}>Website</label>
          <input id={`${baseId}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </p>
      </fieldset>

      <button className="button button-dark submit-button" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Đang gửi..." : "Gửi yêu cầu tư vấn"}
      </button>

      <output id={statusId} className={`form-status ${status}`} aria-live="polite">
        {message}
      </output>
      <p className="form-note">
        <small>
          Bạn cũng có thể gọi trực tiếp <a href={`tel:+84${BRAND.phone.slice(1)}`}>{BRAND.phoneDisplay}</a>.
          <br />
          Thông tin gửi qua form được xử lý theo <a href="/chinh-sach-bao-mat">chính sách bảo mật</a>.
        </small>
      </p>
    </form>
  );
}
