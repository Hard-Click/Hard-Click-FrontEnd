import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  /**
   * 개발 환경에서 CORS 우회용 프록시
   * 프론트의 /api/* 요청 → 백엔드 BACKEND_URL/api/* 로 프록시
   */
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
