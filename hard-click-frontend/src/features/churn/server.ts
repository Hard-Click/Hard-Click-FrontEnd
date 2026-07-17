import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  mockChurnSummaryApi,
  mockChurnTrendApi,
  mockChurnReasonsApi,
  mockChurnStudentsApi,
  getMockChurnStudentDetailApi,
  type ChurnSummaryApi,
  type ChurnTrendApiItem,
  type ChurnReasonApi,
  type ChurnStudentListItemApi,
  type ChurnStudentListApiResponse,
  type ChurnStudentDetailApi,
} from '@/mocks/churn.mock';
import type {
  ChurnDashboardSummary,
  ChurnRiskLevel,
  ChurnStats,
  ChurnStudent,
  ChurnStudentDetail,
  ChurnStudentPage,
  ChurnTrendPoint,
  ChurnReason,
} from './types';

/* ───── BE 응답 → UI 매퍼(격리막) ───── */

function toChurnStats(api: ChurnSummaryApi): ChurnStats {
  return {
    highRiskCount: api.highRiskCount,
    mediumRiskCount: api.mediumRiskCount,
    newThisWeekCount: api.newThisWeekCount,
    avgRiskScore: api.avgRiskScore,
  };
}

/** "yyyy-MM-dd" → "M/D" */
function formatWeekLabel(weekStart: string): string {
  const [, m, d] = weekStart.split('-');
  return `${Number(m)}/${Number(d)}`;
}

function toChurnTrendPoint(api: ChurnTrendApiItem): ChurnTrendPoint {
  return { label: formatWeekLabel(api.weekStart), count: api.highRiskCount };
}

function toChurnReason(api: ChurnReasonApi): ChurnReason {
  return { label: api.reasonLabel, percent: api.ratioPercent };
}

function toChurnStudent(api: ChurnStudentListItemApi): ChurnStudent {
  return {
    enrollmentId: api.enrollmentId,
    name: api.memberName,
    riskLevel: api.level,
    reason: api.reasonLabel,
    riskScore: api.riskScore,
    lastActiveAt: api.lastActivityDate,
  };
}

/** "yyyy-MM-dd" 최근 활동일 → "N일 전 (yyyy.mm.dd)" */
function formatLastAccessLabel(dateStr: string): string {
  const diffDays = Math.max(
    0,
    Math.round((Date.now() - new Date(dateStr).getTime()) / 86_400_000),
  );
  return `${diffDays}일 전 (${dateStr.replaceAll('-', '.')})`;
}

function toChurnStudentDetail(api: ChurnStudentDetailApi): ChurnStudentDetail {
  return {
    enrollmentId: api.enrollmentId,
    name: api.memberName,
    email: api.email,
    riskLevel: api.level,
    riskScore: api.riskScore,
    factors: api.contributions.map((c) => ({ label: c.label, delta: c.points })),
    learning: {
      progressRate: api.progressRate,
      lastAccessLabel: formatLastAccessLabel(api.lastAccessDate),
      recentQuizAvg: api.recentQuizAvg,
      totalStudyMinutes: api.totalStudyMinutes,
    },
  };
}

/**
 * 이탈 관리 대시보드 상단 3종(지표 카드·추이·사유) 조회 (Server 전용).
 * 학생 목록은 서버 페이지네이션이라 `getChurnStudentsServer`로 별도 조회한다.
 * ⚠️ `churn`은 아직 mocks/config.ts MOCK_OVERRIDE에 없어 전역 USE_MOCK을 따른다(BE 라이브 E2E 미검증).
 */
export async function getChurnSummaryServer(): Promise<ChurnDashboardSummary> {
  if (isMock('churn')) {
    return {
      stats: toChurnStats(mockChurnSummaryApi),
      trend: mockChurnTrendApi.map(toChurnTrendPoint),
      reasons: mockChurnReasonsApi.map(toChurnReason),
    };
  }

  const [summaryRes, trendRes, reasonsRes] = await Promise.all([
    serverApi.get<ChurnSummaryApi>('/api/admin/churn/summary'),
    serverApi.get<ChurnTrendApiItem[]>('/api/admin/churn/trend?weeks=8'),
    serverApi.get<ChurnReasonApi[]>('/api/admin/churn/reasons'),
  ]);
  if (!summaryRes.success || !trendRes.success || !reasonsRes.success) {
    throw new Error('이탈 관리 대시보드 데이터를 불러오지 못했습니다.');
  }
  return {
    stats: toChurnStats(summaryRes.data!),
    trend: (trendRes.data ?? []).map(toChurnTrendPoint),
    reasons: (reasonsRes.data ?? []).map(toChurnReason),
  };
}

/**
 * 위험 학생 목록 조회 (Server 전용, 서버 페이지네이션).
 * @param level 미지정 시 중위험 이상 전체(BE 기본 동작)
 * @param page 1-based(컴포넌트 관례) — BE에는 0-base로 변환해서 보낸다.
 * @param size 페이지당 개수(기본 20)
 */
export async function getChurnStudentsServer(
  level: ChurnRiskLevel | undefined,
  page: number,
  size = 20,
): Promise<ChurnStudentPage> {
  if (isMock('churn')) {
    const filtered = level
      ? mockChurnStudentsApi.filter((s) => s.level === level)
      : mockChurnStudentsApi;
    const totalPages = Math.max(1, Math.ceil(filtered.length / size));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const start = (safePage - 1) * size;
    return {
      students: filtered.slice(start, start + size).map(toChurnStudent),
      page: safePage,
      totalPages,
      totalElements: filtered.length,
    };
  }

  const params = new URLSearchParams();
  if (level) params.set('level', level);
  params.set('page', String(Math.max(0, page - 1))); // 1-based → 0-base
  params.set('size', String(size));

  const res = await serverApi.get<ChurnStudentListApiResponse>(
    `/api/admin/churn/students?${params.toString()}`,
  );
  if (!res.success) {
    throw new Error('위험 학생 목록을 불러오지 못했습니다.');
  }
  const data = res.data ?? { content: [], page: 0, size, totalElements: 0 };
  return {
    students: data.content.map(toChurnStudent),
    page: data.page + 1, // 0-base → 1-based
    totalPages: Math.max(1, Math.ceil(data.totalElements / size)),
    totalElements: data.totalElements,
  };
}

/**
 * 학생 위험 상세 조회 (Server 전용). 없으면 null(CN001 404 → 여기서 null로 흡수).
 */
export async function getChurnStudentDetailServer(
  enrollmentId: number,
): Promise<ChurnStudentDetail | null> {
  if (isMock('churn')) {
    const detail = getMockChurnStudentDetailApi(enrollmentId);
    return detail ? toChurnStudentDetail(detail) : null;
  }

  const res = await serverApi.get<ChurnStudentDetailApi>(
    `/api/admin/churn/students/${enrollmentId}`,
  );
  if (res.httpStatus === 404) return null; // CN001
  if (!res.success) {
    throw new Error('학생 위험 상세를 불러오지 못했습니다.');
  }
  return toChurnStudentDetail(res.data!);
}
