# Bếp nhà An — bố cục đã duyệt

**Phạm vi duyệt:** sơ đồ bố cục. **Nét vẽ:** theo nền phẳng, màu dịu và đường mực hơi lệch đang chạy trên `hsk.motngum.cafe`. Bộ nền màu nước từng thử không phải tài sản được duyệt và không còn được runtime tham chiếu.

## Lớp của cảnh

1. **Bối cảnh:** bếp nhà An với cửa sổ, quầy, bàn ăn, ghế, cặp và quyển sổ. Mỗi tỷ lệ có bố cục riêng; không đưa nhân vật, chim, chữ học hoặc UI vào nền.
2. **Nhân vật:** An và mẹ là sprite độc lập; Tiểu Vũ chỉ xuất hiện khi An chuẩn bị đón bạn. Mỗi người có biểu cảm và vị trí theo cảnh.
3. **Hội thoại:** lời dẫn, câu tiếng Trung, Pinyin và thao tác tiếp tục do HTML đảm nhiệm.
4. **Chuyển động:** chớp mắt nhẹ, Sẻ nghiêng đầu/vỗ cánh và phản hồi chạm; không làm cảnh chuyển động liên tục.

## Sơ đồ đã được chủ dự án duyệt

```text
Desktop / tablet ngang
┌──────────────────────────────────────────────────────────────┐
│ khoảng tường thoáng       cửa sổ + một chỗ đậu Sẻ            │
│                                      quầy bếp                  │
│                                                              │
│                An          đồ ăn       mẹ       cặp + ghế    │
└──────────────────────────────────────────────────────────────┘

Điện thoại dọc
┌──────────────────────┐
│ cửa sổ, một chỗ đậu  │
│                      │
│ An              mẹ   │
│                      │
│ bàn ăn, sổ, cặp      │
└──────────────────────┘
```

Điện thoại dọc dùng nền gần vuông vì vùng tranh trong game chỉ cao khoảng 360 px ở máy 390×844; không dùng hình nền dọc cao rồi cắt giữa. Cảnh ngang rất thấp và desktop siêu rộng dùng các biến thể riêng. Chỉ có một Sẻ do renderer vẽ; nền không có chim, hình chim hay tranh chim hoàn chỉnh.

Máy tính bảng dọc trong khoảng 691–1100 px dùng bố cục tablet riêng. Bộ chọn của renderer không dựa vào tỉ lệ vùng tranh (vốn thấp hơn tỉ lệ màn hình do hội thoại nằm phía dưới), mà dựa vào hướng và chiều rộng viewport.

## Cảnh sử dụng

| ID | Người trong cảnh | Vật thể và hành động chính |
|---|---|---|
| `day2-arrival` | An, mẹ | Bữa sáng; An tìm quyển sổ cạnh cặp. |
| `day2-home-quiet` | An, mẹ | Hai chiếc cốc; An vụng về mắc quai cặp vào ghế. |
| `day2-guest-arrives` | An, mẹ | Chừa góc bàn để chuẩn bị đón Tiểu Vũ; bạn chưa vào khung. |
| `day2-breakfast` và các nhánh | An, mẹ | Mẹ xếp hộp cơm; An kiểm tra ngăn cặp. |
| `day2-confession` | An, mẹ | Mẹ lắng nghe khi An kể chuyện hôm trước. |
| `day2-mother-explains` | An, mẹ | Hai mẹ con mở sổ/từ điển không có chữ giả. |
| `day2-guest-prep` | An, Tiểu Vũ | Dọn chỗ cho bạn; mẹ rời khung. |

## Trạng thái nghiệm thu

- [x] Chủ dự án duyệt sơ đồ nhân vật, bàn ăn và một Sẻ.
- [x] Chọn art direction theo production hiện hành thay cho bản màu nước chưa duyệt.
- [x] Tạo năm nền SVG native từ `scene-flat-art.js`: desktop, portrait, tablet-portrait, ultra-wide và short-landscape.
- [x] Renderer và manifest trỏ tới đúng năm biến thể native; script dựng và kiểm tra drift đã được thêm.
- [x] Kiểm cảnh tích hợp `branch.day2-arrival` tại 1365×900 (wide), 768×1024 (tablet dọc), 390×844 (điện thoại dọc) và 844×390 (điện thoại ngang thấp). Mỗi kích thước chọn đúng nền, giữ một Sẻ, khớp người nói “Mẹ” với nhân vật mẹ và không làm trang cuộn.
- [x] Kiểm đủ bảy nhánh bếp tại desktop, điện thoại dọc/ngang, tablet dọc và ultra-wide: chọn đúng biến thể nền, nhân vật người nói có trong khung, chỉ một Sẻ và không tràn viewport (35 trạng thái Chromium).
- [x] Chụp và rà trực quan cảnh đến nhà, mẹ nghe An kể và Tiểu Vũ tới chơi ở các tỉ lệ đại diện.

Lưu ý: ảnh chụp nghiệm thu hiện nằm trong `test-results/kitchen-layout/` và được tạo bằng cách seed đúng ID cảnh trước khi mở trang. Các cảnh được xác nhận theo bố cục/người nói/số Sẻ; việc rà nội dung và biểu cảm từng lượt thoại vẫn thuộc vòng duyệt nội dung.
