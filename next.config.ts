import type { NextConfig } from "next";

/** Static export: the whole site is plain files, so it hosts anywhere (Vercel, Netlify) with no server. */
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
