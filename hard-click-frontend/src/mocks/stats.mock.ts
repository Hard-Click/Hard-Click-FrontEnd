/**
 * 학습 통계 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/stats/daily-study?startDate=&endDate= (일별 수강량·순공시간·완료영상수)
 */

export interface DailyStudyStatApiItem {
  date: string; // yyyy-MM-dd
  watchedLessonCount: number;
  studySeconds: number;
  completedVideoCount: number;
}

export const mockDailyStudyStatsDetail: DailyStudyStatApiItem[] = [
  { date: '2026-05-10', watchedLessonCount: 3, studySeconds: 5400, completedVideoCount: 2 },
  { date: '2026-05-11', watchedLessonCount: 5, studySeconds: 7200, completedVideoCount: 4 },
  { date: '2026-05-12', watchedLessonCount: 0, studySeconds: 0, completedVideoCount: 0 },
  { date: '2026-05-13', watchedLessonCount: 2, studySeconds: 3600, completedVideoCount: 1 },
];
