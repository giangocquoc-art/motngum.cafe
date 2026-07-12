import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Chính sách bảo mật",
  description: "Cách Một Ngụm thu thập, sử dụng, lưu trữ và bảo vệ thông tin bạn gửi qua form liên hệ, tư vấn khi sử dụng website.",
  path: "/chinh-sach-bao-mat",
});

export default function PrivacyPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/chinh-sach-bao-mat`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "Chính sách bảo mật của Một Ngụm",
        inLanguage: "vi-VN",
        datePublished: "2026-07-11",
        dateModified: "2026-07-11",
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Trang chủ", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Chính sách bảo mật", item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <article className="policy-page">
        <div className="container policy-content">
          <Breadcrumbs
            items={[{ label: "Trang chủ", href: "/" }, { label: "Chính sách bảo mật" }]}
          />
          <header>
            <p className="eyebrow">Thông tin và quyền riêng tư</p>
            <h1>Chính sách bảo mật.</h1>
            <p className="policy-updated">Cập nhật ngày <time dateTime="2026-07-11">11/07/2026</time></p>
          </header>

          <section>
            <h2>Một Ngụm thu thập thông tin nào?</h2>
            <p>
              Khi bạn gửi form, Một Ngụm có thể nhận họ tên, số điện thoại, email, dịch vụ quan tâm,
              vấn đề cần giải quyết, ngân sách dự kiến, khung giờ liên hệ và lời nhắn. Website cũng có
              thể ghi nhận trang nguồn và các tham số UTM để hiểu kênh nào đưa bạn đến form.
            </p>
          </section>

          <section>
            <h2>Thông tin được dùng để làm gì?</h2>
            <p>
              Thông tin được dùng để phản hồi yêu cầu, chuẩn bị nội dung tư vấn và cải thiện trải nghiệm
              trên website. Một Ngụm không bán thông tin liên hệ của bạn. Chỉ những người cần xử lý yêu
              cầu mới được truy cập dữ liệu liên quan.
            </p>
          </section>

          <section>
            <h2>Dữ liệu kỹ thuật và đo lường</h2>
            <p>
              Website sử dụng Vercel Web Analytics để xem lượt truy cập ở dạng tổng hợp, ẩn danh và
              không dùng cookie của Web Analytics. Vercel Speed Insights ghi nhận các chỉ số hiệu năng
              như thời gian hiển thị, độ ổn định bố cục và khả năng phản hồi để Một Ngụm tìm trang cần
              tối ưu. Các công cụ này không thay thế dữ liệu bạn chủ động gửi qua form.
            </p>
            <p>
              Bạn có thể đọc thêm về cách Vercel xử lý dữ liệu trong{" "}
              <a href="https://vercel.com/docs/analytics/privacy-policy" rel="noreferrer">
                tài liệu quyền riêng tư Web Analytics
              </a>
              .
            </p>
          </section>

          <section>
            <h2>Lưu trữ và đơn vị hỗ trợ xử lý</h2>
            <p>
              Dữ liệu form có thể được lưu trong hệ thống email hoặc bảng tính do Một Ngụm quản lý.
              Tùy cấu hình vận hành, Vercel cung cấp hạ tầng website và đo lường; Google Sheets hoặc
              Resend có thể hỗ trợ lưu lead và chuyển email. Quyền truy cập được giới hạn theo nhu cầu
              công việc. Không có phương thức truyền hoặc lưu trữ nào an toàn tuyệt đối, nhưng Một Ngụm
              áp dụng các biện pháp hợp lý để hạn chế truy cập trái phép.
            </p>
          </section>

          <section>
            <h2>Yêu cầu xem, sửa hoặc xóa thông tin</h2>
            <p>
              Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa thông tin đã gửi bằng cách liên hệ qua email
              <a href={`mailto:${BRAND.email}`}> {BRAND.email}</a> hoặc gọi
              <a href={`tel:+84${BRAND.phone.slice(1)}`}> {BRAND.phoneDisplay}</a>. Dữ liệu thống kê đã
              được tổng hợp và ẩn danh có thể không liên kết ngược được với một cá nhân để xóa riêng.
            </p>
          </section>

          <Link className="button button-dark" href="/lien-he">
            Liên hệ Một Ngụm
          </Link>
        </div>
      </article>
    </>
  );
}
