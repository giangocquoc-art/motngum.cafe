"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return <header className="studio-header">
    <a className="skip-link" href="#main-content">Bỏ qua tới nội dung chính</a>
    <Link className="studio-logo" href="/" aria-label="Một Ngụm — Trang chủ"><b>mộtngụm</b><span>.cafe</span></Link>
    <button className="studio-menu" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>Menu</button>
    <nav className={open ? "is-open" : ""} aria-label="Điều hướng chính">
      <a href="/#ten-mien" onClick={() => setOpen(false)}>Tên miền</a>
      <a href="/#goi-website" onClick={() => setOpen(false)}>Gói website</a>
      <a href="/#mau-website" onClick={() => setOpen(false)}>Mẫu</a>
      <a href="/#bao-gia" onClick={() => setOpen(false)}>Báo giá</a>
      <a className="studio-header-zalo" href="https://zalo.me/0583799593" target="_blank" rel="noopener noreferrer">Zalo ↗</a>
    </nav>
  </header>;
}
