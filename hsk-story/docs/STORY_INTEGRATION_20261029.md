# Chim Sẻ — tích hợp mạch truyện phân nhánh

Nguồn ý tưởng: nhánh `experiment/hsk-an-branching-novel-20261029`, commit `22275fa` và draft PR #10. Nhánh tích hợp đặt trên `codex/chimse-preview-release-20261029`; chỉ dùng cho Preview. Không merge draft PR vào `main` hoặc gắn domain chính.

## Phạm vi thực hiện

| Việc | Phụ trách | Bằng chứng / điều kiện |
| --- | --- | --- |
| Chuyển 42 nút truyện, 12 cảnh lựa chọn và hệ quả ngày hai | ECC nội dung | Giữ ID, lựa chọn và bản lưu thử nghiệm; sửa thời gian, người có mặt và phản hồi theo cảnh. |
| Dựng khung chơi cùng artwork Chim Sẻ | Root + ECC giao diện | Dùng renderer và manifest đang phát hành; chỉ một Sẻ trong cảnh; không cuộn viewport. Kiểm tra cảnh, bàn phím, nút và sổ tay ở nhiều kích thước. |
| Đặt các tình huống học vào mạch kể | ECC runtime | Giữ 10 tình huống và quy tắc chấm; mẫu, trợ giúp và kết quả độc lập tách riêng. Ký ức và điểm tính cách không tạo kết quả học. |
| Ôn tập và tiến độ cũ | ECC runtime | Bài ôn đọc bằng chứng của cả hai luồng, không ghi đè bản lưu HSK cũ; người đã chơi có đường tiếp tục lượt cũ. |
| Đồng bộ tài khoản cho truyện mới | ECC tài khoản | Đã xây dựng vùng lưu có revision riêng và kiểm thử chống ghi đè; chưa chạy migration hoặc xác nhận đồng bộ trên Preview. |
| Phát hành Preview | Root | Đã có Preview tại commit `cffe892`; các bản sửa tiếp theo phải được xác minh đúng commit trước khi coi là đã phát hành. |

Hành trình mới lưu đường đi phân nhánh và kết quả học trên thiết bị bằng các khóa riêng. Phần đồng bộ tài khoản cho hai khóa này chưa sẵn sàng; không công bố việc tiếp tục trên thiết bị khác cho đến khi đã kiểm tra đồng bộ an toàn.

## Kiểm tra và giới hạn

- Kiểm thử logic đồ thị, điều kiện, hồi tưởng, lưu lại, bài học và kết nối ôn tập; đối chiếu manifest cảnh với tập nhân vật đang dùng.
- Browser đi ba tuyến với viewport desktop, điện thoại dọc và điện thoại ngang; có trả lời sai, tải lại, kiểm viewport và một Sẻ trong cảnh. Bộ kiểm tra giao diện HSK/Nhập môn/góc ôn đã qua 756 trạng thái bố cục trên Edge headless; đây là trình duyệt cục bộ, chưa dùng phiên đăng nhập hoặc thiết bị thật của chủ dự án.
- Các câu thoại mới từ nhánh ý tưởng là bản thảo kể chuyện, cần giáo viên hoặc người dùng tiếng Trung rà trước khi giới thiệu là học liệu chuẩn. Chưa kiểm bàn phím và âm thanh trên thiết bị thật.
- Preview tại commit `cffe892` chứa bản tích hợp. Các lượt dựng `ec4b333` và `5fa9291` sau đó bị giới hạn deployment hằng ngày; trạng thái cũ này không chứng minh quota hiện tại. Luôn kiểm tra trạng thái commit mới sau khi đẩy nhánh.

## Rà tích hợp ngày 2026-11-04

Ponytail chưa có công cụ trong phiên; dùng agent phối hợp sẵn có theo `AGENTS.md` và skill ECC `team-agent-orchestration`. Các thay đổi nằm trong cùng worktree tích hợp với quyền sửa riêng từng nhóm.

