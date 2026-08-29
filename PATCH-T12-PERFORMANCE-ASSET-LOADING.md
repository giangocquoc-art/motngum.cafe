# Patch T12 — Performance / Asset Loading

Mục tiêu của patch này là giữ trải nghiệm 5 theme và 35 ảnh menu nhưng không để browser tải toàn bộ asset cùng lúc.

## 1. Preload đúng hero theo theme đã lưu

- `theme-bootstrap` đọc `motngum-theme` trước khi body được parse.
- Chỉ trên homepage `/`, browser tạo `link rel="preload" as="image"` cho **hero của theme hiện tại**.
- Không còn dùng `priority` cố định cho hero SSR Warm Café, tránh ép browser preload sai theme khi người dùng đã lưu Luxury/Tech/Minimal/Creative.
- Save-Data hoặc mạng 2G/slow-2G sẽ bỏ speculative preload.

## 2. Theme selector không còn dùng 5 ảnh hero full-size

Tạo 5 thumbnail riêng tại:

`public/assets/theme-products/preview/<theme>.webp`

Mỗi thumbnail 240×300, khoảng 2.5–6.5 KB.

- Payload 5 hero cũ dùng trong selector: **~555.8 KB**
- Payload 5 preview mới: **~24.6 KB**
- Giảm khoảng **95.6%** cho phần ảnh preview selector.

Ảnh hero full-size vẫn được giữ nguyên cho hero/case study.

## 3. Intent-based prefetch khi người dùng chuẩn bị đổi theme

Thêm `lib/theme-asset-prefetch.ts`.

Khi user:

- hover một theme,
- focus bằng bàn phím,
- pointer down/touch,

website sẽ warm asset của **chính theme đó** trước khi click hoàn tất.

Không prefetch cả 5 bộ ảnh full-size cùng lúc.

## 4. Prefetch theo route

- `/`: hero hiện tại + 4 ảnh menu compact của theme hiện tại.
- `/menu`: 7 ảnh menu của theme hiện tại.
- `/studio`: chỉ hero của theme mà user thể hiện ý định xem; không kéo cả menu.
- route khác: không tự preload hero/menu không cần thiết.

Menu được warm bằng `requestIdleCallback` (fallback `setTimeout`) để không tranh băng thông với nội dung quan trọng ban đầu.

## 5. Data Saver / mạng chậm

Nếu Network Information API báo:

- `saveData = true`, hoặc
- `2g` / `slow-2g`,

website không speculative-prefetch menu. Native lazy loading tiếp quản.

## 6. Render đúng asset cần thiết trong hero

Hero không còn render asset trang trí không dùng ở từng theme:

- coffee beans chỉ render cho Warm Café và Creative.
- side-product thumbnails chỉ render cho Warm Café, Tech và Creative.
- Luxury/Minimal không còn tải asset bị CSS `display:none`.

## 7. Lazy decode cho ảnh không critical

- Theme preview: `loading="lazy"`, `fetchPriority="low"`, `decoding="async"`.
- Menu item: lazy/low priority mặc định.
- Studio case-study: lazy/low priority.
- Decorative/side-product image: lazy + async decode.

## 8. Kiểm tra

Đã kiểm tra:

- TypeScript/TSX transpile: OK.
- `git diff --check`: OK.
- 5/5 preview asset là WebP 240×300.
- Selector image payload giảm ~95.6%.
- Asset prefetch chỉ tham chiếu một theme tại một thời điểm.

Full production build chưa được chạy trong workspace này vì `node_modules` chưa được cài đầy đủ.
