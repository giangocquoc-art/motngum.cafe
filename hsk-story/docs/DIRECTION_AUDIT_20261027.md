# Đối chiếu Chim Sẻ — 27/10/2026

Nguồn yêu cầu: [hướng hiện hành từ hội thoại](CHIM_SE_DIRECTION.md). Baseline `d594eda`. Làm từng vấn đề: xác nhận bằng chứng → chọn cách sửa và rủi ro → thực hiện → kiểm lại. Không đánh dấu hoàn thành bằng unit tests hoặc manifest nếu yêu cầu là hành vi/ảnh thực tế.

## Thứ tự và bằng chứng

| # | Vấn đề / yêu cầu | Bằng chứng đầu đợt | Cách xử lý và điều kiện hoàn thành |
| --- | --- | --- | --- |
| 1 | Nguồn chuẩn/nhân vật/brand mâu thuẫn | ART_DIRECTION ghi An là girl áo cam; manifest/cảnh dùng boy áo vàng. README/PRODUCT_SPEC nói SVG và chưa có art/AI. docs INDEX trỏ Gate4 làm nguồn hiện hành. | Đã thống nhất nguồn hiện hành, canon và trạng thái phê duyệt. JSON parse và kiểm liên kết/nội dung cục bộ; không thay ID/save. |
| 2 | Chưa có bằng chứng toàn luồng một màn | E2E cũ đòi title Nhập môn và 4 roadmap card đã bị bỏ, chỉ kiểm body ngang; CSS chồng nhiều breakpoint. | Cập nhật gate theo sản phẩm thật, chạy mọi đường truyện/save/ôn và đo cả con bị clip, nút/khuôn mặt khi bàn phím. Sửa từng lỗi đo được. |
| 3 | Renderer chung và manifest chưa đúng ý nghĩa | HSK1 dùng scene-layers; Nhập môn/ôn dựng CSS riêng. scene-layers lặp lại manifest. tests xác nhận placeholder là đúng; midground/foreground đa số không có ảnh. | Một registry/renderer thực cho ba luồng; lớp không cần ảnh phải khai báo rỗng thật. Không tạo thêm ảnh vô ích chỉ để đủ lớp. |
| 4 | Biểu cảm/động tác và tài sản còn thiếu | NPC sheet một hình/người; mood CSS không thay hình; An/Sẻ có sheet. Ảnh chuẩn chủ dự án chưa lưu trong repo. Lost notebook dùng nền lớp học. | Rà từng ảnh thực tế, khóa danh tính, sửa scene composition trước; lưu nguồn chuẩn và tạo đúng tài sản còn thiếu. Không coi tên mood là biểu cảm đã có. |
| 5 | Truyện và Sẻ chưa xuyên suốt | story-beats/intro-data chủ yếu bản cũ; Sẻ qua whisper riêng, intro không có lần gặp Sẻ trong lời kể. Nhiều nhãn kỹ thuật/kết quả còn ở gameplay. | Viết lại lời dẫn và phản hồi theo canon, nối các sự kiện, chuyển thống kê vào notebook; giữ đáp án/ID và chống lộ checkpoint. |
| 6 | Mã tranh cũ vẫn tải và runtime dư | index còn tải scene-art.js SVG mặc dù có scene-layers; CSS có nhiều lớp override cho placeholder. | Chứng minh caller rồi bỏ tải mã chết, giữ compatibility cần thiết cho save/tests. Không thay toàn app chỉ để làm ngắn. |
| 7 | AI có route nhưng chưa chứng minh kết quả thật | Timeout 1.2–2.2s/attempt, fixed sweep 4×4; model screenshot từng ghi latency khoảng 6s. Prompt chỉ có sceneId. Local key có, Preview key trống. | Rà budget/failover/context theo tình huống, kiểm server/mock có ý nghĩa rồi provider thật nếu có môi trường hợp lệ. Không lộ key, không chấm điểm bằng AI. |
| 8 | Email chưa hoạt động | Token local trống; Cloudflare Email Sending read trả 401. | Mã/payload đúng chưa đủ; cần secret/quyền/domain và kiểm send failover. Ghi blocker đúng, không bịa đã gửi. |
| 9 | Tài sản và delivery | Có PNG crop cũ chưa tracked, WebP legacy, catalog có source master ngoài commit; Preview trước đó READY nhưng không phải production. | Rà git-tracked asset completeness từ clean checkout, preload/transfer, alpha/cảnh thật; Preview cuối đúng commit và bằng chứng smoke. |

## Không tự mở rộng

Không hoàn thiện toàn bộ đại cương HSK1/HSK2–5, không thêm tài khoản/Neon khi chưa cần, không sửa grade hay nguồn save. Các đòi hỏi đánh giá của giáo viên/thiết bị thật phải ghi là chưa có bằng chứng, không giả thay bằng test.

## Nhật ký thực hiện

- Bắt đầu: đã đọc chat, git state, PRODUCT_SPEC, STORY_BIBLE, README, docs INDEX, art guide/manifest, renderer, story beats và browser gate. Phát hiện E2E cũ không khớp UI mới; chưa chạy để tuyên bố pass.
- Vấn đề 1: gom quyết định mới vào CHIM_SE_DIRECTION, chỉnh nguồn tài liệu và canon; chưa coi đây là sửa xong các vấn đề UI/art/AI.
- Vấn đề 2: gate cũ thất bại ngay ở title. Sau khi đồng bộ kỳ vọng và kiểm cả ancestor clipping, phát hiện 56 trạng thái desktop/phone có overflow cùng một số nguyên nhân: nhiều bảng cùng hiện, nội dung căn giữa tràn lên vùng tranh, feedback lặp, nút gửi đổi vị trí khi focusout. Đã tách chế độ khung học, đưa kết quả vào sổ tay, giữ bố cục bàn phím theo visual viewport, phân trang phần đọc thêm. Full browser flow 1280×800 và 360×800 đã pass (9 trang, 10 cảnh, tìm sổ, 2 lựa chọn, 18 mục ôn, save/reload); đang mở rộng gate cho màn ngang/tablet. Đây chưa chứng minh occlusion/khuôn mặt hoặc art fidelity.
