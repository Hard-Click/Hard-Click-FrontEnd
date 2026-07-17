import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockOnboardingStatus } from '@/mocks/onboarding.mock';
import type { OnboardingStatus } from './types';

/** 조회 실패 시 폴백 — 미완료로 간주해 `/schedule/setup`으로 보내는 쪽(fail-closed)을 택한다. */
const UNKNOWN_STATUS: OnboardingStatus = {
  profileCompleted: false,
  availabilityCompleted: false,
  examScoreCompleted: false,
  onboarded: false,
  dailyCapMin: null,
  restDays: 0,
};

/** 온보딩 진행 상태 조회 (Server 전용) — `/schedule` 진입 게이팅에 쓰인다. */
export async function getOnboardingMeServer(): Promise<OnboardingStatus> {
  if (isMock('onboarding')) return mockOnboardingStatus;
  const res = await serverApi.get<OnboardingStatus>('/api/onboarding/me');
  if (!res.success || !res.data) return UNKNOWN_STATUS;
  return res.data;
}
