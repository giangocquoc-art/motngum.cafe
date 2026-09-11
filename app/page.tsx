import Image from "next/image";
import StudioConfigurator from "@/components/StudioConfigurator";

export default function HomePage() {
  return <main className="studio-home">
    <section className="studio-hero">
      <div className="studio-hero-copy">
        <p className="studio-kicker"><span /> Thiết kế website cho doanh nghiệp nhỏ</p>
        <h1>Tìm tên miền. Chọn website. <em>Xem giá ngay.</em></h1>
        <p>Kiểm tra tên miền, chọn gói và nhận tổng chi phí dự kiến ngay trên trang.</p>
        <a href="#ten-mien">Kiểm tra tên miền <span>↓</span></a>
      </div>
      <div className="studio-hero-art" aria-hidden="true">
        <div className="studio-orbit"><span>DOMAIN</span><span>WEBSITE</span><span>MAIL PRO</span></div>
        <span className="studio-script">motngum.cafe</span>
        <Image src="/assets/hero-frames/cup-1.webp" alt="" width={860} height={860} priority />
      </div>
      <div className="studio-hero-note"><b>01</b><p>Không cần tạo tài khoản.<br />Không thanh toán trực tuyến.</p></div>
    </section>

    <StudioConfigurator />

    <section className="studio-process">
      <p>Quy trình làm việc</p><h2>Từ lựa chọn đến triển khai.</h2>
      <ol><li><span>01</span><b>Kiểm tra tên miền</b><p>Xem tình trạng và phí dự kiến.</p></li><li><span>02</span><b>Chọn gói và mẫu</b><p>Chọn đúng nhu cầu và phong cách.</p></li><li><span>03</span><b>Xem tổng chi phí</b><p>Website, tên miền và Mail Pro.</p></li><li><span>04</span><b>Xác nhận qua Zalo</b><p>Một Ngụm chốt phạm vi trước khi làm.</p></li></ol>
    </section>

    <a className="studio-floating-zalo" href="https://zalo.me/0583799593" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ Một Ngụm qua Zalo"><span>Z</span> Nhắn Một Ngụm</a>
  </main>;
}
