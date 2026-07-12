import Link from "next/link";

type Props = {
  href?: string;
  compact?: boolean;
  className?: string;
};

function CoffeeBean() {
  return (
    <svg viewBox="0 0 20 28" aria-hidden="true" focusable="false">
      <path d="M10 1.5C4.8 3.8 2 8.5 2 14.4 2 21 5.1 25.3 10 26.5c4.9-1.2 8-5.5 8-12.1C18 8.5 15.2 3.8 10 1.5Z" fill="currentColor" />
      <path d="M11.9 3.8c-3 4.2-3.8 8.6-2.3 13.1.8 2.5 2.1 4.8 4 6.9" fill="none" stroke="var(--paper)" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

export default function BrandMark({ href = "/", compact = false, className = "" }: Props) {
  const content = (
    <span className={`brand-mark ${compact ? "is-compact" : ""} ${className}`.trim()}>
      <span className="brand-mark-name">MỘT NGỤM</span>
      <span className="brand-mark-rule" aria-hidden="true">
        <span className="brand-mark-rule-line" />
        <span className="brand-mark-rule-bean"><CoffeeBean /></span>
        <span className="brand-mark-rule-line" />
      </span>
      <span className="brand-mark-domain">motngum.cafe</span>
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="brand-mark-link" aria-label="Một Ngụm - Trang chủ">
      {content}
    </Link>
  );
}
