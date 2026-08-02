"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { getServiceHref, SERVICES } from "@/data/site";

const problems = [
  { id: "website", label: "Tôi cần một website", service: "thiet-ke-website" },
  { id: "chatbot", label: "Tôi muốn có chatbot AI", service: "chatbot-ai" },
  { id: "manual", label: "Tôi đang làm quá nhiều việc thủ công", service: "tu-dong-hoa-quy-trinh" },
  { id: "data", label: "Dữ liệu của tôi đang rời rạc", service: "xu-ly-du-lieu" },
  { id: "content", label: "Tôi cần quản lý nội dung và đăng bài", service: "ho-tro-dang-bai" },
  { id: "interaction", label: "Tôi cần quản lý bình luận, tin nhắn và khách hàng tiềm năng", service: "ho-tro-tuong-tac" },
  { id: "ads", label: "Tôi muốn có thêm khách từ quảng cáo", service: "quang-cao" },
  { id: "learn", label: "Tôi muốn học cách dùng AI", service: "dao-tao-ai-co-ban" },
  { id: "unknown", label: "Tôi chưa biết nên bắt đầu từ đâu", service: "tu-van-marketing" },
] as const;

const goals = [
  "Có thêm khách hàng",
  "Tiết kiệm thời gian",
  "Làm thương hiệu chuyên nghiệp hơn",
  "Giảm việc lặp lại",
  "Quản lý dữ liệu rõ hơn",
  "Bắt đầu với ngân sách nhỏ",
];

type Mode = "research" | "guide" | "key";

type KeyCheckResult = {
  ok: boolean;
  valid: boolean;
  masked: string;
  status: string | null;
  primaryCredit: string | null;
  planCredit: string | null;
  dailyWalletCredit: string | null;
  paygCredit: string | null;
  expiresAt: string | null;
  error: string | null;
};

function maskKey(value: string) {
  const trimmed = value.trim();
  if (trimmed.length <= 10) return `${trimmed.slice(0, 3)}…`;
  return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}

function looksLikeApiKey(value: string) {
  return /^sk-[A-Za-z0-9_\-]{10,}$/i.test(value.trim()) || value.trim().startsWith("sk-");
}

function researchMatches(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const keywords: Record<string, string[]> = {
    "thiet-ke-website": ["website", "web", "landing", "trang"],
    "chatbot-ai": ["chatbot", "chat bot", "bot", "ai chat", "nhắn tin tự động"],
    "tu-dong-hoa-quy-trinh": ["tự động", "automation", "thủ công", "quy trình", "lặp lại"],
    "xu-ly-du-lieu": ["dữ liệu", "data", "excel", "sheet", "báo cáo"],
    "ho-tro-dang-bai": ["đăng bài", "content", "nội dung", "facebook", "social"],
    "ho-tro-tuong-tac": ["bình luận", "inbox", "tin nhắn", "tương tác", "lead"],
    "quang-cao": ["quảng cáo", "ads", "facebook ads", "tiktok", "traffic"],
    "dao-tao-ai-co-ban": ["học ai", "đào tạo", "prompt", "dạy", "training"],
    "tu-van-marketing": ["marketing", "tư vấn", "chiến lược", "bắt đầu", "không biết"],
  };

  return SERVICES.filter((service) => {
    const hay = [
      service.title,
      service.shortTitle,
      service.summary,
      service.eyebrow,
      ...(keywords[service.slug] ?? []),
    ]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).some((token) => token.length > 1 && hay.includes(token));
  }).slice(0, 3);
}

type ProblemFinderProps = {
  /** Tab mở mặc định khi vào component */
  defaultMode?: Mode;
  /** Ẩn thanh chuyển tab (dùng khi chỉ muốn nổi bật Check API key) */
  hideModeToggle?: boolean;
  /** Ẩn hẳn tab Check API key (khi đã có block check key riêng) */
  hideKeyMode?: boolean;
  /** Thu gọn min-height / tiêu đề cho block spotlight trang chủ */
  compact?: boolean;
};

