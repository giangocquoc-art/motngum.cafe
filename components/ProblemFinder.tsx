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
  ok: boolean;
  valid: boolean;
  validFormat: boolean;
  masked: string;
  status: string | null;
  active: boolean | null;
  displayName: string | null;
  group: string | null;
  primaryLabel: string | null;
  primaryCredit: string | null;
  planCredit: string | null;
  dailyWalletCredit: string | null;
  paygCredit: string | null;
  expiresAt: string | null;
  usedTodayCredit: string | null;
  latencyMs: number | null;
  note: string;
  error: string | null;
  portalUrl: string;
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

function nowLog(message: string) {
  return `${new Date().toLocaleTimeString("vi-VN")} · ${message}`;
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
      nowLog("Nhận key (không lưu DB, chỉ kiểm tra qua server Một Ngụm)"),
      nowLog(`Định dạng: ${value.startsWith("sk-") ? "có tiền tố sk-" : "không rõ provider"}`),
    ];

    if (!value.startsWith("sk-") || value.length < 20) {
      setKeyResult({
        ok: false,
        valid: false,
        validFormat: false,
        masked: maskKey(value || "sk-"),
        status: null,
        active: null,
        displayName: null,
        group: null,
        primaryLabel: null,
        primaryCredit: null,
        planCredit: null,
        dailyWalletCredit: null,
        paygCredit: null,
        expiresAt: null,
        usedTodayCredit: null,
        latencyMs: null,
        note: "Key chưa đủ điều kiện kiểm tra. Cần tiền tố sk- và độ dài hợp lệ.",
        error: "Format key chưa hợp lệ.",
        portalUrl: "https://vietapi.tech/login.html",
        logs: [...logs, nowLog("Dừng: format không hợp lệ")],
      });
      return;
    }

    setChecking(true);
    const started = performance.now();
    logs.push(nowLog("Gửi yêu cầu tới /api/vietapi/check-key"));
    logs.push(nowLog("Server sẽ hỏi portal VietAPI (login + usage)"));

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
        validFormat?: boolean;
        maskedKey?: string | null;
        status?: string | null;
        active?: boolean | null;
        displayName?: string | null;
        group?: string | null;
        primaryLabel?: string | null;
        primaryCredit?: string | null;
        planCredit?: string | null;
        dailyWallet?: { remainCredit?: string | null } | null;
        paygCredit?: string | null;
        expiresAt?: string | null;
        usedTodayCredit?: string | null;
        note?: string | null;
        error?: string | null;
        portalUrl?: string | null;
        latencyMs?: number | null;
      };

      const latencyMs = Math.round(performance.now() - started);
      const masked = data.maskedKey || maskKey(value);

      if (!response.ok || data.ok === false || data.valid === false) {
        logs.push(nowLog(`VietAPI trả lỗi HTTP ${response.status}`));
        logs.push(nowLog(data.error || "Không xác thực được key"));
        setKeyResult({
          ok: false,
          valid: false,
          validFormat: data.validFormat !== false,
          masked,
          status: data.status || "Không hợp lệ",
          active: false,
          displayName: data.displayName || null,
          group: data.group || null,
          primaryLabel: null,
          primaryCredit: null,
          planCredit: null,
          dailyWalletCredit: null,
          paygCredit: null,
          expiresAt: null,
          usedTodayCredit: null,
          latencyMs: data.latencyMs ?? latencyMs,
          note: "Key không hợp lệ, hết quyền, hoặc portal tạm thời không phản hồi.",
          error: data.error || "Không kiểm tra được key.",
          portalUrl: data.portalUrl || "https://vietapi.tech/login.html",
          logs,
        });
        return;
      }

      logs.push(nowLog("Xác thực thành công từ portal VietAPI"));
      logs.push(nowLog(`Trạng thái: ${data.status || "Hoạt động"}`));
      if (data.primaryCredit) logs.push(nowLog(`${data.primaryLabel || "Số dư"}: ${data.primaryCredit}`));

      setKeyResult({
        ok: true,
        valid: true,
        validFormat: true,
        masked,
        status: data.status || "Hoạt động",
        active: data.active ?? true,
        displayName: data.displayName || null,
        group: data.group || null,
        primaryLabel: data.primaryLabel || "Số dư chính",
        primaryCredit: data.primaryCredit || "—",
        planCredit: data.planCredit || "—",
        dailyWalletCredit: data.dailyWallet?.remainCredit || "—",
        paygCredit: data.paygCredit || "—",
        expiresAt: data.expiresAt || "—",
        usedTodayCredit: data.usedTodayCredit || null,
        latencyMs: data.latencyMs ?? latencyMs,
        note: data.note || "Số liệu lấy trực tiếp từ portal VietAPI.",
        error: null,
        portalUrl: data.portalUrl || "https://vietapi.tech/login.html",
        logs,
      });
    } catch {
      const latencyMs = Math.round(performance.now() - started);
      logs.push(nowLog("Lỗi mạng hoặc server không phản hồi"));
      setKeyResult({
        ok: false,
        valid: false,
        validFormat: true,
        masked: maskKey(value),
        status: null,
        active: null,
        displayName: null,
        group: null,
        primaryLabel: null,
        primaryCredit: null,
        planCredit: null,
        dailyWalletCredit: null,
        paygCredit: null,
        expiresAt: null,
        usedTodayCredit: null,
        latencyMs,
        note: "Không gọi được API check key trên server Một Ngụm.",
        error: "Lỗi kết nối. Thử lại sau.",
        portalUrl: "https://vietapi.tech/login.html",
        logs,
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
              Mặc định là ô research. Nếu bạn dán key bắt đầu bằng <code>sk-</code>, tab Check API key sẽ mở để tra cứu số dư VietAPI.
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
          <p className="eyebrow">Kiểm tra key VietAPI</p>
          <h2 id="finder-title">Check API key ngay trên Một Ngụm</h2>
          <div className="finder-key-panel">
            <h3>Dán key dạng sk-… để xem trạng thái và số dư</h3>
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
            <p className="finder-research-hint">
              Key chỉ gửi tới server Một Ngụm để hỏi portal VietAPI, không lưu DB. Số credit = quota token ÷ 600.000 (cùng công thức dashboard VietAPI).
            </p>
            <div className="finder-key-actions">
              <button className="button button-dark" type="button" onClick={() => void runKeyCheck()} disabled={checking || !apiKey.trim()}>
                {checking ? "Đang hỏi VietAPI..." : "Check key"}
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
                <div
                  className={`finder-key-status ${keyResult.valid ? "is-ok" : "is-bad"}`}
                  role="status"
                >
                  <strong>{keyResult.valid ? "Key hợp lệ" : "Key không hợp lệ"}</strong>
                  <span>{keyResult.status || keyResult.error || "—"}</span>
                </div>

                <dl className="finder-key-meta">
                  <div>
                    <dt>Key</dt>
                    <dd>{keyResult.masked}</dd>
                  </div>
                  <div>
                    <dt>Trạng thái</dt>
                    <dd>{keyResult.status || (keyResult.valid ? "Hoạt động" : "Không hợp lệ")}</dd>
                  </div>
                  <div>
                    <dt>{keyResult.primaryLabel || "Số dư chính"}</dt>
                    <dd>{keyResult.primaryCredit || "—"}</dd>
                  </div>
                  <div>
                    <dt>Ví PAYG</dt>
                    <dd>{keyResult.paygCredit || "—"}</dd>
                  </div>
                  <div>
                    <dt>Ví gói ngày</dt>
                    <dd>{keyResult.dailyWalletCredit || "—"}</dd>
                  </div>
                  <div>
                    <dt>Gói tháng (Plan)</dt>
                    <dd>{keyResult.planCredit || "—"}</dd>
                  </div>
                  <div>
                    <dt>Hạn</dt>
                    <dd>{keyResult.expiresAt || "—"}</dd>
                  </div>
                  <div>
                    <dt>Latency</dt>
                    <dd>{keyResult.latencyMs != null ? `${keyResult.latencyMs} ms` : "—"}</dd>
                  </div>
                  {keyResult.displayName && (
                    <div>
                      <dt>Tài khoản</dt>
                      <dd>{keyResult.displayName}</dd>
                    </div>
                  )}
                  {keyResult.group && (
                    <div>
                      <dt>Group</dt>
                      <dd>{keyResult.group}</dd>
                    </div>
                  )}
                </dl>

                {keyResult.error && <p className="finder-key-error">{keyResult.error}</p>}
                <p className="finder-research-hint">{keyResult.note}</p>

                <div className="finder-key-actions">
                  <a
                    className="button button-light"
                    href={keyResult.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Mở portal VietAPI
                  </a>
                </div>

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
