import type { NextConfig } from "next";

const IMMUTABLE = {
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    // Статика из public версионируется только контентом — кэшируем намертво
    return ["/works/:path*", "/hdri/:path*", "/logo/:path*"].map((source) => ({
      source,
      headers: [IMMUTABLE],
    }));
  },
};

export default nextConfig;
