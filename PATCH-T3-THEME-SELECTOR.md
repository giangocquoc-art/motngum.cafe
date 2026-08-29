# Patch T3 — Interactive Theme Selector

## Mục tiêu
Biến chức năng đổi giao diện thành một phần trình diễn năng lực thiết kế dễ hiểu ngay bằng mắt, thay vì một nút đổi màu đơn thuần.

## Thay đổi chính

### 1. Selector đầy đủ tại `/studio`
- Headline mới: **Một thương hiệu. Năm cách thiết kế.**
- 5 card theme có mini website preview.
- Cùng dùng một ly cà phê sữa trong preview để so sánh art direction trên cùng một sản phẩm.
- Hiển thị tên direction, mô tả, use-case, palette và trạng thái đang chọn.
- Bấm card đổi theme ngay, không reload trang.

### 2. Mini preview riêng cho từng direction
Component mới `ThemePreview.tsx` tạo 5 ngôn ngữ preview:
- Warm Café: organic, rounded, product-first.
- Luxury: editorial, nhiều khoảng thở, đường nét tinh gọn.
- Tech: dark grid, cyan/glass, high contrast.
- Minimal: trắng sạch, hầu như không trang trí.
- Creative: orange/mint, shape bất đối xứng, playful.

### 3. Quick switch ở header
Component mới `ThemeQuickSwitch.tsx` hiển thị theme hiện tại và mở selector modal.
- Desktop: compact để không phá navigation.
- Tablet: thu thành icon khi thiếu chỗ.
- Mobile: trở thành một hàng đầy đủ trong menu.

### 4. Quick switch ngay tại hero
Homepage có control **Website đang xem / Thử 5 style** để khách hiểu ngay website là một interactive showcase.

### 5. Modal selector nâng cấp
Modal dùng cùng mini-preview như Studio, có 5 theme card, use-case, palette, active state và mobile horizontal swipe.

### 6. Accessibility / motion
- Button dùng `aria-pressed` cho theme đang chọn.
- Quick switch có accessible label chứa theme hiện tại.
- Hỗ trợ `prefers-reduced-motion`.

## File mới
- `components/ThemePreview.tsx`
- `components/ThemeQuickSwitch.tsx`

## File chỉnh sửa
- `components/ThemeStyleRail.tsx`
- `components/ThemeProvider.tsx`
- `components/Header.tsx`
- `components/IndustryHero.tsx`
- `app/studio/page.tsx`
- `app/industry.css`

## Ghi chú cho T4
T3 chỉ tạo preview/selector. Logo trên header/footer vẫn dùng brand mark hiện tại. Patch T4 sẽ xây `ThemeLogo` để cùng một thương hiệu có 5 cách render logo theo theme mà không làm mất nhận diện gốc.
