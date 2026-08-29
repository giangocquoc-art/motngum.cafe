# Patch T7 — Component Variants

## Mục tiêu

Mở rộng hệ 5 theme từ Hero sang toàn bộ các component quan trọng, để việc đổi theme thay đổi cách trình bày chứ không chỉ đổi màu.

## Phạm vi

Patch bổ sung các hook ổn định cho:

- Coffee menu
- Service cards
- Knowledge cards
- Lead form
- Studio case study
- Story / problem sections
- Footer

Các section heading và CTA dùng selector dùng chung nên không cần đổi markup ở từng page.

## Hành vi theo theme

### Warm Café
- Card bo tròn, nền ấm và shadow mềm.
- Hover có độ nổi nhẹ.
- Heading có accent line ngắn.
- Form giữ cảm giác gần gũi, mềm.

### Luxury / Editorial
- Hairline, góc vuông, giảm shadow.
- Menu chuyển thành card 2 cột kiểu editorial.
- Service/knowledge card gần dạng magazine grid.
- Form dùng underline input.
- Case study thành spread có đường phân cách.
- Footer tối, sang và tiết chế.

### Tech / Digital
- Card nền navy tối, viền cyan.
- Grid background và micro-label kiểu interface.
- Form thành console panel.
- Case study/footer dùng dark system đồng bộ.
- CTA cyan có glow nhẹ.

### Minimal / Clean
- Card chuyển thành row/list.
- Gần như bỏ radius/shadow.
- Heading dùng rule đen, typography uppercase.
- Form dùng đường kẻ thay hộp input.
- Case study xếp 1 cột, footer cực gọn.

### Creative / Playful
- Card có border dày, orange/mint, offset shadow.
- Menu dùng bento grid.
- Heading dạng poster.
- Form/case study có asymmetric radius.
- Footer thêm shape trang trí.

## Responsive

Các layout đặc biệt tự thu về 1–2 cột ở tablet/mobile; Minimal row và Luxury editorial card chuyển về cấu trúc gọn hơn để tránh ép nội dung.

## Accessibility

- Không thay semantic HTML hiện tại.
- Không dùng màu làm tín hiệu duy nhất cho trạng thái tương tác.
- Giữ focus handling hiện có của form/link/button.
- `prefers-reduced-motion` tắt transition của component variants.

## Kiểm tra

- TypeScript transpile: OK cho toàn bộ TSX đã sửa.
- CSS brace balance: OK.
- `git diff --check`: OK.
- Patch được kiểm tra apply sạch trên source T6.
- Full build/lint chưa chạy vì workspace không có `node_modules`; dependency install ở các patch trước từng timeout.
