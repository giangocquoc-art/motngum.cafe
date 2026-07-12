import Link from "next/link";
import { notFound } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import KnowledgeCards from "@/components/KnowledgeCards";
import { BRAND } from "@/data/site";
import {
  getRelatedSeoArticles,
  getSeoArticle,
  SEO_ARTICLES,
} from "@/data/seo-content";
import { createPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return SEO_ARTICLES.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = getSeoArticle(slug);
  if (!article) return {};

  return createPageMetadata({
    title: article.metaTitle,
    description: article.description,
    path: `/kien-thuc/${article.slug}`,
    keywords: article.keywords,
    type: "article",
    imagePath: `/kien-thuc/${article.slug}/opengraph-image`,
    imageAlt: article.title,
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(`${value}T00:00:00+07:00`));
}

function toSectionId(value: string) {
  return value
    .toLocaleLowerCase("vi-VN")
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function KnowledgeArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getSeoArticle(slug);
  if (!article) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const articleUrl = `${siteUrl}/kien-thuc/${article.slug}`;
  const articleImage = `${articleUrl}/opengraph-image`;
  const related = getRelatedSeoArticles(article);
  const wordCount = [
    article.title,
    article.excerpt,
    article.answer,
    ...article.sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets || []),
    ]),
    ...article.faq.flatMap((item) => [item.question, item.answer]),
  ]
    .join(" ")
    .trim()
    .split(/\s+/).length;

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${articleUrl}/#article`,
        headline: article.title,
        description: article.description,
        mainEntityOfPage: articleUrl,
        url: articleUrl,
        image: articleImage,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: "vi-VN",
        wordCount,
        articleSection: article.sections.map((section) => section.heading),
        isPartOf: { "@id": `${siteUrl}/#website` },
        publishingPrinciples: `${siteUrl}/nguyen-tac-noi-dung`,
        author: {
          "@type": "Organization",
          "@id": `${siteUrl}/#organization`,
          name: BRAND.name,
          url: `${siteUrl}/ve-mot-ngum`,
        },
        publisher: { "@id": `${siteUrl}/#organization` },
        keywords: article.keywords.join(", "),
        about: article.primaryKeyword,
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
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
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

      <article className="article-page">
        <header className="article-header">
          <div className="container article-header-inner">
            <Breadcrumbs
              items={[
                { label: "Trang chủ", href: "/" },
                { label: "Kiến thức", href: "/kien-thuc" },
                { label: article.category },
              ]}
            />
            <p className="eyebrow">{article.category}</p>
            <h1>{article.title}</h1>
            <p className="article-deck">{article.excerpt}</p>
            <p className="article-byline">
              <span>
                Nội dung bởi <Link href="/ve-mot-ngum">Một Ngụm</Link>
              </span>
              <span>Cập nhật <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time></span>
              <span>{article.readTime}</span>
              <Link href="/nguyen-tac-noi-dung">Nguyên tắc biên tập</Link>
            </p>
          </div>
        </header>

        <div className="container article-layout">
          <div className="article-content">
            <section className="quick-answer" aria-labelledby="quick-answer-title">
              <p className="quick-answer-label">Trả lời nhanh</p>
              <h2 id="quick-answer-title">{article.primaryKeyword}</h2>
              <p>{article.answer}</p>
            </section>

            <nav className="article-toc" aria-labelledby="article-toc-title">
              <p className="eyebrow">Nội dung chính</p>
              <h2 id="article-toc-title">Trong bài này</h2>
              <ol>
                {article.sections.map((section) => (
                  <li key={section.heading}>
                    <a href={`#${toSectionId(section.heading)}`}>{section.heading}</a>
                  </li>
                ))}
                <li>
                  <a href="#cau-hoi-thuong-gap">Câu hỏi thường gặp</a>
                </li>
              </ol>
            </nav>

            {article.sections.map((section) => (
              <section
                className="article-section"
                id={toSectionId(section.heading)}
                key={section.heading}
              >
                <h2>{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul>
                    {section.bullets.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}

            <section
              className="article-faq"
              id="cau-hoi-thuong-gap"
              aria-labelledby="article-faq-title"
            >
              <p className="eyebrow">Câu hỏi thường gặp</p>
              <h2 id="article-faq-title">Thông tin cần làm rõ.</h2>
              <div className="article-faq-list">
                {article.faq.map((item) => (
                  <section key={item.question}>
                    <h3>{item.question}</h3>
                    <p>{item.answer}</p>
                  </section>
                ))}
              </div>
            </section>

            <aside className="article-cta" aria-labelledby="article-cta-title">
              <p className="article-cta-label">Muốn áp dụng vào tình huống của bạn?</p>
              <h2 id="article-cta-title">Kể việc đang vướng, Một Ngụm cùng bạn chọn bước đầu tiên.</h2>
              <div className="article-cta-actions">
                <Link className="button button-dark" href={article.serviceHref}>
                  {article.serviceLabel}
                </Link>
                <Link className="button button-light" href={`/tu-van-marketing?service=${article.serviceSlug}`}>
                  Trao đổi miễn phí
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section className="section related-knowledge" aria-labelledby="related-title">
        <div className="container">
          <header className="section-heading">
            <p className="eyebrow">Đọc tiếp</p>
            <h2 id="related-title">Những vấn đề thường đi cùng nhau.</h2>
          </header>
          <KnowledgeCards articles={related} headingLevel={3} />
        </div>
      </section>
    </>
  );
}
