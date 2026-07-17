import type { ChurnRiskLevel } from '@/features/churn/types';

/**
 * 이탈 관리 대시보드 mock — API 응답 shape 그대로(FRONTEND_API.md 1번 섹션 기준).
 * ⚠️ `churn` 도메인은 mocks/config.ts MOCK_OVERRIDE에 등록 전(BE 라이브 E2E 검증 전)이라
 *   전역 USE_MOCK을 따른다. 연동 시 server.ts의 isMock('churn') 분기가 이 mock 대신 실 호출한다.
 */

/** GET /api/admin/churn/summary */
export interface ChurnSummaryApi {
  highRiskCount: number;
  mediumRiskCount: number;
  newThisWeekCount: number;
  avgRiskScore: number;
}

export const mockChurnSummaryApi: ChurnSummaryApi = {
  highRiskCount: 18,
  mediumRiskCount: 34,
  newThisWeekCount: 7,
  avgRiskScore: 42,
};

/** GET /api/admin/churn/trend?weeks=8 항목 하나 */
export interface ChurnTrendApiItem {
  weekStart: string; // yyyy-MM-dd
  highRiskCount: number;
}

export const mockChurnTrendApi: ChurnTrendApiItem[] = [
  { weekStart: '2026-05-18', highRiskCount: 9 },
  { weekStart: '2026-05-25', highRiskCount: 10 },
  { weekStart: '2026-06-01', highRiskCount: 8 },
  { weekStart: '2026-06-08', highRiskCount: 12 },
  { weekStart: '2026-06-15', highRiskCount: 11 },
  { weekStart: '2026-06-22', highRiskCount: 13 },
  { weekStart: '2026-06-29', highRiskCount: 14 },
  { weekStart: '2026-07-06', highRiskCount: 16 },
];

/** GET /api/admin/churn/reasons 항목 하나 */
export interface ChurnReasonApi {
  reasonCode: string;
  reasonLabel: string;
  count: number;
  ratioPercent: number;
}

export const mockChurnReasonsApi: ChurnReasonApi[] = [
  { reasonCode: 'streak', reasonLabel: '진도 밀림', count: 41, ratioPercent: 41 },
  { reasonCode: 'recency', reasonLabel: '장기 미접속', count: 33, ratioPercent: 33 },
  { reasonCode: 'quiz', reasonLabel: '퀴즈 저조', count: 18, ratioPercent: 18 },
  { reasonCode: 'etc', reasonLabel: '기타', count: 8, ratioPercent: 8 },
];

/** GET /api/admin/churn/students 목록 항목 하나 */
export interface ChurnStudentListItemApi {
  enrollmentId: number;
  memberId: number;
  memberName: string;
  level: ChurnRiskLevel;
  riskScore: number;
  reasonCode: string;
  reasonLabel: string;
  lastActivityDate: string;
  computedAt: string;
}

export interface ChurnStudentListApiResponse {
  content: ChurnStudentListItemApi[];
  page: number;
  size: number;
  totalElements: number;
}

