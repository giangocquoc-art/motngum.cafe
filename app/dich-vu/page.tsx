import ServicesGrid from "@/components/ServicesGrid";
import Reveal from "@/components/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Dịch vụ số cho doanh nghiệp nhỏ",
  description: "Dịch vụ website, chatbot AI, xử lý dữ liệu, tự động hóa, quảng cáo và đào tạo AI cho chủ shop, cá nhân và doanh nghiệp nhỏ.",
  path: "/dich-vu",
  keywords: ["dịch vụ số cho doanh nghiệp nhỏ", "thiết kế website", "chatbot AI", "tự động hóa quy trình"],
});

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="services-page-title">
        <div className="container">
          <Reveal as="header">
            <p className="eyebrow">Cà phê mở chuyện · Giải pháp số</p>
            <h1 id="services-page-title">Giải pháp gọn cho công việc đang vướng.</h1>
            <p>
              Mỗi dịch vụ có trang riêng, mức giá khởi điểm và phạm vi rõ ràng để bạn chọn đúng thứ cần làm trước.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section services-page-section" aria-label="Danh sách dịch vụ">
        <div className="container">
          <ServicesGrid />
        </div>
      </section>
    </>
  );
}
