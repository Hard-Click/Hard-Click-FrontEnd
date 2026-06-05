/**
 * 학습 잔디 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/grass/lessons  (수강량 잔디)
 * GET /api/grass/streak   (연속 학습일)
 * GET /api/grass/monthly  (월별 잔디)
 * GET /api/grass/yearly   (연간 잔디)
 */

export interface GrassLessonApiItem {
  date: string; // yyyy-MM-dd
  watchedLessonCount: number;
  level: number; // 0~4 잔디 농도
  isFuture: boolean;
}

export const mockLessonGrass: GrassLessonApiItem[] = [
  { date: '2026-05-08', watchedLessonCount: 1, level: 1, isFuture: false },
  { date: '2026-05-09', watchedLessonCount: 0, level: 0, isFuture: false },
  { date: '2026-05-10', watchedLessonCount: 3, level: 2, isFuture: false },
  { date: '2026-05-11', watchedLessonCount: 6, level: 4, isFuture: false },
  { date: '2026-05-12', watchedLessonCount: 0, level: 0, isFuture: true },
];

/** GET /api/grass/streak — 연속 학습일 */
export interface StreakApiResponse {
  streak: number;
}

export const mockStreak: StreakApiResponse = { streak: 7 };

/** 월별/연간 잔디의 하루 칸 (value/level 기반) */
export interface GrassDay {
  date: string; // yyyy-MM-dd
  value: number; // 학습 값
  level: number; // 0~4 색상 단계
  isFuture: boolean;
}

/** GET /api/grass/monthly?year=&month= */
export interface MonthlyGrassApiResponse {
  year: number;
  month: number;
  days: GrassDay[];
}

export const mockMonthlyGrass: MonthlyGrassApiResponse = {
  year: 2026,
  month: 5,
  days: [
    { date: '2026-05-10', value: 3, level: 2, isFuture: false },
    { date: '2026-05-11', value: 6, level: 4, isFuture: false },
    { date: '2026-05-12', value: 0, level: 0, isFuture: true },
  ],
};

/** GET /api/grass/yearly?year= */
export interface YearlyGrassApiResponse {
  year: number;
  days: GrassDay[];
}

export const mockYearlyGrass: YearlyGrassApiResponse = {
  year: 2026,
  days: [
    { date: '2026-01-01', value: 0, level: 0, isFuture: false },
    { date: '2026-05-10', value: 3, level: 2, isFuture: false },
    { date: '2026-05-11', value: 6, level: 4, isFuture: false },
  ],
};
