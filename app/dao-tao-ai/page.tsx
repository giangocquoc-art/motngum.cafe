import type { Metadata } from "next";
import Link from "next/link";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { getService } from "@/data/site";

export const metadata: Metadata = {
  title: "Đào tạo AI cơ bản",
  description: "Khóa sử dụng AI cơ bản giá 500.000đ dành cho cá nhân, dân văn phòng, chủ shop và đội nhóm nhỏ.",
};

export default function TrainingPage() {
  const service = getService("dao-tao-ai-co-ban")!;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Học để dùng được</span>
            <h1>Đào tạo AI cơ bản — 500.000đ.</h1>
            <p>{service.description}</p>
            <Link className="button button-dark" href="#dang-ky">Đăng ký buổi học</Link>
          </Reveal>
        </div>
      </section>
      <section className="section">
        <div className="container detail-grid">
          <Reveal>
            <span className="eyebrow">Nội dung</span>
            <h2>Không học theo kiểu xem demo.</h2>
            <ul className="numbered-list">
              {service.features.map((item, index) => (
                <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>
              ))}
            </ul>
          </Reveal>
          <Reveal id="dang-ky" delay={0.08}>
            <LeadForm defaultService="dao-tao-ai-co-ban" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
