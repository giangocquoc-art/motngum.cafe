# Patch T9 — Interactive Case Study / Lead Conversion

## Mục tiêu
Biến `/studio` từ một trang giới thiệu năng lực thành một case study tương tác có khả năng chuyển đổi lead. Người xem phải hiểu rõ: đây là cùng Một Ngụm Café, cùng sản phẩm và dữ liệu, nhưng được diễn giải bằng 5 art direction khác nhau.

## Thay đổi chính
- Nâng `StudioCaseStudy` bằng một **Design Inspector** phản ứng theo theme đang chọn.
- Hiển thị số thứ tự theme, tên art direction, design language và bảng màu hiện tại.
- Preview trực tiếp Cà phê sữa theo ảnh theme đang xem.
- Phân tích 5 lớp thay đổi: logo, photography, layout, component và motion.
- Làm rõ 5 lớp giữ nguyên: brand, sản phẩm/data, conversion path, nền tảng SEO/responsive và accessibility.
- Thêm CTA động: **“Muốn website của bạn theo hướng {theme}?”**.
- CTA cuộn thẳng xuống form tư vấn.
- Form mặc định chọn `Thiết kế website` thay vì `Tư vấn marketing` trên `/studio`.
- Theme đang xem được gửi kèm payload lead dưới trường `selectedTheme` và được đưa vào email/fallback mail.
- Form hiển thị chip “Art direction gửi kèm” để người dùng biết lựa chọn của họ được giữ lại.
- Thêm `data/theme-case-study.ts` để tách nội dung giải thích 5 art direction khỏi component UI.
- Styling riêng cho Warm Café, Luxury, Tech, Minimal và Creative; có responsive + reduced-motion.

## Luồng chuyển đổi mới
1. Khách thử 5 theme.
2. Design Inspector giải thích theme đang xem thay đổi những gì.
3. Khách bấm “Bắt đầu với style này”.
4. Trang cuộn tới form tư vấn.
5. Form tự gửi kèm art direction hiện tại.
6. Lead nhận được có cả dịch vụ và style khách đang thích.

## File chính
- `components/StudioCaseStudy.tsx`
- `components/LeadForm.tsx`
- `data/theme-case-study.ts`
- `app/api/leads/route.ts`
- `app/studio/page.tsx`
- `app/industry.css`

## Ghi chú
`selectedTheme` được lưu vào payload API và vì payload Google Sheets hiện gửi toàn bộ `lead`, Apps Script phía nhận có thể cần thêm cột nếu muốn hiển thị trường này thành một cột riêng. Email Resend đã hiển thị trực tiếp art direction trong nội dung lead.
