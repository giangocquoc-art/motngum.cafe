# Chim Sẻ — bản duyệt bố cục

Mở `layout-review.html` ở điện thoại để xem khung màn chơi. Nút **Hỏi Sẻ** chuyển nội dung vùng học phía dưới sang trạng thái trợ giúp và nút quay lại chuyển về bài luyện. Trang duyệt chỉ dùng các khối màu và chữ; chưa có tranh, sprite hay hoạt ảnh.

## Chia vùng

1. **Thanh trên:** lối ra, tên Chim Sẻ, tập hiện tại và sổ tay.
2. **Vùng truyện:** chiếm toàn bộ phần giữa còn lại. Nhãn cảnh và lời thoại nằm lớp trên cùng; bối cảnh, nhân vật và tiền cảnh sẽ nằm dưới chúng. Sẻ có đúng một vị trí trong bố cục cảnh.
3. **Khung học phía dưới:** câu cần làm, ô trả lời, nút gửi, nghe lại và trợ giúp. Khi nhấn Hỏi Sẻ, chỉ nội dung của khung này đổi thành khung chat; vùng tranh và lời thoại ở trên vẫn giữ nguyên.

## Kích thước dự kiến

- **Điện thoại dọc:** thanh trên 50px; khung luyện thường 245–265px; chế độ Hỏi Sẻ 300–370px; vùng cảnh co giãn trong phần còn lại. Dùng `100dvh`, vùng an toàn và không cuộn trang.
- **Máy tính bảng:** cùng một cột cảnh trên khung học; không mở cột dashboard. Khung học co theo nội dung và giới hạn theo chiều cao màn.
- **Máy tính:** cảnh rộng toàn màn, lời thoại neo trong cảnh, khung học thấp ở đáy và giới hạn chiều rộng nội dung để dễ đọc.
- **Bàn phím điện thoại mở:** khung học co còn khoảng 165–220px tùy chiều cao; lời thoại được rút gọn trên màn ngang, vùng cảnh vẫn còn ở phía trên. Ô nhập vẫn nằm trong vùng nhìn thấy.

## Chốt trước khi làm tranh

Sau khi bạn duyệt tỉ lệ ba vùng, vị trí lời thoại, cách mở trợ giúp và cách khung co theo bàn phím, phần tranh sẽ được tạo thành các lớp riêng theo manifest cảnh rồi mới nối vào vùng truyện này.
