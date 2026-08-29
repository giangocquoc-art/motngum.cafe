# Patch T5 — Theme Product Image System

## Mục tiêu

Dùng cùng một sản phẩm anchor — **Cà phê sữa Một Ngụm** — để chứng minh 5 art direction khác nhau. Khi đổi theme, ảnh sản phẩm đổi cùng giao diện thay vì chỉ đổi màu CSS.

## 5 asset hero

| Theme | Asset | Art direction |
| --- | --- | --- |
| Warm Café | `warm-cafe-cafe-sua.webp` | Café ấm, hạt cà phê, linen, ánh sáng đất |
| Luxury | `luxury-cafe-sua.webp` | Editorial sang, marble, champagne, ánh sáng mềm |
| Tech | `tech-cafe-sua.webp` | Digital lab, ánh cyan, glass, tương phản cao |
| Minimal | `minimal-cafe-sua.webp` | Studio sạch, khoảng trắng, bóng mềm |
| Creative | `creative-cafe-sua.webp` | Cam, mint, hình khối mềm và playful |

Các ảnh được nén WebP 1122×1402, tổng khoảng 568 KB.

## Thay đổi code

- Thêm `data/theme-products.ts` làm nguồn dữ liệu ảnh sản phẩm theo theme.
- `data/industries.ts` không còn chọn 5 món khác nhau cho 5 theme. Tất cả dùng cùng **Cà phê sữa**, chỉ đổi art direction.
- Hero tự đổi ảnh theo `themeId`.
- Story tự đổi ảnh theo theme.
- Studio case study tự đổi ảnh theo theme.
- Theme preview dùng ảnh art-directed thật thay vì cùng một ảnh raw.
- Có transition nhẹ khi đổi ảnh và tôn trọng `prefers-reduced-motion`.
- Ảnh art-directed được render như photography frame, không còn giả định là PNG cut-out nền trong suốt.

## Phạm vi cố ý chưa làm trong T5

Menu đầy đủ vẫn dùng ảnh sản phẩm thật hiện tại. Patch sản phẩm/menu sau sẽ mở rộng cùng hệ `theme-products.ts` cho từng slug để đạt bộ ảnh đầy đủ nhiều theme mà không phải viết lại engine.
