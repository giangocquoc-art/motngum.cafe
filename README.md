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
```

## Deploy Vercel

```powershell
npx vercel@latest login
npx vercel@latest --prod
```

## Biến môi trường

```env
NEXT_PUBLIC_SITE_URL=https://motngum.cafe
NEXT_PUBLIC_CONTACT_EMAIL=cskh@zotcafe.com
LEAD_RECEIVER_EMAIL=cskh@zotcafe.com
RESEND_API_KEY=
GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_SHEETS_WEB_APP_SECRET=thay-bang-chuoi-bi-mat-dai
```

Google Sheets và Resend là hai kênh độc lập. Chỉ cần cấu hình một trong hai; nếu cấu hình cả hai, lead được lưu vào Sheet và đồng thời gửi email. Xem hướng dẫn Apps Script tại `integrations/google-sheets/README.md`.

## Router chính

- `/`
- `/menu`
- `/qr`
- `/dich-vu`
- `/dich-vu/[slug]`
- `/dao-tao-ai`
- `/tu-van-marketing`
- `/bang-gia`
- `/ve-mot-ngum`
- `/lien-he`

Xem `QA_REPORT_2026-07-11.md` để biết các thay đổi và kết quả kiểm tra.
# motngum.cafe
