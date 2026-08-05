export type VietApiModelFamily = "Claude" | "GPT" | "DeepSeek" | "GLM" | "Kimi" | "Grok" | "Khác";

export type VietApiModel = {
  id: string;
  label: string;
  family: VietApiModelFamily;
  owner: string | null;
  endpointTypes: string[];
  description: string;
  icon: string;
  iconAlt: string;
  price: string;
};

type VietApiModelRecord = {
  id?: unknown;
  owned_by?: unknown;
  supported_endpoint_types?: unknown;
};

export const VIETAPI_BASE_URL = "https://api.vietapi.tech/v1";
export const MOTNGUM_BASE_URL = "https://motngum.cafe/v1";

const FAMILY_META: Record<
  VietApiModelFamily,
  { description: string; icon: string; iconAlt: string }
> = {
  Claude: {
    description: "Viết, phân tích và lập trình với ngữ cảnh dài.",
    icon: "/assets/api/claude.svg",
    iconAlt: "Minh họa Claude Code với terminal và tia sáng suy luận",
  },
  GPT: {
    description: "Đa dụng cho sản phẩm, code và các luồng tích hợp.",
    icon: "/assets/api/gpt.svg",
    iconAlt: "Minh họa mạng kết nối cho nhóm GPT",
  },
  DeepSeek: {
    description: "Thiên về code, dữ liệu và phân tích kỹ thuật.",
    icon: "/assets/api/deepseek.svg",
    iconAlt: "Minh họa luồng code và dữ liệu của DeepSeek",
  },
  GLM: {
    description: "Hội thoại và nội dung đa ngôn ngữ.",
    icon: "/assets/api/glm.svg",
    iconAlt: "Minh họa hội thoại đa ngôn ngữ của GLM",
  },
  Kimi: {
    description: "Đọc tài liệu và tổng hợp với ngữ cảnh dài.",
    icon: "/assets/api/kimi.svg",
    iconAlt: "Minh họa các lớp tài liệu của Kimi",
  },
  Grok: {
    description: "Ý tưởng sáng tạo, hội thoại và phản hồi nhanh.",
    icon: "/assets/api/grok.svg",
    iconAlt: "Minh họa tia sáng ý tưởng của Grok",
  },
  Khác: {
    description: "Model mới được bổ sung.",
    icon: "/assets/api/other.svg",
    iconAlt: "Minh họa khám phá model mới",
  },
};

// Snapshot kiểm tra được từ VietAPI ngày 05/08/2026. Danh sách live sẽ thay thế
// snapshot này khi VIETAPI_API_KEY được cấu hình trên server.
const FALLBACK_RECORDS: VietApiModelRecord[] = [
  { id: "claude-fable-5", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "bedrock-claude-fable-5", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "cc-max-claude-opus-4-7", owned_by: "custom", supported_endpoint_types: [] },
  { id: "cc-max-claude-opus-4-8", owned_by: "custom", supported_endpoint_types: [] },
  { id: "cc-max-claude-opus-5", owned_by: "custom", supported_endpoint_types: [] },
  { id: "cc-max-claude-sonnet-5", owned_by: "custom", supported_endpoint_types: [] },
  { id: "claude-opus-5", owned_by: "vertex-ai", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-5-thinking", owned_by: "vertex-ai", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.8", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.8-thinking", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.7", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.7-thinking", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.6", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-opus-4.6-thinking", owned_by: "custom", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "claude-sonnet-5", owned_by: "vertex-ai", supported_endpoint_types: ["anthropic", "openai"] },
  { id: "gpt-5.6-sol", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "gpt-5.6-terra", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "gpt-5.6-luna", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "gpt-5.5", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "gpt-5.5-high", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "gpt-5.5-xhigh", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "deepseek-v4-flash", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "deepseek-v4-pro", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "glm-5.2", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "kimi-k2.6", owned_by: "openai", supported_endpoint_types: ["openai"] },
  { id: "kimi-2.7", owned_by: "openai", supported_endpoint_types: ["openai"] },
  { id: "grok-4.3", owned_by: "custom", supported_endpoint_types: ["openai"] },
  { id: "grok-4.5", owned_by: "custom", supported_endpoint_types: ["openai"] },
];

export const MODEL_FAMILIES = ["Tất cả", "Claude", "GPT", "DeepSeek", "GLM", "Kimi", "Grok"] as const;

function safeId(value: unknown) {
  if (typeof value !== "string") return "";
  const id = value.trim().slice(0, 120);
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{1,119}$/.test(id) ? id : "";
}

function familyFor(id: string): VietApiModelFamily {
  const value = id.toLowerCase();
  if (value.includes("claude")) return "Claude";
  if (value.includes("gpt")) return "GPT";
  if (value.includes("deepseek")) return "DeepSeek";
  if (value.includes("glm")) return "GLM";
  if (value.includes("kimi")) return "Kimi";
  if (value.includes("grok")) return "Grok";
  return "Khác";
}

function endpointTypes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item === "openai" || item === "anthropic")
    .slice(0, 4);
}

function humanize(id: string) {
  return id
    .replace(/^bedrock-/, "Bedrock · ")
    .replace(/^cc-max-/, "CC Max · ")
    .replace(/-/g, " · ")
    .replace(/\.(?=\d)/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/ · (\d)/g, " $1")
    .replace(/ · (Thinking)/i, " · Thinking");
}

export function enrichModel(record: VietApiModelRecord): VietApiModel | null {
  const id = safeId(record.id);
  const endpoints = endpointTypes(record.supported_endpoint_types);
  // Only models that VietAPI currently advertises for OpenAI-compatible calls
  // are products in this catalogue. Unsupported/stale entries stay hidden.
  if (!id || !endpoints.includes("openai")) return null;

  const family = familyFor(id);
  const meta = FAMILY_META[family];
  const isClaudeOpus5 = /^claude-opus-5(?:$|-)/i.test(id);

  return {
    id,
    label: humanize(id),
    family,
    owner: typeof record.owned_by === "string" ? record.owned_by.trim().slice(0, 40) || null : null,
    endpointTypes: endpoints,
    description: meta.description,
    icon: meta.icon,
    iconAlt: meta.iconAlt,
    price: isClaudeOpus5 ? "4k / 1M token" : "2k / 1M token",
  };
}

export function normalizeModelRecords(value: unknown) {
  const records = Array.isArray(value)
    ? value
    : value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)
      ? (value as { data: unknown[] }).data
      : [];
  const seen = new Set<string>();

  return records
    .map((record) => (record && typeof record === "object" ? enrichModel(record as VietApiModelRecord) : null))
    .filter((model): model is VietApiModel => {
      if (!model || seen.has(model.id)) return false;
      seen.add(model.id);
      return true;
    })
    .sort((a, b) => a.family.localeCompare(b.family, "vi") || a.label.localeCompare(b.label, "vi"))
    .slice(0, 100);
}

export const FALLBACK_MODELS = normalizeModelRecords(FALLBACK_RECORDS);
