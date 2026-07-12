import Link from "next/link";
import Breadcrumbs from "@/components/Breadcrumbs";
import JsonLd from "@/components/JsonLd";
import { BRAND } from "@/data/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Nguyên tắc nội dung",
  description:
    "Cách Một Ngụm chọn chủ đề, kiểm tra thông tin, sử dụng công cụ AI, cập nhật và sửa nội dung trên website.",
  path: "/nguyen-tac-noi-dung",
  keywords: ["nguyên tắc nội dung Một Ngụm", "quy trình biên tập", "minh bạch nội dung AI"],
});

export default function EditorialPrinciplesPage() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://motngum.cafe";
  const pageUrl = `${siteUrl}/nguyen-tac-noi-dung`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${pageUrl}/#webpage`,
        url: pageUrl,
        name: "Nguyên tắc nội dung của Một Ngụm",
        description:
          "Cách Một Ngụm chọn chủ đề, kiểm tra thông tin, dùng công cụ hỗ trợ và cập nhật nội dung.",
        inLanguage: "vi-VN",
        datePublished: "2026-07-11",
        dateModified: "2026-07-11",
        isPartOf: { "@id": `${siteUrl}/#website` },
        publisher: { "@id": `${siteUrl}/#organization` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Trang chủ",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Nguyên tắc nội dung",
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <article className="policy-page editorial-page">
        <div className="container policy-content">
          <Breadcrumbs
            items={[{ label: "Trang chủ", href: "/" }, { label: "Nguyên tắc nội dung" }]}
          />
          <header>
            <p className="eyebrow">Minh bạch nội dung</p>
            <h1>Nguyên tắc nội dung của Một Ngụm.</h1>
            <p className="policy-updated">Cập nhật ngày <time dateTime="2026-07-11">11/07/2026</time></p>
          </header>

          <section>
            <h2>Nội dung được viết để làm gì?</h2>
            <p>
              Phần kiến thức trên website giúp chủ shop, nhân viên văn phòng và doanh nghiệp nhỏ hiểu
              vấn đề trước khi chọn công cụ hoặc dịch vụ. Bài viết ưu tiên câu hỏi có thể dẫn đến một
              quyết định cụ thể, checklist có thể tự dùng và cả trường hợp người đọc chưa cần thuê
              Một Ngụm.
            </p>
            <p>
              Nội dung mang tính hướng dẫn chung, không thay thế tư vấn pháp lý, tài chính, bảo mật
              hoặc chuyên môn ngành. Giá, tính năng nền tảng và quy định có thể thay đổi; người đọc nên
              kiểm tra lại nguồn chính thức trước quyết định có rủi ro cao.
            </p>
          </section>

          <section>
            <h2>Ai chịu trách nhiệm?</h2>
            <p>
              Bài viết được xuất bản dưới tên tổ chức {BRAND.name}. Mỗi trang hiển thị ngày cập nhật
              và liên kết về trang này. Trách nhiệm cuối cùng đối với nội dung công khai thuộc về Một
              Ngụm; công cụ hỗ trợ không được xem là tác giả hoặc nguồn bảo chứng.
            </p>
            <p>
              Nếu phát hiện thông tin sai, thiếu ngữ cảnh hoặc đã cũ, bạn có thể gửi về{" "}
              <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>. Khi sửa thay đổi đáng kể, ngày cập
              nhật của bài sẽ được điều chỉnh thay vì chỉ làm mới ngày để tạo cảm giác nội dung mới.
            </p>
          </section>

          <section>
            <h2>Cách chọn và kiểm tra thông tin</h2>
            <p>
              Chủ đề được chọn từ vấn đề khách hàng mục tiêu thực sự gặp, phạm vi dịch vụ của Một Ngụm
              và khoảng trống trong tài liệu tiếng Việt. Với thông tin kỹ thuật, quy định hoặc tính năng
              nền tảng, nguồn chính thức và tài liệu gốc được ưu tiên hơn bài tổng hợp. Số liệu chỉ được
              dùng khi có nguồn, bối cảnh và thời điểm đủ rõ.
            </p>
            <p>
              Một Ngụm không bịa đánh giá, chứng chỉ, khách hàng, case study hoặc kết quả kinh doanh.
              Ví dụ minh họa phải được gọi đúng là giả định. Nội dung không cam kết vị trí Google,
              doanh thu, tỷ lệ chuyển đổi hoặc mức tiết kiệm tuyệt đối khi chưa có bằng chứng có thể
              kiểm tra.
            </p>
          </section>

          <section>
            <h2>Công cụ AI được sử dụng như thế nào?</h2>
            <p>
              Công cụ AI có thể hỗ trợ nghiên cứu hướng câu hỏi, tạo bản nháp, sắp xếp cấu trúc, rà lỗi
              ngôn ngữ hoặc kiểm tra mã. Vì AI có thể tạo thông tin sai hoặc diễn đạt quá chắc chắn,
              đầu ra không được xem là nguồn độc lập. Các tuyên bố quan trọng cần được đối chiếu với
              dữ liệu doanh nghiệp hoặc tài liệu đáng tin cậy trước khi dùng.
            </p>
            <p>
              Không đưa dữ liệu khách hàng, mật khẩu, khóa truy cập hoặc tài liệu mật vào công cụ chỉ
              để viết nội dung. Ảnh hoặc câu chuyện của khách chỉ được công khai khi có quyền sử dụng
              phù hợp và đã loại thông tin không cần thiết.
            </p>
          </section>

          <section>
            <h2>Liên kết thương mại và xung đột lợi ích</h2>
            <p>
              Bài kiến thức có thể liên kết đến dịch vụ của Một Ngụm khi dịch vụ đó phù hợp với vấn đề
              đang giải thích. Liên kết này mang mục đích thương mại và được trình bày rõ bằng lời mời
              xem dịch vụ hoặc trao đổi. Nếu nội dung có tài trợ, quyền lợi giới thiệu hoặc quan hệ có
              thể ảnh hưởng đánh giá, thông tin đó phải được ghi ngay trên trang liên quan.
            </p>
          </section>

          <section>
            <h2>Lịch rà soát và tiêu chí sửa bài</h2>
            <p>
              Nội dung được xem lại khi giá hoặc phạm vi dịch vụ thay đổi, khi nền tảng cập nhật cách
              hoạt động, khi có phản hồi chỉ ra lỗi hoặc khi dữ liệu tìm kiếm cho thấy trang đang trả
              lời sai ý định. Không thêm đoạn văn chỉ để tăng số chữ và không tạo hàng loạt trang địa
              phương khi Một Ngụm chưa có hoạt động thật tại khu vực đó.
            </p>
            <p>
              Bạn có thể xem toàn bộ hướng dẫn tại <Link href="/kien-thuc">trang Kiến thức</Link> hoặc
              liên hệ qua <Link href="/lien-he">trang Liên hệ</Link> nếu cần làm rõ một nội dung.
            </p>
          </section>
        </div>
      </article>
    </>
  );
}
