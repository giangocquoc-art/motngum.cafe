export type SeoArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type SeoArticle = {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  excerpt: string;
  category: string;
  primaryKeyword: string;
  keywords: string[];
  answer: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
  serviceSlug: string;
  serviceHref: string;
  serviceLabel: string;
  sections: SeoArticleSection[];
  faq: { question: string; answer: string }[];
};
