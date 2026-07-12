import CoffeeMenu from "@/components/CoffeeMenu";
import Reveal from "@/components/Reveal";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Menu cà phê",
  description: "Menu Một Ngụm gồm cà phê đen, cà phê sữa, bạc xỉu, cà phê sữa tươi, latte sữa hạt, cà phê sữa hạt và choco.",
  path: "/menu",
  keywords: ["menu cà phê Một Ngụm", "cà phê lưu động TP.HCM", "cà phê 12K", "cà phê mang đi"],
});

export default function MenuPage() {
  return (
    <>
      <section className="page-hero page-hero-menu" aria-labelledby="menu-page-title">
        <div className="container">
          <Reveal as="header">
            <p className="eyebrow">Cà phê & đồ uống</p>
            <h1 id="menu-page-title">Menu gọn, dễ chọn, dễ nhớ.</h1>
            <p>
              Hình ly là trung tâm, giá S/L rõ ràng và chỉ có những lựa chọn vừa đủ để bạn dễ chọn.
            </p>
          </Reveal>
        </div>
      </section>
      <CoffeeMenu showHeading={false} />
      <section className="section compact-note-section" aria-labelledby="menu-note-title">
        <div className="container note-panel">
          <header>
            <h2 id="menu-note-title">Giá hiển thị theo nghìn đồng</h2>
          </header>
          <p>Điểm bán và khung giờ có thể thay đổi theo ngày. Theo dõi Một Ngụm để xem lịch bán gần nhất.</p>
        </div>
      </section>
    </>
  );
}
