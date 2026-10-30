# Chim Sẻ — hướng hiện hành

Chốt từ hội thoại với chủ dự án, 27/10/2026. Tài liệu này điều khiển đợt đại trùng tu trong `hsk-story`. Các kế hoạch MASTER và báo cáo Gate/V4–V9 là lịch sử, không tự mở rộng phạm vi hiện tại.

## Trải nghiệm

Người chơi theo câu chuyện của An ở Thành Đô. Mỗi thời điểm chỉ hiện cảnh, lời thoại và việc cần làm. Tranh ở trên, khung học hoặc Hỏi Sẻ ở dưới. Desktop, điện thoại dọc/ngang và tablet đều trong một viewport: không cuộn trang, không giấu nội dung bằng overflow để giả vờ vừa màn hình. Khi bàn phím mở, vẫn thấy cảnh và ô trả lời.

Tên sản phẩm là **Chim Sẻ**. “Hai quê hương” là chủ đề có thể giữ và là tên trong các khóa lưu cũ, không phải lý do đổi khóa lưu. Trang đầu là một cảnh với bắt đầu/tiếp tục, không landing dài, ticker hay HSK2–5 chưa chơi được.

## Nhân vật và giọng kể

- **Minh An/安:** bé trai Việt Nam 11 tuổi, tóc đen hơi bù, áo vàng đất, cặp xanh bạc màu. Tò mò, vụng về, có lúc hiểu lầm và ngại hỏi. Trưởng thành qua hành động và quan hệ, không phải nhân vật hoàn hảo.
- **Sẻ:** một chú chim xanh dương nhạt, bụng kem. Chỉ An hiểu lời Sẻ; người khác nghe tiếng chim. Sẻ sống trong cảnh, có lý do xuất hiện, cũng tò mò và có thể đoán sai. Mỗi cảnh có đúng một Sẻ, không thêm chim vào bong bóng hay ảnh nền.
- Mẹ, Tiểu Vũ, cô Vương, bà Lưu và cô trực trường có hình dáng/tuổi/quần áo riêng và nhất quán. Tiểu Vũ là bạn trai cùng tuổi An. Timeline ở [STORY_BIBLE.md](../STORY_BIBLE.md).
- Lời dẫn, phản hồi và thao tác có giọng gần gũi theo người đang đối thoại. Kết quả chi tiết nằm trong sổ tay/xem lại; trợ giúp, phụ đề và thiết lập mở khi cần.

## Tranh và renderer

Nét mực đen hơi run, màu phẳng dịu, hạt giấy, chi tiết đời sống và biểu cảm rõ nhưng tiết chế. Concept của chủ dự án điều khiển nét/màu; mô tả An ở trên điều khiển danh tính. Không dùng SVG tạm thay tranh được tạo.

Bốn lớp chức năng: bối cảnh tĩnh; nhân vật/tiền cảnh trong suốt; hội thoại/tương tác HTML; chuyển động nhẹ có giảm chuyển động. Chữ Hán cần học không nằm trong ảnh. Màn dọc cần bố cục riêng, giữ nét mặt và đồ vật quan trọng. Manifest gắn ID truyện với ảnh, vị trí, biểu cảm, điểm tương tác và layout. Renderer dùng chung cho HSK1, Nhập môn và ôn. Tải trước cảnh kế tiếp và phục vụ ảnh tối ưu.

Trình tự chất lượng: bộ mẫu nhân vật → cảnh quán mì đủ lớp → áp dụng phần còn lại. Mỗi tài sản được tạo riêng có tham chiếu; lưu ảnh chuẩn, prompt, quy chuẩn và catalog trong repo. **Bố cục đã duyệt; việc đưa tranh vào code chưa chứng minh toàn bộ tranh đã được chủ dự án duyệt.**

## Phạm vi và tính toàn vẹn

Lộ trình học dùng HSK 3.0 bậc 1–6, theo bản syllabus 2025-11 có hiệu lực 2026-07; không trộn chương trình sáu cấp cũ. Blueprint ghi năm thành phần và trang nguồn cho cả sáu bậc. Bậc 1 hiện có demo, nhưng đối chiếu từng mục và duyệt giáo viên còn thiếu; bậc 2–6 là khung truyện, chưa có syllabus mapping và không chơi được. Mỗi bậc chỉ phát hành sau khi đối chiếu nội dung, rà tiếng Trung/Pinyin với người đủ chuyên môn và đạt kiểm thử. Xem [HSK3_SOURCE_AUDIT.md](../HSK3_SOURCE_AUDIT.md).

Trong truyện, lựa chọn tạo cảnh phản hồi riêng, ký ức và hệ quả có callback; tuyến hội tụ trước mục tiêu học tiếp. Mọi tuyến có cùng mục tiêu và cơ hội luyện. Sai, xin gợi ý, xem mẫu hoặc bỏ qua chỉ ghi bằng chứng học; không đổi nhánh, quan hệ, tính cách hay kết cục. Bài sai cho thử lại; bỏ qua không được tính là nắm vững. Xem [CONTENT_CONTRACT.md](../CONTENT_CONTRACT.md).

Giữ thứ tự/ID 10 cảnh, tập đáp án chấp nhận, quy tắc trợ giúp và kết quả lưu. V3 `hai-que-huong-progress-v3` là nguồn tiến độ; V4 là shadow. Nhập môn/ôn lưu riêng. Trợ giúp, sổ tay, Sẻ và lời dẫn không tiết lộ đáp án checkpoint. Nhánh phải quay về mục tiêu học bắt buộc. Xem [CONTENT_CONTRACT.md](../CONTENT_CONTRACT.md).

## AI bổ sung theo yêu cầu

Hỏi Sẻ dùng backend OpenAI-compatible `https://api.psharehub.com/v1`, danh sách model chủ dự án cung cấp, xoay key/model khi lỗi và trả kết quả hữu ích nếu provider còn khả dụng. Có giới hạn tổng thời gian, trạng thái lỗi rõ và vẫn tiếp tục được truyện. AI không chấm điểm hoặc đổi canonical story state. Key chỉ ở server, không nằm trong browser/Git/log.

Sau nhiều lần thử đều thất bại, gửi cảnh báo tối giản tới `admin@motngum.cafe` qua Email Sending đã cấu hình; không đưa câu hỏi học viên hoặc key vào email. Backend tồn tại không chứng minh AI/email đã hoạt động. Cấu hình và điều kiện ở [AI_SETUP.md](../AI_SETUP.md).

## Nghiệm thu

Đi trọn Nhập môn, HSK1, tìm sổ, cả hai phương án của hai lựa chọn, kết thúc và ôn. Mở save cũ đúng cảnh/kết quả. Thử đúng/sai/trợ giúp/ghép câu/micro không có. Kiểm desktop, phone dọc/ngang, tablet và bàn phím; kiểm nội dung con bị clip, không chỉ kích thước body. Rà mặt/đồ vật/alpha/phối cảnh, đúng một Sẻ, chữ Hán đọc được. Chạy kiểm thử logic, manifest và browser. Đưa kết quả lên Vercel Preview để xem trên thiết bị thực tế.

## Trạng thái cần đối chiếu

Baseline đầu đợt rà: nhánh `codex/chimse-redesign-preview`, commit `d594eda`; Preview không chứng minh trạng thái production. Danh sách sai lệch, bằng chứng và thứ tự sửa ở [DIRECTION_AUDIT_20261027.md](DIRECTION_AUDIT_20261027.md).
