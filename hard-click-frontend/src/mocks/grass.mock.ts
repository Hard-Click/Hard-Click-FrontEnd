/**
 * 학습 잔디 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/grass/lessons (수강량 잔디)
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
