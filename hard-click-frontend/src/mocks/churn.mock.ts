import type { ChurnDashboard } from '@/features/churn/types';

/**
 * 이탈 관리 대시보드 mock.
 * ⚠️ 백엔드 이탈 관리 API 미구현 → mock. 연동 시 server.ts에서 실 API로 교체.
 */
export const mockChurnDashboard: ChurnDashboard = {
  stats: {
    highRiskCount: 18,
    midRiskCount: 34,
    newThisWeekCount: 7,
    avgRiskScore: 42,
  },
  trend: [
    { label: '1주', count: 9 },
    { label: '2주', count: 10 },
    { label: '3주', count: 8 },
    { label: '4주', count: 12 },
    { label: '5주', count: 11 },
    { label: '6주', count: 13 },
    { label: '7주', count: 14 },
    { label: '이번주', count: 16 },
  ],
  reasons: [
    { label: '진도 밀림', percent: 41 },
    { label: '장기 미접속', percent: 33 },
    { label: '퀴즈 저조', percent: 18 },
    { label: '기타', percent: 8 },
  ],
  students: [
    {
      id: 1,
      name: '김민수',
      riskLevel: 'HIGH',
      reason: '2주 밀림 · 5일 미접속',
      riskScore: 81,
      lastActiveAt: '2026-07-02',
    },
    {
      id: 2,
      name: '이서연',
      riskLevel: 'HIGH',
      reason: '퀴즈 연속 저조 · 1주 밀림',
      riskScore: 76,
      lastActiveAt: '2026-07-05',
    },
    {
      id: 3,
      name: '박지훈',
      riskLevel: 'MID',
      reason: '3일 미접속',
      riskScore: 54,
      lastActiveAt: '2026-07-04',
    },
    {
      id: 4,
      name: '최수아',
      riskLevel: 'MID',
      reason: '2일 미접속 · 진도 정체',
      riskScore: 48,
      lastActiveAt: '2026-07-06',
    },
  ],
};
