import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { BRAND, getService } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Khóa học AI cơ bản cho người mới tại TP.HCM",
  description: "Khóa học AI cơ bản giá 500.000đ cho người mới, nhân viên văn phòng, chủ shop và đội nhóm nhỏ tại TP.HCM.",
  path: "/dao-tao-ai",
  keywords: ["khóa học AI cho người mới", "khóa học AI TP.HCM", "học AI cho dân văn phòng", "đào tạo AI cơ bản"],
});

export default function TrainingPage() {
  const service = getService("dao-tao-ai-co-ban")!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/dao-tao-ai`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: "Khóa học AI cơ bản cho người mới tại TP.HCM",
        serviceType: "Đào tạo sử dụng AI cơ bản",
        description: service.description,
        url: pageUrl,
        areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
        provider: { "@id": `${siteUrl}/#organization`, "@type": "Organization", name: BRAND.name },
        offers: {
          "@type": "Offer",
          price: "500000",
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: pageUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Đào tạo AI", item: pageUrl },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="page-hero" aria-labelledby="training-title">
        <div className="container">
          <Reveal as="header">
            <p className="eyebrow">Học để dùng được</p>
            <h1 id="training-title">Đào tạo AI cơ bản — 500.000đ.</h1>
            <p>{service.description}</p>
            <Link className="button button-dark" href="#dang-ky">Đăng ký buổi học</Link>
          </Reveal>
        </div>
      </section>
      <section className="section" aria-labelledby="training-content-title">
        <div className="container detail-grid">
          <Reveal as="article">
            <p className="eyebrow">Nội dung</p>
            <h2 id="training-content-title">Không học theo kiểu xem demo.</h2>
            <ol className="numbered-list">
              {service.features.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
              ))}
            </ol>
          </Reveal>
          <Reveal as="section" id="dang-ky" delay={0.08} aria-label="Form đăng ký khóa học">
            <LeadForm defaultService="dao-tao-ai-co-ban" />
          </Reveal>
        </div>
      </section>
      <section className="section faq-section" aria-labelledby="training-faq-title">
        <div className="container">
          <header className="section-heading">
            <p className="eyebrow">Câu hỏi thường gặp</p>
            <h2 id="training-faq-title">Thông tin trước khi đăng ký.</h2>
          </header>
          <ul className="faq-grid" role="list">
            {service.faq.map((item) => (
              <li className="faq-card" key={item.question}>
                <article>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
