"use client";
import { FormEvent, useState } from "react";
const tlds = [".vn", ".com", ".com.vn", ".co", ".shop"];
export default function DomainSearch() {
  const [query, setQuery] = useState(""); const [searched, setSearched] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const clean = query.trim().toLowerCase().replace(/\s+/g, "-"); if (clean) setSearched(clean.replace(/\.[a-z.]+$/, "")); }
  return <div className="domain-search" id="domain-search"><form onSubmit={submit} className="domain-form"><label htmlFor="domain-query">Tên thương hiệu hoặc tên miền</label><div className="domain-input-row"><input id="domain-query" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ví dụ: thuybeauty" /><button type="submit">Tìm tên</button></div></form>{searched ? <div className="domain-results" aria-live="polite"><div className="result-heading"><span>Gợi ý cho</span><strong>{searched}</strong></div>{tlds.map((tld, index) => <div className="domain-result" key={tld}><span>{searched}{tld}</span><small>{index === 3 ? "Đã đăng ký" : "Còn trống"}</small><b>{index === 3 ? "" : `${index === 0 ? "490.000" : index === 1 ? "320.000" : "280.000"}đ/năm`}</b>{index !== 3 && <button type="button" onClick={() => document.getElementById("packages")?.scrollIntoView({ behavior: "smooth" })}>Chọn</button>}</div>)}<p className="domain-note">Đây là kết quả mẫu. Kết nối nhà đăng ký để kiểm tra tên miền thật.</p></div> : <p className="domain-hint">Tìm một cái tên dễ nhớ. Chúng tôi lo phần còn lại.</p>}</div>;
}
