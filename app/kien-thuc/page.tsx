import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import KnowledgeCards from "@/components/KnowledgeCards";
import { SEO_ARTICLES } from "@/data/seo-content";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Kiến thức website, AI, dữ liệu và marketing",
  description:
    "Hướng dẫn thực tế cho chủ shop và doanh nghiệp nhỏ về website, chatbot AI, dữ liệu, quảng cáo, nội dung và tự động hóa.",
  path: "/kien-thuc",
  keywords: [
    "kiến thức website cho doanh nghiệp nhỏ",
    "ứng dụng AI trong công việc",
    "tự động hóa doanh nghiệp nhỏ",
    "marketing cho chủ shop",
    "quảng cáo cho shop nhỏ",
    "quản lý Fanpage",
  ],
});

const GROWTH_SERVICE_SLUGS = new Set([
  "thiet-ke-website",
  "tu-van-marketing",
  "quang-cao",
  "ho-tro-dang-bai",
  "ho-tro-tuong-tac",
]);

export default function KnowledgePage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const growthArticles = SEO_ARTICLES.filter((article) =>
    GROWTH_SERVICE_SLUGS.has(article.serviceSlug)
  );
  const operationsArticles = SEO_ARTICLES.filter(
    (article) => !GROWTH_SERVICE_SLUGS.has(article.serviceSlug)
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${siteUrl}/kien-thuc/#collection`,
        url: `${siteUrl}/kien-thuc`,
        name: "Kiến thức website, AI, dữ liệu và marketing",
        description:
          "Hướng dẫn thực tế dành cho chủ shop, nhân viên văn phòng và doanh nghiệp nhỏ.",
        inLanguage: "vi-VN",
        isPartOf: { "@id": `${siteUrl}/#website` },
        mainEntity: { "@id": `${siteUrl}/kien-thuc/#articles` },
      },
      {
        "@type": "ItemList",
        "@id": `${siteUrl}/kien-thuc/#articles`,
        numberOfItems: SEO_ARTICLES.length,
        itemListElement: SEO_ARTICLES.map((article, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: article.title,
          url: `${siteUrl}/kien-thuc/${article.slug}`,
        })),
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
            name: "Kiến thức",
            item: `${siteUrl}/kien-thuc`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />

      <section className="knowledge-hero" aria-labelledby="knowledge-title">
        <div className="container">
          <Breadcrumbs items={[{ label: "Trang chủ", href: "/" }, { label: "Kiến thức" }]} />
          <p className="eyebrow">Kiến thức từ Một Ngụm</p>
          <h1 id="knowledge-title">Hiểu đúng vấn đề trước khi chọn công cụ.</h1>
          <p>
            Các hướng dẫn được viết cho chủ shop, người làm văn phòng và đội nhóm nhỏ: dễ đọc,
            có checklist và nói rõ cả trường hợp chưa cần mua dịch vụ.
          </p>
          <nav className="knowledge-topic-nav" aria-label="Nhóm nội dung">
            <a href="#thu-hut-khach-hang">Thu hút và chuyển đổi khách hàng</a>
            <a href="#ai-du-lieu-van-hanh">AI, dữ liệu và vận hành</a>
          </nav>
        </div>
      </section>

      <section className="section knowledge-section" aria-labelledby="knowledge-topics-title">
        <h2 id="knowledge-topics-title" className="visually-hidden">Nhóm chủ đề kiến thức</h2>
        <div className="container knowledge-topics">
          <section className="knowledge-topic" id="thu-hut-khach-hang" aria-labelledby="growth-title">
            <header className="section-heading split-heading">
              <div>
                <p className="eyebrow">Tăng trưởng vừa sức</p>
                <h3 id="growth-title">Thu hút và chuyển đổi khách hàng.</h3>
              </div>
              <p>
                Website, nội dung, quảng cáo và quy trình chăm sóc dành cho shop hoặc đội ngũ nhỏ.
              </p>
            </header>
            <KnowledgeCards articles={growthArticles} headingLevel={3} />
          </section>

          <section className="knowledge-topic" id="ai-du-lieu-van-hanh" aria-labelledby="ops-title">
            <header className="section-heading split-heading">
              <div>
                <p className="eyebrow">Bớt việc lặp lại</p>
                <h3 id="ops-title">AI, dữ liệu và vận hành.</h3>
              </div>
              <p>
                Checklist triển khai công cụ, xử lý dữ liệu và tự động hóa có bước kiểm soát.
              </p>
            </header>
            <KnowledgeCards articles={operationsArticles} headingLevel={3} />
          </section>
        </div>
      </section>
    </>
  );
}
