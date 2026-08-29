# Patch T6 — Hero Variants

Mục tiêu của T6 là biến hero thành bằng chứng trực quan rằng cùng một thương hiệu và cùng một sản phẩm có thể được triển khai theo 5 art direction khác nhau. Patch không đổi dữ liệu café, CTA đặt món hay sản phẩm anchor; nó thay đổi cách dàn dựng, typography, chrome, decoration và nhịp bố cục.

## 5 hero variants

### 01 — Warm Café
- Giữ cấu trúc storefront F&B quen thuộc.
- Ly cà phê và các món phụ tiếp tục là trung tâm.
- Shape và texture nhẹ, màu nâu/kem, cảm giác tactile.

### 02 — Luxury / Editorial
- Hero chuyển thành editorial spread sáng.
- Serif lớn, nhiều khoảng thở, photography cao và thẳng.
- Giảm decoration, ẩn side-product cards, dùng caption và rule mảnh.

### 03 — Tech / Digital
- Hero chuyển sang dark product console.
- Grid, cyan accent, glass panel, proof blocks và product status cards.
- Product image vẫn là cà phê thật nhưng được đặt trong ngữ cảnh digital.

### 04 — Minimal / Clean
- Gần như bỏ toàn bộ decoration.
- Nền trắng, typography lớn, border thẳng, CTA và thông tin có thứ bậc rõ.
- Photography được đặt như một editorial product frame sạch.

### 05 — Creative / Playful
- Bố cục bất đối xứng kiểu poster.
- Shape cam/mint, border dày, offset shadow và card xoay nhẹ.
- Vẫn giữ CTA, menu và sản phẩm thật để không biến thành artwork khó dùng.

## Thay đổi kỹ thuật
- `IndustryHero.tsx` gắn `data-hero-theme` và class `hero-variant-*`.
- Hero index động theo theme (`01 / 05` ... `05 / 05`) thay cho giá trị hard-code cũ.
- Thêm `hero-theme-kicker`, `hero-scene-decor` và `hero-visual-meta` để mỗi theme có chất liệu bố cục riêng.
- Tất cả variants dùng cùng content, cùng CTA và cùng Theme Product Image System từ T5.
- Responsive rules riêng cho tablet/mobile.
- Reduced-motion vẫn được tôn trọng.

## Verification
- `components/IndustryHero.tsx`: TypeScript/TSX transpile OK.
- `app/industry.css`: brace balance OK.
- `git diff --check`: OK.
- Patch được kiểm tra apply sạch trên baseline sau T5.

Full production build chưa được chạy trong môi trường này vì dependency install của source trước đó bị timeout; đây vẫn là giới hạn verification giống các patch trước.
