"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Domain = { name: string; status: "registered" | "unregistered" | "unknown"; retailPrice: number; source: string; lookupUrl?: string };

const defaultPackages = [
  { id: "landing", name: "Landing Page", price: 1_888_000, mail: "1 Mail Pro · 200MB", description: "Một trang giới thiệu dịch vụ, sản phẩm hoặc chiến dịch.", features: ["Hiển thị tốt trên điện thoại", "SEO cơ bản", "Form liên hệ", "Hỗ trợ đưa website lên mạng"] },
  { id: "business", name: "Website Doanh Nghiệp", price: 3_888_000, mail: "5 Mail Pro · 200MB/mail", description: "Website đầy đủ để giới thiệu doanh nghiệp và nhận liên hệ.", features: ["Tự cập nhật nội dung", "SEO cơ bản", "Sitemap và Analytics", "Hỗ trợ đưa website lên mạng"], featured: true },
  { id: "commerce", name: "Website Bán Hàng", price: 9_888_000, mail: "5 Mail Pro · 200MB/mail", description: "Trưng bày sản phẩm, nhận đơn và quản lý bán hàng.", features: ["Danh mục sản phẩm", "Giỏ hàng", "Quản lý đơn", "Hướng dẫn sử dụng"] },
  { id: "custom", name: "Web App Theo Yêu Cầu", price: 10_000_000, mail: "Tùy phạm vi", description: "Dành cho quy trình hoặc tính năng riêng ngoài website thông thường.", features: ["Phân tích yêu cầu", "Thiết kế riêng", "Tích hợp theo nhu cầu", "Báo giá theo phạm vi"] },
];

const defaultTemplates = [
  { id: "atelier", name: "Atelier Beauty", category: "Spa / Beauty", image: "/templates/atelier-beauty.svg", note: "Mềm mại, tinh tế, ưu tiên đặt lịch." },
  { id: "north", name: "North & Co.", category: "Doanh nghiệp", image: "/templates/north-corporate.svg", note: "Rõ ràng, đáng tin, dành cho dịch vụ chuyên môn." },
  { id: "harbor", name: "Harbor Stay", category: "Khách sạn", image: "/templates/harbor-stay.svg", note: "Giàu không khí, phù hợp lưu trú và trải nghiệm." },
  { id: "oak", name: "Little Oak", category: "Giáo dục", image: "/templates/little-oak.svg", note: "Thân thiện, sinh động, dễ trình bày chương trình." },
  { id: "field", name: "Field & Table", category: "F&B", image: "/templates/field-table.svg", note: "Ấm, giàu chất liệu, kể chuyện sản phẩm tốt." },
  { id: "mono", name: "Minh Anh", category: "Portfolio", image: "/templates/mono-portfolio.svg", note: "Biên tập mạnh, dành cho hồ sơ sáng tạo." },
];

const money = (value: number) => `${value.toLocaleString("vi-VN")}đ`;

