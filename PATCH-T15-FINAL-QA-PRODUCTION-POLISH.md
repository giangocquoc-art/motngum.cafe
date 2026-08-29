# Patch T15 — Final QA / Production Polish

Patch cuối không thêm feature mới. Mục tiêu là khóa các lỗi logic, copy và regression dễ xuất hiện sau chuỗi T1–T14.

## Sửa lỗi / polish

- Header coi `/dich-vu`, `/bang-gia`, `/dao-tao-ai` và `/tu-van-marketing` là cùng Studio journey, nên nav `Studio` giữ trạng thái active đúng ngữ cảnh.
- Bỏ proof hard-code `14 món trên ShopeeFood`; trạng thái menu được mô tả bền vững là `Đầy đủ trên ShopeeFood`.
- Các count `07 món` / `05 style` quan trọng được lấy từ `MENU_ITEMS.length` và `THEME_IDS.length` thay vì copy hard-code.
- Copy menu nói rõ sản phẩm/dữ liệu món là của Một Ngụm còn bối cảnh hình ảnh thay đổi theo art direction; không còn tạo cảm giác 35 ảnh theme đều là ảnh chụp nguyên bản.
- `SITE_URL` chỉ được chuẩn hóa tại `lib/seo-entities.ts`; About/Privacy dùng cùng nguồn để tránh URL `//...` khi env có dấu `/` cuối.
- JSON-LD ID ở các static page được thống nhất dạng `<canonical>#webpage` / `<canonical>#service`.
- AboutPage liên kết cả Café và Studio entity; PrivacyPage dùng canonical organization/website entity ID.

## Regression guard mới

Thêm `npm run qa:static` và cho `npm run build` chạy QA trước bước build. Bộ test dùng Node built-in, không cần browser và kiểm tra:

1. Tất cả import `@/...` resolve được.
2. Asset literal trong `/public` tồn tại.
3. Đủ 5 hero + 5 preview + 35 menu image (5 theme × 7 món).
4. Không có URL `?theme=` / `&theme=` gây duplicate crawl.
5. `NEXT_PUBLIC_SITE_URL` chỉ được đọc/normalize ở một module.
6. Không quay lại copy placeholder/stale như `Đặt bàn trong 30 giây` hoặc `14 món trên ShopeeFood`.
7. Link nội bộ literal trỏ tới App Router page thật.
8. Anchor `target="_blank"` có `rel`.

## Kiểm tra thực hiện

- `npm run qa:static`: 8/8 PASS.
- Global TypeScript `transpileModule`: 129 TS/TSX files PASS syntax/transpile.
- CSS brace balance: `globals.css` và `industry.css` PASS.
- `git diff --check`: PASS.
- `npm run build`: static QA PASS; Vinext build chưa chạy được vì dependency install trong workspace hiện tại chưa hoàn tất (`node_modules/.bin/vinext` không có). Đây là giới hạn môi trường kiểm thử, không được ghi nhận là build production PASS.

## Trạng thái sau T15

T1–T15 tạo thành bản source bàn giao hiện tại. Trước khi deploy production, cần chạy `npm run install:ci` hoàn tất rồi `npm run build` trong môi trường có dependency đầy đủ.
