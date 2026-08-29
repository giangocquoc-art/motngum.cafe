# Patch T2 — Theme Engine

## Mục tiêu

Chuyển hệ đổi giao diện từ mô hình `industry` cũ sang một theme engine dùng được lâu dài cho showcase thiết kế website.

## Canonical theme ids

- `warm-cafe` — F&B / Warm Café
- `luxury` — Luxury / Editorial
- `tech` — Tech / Digital
- `minimal` — Minimal / Clean
- `creative` — Creative / Playful

## Thay đổi chính

1. `motngum-theme` trở thành localStorage key chính.
2. Tự migrate key cũ `motngum-industry` và các value cũ (`fnb`, `beauty`, `technology`, `services`, `retail`).
3. Theme được áp dụng trên toàn website, không còn giới hạn ở `/studio`.
4. Root `<html>` có cả:
   - `data-theme` — canonical id mới.
   - `data-industry` — legacy id tạm thời để CSS hiện tại không vỡ.
5. Bootstrap script chạy trước hydration để giảm flash sai theme khi reload.
6. Đồng bộ thay đổi giữa nhiều tab bằng `storage` event.
7. Nếu localStorage bị chặn, có in-memory fallback để tab hiện tại vẫn đổi theme.
8. API mới cho component:
   - `useShowcaseTheme()`
   - `theme`
   - `themeId`
   - `legacyIndustryId`
   - `chooseTheme()`
   - `openThemePicker()`
9. API `useIndustryTheme()` vẫn còn dưới dạng compatibility alias để các patch sau migrate dần mà không tạo một big-bang refactor.
10. Link tư vấn từ các component theme-aware chuyển từ `industry=` sang `theme=` với canonical id.

## Vì sao giữ `data-industry`

`app/industry.css` hiện có nhiều selector dựa vào `data-industry`. T2 không rewrite hàng nghìn dòng CSS cùng lúc để giảm rủi ro. Các patch layout/component sau sẽ dần chuyển sang `data-theme`, sau đó lớp compatibility mới được bỏ.

## Hành vi mong đợi

- Chọn Luxury → lưu `motngum-theme=luxury`.
- Reload bất kỳ trang nào → vẫn Luxury.
- Chuyển `/studio` → `/menu` → `/` → theme vẫn giữ.
- Tab khác cùng origin nhận theme mới qua storage event.
- Người dùng cũ có `motngum-industry=beauty` → tự được migrate thành `motngum-theme=luxury`.
- Người dùng chưa từng chọn → mặc định `warm-cafe`.
