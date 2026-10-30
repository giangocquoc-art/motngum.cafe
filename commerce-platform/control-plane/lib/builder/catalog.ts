import { buildCuratedTemplate, type CuratedSource } from './curated-templates';
export type BlockKind =
  | 'hero' | 'features' | 'text' | 'image' | 'cta' | 'gallery' | 'stats' | 'testimonials'
  | 'pricing' | 'faq' | 'services' | 'team' | 'logos' | 'contact' | 'newsletter' | 'products';
export type BlockVariant = 'centered' | 'split' | 'full' | 'minimal' | 'grid' | 'cards' | 'banner' | 'list';
export type ThemeId = 'atelier' | 'ink' | 'coffee' | 'forest' | 'ocean' | 'neon' | 'playful' | 'linen';
export type Block = {
  id: string; kind: BlockKind; variant: BlockVariant; title: string; body: string;
  imageUrl: string; buttonLabel: string; buttonUrl: string; accent: string;
};
export type SitePage = { id: string; title: string; slug: string; blocks: Block[] };
export type SiteDocument = { version: 2; title: string; themeId: ThemeId; pages: SitePage[] };
export type SiteCategory = 'Cửa hàng' | 'Portfolio' | 'Dịch vụ & Ẩm thực' | 'Doanh nghiệp' | 'Giáo dục' | 'Sự kiện';
export type ThemeDefinition = {
  id: ThemeId; name: string; primary: string; foreground: string; background: string;
  surface: string; muted: string; border: string; font: string; radius: string; mood: string;
};
export const BLOCK_KINDS: BlockKind[] = [
  'hero', 'features', 'text', 'image', 'cta', 'gallery', 'stats', 'testimonials',
  'pricing', 'faq', 'services', 'team', 'logos', 'contact', 'newsletter', 'products'
];
export const BLOCK_VARIANTS: BlockVariant[] = ['centered', 'split', 'full', 'minimal', 'grid', 'cards', 'banner', 'list'];
export const KIND_LABELS: Record<BlockKind, string> = {
  hero: 'Trang bìa / Hero', features: 'Điểm nổi bật', text: 'Văn bản giới thiệu', image: 'Ảnh lớn',
  cta: 'Kêu gọi hành động', gallery: 'Bộ sưu tập ảnh', stats: 'Số liệu nổi bật',
  testimonials: 'Đánh giá khách hàng', pricing: 'Bảng giá', faq: 'Câu hỏi thường gặp',
  services: 'Dịch vụ', team: 'Đội ngũ', logos: 'Đối tác', contact: 'Liên hệ',
  newsletter: 'Nhận tin', products: 'Sản phẩm trưng bày'
};
export const THEMES: ThemeDefinition[] = [
  { id:'atelier',name:'Atelier',primary:'#ad673e',foreground:'#2c201b',background:'#fbf7f0',surface:'#ffffff',muted:'#766c62',border:'#eadbcf',font:'Georgia, Cambria, serif',radius:'4px',mood:'Editorial · tinh tế' },
  { id:'ink',name:'Ink',primary:'#222222',foreground:'#141414',background:'#f6f6f5',surface:'#ffffff',muted:'#606060',border:'#ddddda',font:'Arial, Helvetica, sans-serif',radius:'2px',mood:'Minimal · đơn sắc' },
  { id:'coffee',name:'Coffee',primary:'#a65a32',foreground:'#3b251b',background:'#fff7ec',surface:'#fffdf8',muted:'#79594b',border:'#efddc6',font:'Georgia, Cambria, serif',radius:'18px',mood:'Ấm áp · thủ công' },
  { id:'forest',name:'Forest',primary:'#316e54',foreground:'#1d342b',background:'#f1f6ed',surface:'#ffffff',muted:'#557064',border:'#d4e4d7',font:'Arial, Helvetica, sans-serif',radius:'14px',mood:'Tự nhiên · dịu mắt' },
  { id:'ocean',name:'Ocean',primary:'#275ca6',foreground:'#112b4c',background:'#eef5ff',surface:'#ffffff',muted:'#516b89',border:'#d4e3f8',font:'Arial, Helvetica, sans-serif',radius:'12px',mood:'Doanh nghiệp · tin cậy' },
  { id:'neon',name:'Neon',primary:'#a8ff5f',foreground:'#f8fff4',background:'#11151d',surface:'#1e2630',muted:'#b3bdc5',border:'#38414d',font:'Arial, Helvetica, sans-serif',radius:'16px',mood:'Công nghệ · tương phản' },
  { id:'playful',name:'Playful',primary:'#e85f7c',foreground:'#422646',background:'#fff0f5',surface:'#ffffff',muted:'#805f7c',border:'#f7cbd9',font:'Arial, Helvetica, sans-serif',radius:'24px',mood:'Vui tươi · sáng tạo' },
  { id:'linen',name:'Linen',primary:'#8c7253',foreground:'#3c3429',background:'#f6f2e9',surface:'#fffefa',muted:'#807365',border:'#e5dccf',font:'Georgia, Cambria, serif',radius:'8px',mood:'Tối giản · tự nhiên' }
];
export const TEMPLATE_CATEGORIES: SiteCategory[] = [
  'Cửa hàng','Portfolio','Dịch vụ & Ẩm thực','Doanh nghiệp','Giáo dục','Sự kiện'
];
type Seed = {
  curatedSource?: CuratedSource;
  id: string; category: SiteCategory; name: string; tagline: string; description: string;
  theme: ThemeId; layout: BlockVariant; order: BlockKind[]; heroImage: string; detail: string;
};
const photos = {
  fashion:'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400',
  beauty:'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1400',
  interior:'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400',
  flowers:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1400',
  architecture:'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1400',
  photo:'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400',
  creative:'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1400',
  art:'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=1400',
  cafe:'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1400',
  food:'https://images.unsplash.com/photo-1547592180-85f173990554?w=1400',
  table:'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1400',
  bakery:'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1400',
  agency:'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1400',
  tech:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400',
  consulting:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1400',
  logistics:'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1400',
  language:'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1400',
  kids:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400',
  course:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1400',
  notes:'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=1400',
  wedding:'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400',
  conference:'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1400',
  festival:'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1400',
  launch:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400'
};
const GALLERY_PHOTOS: Record<SiteCategory, string[]> = {
  'Cửa hàng':[photos.fashion,photos.beauty,photos.interior,photos.flowers],
  'Portfolio':[photos.architecture,photos.photo,photos.creative,photos.art],
  'Dịch vụ & Ẩm thực':[photos.cafe,photos.food,photos.table,photos.bakery],
  'Doanh nghiệp':[photos.agency,photos.tech,photos.consulting,photos.logistics],
  'Giáo dục':[photos.language,photos.kids,photos.course,photos.notes],
  'Sự kiện':[photos.wedding,photos.conference,photos.festival,photos.launch]
};
const SEEDS: Seed[] = [
  {id:'atelier-mode',category:'Cửa hàng',name:'Atelier Mode',tagline:'Phong cách tạo nên dấu ấn',description:'Lookbook thời trang tinh giản, hình ảnh lớn và sản phẩm.',theme:'atelier',layout:'split',order:['hero','products','gallery','testimonials','cta'],heroImage:photos.fashion,detail:'Trang phục tuyển chọn · Bộ sưu tập mới · Chất liệu tinh tế'},
  {id:'serein-beauty',category:'Cửa hàng',name:'Serein Beauty',tagline:'Đẹp theo cách của riêng bạn',description:'Mỹ phẩm, bộ sưu tập và phản hồi khách hàng.',theme:'playful',layout:'centered',order:['hero','features','products','faq','cta'],heroImage:photos.beauty,detail:'Lành tính · Dịu nhẹ · Chăm sóc mỗi ngày'},
  {id:'folio-home',category:'Cửa hàng',name:'Folio Home',tagline:'Không gian đáng để trở về',description:'Nội thất mang tinh thần tạp chí thiết kế.',theme:'linen',layout:'full',order:['hero','gallery','text','products','cta'],heroImage:photos.interior,detail:'Không gian sống · Chất liệu · Nội thất'},
  {id:'bloom-garden',category:'Cửa hàng',name:'Bloom Garden',tagline:'Một nhành hoa, ngàn cảm xúc',description:'Cửa hàng hoa tươi với gallery và bảng dịch vụ.',theme:'forest',layout:'cards',order:['hero','products','services','testimonials','cta'],heroImage:photos.flowers,detail:'Hoa tươi mỗi ngày · Thiết kế theo yêu cầu · Giao nhanh'},
  {id:'form-studio',category:'Portfolio',name:'Form Studio',tagline:'Ý tưởng tốt cần hình hài riêng',description:'Portfolio thiết kế tối giản và dự án nổi bật.',theme:'ink',layout:'minimal',order:['hero','gallery','stats','team','contact'],heroImage:photos.creative,detail:'Nhận diện thương hiệu · Sáng tạo · Trải nghiệm'},
  {id:'obscura-photo',category:'Portfolio',name:'Obscura Photography',tagline:'Chúng tôi kể chuyện bằng ánh sáng',description:'Bộ ảnh tràn khung, trình bày giàu cảm xúc.',theme:'neon',layout:'full',order:['hero','gallery','text','testimonials','contact'],heroImage:photos.photo,detail:'Chân dung · Lifestyle · Sự kiện'},
  {id:'lumen-creative',category:'Portfolio',name:'Lumen Creative',tagline:'Những câu chuyện khác biệt',description:'Portfolio agency sáng tạo, cá tính và tương phản.',theme:'playful',layout:'grid',order:['hero','services','gallery','logos','cta'],heroImage:photos.art,detail:'Thiết kế · Nội dung · Chiến dịch'},
  {id:'arco-architecture',category:'Portfolio',name:'Arco Architecture',tagline:'Kiến trúc bắt đầu từ con người',description:'Dự án kiến trúc, quy trình và đội ngũ.',theme:'atelier',layout:'split',order:['hero','gallery','stats','services','team','contact'],heroImage:photos.architecture,detail:'Không gian · Ánh sáng · Vật liệu'},
  {id:'maison-cafe',category:'Dịch vụ & Ẩm thực',name:'Maison Café',tagline:'Một góc nhỏ cho ngày thật chậm',description:'Quán cà phê ấm áp, menu và thông tin liên hệ.',theme:'coffee',layout:'split',order:['hero','features','gallery','services','contact'],heroImage:photos.cafe,detail:'Cà phê thủ công · Bánh tươi · Chuyện mỗi ngày'},
  {id:'nori-kitchen',category:'Dịch vụ & Ẩm thực',name:'Nori Kitchen',tagline:'Bữa ăn đẹp bắt đầu từ sự tươi mới',description:'Nhà hàng với món nổi bật và đánh giá.',theme:'ink',layout:'full',order:['hero','products','testimonials','faq','contact'],heroImage:photos.food,detail:'Nguyên liệu mùa vụ · Chế biến trong ngày · Tận tâm'},
  {id:'herb-and-table',category:'Dịch vụ & Ẩm thực',name:'Herb & Table',tagline:'Thưởng thức theo nhịp tự nhiên',description:'Dịch vụ ẩm thực thanh lịch và gallery.',theme:'forest',layout:'centered',order:['hero','text','gallery','pricing','contact'],heroImage:photos.table,detail:'Ẩm thực theo mùa · Không gian yên tĩnh · Thân thiện'},
  {id:'ember-bakery',category:'Dịch vụ & Ẩm thực',name:'Ember Bakery',tagline:'Mỗi chiếc bánh, một chút yêu thương',description:'Tiệm bánh ngọt đáng yêu với sản phẩm trưng bày.',theme:'playful',layout:'cards',order:['hero','products','features','testimonials','newsletter'],heroImage:photos.bakery,detail:'Nướng mới mỗi sáng · Nguyên liệu chọn lọc · Đặt trước'},
  {id:'northstar-agency',category:'Doanh nghiệp',name:'Northstar Agency',tagline:'Chiến lược sáng tạo, hiệu quả thực chất',description:'Giới thiệu dịch vụ, khách hàng và case study.',theme:'ink',layout:'grid',order:['hero','stats','services','logos','testimonials','cta'],heroImage:photos.agency,detail:'Chiến lược · Sáng tạo · Tăng trưởng'},
  {id:'nova-saas',category:'Doanh nghiệp',name:'Nova SaaS',tagline:'Làm việc thông minh hơn mỗi ngày',description:'Landing page sản phẩm SaaS và bảng giá.',theme:'neon',layout:'split',order:['hero','features','stats','pricing','faq','cta'],heroImage:photos.tech,detail:'Tập trung · Tự động hóa · Bảo mật'},
  {id:'bravura-consulting',category:'Doanh nghiệp',name:'Bravura Consulting',tagline:'Cùng doanh nghiệp tìm đúng hướng đi',description:'Tư vấn chuyên nghiệp và quy trình hợp tác.',theme:'ocean',layout:'centered',order:['hero','services','stats','team','testimonials','contact'],heroImage:photos.consulting,detail:'Tư vấn chiến lược · Quản trị · Đồng hành'},
  {id:'atlas-logistics',category:'Doanh nghiệp',name:'Atlas Logistics',tagline:'Kết nối hành trình, mở rộng cơ hội',description:'Logistics với số liệu và năng lực vận hành.',theme:'ocean',layout:'full',order:['hero','stats','features','services','logos','contact'],heroImage:photos.logistics,detail:'Vận tải · Kho vận · Chuỗi cung ứng'},
  {id:'lingua-academy',category:'Giáo dục',name:'Lingua Academy',tagline:'Mỗi ngày một bước gần hơn',description:'Trung tâm ngoại ngữ với khóa học và học viên.',theme:'ocean',layout:'split',order:['hero','services','stats','testimonials','faq','cta'],heroImage:photos.language,detail:'Lộ trình rõ ràng · Giáo viên tận tâm · Học chủ động'},
  {id:'little-sprouts',category:'Giáo dục',name:'Little Sprouts',tagline:'Nơi trí tò mò được lớn lên',description:'Trường học cho trẻ với gallery và đội ngũ.',theme:'playful',layout:'cards',order:['hero','features','gallery','team','contact'],heroImage:photos.kids,detail:'Chơi để học · Khám phá · Phát triển toàn diện'},
  {id:'skillup-school',category:'Giáo dục',name:'SkillUp School',tagline:'Học kỹ năng, tạo tương lai',description:'Khóa học trực tuyến, lộ trình và bảng giá.',theme:'neon',layout:'grid',order:['hero','services','pricing','testimonials','faq','newsletter'],heroImage:photos.course,detail:'Thực hành · Dự án · Cộng đồng'},
  {id:'scholar-notes',category:'Giáo dục',name:'Scholar Notes',tagline:'Học sâu hơn, mỗi ngày một chút',description:'Blog giáo dục, tài nguyên và đăng ký bản tin.',theme:'linen',layout:'minimal',order:['hero','text','gallery','features','newsletter'],heroImage:photos.notes,detail:'Ghi chép · Ý tưởng · Nguồn học tập'},
  {id:'ever-after',category:'Sự kiện',name:'Ever After',tagline:'Một ngày đặc biệt, một đời ghi nhớ',description:'Wedding landing page, ảnh và thông tin sự kiện.',theme:'atelier',layout:'full',order:['hero','text','gallery','faq','contact'],heroImage:photos.wedding,detail:'Câu chuyện · Khoảnh khắc · Lễ cưới'},
  {id:'pulse-conference',category:'Sự kiện',name:'Pulse Conference',tagline:'Nơi những ý tưởng lớn gặp nhau',description:'Hội nghị với agenda, diễn giả và đối tác.',theme:'ocean',layout:'grid',order:['hero','stats','services','team','logos','cta'],heroImage:photos.conference,detail:'Kết nối · Học hỏi · Truyền cảm hứng'},
  {id:'echo-festival',category:'Sự kiện',name:'Echo Festival',tagline:'Bật nhịp cảm xúc, sống cùng âm nhạc',description:'Festival sôi động, lịch diễn và đăng ký.',theme:'neon',layout:'banner',order:['hero','gallery','team','pricing','faq','cta'],heroImage:photos.festival,detail:'Âm nhạc · Nghệ thuật · Cộng đồng'},
  {id:'launchpad-product',category:'Sự kiện',name:'Launchpad',tagline:'Màn ra mắt xứng đáng được nhớ',description:'Sự kiện giới thiệu sản phẩm, lợi ích và FAQ.',theme:'ink',layout:'split',order:['hero','features','stats','gallery','faq','cta'],heroImage:photos.launch,detail:'Đột phá · Trải nghiệm · Khám phá'}
];
const CURATED_SEEDS:Seed[]=[
  {id:'northstar-shadcn-saas',curatedSource:'shadcn-card',category:'Doanh nghiệp',name:'Northstar — SaaS',
    tagline:'SaaS hiện đại, thẻ rõ ràng',description:'Mẫu được chuẩn hóa từ cấu trúc Card của shadcn/ui: hero chia cột, tính năng, bảng giá và FAQ.',theme:'ocean',layout:'split',
    order:['hero','features','pricing','cta'],heroImage:'',detail:'SaaS · Dashboard · Giải pháp doanh nghiệp'},
  {id:'orbit-magic-portfolio',curatedSource:'magic-border-beam',category:'Portfolio',name:'Orbit — Creative Lab',
    tagline:'Portfolio tối với điểm nhấn chuyển động',description:'Mẫu chuyển sắc và border beam được tái triển khai nhẹ, có hỗ trợ giảm chuyển động.',theme:'neon',layout:'banner',
    order:['hero','features','text','cta'],heroImage:'',detail:'Digital · Motion · Creative Portfolio'},
  {id:'foundry-startbootstrap-agency',curatedSource:'startbootstrap-agency',category:'Doanh nghiệp',name:'Foundry — Agency',
    tagline:'Agency có timeline triển khai',description:'Mẫu agency từ cấu trúc dịch vụ và timeline Start Bootstrap, viết lại thành block v2.',theme:'atelier',layout:'full',
    order:['hero','features','services','cta'],heroImage:'',detail:'Agency · Timeline · Dịch vụ'}
];
export type SiteTemplate = Seed;
export const SITE_TEMPLATES:SiteTemplate[]=[...CURATED_SEEDS,...SEEDS];
export const DEFAULT_TEMPLATE_ID = 'maison-cafe';
export const themeById = (id: ThemeId): ThemeDefinition => THEMES.find(theme => theme.id === id) || THEMES[0];
export function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
}
export function createBlock(kind: BlockKind, themeId: ThemeId = 'coffee', variant: BlockVariant = 'cards'): Block {
  const color = themeById(themeId).primary;
  return {
    id:newId(),kind,variant,title:KIND_LABELS[kind],body:'Thay nội dung của bạn tại bảng thuộc tính.\nThông tin nổi bật và chi tiết quan trọng.',
    imageUrl:'',buttonLabel:kind==='hero'||kind==='cta'?'Khám phá ngay':'',buttonUrl:'#page:lien-he',accent:color
  };
}
function templateBlock(seed: Seed, kind: BlockKind, index: number): Block {
  const block = createBlock(kind,seed.theme,kind==='hero'?seed.layout:seed.layout==='full'?'grid':seed.layout);
  const name = seed.name;
  const rules: Record<BlockKind, [string,string]> = {
    hero:[seed.tagline,seed.detail],
    features:['Những điều tạo nên khác biệt',seed.detail.split(' · ').join('\n')],
    text:['Câu chuyện của '+name,'Chúng tôi tin rằng một trải nghiệm tốt bắt đầu từ sự quan tâm đến từng chi tiết. '+seed.tagline+'. Cùng khám phá các giá trị mà '+name+' luôn theo đuổi.'],
    image:['Khoảnh khắc đáng nhớ',seed.description],
    cta:['Bắt đầu câu chuyện cùng '+name,'Liên hệ với chúng tôi để được tư vấn và tìm hiểu thêm.'],
    gallery:['Một vài khoảnh khắc tiêu biểu',seed.detail.split(' · ').join('\n')],
    stats:['Những dấu ấn nổi bật','120+|Khách hàng tin tưởng\n15+|Dự án tiêu biểu\n98%|Phản hồi tích cực'],
    testimonials:['Khách hàng nói gì','Minh Anh|Trải nghiệm rất chỉn chu và tận tâm.\nHoàng Nam|Tôi thực sự hài lòng về chất lượng.\nBảo Trân|Sẽ giới thiệu cho bạn bè và người thân.'],
    pricing:['Lựa chọn phù hợp với bạn','Cơ bản|Tư vấn theo nhu cầu|Phù hợp để bắt đầu\nChuyên nghiệp|Giải pháp toàn diện|Được yêu thích\nCao cấp|Thiết kế riêng|Hỗ trợ ưu tiên'],
    faq:['Giải đáp thắc mắc','Làm thế nào để bắt đầu?|Bạn có thể liên hệ trực tiếp để được hướng dẫn.\nCó thể điều chỉnh gói dịch vụ không?|Có, chúng tôi hỗ trợ cá nhân hóa theo nhu cầu.\nKhi nào nhận được phản hồi?|Chúng tôi sẽ phản hồi sớm nhất có thể.'],
    services:['Khám phá những gì chúng tôi mang đến',seed.detail.split(' · ').join('\n')],
    team:['Những con người làm nên '+name,'Người sáng lập|Tầm nhìn và định hướng\nĐội ngũ sáng tạo|Ý tưởng và triển khai\nChăm sóc khách hàng|Đồng hành và hỗ trợ'],
    logos:['Được tin tưởng và đồng hành','Đối tác 01\nĐối tác 02\nĐối tác 03\nĐối tác 04'],
    contact:['Kết nối cùng '+name,'Email: hello@example.com\nĐiện thoại: 0900 000 000\nĐịa chỉ: Điền địa chỉ doanh nghiệp'],
    newsletter:['Đừng bỏ lỡ những cập nhật mới','Nhận tin và những câu chuyện mới nhất từ chúng tôi.'],
    products:['Những lựa chọn nổi bật',seed.detail.split(' · ').map((x,i)=>x+'|Mẫu '+(i+1)).join('\n')]
  };
  block.title=rules[kind][0];
  block.body=kind==='gallery' ? GALLERY_PHOTOS[seed.category].filter(url=>url!==seed.heroImage).join('\n') : rules[kind][1];
  block.imageUrl=kind==='hero'||kind==='image'||kind==='gallery'||kind==='products'?seed.heroImage:'';
  block.buttonLabel=kind==='hero'?'Khám phá':kind==='cta'?'Liên hệ ngay':'';
  if(kind==='hero' && seed.layout==='full') block.variant='full';
  if(index===0 && kind==='hero' && seed.layout==='minimal') block.variant='minimal';
  return block;
}
export function buildTemplateDocument(template: SiteTemplate): SiteDocument {
  if(template.curatedSource)return buildCuratedTemplate(template.curatedSource,newId);
  const home = template.order.map((kind,i)=>templateBlock(template,kind,i));
  const about = ['hero','text','stats','team','cta'].map((kind,i)=>templateBlock(template,kind as BlockKind,i));
  about[0].title='Về '+template.name;
  const contact = ['hero','contact','faq','cta'].map((kind,i)=>templateBlock(template,kind as BlockKind,i));
  contact[0].title='Kết nối cùng chúng tôi';
  contact[0].imageUrl='';
  return {
    version:2,title:template.name,themeId:template.theme,
    pages:[
      {id:newId(),title:'Trang chủ',slug:'trang-chu',blocks:home},
      {id:newId(),title:'Giới thiệu',slug:'gioi-thieu',blocks:about},
      {id:newId(),title:'Liên hệ',slug:'lien-he',blocks:contact}
    ]
  };
}
