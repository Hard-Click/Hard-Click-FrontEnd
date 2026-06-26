/**
 * 순공시간 통계 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/study-timers/stats/daily?startDate=&endDate= (일별 순공시간 조회)
 */

export interface DailyStudyStatApiItem {
  date: string; // yyyy-MM-dd
  studySeconds: number;
}

export const mockDailyStudyStats: DailyStudyStatApiItem[] = [
  { date: '2026-05-10', studySeconds: 5400 },
  { date: '2026-05-11', studySeconds: 7200 },
  { date: '2026-05-12', studySeconds: 0 },
  { date: '2026-05-13', studySeconds: 3600 },
];
