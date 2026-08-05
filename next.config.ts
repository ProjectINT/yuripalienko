import type { NextConfig } from "next";

// Q5: страницы SSG, значение ALLOW_INDEXING_BOTS впекается в HTML на сборке.
// Прод-билд обязан явно выбрать: индексируемый (ALLOW_INDEXING_BOTS=true)
// или осознанно закрытый (ALLOW_NOINDEX_BUILD=true). Иначе легко забыть снять
// флаг на запуске и остаться невидимым для поиска.
if (
  process.env.NODE_ENV === "production" &&
  process.env.ALLOW_INDEXING_BOTS !== "true" &&
  process.env.ALLOW_NOINDEX_BUILD !== "true"
) {
  throw new Error(
    "Прод собирается с noindex. Поставьте ALLOW_INDEXING_BOTS=true " +
      "или ALLOW_NOINDEX_BUILD=true, если это намеренно.",
  );
}

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
