import Link from "next/link";
import CupTurntable from "./CupTurntable";

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Cà phê lưu động tại TP.HCM</p>
          <h1 id="hero-title">
            <span className="hero-title-primary">Một ngụm <strong>mở lời.</strong></span>
            <span className="hero-title-secondary">Một hướng <em>mở ra.</em></span>
          </h1>
          <p className="hero-lead">
            Một ly cà phê mở đầu cuộc trò chuyện. Quét QR, kể việc đang vướng và tìm một bước đi vừa sức — trước khi chọn công cụ.
          </p>

          <div className="hero-actions">
            <Link className="button button-dark" href="/qr">
              Chọn vấn đề của tôi
            </Link>
            <Link className="hero-secondary-link" href="/menu">
              Xem menu <span aria-hidden="true">→</span>
            </Link>
          </div>

          <p className="hero-scroll-cue"><span aria-hidden="true">↓</span> Cuộn để khám phá Một Ngụm</p>
        </div>

        <figure className="hero-cup-wrap" aria-label="Ly cà phê Một Ngụm">
          <div className="hero-halo" aria-hidden="true" />
          <div className="hero-cup">
            <CupTurntable />
          </div>
          <p className="hero-price-stamp" aria-label="Giá từ 12 nghìn đồng">
            <span>Từ</span>
            <strong>12K</strong>
          </p>
        </figure>
      </div>
    </section>
  );
}
