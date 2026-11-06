# Chim Sẻ — kế hoạch thực hiện được duyệt ngày 04/11/2026

Người chơi chính: người Việt mới học. Mục tiêu nhịp chơi: một chặng 10–15 phút, 1–2 mục tiêu chính, tối đa hai quyết định lớn. Thời lượng là mục tiêu biên tập, chưa phải số đo người chơi. Truyện rẽ thật, để lại ký ức và hội tụ trước cơ hội học chung; sai bài không làm đổi quan hệ hay kết cục. Giữ nhận diện đang được chủ dự án duyệt, khung tranh trên/học dưới trong một viewport, đúng một Sẻ. Phát triển trên Preview trước.

## Công việc và cổng hoàn thành

| Mốc | Việc / đầu ra | Trạng thái và điều kiện còn lại |
| --- | --- | --- |
| M0 | Cố định baseline `31fa2f1`, nguồn art và các khóa lưu; tách metadata production/Preview; cập nhật tài liệu hiện hành | Đang tích hợp. `docs/DELIVERY_GATES.md` ghi bằng chứng nền tảng thực tế; READY không chứng minh nội dung đã nghiệm thu. |
| M1 | Một chặng mẫu có ngữ cảnh, lựa chọn, hệ quả, vận dụng, tự nhớ và điểm dừng; xem đủ các tuyến | Đang triển khai. Pilot tự nhớ không chấm điểm sau hai nhánh tới trường đã có, lưu trạng thái tiếp tục nhưng không lưu câu trả lời. Chưa có lượt chơi trọn chặng với người mới, đo thời lượng hoặc duyệt chuyên môn. |
| M2 | Rà 10 bài, 12 lựa chọn/37 phương án; ký ức, tranh, Pinyin, gợi ý, sổ tay, ôn tập | Audit đồ thị và dữ liệu tự động; còn vòng duyệt tiếng Trung/người học, kiểm cảnh trên thiết bị thật. |
| M3 | OAuth, đồng bộ hai thiết bị, migration, AI ở truyện mới, email lỗi | Kiểm trên Preview riêng và cơ sở dữ liệu riêng; không sửa production để thử. Ghi riêng kết quả mock và dịch vụ thật. |
| M4 | Thử 10–15 người mới; đo thao tác, hiểu truyện, nhớ sau 24h/7 ngày và vận dụng | Chưa tổ chức; cần người tham gia đồng ý. Mục tiêu pilot: 80% hoàn thành chặng đầu không được chỉ thao tác, không phải chứng nhận học tốt. |
| M5 | Hoàn chỉnh HSK1: nguồn từng mục, bài/cảnh còn thiếu, nghe/ôn, người duyệt | Chưa đủ. 8 mục tiêu hiện có là ứng viên; không công bố đủ bậc từ 10 tình huống. |
| M6 | Thiết kế đầy đủ HSK1–6, làm và phát hành từng bậc | Khung và nguồn locator đã có; bản đồ học chi tiết chưa đủ, HSK2–6 vẫn khóa đến khi từng bậc đạt cổng. |

## Các nhóm thực hiện

- Điều phối/integrator: hợp đồng dữ liệu, thứ tự phụ thuộc, bằng chứng, Preview đúng commit.
- Nội dung: động cơ lựa chọn, lời đáp, ký ức/callback, hội tụ và điểm dừng.
- Học liệu: nguồn HSK 3.0 cố định, câu/Pinyin/giải nghĩa/đáp án, làm quen–vận dụng–tự nhớ, duyệt chuyên môn.
- Trải nghiệm/mỹ thuật: bố cục trước tài sản, người nói/biểu cảm/đồ vật, điện thoại/tablet, bàn phím, trợ năng và âm thanh.
- Nền tảng: save tương thích, revision/conflict, guest/owner, AI fallback/cảnh báo, log tối giản.
- QA: kiểm độc lập kết quả nhóm; CI, mọi phương án/điều kiện, lỗi và phục hồi, thiết bị thật và người học thật.

Ponytail cần điều phối khi công cụ được cung cấp; trong runtime đã kiểm tra lần này không tìm thấy công cụ/plugin Ponytail. ECC đã chia các phần rà soát thành nhóm session/M1, đối chiếu HSK1 và tài khoản/đồng bộ; integrator chịu trách nhiệm ghép và xác minh.

## Hợp đồng và tính trung thực

ID truyện/bài hiện có được giữ nguyên. Đường truyện tách kết quả học. Bằng chứng mới chỉ ghi kết quả, lượt thử, thời điểm có thật, phương thức và nguồn trợ giúp; không giữ nguyên câu trả lời, ghi âm hoặc tự điền thời điểm lịch sử. Xem mẫu khác nhận gợi ý, đúng sau tự sửa khác đúng lần đầu; không trạng thái nào tự chứng minh thành thạo.

Hỏi Sẻ chỉ giải thích khi luyện tập, server xác nhận scene allowlist, không thay chấm bài hoặc state truyện. Gợi ý soạn sẵn hoạt động khi dịch vụ lỗi. Bài tự nhớ không mở AI/sổ câu đã học để tránh làm lộ đáp án. Luyện thêm ngay tách lịch ôn cách quãng.

