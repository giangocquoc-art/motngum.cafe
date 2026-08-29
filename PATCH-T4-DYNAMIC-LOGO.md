# PATCH T4 — Dynamic Logo System

## Mục tiêu

Biến `motngum.cafe` thành một brand system có thể đổi art direction theo 5 theme mà vẫn nhận ra là cùng một thương hiệu.

Brand anchor giữ xuyên suốt:

- tên `motngum.cafe`;
- motif hạt cà phê với đường cong giữa hạt;
- sản phẩm F&B Một Ngụm là ngữ cảnh chính;
- không biến mỗi theme thành một thương hiệu hoàn toàn khác.

## 5 logo directions

### 01 — Warm Café

Giữ nguyên wordmark thật đang dùng của Một Ngụm làm logo gốc. Đây là mốc nhận diện để so sánh với bốn interpretation còn lại.

### 02 — Luxury / Editorial

- coffee-bean medallion;
- serif wordmark viết hoa;
- đường kẻ mảnh và nhịp chữ rộng;
- cảm giác campaign / hospitality / premium brand.

### 03 — Tech / Digital

- bean nằm trong circuit frame;
- node và corner kỹ thuật;
- typography mono;
- accent cyan theo Tech theme.

### 04 — Minimal / Clean

- một bean icon;
- một dòng `motngum.cafe`;
- không ornament;
- ưu tiên tính rõ ràng ở kích thước nhỏ.

### 05 — Creative / Playful

- bean đặt trên hai blob cam/mint;
- wordmark chia nhịp `mot` + `ngum` + `.cafe`;
- hình khối vui nhưng vẫn giữ tên thương hiệu nguyên vẹn.

## Thay đổi kỹ thuật

### `components/ThemeLogoArtwork.tsx`

Component artwork thuần nhận `themeId` và render đúng lockup. Có `compact` và `markOnly` để dùng ở header, footer và theme preview.

### `components/BrandMark.tsx`

`BrandMark` đọc theme hiện tại qua `useShowcaseTheme()` và tự chọn logo tương ứng. API cũ (`href`, `compact`, `className`) được giữ để Header/Footer không phải thay đổi cấu trúc.

### `components/ThemePreview.tsx`

Mini browser preview trong theme selector hiện mang đúng icon/logo mark của từng art direction.

### `components/ThemeProvider.tsx`

Khi theme đổi:

- favicon được tạo lại theo palette theme;
- `<meta name="theme-color">` được đồng bộ;
- vẫn dùng chung Theme Engine T2.

### `app/industry.css`

Thêm toàn bộ logo tokens/lockups, responsive rules, theme-preview integration và reduced-motion support.

## Kiểm tra

- TypeScript/TSX transpile các file T4: OK.
- CSS braces: OK.
- `git diff --check`: OK.
- Patch được kiểm tra apply trên source sau T3.

## Patch tiếp theo

T5 — Theme Product Image System: gắn bộ ảnh sản phẩm theo theme vào dữ liệu và component, để khi đổi theme thì không chỉ UI/logo đổi mà cả art direction ảnh ly cà phê cũng đổi đồng bộ.
