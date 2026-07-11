import Link from "next/link";

export default function NotFound() {
  return (
    <section className="not-found">
      <div>
        <span className="eyebrow">404</span>
        <h1>Trang này chưa được pha.</h1>
        <p>Quay về trang chủ hoặc chọn một dịch vụ khác.</p>
        <Link className="button button-dark" href="/">Về trang chủ</Link>
      </div>
    </section>
  );
}
