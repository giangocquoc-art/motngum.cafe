# Chim Sẻ — kế hoạch thực hiện được duyệt ngày 04/11/2026

Người chơi chính: người Việt mới học. Mục tiêu nhịp chơi: một chặng 10–15 phút, 1–2 mục tiêu chính, tối đa hai quyết định lớn. Thời lượng là mục tiêu biên tập, chưa phải số đo người chơi. Truyện rẽ thật, để lại ký ức và hội tụ trước cơ hội học chung; sai bài không làm đổi quan hệ hay kết cục. Giữ nhận diện đang được chủ dự án duyệt, khung tranh trên/học dưới trong một viewport, đúng một Sẻ. Phát triển trên Preview trước.

## Công việc và cổng hoàn thành

| Mốc | Việc / đầu ra | Trạng thái và điều kiện còn lại |
| --- | --- | --- |
| M0 | Cố định baseline `31fa2f1`, nguồn art và các khóa lưu; tách metadata production/Preview; cập nhật tài liệu hiện hành | Đang tích hợp. `docs/DELIVERY_GATES.md` ghi bằng chứng nền tảng thực tế; READY không chứng minh nội dung đã nghiệm thu. |
| M1 | Một chặng mẫu có ngữ cảnh, lựa chọn, hệ quả, vận dụng, tự nhớ và điểm dừng; xem đủ các tuyến | Đang triển khai. Pilot tự nhớ không chấm điểm có màn kết chặng, lưu dừng/tiếp tục tách khỏi đường truyện và đồng bộ snapshot; bản v1 được nâng cấp an toàn. Edge đã rà ba kích thước. Chưa có lượt chơi trọn chặng với người mới, đo thời lượng hoặc duyệt chuyên môn. |
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

Đã bổ sung phân đoạn 7 chặng trong code, audit đủ 37 phương án và mục tiêu chung; chưa đo được thời lượng chặng với người học. Chặng đầu có lượt tự nhớ tiếng Trung không chấm điểm sau nhánh An nhìn quanh hoặc đi cùng mẹ, trước hoạt động học tiếp theo. Sai được thử lại; gợi ý chỉ mở sau lượt thử; bỏ qua được; save chỉ ghi số lượt/trạng thái/trợ giúp, không ghi câu đã nhập. Trạng thái `unassisted` là một lượt tự nhớ không trợ giúp, không phải kết luận đã thành thạo; `independent` cũ được chuẩn hóa tương thích. Hồi tưởng giữ riêng với save truyện và bằng chứng HSK. Edge qua 320×568, 667×375, 1024×768; cả job browser riêng và Real Chromium desktop/mobile đã qua trên SHA `4dbe678`. M1 vẫn chưa qua cổng vì chưa có lượt chơi trọn chặng với người học, đo thời lượng hay duyệt chuyên môn.

Rà độc lập HSK1 phát hiện cue recall ban đầu mơ hồ; copy đã làm rõ mẹ hỏi An có ổn không và An định đáp mình vẫn ổn, mà chưa hiển thị chữ Trung trước lần thử. Các biến thể `我还好` và `我很好，谢谢` nay có Pinyin/nghĩa; từ `你好` được gắn với mục làm quen, không phải danh sách từ bài hỏi thăm. Lựa chọn cốt truyện ghi rõ chọn theo ý tiếng Việt, không cần học thuộc câu Trung. Lời dẫn trước task giới thiệu tên được nối trực tiếp với cô Vương hỏi An; tên dùng thường ngày 安 và tên đầy đủ 明安 được giải thích. Content manifest là 1.0.4. Đây là hiệu chỉnh biên tập, chưa phải duyệt tiếng Trung chuyên môn.

Điểm dừng chặng đầu: sau lượt tự nhớ, An khép lại bằng một phản ứng hợp với kết quả (tự nhớ, có trợ giúp hoặc bỏ qua). Người chơi có thể dừng ở cổng trường; trạng thái được lưu cùng bản snapshot tài khoản và khi tải lại hiện đúng lời khép. Chọn tiếp tục mới đưa An vào bài học kế tiếp. Hợp đồng recall v2 đọc v1 theo cách tương thích; mốc v1 đã hoàn tất được coi là đã đi tiếp để không chặn bản lưu cũ. Kết quả tự nhớ vẫn không chấm điểm và không làm đổi đường truyện. Kiểm tra mới: 405 unit tests, Edge smoke điểm dừng trên 320×568 / 667×375 / 1024×768 và 360 trạng thái trên ba tuyến tích hợp đã qua. Đây là nghiệm thu kỹ thuật tại máy phát triển, chưa phải Preview có đăng nhập, thiết bị vật lý hay nghiên cứu người học.

