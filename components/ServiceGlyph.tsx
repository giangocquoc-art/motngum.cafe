import type { ReactNode } from "react";

type Props = {
  slug: string;
  className?: string;
};

const baseProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function WebsiteIcon() {
  return (
    <>
      <rect x="3.75" y="5" width="16.5" height="13.25" rx="2.25" />
      <path d="M3.75 8.25H20.25" />
      <path d="M8 18.5H16" />
      <path d="M9.4 11.3H14.8" />
      <path d="M9.4 14.2H12.9" />
    </>
  );
}

function ChatbotIcon() {
  return (
    <>
      <path d="M7.5 6.75h9A3.25 3.25 0 0 1 19.75 10v2a3.25 3.25 0 0 1-3.25 3.25H12.6L8.4 18.9c-.53.35-1.4.07-1.4-.6v-2.05A3.25 3.25 0 0 1 4.25 13v-3A3.25 3.25 0 0 1 7.5 6.75Z" />
      <path d="M9 11.9h.01" />
      <path d="M12 11.9h.01" />
      <path d="M15 11.9h.01" />
    </>
  );
}

function DataIcon() {
  return (
    <>
      <rect x="4" y="5.5" width="16" height="13" rx="2.25" />
      <path d="M4 10h16" />
      <path d="M9.5 5.5v13" />
      <path d="M14.5 5.5v13" />
      <path d="M4 15.25h16" />
    </>
  );
}

function AutomationIcon() {
  return (
    <>
      <path d="M5.75 8.75A7.35 7.35 0 0 1 12 5.75c2.06 0 3.96.85 5.32 2.2" />
      <path d="M18.35 4.75v3.4h-3.4" />
      <path d="M18.25 15.25A7.35 7.35 0 0 1 12 18.25a7.4 7.4 0 0 1-5.45-2.35" />
      <path d="M5.65 19.25v-3.4h3.4" />
      <path d="M9.1 9.1l5.8 5.8" />
      <path d="M12.25 13.9h2.6v-2.6" />
    </>
  );
}

function ContentIcon() {
  return (
    <>
      <path d="M7.25 5.75h7.9l3.1 3.1v9.4a1.95 1.95 0 0 1-1.95 1.95H7.25a1.95 1.95 0 0 1-1.95-1.95V7.7a1.95 1.95 0 0 1 1.95-1.95Z" />
      <path d="M15.15 5.75v3.1h3.1" />
      <path d="M8.85 11.3h6.3" />
      <path d="M8.85 14.25h4.6" />
      <path d="M9.1 18.2l4.3-4.3 2.35.2-.2 2.35-4.3 4.3-2.15.1.1-2.65Z" />
    </>
  );
}

function InteractionIcon() {
  return (
    <>
      <path d="M8 6.75h8.25A2.5 2.5 0 0 1 18.75 9.25v3.1a2.5 2.5 0 0 1-2.5 2.5H12.4l-3.35 2.5.45-2.5H8A2.5 2.5 0 0 1 5.5 12.35v-3.1A2.5 2.5 0 0 1 8 6.75Z" />
      <path d="M9.6 10.8h.01" />
      <path d="M12 10.8h.01" />
      <path d="M14.4 10.8h.01" />
      <path d="M14.25 14.95l2.5 2.5" />
      <path d="M18 17.45h-1.25v-1.25" />
    </>
  );
}

function AdsIcon() {
  return (
    <>
      <path d="M5.75 13.25c4.2-.1 6.7-1.45 9.05-4.9l1.65 9.55c.12.7-.57 1.26-1.22 1l-4.1-1.64-2.2 2.4-1.25-3.55-1.93-.77c-.6-.24-.63-1.11-.05-1.26Z" />
      <path d="M14.9 8.3 19 6.15" />
      <path d="M15.55 10.4 19.2 9.7" />
      <path d="M6.4 13.1 3.9 16.3" />
      <path d="M11.8 16.95 11.2 20" />
    </>
  );
}

function TrainingIcon() {
  return (
    <>
      <path d="M4.75 9.1 12 5.25l7.25 3.85L12 13 4.75 9.1Z" />
      <path d="M7.25 10.45v3.15c0 1.2 2.15 2.7 4.75 2.7s4.75-1.5 4.75-2.7v-3.15" />
      <path d="M19.2 9.3v4.2" />
      <path d="M19.2 13.5c0 1.7-.75 2.8-2.05 3.6" />
      <path d="M15.95 18.9c.45-1.1.8-2.45.8-3.3" />
    </>
  );
}

function StrategyIcon() {
  return (
    <>
      <circle cx="12" cy="12" r="7.25" />
      <circle cx="12" cy="12" r="2.35" />
      <path d="M12 4.75V7" />
      <path d="M19.25 12H17" />
      <path d="M12 17v2.25" />
      <path d="M4.75 12H7" />
    </>
  );
}

const iconMap: Record<string, () => ReactNode> = {
  "thiet-ke-website": WebsiteIcon,
  "chatbot-ai": ChatbotIcon,
  "xu-ly-du-lieu": DataIcon,
  "tu-dong-hoa-quy-trinh": AutomationIcon,
  "ho-tro-dang-bai": ContentIcon,
  "ho-tro-tuong-tac": InteractionIcon,
  "quang-cao": AdsIcon,
  "dao-tao-ai-co-ban": TrainingIcon,
  "tu-van-marketing": StrategyIcon,
};

export default function ServiceGlyph({ slug, className = "" }: Props) {
  const Icon = iconMap[slug] ?? StrategyIcon;

  return (
    <svg className={className} {...baseProps}>
      <Icon />
    </svg>
  );
}
