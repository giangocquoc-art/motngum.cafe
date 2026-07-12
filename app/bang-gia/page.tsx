import Link from "next/link";
import Reveal from "@/components/Reveal";
import { getServiceHref, SERVICES } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bảng giá website, chatbot AI và marketing",
  description: "Xem giá khởi điểm cho thiết kế website, chatbot AI, quảng cáo, đào tạo AI và tư vấn marketing dành cho cá nhân, chủ shop và doanh nghiệp nhỏ.",
  path: "/bang-gia",
  keywords: ["bảng giá thiết kế website", "giá chatbot AI", "chi phí đào tạo AI", "giá dịch vụ digital"],
});

export default function PricingPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="pricing-title">
        <div className="container">
          <Reveal as="header">
            <p className="eyebrow">Chi phí để bắt đầu</p>
            <h1 id="pricing-title">Giá rõ từ đầu, báo theo đúng phạm vi.</h1>
            <p>Dịch vụ tùy chỉnh được báo giá sau khi xem nhu cầu, dữ liệu và khối lượng công việc thực tế.</p>
          </Reveal>
        </div>
      </section>
      <section className="section pricing-section" aria-labelledby="pricing-table-title">
        <h2 id="pricing-table-title" className="visually-hidden">Bảng giá dịch vụ</h2>
        <ul className="pricing-table" role="list">
          {SERVICES.map((service) => (
            <Reveal as="li" className="pricing-row" key={service.slug}>
              <article>
                <p className="pricing-eyebrow">{service.eyebrow}</p>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
              </article>
              <strong>{service.price}</strong>
              <Link href={getServiceHref(service.slug)}>Chi tiết <span aria-hidden="true">→</span></Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </>
  );
}
