/**
 * Public model catalogue used by the /api showcase.
 *
 * The live catalogue is fetched from VietAPI at request time when
 * VIETAPI_API_KEY is configured.  The small fallback list keeps the page
 * useful during local development and when the upstream service is briefly
 * unavailable; it contains only public model identifiers, never credentials.
 */

export type VietApiModelFamily = "Claude" | "GPT" | "DeepSeek" | "GLM" | "Kimi" | "Grok" | "Khác";

export type VietApiModel = {
  id: string;
  label: string;
  family: VietApiModelFamily;
  owner: string | null;
  endpointTypes: string[];
  description: string;
  suggestedFor: string;
  image: string;
  accent: string;
};

export type VietApiModelRecord = {
  id?: unknown;
  owned_by?: unknown;
  object?: unknown;
  supported_endpoint_types?: unknown;
};

export const VIETAPI_BASE_URL = "https://api.vietapi.tech/v1";

export const FAMILY_META: Record<
  VietApiModelFamily,
  { description: string; suggestedFor: string; image: string; accent: string }
> = {
  Claude: {
    description: "Viết, phân tích và suy luận dài — hợp với tác vụ cần giọng điệu chắc tay.",
    suggestedFor: "Viết · phân tích · reasoning",
    image: "/assets/api/claude.svg",
    accent: "#8e5d41",
  },
  GPT: {
    description: "Lựa chọn đa dụng cho sản phẩm, code và các luồng cần đầu ra ổn định.",
    suggestedFor: "Đa dụng · code · tích hợp",
    image: "/assets/api/gpt.svg",
    accent: "#477864",
  },
  DeepSeek: {
    description: "Nhóm model thiên về code và phân tích kỹ thuật, có lựa chọn Flash và Pro.",
    suggestedFor: "Code · dữ liệu · kỹ thuật",
    image: "/assets/api/deepseek.svg",
    accent: "#4777a7",
  },
  GLM: {
    description: "Mô hình đa ngôn ngữ cho nội dung, tổng hợp và các tác vụ hội thoại.",
    suggestedFor: "Đa ngôn ngữ · nội dung",
    image: "/assets/api/glm.svg",
    accent: "#8763a5",
  },
  Kimi: {
    description: "Lựa chọn cho ngữ cảnh dài, đọc tài liệu và tổng hợp nhiều nguồn.",
    suggestedFor: "Tài liệu · ngữ cảnh dài",
    image: "/assets/api/kimi.svg",
    accent: "#af7049",
  },
  Grok: {
    description: "Hợp tác vụ sáng tạo, hội thoại và những ý tưởng cần nhịp phản hồi nhanh.",
    suggestedFor: "Sáng tạo · hội thoại",
    image: "/assets/api/grok.svg",
    accent: "#4d5969",
  },
  Khác: {
    description: "Model mới được VietAPI bổ sung; xem endpoint trước khi tích hợp vào sản phẩm.",
    suggestedFor: "Khám phá · thử nghiệm",
    image: "/assets/api/other.svg",
    accent: "#805038",
  },
};

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

export function getModelFamily(id: string): VietApiModelFamily {
  const value = id.toLowerCase();
  if (value.includes("claude")) return "Claude";
  if (value.startsWith("gpt-") || value.includes("gpt")) return "GPT";
  if (value.includes("deepseek")) return "DeepSeek";
  if (value.startsWith("glm")) return "GLM";
  if (value.includes("kimi")) return "Kimi";
  if (value.includes("grok")) return "Grok";
  return "Khác";
}

function humanizeModelId(id: string) {
  return id
    .replace(/^bedrock-/, "Bedrock · ")
    .replace(/^cc-max-/, "CC Max · ")
    .replace(/-/g, " · ")
    .replace(/\.(?=\d)/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .replace(/ · (\d)/g, " $1")
    .replace(/ · (Thinking)/i, " · Thinking");
}

function safeId(value: unknown) {
  if (typeof value !== "string") return "";
  const id = value.trim().slice(0, 120);
  return /^[A-Za-z0-9][A-Za-z0-9._:-]{1,119}$/.test(id) ? id : "";
}

function endpointList(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item === "openai" || item === "anthropic")
    .slice(0, 4);
}

/** Convert the upstream OpenAI-compatible shape into the UI-safe public shape. */
export function enrichModel(record: VietApiModelRecord): VietApiModel | null {
  const id = safeId(record.id);
  if (!id) return null;
  const family = getModelFamily(id);
  const familyMeta = FAMILY_META[family];
  const owner = typeof record.owned_by === "string" ? record.owned_by.trim().slice(0, 40) || null : null;
  return {
    id,
    label: humanizeModelId(id),
    family,
    owner,
    endpointTypes: endpointList(record.supported_endpoint_types),
    description: familyMeta.description,
    suggestedFor: familyMeta.suggestedFor,
    image: familyMeta.image,
    accent: familyMeta.accent,
  };
}

export const FALLBACK_MODELS = FALLBACK_RECORDS.map(enrichModel).filter(
  (model): model is VietApiModel => Boolean(model)
);

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
    .slice(0, 100);
}

export const MODEL_FAMILIES = ["Tất cả", "Claude", "GPT", "DeepSeek", "GLM", "Kimi", "Grok"] as const;
