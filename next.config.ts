import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  serverExternalPackages: ["better-sqlite3", "pdf-parse"],
  images: {
    remotePatterns: [],
  },
};

export default config;
