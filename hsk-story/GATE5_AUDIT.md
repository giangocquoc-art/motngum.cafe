# GATE 5 — Story-first language transfer, continuity, realistic assessment (26/10/2026)

## Phạm vi
Nhánh `feature/hsk-gate5-story-language-transfer` kế thừa Gate4 PR #7, **chưa ở production**. Không đảo scene ID 0–9, không xóa bản lưu `hai-que-huong-progress-v3`, không bật HSK2–5. Hoạt động là `HSK 1 demo`, không phải chứng chỉ.

## 1. Kết quả triển khai
- Module `story-threads.js` giữ năm mạch ngôn ngữ có mục tiêu thực: giới thiệu bản thân, gọi mì, hiểu giá, cảm ơn và hẹn gặp ngày mai. Mỗi mạch có điểm xuất hiện và — nếu có — một checkpoint thực tế sau đó.
- `app.js` trình bày **story echo** không chấm điểm, chỉ khi cảnh trước thực sự đã hoàn thành. Kết nối lời chào của mẹ với cô Vương, ký ức bạn Tiểu Vũ theo lựa chọn sau scene2, bát mì theo lựa chọn sau scene4, và những ký ức khi đi bộ về nhà ở scene6.
- Kết thúc episode có lời nhớ lại biến đổi theo hai lựa chọn và sự kiện tìm lại sổ, nhưng không sửa điểm, không mở khóa tương lai và không thêm UI blocking.
- Sổ tay giờ thể hiện 5 mạch câu chữ theo **bằng chứng thực tế**: tự trả lời đúng lần đầu, đúng sau hỗ trợ/thử lại, xem mẫu, mới nghe/đọc trong ngữ cảnh, checkpoint đã kiểm tra bằng nhập chữ, chưa kiểm tra. Đây không phải đo nói/viết/nghe độc lập hoặc HSK proficiency.
- Mạch giá `十块钱`: An nhìn/nghe NPC trong scene5 nhưng người chơi **chỉ nhập 谢谢**. Vì vậy đánh dấu `seen-in-context`, không tuyên bố đã tự phát biểu giá. Câu `明天见` cũng chỉ được gặp qua hội thoại ở scene6, không phải được tự tạo bởi câu `好`.
- Timeline: Chương 00 xảy ra **tối trước ngày đầu tới trường** sau khi mẹ cho xem quyển sổ; HSK1 cảnh0 kể **sáng hôm sau trên đường tới trường**, không nhận sổ lần hai. Giữ câu tiếng Trung và ID của scene0.
- Mục tiêu đánh giá scene8: `十块钱` từ một lời thoại **có phụ đề**, checkpoint nhập bằng chữ. Đổi mô tả từ `Nghe và nhớ` sang `Đọc và nhớ ngữ cảnh` để tránh giả lập năng lực nghe.
- `learning-blueprint.js` gỡ một số `revisit` sai hoặc không được bảo chứng (ví dụ đếm 1–3 không tái học qua cảnh mua mì; giá không xuất hiện ở cảnh hẹn ngày mai). Nguồn chưa được review chính thức vẫn giữ needsReview=true.
- Các tương tác đều không thêm vào `history` hay `score` nếu là chỉ quan sát truyện; không ảnh hưởng checkpoint 3/3.

## 2. Ma trận bằng chứng demo (KHÔNG phải đại cương HSK đầy đủ)
| Mạch | Bắt đầu | Tái sử dụng | Checkpoint | Chứng cứ hệ thống |
|---|---|---|---|---|
| Chào hỏi | Scene 0 (mẹ hỏi 你好吗) | Scene1 cô Vương nói 你好 | Chưa có riêng | Có phản hồi bằng chữ cho lời hỏi thăm; câu nhắc lại không có điểm |
| Tự giới thiệu | Scenes1 & 2 | Tìm lại quyển sổ | Scene7 | Nhập câu bằng chữ, gợi ý/đáp án mẫu phân biệt |
| Đếm người | Scene3 | Chưa có kiểm tra độc lập phía sau | Chưa có | Demo kiểm tra câu nói có ba học sinh |
| Gọi món | Scene4 | Scene6 nhìn lại quán | Scene9 | Nhập lại câu đã dùng, không giả định nghe |
| Giá tiền | Scene5 NPC báo 10 tệ | Scene8 kiểm tra | Scene8 | Scene5 **chỉ là tiếp xúc trong ngữ cảnh**, scene8 kiểm tra gõ chữ |
| Cảm ơn | Scene5 | Quan sát quán ở scene6 nếu người chơi chọn | Chưa có riêng | Lời cảm ơn nhập chữ, tái gặp không chấm điểm |
| Hẹn ngày mai | Scene6 NPC nói 明天见 | Scene6 echo & kết truyện | Chưa có riêng | Người chơi nói 好, không được tính tự nói 明天见 |

## 3. HSK 3.0 — trạng thái tham chiếu
Nguồn chính thức cho khung và đại cương: https://www.chinesetest.cn/syllabus.
Thông báo CTI/ChineseTest về HSK 3.0: https://old.chinesetest.cn/gonewcontent.do?flag=kdnew&id=51336883; lịch công bố triển khai chính thức toàn cầu dự kiến **13/12/2026** (sau ngày kiểm toán).
Chưa trích từng mục (từ vựng, Hán tự, ngữ pháp), từng dòng trang PDF chính thức và chưa có xác nhận chuyên gia nói tiếng Trung. Không dùng metadata V10 hoặc năm mạch câu chữ này để quảng cáo `HSK1 complete`, `aligned fully to HSK3.0` hoặc `official exam practice`. HSK2–5 vẫn `planned`.

## 4. Test và rollback
- Test thuần: 9 trường hợp bao gồm phân biệt đề cập-vs-tự nói, 2 lựa chọn kết bạn, 2 lựa chọn vị cay, hồi tưởng tìm sổ, không lộ điểm thi, thời gian truyện chính xác, validate HSK metadata.
- Test UI mock: phản hồi theo từng nhánh, notebook không lộ điểm/ngữ cảnh chưa có, checkpoint không hiển thị story echo.
- Chromium desktop 1280px + mobile 360px: Chương 00, toàn bộ 10 cảnh, 3 checkpoint, sidepaths, hiện `明天见` ở cảnh đường về, lời kết phụ thuộc lựa chọn, tải lại V3+V4 shadow.
- Không ghi thêm key hay chỉnh schema V3, V4; module chỉ đọc trạng thái hiện có. Revert PR nếu lỗi, không được xóa localStorage.
- Giữ nguyên snapshot `safety/hsk-story-pre-streamline-20261026` và chuỗi PR #3→#4→#5→#6→#7→#8. Merge tuần tự sau duyệt.

## 5. Chưa hoàn thành
- Giáo trình HSK1 *đầy đủ*: cần ma trận chữ/từ/cấu trúc theo từng dòng tài liệu gốc, kiểm duyệt phương ngữ/chính tả/Pinyin và đánh giá kỹ năng nhiều phương thức.
- Nghe/đọc chuyên sâu: hiện không đo được âm thanh thực được phát đến người nghe; nhận giọng chỉ là thử nghiệm.
- Story Graph có đường rẽ nhân vật nhưng các nhánh hội tụ, chưa phải các kết thúc độc lập; lựa chọn có hậu quả về cảm xúc và hồi tưởng, không ảnh hưởng điểm HSK.
- Màn hình artwork gốc, nhân vật hoạt hình và API hội thoại là các phần riêng dành cho Codex.
- Tương tác học được qua trải nghiệm cần pilot thực với người học mới (không suy ra từ Node test hoặc Chromium).