Tài khoản: lớp snapshot client/server đã được rà riêng cho nâng cấp v1→v2, snapshot phiên bản mới hơn và rollback khi ghi lỗi. Cần chạy lại cùng toàn suite sau khi tích hợp với lượt tự nhớ. Kết quả trên local không chứng minh đồng bộ dịch vụ thật trên Preview.

Sổ tay có ba ngăn; ngăn câu đã gặp/ôn được khóa trong lượt tự nhớ. Bằng chứng từng lần thử theo cùng draft/account snapshot, phân biệt mẫu/gợi ý/tự sửa; save cũ không bị tự điền sự kiện lịch sử. Luyện thêm tối đa 5 bài đã mở ghi riêng với lịch ôn; giữ đuôi 30 sự kiện mỗi bài cùng tổng số/tổng hợp/số đã lược, không gọi đuôi là toàn bộ lịch sử. Có rollback khi ghi localStorage dở, nút thử lưu lại và xuất bản sao nguyên chuỗi JSON bị hỏng.

Đã sửa chiều cao khi phóng 200%, chia phần đọc/hỗ trợ theo vùng đo thực, giữ mốc phần chữ khi phóng trong một lượt học. Bộ nhận diện dùng dấu chữ trên thanh điều khiển khi trong cảnh đã có Sẻ; favicon vẫn là mascot. Preload dùng cảnh gần kế tiếp, không tải toàn bộ truyện.

Đã có audit package/manifest, trigger CI cho module dùng chung, bộ kiểm tra dấu vân tay của 48 đơn vị học liệu (10 bài + 8 mục tiêu pilot + 30 đề xuất tương lai) và ledger duyệt trống. Sửa học liệu làm receipt cũ hết hiệu lực; receipt không tự mở bậc. Bộ hướng dẫn thử người học ở `LEARNER_PILOT_PROTOCOL.md` đã sẵn sàng, chưa có người tham gia.

## Cập nhật pilot câu hỏi thăm — 07/11/2026

Rà lại các câu trả lời được chấp nhận ở lượt đầu cho thấy người mới có thể gặp bốn cách diễn đạt mà chỉ thấy một phần trong mẫu trước khi làm. Giữ nguyên ID bài và toàn bộ đáp án được chấp nhận; bổ sung mẫu có Hanzi, Pinyin, nghĩa Việt và bối cảnh cho `我还好`, câu đáp ngắn `很好 / 还好`, và hai cách cảm ơn. Mỗi cách xuất hiện trên một trang truyện riêng; người chơi có thể quay lại trang trước. Chỉ sau trang cuối mới mở bài luyện và ghi nhận đã xem trợ giúp. Sổ từ và metadata mục tiêu greeting đã được cập nhật; manifest tăng từ 1.0.4 lên 1.0.5. Đây là cập nhật biên tập pilot, chưa phải nội dung được giáo viên/người bản ngữ duyệt và không làm HSK1 thành giáo trình đầy đủ.

Kiểm tra trên Edge ở desktop, điện thoại dọc/ngang và tablet, gồm trạng thái bàn phím: 791 trạng thái bố cục đạt; các trang mẫu giữ nút thao tác trong cùng viewport. Toàn bộ 406 kiểm thử Node đạt; audit đồ thị ghi 42 nút, 12 điểm chọn, 37 phương án, 10 nhiệm vụ chung và không có thiếu hệ quả/hội tụ. Audit gói cục bộ đạt, nhưng báo cáo tiếp tục để CI exact-SHA, deployment/runtime Preview và duyệt chuyên môn ở trạng thái pending. Không có deployment mới hoặc thay đổi production trong lượt này.

