import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <header>
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">Trang này chưa được pha.</h1>
        <p>Quay về trang chủ hoặc chọn một dịch vụ khác.</p>
      </header>
      <Link className="button button-dark" href="/">Về trang chủ</Link>
    </section>
  );
}
