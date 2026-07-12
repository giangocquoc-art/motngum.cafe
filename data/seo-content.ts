import { SUPPORTING_SEO_ARTICLES } from "@/data/seo-supporting-content";
import type { SeoArticle } from "@/data/seo-types";

export type { SeoArticle, SeoArticleSection } from "@/data/seo-types";

export const SERVICE_SEO: Record<
  string,
  { title: string; description: string; keywords: string[] }
> = {
  "thiet-ke-website": {
    title: "Thiết kế website cho doanh nghiệp nhỏ tại TP.HCM",
    description:
      "Dịch vụ thiết kế website và landing page gọn, nhanh, chuẩn SEO cơ bản cho cá nhân, chủ shop và doanh nghiệp nhỏ tại TP.HCM.",
    keywords: [
      "thiết kế website cho doanh nghiệp nhỏ",
      "thiết kế website TP.HCM",
      "thiết kế landing page giá hợp lý",
      "website cho chủ shop",
    ],
  },
  "chatbot-ai": {
    title: "Chatbot AI cho website và shop bán hàng",
    description:
      "Thiết kế chatbot AI theo dữ liệu của doanh nghiệp, hỗ trợ hỏi đáp, thu thập nhu cầu và chuyển khách sang nhân viên khi cần.",
    keywords: [
      "chatbot AI cho website",
      "chatbot AI bán hàng",
      "chatbot chăm sóc khách hàng",
      "tích hợp chatbot vào website",
    ],
  },
  "xu-ly-du-lieu": {
    title: "Dịch vụ xử lý dữ liệu Excel và Google Sheets",
    description:
      "Làm sạch, chuẩn hóa, gộp và đối soát dữ liệu Excel, Google Sheets; tạo báo cáo dễ dùng cho shop và đội vận hành nhỏ.",
    keywords: [
      "dịch vụ xử lý dữ liệu Excel",
      "làm sạch dữ liệu Excel",
      "gộp file Excel",
      "xử lý dữ liệu Google Sheets",
    ],
  },
  "tu-dong-hoa-quy-trinh": {
    title: "Tự động hóa quy trình cho doanh nghiệp nhỏ",
    description:
      "Tự động hóa báo cáo, nhập liệu, chuyển dữ liệu và nhắc việc để đội nhóm nhỏ giảm thao tác lặp lại nhưng vẫn giữ bước kiểm duyệt.",
    keywords: [
      "tự động hóa quy trình doanh nghiệp",
      "tự động hóa công việc văn phòng",
      "tự động hóa nhập liệu",
      "tự động hóa báo cáo",
    ],
  },
  "ho-tro-dang-bai": {
    title: "Phần mềm hỗ trợ đăng bài và quản lý nội dung",
    description:
      "Công cụ quản lý nội dung, lịch đăng và quy trình duyệt bài đa kênh cho chủ shop và đội marketing nhỏ.",
    keywords: [
      "phần mềm hỗ trợ đăng bài",
      "quản lý lịch đăng bài",
      "công cụ quản lý nội dung",
      "đăng bài đa kênh",
    ],
  },
  "ho-tro-tuong-tac": {
    title: "Phần mềm quản lý tương tác và khách hàng tiềm năng",
    description:
      "Gom bình luận, tin nhắn và khách hàng tiềm năng vào một luồng; hỗ trợ phân loại và nhắc chăm sóc cho shop và đội bán hàng.",
    keywords: [
      "phần mềm quản lý tương tác",
      "quản lý bình luận tin nhắn",
      "quản lý khách hàng tiềm năng",
      "nhắc chăm sóc khách hàng",
    ],
  },
  "quang-cao": {
    title: "Dịch vụ chạy quảng cáo cho shop và doanh nghiệp nhỏ",
    description:
      "Thiết lập và tối ưu quảng cáo Facebook, TikTok, Shopee theo mục tiêu, ngân sách và dữ liệu đo lường rõ ràng.",
    keywords: [
      "dịch vụ chạy quảng cáo cho shop",
      "chạy quảng cáo doanh nghiệp nhỏ",
      "quảng cáo Facebook TP.HCM",
      "quảng cáo TikTok Shopee",
    ],
  },
  "dao-tao-ai-co-ban": {
    title: "Khóa học AI cơ bản cho người mới tại TP.HCM",
    description:
      "Buổi học AI thực hành dành cho người mới, nhân viên văn phòng và chủ shop: viết prompt, tạo nội dung, xử lý dữ liệu và kiểm tra kết quả.",
    keywords: [
      "khóa học AI cho người mới",
      "khóa học AI tại TP.HCM",
      "học AI cho dân văn phòng",
      "đào tạo AI cơ bản",
    ],
  },
  "tu-van-marketing": {
    title: "Tư vấn marketing miễn phí cho doanh nghiệp nhỏ",
    description:
      "Buổi trao đổi ban đầu giúp chủ shop và doanh nghiệp nhỏ xác định vấn đề, kênh ưu tiên và ngân sách marketing phù hợp.",
    keywords: [
      "tư vấn marketing miễn phí",
      "marketing cho doanh nghiệp nhỏ",
      "marketing cho chủ shop",
      "tư vấn marketing TP.HCM",
    ],
  },
};

