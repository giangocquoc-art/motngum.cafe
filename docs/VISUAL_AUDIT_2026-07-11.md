# Visual audit — Một Ngụm

Ngày rà soát: 11/07/2026

Phạm vi kiểm tra:

- Trang chủ, Menu, Dịch vụ, QR, Bảng giá, Về Một Ngụm, Liên hệ và trang chi tiết Chatbot AI.
- Desktop 1440 × 900 và mobile 390 × 844.
- Kiểm tra ảnh chụp thật bằng Chromium, overflow ngang, font tải thực tế và production build.

## Đã sửa trong đợt này

### P0 — Typography tiếng Việt bị tách chữ

- Hiện tượng: `cần`, `biết`, `đồ uống`, `niềm` xuất hiện như bị chèn khoảng trắng.
- Nguyên nhân: khối biến typography cũ ở cuối `globals.css` ghi đè font mới về Georgia.
- Cách sửa: dùng Lora qua `next/font`, đặt biến font trên `html`, đồng bộ cả hai khối biến CSS và bỏ `text-rendering: geometricPrecision`.
- Kết quả: các glyph tiếng Việt đã render liền nét ở tất cả trang được kiểm tra.

### P0 — Hero mobile tràn và rơi dấu câu

- Hiện tượng: slogan bị cắt bên phải; dấu chấm đứng thành một dòng riêng.
- Cách sửa: chia slogan thành hai nhóm ngữ nghĩa, cho phần nhấn xuống dòng có kiểm soát trên mobile và đưa dấu câu vào chính phần nhấn.

### P1 — Artwork closing story tràn viewport

- Hiện tượng: line-art vượt mép phải khoảng 84 px ở viewport 390 px.
- Cách sửa: căn giữa artwork và giới hạn chiều rộng còn 90vw trên mobile.

### P1 — Botanical artwork trang Menu cạnh tranh với tiêu đề

- Hiện tượng: nhánh cà phê phủ gần toàn bộ headline trên mobile.
- Cách sửa: thu artwork, đẩy sang góc phải và tăng lớp nền trắng phủ phía trên.

### P1 — Nút menu mobile thiếu tương phản

- Cách sửa: dùng nền cream và border đậm hơn; vùng chạm vẫn giữ 44 × 44 px.

## Hướng sửa tiếp theo

### P1 — Chuẩn hóa logo thành vector gốc

Logo hiện là chữ và hạt cà phê dựng bằng HTML/CSS. Cách này sắc nét, nhưng chưa khớp tuyệt đối tỷ lệ logo trong tài liệu gốc. Nên dựng hai SVG chính thức:

- `wordmark-full.svg` cho hero/footer.
- `wordmark-compact.svg` cho header.

SVG cần crop đúng bounding box, dùng một màu và không chứa font nhúng.

### P1 — Thay glyph Unicode của card dịch vụ

Các ký hiệu như `⌘`, `◌`, `▦`, `↻` có hình dạng khác nhau giữa hệ điều hành. Nên thay bằng một bộ SVG line icon đồng nhất: stroke 1.5 px, canvas 24 × 24, đầu nét bo tròn.

### P1 — Chuẩn hóa bộ ảnh menu

Ảnh đồ uống hiện khác nhau về góc nhìn, độ sáng, chiều cao và chất liệu minh họa. Nên chuẩn hóa:

- Canvas vuông trong suốt cùng kích thước.
- Cùng đường baseline và tỷ lệ ly.
- Cùng nhiệt độ màu, hướng sáng và độ sắc nét.
- WebP/AVIF, mục tiêu 25–45 KB mỗi ảnh ở kích thước hiển thị.

### P2 — Tối ưu botanical SVG

`coffee-tree.svg` hiện khoảng 177 KB, lớn đối với một line-art một màu. Nên chạy SVGO, gộp path và bỏ metadata; mục tiêu dưới 45 KB.

### P2 — Tăng số frame nếu muốn xoay ly thật

Bốn frame hiện đủ cho crossfade theo scroll nhưng chưa tạo cảm giác xoay liên tục. Nếu muốn chuyển động kiểu turntable, cần 12–16 frame được căn cùng tâm, cùng bóng và cùng crop. Không nên nội suy bằng filter hoặc tải video tự chạy.

### P2 — Giảm tính lặp của page hero

Menu, Dịch vụ và Bảng giá đang dùng cùng một chiều cao và cấu trúc headline lớn. Có thể chia thành ba biến thể:

- Editorial hero có artwork cho Menu.
- Compact text hero cho Bảng giá.
- Split hero có nội dung minh họa cho Dịch vụ.

Việc này giúp từng trang có nhịp riêng mà vẫn giữ chung hệ thống nhận diện.

## Quy chuẩn typography đề xuất

- Display/heading/logo: Lora 400; italic chỉ dùng cho từ nhấn.
- Body/UI: hệ sans hiện tại để tránh thêm một font download trong giai đoạn này.
- Headline desktop: tối đa 9–11 từ, line-height 0.98–1.04.
- Headline mobile: tối đa 4 dòng, không để dòng chỉ có dấu câu hoặc một từ ngắn.
- Body copy: 45–68 ký tự mỗi dòng, line-height 1.55–1.65.

## Tiêu chí nghiệm thu vòng sau

- Không phần tử nội dung nào vượt viewport 390 px.
- Không còn glyph tiếng Việt có advance width sai.
- Logo, icon và ảnh menu dùng cùng một ngôn ngữ nét.
- LCP không tăng do font; chỉ preload font normal và italic thực sự sử dụng.
- `prefers-reduced-motion` vẫn giữ đầy đủ nội dung và frame ly tĩnh.
