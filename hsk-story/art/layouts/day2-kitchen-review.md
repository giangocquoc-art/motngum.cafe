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
- [x] Tạo bốn nền SVG native từ `scene-flat-art.js`: desktop, portrait, ultra-wide và short-landscape.
- [x] Renderer và manifest trỏ tới đúng bốn biến thể native.
- [ ] Chụp và duyệt cảnh tích hợp với lời thoại đúng node ở desktop, điện thoại dọc, tablet và điện thoại ngang.
- [ ] Kiểm từng nhánh bếp để đúng người nói, biểu cảm, đạo cụ và chỉ một Sẻ.

Lưu ý: các ảnh chụp layout trước đây được tạo bằng cách gắn art của `day2-arrival` lên trang vẫn đang hiển thị node mở đầu. Chúng chỉ là phép dò kích thước/tọa độ, không được tính là kiểm duyệt cảnh tích hợp.
