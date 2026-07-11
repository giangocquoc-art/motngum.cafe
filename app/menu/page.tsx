import type { Metadata } from "next";
import CoffeeMenu from "@/components/CoffeeMenu";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Menu cà phê",
  description: "Menu Một Ngụm gồm cà phê đen, cà phê sữa, bạc xỉu, cà phê sữa tươi, latte sữa hạt, cà phê sữa hạt và choco.",
};

export default function MenuPage() {
  return (
    <>
      <section className="page-hero page-hero-menu">
        <div className="container">
          <Reveal>
            <span className="eyebrow">Cà phê &amp; đồ uống</span>
            <h1>Menu gọn, dễ chọn, dễ nhớ.</h1>
            <p>
              Hình ly là trung tâm, giá size S/L rõ ràng và không có quá nhiều lựa chọn gây rối.
            </p>
          </Reveal>
        </div>
      </section>
      <CoffeeMenu showHeading={false} />
      <section className="section compact-note-section">
        <div className="container note-panel">
          <h2>Giá hiển thị theo nghìn đồng</h2>
          <p>Điểm bán và khung giờ có thể thay đổi theo ngày. Theo dõi Một Ngụm để xem lịch bán gần nhất.</p>
        </div>
      </section>
    </>
  );
}
