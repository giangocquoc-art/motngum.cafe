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
    <section
      className={compact ? "section menu-section compact" : "section menu-section"}
      aria-labelledby={showHeading ? "menu-heading" : undefined}
    >
      <div className="container">
        {showHeading && (
          <Reveal as="div" className="section-heading">
            <p className="eyebrow">Menu Một Ngụm</p>
            <h2 id="menu-heading">Cà phê & đồ uống</h2>
            <p>
              Hình ly rõ ràng, giá S/L dễ đọc và những lựa chọn vừa đủ cho một buổi sáng gọn nhẹ.
            </p>
          </Reveal>
        )}

        <ul className="menu-grid" role="list">
          {items.map((item) => (
            <Reveal as="li" key={item.slug} className="menu-card">
              <article>
                <figure className="menu-image-wrap">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={190}
                    height={220}
                    className="menu-image"
                    loading="lazy"
                    sizes="(max-width: 560px) 46vw, (max-width: 820px) 28vw, 190px"
                  />
                </figure>
                <h3>{item.name}</h3>
                <p>{item.description}</p>

                {item.single ? (
                  <p className="single-price" aria-label={`Giá ${item.single} nghìn đồng`}>
                    <strong><data value={item.single}>{item.single}</data></strong>
                  </p>
                ) : (
                  <p
                    className="menu-prices"
                    aria-label={`Size S ${item.small} nghìn, size L ${item.large} nghìn`}
                  >
                    <span className="menu-size">
                      <span>S</span>
                      <strong><data value={item.small}>{item.small}</data></strong>
                    </span>
                    <i aria-hidden="true" />
                    <span className="menu-size">
                      <span>L</span>
                      <strong><data value={item.large}>{item.large}</data></strong>
                    </span>
                  </p>
                )}
              </article>
            </Reveal>
          ))}
        </ul>

        {compact && (
          <div className="section-actions">
            <Link href="/menu" className="text-link">
              Xem menu đầy đủ <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
