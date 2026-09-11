/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ── Performance ───────────────────────────────────────────────────
  // SWC minifier is enabled by default in Next 14+, but being explicit
  swcMinify: true,

  // Enable built-in gzip/brotli compression
  compress: true,

  // Allow external image domains for next/image optimization
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
    // Limit image sizes to reduce memory usage during optimisation
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ["image/avif", "image/webp"],
  },

  // ── Caching headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|png|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // ── Environment variables ─────────────────────────────────────────
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Farm-Nex",
  },
};

export default nextConfig;
