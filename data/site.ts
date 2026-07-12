export type MenuItem = {
  name: string;
  slug: string;
  image: string;
  small?: number;
  large?: number;
  single?: number;
  description: string;
};

export type Service = {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  price: string;
  summary: string;
  description: string;
  suitableFor: string[];
  features: string[];
  process: string[];
  faq: { question: string; answer: string }[];
};

export const BRAND = {
  name: "Một Ngụm",
  domain: "motngum.cafe",
  phone: "0583799593",
  phoneDisplay: "0583 799 593",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "cskh@motngum.cafe",
  city: "TP.HCM",
  tagline: "Một ngụm cà phê. Một hướng giải quyết.",
};

export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/menu", label: "Menu" },
  { href: "/dich-vu", label: "Dịch vụ" },
  { href: "/kien-thuc", label: "Kiến thức" },
  { href: "/qr", label: "Chọn vấn đề" },
  { href: "/bang-gia", label: "Bảng giá" },
  { href: "/ve-mot-ngum", label: "Về Một Ngụm" },
  { href: "/lien-he", label: "Liên hệ" },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    name: "Cà phê đen",
    slug: "cafe-den",
    image: "/assets/menu/cafe-den.webp",
    small: 12,
    large: 17,
    description: "Đậm, gọn, tỉnh táo. Ly nền của Một Ngụm.",
  },
  {
    name: "Cà phê sữa",
    slug: "cafe-sua",
    image: "/assets/menu/cafe-sua.webp",
    small: 15,
    large: 20,
    description: "Vị cà phê rõ, sữa vừa đủ, dễ uống mỗi sáng.",
  },
  {
    name: "Bạc xỉu",
    slug: "bac-xiu",
    image: "/assets/menu/bac-xiu.webp",
    small: 18,
    large: 23,
    description: "Nhiều sữa, nhẹ cà phê, êm và ngọt dịu.",
  },
  {
    name: "Cà phê sữa tươi",
    slug: "cafe-sua-tuoi",
    image: "/assets/menu/cafe-sua-tuoi.webp",
    small: 18,
    large: 23,
    description: "Cà phê đậm trên nền sữa tươi thanh nhẹ.",
  },
  {
    name: "Latte sữa hạt",
    slug: "latte-sua-hat",
    image: "/assets/menu/latte-sua-hat.webp",
    small: 18,
    large: 23,
    description: "Êm, thơm hạt, lớp cà phê nhẹ và cân bằng.",
  },
  {
    name: "Cà phê sữa hạt",
    slug: "cafe-sua-hat",
    image: "/assets/menu/cafe-sua-hat.webp",
    small: 18,
    large: 23,
    description: "Đậm hơn latte, vẫn giữ hậu vị sữa hạt.",
  },
  {
    name: "Choco",
    slug: "choco",
    image: "/assets/menu/choco.webp",
    single: 23,
    description: "Chocolate mượt, dễ uống, không quá ngọt.",
  },
];

