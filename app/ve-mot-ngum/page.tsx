import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Về Một Ngụm",
  description: "Câu chuyện cà phê lưu động tại TP.HCM và chiếc QR kết nối khách hàng với giải pháp digital.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero about-hero">
        <div className="container about-hero-grid">
          <Reveal>
            <span className="eyebrow">Hai người · Một xe cà phê · Một chiếc QR</span>
            <h1>Một Ngụm bắt đầu từ một điểm chạm nhỏ.</h1>
            <p>
              Cà phê giá dễ tiếp cận giúp hai bạn gặp đúng nhóm khách văn phòng. Website phía sau chiếc QR
              giúp cuộc gặp ngắn trở thành một cuộc trò chuyện có ích hơn.
            </p>
          </Reveal>
          <Reveal className="about-hero-image" delay={0.08}>
            <Image src="/assets/hero-frames/cup-1.webp" alt="Ly cà phê Một Ngụm" width={680} height={680} loading="eager" />
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container story-timeline">
          <Reveal className="timeline-item">
            <span>01</span>
            <div><h2>Cà phê là sản phẩm thật.</h2><p>Khách mua vì ly ngon, giá hợp lý và tiện trên đường đi làm.</p></div>
          </Reveal>
          <Reveal className="timeline-item">
            <span>02</span>
            <div><h2>QR là lời mời.</h2><p>Khách quét để xem menu, chọn vấn đề hoặc nhận tư vấn marketing miễn phí.</p></div>
          </Reveal>
          <Reveal className="timeline-item">
            <span>03</span>
            <div><h2>Digital là giá trị phía sau.</h2><p>Website, chatbot, dữ liệu và tự động hóa được đề xuất khi thật sự phù hợp.</p></div>
          </Reveal>
        </div>
      </section>

      <section className="section about-cta-section">
        <div className="container note-panel">
          <h2>Một ngụm cà phê. Một hướng giải quyết.</h2>
          <p>Không phải vấn đề nào cũng cần phần mềm. Nhưng vấn đề nào cũng nên được nhìn cho rõ trước.</p>
          <Link href="/qr" className="button button-dark">Chọn vấn đề của tôi</Link>
        </div>
      </section>
    </>
  );
}
