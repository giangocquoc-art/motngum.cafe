import Image from "next/image";
import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Về Một Ngụm",
  description: "Câu chuyện cà phê lưu động tại TP.HCM và chiếc QR kết nối khách hàng với website, AI, dữ liệu và giải pháp marketing vừa sức.",
  path: "/ve-mot-ngum",
  keywords: ["Một Ngụm", "cà phê lưu động TP.HCM", "giải pháp số cho doanh nghiệp nhỏ"],
});

export default function AboutPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/ve-mot-ngum`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "Về Một Ngụm",
        inLanguage: "vi-VN",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Về Một Ngụm", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="page-hero about-hero" aria-labelledby="about-title">
        <div className="container about-hero-grid">
          <Reveal as="header">
            <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Về Một Ngụm" }]} />
            <p className="eyebrow">Hai người · Một xe cà phê · Một chiếc QR</p>
            <h1 id="about-title">Một Ngụm bắt đầu từ một điểm chạm nhỏ.</h1>
            <p>
              Cà phê giá dễ tiếp cận giúp hai bạn gặp đúng nhóm khách văn phòng. Website phía sau chiếc QR
              giúp cuộc gặp ngắn trở thành một cuộc trò chuyện có ích hơn.
            </p>
          </Reveal>
          <Reveal as="figure" className="about-hero-image" delay={0.08}>
            <Image src="/assets/hero-frames/cup-1.webp" alt="Ly cà phê Một Ngụm" width={680} height={680} loading="eager" />
          </Reveal>
        </div>
      </section>

      <section className="section" aria-labelledby="timeline-title">
        <h2 id="timeline-title" className="visually-hidden">Hành trình của Một Ngụm</h2>
        <div className="container story-timeline">
          <Reveal as="article" className="timeline-item">
            <span>01</span>
            <h3>Cà phê là sản phẩm thật.</h3><p>Khách mua vì ly ngon, giá hợp lý và tiện trên đường đi làm.</p>
          </Reveal>
          <Reveal as="article" className="timeline-item">
            <span>02</span>
            <h3>QR là lời mời.</h3><p>Khách quét để xem menu, chọn vấn đề hoặc nhận tư vấn marketing miễn phí.</p>
          </Reveal>
          <Reveal as="article" className="timeline-item">
            <span>03</span>
            <h3>Digital là giá trị phía sau.</h3><p>Website, chatbot, dữ liệu và tự động hóa được đề xuất khi thật sự phù hợp.</p>
          </Reveal>
        </div>
      </section>

      <section className="section about-cta-section" aria-labelledby="about-cta-title">
        <div className="container note-panel">
          <header>
            <h2 id="about-cta-title">Một ngụm cà phê. Một hướng giải quyết.</h2>
          </header>
          <p>Không phải vấn đề nào cũng cần phần mềm. Nhưng vấn đề nào cũng nên được nhìn cho rõ trước.</p>
          <Link href="/qr" className="button button-dark">Chọn vấn đề của tôi</Link>
        </div>
      </section>
    </>
  );
}
