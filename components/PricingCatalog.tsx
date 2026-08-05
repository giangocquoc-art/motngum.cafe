"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FALLBACK_MODELS, MODEL_FAMILIES, MOTNGUM_BASE_URL, type VietApiModel } from "@/data/vietapi-models";
import { getServiceHref } from "@/data/site";
import ServicesGrid from "@/components/ServicesGrid";

type Mode = "picker" | "api" | "services";

type Props = {
  initialModels: VietApiModel[];
};

const FEATURED_IDS = ["claude-opus-5", "gpt-5.6-sol", "deepseek-v4-pro", "kimi-k2.6", "grok-4.5"];

function sortModels(models: VietApiModel[]) {
  return [...models].sort((a, b) => {
    const aIndex = FEATURED_IDS.indexOf(a.id);
    const bIndex = FEATURED_IDS.indexOf(b.id);
    if (aIndex !== -1 || bIndex !== -1) {
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    }
    return a.family.localeCompare(b.family, "vi") || a.label.localeCompare(b.label, "vi");
  });
}

export default function PricingCatalog({ initialModels }: Props) {
  const [mode, setMode] = useState<Mode>("picker");
  const [models, setModels] = useState(initialModels);
  const [live, setLive] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Danh sách model đã được kiểm tra và lọc theo endpoint OpenAI.");

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category");
    if (category === "services") setMode("services");
    if (category === "api") setMode("api");

    const controller = new AbortController();
    fetch("/api/vietapi/models", { signal: controller.signal, headers: { Accept: "application/json" } })
      .then(async (response) => {
        const payload = (await response.json().catch(() => ({}))) as {
          models?: VietApiModel[];
          live?: boolean;
          message?: string;
        };
        if (!response.ok || !Array.isArray(payload.models) || payload.models.length === 0) {
          throw new Error("models-unavailable");
        }
        setModels(payload.models);
        setLive(Boolean(payload.live));
        setSyncMessage(payload.message || "Đã cập nhật danh sách model.");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setModels(initialModels.length ? initialModels : FALLBACK_MODELS);
          setLive(false);
          setSyncMessage("Đang hiển thị danh sách gần nhất; model không hỗ trợ OpenAI đã được ẩn.");
        }
      });

    return () => controller.abort();
  }, [initialModels]);

  const visibleModels = useMemo(() => sortModels(models), [models]);

  function choose(nextMode: Exclude<Mode, "picker">) {
    setMode(nextMode);
    window.history.replaceState(null, "", `/bang-gia?category=${nextMode}`);
  }

  return (
    <div className="pricing-catalog">
      <div className="pricing-choice-grid" aria-label="Chọn danh mục">
        <button
          type="button"
          className={`pricing-choice-card ${mode === "api" ? "is-selected" : ""}`}
          onClick={() => choose("api")}
          aria-pressed={mode === "api"}
        >
          <span className="pricing-choice-art">
            <Image src="/assets/api/claude.svg" alt="" width={640} height={360} priority />
          </span>
          <span className="pricing-choice-content">
            <span className="pricing-choice-kicker">01 · API</span>
            <strong>Model AI OpenAI-compatible</strong>
            <span>Chọn model như chọn món: rõ giá, rõ model ID, dùng ngay với base URL Một Ngụm.</span>
          </span>
          <span className="pricing-choice-arrow" aria-hidden="true">→</span>
        </button>

        <button
          type="button"
          className={`pricing-choice-card ${mode === "services" ? "is-selected" : ""}`}
          onClick={() => choose("services")}
          aria-pressed={mode === "services"}
        >
          <span className="pricing-choice-art">
            <Image src="/assets/pricing/data-processing.svg" alt="" width={640} height={360} priority />
          </span>
          <span className="pricing-choice-content">
            <span className="pricing-choice-kicker">02 · DỊCH VỤ</span>
            <strong>Website, dữ liệu và tự động hóa</strong>
            <span>Chọn đúng việc cần làm, xem giá khởi điểm và gửi yêu cầu theo phạm vi thật.</span>
          </span>
          <span className="pricing-choice-arrow" aria-hidden="true">→</span>
        </button>
      </div>

      {mode !== "picker" ? (
        <section id="pricing-main" className="pricing-panel" aria-labelledby="pricing-main-title">
          <header className="pricing-panel-header">
            <div>
              <p className="eyebrow">{mode === "api" ? "API storefront" : "Dịch vụ số"}</p>
              <h2 id="pricing-main-title">
                {mode === "api" ? "Chọn model, lấy đúng giá." : "Chọn việc cần làm trước."}
              </h2>
            </div>
            <button type="button" className="pricing-change-button" onClick={() => setMode("picker")}>
              Đổi danh mục
            </button>
          </header>

          {mode === "api" ? (
            <div className="api-store">
              <div className="api-store-status" role="status" aria-live="polite">
                <span className={`api-status-dot ${live ? "is-live" : ""}`} aria-hidden="true" />
                <span>{syncMessage}</span>
                <span>{visibleModels.length} model đang hiển thị</span>
              </div>

              <div className="api-store-filters" aria-label="Nhóm model">
                {MODEL_FAMILIES.map((family) => {
                  const count = family === "Tất cả" ? visibleModels.length : visibleModels.filter((model) => model.family === family).length;
                  return <span key={family}>{family} · {count}</span>;
                })}
              </div>

              <ul className="api-store-grid" role="list">
                {visibleModels.map((model) => (
                  <li className="api-store-card" key={model.id}>
                    <div className="api-store-art">
                      <Image src={model.icon} alt={model.iconAlt} width={640} height={360} loading="lazy" />
                    </div>
                    <div className="api-store-body">
                      <div className="api-store-meta">
                        <span>{model.family}</span>
                        {model.owner ? <small>{model.owner}</small> : null}
                      </div>
                      <h3>{model.label}</h3>
                      <code>{model.id}</code>
                      <p>{model.description}</p>
                      <div className="api-store-buy">
                        <strong>{model.price}</strong>
                        <Link href={`/tu-van-marketing?service=api-vietapi&model=${encodeURIComponent(model.id)}`}>
                          Lấy key <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="api-store-base-url">
                <div>
                  <span className="pricing-choice-kicker">BASE URL</span>
                  <code>{MOTNGUM_BASE_URL}</code>
                  <p>Dùng URL này trong OpenAI SDK; key luôn để ở server hoặc biến môi trường.</p>
                </div>
                <Link className="button button-dark" href="/tu-van-marketing?service=api-vietapi">Đăng ký API</Link>
              </div>
            </div>
          ) : (
            <div className="pricing-service-panel">
              <p className="pricing-panel-intro">Giá dưới đây là mức khởi điểm. Các hạng mục tùy chỉnh sẽ được chốt sau khi xem dữ liệu và phạm vi thực tế.</p>
              <ServicesGrid />
              <div className="pricing-service-note">
                <strong>Chưa biết chọn gì?</strong>
                <span>Gửi vấn đề, Một Ngụm sẽ gợi ý thứ tự ưu tiên trước khi báo giá.</span>
                <Link className="text-link" href={getServiceHref("tu-van-marketing")}>Tư vấn miễn phí →</Link>
              </div>
            </div>
          )}
        </section>
      ) : (
        <p className="pricing-picker-hint">Chọn một danh mục để mở bảng giá.</p>
      )}
    </div>
  );
}
