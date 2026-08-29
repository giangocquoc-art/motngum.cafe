# Patch T14 — SEO / Technical SEO

Mục tiêu của patch này là để Google hiểu đúng hai lớp nội dung của motngum.cafe mà không biến 5 theme thành 5 bản nội dung trùng nhau:

- **Một Ngụm Café** là thực thể F&B tại Bình Thạnh, gắn với menu và ShopeeFood.
- **Một Ngụm Studio** là thực thể cung cấp thiết kế website / giải pháp số, đồng thời là tác giả của phần kiến thức chuyên môn.
- **Theme switcher chỉ là presentation layer**: không tạo URL theme riêng, không tạo canonical riêng và không thêm 5 bản vào sitemap.

## Thay đổi chính

1. Tạo `lib/seo-entities.ts` làm nguồn ID thống nhất cho Organization, Café, Studio và WebSite.
2. Metadata trang gốc tập trung F&B; chuẩn hóa cách gọi `Cà phê · Matcha · Cacao`.
3. Thêm GoogleBot preview directives (`max-image-preview`, `max-snippet`, `max-video-preview`).
4. `/studio` có metadata riêng, Open Graph riêng và JSON-LD `WebPage + CreativeWork + BreadcrumbList` cho case study 5 art direction.
5. `/menu` có JSON-LD `Menu`, chia `MenuSection` và giữ 7 `MenuItem` theo dữ liệu thật hiện có.
6. `/dich-vu` có `CollectionPage + ItemList`; từng trang dịch vụ trỏ `provider` về Một Ngụm Studio thay vì Café/root organization.
7. Breadcrumb trang dịch vụ được sửa từ `/bang-gia?category=services` về `/dich-vu` để đúng cấu trúc thông tin.
8. Đào tạo AI, tư vấn marketing và phần kiến thức đều dùng Studio làm provider/author/publisher phù hợp.
9. Bài kiến thức có Open Graph `publishedTime` và `modifiedTime` theo dữ liệu bài viết.
10. `/qr` là landing utility nên đặt `noindex, follow` và loại khỏi sitemap; `/api/` được chặn crawl trong robots.txt.
11. Root OG chỉ nói về Café; các trang Studio/dịch vụ dùng `/studio/opengraph-image` để không trộn intent F&B với intent thiết kế web.
12. Bỏ `InStock` khỏi schema dịch vụ vì website không có dữ liệu tồn/khả dụng realtime để chứng minh trạng thái đó.
13. `dateModified` của chính sách bảo mật được cập nhật 29/08/2026 vì nội dung chính sách đã được sửa trong chuỗi patch hiện tại.

## Canonical và 5 theme

`warm-cafe`, `luxury`, `tech`, `minimal`, `creative` được lưu bằng localStorage và render trên cùng URL. Vì vậy:

- `/` vẫn canonical `/`.
- `/menu` vẫn canonical `/menu`.
- `/studio` vẫn canonical `/studio`.
- không tạo `?theme=...` để index;
- không thêm theme vào sitemap;
- structured data mô tả nội dung/thực thể, không mô tả 5 theme như 5 trang riêng;
- các link tư vấn không còn gắn `?theme=...` vì LeadForm đã đọc theme hiện tại từ ThemeProvider/localStorage.

## Kiểm tra đã chạy

- TypeScript/TSX syntax transpile cho toàn bộ file thay đổi: **OK**.
- `git diff --check`: **OK**.
- kiểm tra `/qr` noindex và không còn trong sitemap: **OK**.
- kiểm tra service provider trỏ Studio và breadcrumb trỏ `/dich-vu`: **OK**.
- kiểm tra thuật ngữ menu `Cà phê / Matcha / Cacao`: **OK**.

Full production build chưa được xác nhận trong workspace này vì source hiện không có `node_modules`.
