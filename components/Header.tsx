"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/data/site";
import BrandMark from "./BrandMark";

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 18);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="skip-link" href="#main-content">Bỏ qua tới nội dung chính</a>
      <div className="container header-inner">
        <Link
          href="/"
          className="header-home"
          aria-label="Một Ngụm — Trang chủ"
          onClick={() => setOpen(false)}
        >
          <BrandMark compact />
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? "Đóng menu" : "Mở menu"}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav id="primary-navigation" className={`primary-nav ${open ? "is-open" : ""}`} aria-label="Điều hướng chính">
          <ul className="nav-list">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <li key={link.href} className="nav-item">
                  <Link
                    href={link.href}
                    className={active ? "nav-link is-active" : "nav-link"}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link className="button button-dark nav-cta" href="/tu-van-marketing" onClick={() => setOpen(false)}>
            Tư vấn miễn phí
          </Link>
        </nav>
      </div>
    </header>
  );
}
