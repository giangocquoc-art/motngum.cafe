# Hai quê hương — Audit Nhập môn v0.2
Ngày: 26/10/2026. URL: https://hsk.motngum.cafe/nhap-mon.html

## Mục tiêu
Tạo sự tò mò với chữ Hán bằng câu chuyện của An và mẹ, không biến phần nhập môn thành danh sách flashcard hoặc một kỳ thi HSK không chính thức. Người học có thể bắt đầu HSK 1 bất kỳ lúc nào; tiến độ Nhập môn được lưu độc lập.

## Phát hiện và sửa logic
1. P0 — Chạm 人/木/日/月 nhưng chữ to và nút đọc vẫn giữ 字. Đã bổ sung focusGlyph được kiểm tra, lưu và hiển thị đồng bộ ký tự, Pinyin và mục tiêu TTS.
2. P0 — Người chơi có thể đổi đáp án sau khi xem lời giải rồi được tính là đúng. Đã khóa đáp án lần đầu và phân biệt nhận ra ngay, đã học qua lời giải, đã bỏ qua; dữ liệu cũ ghi legacy chứ không phong thành tự nhận biết.
3. P0 — Nút "Bỏ qua câu này" thực tế bỏ toàn bộ phần trắc nghiệm. Đã sửa để chỉ bỏ đúng một câu, lưu trạng thái và sang câu tiếp theo.
4. P1 — Không thể ôn lại bốn chữ nếu không reset cả truyện. Đã thêm chức năng ôn lại chỉ xóa kết quả thử đoán, không ảnh hưởng nhân vật, trang đã đọc hoặc HSK 1.
5. P1 — Phần đố hiển thị một câu tiếng Trung dài chưa học và nút nghe chỉ đọc 林. Đã chuyển sang hiện đúng glyph của từng câu đố (林, 众, 妈, 明), Pinyin và âm phù hợp.
6. P1 — Kết thúc chương chuyển đến sơ đồ chương rồi phải nhấn HSK1 lần nữa. Đã bổ sung deep link /?play=hsk1 để tự mở bài học HSK1 với bản lưu cũ nguyên vẹn.
7. P1 — Trang chủ không biết người chơi đã đọc Nhập môn hay chưa. Script read-only hiển thị tiếp tục trang x/9 hoặc xem lại, an toàn khi localStorage lỗi.
8. P1 — Câu đùa ghép hai/ba chữ 女 cần nguồn từ điển và chú giải định kiến giới. Đã cập nhật danh mục nguồn; không tuyên bố 奻/姦 nghĩa là chợ và không dạy chúng như từ vựng hiện đại.

## Ranh giới giáo dục
- 一 二 三 mô phỏng nét ngang, không phải giáo trình đầy đủ thứ tự bút thuận.
- 木/林/森, 人/从/众, 日/月/明 là mẹo học được chọn lọc. Cấu tạo chữ hiện đại không luôn là lịch sử phát sinh duy nhất.
- 妈/媽: 女 gợi nghĩa, 马/馬 gợi âm; mǎ và mā khác thanh điệu.
- TTS trình duyệt không bảo đảm phát thành tiếng và không đo lường phát âm.
- Bốn câu thử đoán là hoạt động hình thành nhận diện, không công bố đạt HSK.

## Chưa thể gọi là nghiệm thu toàn diện
Cần kiểm tra trình duyệt thật kích thước 360px, giọng nói thực tế trên điện thoại và giảng viên tiếng Trung duyệt ngữ nghĩa/Pinyin. Mock DOM và HTTP 200 không thay thế kiểm thử thiết bị.

## Nguồn kiểm tra
- 奻: https://zdic.net/hans/%E5%A5%BB
- 姦: https://dict.concised.moe.edu.tw/dictView.jsp?ID=22771&la=0&powerMode=0
- 媽: https://ctext.org/dictionary.pl?char=%E5%AA%BD&if=en
- 妈 hình thanh: https://www.dong-chinese.com/dictionary/%E5%AA%BD
