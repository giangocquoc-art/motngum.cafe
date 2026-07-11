import Link from "next/link";
import { SERVICES } from "@/data/site";
import Reveal from "./Reveal";

type Props = {
  limit?: number;
};

const glyphs: Record<string, string> = {
  "thiet-ke-website": "⌘",
  "chatbot-ai": "◌",
  "xu-ly-du-lieu": "▦",
  "tu-dong-hoa-quy-trinh": "↻",
  "ho-tro-dang-bai": "✎",
  "ho-tro-tuong-tac": "◎",
  "quang-cao": "↗",
  "dao-tao-ai-co-ban": "◇",
  "tu-van-marketing": "☕",
};

export default function ServicesGrid({ limit }: Props) {
  const items = typeof limit === "number" ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <div className="services-grid">
      {items.map((service, index) => (
        <Reveal className="service-card" key={service.slug} delay={Math.min(index * 0.05, 0.25)}>
          <div className="service-topline">
            <span className="service-glyph" aria-hidden="true">{glyphs[service.slug] ?? "•"}</span>
            <span>{service.eyebrow}</span>
          </div>
          <h3>{service.shortTitle}</h3>
          <p>{service.summary}</p>
          <div className="service-card-footer">
            <strong>{service.price}</strong>
            <Link href={`/dich-vu/${service.slug}`} aria-label={`Xem ${service.title}`}>
              Xem chi tiết →
            </Link>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
