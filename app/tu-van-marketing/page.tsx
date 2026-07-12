import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { BRAND, getService } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Tư vấn marketing miễn phí cho doanh nghiệp nhỏ",
  description: "Trao đổi ban đầu miễn phí để chủ shop và doanh nghiệp nhỏ xác định vấn đề, kênh ưu tiên và ngân sách marketing phù hợp.",
  path: "/tu-van-marketing",
  keywords: ["tư vấn marketing miễn phí", "marketing cho doanh nghiệp nhỏ", "tư vấn marketing TP.HCM", "marketing cho chủ shop"],
});

type Props = {
  searchParams: Promise<{ service?: string }>;
};

export default async function ConsultationPage({ searchParams }: Props) {
  const { service = "tu-van-marketing" } = await searchParams;
  const consultation = getService("tu-van-marketing")!;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/tu-van-marketing`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}/#service`,
        name: "Tư vấn marketing miễn phí cho doanh nghiệp nhỏ",
        serviceType: "Tư vấn marketing",
        description: consultation.description,
        url: pageUrl,
        areaServed: { "@type": "City", name: "Thành phố Hồ Chí Minh" },
        provider: { "@id": `${siteUrl}/#organization`, "@type": "Organization", name: BRAND.name },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "VND",
          availability: "https://schema.org/InStock",
          url: pageUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Tư vấn marketing", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="consultation-page" aria-labelledby="consultation-title">
        <div className="container consultation-grid">
          <Reveal as="article" className="consultation-copy">
            <p className="eyebrow">0đ cho buổi trao đổi ban đầu</p>
            <h1 id="consultation-title">Kể vấn đề trước. Chọn dịch vụ sau.</h1>
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
          <Reveal as="section" delay={0.08} aria-label="Form tư vấn marketing">
            <LeadForm defaultService={service} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
