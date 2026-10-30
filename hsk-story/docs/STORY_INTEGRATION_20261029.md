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
| Phát hành Preview | Root | Chờ kiểm tra toàn luồng, mạch tiếng Trung và quota Vercel; xác minh deployment đúng commit. |

Hành trình mới lưu đường đi phân nhánh và kết quả học trên thiết bị bằng các khóa riêng. Phần đồng bộ tài khoản cho hai khóa này chưa sẵn sàng; không công bố việc tiếp tục trên thiết bị khác cho đến khi đã kiểm tra đồng bộ an toàn.

## Kiểm tra và giới hạn

- Kiểm thử logic đồ thị, điều kiện, hồi tưởng, lưu lại, bài học và kết nối ôn tập; đối chiếu manifest cảnh với tập nhân vật đang dùng.
- Browser đi ba tuyến với viewport desktop, điện thoại dọc và điện thoại ngang; có trả lời sai, tải lại, kiểm viewport và một Sẻ trong cảnh. Kiểm thử bổ sung đang rà micro, trợ giúp, bàn phím và sổ tay.
- Các câu thoại mới từ nhánh ý tưởng là bản thảo kể chuyện, cần giáo viên hoặc người dùng tiếng Trung rà trước khi giới thiệu là học liệu chuẩn. Chưa kiểm bàn phím và âm thanh trên thiết bị thật.
- Vercel đã trả giới hạn deployment hằng ngày; link Preview cũ không chứa bản tích hợp này. Chưa triển khai commit mới.
