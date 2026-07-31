import Link from "next/link";
import { getServiceHref, SERVICES } from "@/data/site";
import Reveal from "./Reveal";
import ServiceGlyph from "./ServiceGlyph";

type Props = {
  limit?: number;
};

export default function ServicesGrid({ limit }: Props) {
  const items = typeof limit === "number" ? SERVICES.slice(0, limit) : SERVICES;

  return (
    <ul className="services-grid" role="list">
      {items.map((service, index) => (
        <Reveal as="li" className="service-card" key={service.slug} delay={Math.min(index * 0.05, 0.25)}>
          <article>
            <p className="service-topline">
              <span className="service-glyph" aria-hidden="true">
                <ServiceGlyph slug={service.slug} />
              </span>
              <span>{service.eyebrow}</span>
            </p>
            <h3>{service.shortTitle}</h3>
            <p>{service.summary}</p>
            <footer className="service-card-footer">
              <strong>{service.price}</strong>
              <Link href={getServiceHref(service.slug)} aria-label={`Xem ${service.title}`}>
                Xem chi tiết <span aria-hidden="true">→</span>
              </Link>
            </footer>
          </article>
        </Reveal>
      ))}
    </ul>
  );
}
