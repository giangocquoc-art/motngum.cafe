# Patch T11 — Responsive Art Direction

Mục tiêu: mobile/tablet phải là một layout được thiết kế riêng cho từng art direction, không phải bản desktop bị co nhỏ.

## Breakpoints được rà soát

- Laptop nhỏ: `<= 1180px`
- Tablet ngang / tablet: `<= 900px`
- Mobile navigation: `<= 820px`
- Điện thoại: `<= 640px`
- Bottom-sheet selector: `<= 520px`
- Phone phổ biến: `<= 430px`
- Compact phone: `<= 390px`

## 1. Header / mobile navigation

- Menu mobile trở thành viewport sheet có `max-height`, scroll nội bộ và safe-area ở đáy.
- Khóa scroll của document khi menu mở bằng `data-mobile-nav="open"`.
- Tự đóng menu khi viewport resize trở lại desktop.
- Nav links có touch target tối thiểu ~46–50px.
- Theme switch và CTA Café/Studio được giữ đầy đủ trong sheet.
- Mỗi theme có surface riêng:
  - Warm Café: soft card.
  - Luxury: sheet vuông, editorial.
  - Tech: dark grid / cyan.
  - Minimal: list line-based.
  - Creative: border dày + offset shadow.

## 2. Hero responsive riêng 5 theme

### Warm Café
- Product-first.
- Giữ props F&B nhẹ trên tablet, tự bỏ side products ở phone hẹp.
- Ly giữ độ lớn đủ ngon mắt nhưng không tràn viewport.

### Luxury
- Không center mọi thứ khi xuống tablet.
- Copy và photography vẫn có khoảng thở kiểu magazine.
- Mobile bỏ floating product labels để hero sạch.

### Tech
- Console được nén lại thay vì phóng to.
- Proof/telemetry trên mobile trở thành horizontal strip có thể cuộn.
- Product frame giữ dark/cyan contrast.

### Minimal
- Giữ left alignment và strict reading order.
- Proof biến thành các dòng có divider.
- Product frame gần full-width, bỏ floating product card.

### Creative
- Giữ bất đối xứng nhưng giảm overlap.
- Poster shape vẫn hiện diện; product card / side props được giảm theo viewport.
- Ở phone hẹp, ưu tiên poster + ly + CTA.

## 3. Theme selector

- Studio selector dùng horizontal swipe + scroll-snap trên tablet/mobile.
- Ẩn scrollbar nhưng vẫn scroll bằng touch/trackpad.
- Modal selector chuyển thành bottom sheet ở `<=520px`.
- Card width được điều chỉnh riêng cho 430/390px để không bị cắt nội dung.

## 4. Menu product gallery

Mobile vẫn giữ khác biệt giữa 5 theme:

- Warm Café: gallery 2 cột, hình sản phẩm lớn, copy được rút gọn ở phone hẹp.
- Luxury: editorial row ngang, ảnh trái / nội dung phải.
- Tech: product nodes 2 cột, description ẩn trên phone để tránh card quá cao.
- Minimal: list row nhỏ gọn, image 76–90px.
- Creative: bento 2 cột, giữ border/offset language nhưng bỏ transform gây overlap.

## 5. Case study / form / brand bridge

- Design Inspector về 1 cột trên mobile.
- CTA conversion thành full-width touch controls.
- Lead form về 1 cột; input/select/textarea có font-size 16px để tránh iOS zoom.
- Brand Bridge về một flow dọc; Minimal vẫn giữ index + content grid nhỏ.
- Footer về 1 cột ở phone.

## 6. Accessibility / motion liên quan responsive

- Mobile menu vẫn đóng bằng Escape từ patch trước.
- `prefers-reduced-motion` không dùng animated scrolling.
- Touch targets được tăng kích thước.
- Safe-area bottom được tính cho menu / selector.

## Verification

- `components/Header.tsx` transpile với TypeScript: OK.
- `app/industry.css` parse bằng `tinycss2`: 0 parse errors.
- CSS brace count: cân bằng.
- `git diff --check`: OK.
- Full production build chưa được chạy vì workspace hiện không có `node_modules`.
