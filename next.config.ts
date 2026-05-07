import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  serverExternalPackages: ["better-sqlite3", "pdf-parse"],
  outputFileTracingIncludes: {
    "/*": ["./fixtures/real-invoices/**/*.pdf"],
    "/ocr/[id]/source": ["./fixtures/real-invoices/**/*.pdf"],
  },
  images: {
    remotePatterns: [],
  },
};

export default config;
