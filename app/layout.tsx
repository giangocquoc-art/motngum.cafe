import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND } from "@/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
const siteDescription = "Một Ngụm thiết kế website, hỗ trợ chọn tên miền và Mail Pro cho doanh nghiệp nhỏ — gọn trong một lần làm.";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-be-vietnam-pro",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Một Ngụm | Thiết kế website, tên miền và Mail Pro",
    template: "%s | Một Ngụm",
  },
  description: siteDescription,
  alternates: { canonical: "/" },
  keywords: [
    "motngum.cafe",
    "thiết kế website",
    "thiết kế website doanh nghiệp",
    "website bán hàng",
    "landing page",
    "đăng ký tên miền",
    "email doanh nghiệp",
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
    title: "Một Ngụm — Website bắt đầu bằng một cái tên",
    description: siteDescription,
    url: siteUrl,
    siteName: BRAND.name,
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Một Ngụm — Thiết kế website, tên miền và Mail Pro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Một Ngụm — Website bắt đầu bằng một cái tên",
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
    <html lang="vi" className={beVietnamPro.variable}>
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
