# NGOẠI TRUYỆN THỬ NGHIỆM — Ngày đầu của An

**Trạng thái:** Git feature branch ONLY. Không merge vào main, không gắn domain chính; deploy Vercel Preview để kiểm thử. Mục tiêu: thử nghiệm mô hình kể chuyện phân nhánh thật trước khi cân nhắc chuyển sang runtime gốc.

## Canon được đối chiếu trên main cba551b

Đã đọc STORY_BIBLE.md, EPISODE_01_STORYBOARD_V8.md, content-manifest.js, story-director.js, README.md, game-core.js. Trục sự kiện gốc giữ nguyên: Minh An 11 tuổi tới Thành Đô với mẹ; quyển sổ của mẹ và câu “Mỗi ngày, chỉ cần hiểu thêm một người”; gặp cô Vương và Tiểu Vũ; quyển sổ thất lạc được nhận lại tại phòng trực; ăn mì ở quán bà Lưu; trở về nhà. Đoạn kết đề cao sự trưởng thành gắn với học ngôn ngữ. Không thay tên/tuổi/quan hệ gốc, không phá continuity.

**Khác biệt:** Main V5 story-director chỉ có hai quyết định (ghế ngồi, độ cay), hội tụ lại ngay sau một cảnh. Ngoại truyện có 23 nút biên tập, 8 cảnh quyết định, 4.374 chuỗi lựa chọn khả thi (không đồng nghĩa có 4.374 cảnh hay kết thúc biên tập riêng), ba kết cục về định hướng trưởng thành và callback theo quá khứ. Sáu chặng chính luôn hiện diện; không thể bỏ mất quyển sổ hay các nhân vật quan trọng.

## Luật chơi và hệ quả

- Mỗi phương án trả lời có chữ Hán, Pinyin, diễn giải Việt, phản hồi NPC, ảnh hưởng lên Dũng cảm/Thấu cảm/Hiếu kỳ và quan hệ Mẹ/Tiểu Vũ/Cô Vương/Bà Lưu, lưu ký ức cụ thể.
- Một số quyết định dẫn tới NÚT CẢNH KHÁC (lúc đến Thành Đô, vào lớp, tìm sổ, bữa trưa, về nhà); số khác dẫn tới cách nói, ký ức và hồi tưởng khác.
- Không có chỉ số thiện/ác, không phạt khi nhờ người khác giúp. Mọi lối đi đều có thể hoàn thành, nhưng An hình thành thái độ khác nhau.
- Callback ở cảnh mất sổ, phòng trực, đường về. Kết cục tính từ 3 khuynh hướng, thêm người gần gũi và ký ức nổi bật.
- Ô nhập chữ Hán nhận các biến thể do tác giả biên tập; KHÔNG phải hội thoại AI tự do hoặc chấm thi HSK.
- Giọng Web Speech API đọc câu mẫu đầu tiên khi browser hỗ trợ.

## Isolation, versioning

Các tệp mới chỉ ở hsk-story/duong-re/: index.html, style.css, branch-data.js, branch-engine.js, branch-ui.js; không đụng runtime gốc. Engine thuần dữ liệu, không gọi API; UI dựng nội dung người chơi bằng textContent.

LocalStorage duy nhất: hai-que-huong-branching-novel-v1. Save chỉ gồm version và danh sách bước {at,choice}, sau đó replay để tái dựng trạng thái thật; điểm/flags giả bị phớt lờ. Dữ liệu sai, dữ liệu phiên bản sau, bước giả đều được xử lý an toàn, không đụng khóa HSK V3/V4, Nhập môn hay ôn tập. Chưa có đồng bộ tài khoản/backend; không migration giữa những thử nghiệm khác nhau.

## Nội dung và mỹ thuật

23 nút là thử nghiệm kể chuyện dài một ngày, chưa phải game thế giới mở. Tự do là đa tuyến có kịch bản; không ngụ ý mọi lời nói đều được hiểu. Các câu tiếng Trung / Pinyin là bản thảo sáng tác cần kiểm tra lại với giáo viên. Tính cách không phải điểm kiểm tra khả năng tiếng Trung.

Mỹ thuật hiện tại là placeholder gốc (HTML/CSS/SVG), chưa tích hợp concept nhân vật nhiều biểu cảm từ phiên bản minh họa. Khi dùng Codex, chuyển sang sprite đồng nhất có đủ cảm xúc và xuất xứ asset rõ ràng; để văn bản là HTML, không vẽ chữ vào hình.

## Kiểm thử & phát triển sâu

Lệnh từ repo root: node --test hsk-story/tests/branch-story.test.cjs hoặc node --test hsk-story/tests/*.test.cjs. Test số đường, điều kiện bắt buộc, ký ức/hồi tưởng, ba kết thúc, bản lưu giả/hỏng, nhánh ngôn ngữ, không chạm kho dữ liệu gốc. Cần thực nghiệm trình duyệt thật trên desktop/mobile và rà tự nhiên của tiếng Trung.

Nếu nâng thành câu chuyện nhiều năm: thêm nghịch cảnh có hệ quả thực từ tập trước sang tập sau; xung đột đạo đức không có lựa chọn hoàn hảo; điểm cảm xúc/quan hệ không thay thế hành vi và nội dung được viết riêng. Phải giữ main độc lập cho đến khi đủ kiểm chứng.