export default function StudioConfigurator() {
  const [query, setQuery] = useState("");
  const [domains, setDomains] = useState<Domain[]>([]);
  const [suggestions, setSuggestions] = useState<Domain[]>([]);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [packageId, setPackageId] = useState("business");
  const [templateId, setTemplateId] = useState("north");
  const [category, setCategory] = useState("Tất cả");
  const [quoteId, setQuoteId] = useState("MN-2026");
  const [copied, setCopied] = useState(false);
  const [packages, setPackages] = useState(defaultPackages);
  const [templates, setTemplates] = useState(defaultTemplates);

  useEffect(() => setQuoteId(`MN-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`), []);
  useEffect(() => {
    fetch("/api/catalog")
      .then((response) => response.json())
      .then((payload) => {
        const remotePackages = payload.catalog?.packages;
        const remoteTemplates = payload.catalog?.templates;
        if (Array.isArray(remotePackages) && remotePackages.length > 0) {
          setPackages(remotePackages.map((item: Record<string, unknown>) => ({
            id: String(item.slug ?? item.id), name: String(item.name ?? ""), price: Number(item.price ?? 0),
            mail: String(item.mail ?? "Theo phạm vi"), description: String(item.description ?? ""),
            features: Array.isArray(item.features) ? item.features.map(String) : [],
          })));
        }
        if (Array.isArray(remoteTemplates) && remoteTemplates.length > 0) {
          setTemplates(remoteTemplates.map((item: Record<string, unknown>) => ({
            id: String(item.slug ?? item.id), name: String(item.name ?? ""), category: String(item.category ?? "Khác"),
            image: String(item.image ?? "/templates/north-corporate.svg"), note: String(item.description ?? ""),
          })));
        }
      })
      .catch(() => undefined);
  }, []);
  const selectedPackage = packages.find((item) => item.id === packageId) ?? packages[1];
  const selectedTemplate = templates.find((item) => item.id === templateId) ?? templates[1];
  const categories = ["Tất cả", ...Array.from(new Set(templates.map((item) => item.category)))];
  const shownTemplates = category === "Tất cả" ? templates : templates.filter((item) => item.category === category);
  const total = selectedPackage.price + (domain?.retailPrice ?? 0);

  const quoteText = useMemo(() => [
    `Mình quan tâm gói ${selectedPackage.name}.`,
    `Mẫu: ${selectedTemplate.name}`,
    `Domain: ${domain?.name ?? "Chưa chọn"}`,
    `Giá domain: ${domain ? money(domain.retailPrice) : "Chưa tính"}`,
    `Mail Pro: ${selectedPackage.mail} (đã bao gồm)`,
    `Tổng dự kiến: ${money(total)}`,
    `Mã: ${quoteId}`,
  ].join("\n"), [domain, quoteId, selectedPackage, selectedTemplate, total]);

  async function search(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setDomain(null);
    try {
      const response = await fetch(`/api/domains?name=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Không thể kiểm tra tên miền.");
      setDomains(data.domains);
      setSuggestions(data.suggestions ?? []);
    } catch (reason) {
      setDomains([]);
      setSuggestions([]);
      setError(reason instanceof Error ? reason.message : "Không thể kiểm tra tên miền.");
    } finally { setLoading(false); }
  }

  async function copyQuote() {
    await navigator.clipboard.writeText(quoteText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return <>
    <section className="studio-domain" id="ten-mien">
      <div className="studio-section-head"><span>Bước 1 · Tên miền</span><h2>Tên bạn muốn còn đăng ký được không?</h2><p>Nhập tên thương hiệu hoặc tên miền. Kết quả hiển thị kèm giá dự kiến một năm.</p></div>
      <form className="studio-search" onSubmit={search}>
        <label htmlFor="studio-domain-input">Tên thương hiệu hoặc tên miền</label>
        <div><input id="studio-domain-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ví dụ: thuybeauty" autoComplete="off" /><button disabled={loading}>{loading ? "Đang kiểm tra…" : "Kiểm tra"}</button></div>
      </form>
      {error && <p className="studio-error" role="alert">{error}</p>}
      {domains.length > 0 && <div className="studio-domain-results" aria-live="polite">
        {domains.map((item) => <article key={item.name} className={domain?.name === item.name ? "is-selected" : ""}>
          <div><strong>{item.name}</strong><span data-status={item.status}>{item.status === "registered" ? "Đã có người đăng ký" : item.status === "unregistered" ? "Có thể đăng ký" : "Chưa xác minh"}</span></div>
          <b>{money(item.retailPrice)}<small>/năm</small></b>
          {item.status === "registered" ? <em>Không thể chọn</em> : <button type="button" onClick={() => setDomain(item)}>{domain?.name === item.name ? "Đã chọn" : "Chọn tên này"}</button>}
        </article>)}
        <p>Giá đã gồm 100.000đ phí hỗ trợ cấu hình tên miền. Tình trạng tên miền sẽ được xác nhận lại trước khi đăng ký.</p>
        {suggestions.length > 0 && <div className="studio-suggestions"><strong>Tên thay thế</strong>{suggestions.map((item) => <button type="button" key={item.name} disabled={item.status === "registered"} onClick={() => setDomain(item)}>{item.name}<span>{item.status === "registered" ? "Đã đăng ký" : money(item.retailPrice)}</span></button>)}</div>}
      </div>}
    </section>

    <section className="studio-packages" id="goi-website">
      <div className="studio-section-head"><span>Bước 2 · Gói website</span><h2>Chọn đúng loại website bạn cần.</h2><p>Mỗi gói có giá và hạng mục rõ ràng. Có thể bổ sung tính năng sau khi trao đổi.</p></div>
      <div className="studio-package-grid">
        {packages.map((item) => <article key={item.id} className={`${item.featured ? "is-featured" : ""} ${packageId === item.id ? "is-selected" : ""}`}>
          {item.featured && <span className="studio-pill">Một Ngụm đề xuất</span>}
          <p>{item.name}</p><h3>{item.id === "custom" && <small>Từ </small>}{money(item.price)}</h3><p>{item.description}</p>
          <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <footer><span>{item.mail}</span><button type="button" onClick={() => setPackageId(item.id)}>{packageId === item.id ? "Đã chọn" : "Chọn gói"}</button></footer>
        </article>)}
      </div>
    </section>

    <section className="studio-templates" id="mau-website">
      <div className="studio-section-head"><span>Bước 3 · Mẫu giao diện</span><h2>Chọn phong cách gần với thương hiệu.</h2><p>Mẫu là điểm khởi đầu. Màu sắc, hình ảnh và nội dung sẽ được chỉnh theo doanh nghiệp của bạn.</p></div>
      <div className="studio-filters" aria-label="Lọc mẫu website">{categories.map((item) => <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="studio-template-grid">
        {shownTemplates.map((item) => <article key={item.id} className={templateId === item.id ? "is-selected" : ""}>
          <div className="studio-browser"><span /><span /><span /><Image src={item.image} alt={`Xem trước mẫu ${item.name}`} width={1200} height={760} /></div>
          <div><p>{item.category}</p><h3>{item.name}</h3><span>{item.note}</span><div className="studio-template-actions"><a href={item.image} target="_blank" rel="noopener noreferrer">Xem demo</a><button type="button" onClick={() => setTemplateId(item.id)}>{templateId === item.id ? "Đã chọn mẫu" : "Chọn mẫu này"}</button></div></div>
        </article>)}
      </div>
    </section>

    <section className="studio-quote" id="bao-gia">
      <div className="studio-quote-copy"><span>Bước 4 · Báo giá dự kiến</span><h2>Xem tổng chi phí trước khi liên hệ.</h2><p>Sao chép báo giá và gửi qua Zalo. Một Ngụm sẽ xác nhận lại tên miền, phạm vi công việc và giá cuối cùng.</p></div>
      <div className="studio-receipt">
        <header><span>MỘT NGỤM / WEB STUDIO</span><b>{quoteId}</b></header>
        <dl><div><dt>Mẫu website</dt><dd>{selectedTemplate.name}</dd></div><div><dt>Gói</dt><dd>{selectedPackage.name}</dd></div><div><dt>Website</dt><dd>{money(selectedPackage.price)}</dd></div><div><dt>Tên miền</dt><dd>{domain?.name ?? "Chưa chọn"}</dd></div><div><dt>Domain + hỗ trợ</dt><dd>{domain ? money(domain.retailPrice) : "—"}</dd></div><div><dt>Mail Pro</dt><dd>{selectedPackage.mail}<small>Đã bao gồm</small></dd></div></dl>
        <div className="studio-total"><span>Tổng dự kiến</span><strong>{money(total)}</strong></div>
        <button type="button" className="studio-copy" onClick={copyQuote}>{copied ? "Đã sao chép báo giá" : "Sao chép báo giá"}</button>
        <a className="studio-zalo" href="https://zalo.me/0583799593" target="_blank" rel="noopener noreferrer">Trao đổi qua Zalo <span>↗</span></a>
        <p>Sao chép báo giá trước, sau đó dán vào cuộc trò chuyện Zalo.</p>
      </div>
    </section>
  </>;
}
