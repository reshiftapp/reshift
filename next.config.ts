import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Admin dashboard config: Standard dynamic rendering */
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
