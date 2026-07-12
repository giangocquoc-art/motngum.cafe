import ProblemFinder from "@/components/ProblemFinder";
import Reveal from "@/components/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Quét QR — Chọn vấn đề",
  description: "Chọn việc đang làm bạn mất thời gian và nhận gợi ý hướng giải quyết đầu tiên phù hợp với mục tiêu, phạm vi và ngân sách.",
  path: "/qr",
  keywords: ["chọn giải pháp cho doanh nghiệp nhỏ", "tư vấn giải pháp số", "Một Ngụm QR"],
});

export default function QRPage() {
  return (
    <section className="qr-page" aria-labelledby="qr-title">
      <div className="container qr-page-grid">
        <Reveal as="header" className="qr-page-intro">
          <p className="eyebrow">Bạn vừa uống một ly Một Ngụm</p>
          <h1 id="qr-title">Chọn đúng việc cần gỡ trước.</h1>
          <p>
            Chọn một vấn đề và mục tiêu ưu tiên. Một Ngụm sẽ gợi ý hướng bắt đầu phù hợp,
            sau đó bạn có thể trao đổi miễn phí trước khi quyết định dùng dịch vụ.
          </p>
        </Reveal>
        <Reveal as="section" className="finder-shell qr-finder" aria-label="Công cụ chọn vấn đề">
          <ProblemFinder />
        </Reveal>
      </div>
    </section>
  );
}
