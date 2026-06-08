import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,

  // Optimise server-side imports so only used sub-paths are bundled
  experimental: {
    optimizePackageImports: ["mongoose"],
  },

  // Long-lived browser cache for immutable Next.js static chunks
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/(.+\\.(?:ico|png|jpg|jpeg|svg|webp|avif|woff2?))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  images: {
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  // Strict mode for catching issues early in development
  reactStrictMode: true,
};

export default nextConfig;
