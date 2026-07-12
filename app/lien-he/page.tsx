import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { BRAND } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Liên hệ tư vấn website, AI và marketing",
  description: "Liên hệ Một Ngụm qua điện thoại, email hoặc form để trao đổi về website, chatbot AI, dữ liệu, tự động hóa và marketing.",
  path: "/lien-he",
  keywords: ["liên hệ Một Ngụm", "tư vấn website", "tư vấn chatbot AI", "tư vấn marketing TP.HCM"],
});

export default function ContactPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/lien-he`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "Liên hệ Một Ngụm",
        inLanguage: "vi-VN",
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Liên hệ", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <section className="contact-page" aria-labelledby="contact-title">
        <div className="container contact-grid">
          <Reveal as="article" className="contact-copy">
            <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Liên hệ" }]} />
            <p className="eyebrow">Liên hệ Một Ngụm</p>
            <h1 id="contact-title">Cà phê mở chuyện. Tụi mình cùng gỡ việc.</h1>
            <dl className="contact-list">
              <div>
                <dt>Điện thoại</dt>
                <dd><a href={`tel:+84${BRAND.phone.slice(1)}`}>{BRAND.phoneDisplay}</a></dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd><a href={`mailto:${BRAND.email}`}>{BRAND.email}</a></dd>
              </div>
              <div>
                <dt>Khu vực</dt>
                <dd>TP.HCM · Điểm bán lưu động</dd>
              </div>
            </dl>
          </Reveal>
          <Reveal as="section" delay={0.08} aria-label="Form liên hệ">
            <LeadForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
