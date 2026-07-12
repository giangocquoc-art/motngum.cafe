# Chiến lược SEO Một Ngụm — 2026

Ngày lập: 11/07/2026

## Mục tiêu thực tế

Mục tiêu đầu tiên là giúp Google lập chỉ mục đầy đủ website, nhận diện đúng từng nhóm dịch vụ và bắt đầu có impression cho các truy vấn dài có ý định rõ. Không cam kết vị trí cụ thể hoặc “top toàn bộ từ khóa”, vì thứ hạng còn phụ thuộc cạnh tranh, lịch sử domain, backlink, hồ sơ doanh nghiệp và phản hồi người dùng.

Baseline tại thời điểm audit:

- Truy vấn `site:motngum.cafe` chưa trả về kết quả rõ ràng.
- Website đã có HTTPS, robots.txt, sitemap.xml, canonical và HTML render phía máy chủ.
- Trang dịch vụ có nội dung thật nhưng còn thiếu cụm bài hỗ trợ và schema riêng.
- Metadata trang con trước đây làm mất ảnh Open Graph do ghi đè object; đã được sửa bằng helper dùng chung.
- Chưa có quyền truy cập Google Search Console, GA4 hoặc Keyword Planner nên chưa có số liệu volume, impression, click và conversion thật.

## Nhóm khách hàng và cụm từ khóa

| Nhóm khách hàng | Ý định chính | Từ khóa trụ cột | Trang đích |
|---|---|---|---|
| Chủ shop, cá nhân kinh doanh, doanh nghiệp nhỏ | Tìm đơn vị làm website | thiết kế website cho doanh nghiệp nhỏ; thiết kế website TP.HCM; landing page giá hợp lý | `/dich-vu/thiet-ke-website` |
| Shop bán hàng, đội chăm sóc khách | Tìm chatbot để trả lời và thu lead | chatbot AI cho website; chatbot AI bán hàng; chatbot chăm sóc khách hàng | `/dich-vu/chatbot-ai` |
| Nhân viên văn phòng, đội vận hành | Thuê làm sạch và gộp file | dịch vụ xử lý dữ liệu Excel; gộp file Excel; xử lý dữ liệu Google Sheets | `/dich-vu/xu-ly-du-lieu` |
| Doanh nghiệp nhỏ có nhiều việc tay | Giảm nhập liệu và báo cáo lặp lại | tự động hóa công việc văn phòng; tự động hóa quy trình doanh nghiệp nhỏ | `/dich-vu/tu-dong-hoa-quy-trinh` |
| Chủ shop, đội marketing nhỏ | Tìm hướng đi và dịch vụ marketing | marketing cho doanh nghiệp nhỏ; tư vấn marketing miễn phí; marketing cho chủ shop | `/tu-van-marketing` |
| Người mới, nhân viên văn phòng, chủ shop | Tìm lớp AI thực hành | khóa học AI cho người mới tại TP.HCM; học AI cho dân văn phòng | `/dao-tao-ai` |

## Kiến trúc hub–spoke đã triển khai

Hub: `/kien-thuc`

Các bài trụ cột:

1. `/kien-thuc/thiet-ke-website-cho-doanh-nghiep-nho`
2. `/kien-thuc/chatbot-ai-cho-website-ban-hang`
3. `/kien-thuc/tu-dong-hoa-cong-viec-van-phong`
4. `/kien-thuc/dich-vu-xu-ly-du-lieu-excel-google-sheets`
5. `/kien-thuc/marketing-cho-doanh-nghiep-nho-ngan-sach-thap`
6. `/kien-thuc/khoa-hoc-ai-cho-nguoi-moi-tphcm`
7. `/kien-thuc/chi-phi-thiet-ke-landing-page-cho-shop-nho`
8. `/kien-thuc/checklist-du-lieu-truoc-khi-lam-chatbot-ai`
9. `/kien-thuc/ngan-sach-chay-quang-cao-facebook-cho-shop-nho`
10. `/kien-thuc/quan-ly-binh-luan-tin-nhan-fanpage-cho-shop`
11. `/kien-thuc/lich-dang-bai-30-ngay-cho-shop-nho`

Mỗi bài có:

- Một từ khóa chính và nhóm biến thể cùng ý định.
- Đoạn trả lời nhanh có thể đứng độc lập.
- Heading theo câu hỏi hoặc quyết định thật của người đọc.
- FAQ hiển thị trên trang và JSON-LD tương ứng.
- BlogPosting, BreadcrumbList, canonical và metadata chia sẻ.
- Liên kết đến dịch vụ, form tư vấn và ba bài liên quan.
- Tác giả tổ chức, ngày xuất bản và ngày cập nhật.
- Mục lục có liên kết neo, nguyên tắc biên tập và ảnh Open Graph riêng theo bài.
- Bài liên quan được ưu tiên theo cùng dịch vụ và cụm chủ đề.

Kiểm tra kỹ thuật tự động:

```powershell
npm run seo:audit -- https://motngum.cafe
npm run indexnow:submit
```

