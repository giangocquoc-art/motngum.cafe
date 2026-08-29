import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // The vinext/Cloudflare build does not provide Next's /_next/image optimizer.
    // Product assets are pre-compressed WebP files, so keep direct delivery here.
    unoptimized: true,
  },
  async headers() {
    const staticCache = [
      {
        key: "Cache-Control",
        value: "public, max-age=604800, stale-while-revalidate=86400",
      },
    ];

    return [
      {
        source: "/assets/:path*",
        headers: staticCache,
      },
      {
        source: "/favicon-256.png",
        headers: staticCache,
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
