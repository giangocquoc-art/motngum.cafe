# Một Ngụm — Coffee & Digital Services

Website Next.js nhiều route cho mô hình cà phê lưu động và các dịch vụ website, chatbot AI, xử lý dữ liệu, tự động hóa, công cụ nội dung, quảng cáo, đào tạo AI và tư vấn marketing.

## Chạy trên Windows

```powershell
cd C:\duong-dan\motngum-cafe
npm install
Copy-Item .env.example .env.local
npm run lint
npm run dev
```

Mở `http://localhost:3000`.

## Kiểm tra production

```powershell
npm run build
npm run start
npm run seo:audit -- http://127.0.0.1:3000
npm run seo:audit -- https://motngum.cafe
npm run test:web -- http://127.0.0.1:3000 --cdp=http://127.0.0.1:9224
npm run indexnow:submit -- --dry-run
npm run indexnow:submit
```

## Web smoke test

`npm run test:web` kiểm tra các URL trong `sitemap.xml` ở mobile 390×844, tablet 900×1024 và desktop 1440×900: HTTP document, lỗi console/JavaScript, đúng một H1, tràn ngang, ảnh hỏng, liên kết nội bộ, menu thu gọn và tương tác tìm/lọc model trên `/api`. Script chỉ dùng Node + Chrome DevTools Protocol, không thêm package; bất kỳ lỗi nào cũng trả exit code `1`.

Khởi động Chrome với remote debugging trước khi chạy (hoặc dùng Chrome đang chạy ở cổng đó), ví dụ:

```powershell
& "$env:ProgramFiles\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9224 --user-data-dir="$env:TEMP\motngum-cdp"
npm run test:web -- http://127.0.0.1:3000 --cdp=http://127.0.0.1:9224
```

Mặc định là `http://127.0.0.1:3000` và `http://127.0.0.1:9224`; cũng có thể đặt `WEB_SMOKE_BASE_URL` và `WEB_SMOKE_CDP_URL`.

## Deploy Vercel

```powershell
npx vercel@latest login
npx vercel@latest --prod
```

## Biến môi trường

```env
NEXT_PUBLIC_SITE_URL=https://motngum.cafe
NEXT_PUBLIC_CONTACT_EMAIL=cskh@motngum.cafe
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=
LEAD_RECEIVER_EMAIL=cskh@motngum.cafe
RESEND_API_KEY=
RESEND_FROM_EMAIL="Một Ngụm <leads@motngum.cafe>"
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEB_APP_SECRET=thay-bang-chuoi-bi-mat-dai
VIETAPI_API_KEY=chi-dat-o-server-khong-commit
VIETAPI_API_BASE=https://api.vietapi.tech/v1
```

Google Sheets và Resend là hai kênh độc lập. Chỉ cần cấu hình một trong hai; nếu cấu hình cả hai, lead được lưu vào Sheet và đồng thời gửi email. Xem hướng dẫn Apps Script tại `integrations/google-sheets/README.md`.

## Router chính

- `/`
- `/menu`
- `/qr`
- `/dich-vu`
- `/api` (danh mục model VietAPI)
- `/dich-vu/[slug]`
- `/kien-thuc`
- `/kien-thuc/[slug]`
- `/dao-tao-ai`
- `/tu-van-marketing`
- `/bang-gia`
- `/ve-mot-ngum`
- `/lien-he`
- `/nguyen-tac-noi-dung`

Xem `QA_REPORT_2026-07-11.md` để biết các thay đổi và kết quả kiểm tra.

## VietAPI model catalogue

Trang `/api` dùng danh mục dự phòng công khai để vẫn hiển thị khi phát triển local. Khi cần đồng bộ các model theo tài khoản, đặt `VIETAPI_API_KEY` trong `.env.local` hoặc cấu hình biến môi trường của môi trường deploy. Key chỉ được đọc bởi route server `/api/vietapi/models` và không được tiền tố `NEXT_PUBLIC_`.
