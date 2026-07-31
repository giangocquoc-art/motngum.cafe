"use client";

import { useMemo, useState } from "react";
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
  validFormat: boolean;
  masked: string;
  latencyMs: number | null;
  note: string;
  logs: string[];
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

export default function ProblemFinder() {
  const [mode, setMode] = useState<Mode>("research");
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
    if (looksLikeApiKey(value)) {
      setApiKey(value.trim());
      setMode("key");
      setKeyResult(null);
    }
  };

  const runKeyCheck = async () => {
    const value = apiKey.trim();
    const logs = [
      `${new Date().toLocaleTimeString("vi-VN")} · Nhận key (không lưu server)`,
      `${new Date().toLocaleTimeString("vi-VN")} · Định dạng: ${value.startsWith("sk-") ? "có tiền tố sk-" : "không rõ provider"}`,
    ];

    if (!value.startsWith("sk-") || value.length < 20) {
      setKeyResult({
        validFormat: false,
        masked: maskKey(value || "sk-"),
        latencyMs: null,
        note: "Key chưa đủ điều kiện kiểm tra. Cần tiền tố sk- và độ dài hợp lệ.",
        logs: [...logs, `${new Date().toLocaleTimeString("vi-VN")} · Dừng: format không hợp lệ`],
      });
      return;
    }

    setChecking(true);
    const started = performance.now();
    // UI-only stub: không gửi key ra ngoài. Backend provider-specific sẽ gắn sau.
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const latencyMs = Math.round(performance.now() - started);

    logs.push(`${new Date().toLocaleTimeString("vi-VN")} · Kiểm tra format local: OK`);
    logs.push(`${new Date().toLocaleTimeString("vi-VN")} · Chưa gọi provider (tránh lộ key phía client)`);
    logs.push(`${new Date().toLocaleTimeString("vi-VN")} · Gợi ý: nối API route server-side + rate limit`);

    setKeyResult({
      validFormat: true,
      masked: maskKey(value),
      latencyMs,
      note: "Đã xác nhận format. Token còn lại / usage thật chỉ có khi nối endpoint của đúng nhà cung cấp (server-side).",
      logs,
    });
    setChecking(false);
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
    <section className="problem-finder" aria-labelledby="finder-title">
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

      <div className="finder-mode-toggle" role="tablist" aria-label="Chế độ tìm hướng">
        <button type="button" className={mode === "research" ? "is-active" : ""} onClick={() => setMode("research")}>
          Research
        </button>
        <button type="button" className={mode === "guide" ? "is-active" : ""} onClick={() => setMode("guide")}>
          Chọn vấn đề
        </button>
        <button type="button" className={mode === "key" ? "is-active" : ""} onClick={() => setMode("key")}>
          Check API key
        </button>
      </div>

      {mode === "research" && (
        <>
          <p className="eyebrow">Kể Một Ngụm nghe nhé</p>
          <h2 id="finder-title">Bạn đang cần làm rõ việc gì?</h2>
          <div className="finder-research">
            <label className="finder-research-label" htmlFor="finder-research-input">
              <span>Ô research</span>
              <input
                id="finder-research-input"
                className="finder-research-input"
                value={research}
                onChange={(event) => onResearchChange(event.target.value)}
                placeholder="Ví dụ: cần chatbot trả lời khách, website bán hàng, hoặc dán sk-… để check key"
                autoComplete="off"
                spellCheck={false}
              />
            </label>
            <p className="finder-research-hint">
              Mặc định là ô research. Nếu bạn dán key bắt đầu bằng <code>sk-</code>, giao diện check key sẽ mở riêng — key không được gửi đi trong bản UI này.
            </p>
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
                      <small style={{ color: "var(--muted)", fontWeight: 500 }}>{item.price}</small>
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
          <h2 id="finder-title">Việc gì đang làm bạn mất thời gian nhất?</h2>
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
          <h2 id="finder-title">Bạn muốn cải thiện điều gì trước?</h2>
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
          <p className="eyebrow">Kiểm tra key (UI)</p>
          <h2 id="finder-title">Check API key an toàn phía trình duyệt</h2>
          <div className="finder-key-panel">
            <h3>Key của bạn chỉ hiện khi có tiền tố sk-</h3>
            <label className="finder-research-label" htmlFor="finder-key-input">
              <span>API key</span>
              <input
                id="finder-key-input"
                className="finder-key-input"
                value={apiKey}
                onChange={(event) => {
                  setApiKey(event.target.value);
                  setKeyResult(null);
                }}
                placeholder="sk-..."
                autoComplete="off"
                spellCheck={false}
                inputMode="text"
              />
            </label>
            <p className="finder-research-hint">
              Bản này chỉ kiểm tra format + mô phỏng log. Không lưu key, không gửi key lên server. “Token còn lại” cần endpoint provider riêng (OpenAI thường không trả balance qua key chat).
            </p>
            <div className="finder-key-actions">
              <button className="button button-dark" type="button" onClick={runKeyCheck} disabled={checking || !apiKey.trim()}>
                {checking ? "Đang kiểm tra..." : "Check key"}
              </button>
              <button
                className="button button-light"
                type="button"
                onClick={() => {
                  setApiKey("");
                  setKeyResult(null);
                  setMode("research");
                }}
              >
                Về research
              </button>
            </div>

            {keyResult && (
              <>
                <dl className="finder-key-meta">
                  <div>
                    <dt>Key</dt>
                    <dd>{keyResult.masked}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{keyResult.validFormat ? "Hợp lệ (sk-)" : "Chưa hợp lệ"}</dd>
                  </div>
                  <div>
                    <dt>Latency (local)</dt>
                    <dd>{keyResult.latencyMs != null ? `${keyResult.latencyMs} ms` : "—"}</dd>
                  </div>
                  <div>
                    <dt>Token còn lại</dt>
                    <dd>Cần provider API</dd>
                  </div>
                </dl>
                <p className="finder-research-hint">{keyResult.note}</p>
                <pre className="finder-key-log" aria-label="Nhật ký kiểm tra key">
                  {keyResult.logs.join("\n")}
                </pre>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
