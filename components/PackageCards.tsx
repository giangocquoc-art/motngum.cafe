"use client";

import { useState } from "react";

const packages = [
  { id: "start", name: "Bắt đầu", price: 4_900_000, text: "Một website gọn, đủ để khách tìm thấy và tin bạn.", items: ["Landing page chuyển đổi", "Tối ưu hiển thị mobile", "Thiết lập SEO cơ bản"] },
  { id: "launch", name: "Ra mắt", price: 8_900_000, text: "Bộ mặt chỉn chu cho thương hiệu đang lớn lên.", items: ["Website tối đa 5 trang", "Form nhận yêu cầu", "Thiết lập nội dung cơ bản"], featured: true },
  { id: "grow", name: "Đi xa hơn", price: 14_900_000, text: "Một nền tảng bán hàng có thể tiếp tục phát triển.", items: ["Website bán hàng", "Cấu hình theo yêu cầu", "Bàn giao và hướng dẫn"] },
];

export default function PackageCards() {
  const [selectedId, setSelectedId] = useState("launch");
  const selected = packages.find((item) => item.id === selectedId) ?? packages[1];

  return <>
    <div className="package-grid">
      {packages.map((item) => <article className={`package-card ${item.featured ? "featured" : ""} ${selectedId === item.id ? "selected" : ""}`} key={item.id}>
        {item.featured && <span className="package-badge">Được chọn nhiều</span>}
        <p className="package-kicker">Gói {item.name}</p>
        <h3>{item.price.toLocaleString("vi-VN")}đ</h3>
        <p>{item.text}</p>
        <ul>{item.items.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        <button type="button" onClick={() => setSelectedId(item.id)}>{selectedId === item.id ? "Đang xem báo giá" : "Xem báo giá"}</button>
      </article>)}
    </div>
    <div className="order-form" aria-live="polite">
      <p className="package-kicker">Báo giá website tham khảo</p>
      <h3>Gói {selected.name}: {selected.price.toLocaleString("vi-VN")}đ</h3>
      <p>Giá cuối cùng được xác nhận sau khi thống nhất nội dung, số trang và chức năng. Không phát sinh thanh toán trên website.</p>
      <a href="/lien-he">Nhận tư vấn chi tiết →</a>
    </div>
  </>;
}
