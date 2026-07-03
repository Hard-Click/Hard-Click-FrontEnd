import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * `/api/*` 요청은 app/api/[...path]/route.ts (BFF 프록시)가 처리한다.
   * - 쿠키의 accessToken을 Authorization 헤더로 주입해 백엔드로 중계
   * - CORS 회피 + 클라이언트 localStorage 불필요
   * 따라서 별도 rewrites 가 필요 없다.
   */
  turbopack: {
    // 상위 폴더에 package-lock.json이 있어 루트를 잘못 인식하는 문제 수정
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.example.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        // BE 썸네일/프로필/커뮤니티 이미지 = 만료·쿼리 없는 public S3 URL (예: {버킷}.s3.ap-northeast-2.amazonaws.com).
        // (영상만 수강권 검증 위해 presigned 유지 — 쿼리스트링 있음. 와일드카드가 둘 다 커버.)
        protocol: 'https',
        hostname: '*.s3.ap-northeast-2.amazonaws.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "hard-click",

  project: "frontend-nextjs",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,

    // Tree-shaking options for reducing bundle size
    treeshake: {
      // Automatically tree-shake Sentry logger statements to reduce bundle size
      removeDebugLogging: true,
    },
  },
});
