/** 이탈 위험도 */
export type ChurnRiskLevel = 'HIGH' | 'MID';

/** 상단 지표 카드 */
export interface ChurnStats {
  highRiskCount: number; // 고위험 학생 수
  midRiskCount: number; // 중위험 학생 수
  newThisWeekCount: number; // 이번 주 신규(위험 진입)
  avgRiskScore: number; // 평균 위험 점수 (0~100)
}

/** 이탈 위험 학생 추이 (주별) */
export interface ChurnTrendPoint {
  label: string; // 예: '1주', '5주', '이번주'
  count: number; // 해당 주 위험 학생 수
}

/** 주요 이탈 사유 비중 */
export interface ChurnReason {
  label: string; // 예: '진도 밀림'
  percent: number; // 0~100
}

/** 위험 학생 목록 행 */
export interface ChurnStudent {
  id: number;
  name: string;
  riskLevel: ChurnRiskLevel;
  reason: string; // 예: '2주 밀림 · 5일 미접속'
  riskScore: number; // 0~100
  lastActiveAt: string; // 최근 활동 (YYYY-MM-DD)
}

/** 이탈 관리 대시보드 전체 데이터 */
export interface ChurnDashboard {
  stats: ChurnStats;
  trend: ChurnTrendPoint[];
  reasons: ChurnReason[];
  students: ChurnStudent[];
}
