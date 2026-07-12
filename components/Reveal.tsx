import type { ReactNode, ElementType } from "react";

type Props = {
  children?: ReactNode;
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
  role?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
};

/**
 * Static layout wrapper.
 *
 * The first version hid every section until IntersectionObserver/Framer Motion
 * ran in the browser. That made server-rendered content look late or blank on
 * slower phones. Keep the same component API so pages stay simple, but render
 * content immediately with no client-side dependency.
 *
 * Uses the `as` prop to render a semantic HTML element (article, li, section,
 * figure, header, footer…) instead of a meaningless div, improving GEO and
 * AI-search readability.
 */
export default function Reveal({
  children,
  as,
  className = "",
  id,
  role,
  "aria-labelledby": ariaLabelledby,
  "aria-label": ariaLabel,
}: Props) {
  const Tag = as ?? "div";
  return (
    <Tag
      id={id}
      className={className}
      role={role}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
    >
      {children}
    </Tag>
  );
}
