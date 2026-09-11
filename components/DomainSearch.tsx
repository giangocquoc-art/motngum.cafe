"use client";

import { FormEvent, useState } from "react";

type Domain = { name: string; status: "registered" | "unregistered" | "unknown"; source: "rdap" | "inet" | "vnnic"; lookupUrl?: string };
const labels = { registered: "Đã đăng ký", unregistered: "Chưa thấy đăng ký", unknown: "Cần xác minh" };

export default function DomainSearch() {
  const [query, setQuery] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const response = await fetch(`/api/domains?name=${encodeURIComponent(query)}`);
    const data = await response.json();
    setLoading(false);
    if (!response.ok) { setMessage(data.message); setDomains([]); return; }
    setSearched(query.trim());
    setDomains(data.domains);
  }

  return <div className="domain-search" id="domain-search">
    <form onSubmit={submit} className="domain-form">
      <label htmlFor="domain-query">Tên thương hiệu hoặc tên miền</label>
      <div className="domain-input-row">
        <input id="domain-query" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: thuybeauty" />
        <button type="submit" disabled={loading}>{loading ? "Đang kiểm tra…" : "Kiểm tra"}</button>
      </div>
    </form>
    {message && <p className="domain-error" role="alert">{message}</p>}
    {domains.length ? <div className="domain-results" aria-live="polite">
      <div className="result-heading"><span>Kết quả cho</span><strong>{searched}</strong></div>
      {domains.map((domain) => <div className="domain-result" key={domain.name}>
        <span>{domain.name}</span>
        <small>{labels[domain.status]}</small>
        <b>{domain.source === "inet" ? "iNET" : domain.source === "rdap" ? "RDAP" : ".VN"}</b>
        {domain.lookupUrl && <a href={domain.lookupUrl} target="_blank" rel="noreferrer">Tra VNNIC</a>}
      </div>)}
      <p className="domain-note">Kết quả quốc tế lấy từ RDAP. “Chưa thấy đăng ký” cần được nhà đăng ký xác nhận lại trước khi mua. Tên miền .VN sẽ chính xác tự động khi kết nối token iNET.</p>
    </div> : <p className="domain-hint">Nhập một cái tên để kiểm tra tình trạng đăng ký.</p>}
  </div>;
}
