import type { MetadataRoute } from "next";
import { getServiceHref, SERVICES } from "@/data/site";
import { SEO_ARTICLES } from "@/data/seo-content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const siteUpdatedAt = new Date("2026-08-03T00:00:00+07:00");
  const routes = [
    "",
    "/menu",
    "/dich-vu",
    "/api",
    "/kien-thuc",
    "/chinh-sach-bao-mat",
    "/nguyen-tac-noi-dung",
    "/qr",
    "/dao-tao-ai",
    "/tu-van-marketing",
    "/bang-gia",
    "/ve-mot-ngum",
    "/lien-he",
  ];

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: siteUpdatedAt,
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...SERVICES.filter((service) => getServiceHref(service.slug).startsWith("/dich-vu/"))
      .map((service) => ({
        url: `${base}${getServiceHref(service.slug)}`,
        lastModified: siteUpdatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.65,
      })),
    ...SEO_ARTICLES.map((article) => ({
      url: `${base}/kien-thuc/${article.slug}`,
      lastModified: new Date(`${article.updatedAt}T00:00:00+07:00`),
      changeFrequency: "monthly" as const,
      priority: 0.72,
    })),
  ];
}
