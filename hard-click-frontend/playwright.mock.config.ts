import { defineConfig, devices } from '@playwright/test';

/**
 * Mock 전용 E2E 설정 — `npm run test:e2e:mock`.
 * webServer가 `NEXT_PUBLIC_E2E_MOCK=1`로 dev 서버를 띄워 **BE 없이 mock 데이터로 결정적 실행**한다.
 * - 팀 라이브 E2E(playwright.config.ts, testDir=e2e/)와 **포트·testDir 완전 분리** → 서로 영향 0.
 * - 포트 3001 (라이브 :3000과 충돌 방지), reuseExistingServer=false로 항상 mock 서버 새로 기동.
 */
export default defineConfig({
  testDir: './e2e-mock',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'NEXT_PUBLIC_E2E_MOCK=1 npm run dev -- -p 3001',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
