# Chim Sẻ

Câu chuyện học tiếng Trung cùng Minh An và Sẻ ở Thành Đô, trong project độc lập hsk-story của repo motngum.cafe.

Nguồn chuẩn: [hướng hiện hành từ chat](docs/CHIM_SE_DIRECTION.md), [đối chiếu và thứ tự sửa](docs/DIRECTION_AUDIT_20261027.md), [story bible](STORY_BIBLE.md), [hợp đồng học liệu](CONTENT_CONTRACT.md). [docs/INDEX.md](docs/INDEX.md) phân biệt tài liệu hiện hành và hồ sơ lịch sử.

## Phạm vi hiện tại

9 trang Nhập môn; tập HSK1 demo gồm 7 cảnh luyện và 3 checkpoint, tìm sổ, hai lựa chọn truyện; 18 mục ôn mở theo cảnh đã hoàn thành. Chưa đủ đại cương HSK1, chưa có HSK2–5 chơi được, không phải chứng chỉ hay đánh giá phát âm/thanh điệu.

## Chạy và kiểm tra

Phục vụ thư mục hsk-story qua static HTTP server để chơi truyện. Không mở bằng file:// vì URL tài sản đi từ root. Backend /api/ai/tutor cần Vercel development hoặc deployment và secret server; xem [AI_SETUP.md](AI_SETUP.md). .env được Git bỏ qua; .env.example là mẫu trống.

Từ thư mục repo: `node --test hsk-story/tests/*.test.cjs`. Unit tests không thay cho browser QA. Gate e2e/browser-smoke.cjs cần Playwright và Chromium/Edge; kỳ vọng phải khớp sản phẩm thật và kiểm tra cả nội dung con bị cắt.

## Tranh, dữ liệu và triển khai

Ứng dụng dùng ảnh raster được tạo, WebP phục vụ và PNG master trong art/. HSK1 hiện dựng lớp qua scene-layers.js; Nhập môn/ôn còn lớp CSS riêng. Xem [ART_DIRECTION](art/ART_DIRECTION.md). Một số mã SVG/tài sản cũ đang được rà, không dùng làm chuẩn tạo ảnh tiếp theo.

Không đổi ID, đáp án hay khóa lưu vì đổi thương hiệu. V3 là tiến độ chính, V4 là shadow, Nhập môn/ôn lưu riêng. Kết quả có trợ giúp không phải độc lập.

Vercel project hsk-hai-que-huong, Root Directory hsk-story, Framework Other. Nhánh codex/chimse-redesign-preview; Preview không đồng nghĩa production tại hsk.motngum.cafe. Không thay site gốc motngum.cafe.