export const SERVICES: Service[] = [
  {
    slug: "thiet-ke-website",
    title: "Thiết kế website",
    shortTitle: "Website",
    eyebrow: "Hiện diện số",
    price: "Từ 888.000đ",
    summary: "Website gọn, đẹp, tải nhanh, hiển thị tốt trên điện thoại và có SEO cơ bản trong combo.",
    description:
      "Một Ngụm xây website theo nhu cầu thật của cá nhân, cửa hàng và doanh nghiệp nhỏ. Ưu tiên giao diện rõ ràng, tốc độ tốt, nội dung dễ sửa và có đường dẫn chuyển đổi khách hàng.",
    suitableFor: [
      "Cá nhân kinh doanh và chủ shop",
      "Doanh nghiệp nhỏ cần website giới thiệu",
      "Dịch vụ địa phương cần khách gọi hoặc nhắn",
      "Người cần landing page bán hàng",
    ],
    features: [
      "Thiết kế responsive trên điện thoại, máy tính bảng và máy tính",
      "SEO cơ bản, metadata và sitemap",
      "Nút gọi điện, email và kênh liên hệ",
      "Tối ưu ảnh và tốc độ tải",
      "Bàn giao mã nguồn cùng hướng dẫn sử dụng",
    ],
    process: [
      "Trao đổi mục tiêu và nội dung",
      "Chốt cấu trúc trang và phong cách",
      "Thiết kế, lập trình và tối ưu",
      "Duyệt, chỉnh sửa và bàn giao",
    ],
    faq: [
      {
        question: "Giá từ 888.000đ gồm những gì?",
        answer:
          "Mức khởi điểm dành cho website hoặc landing page tinh gọn. Phạm vi cụ thể được chốt sau khi xem nội dung, số trang và tính năng.",
      },
      {
        question: "SEO có nằm trong combo không?",
        answer:
          "Có SEO kỹ thuật cơ bản như title, description, sitemap, cấu trúc heading và tối ưu hiển thị. SEO nội dung dài hạn được tư vấn riêng khi cần.",
      },
    ],
  },
  {
    slug: "chatbot-ai",
    title: "Chatbot AI",
    shortTitle: "Chatbot AI",
    eyebrow: "Hỏi đáp tự động",
    price: "Từ 100.000đ",
    summary: "Trợ lý hỏi đáp với phạm vi rõ ràng, dùng cho website, tài liệu hoặc bước chăm sóc khách hàng ban đầu.",
    description:
      "Chatbot được xây theo phạm vi dữ liệu và tình huống sử dụng cụ thể. Hệ thống hỗ trợ trả lời câu hỏi thường gặp, thu thập nhu cầu và chuyển sang người phụ trách khi không chắc chắn; không được xem là nguồn quyết định duy nhất.",
    suitableFor: [
      "Website có nhiều câu hỏi lặp lại",
      "Shop cần tư vấn sản phẩm ban đầu",
      "Dịch vụ cần thu thập thông tin khách",
      "Đội nhóm muốn tra cứu tài liệu nội bộ",
    ],
    features: [
      "Kịch bản FAQ hoặc AI theo dữ liệu được cung cấp",
      "Giao diện chat phù hợp nhận diện thương hiệu",
      "Thu thập thông tin liên hệ có kiểm soát",
      "Chuyển sang nhân viên khi chatbot không chắc chắn",
      "Không để khóa API ở phía trình duyệt",
    ],
    process: [
      "Xác định câu hỏi và nguồn dữ liệu",
      "Thiết kế luồng hội thoại",
      "Cấu hình, thử nghiệm và tinh chỉnh",
      "Tích hợp vào website và hướng dẫn theo dõi",
    ],
    faq: [
      {
        question: "Chatbot giá 100.000đ có phải gói đầy đủ không?",
        answer:
          "Đây là mức khởi điểm cho cấu hình đơn giản. Chi phí thực tế phụ thuộc số nguồn dữ liệu, lượng sử dụng, nền tảng và mức tùy chỉnh.",
      },
      {
        question: "Chatbot có thể trả lời sai không?",
        answer:
          "Có thể, vì vậy hệ thống cần giới hạn phạm vi, dẫn nguồn khi phù hợp và chuyển sang người thật khi không chắc chắn.",
      },
    ],
  },
  {
    slug: "xu-ly-du-lieu",
    title: "Hệ thống xử lý dữ liệu",
    shortTitle: "Xử lý dữ liệu",
    eyebrow: "Dữ liệu rõ ràng",
    price: "Liên hệ",
    summary: "Làm sạch, chuẩn hóa, gộp, đối soát và tạo báo cáo từ dữ liệu đang rời rạc.",
    description:
      "Giải pháp dành cho những quy trình đang phụ thuộc nhiều file Excel, dữ liệu từ nhiều nguồn hoặc thao tác tổng hợp thủ công.",
    suitableFor: [
      "Shop cần đối soát đơn hàng",
      "Đội vận hành có nhiều file Excel",
      "Doanh nghiệp cần dashboard nội bộ",
      "Người cần chuẩn hóa dữ liệu định kỳ",
    ],
    features: [
      "Làm sạch và chuẩn hóa định dạng",
      "Gộp dữ liệu từ nhiều nguồn",
      "Đối soát và phát hiện sai lệch",
      "Tạo báo cáo hoặc dashboard",
      "Thiết kế quy trình có thể chạy lại",
    ],
    process: [
      "Xem mẫu dữ liệu và mục tiêu đầu ra",
      "Thiết kế quy tắc xử lý",
      "Chạy thử trên bản sao dữ liệu",
      "Bàn giao công cụ và hướng dẫn",
    ],
    faq: [
      {
        question: "Có cần gửi toàn bộ dữ liệu thật ngay không?",
        answer:
          "Không. Có thể bắt đầu bằng dữ liệu mẫu đã ẩn thông tin nhạy cảm để xác định cấu trúc và phạm vi.",
      },
    ],
  },
  {
    slug: "tu-dong-hoa-quy-trinh",
    title: "Tự động hóa quy trình lặp lại",
    shortTitle: "Tự động hóa",
    eyebrow: "Bớt việc tay",
    price: "Liên hệ",
    summary: "Kết nối các bước lặp lại để giảm sao chép, nhập liệu và nhắc việc thủ công.",
    description:
      "Tự động hóa không phải thay mọi người bằng máy. Mục tiêu là loại bỏ các bước lặp lại, giữ điểm kiểm duyệt của con người và giúp quy trình dễ theo dõi hơn.",
    suitableFor: [
      "Nhân viên văn phòng làm báo cáo định kỳ",
      "Shop xử lý dữ liệu và nội dung lặp lại",
      "Đội nhỏ cần nhắc việc và chuyển dữ liệu",
      "Quy trình nhiều thao tác sao chép",
    ],
    features: [
      "Tự động tạo báo cáo hoặc tài liệu",
      "Đồng bộ dữ liệu giữa các công cụ",
      "Nhắc việc và ghi nhận trạng thái",
      "Kiểm duyệt thủ công ở bước quan trọng",
      "Log lỗi và hướng dẫn khôi phục",
    ],
    process: [
      "Vẽ lại quy trình hiện tại",
      "Chọn bước nên và không nên tự động",
      "Xây thử trên phạm vi nhỏ",
      "Đo thời gian tiết kiệm rồi mở rộng",
    ],
    faq: [
      {
        question: "Có tự động hóa mọi thao tác được không?",
        answer:
          "Không nên. Những bước có rủi ro, quyết định quan trọng hoặc liên quan dữ liệu nhạy cảm cần giữ người kiểm duyệt.",
      },
    ],
  },
  {
    slug: "ho-tro-dang-bai",
    title: "Phần mềm hỗ trợ đăng bài",
    shortTitle: "Đăng bài",
    eyebrow: "Nội dung đa kênh",
    price: "Liên hệ",
    summary: "Soạn, quản lý, lên lịch và phân phối nội dung theo quy trình rõ ràng.",
    description:
      "Công cụ tập trung vào quản lý nội dung và giảm thao tác lặp lại. Việc tích hợp ưu tiên API, quyền truy cập và quy định của từng nền tảng.",
    suitableFor: [
      "Shop quản lý nhiều kênh nội dung",
      "Đội marketing nhỏ",
      "Người cần lịch đăng bài",
      "Doanh nghiệp cần quy trình duyệt bài",
    ],
    features: [
      "Kho nội dung và lịch đăng",
      "Mẫu bài và biến thể nội dung",
      "Quy trình duyệt trước khi đăng",
      "Theo dõi trạng thái từng bài",
      "Tích hợp theo phương thức nền tảng cho phép",
    ],
    process: [
      "Khảo sát kênh và luồng nội dung",
      "Chốt quyền truy cập và quy tắc",
      "Thiết lập lịch, mẫu và trạng thái",
      "Thử nghiệm trước khi dùng thật",
    ],
    faq: [
      {
        question: "Công cụ có dùng để spam không?",
        answer:
          "Không. Thiết kế hướng đến quản lý nội dung hợp lệ, có kiểm duyệt và tuân thủ quy định của từng nền tảng.",
      },
    ],
  },
  {
    slug: "ho-tro-tuong-tac",
    title: "Phần mềm hỗ trợ tương tác",
    shortTitle: "Tương tác",
    eyebrow: "Chăm sóc khách",
    price: "Liên hệ",
    summary: "Gom bình luận, tin nhắn, lead và nhắc chăm sóc vào một luồng dễ theo dõi.",
    description:
      "Hệ thống hỗ trợ người dùng quản lý phản hồi, phân loại khách hàng và chuẩn bị câu trả lời. Các hành động gửi đi có thể yêu cầu người phụ trách xác nhận trước.",
    suitableFor: [
      "Shop có nhiều bình luận và tin nhắn",
      "Nhóm sales cần theo dõi lead",
      "Dịch vụ cần nhắc chăm sóc lại",
      "Người muốn chuẩn hóa câu trả lời",
    ],
    features: [
      "Gắn nhãn và phân loại lead",
      "Theo dõi lịch sử trao đổi",
      "Nhắc chăm sóc đúng thời điểm",
      "Gợi ý câu trả lời để người dùng duyệt",
      "Báo cáo trạng thái xử lý",
    ],
    process: [
      "Xác định nguồn tương tác",
      "Thiết kế nhãn và trạng thái",
      "Thiết lập mẫu trả lời",
      "Chạy thử với nhóm nhỏ",
    ],
    faq: [
      {
        question: "Hệ thống có tự gửi hàng loạt không?",
        answer:
          "Phạm vi triển khai ưu tiên chăm sóc hợp lệ, có kiểm soát và theo giới hạn của nền tảng. Không thiết kế cho spam.",
      },
    ],
  },
  {
    slug: "quang-cao",
    title: "Chạy quảng cáo",
    shortTitle: "Facebook · TikTok · Shopee Ads",
    eyebrow: "Thu hút khách",
    price: "Từ 2.000.000đ",
    summary: "Khảo sát sản phẩm, mục tiêu, nội dung và đo lường trước khi mở rộng ngân sách.",
    description:
      "Dịch vụ quảng cáo tập trung vào mục tiêu thực tế, cấu trúc chiến dịch rõ ràng và báo cáo dễ hiểu. Ngân sách quảng cáo được tách riêng với phí dịch vụ.",
    suitableFor: [
      "Shop cần thử quảng cáo có kiểm soát",
      "Doanh nghiệp nhỏ cần cấu trúc tài khoản",
      "Người cần theo dõi chi phí trên lead",
      "Sản phẩm cần thử nội dung và tệp khách",
    ],
    features: [
      "Khảo sát sản phẩm và tệp khách",
      "Chuẩn bị nội dung quảng cáo",
      "Thiết lập đo lường cơ bản",
      "Theo dõi và điều chỉnh định kỳ",
      "Báo cáo dễ hiểu, không cam kết doanh thu tuyệt đối",
    ],
    process: [
      "Trao đổi mục tiêu và ngân sách",
      "Kiểm tra trang đích và nội dung",
      "Triển khai chiến dịch thử",
      "Đánh giá rồi mới tăng ngân sách",
    ],
    faq: [
      {
        question: "2.000.000đ có bao gồm tiền nạp quảng cáo không?",
        answer:
          "Không mặc định. Phí dịch vụ và ngân sách chạy quảng cáo cần được tách rõ trong báo giá.",
      },
    ],
  },
  {
    slug: "dao-tao-ai-co-ban",
    title: "Đào tạo sử dụng AI cơ bản",
    shortTitle: "Đào tạo AI",
    eyebrow: "Học để dùng được",
    price: "500.000đ",
    summary: "Học cách đặt câu hỏi, tạo nội dung, xử lý dữ liệu và xây quy trình AI cơ bản.",
    description:
      "Buổi học dành cho cá nhân, nhân viên văn phòng, chủ shop và đội nhóm nhỏ muốn dùng AI vào việc thật thay vì chỉ xem demo.",
    suitableFor: [
      "Người mới dùng AI",
      "Nhân viên văn phòng",
      "Chủ shop và người làm nội dung",
      "Đội nhóm cần quy tắc sử dụng chung",
    ],
    features: [
      "Cách viết prompt theo mục tiêu",
      "Tạo và kiểm tra nội dung",
      "Tóm tắt, phân loại và xử lý dữ liệu",
      "Xây quy trình có bước kiểm tra",
      "Lưu ý bảo mật và kiểm chứng thông tin",
    ],
    process: [
      "Khảo sát công việc của người học",
      "Hướng dẫn theo ví dụ thật",
      "Thực hành trên tác vụ đang làm",
      "Bàn giao mẫu prompt và checklist",
    ],
    faq: [
      {
        question: "Người chưa biết kỹ thuật có học được không?",
        answer:
          "Có. Nội dung bắt đầu từ cách xác định mục tiêu, viết yêu cầu rõ và kiểm tra kết quả, không yêu cầu biết lập trình.",
      },
    ],
  },
  {
    slug: "tu-van-marketing",
    title: "Tư vấn marketing miễn phí",
    shortTitle: "Tư vấn marketing",
    eyebrow: "Bắt đầu từ vấn đề thật",
    price: "Miễn phí",
    summary: "Trao đổi ban đầu để xác định vấn đề, ưu tiên và hướng đi phù hợp.",
    description:
      "Bạn không cần biết trước mình nên làm website, chatbot, quảng cáo hay tự động hóa. Hãy bắt đầu bằng việc kể vấn đề và mục tiêu hiện tại.",
    suitableFor: [
      "Chưa biết nên bắt đầu từ đâu",
      "Có ngân sách nhỏ và cần ưu tiên",
      "Đang làm nhiều nhưng chưa có quy trình",
      "Muốn có góc nhìn trước khi mua dịch vụ",
    ],
    features: [
      "Lắng nghe mô hình và khó khăn hiện tại",
      "Xác định nút thắt ưu tiên",
      "Gợi ý hướng tự làm hoặc thuê ngoài",
      "Không ép mua dịch vụ",
      "Tóm tắt bước tiếp theo sau buổi trao đổi",
    ],
    process: [
      "Gửi vấn đề qua form hoặc điện thoại",
      "Trao đổi ngắn để làm rõ",
      "Đề xuất thứ tự ưu tiên",
      "Bạn quyết định có triển khai hay không",
    ],
    faq: [
      {
        question: "Tư vấn miễn phí có bắt buộc mua dịch vụ không?",
        answer:
          "Không. Mục tiêu là giúp bạn xác định vấn đề và bước tiếp theo hợp lý.",
      },
    ],
  },
];

