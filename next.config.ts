import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
      },
      {
        protocol: "https",
        hostname: "www.efireplacestore.com",
      },
      {
        protocol: "https",
        hostname: "efireplacestore.com",
      },
    ],
  },
};

export default nextConfig;
