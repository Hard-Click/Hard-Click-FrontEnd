import type { OnboardingStatus } from '@/features/onboarding/types';

/**
 * ⚠️ 온보딩(#917) — 코드는 실 API 연동을 마쳤으나 라이브 E2E 미검증이라 mock 유지(mocks/config.ts 참고).
 * §0.5 정직성: mock 상태를 이 파일·server.ts 양쪽에 명시.
 */
export const mockOnboardingStatus: OnboardingStatus = {
  profileCompleted: false,
  availabilityCompleted: false,
  examScoreCompleted: false,
  onboarded: false,
  dailyCapMin: null,
  restDays: 0,
};
