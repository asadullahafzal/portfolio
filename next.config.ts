import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image on the VPS
  output: "standalone",
  poweredByHeader: false,
  experimental: {
    // The whole stylesheet is ~14 KB gzipped (Tailwind), so ship it inside the HTML:
    // saves a render-blocking round trip before first paint on slow mobile connections
    inlineCss: true,
  },
};

export default nextConfig;
