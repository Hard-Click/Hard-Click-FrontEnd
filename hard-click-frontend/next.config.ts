import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `/api/*` 요청은 app/api/[...path]/route.ts (BFF 프록시)가 처리한다.
   * - 쿠키의 accessToken을 Authorization 헤더로 주입해 백엔드로 중계
   * - CORS 회피 + 클라이언트 localStorage 불필요
   * 따라서 별도 rewrites 가 필요 없다.
   */
};

export default nextConfig;
