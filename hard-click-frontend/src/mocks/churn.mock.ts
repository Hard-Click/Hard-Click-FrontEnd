import type {
  ChurnDashboard,
  ChurnStudent,
  ChurnStudentDetail,
} from '@/features/churn/types';

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
    { label: '7주 전', count: 9 },
    { label: '6주 전', count: 10 },
    { label: '5주 전', count: 8 },
    { label: '4주 전', count: 12 },
    { label: '3주 전', count: 11 },
    { label: '2주 전', count: 13 },
    { label: '1주 전', count: 14 },
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
      username: 'stud1024',
      email: 'stud1024@flown.dev',
      riskLevel: 'HIGH',
      reason: '2주 밀림 · 5일 미접속',
      riskScore: 81,
      lastActiveAt: '2026-07-02',
    },
    {
      id: 2,
      name: '이서연',
      username: 'stud1031',
      email: 'stud1031@flown.dev',
      riskLevel: 'HIGH',
      reason: '퀴즈 연속 저조 · 1주 밀림',
      riskScore: 76,
      lastActiveAt: '2026-07-05',
    },
    {
      id: 3,
      name: '박지훈',
      username: 'stud1042',
      email: 'stud1042@flown.dev',
      riskLevel: 'MID',
      reason: '3일 미접속',
      riskScore: 54,
      lastActiveAt: '2026-07-04',
    },
    {
      id: 4,
      name: '최수아',
      username: 'stud1055',
      email: 'stud1055@flown.dev',
      riskLevel: 'MID',
      reason: '2일 미접속 · 진도 정체',
      riskScore: 48,
      lastActiveAt: '2026-07-06',
    },
    {
      id: 5,
      name: '정하늘',
      username: 'stud1063',
      email: 'stud1063@flown.dev',
      riskLevel: 'HIGH',
      reason: '3주 밀림 · 퀴즈 미응시',
      riskScore: 88,
      lastActiveAt: '2026-06-29',
    },
    {
      id: 6,
      name: '강도윤',
      username: 'stud1077',
      email: 'stud1077@flown.dev',
      riskLevel: 'HIGH',
      reason: '10일 미접속',
      riskScore: 79,
      lastActiveAt: '2026-06-30',
    },
    {
      id: 7,
      name: '윤지아',
      username: 'stud1088',
      email: 'stud1088@flown.dev',
      riskLevel: 'MID',
      reason: '진도 정체',
      riskScore: 51,
      lastActiveAt: '2026-07-03',
    },
    {
      id: 8,
      name: '임서준',
      username: 'stud1094',
      email: 'stud1094@flown.dev',
      riskLevel: 'MID',
      reason: '4일 미접속',
      riskScore: 47,
      lastActiveAt: '2026-07-05',
    },
    {
      id: 9,
      name: '한예린',
      username: 'stud1101',
      email: 'stud1101@flown.dev',
      riskLevel: 'HIGH',
      reason: '2주 밀림 · 퀴즈 저조',
      riskScore: 73,
      lastActiveAt: '2026-07-01',
    },
    {
      id: 10,
      name: '오태양',
      username: 'stud1115',
      email: 'stud1115@flown.dev',
      riskLevel: 'MID',
      reason: '3일 미접속 · 진도 정체',
      riskScore: 45,
      lastActiveAt: '2026-07-06',
    },
    {
      id: 11,
      name: '신유나',
      username: 'stud1123',
      email: 'stud1123@flown.dev',
      riskLevel: 'MID',
      reason: '2일 미접속',
      riskScore: 42,
      lastActiveAt: '2026-07-06',
    },
    {
      id: 12,
      name: '배준호',
      username: 'stud1136',
      email: 'stud1136@flown.dev',
      riskLevel: 'HIGH',
      reason: '1주 밀림 · 5일 미접속',
      riskScore: 71,
      lastActiveAt: '2026-07-02',
    },
    {
      id: 13,
      name: '문가은',
      username: 'stud1147',
      email: 'stud1147@flown.dev',
      riskLevel: 'MID',
      reason: '진도 정체',
      riskScore: 46,
      lastActiveAt: '2026-07-04',
    },
  ],
};

// ── 학생 위험 상세 (mock 빌더) ─────────────────────────────────────────────
// BE 이탈 상세 API 미구현 → 목록 학생에서 결정적으로 상세를 합성한다.
const REFERENCE_TODAY = new Date('2026-07-07');

function daysAgo(dateStr: string): number {
  const diff = REFERENCE_TODAY.getTime() - new Date(dateStr).getTime();
  return Math.max(0, Math.round(diff / 86_400_000));
}

/** 위험 점수를 요인별로 분해(합 = riskScore). id1(81)=35/28/18로 목업과 일치. */
function buildFactors(score: number): ChurnStudentDetail['factors'] {
  const a = Math.round(score * 0.43);
  const b = Math.round(score * 0.35);
  return [
    { label: '진도 밀림', delta: a },
    { label: '장기 미접속', delta: b },
    { label: '퀴즈 점수 하락', delta: score - a - b },
  ];
}

function buildLearning(s: ChurnStudent): ChurnStudentDetail['learning'] {
  const dot = s.lastActiveAt.replace(/-/g, '.');
  return {
    progressRate: Math.max(5, 84 - Math.round(s.riskScore * 0.52)),
    targetRate: 68,
    lastAccessLabel: `${daysAgo(s.lastActiveAt)}일 전 (${dot})`,
    recentQuizAvg: Math.max(30, 95 - Math.round(s.riskScore * 0.53)),
    recentQuizDelta: -Math.round(s.riskScore * 0.17),
    totalStudyHours: Math.max(2, 46 - Math.round(s.riskScore * 0.35)),
  };
}

/** 학생 id로 위험 상세 조회 (없으면 null). */
export function getMockChurnStudentDetail(
  id: number,
): ChurnStudentDetail | null {
  const s = mockChurnDashboard.students.find((st) => st.id === id);
  if (!s) return null;
  return {
    ...s,
    factors: buildFactors(s.riskScore),
    learning: buildLearning(s),
  };
}
