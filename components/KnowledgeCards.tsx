import Link from "next/link";
import type { SeoArticle } from "@/data/seo-content";

type KnowledgeCardsProps = {
  articles: SeoArticle[];
  headingLevel?: 2 | 3;
};

export default function KnowledgeCards({
  articles,
  headingLevel = 2,
}: KnowledgeCardsProps) {
  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <ul className="knowledge-grid" role="list">
      {articles.map((article) => (
        <li className="knowledge-card" key={article.slug}>
          <article>
            <header className="knowledge-card-meta">
              <span>{article.category}</span>
              <span>{article.readTime}</span>
            </header>
            <Heading>
              <Link href={`/kien-thuc/${article.slug}`}>{article.title}</Link>
            </Heading>
            <p>{article.excerpt}</p>
            <footer>
              <Link className="text-link" href={`/kien-thuc/${article.slug}`}>
                Đọc hướng dẫn <span aria-hidden="true">→</span>
              </Link>
            </footer>
          </article>
        </li>
      ))}
    </ul>
  );
}
