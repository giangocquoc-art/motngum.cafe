import type { Metadata } from "next";
import LeadForm from "@/components/LeadForm";
import Reveal from "@/components/Reveal";
import { BRAND } from "@/data/site";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ Một Ngụm qua điện thoại, email hoặc form tư vấn.",
};

export default function ContactPage() {
  return (
    <section className="contact-page">
      <div className="container contact-grid">
        <Reveal className="contact-copy">
          <span className="eyebrow">Liên hệ Một Ngụm</span>
          <h1>Cà phê mở chuyện. Tụi mình cùng gỡ việc.</h1>
          <div className="contact-list">
            <a href={`tel:+84${BRAND.phone.slice(1)}`}>
              <span>Điện thoại</span>
              <strong>{BRAND.phoneDisplay}</strong>
            </a>
            <a href={`mailto:${BRAND.email}`}>
              <span>Email</span>
              <strong>{BRAND.email}</strong>
            </a>
            <div>
              <span>Khu vực</span>
              <strong>TP.HCM · Điểm bán lưu động</strong>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <LeadForm />
        </Reveal>
      </div>
    </section>
  );
}
