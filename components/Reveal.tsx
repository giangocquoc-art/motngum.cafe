import type { ReactNode } from "react";

type Props = {
  children?: ReactNode;
  className?: string;
  delay?: number;
  id?: string;
};

/**
 * Static layout wrapper.
 *
 * The first version hid every section until IntersectionObserver/Framer Motion
 * ran in the browser. That made server-rendered content look late or blank on
 * slower phones. Keep the same component API so pages stay simple, but render
 * content immediately with no client-side dependency.
 */
export default function Reveal({ children, className = "", id }: Props) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}
