import type { Metadata } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BRAND } from "@/data/site";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";

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
    default: "Một Ngụm — Cà phê, website, AI và marketing",
    template: "%s | Một Ngụm",
  },
  description:
    "Cà phê lưu động tại TP.HCM. Mã QR trên ly giúp bạn chọn đúng vấn đề trước khi cân nhắc website, chatbot AI, tự động hóa, xử lý dữ liệu, quảng cáo hoặc tư vấn marketing.",
  keywords: [
    "motngum.cafe",
    "cà phê lưu động TP.HCM",
    "thiết kế website từ 888k",
    "chatbot AI từ 100k",
    "tự động hóa công việc",
    "tư vấn marketing miễn phí",
  ],
  openGraph: {
    title: "Một Ngụm — Một ly cà phê, một hướng giải quyết",
    description:
      "Cà phê 12K, tư vấn ban đầu 0đ và các giải pháp số vừa sức cho cá nhân, cửa hàng và doanh nghiệp nhỏ.",
    url: siteUrl,
    siteName: BRAND.name,
    locale: "vi_VN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={lora.variable}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
