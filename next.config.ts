import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker image on the VPS
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
