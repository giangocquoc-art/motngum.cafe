# Chim Sẻ

Câu chuyện học tiếng Trung cùng Minh An và Sẻ ở Thành Đô, trong project độc lập hsk-story của repo motngum.cafe.

Nguồn chuẩn: [hướng hiện hành từ chat](docs/CHIM_SE_DIRECTION.md), [đối chiếu và thứ tự sửa](docs/DIRECTION_AUDIT_20261027.md), [story bible](STORY_BIBLE.md), [hợp đồng học liệu](CONTENT_CONTRACT.md). [docs/INDEX.md](docs/INDEX.md) phân biệt tài liệu hiện hành và hồ sơ lịch sử.

## Phạm vi hiện tại

9 trang Nhập môn; tập HSK1 demo gồm 7 cảnh luyện và 3 checkpoint, tìm sổ, hai lựa chọn truyện; 18 mục ôn mở theo cảnh đã hoàn thành. Bản đồ HSK 3.0 bậc 1–6 hiện là lộ trình: bậc 1 mới có nội dung pilot, bậc 2–6 mới là khung truyện, chưa ánh xạ đủ từng mục và chưa được giáo viên duyệt. Không phải toàn bộ đại cương, chứng chỉ hay đánh giá phát âm/thanh điệu. Xem [bản đối chiếu HSK 3.0](HSK3_SOURCE_AUDIT.md) và [blueprint](learning-blueprint.js).

## Chạy và kiểm tra

Phục vụ thư mục hsk-story qua static HTTP server để chơi truyện. Không mở bằng file:// vì URL tài sản đi từ root. Backend /api/ai/tutor cần Vercel development hoặc deployment và secret server; xem [AI_SETUP.md](AI_SETUP.md). .env được Git bỏ qua; .env.example là mẫu trống.

Từ thư mục repo: `node --test hsk-story/tests/*.test.cjs`. Unit tests không thay cho browser QA. Gate e2e/browser-smoke.cjs cần Playwright và Chromium/Edge; kỳ vọng phải khớp sản phẩm thật và kiểm tra cả nội dung con bị cắt.

## Tranh, dữ liệu và triển khai

Trang đầu, HSK1, Nhập môn và góc ôn dùng chung `scene-renderer.js` và `scene-layers.css`. Nguồn bố cục/ảnh là `art/manifest.json`; sau khi sửa chạy `node scripts/build-scene-manifest.cjs` trong hsk-story để tạo `scene-manifest.js` cho các trang tĩnh. `--check` kiểm tra bản sinh có khớp nguồn. Không chỉnh hai registry bằng tay.

WebP được phục vụ; PNG master của bộ tài sản đã ghi catalog nằm trong art/. Một số nền cũ chưa đủ provenance/master và NPC chưa có đủ biểu cảm, nên không coi tranh đã hoàn tất. Xem [ART_DIRECTION](art/ART_DIRECTION.md) và [COMPOSITION](art/COMPOSITION.md). Renderer SVG cũ không còn tải vào browser.

Không đổi ID, đáp án hay khóa lưu vì đổi thương hiệu. V3 là tiến độ chính, V4 là shadow, Nhập môn/ôn lưu riêng. Kết quả có trợ giúp không phải độc lập.

Vercel project hsk-hai-que-huong, Root Directory hsk-story, Framework Other. Nhánh codex/chimse-redesign-preview; Preview không đồng nghĩa production tại hsk.motngum.cafe. Không thay site gốc motngum.cafe.
