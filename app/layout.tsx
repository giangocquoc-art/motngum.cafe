import type { Metadata } from "next";
import { Lora } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND } from "@/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const siteDescription =
  "Một Ngụm là cà phê lưu động tại TP.HCM, kết nối bạn với website, chatbot AI, tự động hóa và tư vấn marketing vừa sức.";

const lora = Lora({
  subsets: ["latin", "vietnamese"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-lora",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Một Ngụm | Cà phê, website, AI và marketing",
    template: "%s | Một Ngụm",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  keywords: [
    "motngum.cafe",
    "cà phê lưu động TP.HCM",
    "thiết kế website từ 888k",
    "chatbot AI từ 100k",
    "tự động hóa công việc",
    "tư vấn marketing miễn phí",
  ],
  applicationName: BRAND.name,
  category: "business",
  creator: BRAND.name,
  publisher: BRAND.name,
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "1254x1254" },
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "Một Ngụm — Một ly cà phê, một hướng giải quyết",
    description:
      "Cà phê 12K, tư vấn ban đầu 0đ và giải pháp số vừa sức cho cá nhân, cửa hàng và doanh nghiệp nhỏ.",
    url: siteUrl,
    siteName: BRAND.name,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Một Ngụm — Một ly cà phê, một hướng giải quyết",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Một Ngụm — Một ly cà phê, một hướng giải quyết",
    description: siteDescription,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: BRAND.name,
        url: siteUrl,
        logo: `${siteUrl}/favicon.png`,
        image: `${siteUrl}/opengraph-image`,
        description: siteDescription,
        telephone: `+84${BRAND.phone.slice(1)}`,
        email: BRAND.email,
        contactPoint: {
          "@type": "ContactPoint",
          telephone: `+84${BRAND.phone.slice(1)}`,
          email: BRAND.email,
          contactType: "customer service",
          availableLanguage: ["Vietnamese"],
        },
        knowsAbout: [
          "Thiết kế website",
          "Chatbot AI",
          "Xử lý dữ liệu",
          "Tự động hóa quy trình",
          "Hỗ trợ đăng bài",
          "Quản lý tương tác khách hàng",
          "Quảng cáo cho doanh nghiệp nhỏ",
          "Marketing cho doanh nghiệp nhỏ",
          "Đào tạo AI cơ bản",
        ],
        publishingPrinciples: `${siteUrl}/nguyen-tac-noi-dung`,
        areaServed: {
          "@type": "City",
          name: "Thành phố Hồ Chí Minh",
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Dịch vụ của Một Ngụm",
          itemListElement: [
            "Thiết kế website",
            "Chatbot AI",
            "Xử lý dữ liệu",
            "Tự động hóa quy trình",
            "Hỗ trợ đăng bài",
            "Quản lý tương tác khách hàng",
            "Chạy quảng cáo",
            "Đào tạo AI cơ bản",
            "Tư vấn marketing",
          ].map((name) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name },
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: BRAND.name,
        url: siteUrl,
        inLanguage: "vi-VN",
        description: siteDescription,
        publisher: { "@id": `${siteUrl}/#organization` },
      },
    ],
  };

  return (
    <html lang="vi" className={lora.variable}>
      <head>
        <script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <Analytics />
        <SpeedInsights sampleRate={0.5} />
      </body>
    </html>
  );
}
