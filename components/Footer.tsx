import Link from "next/link";
import Image from "next/image";
import { BRAND, NAV_LINKS } from "@/data/site";
import BrandMark from "./BrandMark";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <BrandMark href="" className="footer-brand-mark" />
          <p>{BRAND.tagline}</p>
          <p className="muted">
            Cà phê lưu động tại TP.HCM, kết nối khách hàng với các giải pháp số vừa sức và có người chịu trách nhiệm.
          </p>
        </div>

        <div>
          <h2>Khám phá</h2>
          <div className="footer-links">
            {NAV_LINKS.slice(1).map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2>Liên hệ</h2>
          <div className="footer-links">
            <a href={`tel:+84${BRAND.phone.slice(1)}`}>{BRAND.phoneDisplay}</a>
            <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
            <span>{BRAND.city}</span>
          </div>
        </div>

        <div className="footer-qr">
          <Image
            src="/assets/brand/qr-motngum.png"
            alt="Mã QR dẫn đến motngum.cafe"
            width={140}
            height={140}
          />
          <span>Quét một ngụm, mở một hướng.</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Một Ngụm.</span>
        <span>motngum.cafe</span>
      </div>
    </footer>
  );
}
