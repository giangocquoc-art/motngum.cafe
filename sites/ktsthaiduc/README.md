# KTS Thái Đức — Architecture Portfolio

Website giới thiệu hồ sơ KTS Thái Doãn Đức, 12 dự án kiến trúc, dịch vụ thiết kế, đào tạo và liên hệ.

## Công nghệ

Next.js App Router + React + CSS; Vercel frontend, Cloudflare DNS và Cloudflare Worker + D1 backend cho liên hệ. Không cần cài thư viện CSS bên ngoài.

## Chạy

```bash
npm install
npm run dev
npm run build
```

## Biến môi trường

- `CONTACT_ENDPOINT`: URL Worker nhận form (server-side only).
- Worker công khai có rate limit dựa trên địa chỉ IP, chỉ nên dùng làm MVP; cần bổ sung Turnstile hoặc cơ chế xác thực cấp cao trước khi mở rộng lưu lượng.

Mã nguồn không chứa secret. Form sẽ báo không khả dụng nếu backend chưa cấu hình và người dùng vẫn có thể liên hệ trực tiếp bằng Zalo/điện thoại. Để chạy đầy đủ, cần tạo D1 và Worker backend, nhập environment variables trên Vercel.

## Nội dung và hình ảnh

Dữ liệu trang và dự án ở `lib/data.js`, tham chiếu URL ảnh nguồn được người dùng cho phép sử dụng. Ảnh chưa sẵn có dùng placeholder thay vì ảnh minh họa sai công trình. Cần tải tài sản ảnh về kho riêng trước khi chấm dứt website nguồn.

## Giới hạn hiện tại

Không bao gồm CMS Strapi, dashboard admin, lưu thư viện ảnh nội bộ hoặc email notification. Đây là website portfolio vận hành độc lập với backend form, được tách nền để mở rộng CMS ở bản tiếp theo.
