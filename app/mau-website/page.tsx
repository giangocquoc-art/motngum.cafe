import Link from "next/link";

const templates = [
  ["Nền tảng", "Cho doanh nghiệp cần một địa chỉ rõ ràng", "Website doanh nghiệp"],
  ["Chuyển đổi", "Cho sản phẩm cần được kể thật gọn", "Landing page"],
  ["Bán hàng", "Cho cửa hàng muốn nhận đơn đều đặn", "Website bán hàng"],
];

export default function TemplatesPage() {
  return <main className="templates-page"><header className="templates-head"><p className="eyebrow">MẪU WEBSITE / CHỌN MỘT ĐIỂM BẮT ĐẦU</p><h1>Hình dung nơi thương hiệu của bạn sẽ sống.</h1><p>Chọn hướng phù hợp với công việc. Màu sắc, nội dung và cấu trúc sẽ được tinh chỉnh theo bạn.</p></header><section className="template-grid" aria-label="Các mẫu website">{templates.map(([tag, title, type], index) => <article className="template-card" key={tag}><div className={`template-preview preview-${index + 1}`}><span>{index + 1}</span><i>{tag}</i></div><p className="eyebrow">{type}</p><h2>{title}</h2><Link href="#packages">Chọn mẫu này →</Link></article>)}</section><section id="packages" className="templates-next"><h2>Đã thấy hướng mình muốn?</h2><p>Chọn gói khởi đầu, rồi để Một Ngụm biến nó thành website của bạn.</p><Link className="button button-dark" href="/#packages">Xem gói và nhận báo giá →</Link></section></main>;
}
