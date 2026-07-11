import type { Metadata } from "next";
import ServicesGrid from "@/components/ServicesGrid";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Dịch vụ digital",
  description: "Website, chatbot AI, xử lý dữ liệu, tự động hóa, hỗ trợ nội dung, quảng cáo và đào tạo AI.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Cà phê mở chuyện · Digital giải quyết</span>
            <h1>Giải pháp gọn cho công việc đang vướng.</h1>
            <p>
              Mỗi dịch vụ có trang riêng, mức giá khởi điểm và phạm vi rõ ràng để bạn chọn đúng thứ cần làm trước.
            </p>
          </Reveal>
        </div>
      </section>
      <section className="section services-page-section">
        <div className="container">
          <ServicesGrid />
        </div>
      </section>
    </>
  );
}
