import type { MetadataRoute } from "next";
import { SERVICES } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const routes = [
    "",
    "/menu",
    "/dich-vu",
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
      lastModified: new Date(),
      changeFrequency: route === "" ? ("weekly" as const) : ("monthly" as const),
      priority: route === "" ? 1 : 0.7,
    })),
    ...SERVICES.map((service) => ({
      url: `${base}/dich-vu/${service.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
