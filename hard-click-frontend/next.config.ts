import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: "/community/post/:path*",
        destination: `${BACKEND_URL}/community/post/:path*`,
      },
      {
        source: "/community/comment/:path*",
        destination: `${BACKEND_URL}/community/comment/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_URL}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