/** 전체 위험 학생(페이지네이션 전) — server.ts의 mock 분기가 level/page/size로 잘라 쓴다. */
export const mockChurnStudentsApi: ChurnStudentListItemApi[] = [
  { enrollmentId: 1024, memberId: 512, memberName: '김민수', level: 'HIGH', riskScore: 81, reasonCode: 'streak', reasonLabel: '2주 밀림 · 5일 미접속', lastActivityDate: '2026-07-02', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1031, memberId: 519, memberName: '이서연', level: 'HIGH', riskScore: 76, reasonCode: 'quiz', reasonLabel: '퀴즈 연속 저조 · 1주 밀림', lastActivityDate: '2026-07-05', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1042, memberId: 526, memberName: '박지훈', level: 'MEDIUM', riskScore: 54, reasonCode: 'recency', reasonLabel: '3일 미접속', lastActivityDate: '2026-07-04', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1055, memberId: 533, memberName: '최수아', level: 'MEDIUM', riskScore: 48, reasonCode: 'streak', reasonLabel: '2일 미접속 · 진도 정체', lastActivityDate: '2026-07-06', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1063, memberId: 540, memberName: '정하늘', level: 'HIGH', riskScore: 88, reasonCode: 'quiz', reasonLabel: '3주 밀림 · 퀴즈 미응시', lastActivityDate: '2026-06-29', computedAt: '2026-07-02T09:00:00' },
  { enrollmentId: 1077, memberId: 547, memberName: '강도윤', level: 'HIGH', riskScore: 79, reasonCode: 'recency', reasonLabel: '10일 미접속', lastActivityDate: '2026-06-30', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1088, memberId: 554, memberName: '윤지아', level: 'MEDIUM', riskScore: 51, reasonCode: 'streak', reasonLabel: '진도 정체', lastActivityDate: '2026-07-03', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1094, memberId: 561, memberName: '임서준', level: 'MEDIUM', riskScore: 47, reasonCode: 'recency', reasonLabel: '4일 미접속', lastActivityDate: '2026-07-05', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1101, memberId: 568, memberName: '한예린', level: 'HIGH', riskScore: 73, reasonCode: 'quiz', reasonLabel: '2주 밀림 · 퀴즈 저조', lastActivityDate: '2026-07-01', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1115, memberId: 575, memberName: '오태양', level: 'MEDIUM', riskScore: 45, reasonCode: 'streak', reasonLabel: '3일 미접속 · 진도 정체', lastActivityDate: '2026-07-06', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1123, memberId: 582, memberName: '신유나', level: 'MEDIUM', riskScore: 42, reasonCode: 'recency', reasonLabel: '2일 미접속', lastActivityDate: '2026-07-06', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1136, memberId: 589, memberName: '배준호', level: 'HIGH', riskScore: 71, reasonCode: 'recency', reasonLabel: '1주 밀림 · 5일 미접속', lastActivityDate: '2026-07-02', computedAt: '2026-07-07T09:00:00' },
  { enrollmentId: 1147, memberId: 596, memberName: '문가은', level: 'MEDIUM', riskScore: 46, reasonCode: 'streak', reasonLabel: '진도 정체', lastActivityDate: '2026-07-04', computedAt: '2026-07-07T09:00:00' },
];

/** GET /api/admin/churn/students/{enrollmentId} — 위험 점수 기여 요인 하나 */
export interface ChurnContributionApi {
  code: string;
  label: string;
  points: number;
}

/** GET /api/admin/churn/students/{enrollmentId} */
export interface ChurnStudentDetailApi {
  enrollmentId: number;
  memberId: number;
  memberName: string;
  email: string;
  level: ChurnRiskLevel;
  riskScore: number;
  computedAt: string;
  contributions: ChurnContributionApi[]; // 내림차순
  progressRate: number | null;
  lastAccessDate: string;
  recentQuizAvg: number | null;
  totalStudyMinutes: number;
}

/** 위험 점수를 기여 요인 3개로 분해(합 = riskScore). */
function buildContributions(score: number): ChurnContributionApi[] {
  const a = Math.round(score * 0.43);
  const b = Math.round(score * 0.35);
  return [
    { code: 'streak', label: '진도 밀림', points: a },
    { code: 'recency', label: '장기 미접속', points: b },
    { code: 'quiz', label: '퀴즈 점수 하락', points: score - a - b },
  ];
}

/** enrollmentId로 위험 상세 조회(없으면 null) — 목록 mock에서 결정적으로 합성. */
export function getMockChurnStudentDetailApi(
  enrollmentId: number,
): ChurnStudentDetailApi | null {
  const s = mockChurnStudentsApi.find((st) => st.enrollmentId === enrollmentId);
  if (!s) return null;
  return {
    enrollmentId: s.enrollmentId,
    memberId: s.memberId,
    memberName: s.memberName,
    email: `stud${s.enrollmentId}@flown.dev`,
    level: s.level,
    riskScore: s.riskScore,
    computedAt: s.computedAt,
    contributions: buildContributions(s.riskScore),
    progressRate: Math.max(5, 84 - Math.round(s.riskScore * 0.52)),
    lastAccessDate: s.lastActivityDate,
    recentQuizAvg: Math.max(30, 95 - Math.round(s.riskScore * 0.53)),
    totalStudyMinutes: Math.max(120, (46 - Math.round(s.riskScore * 0.35)) * 60),
  };
}
