import type { NextConfig } from "next";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  /**
   * 개발 환경 CORS 우회용 프록시 (아직 클라이언트에서 직접 호출하는 미전환 도메인용).
   * /api/* → 백엔드. (전 도메인 BFF 전환이 끝나면 이 프록시도 제거 가능)
   *
   * ⚠️ 과거의 `/community/:path*` rewrite는 제거함:
   *   array rewrite는 동적 라우트보다 먼저 실행되어 `/community/[postid]` 상세 라우트를
   *   백엔드로 가로채(프록시) 서버 렌더를 깨뜨렸음. 커뮤니티 첨부 이미지는 충돌 없는
   *   별도 경로로 프록시해야 함(후속).
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
