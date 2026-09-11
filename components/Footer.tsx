import Link from "next/link";

export default function Footer() {
  return <footer className="studio-footer">
    <div><Link className="studio-logo" href="/"><b>mộtngụm</b><span>.cafe</span></Link><p>Website, tên miền và email — gọn trong một lần làm.</p></div>
    <div><span>Bắt đầu</span><a href="/#ten-mien">Tìm tên miền</a><a href="/#mau-website">Chọn mẫu</a><a href="/#bao-gia">Xem báo giá</a></div>
    <div><span>Liên hệ</span><a href="https://zalo.me/0583799593" target="_blank" rel="noopener noreferrer">Zalo 0583 799 593</a><a href="mailto:cskh@motngum.cafe">cskh@motngum.cafe</a></div>
    <small>© {new Date().getFullYear()} Một Ngụm · TP.HCM</small>
  </footer>;
}
