import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import CoffeeMenu from "@/components/CoffeeMenu";
import ServicesGrid from "@/components/ServicesGrid";
import Reveal from "@/components/Reveal";
import ProblemFinder from "@/components/ProblemFinder";
import LeadForm from "@/components/LeadForm";
import KnowledgeCards from "@/components/KnowledgeCards";
import { SEO_ARTICLES } from "@/data/seo-content";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section className="section key-check-home-section" aria-labelledby="key-check-home-title">
        <div className="container key-check-home-grid">
          <Reveal as="header" className="key-check-home-intro">
            <p className="eyebrow">VietAPI · tra cứu nhanh</p>
            <h2 id="key-check-home-title">Check API key ngay tại đây</h2>
            <p>
              Dán key dạng <code>sk-…</code> để xem trạng thái và số dư credit (đồng bộ portal VietAPI). Key không được
              lưu trên website.
            </p>
          </Reveal>
          <Reveal as="section" className="finder-shell key-check-home-shell" delay={0.06} aria-label="Check API key VietAPI">
            <ProblemFinder defaultMode="key" hideModeToggle compact />
          </Reveal>
        </div>
      </section>

      <section className="section journey-section" aria-labelledby="journey-title">
        <div className="container">
          <Reveal as="header" className="journey-heading">
            <p className="eyebrow">Một mô hình nhỏ, một ý tưởng rõ</p>
            <h2 id="journey-title">
              <span>Từ <em>một ngụm</em></span>
              <span>đến một hướng đi.</span>
            </h2>
            <p>Cà phê không phải lớp trang trí. Đó là điểm bắt đầu tự nhiên cho một cuộc trò chuyện rõ ràng và vừa sức.</p>
          </Reveal>
          <ol className="journey-steps" role="list">
            <Reveal as="li" className="journey-step">
              <span>01</span><strong>Uống một ngụm</strong><p>Chọn một ly cà phê thật, gọn và dễ bắt đầu.</p>
            </Reveal>
            <Reveal as="li" className="journey-step" delay={0.06}>
              <span>02</span><strong>Quét chiếc QR</strong><p>Mở đúng nơi cần xem, không phải tìm kiếm vòng quanh.</p>
            </Reveal>
            <Reveal as="li" className="journey-step" delay={0.12}>
              <span>03</span><strong>Kể việc đang vướng</strong><p>Chọn vấn đề trước, rồi mới cân nhắc công cụ phù hợp.</p>
            </Reveal>
          </ol>
        </div>
      </section>

      <section className="section finder-home-section" aria-labelledby="finder-home-title">
        <div className="container finder-home-grid">
          <Reveal as="header" className="finder-home-intro">
            <p className="eyebrow">Chọn vấn đề trước</p>
            <h2 id="finder-home-title">Bạn chưa cần biết tên giải pháp.</h2>
            <p>Chỉ cần chọn việc đang làm bạn mất thời gian nhất. Một Ngụm sẽ gợi ý điểm bắt đầu và nói rõ chi phí, phạm vi.</p>
            <figure className="qr-inline">
              <Image src="/assets/brand/qr-motngum.png" alt="QR dẫn tới trang chọn vấn đề Một Ngụm" width={132} height={132} loading="lazy" />
              <figcaption>
                <strong>motngum.cafe/qr</strong>
                <span>Quét một ngụm, mở một hướng.</span>
              </figcaption>
            </figure>
          </Reveal>
          <Reveal as="section" className="finder-shell" delay={0.08} aria-label="Công cụ chọn vấn đề">
            <ProblemFinder />
          </Reveal>
        </div>
      </section>

      <CoffeeMenu compact />

      <section className="section services-section" aria-labelledby="services-title">
        <div className="container">
          <Reveal as="header" className="section-heading split-heading">
            <div>
              <p className="eyebrow">Giải pháp phía sau chiếc ly</p>
              <h2 id="services-title">Giải pháp số vừa sức, làm đúng việc.</h2>
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

      <section className="section home-knowledge-section" aria-labelledby="home-knowledge-title">
        <div className="container">
          <Reveal as="header" className="section-heading split-heading">
            <div>
              <p className="eyebrow">Kiến thức dễ áp dụng</p>
              <h2 id="home-knowledge-title">Hiểu rõ trước khi bỏ tiền làm.</h2>
            </div>
            <p>
              Checklist thực tế cho chủ shop, người làm văn phòng và doanh nghiệp nhỏ đang cân nhắc website, AI hoặc marketing.
            </p>
          </Reveal>
          <KnowledgeCards articles={SEO_ARTICLES.slice(0, 3)} headingLevel={3} />
          <div className="section-actions">
            <Link href="/kien-thuc" className="button button-light">
              Xem tất cả hướng dẫn
            </Link>
          </div>
        </div>
      </section>

      <section className="section story-section story-section-closing" aria-labelledby="story-title">
        <div className="container story-grid">
          <Reveal as="figure" className="story-visual">
            <div className="story-line-art" aria-hidden="true"><Image src="/assets/brand/coffee-tree.svg" alt="" fill sizes="(max-width: 820px) 90vw, 520px" loading="lazy" /></div>
          </Reveal>
          <Reveal as="article" className="story-copy" delay={0.08}>
            <p className="eyebrow">Về Một Ngụm</p>
            <h2 id="story-title">Cà phê mở lời. Sự rõ ràng tạo niềm tin.</h2>
            <p>Một Ngụm bán cà phê lưu động tại TP.HCM và dùng chiếc QR trên ly để kết nối khách với những giải pháp số vừa sức.</p>
            <Link className="text-link" href="/ve-mot-ngum">Đọc câu chuyện Một Ngụm <span aria-hidden="true">→</span></Link>
          </Reveal>
        </div>
      </section>

      <section className="section consultation-section" aria-labelledby="consultation-title">
        <div className="container consultation-grid">
          <Reveal as="article" className="consultation-copy">
            <p className="eyebrow">Tư vấn marketing miễn phí</p>
            <h2 id="consultation-title">Kể vấn đề trước. Chọn dịch vụ sau.</h2>
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
          <Reveal as="section" delay={0.08} aria-label="Form tư vấn">
            <LeadForm defaultService="tu-van-marketing" />
          </Reveal>
        </div>
      </section>
    </>
  );
}
