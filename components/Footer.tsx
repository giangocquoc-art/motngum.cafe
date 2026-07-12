import Link from "next/link";
import Image from "next/image";
import { BRAND, NAV_LINKS } from "@/data/site";
import BrandMark from "./BrandMark";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <section className="footer-brand" aria-label="Giới thiệu Một Ngụm">
          <BrandMark href="" className="footer-brand-mark" />
          <p>{BRAND.tagline}</p>
          <p className="muted">
            Cà phê lưu động tại TP.HCM, kết nối khách hàng với các giải pháp số vừa sức và có người chịu trách nhiệm.
          </p>
        </section>

        <nav className="footer-nav footer-explore" aria-label="Khám phá trang">
          <h2>Khám phá</h2>
          <ul className="footer-links">
            {NAV_LINKS.slice(1).map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <section className="footer-contact" aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title">Liên hệ</h2>
          <address className="footer-links">
            <a href={`tel:+84${BRAND.phone.slice(1)}`}>{BRAND.phoneDisplay}</a>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <span>{BRAND.city}</span>
          </address>
        </section>

        <figure className="footer-qr" aria-label="Mã QR Một Ngụm">
          <Image
            src="/assets/brand/qr-motngum.png"
            alt="Mã QR dẫn đến motngum.cafe"
            width={140}
            height={140}
          />
          <figcaption>Quét một ngụm, mở một hướng.</figcaption>
        </figure>
      </div>

      <div className="container footer-bottom">
        <small>© {year} Một Ngụm.</small>
        <nav aria-label="Liên kết pháp lý">
          <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
          <Link href="/nguyen-tac-noi-dung">Nguyên tắc nội dung</Link>
        </nav>
        <small>motngum.cafe</small>
      </div>
    </footer>
  );
}
