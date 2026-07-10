import { isMock } from '@/mocks/config';
import { mockChurnDashboard } from '@/mocks/churn.mock';
import type { ChurnDashboard } from './types';

/**
 * 이탈 관리 대시보드 데이터 조회 (Server 전용).
 * ⚠️ 백엔드 이탈 관리 API 미구현 → 현재 mock 고정.
 * BE 연동 시 `isMock('churn')`가 false가 되면 실 API 호출 분기를 추가한다.
 */
export async function getChurnDashboardServer(): Promise<ChurnDashboard> {
  if (isMock('churn')) {
    return mockChurnDashboard;
  }
  // TODO: BE 이탈 관리 API 연동 시 실 호출로 교체 (현재 미구현이라 mock 반환)
  return mockChurnDashboard;
}
