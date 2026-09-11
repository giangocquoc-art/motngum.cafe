# Một Ngụm

Một Ngụm là sales and discovery website cho dịch vụ thiết kế website, tên miền và email doanh nghiệp.

## Product flow

1. Tìm tên miền tại `/`.
2. Xem mẫu tại `/mau-website`.
3. Chọn package và gửi yêu cầu.
4. Nhận quote/order confirmation từ server.

## Routes and APIs

- `/` — product homepage, domain search, packages
- `/mau-website` — template gallery
- `/api/domains` — sandbox domain provider
- `/api/quotes` — server-side quote calculation
- `/api/orders` — validated sandbox order intake
- `/api/leads` — consultation leads

## Development

Requires Node.js 22+. Copy `.env.example` to `.env.local`, then run:

```bash
npm install
npm run dev
npm run build
```

Production is deployed from `main` to [motngum.cafe](https://motngum.cafe) on Vercel.
See `ARCHITECTURE.md`, `DOMAIN_PROVIDER.md`, `INET_INTEGRATION.md`, and `DEPLOYMENT.md`.

External credentials are intentionally optional. Without iNET, payment, storage, or
PShareHub credentials the app remains in safe sandbox mode.
