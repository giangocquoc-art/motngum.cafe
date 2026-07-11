import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { AI_LIMITATIONS, getService, SERVICES } from "@/data/site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <section className="service-hero">
        <div className="container service-hero-grid">
          <Reveal className="service-hero-copy">
            <span className="eyebrow">{service.eyebrow}</span>
            <h1>{service.title}</h1>
            <p>{service.description}</p>
            <div className="service-price-block">
              <span>Chi phí</span>
              <strong>{service.price}</strong>
            </div>
            <div className="hero-actions">
              <Link className="button button-dark" href={`/tu-van-marketing?service=${service.slug}`}>
                Nhận tư vấn miễn phí
              </Link>
              <Link className="button button-light" href="/bang-gia">
                Xem bảng giá
              </Link>
            </div>
          </Reveal>
          <Reveal className="service-hero-card" delay={0.08}>
            <span>Phù hợp với</span>
            <ul>
              {service.suitableFor.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section service-details">
        <div className="container detail-grid">
          <Reveal>
            <span className="eyebrow">Phạm vi triển khai</span>
            <h2>Những gì được ưu tiên.</h2>
            <ul className="numbered-list">
              {service.features.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <span className="eyebrow">Quy trình</span>
            <h2>Từ trao đổi đến bàn giao.</h2>
            <ol className="process-list">
              {service.process.map((item, index) => (
                <li key={item}><span>{index + 1}</span><p>{item}</p></li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {service.slug === "chatbot-ai" && (
        <section className="section responsible-ai-section">
          <div className="container">
            <div className="responsible-ai-intro">
              <span className="eyebrow">AI có giới hạn</span>
              <h2>Nói rõ rủi ro trước khi triển khai.</h2>
              <p>
                Chatbot AI là công cụ hỗ trợ, không phải người phán quyết. Một Ngụm chỉ đề xuất triển khai khi có phạm vi dữ liệu, điểm chuyển sang người thật và cách kiểm tra kết quả rõ ràng.
              </p>
            </div>
            <div className="ai-limit-grid">
              {AI_LIMITATIONS.map((item, index) => (
                <article className="ai-limit-card" key={item.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{item.title}</h3>
                  <p>{item.issue}</p>
                  <p><strong>Cách xử lý:</strong> {item.practice}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section faq-section">
        <div className="container">
          <Reveal className="section-heading">
            <span className="eyebrow">Câu hỏi thường gặp</span>
            <h2>Thông tin cần nói rõ trước.</h2>
          </Reveal>
          <div className="faq-grid">
            {service.faq.map((item) => (
              <Reveal className="faq-card" key={item.question}>
                <h3>{item.question}</h3>
                <p>{item.answer}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section consultation-section">
        <div className="container consultation-grid">
          <Reveal className="consultation-copy">
            <span className="eyebrow">Bước tiếp theo</span>
            <h2>Gửi vấn đề thật để nhận đề xuất thật.</h2>
            <p>
              Hãy mô tả công việc, mục tiêu và ngân sách. Một Ngụm sẽ phản hồi phạm vi phù hợp thay vì mặc định bán gói lớn.
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <LeadForm defaultService={service.slug} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
