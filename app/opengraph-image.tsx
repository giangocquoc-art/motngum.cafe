import { ImageResponse } from "next/og";

export const alt = "Một Ngụm — Một ly cà phê, một hướng giải quyết";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f5eee6",
          color: "#30231d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#30231d",
              color: "#f4dfc0",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            MN
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: 2 }}>MỘT NGỤM</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 920 }}>
          <div style={{ fontSize: 28, color: "#8f5b3e", marginBottom: 24 }}>
            CÀ PHÊ LƯU ĐỘNG · TP.HCM
          </div>
          <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>
            Một ly cà phê.
          </div>
          <div style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700, color: "#8f5b3e" }}>
            Một hướng giải quyết.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: 28, color: "#604a3b" }}>
          Website · Chatbot AI · Tự động hóa · Marketing
        </div>
      </div>
    ),
    { ...size }
  );
}
