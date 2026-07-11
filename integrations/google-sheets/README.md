# Kết nối form Một Ngụm với Google Sheets

## 1. Chuẩn bị Google Sheet

1. Tạo hoặc mở file Google Sheet nhận lead.
2. Lấy ID nằm giữa `/d/` và `/edit` trong URL:
   `https://docs.google.com/spreadsheets/d/GOOGLE_SHEET_ID/edit`.
3. Vào **Extensions → Apps Script**.
4. Xóa code mẫu và dán toàn bộ nội dung `Code.gs` trong thư mục này.

## 2. Kiểm tra cấu hình đầu file

```js
const SPREADSHEET_ID = "ID_VUA_LAY";
const SHEET_NAME = "Leads";
```

ID của Sheet Một Ngụm đã được điền sẵn trong `Code.gs`.

Trong Apps Script, mở **Project Settings → Script Properties → Add script property**:

- Property: `WEBHOOK_SECRET`
- Value: sao chép giá trị `GOOGLE_SHEETS_WEB_APP_SECRET` trong `.env.local`

Secret không được đưa vào biến có tiền tố `NEXT_PUBLIC_` hoặc ghi trực tiếp vào file public.

## 3. Deploy Apps Script

1. Bấm **Deploy → New deployment**.
2. Chọn loại **Web app**.
3. **Execute as**: chọn **Me**.
4. **Who has access**: chọn **Anyone**.
5. Bấm **Deploy**, cấp quyền truy cập Google Sheet và sao chép URL kết thúc bằng `/exec`.

Không dùng URL `/dev`; URL đó chỉ dành cho người có quyền sửa script.

## 4. Cấu hình website

Thêm vào `.env.local` khi chạy máy cá nhân, hoặc Environment Variables trên Vercel:

```env
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEB_APP_SECRET=MOT_CHUOI_BI_MAT_DAI_VA_KHO_DOAN
```

Giá trị secret phải giống hệt Script Property `WEBHOOK_SECRET` trong Apps Script. Sau khi đổi biến môi trường, khởi động lại dev server hoặc redeploy Vercel.

## 5. Kiểm tra

1. Mở form trên website và gửi một lead thử.
2. Tab `Leads` sẽ tự được tạo với hàng tiêu đề và dữ liệu mới.
3. Nếu không thấy dữ liệu, vào Apps Script → **Executions** để xem lỗi.

Khi sửa code Apps Script sau này, vào **Deploy → Manage deployments → Edit → New version → Deploy**. Chỉ bấm Save không cập nhật bản `/exec` đang chạy.

## Cột dữ liệu

Thời gian, mã lead, họ tên, số điện thoại, email, dịch vụ, vấn đề, ngân sách, thời gian liên hệ, lời nhắn, nguồn trang và ba trường UTM.
