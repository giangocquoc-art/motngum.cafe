/**
 * Normalized, independently authored sections informed by three MIT sources:
 * shadcn-ui/ui Card, magicuidesign/magicui Border Beam,
 * StartBootstrap/startbootstrap-agency Timeline. No upstream artwork,
 * photos, logos, vendor copy or app scaffolding is bundled.
 *
 * Only existing SiteDocument v2 blocks are persisted. Design effects are
 * implemented once in the shared BlockPreview used by Puck and public sites.
 * See docs/STUDIO_TEMPLATE_PROVENANCE.md for precise URLs and licenses.
 */
import type { Block, BlockKind, BlockVariant, SiteDocument, ThemeId } from './catalog';

export type CuratedSource = 'shadcn-card' | 'magic-border-beam' | 'startbootstrap-agency';
const themeOf:Record<CuratedSource,ThemeId>={
  'shadcn-card':'ocean',
  'magic-border-beam':'neon',
  'startbootstrap-agency':'atelier'
};
function makeBlock(id:()=>string,theme:ThemeId,kind:BlockKind,variant:BlockVariant,
  title:string,body:string,buttonLabel='',buttonUrl=''):Block{
  const colors:Record<ThemeId,string>={
    atelier:'#ad673e',ink:'#222222',coffee:'#a65a32',forest:'#316e54',
    ocean:'#275ca6',neon:'#a8ff5f',playful:'#e85f7c',linen:'#8c7253'
  };
  return {id:id(),kind,variant,title,body,imageUrl:'',buttonLabel,buttonUrl,accent:colors[theme]};
}
export function buildCuratedTemplate(source:CuratedSource,id:()=>string):SiteDocument {
  const themeId=themeOf[source];
  const b=(kind:BlockKind,variant:BlockVariant,title:string,body:string,
    label='',href='')=>makeBlock(id,themeId,kind,variant,title,body,label,href);
  const page=(title:string,slug:string,blocks:Block[])=>({id:id(),title,slug,blocks});
  switch(source){
    case 'shadcn-card':
      return {version:2,title:'Northstar — SaaS',themeId,pages:[
        page('Trang chủ','trang-chu',[
          b('hero','split','Một nền tảng. Một quy trình rõ ràng.',
            'Giới thiệu sản phẩm, đề xuất giá trị và những việc khách hàng có thể thực hiện. Thay bằng nội dung sản phẩm của bạn.','Khám phá giải pháp','#page:giai-phap'),
          b('features','cards','Thiết kế để làm việc tốt hơn',
            'Bảng điều khiển|Theo dõi công việc trong một nơi\nQuy trình|Giảm bước thủ công và giữ thông tin liền mạch\nCộng tác|Dễ dàng phân quyền theo nhóm'),
          b('pricing','grid','Gói dịch vụ tùy chỉnh',
            'Khởi đầu|Chọn phạm vi công việc và báo giá|Trao đổi\nChuyên nghiệp|Cấu hình theo đội nhóm|Trao đổi\nDoanh nghiệp|Giải pháp theo yêu cầu|Liên hệ'),
          b('cta','centered','Bắt đầu từ nhu cầu của bạn','Mô tả yêu cầu và để đội ngũ tư vấn phương án phù hợp.','Xem liên hệ','#page:lien-he')
        ]),
        page('Giải pháp','giai-phap',[
          b('hero','minimal','Tập trung vào giá trị sử dụng','Mỗi khối có thể đổi nội dung, bố cục và màu trong Puck.'),
          b('services','cards','Những phần có thể triển khai',
            'Thiết lập|Chuẩn bị cấu hình dự án\nTùy chỉnh|Điều chỉnh theo nghiệp vụ\nVận hành|Theo dõi và cải thiện'),
          b('faq','list','Một vài câu hỏi để chuẩn bị',
            'Cần những thông tin gì?|Nêu phạm vi, mục tiêu và mốc triển khai.\nCó thể điều chỉnh không?|Các nội dung và gói dịch vụ được cấu hình theo yêu cầu.')
        ]),
        page('Liên hệ','lien-he',[
          b('hero','minimal','Kể về dự án của bạn','Thay đoạn này bằng thông tin liên hệ đã được xác minh.'),
          b('contact','split','Kênh liên hệ','Địa chỉ và thông tin liên hệ do chủ website cập nhật trước khi xuất bản.')
        ])
      ]};
    case 'magic-border-beam':
      return {version:2,title:'Orbit — Creative Lab',themeId,pages:[
        page('Trang chủ','trang-chu',[
          b('hero','banner','Ý tưởng khác biệt. Trải nghiệm có chiều sâu.',
            'Giao diện tối, chuyển sắc và điểm nhấn chuyển động có thể tắt theo cài đặt giảm chuyển động.','Xem dự án','#page:du-an'),
          b('features','banner','Từ ý tưởng đến bản sắc',
            'Chiến lược|Định hình câu chuyện thương hiệu\nThiết kế|Tạo trải nghiệm rõ ràng, giàu cảm xúc\nSản phẩm số|Kết nối hình ảnh với tương tác'),
          b('text','centered','Thiết kế không chỉ để nhìn','Một trang portfolio cần cho thấy cách bạn suy nghĩ, triển khai và tạo giá trị.'),
          b('cta','centered','Hãy kể dự án bạn đang ấp ủ','Tạo đoạn giới thiệu dự án và lời mời phù hợp với thương hiệu.','Kết nối với nhóm','#page:lien-he')
        ]),
        page('Dự án','du-an',[
          b('hero','minimal','Câu chuyện đằng sau dự án','Các dự án trong bản mẫu là cấu trúc trình bày, không phải thành tích đã thực hiện.'),
          b('services','grid','Cấu trúc một dự án',
            'Bối cảnh|Nêu nhu cầu và vấn đề ban đầu\nQuy trình|Giải thích cách tiếp cận, thiết kế và thử nghiệm\nKết quả|Chỉ điền kết quả đã được kiểm chứng'),
          b('text','minimal','Chèn portfolio thực tế','Thay nội dung này bằng hồ sơ dự án và hình ảnh do bạn sở hữu.')
        ]),
        page('Liên hệ','lien-he',[
          b('hero','minimal','Làm việc cùng nhau','Đặt thông tin liên hệ thật tại đây.'),
          b('contact','split','Hợp tác dự án','Chủ website bổ sung email, địa chỉ hoặc kênh liên hệ đã xác thực.')
        ])
      ]};
    case 'startbootstrap-agency':
      return {version:2,title:'Foundry — Agency',themeId,pages:[
        page('Trang chủ','trang-chu',[
          b('hero','full','Biến ý tưởng thành trải nghiệm thực tế',
            'Một cấu trúc giới thiệu agency với tiêu điểm rõ, dịch vụ và hành trình triển khai.','Khám phá quy trình','#page:quy-trinh'),
          b('features','cards','Chuyên môn cốt lõi',
            'Tư vấn|Định nghĩa vấn đề và nhu cầu\nThiết kế|Đề xuất trải nghiệm và hình ảnh phù hợp\nTriển khai|Chuyển phương án thành sản phẩm dùng được'),
          b('services','list','Hành trình triển khai',
            '01. Khám phá|Lắng nghe mục tiêu và bối cảnh dự án\n02. Định hướng|Xây cấu trúc, nội dung và phương án thiết kế\n03. Hoàn thiện|Đối chiếu kết quả với mục tiêu ban đầu\n04. Bàn giao|Chuẩn bị hướng dẫn và tài liệu vận hành'),
          b('cta','centered','Bắt đầu trao đổi','Mọi dự án đều bắt đầu bằng một cuộc thảo luận rõ ràng.','Gửi yêu cầu','#page:lien-he')
        ]),
        page('Quy trình','quy-trinh',[
          b('hero','minimal','Chia nhỏ các giai đoạn, giữ vững mục tiêu','Bố cục timeline lấy cảm hứng từ Start Bootstrap Agency, đã viết lại bằng các block v2.'),
          b('services','list','Từng bước đồng hành',
            'Khởi động|Xác nhận mục tiêu và đầu ra\nNghiên cứu|Tổng hợp dữ liệu và yêu cầu\nThiết kế|Xây dựng phương án và nhận góp ý\nĐánh giá|Kiểm thử và điều chỉnh'),
          b('faq','list','Một số câu hỏi cần thống nhất',
            'Ai phụ trách nội dung?|Xác định đầu mối phê duyệt từ đầu.\nKhi nào bàn giao?|Thống nhất mốc và điều kiện nghiệm thu.')
        ]),
        page('Liên hệ','lien-he',[
          b('hero','minimal','Xây điều gì đó có ích','Giới thiệu dự án và kênh liên hệ phù hợp.'),
          b('contact','split','Liên hệ dự án','Chủ website bổ sung email và thông tin doanh nghiệp có thể xác minh.')
        ])
      ]};
  }
}
