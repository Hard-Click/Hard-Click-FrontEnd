/** 학습 잔디(grass) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 연속 학습일 조회 (GET /api/grass/streak) ───── */
export interface StreakResponse {
  streak: number;
}

/* ───── 잔디 조회 공통 쿼리 ─────
 * year 필수, month 선택. month 미지정 시 연간 잔디. */
export interface GrassQuery {
  year: number;
  month?: number;
}

/* ───── 순공시간 잔디 (GET /api/grass/study-time) ───── */
export interface StudyTimeGrassCell {
  date: string; // YYYY-MM-DD
  studySeconds: number;
  level: number; // 색상 단계 (0~5)
  isFuture: boolean;
}

/* ───── 수강량 잔디 (GET /api/grass/lessons) ───── */
export interface LessonsGrassCell {
  date: string; // YYYY-MM-DD
  watchedLessonCount: number;
  level: number;
  isFuture: boolean;
}

/* ───── 특정 날짜 잔디 상세 (GET /api/grass/days/{date}) ───── */
export interface GrassDayDetail {
  date: string; // YYYY-MM-DD
  watchedLessonCount: number;
  studySeconds: number;
  hasStudyRecord: boolean;
}
