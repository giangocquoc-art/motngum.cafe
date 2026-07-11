# Implementation report

## Design direction

- Coffee-first, digital-behind: khách nhìn thấy cà phê và câu chuyện thương hiệu trước khi gặp dịch vụ.
- Nền trắng/kem ấm, nâu espresso và caramel; loại bỏ cảm giác neon, cyber hoặc SaaS AI đại trà.
- Ly cà phê đá lớn vẫn là trọng tâm của Hero.
- Bố cục đã thu gọn khoảng trắng, hạ kích thước heading và chuẩn hóa khoảng cách section.
- Kiểu chữ dùng font hệ thống hỗ trợ dấu tiếng Việt ổn định, không còn hiện tượng chữ bị tách hoặc mất dấu.

## Performance work

- Gỡ Framer Motion và mọi trạng thái `initial: hidden` khiến nội dung xuất hiện muộn.
- `Reveal` trở thành wrapper tĩnh, phần HTML quan trọng hiển thị ngay từ lần render đầu.
- Loại bỏ Locomotive Scroll, video Hero và thư viện chuyển động không cần thiết.
- Chuyển hình ly/menu sang WebP, làm sạch nền và xóa tài sản không dùng.
- Tải ngay các hình menu, QR và hình kể chuyện có dung lượng nhỏ.
- Dùng asset cục bộ; không gọi font hoặc ảnh từ CDN bên ngoài.
- Tổng tài sản sử dụng trong `public` khoảng 494 KB.
- First Load JS trang chủ theo production build: khoảng 118 KB; shared JS khoảng 102 KB.

## UX work

- Header 72px, nền đặc, không dùng backdrop blur nặng.
- Hero hiển thị trọn thông điệp, CTA, giá nổi bật và ly cà phê trong vùng đầu trang.
- Menu desktop 4+3 cân giữa; mobile hai cột và ẩn mô tả phụ để đọc nhanh.
- Trang `/menu` bỏ tiêu đề lặp.
- Trang `/qr` tách rõ lời dẫn và câu hỏi, tránh lặp cùng một tiêu đề.
- QR section đổi từ nền đen nặng sang nền oat sáng.
- Form, card dịch vụ và footer được thu gọn, thống nhất bán kính và đường viền.
- Các hình trang trí không chèn lên văn bản.

## Main routes

- `/`
- `/menu`
- `/qr`
- `/dich-vu`
- `/dich-vu/[slug]`
- `/dao-tao-ai`
- `/tu-van-marketing`
- `/bang-gia`
- `/ve-mot-ngum`
- `/lien-he`

## Functional elements

- Responsive header/mobile menu.
- Menu cà phê tái sử dụng từ dữ liệu tập trung.
- ProblemFinder rule-based cho người quét QR.
- Lead form có Resend REST API và fallback liên hệ trực tiếp.
- Dynamic service detail pages.
- Metadata, sitemap và robots.
- Hỗ trợ `prefers-reduced-motion` dù giao diện hiện không phụ thuộc animation để hiện nội dung.
