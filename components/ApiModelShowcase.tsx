"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  MODEL_FAMILIES,
  type VietApiModel,
  type VietApiModelFamily,
} from "@/data/vietapi-models";

type Props = { initialModels: VietApiModel[] };

type ModelsResponse = {
  ok?: boolean;
  models?: VietApiModel[];
  live?: boolean;
  syncedAt?: string;
  message?: string;
};

const FEATURED_IDS = [
  "gpt-5.6-sol",
  "claude-opus-5-thinking",
  "deepseek-v4-pro",
  "kimi-k2.6",
  "grok-4.5",
  "glm-5.2",
];

function sortModels(models: VietApiModel[]) {
  return [...models].sort((a, b) => {
    const featuredA = FEATURED_IDS.indexOf(a.id);
    const featuredB = FEATURED_IDS.indexOf(b.id);
    if (featuredA !== -1 || featuredB !== -1) {
      if (featuredA === -1) return 1;
      if (featuredB === -1) return -1;
      return featuredA - featuredB;
    }
    return a.family.localeCompare(b.family, "vi") || a.label.localeCompare(b.label, "vi");
  });
}

function formatSyncedAt(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
}

export default function ApiModelShowcase({ initialModels }: Props) {
  const [models, setModels] = useState(initialModels);
  const [family, setFamily] = useState<(typeof MODEL_FAMILIES)[number]>("Tất cả");
  const [query, setQuery] = useState("");
  const [live, setLive] = useState(false);
  const [syncMessage, setSyncMessage] = useState(
    "Danh mục dự phòng sẵn sàng — trang vẫn dùng được khi chưa cấu hình key server."
  );
  const [syncedAt, setSyncedAt] = useState<string>();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedBase, setCopiedBase] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/vietapi/models", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as ModelsResponse;
        if (!response.ok || !payload.ok || !Array.isArray(payload.models) || payload.models.length === 0) {
          throw new Error("models-unavailable");
        }
        return payload;
      })
      .then((payload) => {
        setModels(payload.models || initialModels);
        setLive(Boolean(payload.live));
        setSyncMessage(
          payload.message ||
            (payload.live
              ? "Đã đồng bộ từ VietAPI — danh sách phản ánh key đang cấu hình trên server."
              : "Đang hiển thị danh mục công khai.")
        );
        setSyncedAt(payload.syncedAt);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setLive(false);
          setSyncMessage("Chưa lấy được danh sách live; đang giữ danh mục model công khai để bạn tham khảo.");
        }
      });
    return () => controller.abort();
  }, [initialModels]);

  const visibleModels = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return sortModels(
      models.filter((model) => {
        const matchesFamily = family === "Tất cả" || model.family === family;
        const matchesQuery =
          !needle ||
          model.id.toLowerCase().includes(needle) ||
          model.label.toLowerCase().includes(needle) ||
          model.suggestedFor.toLowerCase().includes(needle);
        return matchesFamily && matchesQuery;
      })
    );
  }, [family, models, query]);

  const familyCounts = useMemo(() => {
    const counts = new Map<VietApiModelFamily, number>();
    models.forEach((model) => counts.set(model.family, (counts.get(model.family) || 0) + 1));
    return counts;
  }, [models]);

  async function copyText(value: string, kind: "id" | "base") {
    try {
      await navigator.clipboard.writeText(value);
      if (kind === "id") {
        setCopiedId(value);
        window.setTimeout(() => setCopiedId((current) => (current === value ? null : current)), 1500);
      } else {
        setCopiedBase(true);
        window.setTimeout(() => setCopiedBase(false), 1500);
      }
    } catch {
      // Clipboard can be unavailable in an insecure preview; leave the text selectable.
    }
  }

  return (
    <div className="api-showcase">
      <div className="api-showcase-status" role="status" aria-live="polite">
        <span className={`api-status-dot ${live ? "is-live" : ""}`} aria-hidden="true" />
        <span>{syncMessage}</span>
        {syncedAt ? <time dateTime={syncedAt}>Cập nhật {formatSyncedAt(syncedAt)}</time> : null}
      </div>

      <div className="api-toolbar">
        <label className="api-search">
          <span>Tìm model</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ví dụ: opus, gpt, code…"
            aria-label="Tìm model VietAPI"
          />
        </label>
        <div className="api-filters" role="group" aria-label="Lọc theo họ model">
          {MODEL_FAMILIES.map((item) => {
            const count = item === "Tất cả" ? models.length : familyCounts.get(item as VietApiModelFamily) || 0;
            return (
              <button
                key={item}
                type="button"
                className={family === item ? "is-active" : ""}
                aria-pressed={family === item}
                onClick={() => setFamily(item)}
              >
                {item}
                <span>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="api-results-heading">
        <p>
          {visibleModels.length} model{visibleModels.length === 1 ? "" : "s"} hiển thị
          {family !== "Tất cả" ? ` · ${family}` : ""}
        </p>
        <p className="api-results-hint">Bấm “Copy ID” để bắt đầu một request.</p>
      </div>

      {visibleModels.length ? (
        <ul className="api-model-grid" role="list">
          {visibleModels.map((model) => {
            const style = { "--model-accent": model.accent } as CSSProperties;
            const featured = FEATURED_IDS.includes(model.id);
            return (
              <li className={`api-model-card ${featured ? "is-featured" : ""}`} key={model.id} style={style}>
                <div className="api-model-card-art">
                  <Image src={model.image} alt="" loading="lazy" width={640} height={360} />
                  {featured ? <span className="api-featured-tag">Gợi ý bắt đầu</span> : null}
                </div>
                <div className="api-model-card-body">
                  <div className="api-model-meta">
                    <span className="api-model-family">{model.family}</span>
                    {model.owner ? <span>{model.owner}</span> : null}
                  </div>
                  <h3>{model.label}</h3>
                  <code className="api-model-id">{model.id}</code>
                  <p>{model.description}</p>
                  <div className="api-model-card-footer">
                    <span>{model.suggestedFor}</span>
                    <button type="button" onClick={() => copyText(model.id, "id")}>
                      {copiedId === model.id ? "Đã copy" : "Copy ID"}
                    </button>
                  </div>
                  <div className="api-endpoints" aria-label="Endpoint hỗ trợ">
                    {model.endpointTypes.length ? (
                      model.endpointTypes.map((endpoint) => <span key={endpoint}>{endpoint}</span>)
                    ) : (
                      <span>Kiểm tra endpoint</span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="api-empty-state">
          <p>Không có model khớp với “{query}”.</p>
          <button type="button" onClick={() => { setQuery(""); setFamily("Tất cả"); }}>
            Xóa bộ lọc
          </button>
        </div>
      )}

      <div className="api-base-url-card">
        <div>
          <span className="api-card-kicker">Base URL</span>
          <code>https://api.vietapi.tech/v1</code>
          <p>OpenAI-compatible: giữ nguyên SDK, chỉ thay base URL và API key phía server.</p>
        </div>
        <button type="button" className="button button-light" onClick={() => copyText("https://api.vietapi.tech/v1", "base")}>
          {copiedBase ? "Đã copy URL" : "Copy base URL"}
        </button>
      </div>
    </div>
  );
}
