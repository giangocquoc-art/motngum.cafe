import Reveal from "@/components/Reveal";
import PricingCatalog from "@/components/PricingCatalog";
import { FALLBACK_MODELS } from "@/data/vietapi-models";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bảng giá API và dịch vụ số",
  description: "Chọn API model OpenAI-compatible hoặc dịch vụ website, xử lý dữ liệu, tự động hóa và marketing của Một Ngụm.",
  path: "/bang-gia",
  keywords: ["bảng giá API", "Claude Opus 5 API", "giá xử lý dữ liệu", "dịch vụ digital"],
});

export default function PricingPage() {
  return (
    <>
      <section className="page-hero" aria-labelledby="pricing-title">
        <div className="container">
          <Reveal as="header">
            <p className="eyebrow">Một bảng giá · hai hướng bắt đầu</p>
            <h1 id="pricing-title">Chọn API hay chọn dịch vụ?</h1>
            <p>Đi vào đúng gian hàng bạn cần: model AI có giá theo token, hoặc giải pháp số được báo theo phạm vi công việc.</p>
          </Reveal>
        </div>
      </section>
      <section className="section pricing-section" aria-labelledby="pricing-table-title">
        <h2 id="pricing-table-title" className="visually-hidden">Bảng giá API và dịch vụ</h2>
        <div className="container">
          <PricingCatalog initialModels={FALLBACK_MODELS} />
        </div>
      </section>
    </>
  );
}
