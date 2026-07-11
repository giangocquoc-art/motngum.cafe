import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Tư vấn marketing miễn phí",
  description: "Trao đổi ban đầu miễn phí để xác định vấn đề, ưu tiên và hướng đi phù hợp.",
};

type Props = {
  searchParams: Promise<{ service?: string }>;
};

export default async function ConsultationPage({ searchParams }: Props) {
  const { service = "tu-van-marketing" } = await searchParams;

  return (
    <section className="consultation-page">
      <div className="container consultation-grid">
        <Reveal className="consultation-copy">
          <span className="eyebrow">0đ cho buổi trao đổi ban đầu</span>
          <h1>Kể vấn đề trước. Chọn dịch vụ sau.</h1>
          <p>
            Bạn có thể đang cần thêm khách, giảm việc tay hoặc làm thương hiệu chuyên nghiệp hơn.
            Hãy bắt đầu bằng tình hình thật thay vì chọn gói theo cảm tính.
          </p>
          <ul className="check-list">
            <li>Làm rõ mục tiêu và nút thắt</li>
            <li>Gợi ý thứ tự ưu tiên</li>
            <li>Không bắt buộc mua dịch vụ</li>
          </ul>
        </Reveal>
        <Reveal delay={0.08}>
          <LeadForm defaultService={service} />
        </Reveal>
      </div>
    </section>
  );
}
