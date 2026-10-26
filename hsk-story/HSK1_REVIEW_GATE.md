# Gate 6 — Ôn tập HSK1 trong thế giới của Minh An
Ngày 26/10/2026. Nhánh feature/hsk1-inworld-review-evidence kế thừa PR #8. CHƯA MERGE VÀO MAIN.

- Trang riêng /ren-luyen.html có 18 bài mới do tác giả biên soạn, mở theo lịch sử hoàn thành cảnh 0–6: 7 đọc trên màn hình, 7 nhận diện chữ Hán, 4 nhập câu chữ Hán. Có thể quay về truyện và không phải bước bắt buộc.
- review-core.js là reducer thuần: thời điểm mở khóa, kiểm tra đã hoàn thành, lịch ôn 1–3–7–14 ngày, đúng độc lập / hỗ trợ / xem mẫu / bỏ qua. Gợi ý được ghi là trợ giúp, xem mẫu sau ít nhất hai lần sai, không tính là điểm đúng.
- Dữ liệu ôn ghi riêng tại hai-que-huong-review-v1, không sửa hai-que-huong-progress-v3, -v4 hoặc hai-que-huong-intro-v1; khi localStorage không cho ghi, hiện thông báo rõ ràng.
- Không ghi nhận TTS, phát âm, nghe chuẩn, viết tay hoặc HSK certificate. Không thêm chỉ số cảnh để bảo vệ người chơi cũ; không unlock HSK2–5.
- HSK1_COVERAGE_MATRIX.md lập bảng mục tiêu nội dung và ranh giới giữa pilot và đại cương. Source official chỉ xác minh cấu trúc năm trục, chưa xác nhận từng mục chương trình.
- Node tests: dữ liệu 18 item, unlock, spaced review, sample/hint, typed expression, corrupt storage và ghi dữ liệu độc lập.
- Chromium 1280/360: trước khi chơi không thể mở item; sau khi chơi 18 item mở; thử đúng/hint/skip/typed, reload giữ lịch, V3/V4 không thay đổi và không tràn ngang mobile.
- PR xếp chồng sau #8→#7→#6→#5→#4→#3; phải kiểm tra preview và merge tuần tự, không force push, không thay DNS.