Các bậc dùng trục truyện: 1 Ngày đầu xa nhà; 2 Người bạn đầu tiên; 3 Hội chợ mùa xuân; 4 Khi mọi chuyện thay đổi; 5 Hai quê hương; 6 Những điều An muốn gửi lại. Trục truyện không thay thế đối chiếu syllabus. Mỗi nguồn/mục tiêu có ID, bậc, phiên bản, kỹ năng, điều kiện làm quen, intro/reuse/recall, gợi ý, đáp án, người duyệt và fingerprint nội dung.

## Nghiệm thu

Kiểm đúng/sai/tự sửa/mẫu/bỏ qua/micro không có; tải lại mọi pha; tua lại không xóa kết quả; bản lưu cũ, lỗi và mới hơn; hai tab/tài khoản/thiết bị và xung đột; desktop/phone dọc-ngang/tablet, phóng chữ, bàn phím, giảm chuyển động. Mọi CTA và nội dung cần đọc không bị cắt; đúng người nói, đồ vật và một Sẻ. Kiểm retry/timeout/rate limit/model-key/email thật; không gọi mock là đã chứng minh dịch vụ. Package từ checkout sạch, đúng commit và quay lui được.

Không thêm tiền ảo, bảng xếp hạng, phạt mất chuỗi, AI sinh cốt truyện/chấm chuẩn, chấm phát âm/viết tay chưa có rubric, CMS lớn hay mở đồng loạt HSK2–6. Không đưa lên tên miền chính tự động.

## Đợt triển khai kỹ thuật đầu tiên

Đã bổ sung phân đoạn 7 chặng trong code, audit đủ 37 phương án và mục tiêu chung; chưa đo được thời lượng chặng với người học. Chặng đầu có lượt tự nhớ tiếng Trung không chấm điểm sau nhánh An nhìn quanh hoặc đi cùng mẹ, trước hoạt động học tiếp theo. Sai được thử lại; gợi ý chỉ mở sau lượt thử; bỏ qua được; save chỉ ghi số lượt/trạng thái/trợ giúp, không ghi câu đã nhập. Hồi tưởng giữ riêng với save truyện và bằng chứng HSK. Phần này đã qua test logic và Edge smoke ở điện thoại dọc; cần mở rộng kiểm tra viewport và kiểm luồng save tích hợp trước khi coi M1 qua cổng.

Tài khoản: lớp snapshot client/server đã được rà riêng cho nâng cấp v1→v2, snapshot phiên bản mới hơn và rollback khi ghi lỗi. Cần chạy lại cùng toàn suite sau khi tích hợp với lượt tự nhớ. Kết quả trên local không chứng minh đồng bộ dịch vụ thật trên Preview.

Sổ tay có ba ngăn; ngăn câu đã gặp/ôn được khóa trong lượt tự nhớ. Bằng chứng từng lần thử theo cùng draft/account snapshot, phân biệt mẫu/gợi ý/tự sửa; save cũ không bị tự điền sự kiện lịch sử. Luyện thêm tối đa 5 bài đã mở ghi riêng với lịch ôn; giữ đuôi 30 sự kiện mỗi bài cùng tổng số/tổng hợp/số đã lược, không gọi đuôi là toàn bộ lịch sử. Có rollback khi ghi localStorage dở, nút thử lưu lại và xuất bản sao nguyên chuỗi JSON bị hỏng.

Đã sửa chiều cao khi phóng 200%, chia phần đọc/hỗ trợ theo vùng đo thực, giữ mốc phần chữ khi phóng trong một lượt học. Bộ nhận diện dùng dấu chữ trên thanh điều khiển khi trong cảnh đã có Sẻ; favicon vẫn là mascot. Preload dùng cảnh gần kế tiếp, không tải toàn bộ truyện.

Đã có audit package/manifest, trigger CI cho module dùng chung, bộ kiểm tra dấu vân tay của 48 đơn vị học liệu (10 bài + 8 mục tiêu pilot + 30 đề xuất tương lai) và ledger duyệt trống. Sửa học liệu làm receipt cũ hết hiệu lực; receipt không tự mở bậc. Bộ hướng dẫn thử người học ở `LEARNER_PILOT_PROTOCOL.md` đã sẵn sàng, chưa có người tham gia.

Neon Preview child và migration 003 đã thực hiện; Vercel Preview có URL DB nhạy cảm riêng theo nhánh. Chưa chứng minh OAuth/đồng bộ/AI/email trên host. Auth vẫn dùng origin production trong mã hiện có, Google callback Preview cần cấu hình phù hợp; email và giới hạn AI dùng chung giữa các instance còn là đầu việc mở. Chưa bổ sung âm thanh đã được giáo viên duyệt, kiểm thiết bị thật, bản đồ học hoàn chỉnh hay phát hành HSK2–6. Các mốc M1–M6 không được đánh dấu hoàn tất chỉ từ đợt code này.