export default function ProblemFinder({
  defaultMode = "research",
  hideModeToggle = false,
  hideKeyMode = false,
  compact = false,
}: ProblemFinderProps) {
  const instanceId = useId();
  const titleId = `${instanceId}-finder-title`;
  const researchInputId = `${instanceId}-finder-research-input`;
  const keyInputId = `${instanceId}-finder-key-input`;
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [research, setResearch] = useState("");
  const [problem, setProblem] = useState<(typeof problems)[number] | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [checking, setChecking] = useState(false);
  const [keyResult, setKeyResult] = useState<KeyCheckResult | null>(null);

  const service = useMemo(
    () => SERVICES.find((item) => item.slug === problem?.service),
    [problem]
  );

  const suggestions = useMemo(() => researchMatches(research), [research]);

  const onResearchChange = (value: string) => {
    setResearch(value);
    if (!hideKeyMode && looksLikeApiKey(value)) {
      setApiKey(value.trim());
      setMode("key");
      setKeyResult(null);
    }
  };

  const runKeyCheck = async () => {
    const value = apiKey.trim();

    if (!value.startsWith("sk-") || value.length < 20) {
      setKeyResult({
        ok: false,
        valid: false,
        masked: maskKey(value || "sk-"),
        status: null,
        primaryCredit: null,
        planCredit: null,
        dailyWalletCredit: null,
        paygCredit: null,
        expiresAt: null,
        error: "Key chưa đúng định dạng (cần bắt đầu bằng sk-).",
      });
      return;
    }

    setChecking(true);

    try {
      const response = await fetch("/api/vietapi/check-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: value }),
        cache: "no-store",
      });

      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        valid?: boolean;
        maskedKey?: string | null;
        status?: string | null;
        primaryCredit?: string | null;
        planCredit?: string | null;
        dailyWallet?: { remainCredit?: string | null } | null;
        paygCredit?: string | null;
        expiresAt?: string | null;
        error?: string | null;
      };

      const masked = data.maskedKey || maskKey(value);

      if (!response.ok || data.ok === false || data.valid === false) {
        setKeyResult({
          ok: false,
          valid: false,
          masked,
          status: data.status || "Không hợp lệ",
          primaryCredit: null,
          planCredit: null,
          dailyWalletCredit: null,
          paygCredit: null,
          expiresAt: null,
          error: data.error || "Không kiểm tra được key.",
        });
        return;
      }

      setKeyResult({
        ok: true,
        valid: true,
        masked,
        status: data.status || "Hoạt động",
        primaryCredit: data.primaryCredit || "—",
        planCredit: data.planCredit || "—",
        dailyWalletCredit: data.dailyWallet?.remainCredit || "—",
        paygCredit: data.paygCredit || "—",
        expiresAt: data.expiresAt || "—",
        error: null,
      });
    } catch {
      setKeyResult({
        ok: false,
        valid: false,
        masked: maskKey(value),
        status: null,
        primaryCredit: null,
        planCredit: null,
        dailyWalletCredit: null,
        paygCredit: null,
        expiresAt: null,
        error: "Không kết nối được. Thử lại sau.",
      });
    } finally {
      setChecking(false);
    }
  };

  if (problem && goal && service) {
    return (
      <section className="finder-result" aria-label="Gợi ý giải pháp">
        <p className="eyebrow">Gợi ý đầu tiên</p>
        <h2>{service.title}</h2>
        <p>{service.summary}</p>
        <dl>
          <div>
            <dt>Mục tiêu</dt>
            <dd>{goal}</dd>
          </div>
          <div>
            <dt>Chi phí</dt>
            <dd>{service.price}</dd>
          </div>
        </dl>
        <div className="finder-actions">
          <Link className="button button-dark" href={getServiceHref(service.slug)}>
            Xem giải pháp
          </Link>
          <Link className="button button-light" href={`/tu-van-marketing?service=${service.slug}`}>
            Nhận tư vấn miễn phí
          </Link>
        </div>
        <button
          className="reset-button"
          type="button"
          onClick={() => {
            setProblem(null);
            setGoal(null);
            setMode("research");
          }}
        >
          Chọn lại
        </button>
      </section>
    );
  }

  const progressValue = mode === "guide" ? (problem ? 100 : 50) : mode === "key" ? 100 : research ? 70 : 30;

  return (
    <section
      className={`problem-finder${compact ? " problem-finder-compact" : ""}`}
      aria-labelledby={titleId}
    >
      {!compact && (
        <div className="finder-progress">
          <span>{mode === "key" ? "API key" : mode === "guide" ? (problem ? "Bước 2/2" : "Bước 1/2") : "Research"}</span>
          <progress
            className="finder-progress-bar"
            value={progressValue}
            max={100}
            aria-label="Tiến trình tìm hướng giải quyết"
          >
            {progressValue}%
          </progress>
        </div>
      )}

      {!hideModeToggle && (
        <div className="finder-mode-toggle" role="group" aria-label="Chế độ tìm hướng">
          <button type="button" aria-pressed={mode === "research"} className={mode === "research" ? "is-active" : ""} onClick={() => setMode("research")}>
            Research
          </button>
          <button type="button" aria-pressed={mode === "guide"} className={mode === "guide" ? "is-active" : ""} onClick={() => setMode("guide")}>
            Chọn vấn đề
          </button>
          {!hideKeyMode && (
            <button type="button" aria-pressed={mode === "key"} className={mode === "key" ? "is-active" : ""} onClick={() => setMode("key")}>
              Check API key
            </button>
          )}
        </div>
      )}

      {mode === "research" && (
        <>
          <p className="eyebrow">Kể Một Ngụm nghe nhé</p>
          <h2 id={titleId}>Bạn đang cần làm rõ việc gì?</h2>
          <div className="finder-research">
            <label className="finder-research-label" htmlFor={researchInputId}>
              <span>Ô research</span>
              <input
                id={researchInputId}
                className="finder-research-input"
                value={research}
                onChange={(event) => onResearchChange(event.target.value)}
                placeholder="Ví dụ: chatbot trả lời khách, website bán hàng…"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
          </div>

          {suggestions.length > 0 && (
            <ul className="choice-grid" role="list" aria-label="Gợi ý theo research">
              {suggestions.map((item) => (
                <li key={item.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      const matched = problems.find((entry) => entry.service === item.slug) ?? problems[8];
                      setProblem(matched);
                      setMode("guide");
                    }}
                  >
                    <span>
                      {item.shortTitle}
                      <br />
                      <small className="finder-suggestion-price">{item.price}</small>
                    </span>
                    <b aria-hidden="true">→</b>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="finder-divider">hoặc chọn nhanh</div>
          <ul className="choice-grid" role="list">
            {problems.slice(0, 4).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setProblem(item);
                    setMode("guide");
                  }}
                >
                  <span>{item.label}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {mode === "guide" && !problem && (
        <>
          <p className="eyebrow">Kể Một Ngụm nghe nhé</p>
          <h2 id={titleId}>Việc gì đang làm bạn mất thời gian nhất?</h2>
          <ul className="choice-grid" role="list">
            {problems.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => setProblem(item)}>
                  <span>{item.label}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {mode === "guide" && problem && !goal && (
        <>
          <button className="back-button" type="button" onClick={() => setProblem(null)}>
            ← Quay lại
          </button>
          <p className="eyebrow">Mục tiêu bạn muốn ưu tiên</p>
          <h2 id={titleId}>Bạn muốn cải thiện điều gì trước?</h2>
          <ul className="choice-grid goal-grid" role="list">
            {goals.map((item) => (
              <li key={item}>
                <button type="button" onClick={() => setGoal(item)}>
                  <span>{item}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {mode === "key" && (
        <>
          {!compact && (
            <>
              <p className="eyebrow">Kiểm tra key</p>
              <h2 id={titleId}>Check API key</h2>
            </>
          )}
          {compact && <h2 id={titleId} className="visually-hidden">Check API key</h2>}
          <div className="finder-key-panel">
            <label className="finder-research-label" htmlFor={keyInputId}>
              <span>API key</span>
              <input
                id={keyInputId}
                className="finder-key-input"
                value={apiKey}
                onChange={(event) => {
                  setApiKey(event.target.value);
                  setKeyResult(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void runKeyCheck();
                  }
                }}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
              />
            </label>
            <div className="finder-key-actions">
              <button className="button button-dark" type="button" onClick={() => void runKeyCheck()} disabled={checking || !apiKey.trim()}>
                {checking ? "Đang kiểm tra..." : "Check key"}
              </button>
              {(apiKey || keyResult) && (
                <button
                  className="button button-light"
                  type="button"
                  onClick={() => {
                    setApiKey("");
                    setKeyResult(null);
                    if (!hideModeToggle) setMode("research");
                  }}
                >
                  {hideModeToggle ? "Xóa" : "Về research"}
                </button>
              )}
            </div>

            {keyResult && (
              <>
                <div
                  className={`finder-key-status ${keyResult.valid ? "is-ok" : "is-bad"}`}
                  role="status"
                >
                  <strong>{keyResult.valid ? "Key hợp lệ" : "Key không hợp lệ"}</strong>
                  <span>{keyResult.status || keyResult.error || "—"}</span>
                </div>

                {keyResult.valid && (
                  <dl className="finder-key-meta">
                    <div>
                      <dt>Key</dt>
                      <dd>{keyResult.masked}</dd>
                    </div>
                    <div>
                      <dt>Số dư</dt>
                      <dd>{keyResult.primaryCredit || "—"}</dd>
                    </div>
                    {keyResult.paygCredit && keyResult.paygCredit !== "—" && (
                      <div>
                        <dt>PAYG</dt>
                        <dd>{keyResult.paygCredit}</dd>
                      </div>
                    )}
                    {keyResult.dailyWalletCredit && keyResult.dailyWalletCredit !== "—" && (
                      <div>
                        <dt>Gói ngày</dt>
                        <dd>{keyResult.dailyWalletCredit}</dd>
                      </div>
                    )}
                    {keyResult.planCredit && keyResult.planCredit !== "—" && (
                      <div>
                        <dt>Gói tháng</dt>
                        <dd>{keyResult.planCredit}</dd>
                      </div>
                    )}
                    {keyResult.expiresAt && keyResult.expiresAt !== "—" && (
                      <div>
                        <dt>Hạn</dt>
                        <dd>{keyResult.expiresAt}</dd>
                      </div>
                    )}
                  </dl>
                )}

                {keyResult.error && <p className="finder-key-error">{keyResult.error}</p>}
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
