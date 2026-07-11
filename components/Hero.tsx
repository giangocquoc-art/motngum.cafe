import Link from "next/link";
import CupTurntable from "./CupTurntable";

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Cà phê lưu động tại TP.HCM</span>
          <h1>
            <span className="hero-title-primary">Một ngụm <strong>mở lời.</strong></span>
            <span className="hero-title-secondary">Một hướng <em>mở ra.</em></span>
          </h1>
          <p className="hero-lead">
            Một ly cà phê mở đầu cuộc trò chuyện. Quét QR, kể việc đang vướng và tìm bước đi vừa sức — trước khi chọn bất kỳ công cụ nào.
          </p>

          <div className="hero-actions">
            <Link className="button button-dark" href="/qr">
              Chọn vấn đề của tôi
            </Link>
            <Link className="hero-secondary-link" href="/menu">
              Xem menu <span>→</span>
            </Link>
          </div>

          <p className="hero-scroll-cue"><span aria-hidden="true">↓</span> Cuộn để khám phá Một Ngụm</p>
        </div>

        <div className="hero-cup-wrap">
          <div className="hero-halo" aria-hidden="true" />
          <div className="hero-cup">
            <CupTurntable />
          </div>
          <div className="hero-price-stamp" aria-label="Giá từ 12 nghìn đồng">
            <span>Từ</span>
            <strong>12K</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
