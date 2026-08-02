import { ImageResponse } from "next/og";
import { getSeoArticle } from "@/data/seo-content";

export const alt = "Hướng dẫn thực tế từ Một Ngụm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type ImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ArticleOpenGraphImage({ params }: ImageProps) {
  const { slug } = await params;
  const article = getSeoArticle(slug);
  const title = article?.title || "Kiến thức thực tế từ Một Ngụm";
  const category = article?.category || "Kiến thức";
  const titleSize = title.length > 72 ? 50 : title.length > 52 ? 57 : 64;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "68px 78px",
          background: "#f5f0ea",
          color: "#171411",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#39251c",
                color: "#f4dfc0",
                fontSize: 25,
                fontWeight: 700,
              }}
            >
              MN
            </div>
            <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: 2 }}>MỘT NGỤM</div>
          </div>
          <div
            style={{
              display: "flex",
              padding: "11px 18px",
              border: "2px solid #ad714d",
              borderRadius: 999,
              color: "#744a35",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {category}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1040 }}>
          <div style={{ color: "#744a35", fontSize: 24, fontWeight: 700, marginBottom: 22 }}>
            HƯỚNG DẪN THỰC TẾ
          </div>
          <div style={{ fontSize: titleSize, lineHeight: 1.08, fontWeight: 700 }}>{title}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: "2px solid #ded2c7",
            color: "#604a3b",
            fontSize: 24,
          }}
        >
          <span>Checklist rõ · Không hứa quá mức</span>
          <span>motngum.cafe/kien-thuc</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
