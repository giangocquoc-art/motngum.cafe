import Image from "next/image";
import StudioConfigurator from "@/components/StudioConfigurator";

export default function HomePage() {
  return <main className="studio-home">
    <section className="studio-hero">
      <div className="studio-hero-copy">
        <p className="studio-kicker"><span /> Digital studio · Website, domain & mail</p>
        <h1>Website của bạn bắt đầu bằng <em>một cái tên.</em></h1>
        <p>Tìm tên miền, chọn mẫu, xem giá. Phần kỹ thuật để Một Ngụm lo.</p>
        <a href="#ten-mien">Bắt đầu tìm tên <span>↓</span></a>
      </div>
      <div className="studio-hero-art" aria-hidden="true">
        <div className="studio-orbit"><span>DOMAIN</span><span>WEBSITE</span><span>MAIL PRO</span></div>
        <span className="studio-script">motngum.cafe</span>
        <Image src="/assets/hero-frames/cup-1.webp" alt="" width={860} height={860} priority />
      </div>
      <div className="studio-hero-note"><b>01</b><p>Chọn điều bạn muốn.<br />Chúng tôi nối phần còn lại.</p></div>
    </section>

    <StudioConfigurator />

    <section className="studio-process">
      <p>Nhẹ như một ngụm</p><h2>Bốn bước, một người chịu trách nhiệm.</h2>
      <ol><li><span>01</span><b>Tìm tên</b><p>Kiểm tra tên miền và giá dự kiến.</p></li><li><span>02</span><b>Chọn mẫu</b><p>Chốt một hướng hình ảnh phù hợp.</p></li><li><span>03</span><b>Nhận báo giá</b><p>Website, domain và Mail Pro thật rõ.</p></li><li><span>04</span><b>Nhắn Zalo</b><p>Một Ngụm tiếp nhận và triển khai.</p></li></ol>
    </section>

    <a className="studio-floating-zalo" href="https://zalo.me/0583799593" target="_blank" rel="noopener noreferrer" aria-label="Liên hệ Một Ngụm qua Zalo"><span>Z</span> Nhắn Một Ngụm</a>
  </main>;
}
