import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: [
    "@prisma/client",
    ".prisma/client",
    "@prisma/adapter-pg",
    "pg-cloudflare",
    "pg",
  ],
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    "**/*": [
      "./node_modules/pg-cloudflare/dist/**",
      "./node_modules/pg-cloudflare/esm/**",
      "./node_modules/.prisma/client/**",
    ],
  },
};

export default nextConfig;