Rà soát ôn tập tiếp theo phát hiện 14/14 câu trắc nghiệm đặt đáp án đúng ở vị trí đầu. Renderer nay xoay vòng thứ tự lựa chọn theo ID bài, bậc ôn và lượt hoàn tất đã lưu; bộ chấm vẫn dựa trên ID đáp án, không dựa vào vị trí. Cùng một bản lưu tạo cùng thứ tự sau khi tải lại; các lần nhớ độc lập làm vị trí xoay qua ba lựa chọn. Không đổi schema tiến độ hay lịch 1–3–7–14 ngày. Kiểm thử mới xác nhận phân bố vị trí, xoay theo bậc và khôi phục thứ tự; toàn bộ 407 kiểm thử Node và 791 trạng thái Edge đã qua. Đây là sửa lỗi đo lường trong góc ôn, chưa phải bằng chứng nhớ lâu hoặc duyệt giáo viên.

Neon Preview child và migration 003 đã thực hiện; Vercel Preview có URL DB nhạy cảm riêng theo nhánh. Chưa chứng minh OAuth/đồng bộ/AI/email trên host. Auth vẫn dùng origin production trong mã hiện có, Google callback Preview cần cấu hình phù hợp; email và giới hạn AI dùng chung giữa các instance còn là đầu việc mở. Chưa bổ sung âm thanh đã được giáo viên duyệt, kiểm thiết bị thật, bản đồ học hoàn chỉnh hay phát hành HSK2–6. Các mốc M1–M6 không được đánh dấu hoàn tất chỉ từ đợt code này.

## Rà hệ quả 37 lựa chọn — 07/11/2026

Ba nhóm ECC rà riêng toàn bộ 37 phương án theo ý định, phản hồi tại chỗ, hành động ở cảnh tiếp theo, ký ức đã lưu và callback về sau. Đã sửa sáu mối nối nội dung: ba lựa chọn ở bàn trực không còn tăng quan hệ với người vắng mặt; lời mời chia bát mì giờ cho thấy bát được đặt giữa hai bạn ngay; callback cuối chương khớp hai chữ `再试` An thực sự gạch dưới; câu hỏi An hỏi mẹ nay hỏi nghĩa chữ đúng với cảnh tra từ điển; bà Lưu trả lời thẳng lời hỏi thăm; và lựa chọn thực đơn hỏi cách đọc một chữ mới thay vì lặp lại hai chữ của hôm trước. Các ID, tuyến, đáp án, ký ức và hợp đồng save không đổi.

418 kiểm thử Node và audit đồ thị qua sau các sửa đổi; Playwright/Chromium local đã mở đúng nhánh `day2-liu`, xác nhận lựa chọn hiện câu `奶奶，这个字怎么读？` và phản hồi tiếp theo nói bà chỉ đúng một chữ trên bảng. Việc rà nội dung này không thay thế duyệt tiếng Trung chuyên môn; cảnh tích hợp từng nhánh và chất lượng khác biệt giữa mọi hệ quả vẫn cần nghiệm thu biên tập. M1 còn thiếu lượt chơi người mới và số đo thời lượng.

## Đối chiếu từ vựng ứng viên HSK1 — 07/11/2026

Đã tải PDF syllabus từ liên kết ChineseTest chính thức và xác nhận SHA-256 trùng snapshot đã ghim. Trích lại đầy đủ các trang từ vựng HSK1 bằng script repo; fixture nay chứa 30 dòng từ bậc 1 được các mục tiêu ứng viên tham chiếu, trong đó bổ sung chín liên kết còn thiếu (对、见、可以、您、人、是、谢谢、要、有). Validator kiểm tra serial, trang in, hash và dạng đối chiếu chính xác/gần nhất của từng dòng ứng viên. Tám mục tiêu vẫn ở trạng thái ứng viên, không tăng số mục HSK đã xác minh và không mở bậc.

Rà này cũng ghi rõ ranh giới học liệu: `三个`, `十块钱` và các lời như `明天见` là cụm ghép từ các mục riêng; `面条` chỉ gần với dạng liệt kê `面条儿`; `碗` và `奶奶` được giữ làm từ hỗ trợ trong truyện, không tính là từ vựng HSK1. Task/topic/ngữ pháp/chữ Hán, độ tự nhiên của thoại, Pinyin/diễn giải và duyệt giáo viên vẫn còn mở. Chi tiết nằm trong `HSK3_SOURCE_AUDIT.md`.
