/** 이탈 위험도. API 값(HIGH/MEDIUM)과 그대로 일치시킨다. */
export type ChurnRiskLevel = 'HIGH' | 'MEDIUM';

/** 상단 지표 카드 */
export interface ChurnStats {
  highRiskCount: number; // 고위험 학생 수
  mediumRiskCount: number; // 중위험 학생 수
  newThisWeekCount: number; // 이번 주 신규(위험 진입)
  avgRiskScore: number; // 평균 위험 점수 (0~100)
}

/** 이탈 위험 학생 추이 (주별). ⚠️ BE가 주는 값은 고위험 학생 수만(중위험 미포함). */
export interface ChurnTrendPoint {
  label: string; // 주 시작일 표시용(예: '7/6')
  count: number; // 그 주 고위험 학생 수
}

/** 주요 이탈 사유 비중 */
export interface ChurnReason {
  label: string; // 예: '진도 밀림'
  percent: number; // 0~100
}

/** 위험 학생 목록 행. ⚠️ BE가 username/email을 목록에서 안 줘서 이름·위험도·사유·최근활동만 있다. */
export interface ChurnStudent {
  enrollmentId: number;
  name: string;
  riskLevel: ChurnRiskLevel;
  reason: string; // 예: '진도 밀림'(reasonLabel)
  riskScore: number; // 0~100
  lastActiveAt: string; // 최근 활동 (YYYY-MM-DD)
}

/** 위험 학생 목록 — 서버 페이지네이션(page는 0-base로 BE와 통일). */
export interface ChurnStudentPage {
  students: ChurnStudent[];
  page: number;
  totalPages: number;
  totalElements: number;
}

/** 위험 점수 기여 요인 (예: 진도 밀림 +35) */
export interface ChurnRiskFactor {
  label: string;
  delta: number; // 위험 점수 가산분 (+값)
}

/**
 * 학습 현황. ⚠️ BE 미제공 필드는 만들어내지 않는다(§0.5) — 목표 진도율·퀴즈 증감은 API에 없어 제거.
 * progressRate/recentQuizAvg는 아직 집계 전이면 null(화면에서 "집계 전" 등으로 표시).
 */
export interface ChurnLearningStatus {
  progressRate: number | null; // 진도율 (%)
  lastAccessLabel: string; // 예: '5일 전 (2026.07.02)'
  recentQuizAvg: number | null; // 최근 퀴즈 평균 점수
  totalStudyMinutes: number; // 누적 순공 시간(분) — BE가 분 단위로 줌
}

/** 학생 위험 상세. 목록(ChurnStudent)과 필드 구성이 달라(email 있음/reason 없음) 별도 타입. */
export interface ChurnStudentDetail {
  enrollmentId: number;
  name: string;
  email: string;
  riskLevel: ChurnRiskLevel;
  riskScore: number; // 0~100
  factors: ChurnRiskFactor[]; // 위험 점수 기여 요인(내림차순)
  learning: ChurnLearningStatus; // 학습 현황
}

/** 이탈 관리 대시보드 상단 3종(학생 목록 제외 — 목록은 별도 페이지네이션 조회). */
export interface ChurnDashboardSummary {
  stats: ChurnStats;
  trend: ChurnTrendPoint[];
  reasons: ChurnReason[];
}
