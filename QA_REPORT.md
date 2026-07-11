# QA report — Một Ngụm

Ngày kiểm tra: 11/07/2026

## Kết quả kỹ thuật

- `npm run lint`: PASS — TypeScript không có lỗi.
- `npm run build`: PASS — Next.js 15.5.12 tạo production build thành công.
- Static generation: 25/25 trang hoàn tất.
- Production server: sẵn sàng trong khoảng 1,2 giây ở môi trường kiểm tra.
- Các route chính và toàn bộ 9 route dịch vụ: HTTP 200.
- `robots.txt` và `sitemap.xml`: HTTP 200.

## Browser QA

Đã kiểm tra bằng Chromium ở:

- Desktop: 1440 × 900.
- Mobile: 390 × 844.

Kết quả trang chủ production:

- Console errors: 0.
- Page errors: 0.
- Horizontal overflow: 0px.
- Hình lỗi hoặc chưa tải: 0/14.
- Nội dung không phụ thuộc animation mới xuất hiện.

Các trang đã kiểm tra trực quan:

- `/`
- `/menu`
- `/dich-vu`
- `/qr`
- `/tu-van-marketing`
- `/bang-gia`
- `/ve-mot-ngum`

## Lỗi đã xử lý

- Chữ tiếng Việt bị tách khoảng hoặc hiển thị sai dấu.
- Heading quá lớn và xuống dòng khó đọc.
- Khoảng trắng dư thừa giữa section.
- Menu mobile kéo quá dài.
- Hình menu và nét vẽ xuất hiện muộn do lazy loading.
- Tiêu đề lặp ở trang menu.
- Câu hỏi lặp ở trang QR.
- Nền đen nặng làm thương hiệu giống web AI/SaaS.
- Hình trang trí đè lên nội dung.
- Hình Choco có vệt nền xám.
- Thư viện animation làm tăng JavaScript và trì hoãn nội dung.

## Build summary

- Trang chủ: 1.5 kB route JS, khoảng 118 kB First Load JS.
- Shared JS: khoảng 102 kB.
- Hầu hết route được prerender tĩnh.
- `/api/leads` và trang tư vấn có phần xử lý động theo yêu cầu.
