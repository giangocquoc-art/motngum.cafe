import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import KnowledgeCards from "@/components/KnowledgeCards";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { AI_LIMITATIONS, BRAND, getService, getServiceHref, SERVICES } from "@/data/site";
import { getArticlesForService, SERVICE_SEO } from "@/data/seo-content";
import { createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return SERVICES.filter((service) => getServiceHref(service.slug).startsWith("/dich-vu/"))
    .map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  if (!getServiceHref(service.slug).startsWith("/dich-vu/")) return {};
  const seo = SERVICE_SEO[service.slug];

  return createPageMetadata({
    title: seo?.title || service.title,
    description: seo?.description || service.summary,
    path: `/dich-vu/${service.slug}`,
    keywords: seo?.keywords,
  });
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  const canonicalHref = getServiceHref(service.slug);
  if (!canonicalHref.startsWith("/dich-vu/")) permanentRedirect(canonicalHref);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const serviceUrl = `${siteUrl}/dich-vu/${service.slug}`;
  const relatedArticles = getArticlesForService(service.slug);
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${serviceUrl}/#service`,
        name: SERVICE_SEO[service.slug]?.title || service.title,
        serviceType: service.title,
        description: service.description,
        url: serviceUrl,
        areaServed: {
          "@type": "City",
          name: "Thành phố Hồ Chí Minh",
        },
        provider: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: BRAND.name,
          url: siteUrl,
        },
        offers: {
          "@type": "Offer",
          url: serviceUrl,
          priceCurrency: "VND",
          description: service.price,
          availability: "https://schema.org/InStock",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Dịch vụ",
            item: `${siteUrl}/bang-gia?category=services`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: service.title,
            item: serviceUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="service-hero" aria-labelledby="service-title">
        <div className="container service-hero-grid">
          <Reveal as="article" className="service-hero-copy">
            <Breadcrumbs
              items={[
                { label: "Trang chủ", href: "/" },
                { label: "Dịch vụ", href: "/bang-gia?category=services" },
                { label: service.title },
              ]}
            />
            <p className="eyebrow">{service.eyebrow}</p>
            <h1 id="service-title">{service.title}</h1>
            <p>{service.description}</p>
            <p className="service-price-block">
              <span>Chi phí</span>
              <strong>{service.price}</strong>
            </p>
            <div className="hero-actions">
              <Link className="button button-dark" href={`/tu-van-marketing?service=${service.slug}`}>
                Nhận tư vấn miễn phí
              </Link>
              <Link className="button button-light" href="/bang-gia">
                Xem bảng giá
              </Link>
            </div>
          </Reveal>
          <Reveal as="aside" className="service-hero-card" delay={0.08} aria-labelledby="suitable-title">
            <h2 id="suitable-title">Phù hợp với</h2>
            <ul>
              {service.suitableFor.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section service-details" aria-labelledby="service-details-title">
        <h2 id="service-details-title" className="visually-hidden">Phạm vi và quy trình</h2>
        <div className="container detail-grid">
          <Reveal as="article">
            <p className="eyebrow">Phạm vi triển khai</p>
            <h3>Những gì được ưu tiên.</h3>
            <ol className="numbered-list">
              {service.features.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
              ))}
            </ol>
          </Reveal>
          <Reveal as="article" delay={0.08}>
            <p className="eyebrow">Quy trình</p>
            <h3>Từ trao đổi đến bàn giao.</h3>
            <ol className="process-list">
              {service.process.map((item, index) => (
                <li key={item}><span>{index + 1}</span><p>{item}</p></li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {service.slug === "chatbot-ai" && (
        <section className="section responsible-ai-section" aria-labelledby="responsible-ai-title">
          <div className="container">
            <header className="responsible-ai-intro">
              <p className="eyebrow">AI có giới hạn</p>
              <h2 id="responsible-ai-title">Nói rõ rủi ro trước khi triển khai.</h2>
              <p>
                Chatbot AI là công cụ hỗ trợ, không phải người phán quyết. Một Ngụm chỉ đề xuất triển khai khi có phạm vi dữ liệu, điểm chuyển sang người thật và cách kiểm tra kết quả rõ ràng.
              </p>
            </header>
            <ul className="ai-limit-grid" role="list">
              {AI_LIMITATIONS.map((item, index) => (
                <li className="ai-limit-card" key={item.title}>
                  <article>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <h3>{item.title}</h3>
                    <p>{item.issue}</p>
                    <p><strong>Cách xử lý:</strong> {item.practice}</p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="section faq-section" aria-labelledby="service-faq-title">
        <div className="container">
          <Reveal as="header" className="section-heading">
            <p className="eyebrow">Câu hỏi thường gặp</p>
            <h2 id="service-faq-title">Thông tin cần nói rõ trước.</h2>
          </Reveal>
          <ul className="faq-grid" role="list">
            {service.faq.map((item) => (
              <Reveal as="li" className="faq-card" key={item.question}>
                <article>
                  <h3>{item.question}</h3>
                  <p>{item.answer}</p>
                </article>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {relatedArticles.length > 0 && (
        <section className="section service-knowledge-section" aria-labelledby="related-knowledge-title">
          <div className="container">
            <header className="section-heading">
              <p className="eyebrow">Hướng dẫn liên quan</p>
              <h2 id="related-knowledge-title">Hiểu kỹ trước khi triển khai.</h2>
              <p>
                Checklist, chi phí và những điểm cần kiểm tra để bạn chọn phạm vi phù hợp hơn.
              </p>
            </header>
            <KnowledgeCards articles={relatedArticles} />
          </div>
        </section>
      )}

      <section className="section consultation-section" aria-labelledby="service-cta-title">
        <div className="container consultation-grid">
          <Reveal as="article" className="consultation-copy">
            <p className="eyebrow">Bước tiếp theo</p>
            <h2 id="service-cta-title">Gửi vấn đề thật để nhận đề xuất thật.</h2>
            <p>
              Hãy mô tả công việc, mục tiêu và ngân sách. Một Ngụm sẽ phản hồi phạm vi phù hợp thay vì mặc định bán gói lớn.
            </p>
          </Reveal>
          <Reveal as="section" delay={0.08} aria-label="Form tư vấn dịch vụ">
            <LeadForm defaultService={service.slug} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
