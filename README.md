# Một Ngụm Cafe

Website nhiều route cho Một Ngụm với một kiến trúc thương hiệu chung: Một Ngụm Café là hoạt động F&B thật ở phía khách hàng; Một Ngụm Studio dùng chính motngum.cafe như case study sống cho dịch vụ thiết kế website và các giải pháp số khi cần.

## Trải nghiệm chính

- Trang chủ ưu tiên hành trình khách Café: xem món, địa chỉ và đặt ShopeeFood.
- `/studio` là lớp "behind the site": giải thích chính website Café đang vận hành được thiết kế ra sao, cho thử 5 art direction và dẫn tới dịch vụ thiết kế website.
- Danh mục API dùng nhận diện đúng nhà phát triển, có bộ lọc theo dòng model, model ID và giá tham khảo.
- Ly và dữ liệu món gốc lấy từ bộ sản phẩm của Một Ngụm; asset theo theme chỉ thay art direction/bối cảnh trình bày.
- Hệ 5 theme có 35 asset menu (7 món × 5 art direction); chỉ ảnh của theme đang xem được render/tải, sản phẩm và dữ liệu món không đổi.
- Theme selector dùng thumbnail WebP nhẹ; ảnh hero/menu đầy đủ chỉ được preload theo theme và route có liên quan, đồng thời tôn trọng Save-Data/2G.
- Công cụ hai bước gợi ý giải pháp theo vấn đề và mục tiêu.
- Giữ lại các route dịch vụ, kiến thức, liên hệ, QR, form tư vấn và proxy OpenAI-compatible từ website cũ.
- Responsive, hỗ trợ bàn phím và chế độ giảm chuyển động.
- SEO tách rõ Café và Studio bằng entity ID/structured data riêng; 5 theme dùng chung canonical và không tạo duplicate content.

## Route chính

- `/`
- `/menu`
- `/studio`
- `/bang-gia`
- `/dich-vu` và `/dich-vu/[slug]`
- `/kien-thuc` và `/kien-thuc/[slug]`
- `/qr` - công cụ utility, `noindex, follow`
- `/tu-van-marketing`
- `/lien-he`
- `/v1/*` - proxy OpenAI-compatible

## Biến môi trường

```env
NEXT_PUBLIC_SITE_URL=https://motngum.cafe
VIETAPI_BASE_URL=https://api.vietapi.tech/v1
VIETAPI_API_KEY=
NEXT_PUBLIC_CONTACT_EMAIL=cskh@motngum.cafe
LEAD_RECEIVER_EMAIL=cskh@motngum.cafe
LEAD_SENDER_EMAIL=Một Ngụm <lead@motngum.cafe>
RESEND_API_KEY=
GOOGLE_SHEETS_WEB_APP_URL=
GOOGLE_SHEETS_WEB_APP_SECRET=
```

Nếu dùng Resend, `LEAD_SENDER_EMAIL` phải là địa chỉ thuộc domain đã xác minh trên Resend.

Không đặt API key trong mã frontend. Khi chưa có `VIETAPI_API_KEY`, trang bảng giá hiển thị snapshot model đã kiểm tra gần nhất.

## Chạy dự án

Yêu cầu Node.js `>=22.13.0`.

```bash
npm run dev
npm run qa:static
npm run build
npm run start
```

`npm run build` chạy static integrity QA trước bước Vinext build. QA kiểm tra import nội bộ, asset, ma trận 5 theme × 7 món, link nội bộ, URL theme và một số invariant SEO/UX cơ bản.

Xem `THIRD_PARTY_NOTICES.md` để biết nguồn nhận diện các nhà cung cấp model.
