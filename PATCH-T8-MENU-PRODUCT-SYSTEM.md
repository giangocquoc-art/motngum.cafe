# Patch T8 — Menu Product System

## Mục tiêu

Mở rộng Theme Product Image System từ một ly hero sang toàn bộ 7 món menu. Cùng một món giữ nguyên sản phẩm, logo và dữ liệu; phần art direction thay đổi theo Warm Café, Luxury, Tech, Minimal và Creative.

## Asset

- 7 món × 5 theme = **35 WebP**.
- Nằm tại `public/assets/theme-products/menu/<theme>/<slug>.webp`.
- Tổng dung lượng khoảng **1.27 MB**, trung bình khoảng **36 KB/ảnh**.
- Ly thật/cutout gốc được giữ nguyên để tránh AI làm sai hình dáng sản phẩm hoặc chữ trên ly.
- Theme thay đổi môi trường: ánh sáng, nền, platform, grid, marble, shape và cách trình bày.

## Code

- `data/theme-products.ts`: thêm 7 menu slug, art-direction map và `getThemeMenuProduct()`.
- `components/ThemeMenuProductImage.tsx`: client image component đọc theme hiện tại và chỉ render asset tương ứng.
- `components/ThemeMenuArtDirectionBar.tsx`: giải thích theme ảnh đang xem và mở theme picker.
- `components/CoffeeMenu.tsx`: toàn bộ menu `/menu` dùng ảnh theo theme.
- `components/IndustryShowcase.tsx`: menu showcase trên homepage cũng đổi ảnh theo theme.
- `app/industry.css`: full-bleed themed product plate, hover/transition và responsive riêng theo theme.

## Performance

Mỗi product component chỉ render một `src` của theme hiện tại. Theme khác không được preload. Khi đổi theme, React remount ảnh bằng key `<theme>-<slug>` và Next/Image tải asset mới theo nhu cầu.

## Fallback

Nếu sau này thêm một menu slug chưa có bộ theme, component vẫn có `fallbackSrc` về ảnh sản phẩm gốc.
