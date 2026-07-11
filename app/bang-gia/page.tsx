import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { SERVICES } from "@/data/site";

export const metadata: Metadata = {
  title: "Bảng giá",
  description: "Giá khởi điểm cho website, chatbot AI, quảng cáo, đào tạo AI và tư vấn marketing.",
};

export default function PricingPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Chi phí để bắt đầu</span>
            <h1>Giá rõ từ đầu, báo theo đúng phạm vi.</h1>
            <p>Dịch vụ tùy chỉnh được báo giá sau khi xem nhu cầu, dữ liệu và khối lượng công việc thực tế.</p>
          </Reveal>
        </div>
      </section>
      <section className="section pricing-section">
        <div className="container pricing-table">
          {SERVICES.map((service) => (
            <Reveal className="pricing-row" key={service.slug}>
              <div>
                <span>{service.eyebrow}</span>
                <h2>{service.title}</h2>
                <p>{service.summary}</p>
              </div>
              <strong>{service.price}</strong>
              <Link href={`/dich-vu/${service.slug}`}>Chi tiết →</Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
