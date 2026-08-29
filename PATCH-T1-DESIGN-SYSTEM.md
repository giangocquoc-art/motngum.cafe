# Patch T1 — Five-theme design system

## Mục tiêu

Tạo nền tảng thiết kế cho demo “một thương hiệu thật — năm cách thiết kế” trước khi thay logo, ảnh và layout ở các patch sau.

## 5 hướng thiết kế công khai

| # | Theme | Tính cách | Nhóm website phù hợp |
|---|---|---|---|
| 01 | F&B / Warm Café | Organic, tactile, product-first | Café, nhà hàng, bakery, đồ uống |
| 02 | Luxury / Editorial | Refined, quiet luxury, nhiều khoảng thở | Beauty, hospitality, premium brand |
| 03 | Tech / Digital | Grid, glass, high contrast | SaaS, AI, startup, technology |
| 04 | Minimal / Clean | Essential, whitespace, conversion-first | Dịch vụ, B2B, personal brand |
| 05 | Creative / Playful | Bold shape, playful, expressive | Lifestyle, retail, Gen Z, creative studio |

## Source of truth

`data/theme-design.ts` là registry trung tâm cho tên theme, mô tả, use-case và palette.

`data/industries.ts` vẫn giữ lớp compatibility hiện tại, nhưng lấy tên/description từ registry mới.

## CSS tokens được chuẩn hóa

Mỗi theme hiện có riêng:

- `--industry-accent`, `--industry-accent-2`, `--industry-accent-soft`
- `--industry-hero`, `--industry-hero-2`, `--industry-surface`, `--industry-surface-2`
- `--industry-ink`, `--industry-muted`, `--industry-line`
- `--theme-font-display`, `--theme-font-body`
- `--theme-card-radius`, `--theme-button-radius`, `--theme-image-radius`
- `--theme-border-width`
- `--theme-shadow`, `--theme-shadow-hover`
- `--theme-section-space`
- `--theme-letter-spacing`
- `--theme-motion`

Patch T6/T7 sẽ dùng các token này để làm layout/component variants thật sự khác nhau.

## Compatibility note

T1 cố ý giữ id nội bộ cũ (`beauty`, `services`, `retail`) để không làm vỡ selector/storage trong cùng patch. T2 sẽ chịu trách nhiệm migrate theme engine sang tên semantic mới và tương thích localStorage cũ.

## Không thuộc T1

- Chưa thay logo động — T4.
- Chưa gắn bộ ảnh sản phẩm mới — T5.
- Chưa thay hero layout mạnh — T6.
- Chưa biến toàn bộ cards/components thành variants — T7/T8.
