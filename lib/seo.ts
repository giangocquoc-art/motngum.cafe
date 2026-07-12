import type { Metadata } from "next";
import { BRAND } from "@/data/site";

const SOCIAL_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Một Ngụm — Một ly cà phê, một hướng giải quyết",
};

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
  imagePath?: string;
  imageAlt?: string;
};

export function createPageMetadata({
  title,
  description,
  path,
  keywords = [],
  type = "website",
  imagePath,
  imageAlt,
}: PageMetadataInput): Metadata {
  const socialTitle = title.includes(BRAND.name) ? title : `${title} | ${BRAND.name}`;
  const socialImage = {
    ...SOCIAL_IMAGE,
    url: imagePath || SOCIAL_IMAGE.url,
    alt: imageAlt || SOCIAL_IMAGE.alt,
  };

  return {
    title,
    description,
    keywords,
    alternates: { canonical: path },
    openGraph: {
      title: socialTitle,
      description,
      url: path,
      siteName: BRAND.name,
      locale: "vi_VN",
      type,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [socialImage.url],
    },
  };
}