export function getService(slug: string) {
  return SERVICES.find((service) => service.slug === slug);
}

export function getServiceHref(slug: string) {
  if (slug === "dao-tao-ai-co-ban") return "/dao-tao-ai";
  if (slug === "tu-van-marketing") return "/tu-van-marketing";
  return `/dich-vu/${slug}`;
}

export const AI_LIMITATIONS = [
  {
    title: "Có thể trả lời sai",
    issue:
      "Mô hình AI có thể diễn đạt rất tự tin dù thông tin chưa đúng, thiếu ngữ cảnh hoặc không có căn cứ.",
    practice:
      "Giới hạn phạm vi trả lời, ưu tiên dữ liệu đã duyệt, hiển thị nguồn khi phù hợp và chuyển sang người thật khi hệ thống không chắc chắn.",
  },
  {
    title: "Dữ liệu cần được bảo vệ",
    issue:
      "Thông tin khách hàng, tài liệu nội bộ và khóa truy cập có thể trở thành rủi ro nếu thu thập quá mức hoặc cấu hình sai.",
    practice:
      "Chỉ lấy dữ liệu cần thiết, không đưa khóa bí mật ra trình duyệt, phân quyền truy cập và thống nhất thời hạn lưu dữ liệu trước khi triển khai.",
  },
  {
    title: "Phản hồi có thể chậm",
    issue:
      "Chatbot dùng mô hình ngôn ngữ thường có độ trễ cao hơn FAQ hoặc logic web truyền thống, nhất là khi ngữ cảnh quá dài.",
    practice:
      "Dùng FAQ cho câu hỏi đơn giản, rút gọn ngữ cảnh, tối ưu luồng gọi mô hình và luôn có trạng thái chờ hoặc phương án dự phòng rõ ràng.",
  },
  {
    title: "Không nên phụ thuộc vào ảnh",
    issue:
      "Nội dung chỉ nằm trong bảng giá, giấy chứng nhận hoặc ảnh chụp có thể bị đọc thiếu hoặc hiểu sai.",
    practice:
      "Đưa thông tin quan trọng thành văn bản thật trên website, thêm mô tả ảnh và chỉ dùng nhận diện hình ảnh như một bước hỗ trợ.",
  },
  {
    title: "Nội dung cần người biên tập",
    issue:
      "Nội dung AI có thể lặp ý, thiếu nét riêng hoặc vô tình quá giống nguồn tham khảo.",
    practice:
      "Kiểm tra nguồn, biên tập lại theo giọng thương hiệu, đối chiếu bản quyền và không xuất bản tự động những nội dung quan trọng.",
  },
  {
    title: "Không thay thế sự thấu cảm",
    issue:
      "Chatbot khó hiểu đầy đủ cảm xúc, hoàn cảnh và những trường hợp cần sự linh hoạt của con người.",
    practice:
      "Cho khách gặp người phụ trách dễ dàng, đặt ngưỡng chuyển tiếp rõ ràng và không để bot tự xử lý khiếu nại hoặc quyết định nhạy cảm.",
  },
] as const;
