import type { Metadata } from "next";
import ProblemFinder from "@/components/ProblemFinder";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Quét QR — Chọn vấn đề",
  description: "Chọn việc đang làm bạn mất thời gian và nhận gợi ý hướng giải quyết đầu tiên từ Một Ngụm.",
};

export default function QRPage() {
  return (
    <section className="qr-page">
      <div className="container qr-page-grid">
        <Reveal className="qr-page-intro">
          <span className="eyebrow">Bạn vừa uống một ly Một Ngụm</span>
          <h1>Chọn đúng việc cần gỡ trước.</h1>
          <p>
            Chọn một vấn đề và mục tiêu ưu tiên. Một Ngụm sẽ gợi ý hướng bắt đầu phù hợp,
            sau đó bạn có thể trao đổi miễn phí trước khi quyết định dùng dịch vụ.
          </p>
        </Reveal>
        <Reveal className="finder-shell qr-finder">
          <ProblemFinder />
        </Reveal>
      </div>
    </section>
  );
}
