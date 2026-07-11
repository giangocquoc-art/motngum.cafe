import Image from "next/image";
import Link from "next/link";
import { MENU_ITEMS } from "@/data/site";
import Reveal from "./Reveal";

type Props = {
  compact?: boolean;
  showHeading?: boolean;
};

export default function CoffeeMenu({ compact = false, showHeading = true }: Props) {
  const items = compact ? MENU_ITEMS.slice(0, 4) : MENU_ITEMS;

  return (
    <section className={compact ? "section menu-section compact" : "section menu-section"}>
      <div className="container">
        {showHeading && (
          <Reveal className="section-heading">
            <span className="eyebrow">Menu Một Ngụm</span>
            <h2>Cà phê &amp; đồ uống</h2>
            <p>
              Hình ly rõ ràng, giá size S/L dễ đọc và những lựa chọn vừa đủ cho một buổi sáng gọn nhẹ.
            </p>
          </Reveal>
        )}

        <div className="menu-grid">
          {items.map((item, index) => (
            <Reveal key={item.slug} className="menu-card">
              <div className="menu-image-wrap">
                <Image
                  src={item.image}
                  alt={item.name}
                  width={190}
                  height={220}
                  className="menu-image"
                  loading="lazy"
                  sizes="(max-width: 560px) 46vw, (max-width: 820px) 28vw, 190px"
                />
              </div>
              <h3>{item.name}</h3>
              <p>{item.description}</p>

              {item.single ? (
                <div className="single-price" aria-label={`Giá ${item.single} nghìn đồng`}>
                  <strong>{item.single}</strong>
                </div>
              ) : (
                <div className="menu-prices" aria-label={`Size S ${item.small} nghìn, size L ${item.large} nghìn`}>
                  <div>
                    <span>S</span>
                    <strong>{item.small}</strong>
                  </div>
                  <i aria-hidden="true" />
                  <div>
                    <span>L</span>
                    <strong>{item.large}</strong>
                  </div>
                </div>
              )}
            </Reveal>
          ))}
        </div>

        {compact && (
          <div className="section-actions">
            <Link href="/menu" className="text-link">
              Xem menu đầy đủ <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
