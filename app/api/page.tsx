import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import ApiModelShowcase from "@/components/ApiModelShowcase";
import JsonLd from "@/components/JsonLd";
import { FALLBACK_MODELS, FAMILY_META } from "@/data/vietapi-models";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "VietAPI — Danh mục model AI",
  description:
    "Khám phá các model AI được cung cấp qua VietAPI: Claude, GPT, DeepSeek, GLM, Kimi và Grok. Tương thích OpenAI, dễ chọn và tích hợp.",
  path: "/api",
  keywords: ["VietAPI", "API model AI", "Claude API", "GPT API", "DeepSeek API", "OpenAI compatible API"],
});

const integrationExample = `import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "https://api.vietapi.tech/v1",
  apiKey: process.env.VIETAPI_API_KEY,
});

const answer = await client.chat.completions.create({
  model: "gpt-5.6-sol",
  messages: [{ role: "user", content: "Xin chào" }],
});`;

const API_HERO_FAMILIES = ["GPT", "Claude", "DeepSeek", "Kimi"] as const;

export default function ApiPage() {
  const modelListStructuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "VietAPI model catalogue",
    numberOfItems: FALLBACK_MODELS.length,
    itemListElement: FALLBACK_MODELS.map((model, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: model.label,
      description: model.description,
    })),
  };

  return (
    <>
      <JsonLd data={modelListStructuredData} />

      <section className="api-hero" aria-labelledby="api-page-title">
        <div className="container api-hero-grid">
          <div className="api-hero-copy">
            <p className="eyebrow">VietAPI · AI models</p>
            <h1 id="api-page-title">Một API, nhiều model phù hợp cho từng việc.</h1>
            <p>
              Chọn Claude, GPT, DeepSeek, GLM, Kimi hoặc Grok trong một danh mục. Giữ nguyên luồng
              OpenAI-compatible quen thuộc, rồi đổi model khi sản phẩm cần.
            </p>
            <div className="api-hero-actions">
              <a href="#models" className="button button-dark">Khám phá model</a>
              <a href="#integration" className="button button-light">Xem cách tích hợp</a>
            </div>
          </div>

          <aside className="api-hero-panel" aria-label="Tóm tắt VietAPI">
            <div className="api-hero-gallery" aria-label="Một số họ model nổi bật">
              {API_HERO_FAMILIES.map((family, index) => {
                const meta = FAMILY_META[family];
                return (
                  <figure
                    className={`api-hero-gallery-tile api-hero-gallery-tile-${index + 1}`}
                    key={family}
                    style={{ "--model-accent": meta.accent } as CSSProperties}
                  >
                    <Image
                      src={meta.image}
                      alt={`${family}: ${meta.imageAlt}`}
                      width={640}
                      height={360}
                      priority={index === 0}
                    />
                    <figcaption>{family}</figcaption>
                  </figure>
                );
              })}
            </div>
            <div className="api-hero-panel-copy">
              <span className="api-card-kicker">Sẵn sàng tích hợp</span>
              <strong>OpenAI-compatible</strong>
              <p>Không cần đổi SDK trong phần lớn trường hợp — chỉ dùng base URL và key ở phía server.</p>
              <dl>
                <div><dt>Base URL</dt><dd>/v1</dd></div>
                <div><dt>Model công khai</dt><dd>{FALLBACK_MODELS.length}</dd></div>
                <div><dt>Khóa API</dt><dd>Server only</dd></div>
              </dl>
            </div>
          </aside>
        </div>
      </section>

      <section id="models" className="section api-catalogue-section" aria-labelledby="models-title">
        <div className="container">
          <header className="api-section-heading">
            <div>
              <p className="eyebrow">Danh mục model</p>
              <h2 id="models-title">Tìm đúng năng lực cho tác vụ của bạn.</h2>
            </div>
            <p>
              Danh sách sẽ tự đồng bộ từ VietAPI khi website được cấu hình <code>VIETAPI_API_KEY</code> trên server.
              Nếu không, trang vẫn hiển thị danh mục công khai để tham khảo.
            </p>
          </header>
          <ApiModelShowcase initialModels={FALLBACK_MODELS} />
        </div>
      </section>

      <section id="integration" className="section api-integration-section" aria-labelledby="integration-title">
        <div className="container api-integration-grid">
          <div className="api-integration-copy">
            <p className="eyebrow">Tích hợp gọn</p>
            <h2 id="integration-title">Đổi base URL, chọn model, bắt đầu request.</h2>
            <p>
              Đặt <code>VIETAPI_API_KEY</code> trong biến môi trường của server. Không đưa key vào mã frontend,
              URL công khai, ảnh chụp màn hình hay repository.
            </p>
            <ul className="api-steps">
              <li><span>01</span><p>Chọn model trong danh mục và copy Model ID.</p></li>
              <li><span>02</span><p>Thiết lập <code>baseURL</code> là VietAPI ở backend của bạn.</p></li>
              <li><span>03</span><p>Gọi endpoint tương thích và theo dõi kết quả trước khi mở rộng.</p></li>
            </ul>
            <Link href="/lien-he" className="text-link">Cần hỗ trợ tích hợp? Liên hệ Một Ngụm <span aria-hidden="true">→</span></Link>
          </div>
          <div className="api-code-card" aria-label="Ví dụ tích hợp OpenAI SDK">
            <div className="api-code-card-top"><span>server.ts</span><span>Node.js</span></div>
            <pre><code>{integrationExample}</code></pre>
          </div>
        </div>
      </section>
    </>
  );
}
