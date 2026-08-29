# PATCH T10 — Café ↔ Studio Content Logic

## Mục tiêu

Biến Một Ngụm thành **một thương hiệu có hai hành trình rõ ràng** thay vì tạo cảm giác ghép một website Café với một website dịch vụ:

- **Một Ngụm Café**: hoạt động F&B thật, xem menu/địa chỉ và đi tới ShopeeFood.
- **motngum.cafe**: website thật đang phục vụ hoạt động Café.
- **Một Ngụm Studio**: lớp "behind the site", dùng chính website đó như case study sống cho năng lực thiết kế website.

## Thay đổi chính

### 1. BrandBridge mới

`components/BrandBridge.tsx` kể một mạch 3 bước:

1. Sản phẩm thật — Một Ngụm Café.
2. Website thật — motngum.cafe.
3. Case study sống — Một Ngụm Studio.

Component có hai biến thể `home` và `studio` để câu chuyện phù hợp với ngữ cảnh đang xem.

### 2. Homepage không còn pivot đột ngột sang dịch vụ số

Block teaser cũ kiểu "Bạn đến đây vì website, AI hay tự động hóa?" được thay bằng câu chuyện:

> Ly cà phê là sản phẩm. Website cũng là sản phẩm.

Khách Café vẫn hoàn thành được hành trình mua hàng trước, rồi mới được mời xem chính website đó dưới góc nhìn case study.

### 3. Studio xác nhận nguồn gốc từ một bài toán thật

Intro Studio đổi thành:

> Một website dùng thật. Năm cách thiết kế thật.

Ngay sau intro có BrandBridge biến thể Studio để giải thích Studio không dựng một template giả; nó bắt đầu từ thương hiệu F&B thật.

### 4. Header đổi CTA theo hành trình

- Ở Café: CTA chính là `Đặt món`, link phụ dẫn tới `Studio / Thiết kế web`.
- Ở Studio/dịch vụ: CTA chính là `Nhận tư vấn`, link phụ vẫn giữ đường về `Café / Đặt món`.

Nhờ vậy mục tiêu conversion thay đổi theo ngữ cảnh nhưng hai phần của thương hiệu vẫn luôn kết nối.

### 5. Footer giải thích kiến trúc thương hiệu

Footer hiển thị rõ `Một Ngụm Café × Một Ngụm Studio`, đồng thời nhóm link theo hai hành trình thay vì danh sách điều hướng chung thiếu ngữ cảnh.

### 6. Dịch vụ ưu tiên website trước

Copy ở `/studio` và `/dich-vu` được chỉnh để website là điểm bắt đầu; AI, dữ liệu và tự động hóa chỉ là lớp bổ sung khi thật sự giải quyết điểm nghẽn.

### 7. Case study và CTA liền mạch hơn

- Heading case study đổi thành `Một thương hiệu thật. Hai hành trình thật.`
- CTA trong story quay về form tư vấn Studio thay vì đẩy sang một route marketing khác.
- Theme đang chọn vẫn được Theme Engine/LeadForm giữ nguyên từ Patch T9.

## Files

- `components/BrandBridge.tsx` — mới
- `app/page.tsx`
- `app/studio/page.tsx`
- `app/dich-vu/page.tsx`
- `app/layout.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/StudioCaseStudy.tsx`
- `components/IndustrySections.tsx`
- `app/industry.css`
- `README.md`

## Kiểm tra

- TypeScript/TSX syntax transpile: OK.
- CSS brace balance: OK.
- `git diff --check`: OK.
- Patch apply-check trên source T9 sạch: OK.

Full production build/lint chưa được xác nhận vì workspace artifact không chứa `node_modules`; giới hạn này giống các patch trước.