const CORE_SEO_ARTICLES: SeoArticle[] = [
  {
    slug: "thiet-ke-website-cho-doanh-nghiep-nho",
    title: "Thiết kế website cho doanh nghiệp nhỏ: chi phí và checklist cần biết",
    metaTitle: "Website cho doanh nghiệp nhỏ: Chi phí & checklist",
    description:
      "Hướng dẫn chọn website phù hợp cho doanh nghiệp nhỏ: mục tiêu, tính năng, chi phí, SEO và checklist bàn giao trước khi bắt đầu.",
    excerpt:
      "Một website nhỏ vẫn cần mục tiêu rõ, nội dung đủ tin cậy và đường dẫn chuyển đổi dễ dùng. Đây là checklist giúp bạn tránh trả tiền cho những tính năng chưa cần.",
    category: "Website",
    primaryKeyword: "thiết kế website cho doanh nghiệp nhỏ",
    keywords: [
      "thiết kế website cho doanh nghiệp nhỏ",
      "chi phí thiết kế website",
      "website cho chủ shop",
      "landing page cho doanh nghiệp nhỏ",
      "website chuẩn SEO cơ bản",
    ],
    answer:
      "Thiết kế website cho doanh nghiệp nhỏ nên bắt đầu từ một mục tiêu kinh doanh cụ thể: giới thiệu uy tín, nhận cuộc gọi, thu thông tin tư vấn hay bán một nhóm sản phẩm. Website không cần nhiều trang ngay từ đầu, nhưng phải tải nhanh trên điện thoại, có nội dung liên hệ rõ, nút hành động dễ thấy, đo lường được và cho phép nâng cấp sau này. Chi phí phụ thuộc số trang, mức tùy chỉnh giao diện, tính năng, nội dung và cách bảo trì; vì vậy một báo giá tốt phải ghi rõ phạm vi thay vì chỉ nêu giá trọn gói. Trước khi bàn giao, doanh nghiệp nên kiểm tra tên miền, quyền sở hữu mã nguồn, tài khoản quản trị, bản sao lưu, tiêu đề SEO, mô tả, sitemap, form liên hệ và hướng dẫn cập nhật nội dung.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "8 phút đọc",
    serviceSlug: "thiet-ke-website",
    serviceHref: "/dich-vu/thiet-ke-website",
    serviceLabel: "Xem dịch vụ thiết kế website",
    sections: [
      {
        heading: "Doanh nghiệp nhỏ cần website để làm gì?",
        paragraphs: [
          "Website chỉ hữu ích khi nó giải quyết một việc rõ ràng. Với cửa hàng hoặc dịch vụ địa phương, đó có thể là giúp khách xem nhanh sản phẩm, hiểu mức giá, gọi điện hoặc gửi yêu cầu. Với cá nhân kinh doanh, website thường đóng vai trò như hồ sơ năng lực có thể gửi cho khách mà không phụ thuộc vào thuật toán mạng xã hội.",
          "Trước khi chọn giao diện, hãy viết một câu mô tả kết quả mong muốn. Ví dụ: “Khách đọc xong có thể hiểu dịch vụ trong ba phút và đặt lịch tư vấn”. Câu này sẽ quyết định cấu trúc trang, nội dung và nút hành động. Nếu chưa xác định được mục tiêu, việc thêm nhiều hiệu ứng hoặc tính năng thường chỉ làm dự án đắt và khó vận hành hơn.",
        ],
        bullets: [
          "Tạo nơi giới thiệu thương hiệu và thông tin liên hệ đáng tin cậy.",
          "Đón khách từ Google, quảng cáo, mã QR hoặc mạng xã hội.",
          "Thu thập cuộc gọi, email, form tư vấn hoặc đơn hàng.",
          "Lưu nội dung lâu dài mà không phụ thuộc hoàn toàn vào một nền tảng.",
        ],
      },
      {
        heading: "Website nhỏ cần những thành phần nào?",
        paragraphs: [
          "Một website giới thiệu cơ bản thường chỉ cần trang chủ, trang dịch vụ hoặc sản phẩm, trang giới thiệu, liên hệ và chính sách bảo mật. Nội dung quan trọng phải là văn bản thật để khách dễ đọc và công cụ tìm kiếm hiểu được; không nên đặt toàn bộ bảng giá hoặc mô tả dịch vụ trong ảnh.",
          "Trên điện thoại, số điện thoại, nút nhắn và form phải đủ lớn để chạm. Mỗi trang nên có một tiêu đề chính, mô tả ngắn, bằng chứng tin cậy và lời kêu gọi hành động phù hợp. Nếu có nhiều dịch vụ khác nhau, mỗi dịch vụ nên có một URL riêng thay vì dồn tất cả vào một đoạn ngắn trên trang chủ.",
        ],
        bullets: [
          "Giao diện responsive, ưu tiên trải nghiệm điện thoại.",
          "Tên miền, HTTPS, sitemap và metadata cho từng trang.",
          "Nút gọi, email hoặc form có thông báo gửi thành công rõ ràng.",
          "Công cụ đo lường để biết trang nào tạo ra liên hệ.",
        ],
      },
      {
        heading: "Chi phí thiết kế website được tính như thế nào?",
        paragraphs: [
          "Không có một mức giá đúng cho mọi website. Một landing page dùng nội dung sẵn có sẽ khác với website có nhiều loại sản phẩm, hệ thống đặt lịch hoặc tích hợp dữ liệu. Nên tách chi phí thành bốn phần: thiết kế và lập trình, tên miền–hosting, chuẩn bị nội dung, và bảo trì sau bàn giao.",
          "Mức giá khởi điểm chỉ có ý nghĩa khi đi kèm phạm vi. Hãy hỏi rõ số trang, số vòng chỉnh sửa, ai nhập nội dung, có tối ưu ảnh hay không, có bàn giao mã nguồn không và hỗ trợ trong bao lâu. Cách này giúp so sánh báo giá công bằng hơn và giảm phát sinh về sau.",
        ],
        bullets: [
          "Số lượng mẫu trang và mức tùy chỉnh giao diện.",
          "Tính năng như form, đặt lịch, thanh toán hoặc đồng bộ dữ liệu.",
          "Khối lượng viết nội dung, xử lý ảnh và nhập dữ liệu.",
          "Yêu cầu tốc độ, bảo mật, theo dõi và bảo trì.",
        ],
      },
      {
        heading: "Checklist trước khi ký nhận website",
        paragraphs: [
          "Đừng chỉ kiểm tra website có đẹp hay không. Hãy thử toàn bộ luồng như một khách thật: mở trên điện thoại, bấm nút gọi, gửi form, đọc bảng giá và quay lại trang chủ. Kiểm tra cả trường hợp nhập sai để chắc chắn thông báo lỗi dễ hiểu.",
          "Cuối cùng, doanh nghiệp phải nắm quyền quản lý tên miền, hosting và tài khoản liên quan. Yêu cầu một bản hướng dẫn ngắn về cách sửa nội dung, xem lead, sao lưu và liên hệ khi có lỗi. Website dễ vận hành thường tạo giá trị lâu hơn một website đẹp nhưng phụ thuộc hoàn toàn vào người làm ban đầu.",
        ],
        bullets: [
          "URL, title, description và canonical đúng cho từng trang.",
          "Robots.txt và sitemap.xml truy cập được.",
          "Ảnh có mô tả, kích thước hợp lý và không làm trang tải chậm.",
          "Form gửi đúng nơi và có phương án liên hệ dự phòng.",
          "Doanh nghiệp giữ quyền sở hữu tài khoản và mã nguồn theo thỏa thuận.",
        ],
      },
    ],
    faq: [
      {
        question: "Doanh nghiệp nhỏ nên làm landing page hay website nhiều trang?",
        answer:
          "Nếu chỉ quảng bá một dịch vụ hoặc chiến dịch, landing page có thể đủ. Nếu cần xây uy tín cho nhiều dịch vụ và phát triển SEO lâu dài, website nhiều trang thường phù hợp hơn.",
      },
      {
        question: "Website giá thấp có SEO được không?",
        answer:
          "Có thể làm SEO nền tảng nếu website tải nhanh, có nội dung riêng cho từng chủ đề, metadata, sitemap và cấu trúc liên kết rõ. Thứ hạng còn phụ thuộc chất lượng nội dung, cạnh tranh và uy tín của domain.",
      },
      {
        question: "Bao lâu nên cập nhật website một lần?",
        answer:
          "Nên cập nhật ngay khi giá, dịch vụ hoặc thông tin liên hệ thay đổi. Nội dung kiến thức có thể được rà soát theo quý hoặc khi có thay đổi đáng kể trong ngành.",
      },
    ],
  },
  {
    slug: "chatbot-ai-cho-website-ban-hang",
    title: "Chatbot AI cho website bán hàng: dùng khi nào và triển khai ra sao?",
    metaTitle: "Chatbot AI cho website bán hàng: Cách triển khai",
    description:
      "Tìm hiểu chatbot AI cho website bán hàng: trường hợp phù hợp, dữ liệu cần chuẩn bị, chi phí, giới hạn và quy trình chuyển sang nhân viên.",
    excerpt:
      "Chatbot hiệu quả không nằm ở việc trả lời mọi câu hỏi, mà ở phạm vi dữ liệu rõ ràng, câu trả lời kiểm chứng được và đường chuyển sang người thật thuận tiện.",
    category: "Chatbot AI",
    primaryKeyword: "chatbot AI cho website bán hàng",
    keywords: [
      "chatbot AI cho website bán hàng",
      "chatbot AI chăm sóc khách hàng",
      "tích hợp chatbot vào website",
      "chatbot AI cho shop",
      "chi phí làm chatbot AI",
    ],
    answer:
      "Chatbot AI cho website bán hàng phù hợp khi doanh nghiệp nhận nhiều câu hỏi lặp lại về sản phẩm, giá, chính sách, lịch hẹn hoặc tình trạng dịch vụ. Để triển khai an toàn, doanh nghiệp cần chuẩn hóa nguồn dữ liệu, xác định câu hỏi bot được phép trả lời, đặt ngưỡng chuyển sang nhân viên và lưu lại các trường hợp bot không chắc chắn. Chatbot không nên tự quyết định khiếu nại, hoàn tiền, vấn đề pháp lý hoặc nội dung nhạy cảm. Chi phí phụ thuộc lượng dữ liệu, số kênh tích hợp, lưu lượng hội thoại và mức kết nối với CRM hay đơn hàng. Một bản thử nghiệm nhỏ với 20–30 câu hỏi phổ biến thường giúp đánh giá giá trị tốt hơn việc xây hệ thống lớn ngay từ đầu.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "8 phút đọc",
    serviceSlug: "chatbot-ai",
    serviceHref: "/dich-vu/chatbot-ai",
    serviceLabel: "Xem dịch vụ chatbot AI",
    sections: [
      {
        heading: "Khi nào shop nên dùng chatbot AI?",
        paragraphs: [
          "Chatbot tạo giá trị khi đội ngũ đang trả lời cùng một nhóm câu hỏi nhiều lần. Ví dụ: khách hỏi kích thước, thành phần, giá, thời gian giao, chính sách đổi trả hoặc cách đặt lịch. Bot có thể trả lời bước đầu, thu thập nhu cầu và chuyển cuộc trò chuyện cho người phụ trách.",
          "Nếu lượng câu hỏi còn ít, nội dung sản phẩm thay đổi liên tục hoặc dữ liệu chưa được chuẩn hóa, một trang FAQ tốt có thể hiệu quả hơn. Doanh nghiệp nên đo số câu hỏi lặp lại và thời gian nhân viên đang dành cho chúng trước khi quyết định.",
        ],
        bullets: [
          "Khách thường hỏi ngoài giờ làm việc.",
          "Nhân viên phải sao chép cùng một câu trả lời nhiều lần.",
          "Website có nhiều tài liệu hoặc sản phẩm khó tìm.",
          "Doanh nghiệp muốn thu thông tin trước khi nhân viên tư vấn.",
        ],
      },
      {
        heading: "Dữ liệu nào cần chuẩn bị cho chatbot?",
        paragraphs: [
          "Nguồn dữ liệu nên ngắn, rõ và có người chịu trách nhiệm cập nhật. Có thể bắt đầu bằng danh sách sản phẩm, bảng giá, chính sách, quy trình đặt hàng và các câu hỏi thường gặp. Mỗi thông tin cần ghi thời điểm áp dụng để tránh bot dùng dữ liệu cũ.",
          "Không đưa khóa truy cập, dữ liệu khách hàng hoặc tài liệu nội bộ nhạy cảm vào kho kiến thức nếu chưa có cơ chế phân quyền. Khi dùng dữ liệu thật để thử nghiệm, nên ẩn thông tin nhận diện không cần thiết và thống nhất thời hạn lưu hội thoại.",
        ],
        bullets: [
          "FAQ đã được nhân viên duyệt.",
          "Thông tin sản phẩm và giá còn hiệu lực.",
          "Chính sách đổi trả, giao hàng và bảo hành.",
          "Danh sách tình huống phải chuyển sang người thật.",
        ],
      },
      {
        heading: "Quy trình triển khai chatbot AI theo phạm vi nhỏ",
        paragraphs: [
          "Bước đầu tiên là chọn một mục tiêu đo được, chẳng hạn giảm thời gian trả lời câu hỏi phổ biến hoặc tăng số khách để lại thông tin. Sau đó xây một bản thử nghiệm chỉ dùng nguồn dữ liệu đã duyệt, kiểm tra bằng câu hỏi thật và ghi lại lỗi.",
          "Khi bot hoạt động ổn định, mới mở rộng sang kênh khác hoặc kết nối hệ thống. Trong suốt quá trình, nên theo dõi tỷ lệ bot trả lời được, tỷ lệ chuyển nhân viên, câu hỏi chưa có dữ liệu và phản hồi của khách. Đây là cơ sở để cải thiện thay vì chỉ nhìn tổng số cuộc trò chuyện.",
        ],
        bullets: [
          "Chọn 20–30 câu hỏi có tần suất cao.",
          "Viết câu trả lời chuẩn và điều kiện áp dụng.",
          "Thử các câu hỏi sai chính tả, thiếu ngữ cảnh và ngoài phạm vi.",
          "Thiết kế nút gặp nhân viên luôn dễ tìm.",
          "Đánh giá dữ liệu hội thoại định kỳ.",
        ],
      },
      {
        heading: "Các rủi ro cần nói rõ trước",
        paragraphs: [
          "Mô hình AI có thể trả lời trôi chảy nhưng sai. Vì vậy chatbot cần nêu giới hạn, tránh khẳng định khi không có nguồn và không được xem là người ra quyết định cuối cùng. Những câu hỏi liên quan khiếu nại, thanh toán bất thường hoặc dữ liệu cá nhân nên chuyển cho nhân viên.",
          "Tốc độ cũng là một yếu tố trải nghiệm. Câu hỏi đơn giản có thể dùng câu trả lời cố định thay vì gọi mô hình AI. Cách kết hợp FAQ, tìm kiếm dữ liệu và AI thường vừa nhanh vừa dễ kiểm soát hơn việc dùng AI cho mọi tin nhắn.",
        ],
      },
    ],
    faq: [
      {
        question: "Chatbot AI có thể tự chốt đơn hoàn toàn không?",
        answer:
          "Có thể hỗ trợ tư vấn và thu thông tin, nhưng mức tự động hóa phụ thuộc dữ liệu và hệ thống đơn hàng. Các bước thanh toán, ngoại lệ và khiếu nại nên có cơ chế kiểm tra hoặc chuyển nhân viên.",
      },
      {
        question: "Chatbot có dùng được tiếng Việt không?",
        answer:
          "Có. Chất lượng phụ thuộc mô hình, dữ liệu tiếng Việt của doanh nghiệp và bộ câu hỏi thử nghiệm. Cần kiểm tra cả tiếng lóng, sai chính tả và cách gọi sản phẩm thực tế.",
      },
      {
        question: "Chi phí chatbot AI gồm những gì?",
        answer:
          "Thông thường gồm phí thiết lập, tích hợp, hạ tầng hoặc lượt sử dụng mô hình, bảo trì dữ liệu và các kết nối với hệ thống khác nếu có.",
      },
    ],
  },
  {
    slug: "tu-dong-hoa-cong-viec-van-phong",
    title: "Tự động hóa công việc văn phòng: bắt đầu từ quy trình nào?",
    metaTitle: "Tự động hóa công việc văn phòng cho đội nhóm nhỏ",
    description:
      "Hướng dẫn chọn quy trình để tự động hóa công việc văn phòng: nhập liệu, báo cáo, nhắc việc, kiểm duyệt và cách đo thời gian tiết kiệm.",
    excerpt:
      "Đội nhóm nhỏ không cần tự động hóa mọi thứ. Hãy bắt đầu từ một việc lặp lại, có quy tắc rõ và ít rủi ro, rồi đo kết quả trước khi mở rộng.",
    category: "Tự động hóa",
    primaryKeyword: "tự động hóa công việc văn phòng",
    keywords: [
      "tự động hóa công việc văn phòng",
      "tự động hóa quy trình doanh nghiệp nhỏ",
      "tự động hóa báo cáo",
      "tự động hóa nhập liệu",
      "giảm công việc lặp lại",
    ],
    answer:
      "Tự động hóa công việc văn phòng nên bắt đầu từ một quy trình lặp lại, có đầu vào và đầu ra rõ, tốn thời gian nhưng không đòi hỏi phán đoán phức tạp. Những ứng viên phù hợp gồm gộp dữ liệu, tạo báo cáo định kỳ, chuyển thông tin giữa biểu mẫu và bảng tính, nhắc việc hoặc tạo tài liệu theo mẫu. Trước khi tự động hóa, cần viết lại từng bước hiện tại, xác định ai kiểm tra kết quả và cách xử lý khi dữ liệu thiếu hoặc sai. Không nên tự động gửi nội dung quan trọng, xóa dữ liệu hoặc ra quyết định tài chính mà không có bước xác nhận. Chạy thử trên bản sao dữ liệu, đo thời gian và tỷ lệ lỗi trong vài tuần sẽ cho biết quy trình có đáng mở rộng hay không.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "7 phút đọc",
    serviceSlug: "tu-dong-hoa-quy-trinh",
    serviceHref: "/dich-vu/tu-dong-hoa-quy-trinh",
    serviceLabel: "Xem dịch vụ tự động hóa",
    sections: [
      {
        heading: "Dấu hiệu một công việc nên được tự động hóa",
        paragraphs: [
          "Một việc phù hợp thường xuất hiện theo lịch hoặc sau một sự kiện cố định, dùng cùng một nhóm dữ liệu và có các bước dễ mô tả. Nếu nhân viên phải sao chép từ form sang bảng tính, gộp nhiều file rồi gửi báo cáo theo mẫu, khả năng tự động hóa thường khá rõ.",
          "Ngược lại, công việc đòi hỏi thương lượng, hiểu cảm xúc, quyết định ngoại lệ hoặc chịu trách nhiệm pháp lý không nên giao hoàn toàn cho hệ thống. Mục tiêu là giảm việc tay chứ không xóa vai trò kiểm soát của con người.",
        ],
        bullets: [
          "Lặp lại hằng ngày, hằng tuần hoặc theo mỗi đơn hàng.",
          "Có quy tắc nếu–thì tương đối ổn định.",
          "Dữ liệu đầu vào có định dạng nhất quán.",
          "Sai sót hiện tại chủ yếu do sao chép hoặc quên bước.",
        ],
      },
      {
        heading: "Các ví dụ phù hợp với đội nhóm nhỏ",
        paragraphs: [
          "Đội bán hàng có thể tự động ghi lead từ form vào bảng theo dõi và nhắc người phụ trách. Đội vận hành có thể gộp báo cáo từ nhiều cửa hàng, chuẩn hóa tên cột và đánh dấu dữ liệu thiếu. Đội nội dung có thể tạo bản nháp theo mẫu nhưng vẫn để người biên tập duyệt trước khi đăng.",
          "Không nhất thiết phải mua một nền tảng lớn. Nhiều quy trình có thể bắt đầu bằng Google Sheets, email, biểu mẫu và một công cụ kết nối. Điều quan trọng là log được trạng thái, biết bước nào thất bại và có cách chạy lại an toàn.",
        ],
        bullets: [
          "Tạo báo cáo doanh thu hoặc hoạt động định kỳ.",
          "Đồng bộ lead giữa form, bảng tính và email.",
          "Nhắc chăm sóc khách theo trạng thái.",
          "Tạo tài liệu, phiếu hoặc thư từ dữ liệu có sẵn.",
        ],
      },
      {
        heading: "Quy trình 5 bước để bắt đầu",
        paragraphs: [
          "Hãy đo thời gian hiện tại trước khi xây công cụ. Sau đó vẽ lại luồng công việc, chọn một bước nhỏ, tạo bản thử trên dữ liệu sao chép và chỉ đưa vào vận hành khi đã có người chịu trách nhiệm. Những trường hợp ngoại lệ phải được ghi rõ thay vì để hệ thống đoán.",
          "Sau hai đến bốn tuần, so sánh thời gian xử lý, số lỗi và mức độ dễ dùng. Nếu nhân viên phải sửa kết quả quá nhiều hoặc quy trình thay đổi liên tục, cần quay lại chuẩn hóa trước khi mở rộng.",
        ],
        bullets: [
          "Đo thời gian và lỗi của quy trình hiện tại.",
          "Chuẩn hóa đầu vào và người chịu trách nhiệm.",
          "Tự động hóa một đoạn nhỏ có giá trị rõ.",
          "Thêm log, cảnh báo và bước duyệt.",
          "Đo kết quả rồi mới mở rộng.",
        ],
      },
      {
        heading: "Bảo mật và phương án khi hệ thống lỗi",
        paragraphs: [
          "Chỉ cấp quyền tối thiểu cần thiết cho từng kết nối. Khóa truy cập không được đặt ở trình duyệt hoặc chia sẻ trong tài liệu công khai. Nếu xử lý dữ liệu khách hàng, cần thống nhất dữ liệu nào được lưu, lưu bao lâu và ai có quyền xem.",
          "Mỗi quy trình nên có cách dừng, chạy lại và khôi phục. Một thông báo lỗi tốt phải chỉ ra bước thất bại và dữ liệu liên quan, nhưng không được gửi thông tin nhạy cảm vào kênh công khai.",
        ],
      },
    ],
    faq: [
      {
        question: "Doanh nghiệp nhỏ có cần phần mềm đắt tiền để tự động hóa không?",
        answer:
          "Không nhất thiết. Có thể bắt đầu bằng công cụ đang dùng như bảng tính, email và biểu mẫu. Chi phí tăng khi cần tích hợp sâu, dữ liệu lớn hoặc yêu cầu bảo mật cao.",
      },
      {
        question: "Nên tự động hóa quy trình nào đầu tiên?",
        answer:
          "Chọn việc lặp lại nhiều, có quy tắc rõ, ít ngoại lệ và dễ đo thời gian. Tránh bắt đầu bằng quy trình quan trọng nhất nhưng chưa được chuẩn hóa.",
      },
      {
        question: "AI có cần thiết cho mọi quy trình tự động hóa không?",
        answer:
          "Không. Tác vụ có quy tắc rõ thường dùng logic thông thường nhanh và ổn định hơn. AI phù hợp khi cần xử lý ngôn ngữ hoặc dữ liệu khó chuẩn hóa, nhưng vẫn cần kiểm tra.",
      },
    ],
  },
  {
    slug: "dich-vu-xu-ly-du-lieu-excel-google-sheets",
    title: "Dịch vụ xử lý dữ liệu Excel, Google Sheets gồm những gì?",
    metaTitle: "Dịch vụ xử lý dữ liệu Excel & Google Sheets",
    description:
      "Dịch vụ xử lý dữ liệu Excel, Google Sheets: làm sạch, chuẩn hóa, gộp file, đối soát và tạo báo cáo cho shop, văn phòng và đội vận hành.",
    excerpt:
      "Khi file ngày càng nhiều, công thức dễ lỗi và báo cáo mất hàng giờ, doanh nghiệp cần chuẩn hóa dữ liệu trước khi nghĩ đến dashboard hay AI.",
    category: "Dữ liệu",
    primaryKeyword: "dịch vụ xử lý dữ liệu Excel",
    keywords: [
      "dịch vụ xử lý dữ liệu Excel",
      "xử lý dữ liệu Google Sheets",
      "gộp nhiều file Excel",
      "làm sạch dữ liệu Excel",
      "tạo báo cáo Excel theo yêu cầu",
    ],
    answer:
      "Dịch vụ xử lý dữ liệu Excel và Google Sheets thường gồm kiểm tra cấu trúc file, làm sạch lỗi định dạng, chuẩn hóa tên và mã, gộp dữ liệu từ nhiều nguồn, loại trùng, đối soát sai lệch và tạo báo cáo có thể chạy lại. Trước khi nhận báo giá, khách hàng nên gửi một bản dữ liệu mẫu đã ẩn thông tin nhạy cảm cùng mô tả đầu ra mong muốn. Chi phí phụ thuộc số file, số cột, mức độ không nhất quán, quy tắc nghiệp vụ và tần suất cần xử lý. Một đầu ra tốt không chỉ là file đã sửa; nó cần kèm quy tắc, log lỗi và hướng dẫn để đội ngũ hiểu dữ liệu đã thay đổi như thế nào. Với dữ liệu quan trọng, luôn nên chạy trên bản sao và kiểm tra mẫu trước khi thay thế file gốc.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "7 phút đọc",
    serviceSlug: "xu-ly-du-lieu",
    serviceHref: "/dich-vu/xu-ly-du-lieu",
    serviceLabel: "Xem dịch vụ xử lý dữ liệu",
    sections: [
      {
        heading: "Khi nào nên thuê xử lý dữ liệu?",
        paragraphs: [
          "Nếu mỗi kỳ báo cáo đều phải gộp nhiều file, sửa tên cột, dò mã và kiểm tra số liệu bằng mắt, quy trình đã đủ lớn để chuẩn hóa. Dấu hiệu khác là nhiều người giữ các phiên bản khác nhau của cùng một bảng hoặc công thức chỉ một người hiểu.",
          "Thuê ngoài phù hợp khi bài toán có đầu ra rõ nhưng đội ngũ không có thời gian xây quy trình. Tuy nhiên, người làm dữ liệu vẫn cần một người phía doanh nghiệp giải thích quy tắc nghiệp vụ và xác nhận kết quả.",
        ],
        bullets: [
          "File từ nhiều cửa hàng hoặc phòng ban không cùng định dạng.",
          "Tên khách, mã sản phẩm hoặc ngày tháng bị nhập không thống nhất.",
          "Báo cáo mất nhiều giờ và dễ sai khi sao chép.",
          "Cần một quy trình có thể chạy lại mỗi tuần hoặc mỗi tháng.",
        ],
      },
      {
        heading: "Các hạng mục xử lý phổ biến",
        paragraphs: [
          "Làm sạch dữ liệu bao gồm sửa định dạng, loại khoảng trắng, chuẩn hóa ngày tháng, xử lý ô trống và phát hiện giá trị bất thường. Gộp dữ liệu cần xác định khóa chung để tránh nhân đôi hoặc ghép nhầm bản ghi.",
          "Đối soát là bước so sánh hai hoặc nhiều nguồn theo quy tắc đã thống nhất. Kết quả nên chia rõ bản ghi khớp, không khớp và chưa đủ thông tin. Nếu cần dashboard, dữ liệu nền phải ổn định trước; biểu đồ đẹp không thể bù cho dữ liệu sai.",
        ],
        bullets: [
          "Làm sạch và chuẩn hóa định dạng.",
          "Gộp file, loại trùng và ánh xạ mã.",
          "Đối soát đơn hàng, thanh toán hoặc tồn kho.",
          "Tạo báo cáo, bảng tổng hợp và cảnh báo sai lệch.",
        ],
      },
      {
        heading: "Cần chuẩn bị gì để nhận báo giá chính xác?",
        paragraphs: [
          "Một file mẫu nhỏ thường đủ để đánh giá cấu trúc, nhưng phải đại diện cho các lỗi thường gặp. Hãy mô tả đầu ra bằng ví dụ cụ thể: cần bảng nào, cột nào, cách tính nào và ai sẽ dùng kết quả. Nếu quy tắc nằm trong kinh nghiệm của nhân viên, nên viết lại trước khi triển khai.",
          "Không gửi toàn bộ dữ liệu thật nếu chưa cần. Có thể thay tên, số điện thoại, email và mã nhạy cảm bằng dữ liệu giả. Hai bên cũng nên thống nhất cách truyền file, quyền truy cập và thời điểm xóa bản sao sau khi hoàn tất.",
        ],
        bullets: [
          "File mẫu đã ẩn thông tin nhạy cảm.",
          "Mô tả đầu ra và tần suất xử lý.",
          "Quy tắc tính, ghép và xử lý ngoại lệ.",
          "Số lượng file, số dòng và nguồn dữ liệu.",
        ],
      },
      {
        heading: "Cách nghiệm thu một file dữ liệu đã xử lý",
        paragraphs: [
          "Nên chọn một mẫu ngẫu nhiên và kiểm tra ngược với nguồn. Với các tổng tiền hoặc số lượng, so sánh tổng trước và sau để phát hiện mất dữ liệu. Các bản ghi bị loại hoặc sửa cần có log để giải thích.",
          "Nếu quy trình sẽ chạy định kỳ, hãy yêu cầu hướng dẫn cách thêm file mới, chạy lại, đọc lỗi và khôi phục. Mục tiêu cuối cùng là đội ngũ có thể tin vào kết quả mà không phụ thuộc vào thao tác bí mật của một người.",
        ],
      },
    ],
    faq: [
      {
        question: "Có thể xử lý dữ liệu mà không gửi file thật không?",
        answer:
          "Có thể bắt đầu bằng file mẫu đã thay thông tin nhạy cảm. Khi cần chạy thật, hai bên mới thống nhất quyền truy cập và cách bảo vệ dữ liệu.",
      },
      {
        question: "Dịch vụ có sửa công thức Excel bị lỗi không?",
        answer:
          "Có thể, nếu xác định được kết quả mong muốn và quy tắc nghiệp vụ. Với file phức tạp, nên kiểm tra toàn bộ chuỗi công thức chứ không chỉ sửa ô đang báo lỗi.",
      },
      {
        question: "Có thể tự động chạy báo cáo định kỳ không?",
        answer:
          "Có, sau khi dữ liệu đầu vào và quy tắc đã ổn định. Nên thêm log, cảnh báo và bước kiểm tra trước khi gửi báo cáo.",
      },
    ],
  },
  {
    slug: "marketing-cho-doanh-nghiep-nho-ngan-sach-thap",
    title: "Marketing cho doanh nghiệp nhỏ với ngân sách thấp: ưu tiên gì trước?",
    metaTitle: "Marketing cho doanh nghiệp nhỏ ngân sách thấp",
    description:
      "Cách lập kế hoạch marketing cho doanh nghiệp nhỏ: chọn khách hàng, thông điệp, kênh, ngân sách và chỉ số trước khi chạy quảng cáo.",
    excerpt:
      "Ngân sách nhỏ cần thứ tự ưu tiên rõ. Hãy chọn một nhóm khách, một lời hứa, một kênh chính và một chỉ số có thể theo dõi trước khi mở rộng.",
    category: "Marketing",
    primaryKeyword: "marketing cho doanh nghiệp nhỏ",
    keywords: [
      "marketing cho doanh nghiệp nhỏ",
      "marketing cho chủ shop",
      "kế hoạch marketing ngân sách thấp",
      "tư vấn marketing miễn phí",
      "marketing cho cửa hàng nhỏ",
    ],
    answer:
      "Marketing cho doanh nghiệp nhỏ với ngân sách thấp nên tập trung vào một nhóm khách hàng và một vấn đề quan trọng thay vì xuất hiện trên mọi kênh. Trước tiên, doanh nghiệp cần làm rõ sản phẩm dành cho ai, lý do khách nên tin và hành động mong muốn: gọi điện, nhắn tin, đặt lịch hay mua hàng. Sau đó chọn một kênh chính phù hợp với hành vi của khách, chuẩn bị trang đích hoặc nội dung trả lời đủ rõ và đặt cách đo lead. Quảng cáo chỉ nên bắt đầu khi thông điệp và điểm chuyển đổi đã sẵn sàng. Trong giai đoạn thử, dùng ngân sách nhỏ để so sánh nội dung, không thay quá nhiều yếu tố cùng lúc và không đánh giá chỉ bằng lượt thích. Chỉ số quan trọng hơn thường là chi phí cho một liên hệ đủ điều kiện và tỷ lệ biến liên hệ thành khách.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "8 phút đọc",
    serviceSlug: "tu-van-marketing",
    serviceHref: "/tu-van-marketing",
    serviceLabel: "Nhận tư vấn marketing miễn phí",
    sections: [
      {
        heading: "Bắt đầu từ khách hàng, không bắt đầu từ công cụ",
        paragraphs: [
          "Câu hỏi đầu tiên không phải nên chạy Facebook hay TikTok, mà là ai đang có vấn đề mà sản phẩm giải quyết tốt. Một nhóm khách càng cụ thể thì nội dung càng dễ viết và ngân sách thử nghiệm càng ít bị phân tán.",
          "Hãy phỏng vấn một vài khách đã mua hoặc đọc lại tin nhắn bán hàng để ghi đúng ngôn ngữ họ dùng. Nội dung tốt thường trả lời ba điều: khách đang vướng gì, giải pháp giúp thay đổi điều gì và bằng chứng nào khiến họ tin.",
        ],
        bullets: [
          "Chọn một nhóm khách ưu tiên trong 4–8 tuần.",
          "Ghi lại câu hỏi và lý do từ chối thường gặp.",
          "Viết một lời hứa cụ thể nhưng không phóng đại.",
          "Chọn một hành động chính sau khi khách đọc nội dung.",
        ],
      },
      {
        heading: "Chọn kênh marketing theo hành vi mua",
        paragraphs: [
          "Nếu khách chủ động tìm giải pháp, website và Google có giá trị dài hạn. Nếu sản phẩm cần hình ảnh và khám phá, mạng xã hội có thể phù hợp hơn. Nếu quyết định mua cần tư vấn, form, điện thoại và quy trình chăm sóc quan trọng không kém nội dung thu hút.",
          "Doanh nghiệp nhỏ nên có một kênh sở hữu như website hoặc danh sách khách, ngay cả khi nguồn khách chính đến từ mạng xã hội. Điều này giúp lưu thông tin cốt lõi và giảm phụ thuộc vào thay đổi thuật toán.",
        ],
        bullets: [
          "Google và SEO: phù hợp nhu cầu tìm kiếm chủ động.",
          "Facebook, TikTok: phù hợp nội dung khám phá và thử phản hồi nhanh.",
          "Email, Zalo hoặc CRM: phù hợp chăm sóc lại khách đã quan tâm.",
          "Website: nơi tập trung thông tin, bằng chứng và chuyển đổi.",
        ],
      },
      {
        heading: "Phân bổ ngân sách thử nghiệm",
        paragraphs: [
          "Đừng dùng toàn bộ ngân sách cho tiền quảng cáo. Cần dành nguồn lực cho nội dung, trang đích, thiết lập đo lường và chăm sóc lead. Nếu khách bấm quảng cáo nhưng không hiểu giá, phạm vi hoặc cách liên hệ, tăng ngân sách chỉ làm tăng lượng lãng phí.",
          "Trong mỗi vòng thử, chỉ nên thay một vài yếu tố như tiêu đề hoặc nhóm khách. Ghi lại ngày chạy, chi phí, số liên hệ, chất lượng và doanh thu sau cùng. Không nên kết luận chỉ từ một ngày hoặc một mẫu quá nhỏ.",
        ],
        bullets: [
          "Chuẩn bị nội dung và điểm chuyển đổi trước.",
          "Giữ một phần ngân sách cho thử nghiệm nhiều thông điệp.",
          "Đặt giới hạn chi tiêu và điều kiện dừng.",
          "Theo dõi đến chất lượng lead, không dừng ở lượt nhấp.",
        ],
      },
      {
        heading: "Các chỉ số doanh nghiệp nhỏ nên theo dõi",
        paragraphs: [
          "Lượt xem và tương tác giúp chẩn đoán nội dung, nhưng không đủ để đánh giá hiệu quả kinh doanh. Hãy theo dõi số liên hệ đủ điều kiện, chi phí trên mỗi liên hệ, tỷ lệ phản hồi và tỷ lệ chốt. Nếu chu kỳ bán dài, cần biết lead đến từ kênh nào và đang ở trạng thái nào.",
          "Mỗi tháng nên xem lại kênh nào tạo khách tốt, nội dung nào được hỏi nhiều và bước nào làm khách bỏ cuộc. Dữ liệu nhỏ nhưng đều đặn sẽ hữu ích hơn một dashboard phức tạp không ai sử dụng.",
        ],
      },
    ],
    faq: [
      {
        question: "Ngân sách nhỏ có nên chạy quảng cáo không?",
        answer:
          "Có thể, nếu đã xác định rõ nhóm khách, thông điệp, trang đích và cách đo liên hệ. Nên chạy thử có giới hạn thay vì kỳ vọng quảng cáo tự giải quyết mọi vấn đề.",
      },
      {
        question: "Kênh marketing nào phù hợp doanh nghiệp nhỏ nhất?",
        answer:
          "Không có một kênh tốt cho mọi ngành. Chọn theo nơi khách tìm hiểu, thời gian ra quyết định và khả năng tạo nội dung của đội ngũ.",
      },
      {
        question: "Tư vấn marketing miễn phí có cần mua dịch vụ không?",
        answer:
          "Tại Một Ngụm, buổi trao đổi ban đầu không bắt buộc mua dịch vụ. Mục tiêu là làm rõ vấn đề và thứ tự ưu tiên trước.",
      },
    ],
  },
  {
    slug: "khoa-hoc-ai-cho-nguoi-moi-tphcm",
    title: "Khóa học AI cho người mới tại TP.HCM nên học những gì?",
    metaTitle: "Khóa học AI cho người mới tại TP.HCM",
    description:
      "Checklist chọn khóa học AI cho người mới tại TP.HCM: nội dung thực hành, prompt, kiểm chứng, bảo mật và cách ứng dụng vào công việc.",
    excerpt:
      "Người mới không cần học quá nhiều công cụ. Một buổi học tốt phải giúp bạn xác định việc cần làm, viết yêu cầu rõ và biết kiểm tra kết quả AI.",
    category: "Đào tạo AI",
    primaryKeyword: "khóa học AI cho người mới tại TP.HCM",
    keywords: [
      "khóa học AI cho người mới tại TP.HCM",
      "học AI cơ bản",
      "khóa học AI cho dân văn phòng",
      "học cách dùng ChatGPT",
      "đào tạo AI cho chủ shop",
    ],
    answer:
      "Khóa học AI cho người mới tại TP.HCM nên tập trung vào cách xác định mục tiêu, viết yêu cầu rõ, cung cấp ngữ cảnh, kiểm tra thông tin và bảo vệ dữ liệu. Người học cần được thực hành trên công việc thật như soạn email, tóm tắt tài liệu, lên dàn ý nội dung, phân loại dữ liệu hoặc chuẩn bị báo cáo. Một khóa học không nên chỉ trình diễn nhiều công cụ; sau buổi học, người mới cần biết khi nào AI phù hợp, khi nào phải tự kiểm tra và dữ liệu nào không nên đưa lên hệ thống. Trước khi đăng ký, hãy hỏi về số lượng học viên, thời lượng thực hành, tài liệu mang về, công cụ cần tài khoản trả phí và cách nội dung được điều chỉnh theo nghề nghiệp. Khóa ngắn phù hợp để bắt đầu, còn kỹ năng chỉ bền khi người học áp dụng và rà lại kết quả đều đặn.",
    publishedAt: "2026-07-11",
    updatedAt: "2026-07-11",
    readTime: "7 phút đọc",
    serviceSlug: "dao-tao-ai-co-ban",
    serviceHref: "/dao-tao-ai",
    serviceLabel: "Xem chương trình đào tạo AI cơ bản",
    sections: [
      {
        heading: "Ai phù hợp với khóa học AI cơ bản?",
        paragraphs: [
          "Khóa cơ bản phù hợp với người thường xuyên đọc, viết, tổng hợp hoặc xử lý thông tin nhưng chưa có quy trình dùng AI rõ ràng. Nhân viên văn phòng có thể dùng để chuẩn bị bản nháp và báo cáo; chủ shop có thể hỗ trợ viết nội dung, phân loại phản hồi; người làm dịch vụ có thể xây bộ câu hỏi và tài liệu tư vấn.",
          "Không cần biết lập trình để bắt đầu. Tuy nhiên, người học cần sẵn sàng mô tả công việc và kiểm tra kết quả. AI không thay thế kiến thức chuyên môn; nó giúp thực hiện một số bước nhanh hơn khi đầu vào đủ rõ.",
        ],
        bullets: [
          "Người mới dùng ChatGPT, Gemini, Claude hoặc Copilot.",
          "Nhân viên văn phòng muốn giảm thời gian soạn và tổng hợp.",
          "Chủ shop cần hỗ trợ nội dung và chăm sóc khách ban đầu.",
          "Đội nhóm muốn thống nhất cách dùng AI an toàn.",
        ],
      },
      {
        heading: "Nội dung nên có trong một khóa học cho người mới",
        paragraphs: [
          "Phần quan trọng nhất là cách chuyển một yêu cầu mơ hồ thành nhiệm vụ có mục tiêu, bối cảnh, dữ liệu đầu vào và tiêu chí đầu ra. Người học nên thực hành nhiều vòng: viết yêu cầu, đọc kết quả, chỉ ra điểm chưa đúng và sửa prompt.",
          "Khóa học cũng cần nói rõ giới hạn. AI có thể bịa thông tin, bỏ sót ngữ cảnh và tạo nội dung nghe hợp lý nhưng không chính xác. Mỗi bài tập nên có bước kiểm chứng thay vì chỉ nhận kết quả đẹp.",
        ],
        bullets: [
          "Cấu trúc prompt theo mục tiêu và người đọc.",
          "Tóm tắt, viết lại và tạo dàn ý có kiểm soát.",
          "Phân loại và xử lý bảng dữ liệu đơn giản.",
          "Kiểm chứng thông tin và chỉnh giọng văn.",
          "Bảo mật dữ liệu và quản lý tài khoản.",
        ],
      },
      {
        heading: "Nên chuẩn bị gì trước buổi học?",
        paragraphs: [
          "Hãy mang theo hai hoặc ba công việc thật đang tốn thời gian cùng một mẫu đầu ra tốt. Ví dụ: email thường viết, báo cáo phải tổng hợp hoặc nội dung cần đăng. Có ví dụ thật giúp giảng viên hướng dẫn sát hơn và người học nhìn thấy cách áp dụng ngay.",
          "Dữ liệu dùng trong lớp nên được ẩn tên khách hàng, số điện thoại, hợp đồng và thông tin nội bộ. Nếu công ty có quy định sử dụng AI, hãy mang theo để đối chiếu. Người học cũng nên chuẩn bị tài khoản trên công cụ sẽ thực hành và biết gói miễn phí có giới hạn gì.",
        ],
      },
      {
        heading: "Cách đánh giá khóa học sau khi hoàn thành",
        paragraphs: [
          "Đừng đánh giá chỉ bằng số lượng công cụ được giới thiệu. Hãy xem bạn có tự viết được prompt cho một nhiệm vụ mới, nhận ra câu trả lời đáng ngờ và xây được checklist kiểm tra hay không. Một kết quả tốt khác là có bộ mẫu prompt gắn với công việc thật chứ không chỉ ví dụ chung.",
          "Trong hai tuần sau khóa học, chọn một tác vụ để dùng lặp lại và ghi thời gian trước–sau. Nếu chất lượng giảm hoặc phải sửa quá nhiều, hãy điều chỉnh quy trình. Mục tiêu là dùng AI có trách nhiệm và đo được giá trị, không phải dùng AI trong mọi việc.",
        ],
      },
    ],
    faq: [
      {
        question: "Người không biết công nghệ có học AI được không?",
        answer:
          "Có. Khóa cơ bản nên hướng dẫn bằng công việc quen thuộc và không yêu cầu lập trình. Kỹ năng quan trọng là mô tả mục tiêu và kiểm tra kết quả.",
      },
      {
        question: "Học một buổi có dùng AI thành thạo không?",
        answer:
          "Một buổi có thể tạo nền tảng và quy trình ban đầu. Thành thạo cần thực hành trên công việc thật, lưu mẫu hiệu quả và cập nhật khi công cụ thay đổi.",
      },
      {
        question: "Có nên đưa dữ liệu công ty vào AI không?",
        answer:
          "Chỉ khi chính sách công ty và điều khoản công cụ cho phép. Nên ẩn thông tin nhạy cảm, dùng dữ liệu tối thiểu và tránh tải khóa truy cập hoặc tài liệu mật.",
      },
    ],
  },
];

export const SEO_ARTICLES: SeoArticle[] = [
  ...CORE_SEO_ARTICLES,
  ...SUPPORTING_SEO_ARTICLES,
];

export function getSeoArticle(slug: string) {
  return SEO_ARTICLES.find((article) => article.slug === slug);
}

export function getArticlesForService(serviceSlug: string) {
  return SEO_ARTICLES.filter((article) => article.serviceSlug === serviceSlug);
}

export function getRelatedSeoArticles(article: SeoArticle, limit = 3) {
  return SEO_ARTICLES
    .filter((candidate) => candidate.slug !== article.slug)
    .map((candidate, index) => {
      const sharedKeywords = candidate.keywords.filter((keyword) =>
        article.keywords.includes(keyword)
      ).length;
      const score =
        (candidate.serviceSlug === article.serviceSlug ? 10 : 0) +
        (candidate.category === article.category ? 4 : 0) +
        sharedKeywords;

      return { candidate, index, score };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
