import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import CoffeeMenu from "@/components/CoffeeMenu";
import ServicesGrid from "@/components/ServicesGrid";
import Reveal from "@/components/Reveal";
import ProblemFinder from "@/components/ProblemFinder";
import LeadForm from "@/components/LeadForm";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="section journey-section">
        <div className="container">
          <Reveal className="journey-heading">
            <span className="eyebrow">Một mô hình nhỏ, một ý tưởng rõ</span>
            <h2>
              <span>Từ <em>một ngụm</em></span>
              <span>đến một hướng đi.</span>
            </h2>
            <p>Cà phê không phải lớp trang trí. Đó là điểm bắt đầu tự nhiên cho một cuộc trò chuyện rõ ràng và vừa sức.</p>
          </Reveal>
          <div className="journey-steps">
            <Reveal className="journey-step"><span>01</span><strong>Uống một ngụm</strong><p>Chọn một ly cà phê thật, gọn và dễ bắt đầu.</p></Reveal>
            <Reveal className="journey-step" delay={0.06}><span>02</span><strong>Quét chiếc QR</strong><p>Mở đúng điểm chạm, không cần tìm kiếm vòng quanh.</p></Reveal>
            <Reveal className="journey-step" delay={0.12}><span>03</span><strong>Kể việc đang vướng</strong><p>Chọn vấn đề trước, rồi mới cân nhắc công cụ phù hợp.</p></Reveal>
          </div>
        </div>
      </section>

      <section className="section finder-home-section">
        <div className="container finder-home-grid">
          <Reveal className="finder-home-intro">
            <span className="eyebrow">Chọn vấn đề trước</span>
            <h2>Bạn chưa cần biết tên giải pháp.</h2>
            <p>Chỉ cần chọn việc đang làm bạn mất thời gian nhất. Một Ngụm sẽ gợi ý điểm bắt đầu và nói rõ chi phí, phạm vi.</p>
            <div className="qr-inline">
              <Image src="/assets/brand/qr-motngum.png" alt="QR dẫn tới trang chọn vấn đề Một Ngụm" width={132} height={132} loading="lazy" />
              <div><strong>motngum.cafe/qr</strong><span>Quét một ngụm, mở một hướng.</span></div>
            </div>
          </Reveal>
          <Reveal className="finder-shell" delay={0.08}><ProblemFinder /></Reveal>
        </div>
      </section>

      <CoffeeMenu compact />

      <section className="section services-section">
        <div className="container">
          <Reveal className="section-heading split-heading">
            <div>
              <span className="eyebrow">Giải pháp phía sau chiếc ly</span>
              <h2>Giải pháp số vừa sức, làm đúng việc.</h2>
            </div>
            <p>
              Bắt đầu từ việc cần nhất, đo hiệu quả rồi mới mở rộng — vừa ngân sách và dễ vận hành.
            </p>
          </Reveal>
          <ServicesGrid limit={6} />
          <div className="section-actions">
            <Link href="/dich-vu" className="button button-light">
              Xem tất cả dịch vụ
            </Link>
          </div>
        </div>
      </section>

      <section className="section story-section story-section-closing">
        <div className="container story-grid">
          <Reveal className="story-visual">
            <div className="story-line-art" aria-hidden="true"><Image src="/assets/brand/coffee-tree.svg" alt="" fill sizes="(max-width: 820px) 90vw, 520px" loading="lazy" /></div>
          </Reveal>
          <Reveal className="story-copy" delay={0.08}>
            <span className="eyebrow">Về Một Ngụm</span>
            <h2>Cà phê mở lời. Sự rõ ràng tạo niềm tin.</h2>
            <p>Một Ngụm bán cà phê lưu động tại TP.HCM và dùng chiếc QR trên ly để kết nối khách với những giải pháp số vừa sức.</p>
            <Link className="text-link" href="/ve-mot-ngum">Đọc câu chuyện Một Ngụm <span>→</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="section consultation-section">
        <div className="container consultation-grid">
          <Reveal className="consultation-copy">
            <span className="eyebrow">Tư vấn marketing miễn phí</span>
            <h2>Kể vấn đề trước. Chọn dịch vụ sau.</h2>
            <p>
              Bạn có thể chưa biết mình cần website, quảng cáo hay tự động hóa. Một Ngụm bắt đầu bằng
              việc làm rõ vấn đề, thứ tự ưu tiên và ngân sách phù hợp.
            </p>
            <ul className="check-list">
              <li>Không bắt buộc mua dịch vụ</li>
              <li>Không hứa doanh thu chắc chắn</li>
              <li>Ưu tiên việc có thể làm gọn trước</li>
            </ul>
          </Reveal>
          <Reveal delay={0.08}>
            <LeadForm defaultService="tu-van-marketing" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