Audit kiểm tra URL trong sitemap, status, title, description, canonical, H1, robots,
Open Graph, JSON-LD, liên kết nội bộ, ảnh chia sẻ và độ dài tối thiểu của bài kiến thức.
Lệnh IndexNow thông báo các URL mới hoặc vừa cập nhật cho Bing và các công cụ tìm kiếm
tham gia giao thức; lệnh này không thay thế Google Search Console.

## Thứ tự triển khai ngoài website

### 0–14 ngày: lập chỉ mục

1. Xác minh domain trong Google Search Console.
2. Gửi `https://motngum.cafe/sitemap.xml`.
3. Dùng URL Inspection cho trang chủ, `/dich-vu`, `/kien-thuc` và sáu bài trụ cột.
4. Kiểm tra Coverage/Pages để xử lý `Crawled - currently not indexed`, canonical hoặc redirect nếu có.
5. Kết nối GA4 và đặt conversion cho gửi form, click điện thoại và click email.

Điều kiện thất bại: sau 14 ngày từ lúc gửi sitemap mà trang chủ vẫn chưa được lập chỉ mục. Khi đó kiểm tra URL Inspection, DNS/canonical, phản hồi máy chủ và manual action trước khi viết thêm nội dung.

### 15–60 ngày: xây tín hiệu thật

1. Hoàn thiện Google Business Profile đúng mô hình hoạt động; không tạo địa chỉ giả.
2. Đồng bộ tên Một Ngụm, số `0583 799 593`, email và domain trên các hồ sơ chính thức.
3. Đăng ảnh thật, lịch bán hoặc khu vực phục vụ và cập nhật giờ khi có dữ liệu ổn định.
4. Xin đánh giá thật từ khách đã mua hoặc đã được tư vấn; không mua review.
5. Tạo 2–4 case study có dữ liệu đã được khách cho phép: vấn đề, phạm vi, cách làm, kết quả và giới hạn.

Điều kiện thất bại: các trang có impression nhưng không tăng vị trí sau 6–8 tuần. Khi đó cần so sánh nội dung với top SERP, bổ sung bằng chứng/case study và backlink liên quan thay vì tăng mật độ từ khóa.

### 30–90 ngày: mở rộng nội dung theo dữ liệu Search Console

Chỉ tạo bài mới từ query có impression hoặc câu hỏi khách thực sự hỏi. Các spoke dự kiến:

- Website bán hàng hay fanpage: khi nào cần cả hai?
- Chatbot AI khác chatbot kịch bản ở điểm nào?
- Cách gộp nhiều file Excel mà không mất dữ liệu.
- Báo cáo nào nên tự động hóa đầu tiên?
- Kế hoạch marketing 30 ngày cho chủ shop.
- Prompt AI cho email, báo cáo và nội dung bán hàng.

Không tạo hàng loạt trang quận/phường có nội dung gần giống nhau. Chỉ tạo trang địa điểm khi Một Ngụm thực sự có điểm bán, lịch hoạt động hoặc bằng chứng phục vụ riêng tại khu vực đó.

## Chỉ số theo dõi

| Chỉ số | 30 ngày đầu | 60–90 ngày | Cách đọc |
|---|---:|---:|---|
| Trang hợp lệ trong Search Console | 100% URL trong sitemap quan trọng | Duy trì | Không tính các URL kỹ thuật không cần index |
| Query có impression | Bắt đầu xuất hiện | Tăng theo tháng | Ưu tiên query đúng khách hàng, không chỉ tổng số |
| CTR organic | Lấy baseline | Cải thiện theo trang | Chỉ sửa title sau khi có đủ impression |
| Vị trí từ khóa dài | Lấy baseline | Tiến dần vào top 20/top 10 | Theo dõi theo URL, tránh hai trang cùng tranh một query |
| Lead organic | Thiết lập đo | Tăng đều | Gửi form, click gọi, click email |

## Nguyên tắc nội dung

- Viết cho người có vấn đề thật; không viết theo số chữ hoặc mật độ từ khóa cứng.
- Không bịa case study, số khách hàng, chứng chỉ, review hoặc kết quả.
- Từ khóa chính xuất hiện tự nhiên ở title, H1, đoạn mở và heading phù hợp.
- Cập nhật bài khi giá, công cụ, quy trình hoặc chính sách thay đổi.
- Ghi rõ ai viết, vì sao viết và cách thông tin được kiểm tra.
- Ưu tiên ảnh/quy trình thật, ví dụ thật và tài liệu bàn giao đã ẩn dữ liệu khách hàng.

## Nguồn phương pháp

- Google Search Central — SEO Starter Guide: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google Search Central — Helpful, reliable, people-first content: https://developers.google.com/search/docs/fundamentals/creating-helpful-content
- Google Search Central — LocalBusiness structured data: https://developers.google.com/search/docs/appearance/structured-data/local-business
- Claude SEO public skill: https://github.com/AgriciDaniel/claude-seo