| Việc | Chủ trì | Trạng thái / bằng chứng |
| --- | --- | --- |
| Bảo vệ bản lưu từ phiên bản mới hơn | Agent tài khoản; root tích hợp | Đã kiểm tra: giữ nguyên byte ở đường truyện, kết quả học, bài đang gõ, bản dự phòng và mốc khôi phục. Chặn ghi ở lúc mở trang, nhận dữ liệu từ tab/tài khoản khác và trước thao tác. Kiểm tra cả cấu trúc lồng sâu và dữ liệu vòng. |
| Khung nhánh HSK2–6 | Root; agent rà độc lập | Đã kiểm tra: 80 tuyến chạy theo liên kết cảnh thực tế, lưu giữa cảnh và tua lại từng quyết định; phát hiện vòng lặp, đường tắt bỏ mốc học, nguồn cảnh thiếu/trùng và bằng chứng học lỗi. API HSK2 và ID bản lưu v1 được giữ tương thích. Các bậc tương lai vẫn là thiết kế nội bộ chưa có bài tập đã duyệt. |
| Khung trả lời trên điện thoại nhỏ | Root | Đã sửa tràn nội dung sau câu sai ở 320×568. Thao tác bỏ qua chuyển vào bảng trợ giúp; vùng học lấy đủ chiều cao nội dung. Edge qua lại toàn bộ yêu cầu/trợ giúp, ghép câu, xem mẫu và tua lại trên điện thoại dọc/ngang. |
| Kiểm chứng tích hợp | Root | `node --test hsk-story/tests/*.test.cjs`: 331/331 qua. Edge: 18 tình huống khôi phục ở desktop/320×568/667×375; điều khiển học; bỏ qua/tua lại/đọc lại; đăng xuất khi mất mạng và tách dữ liệu hai tài khoản đều qua. Backend đồng bộ dùng dữ liệu giả trong kiểm tra trình duyệt; chưa chứng minh đồng bộ thật trên Preview. |
| Cổng phát hành còn lại | Root / người duyệt nội dung | Chờ deployment đúng commit mới, migration và đồng bộ thật trên Preview, rà tiếng Trung/Pinyin với người đủ chuyên môn, đối chiếu từng mục HSK và kiểm tra thiết bị thật. Chưa hoàn tất toàn bộ lộ trình HSK1–6. |

## Rà lời học và người nói ngày 2026-11-04

- Lượt tự giới thiệu dùng lại hai câu hỏi về tên và học sinh, thay lời mở đầu kỳ thi dài. Ba checkpoint có yêu cầu và phản hồi theo tình huống; cảnh dẫn nhập của cô chuyển thành một lượt đóng vai. ID, đáp án và dữ liệu lưu giữ nguyên.
- Hai thẻ ôn về Tiểu Vũ dùng đúng câu trong truyện và Pinyin tương ứng.
- Câu mẫu cảm ơn thuộc Tiểu Vũ. Người mẫu và biểu cảm nay theo metadata của câu mẫu; bà Lưu tạm dừng nói để nghe rồi trở lại lượt của bà. Biểu cảm cảm xúc của nhân vật khác và thay đổi độc lập không bị ghi đè.
- Kiểm chứng: 335/335 kiểm thử logic; Edge qua 314 trạng thái của Nhập môn, HSK1 và góc ôn ở điện thoại dọc/ngang, cùng các bài kiểm tra bàn phím. Kịch bản điều khiển truyện mới qua cả hai chiều màn hình, kiểm tra trực tiếp người nói, biểu cảm, câu mẫu, trả lời sai và trợ giúp. Đây vẫn là QA trên Edge headless cục bộ.
- Rà ngôn ngữ lần này là rà biên tập, chưa phải giáo viên duyệt. Câu hỏi giá `一碗面多少钱？` vẫn cần được đưa vào hội thoại trước lượt nhớ lại nếu muốn coi cấu trúc hỏi giá đã được luyện; hiện lượt đó chỉ được mô tả là đọc và nhớ ngữ cảnh, không phải bằng chứng nghe hay sử dụng cấu trúc hỏi giá.
