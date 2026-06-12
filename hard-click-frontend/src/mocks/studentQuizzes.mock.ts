/**
 * 수강생 퀴즈 목데이터 (USE_MOCK용).
 * 퀴즈 자체는 quizzes.mock(강사 등록분) 재사용 — 여기선 "수강 중 강의 + 본인 응시 기록"만.
 */

/** 수강 중 강의 — 과목 선택 필터용 */
export const mockEnrolledCourses: { courseId: number; title: string }[] = [
  { courseId: 1, title: 'React 완벽 가이드' },
  { courseId: 2, title: 'TypeScript 심화 학습' },
  { courseId: 3, title: 'Node.js 백엔드 개발' },
];

/** 본인 응시 기록 — quizId → {점수, 응시일}. 없으면 미응시. (course 1: 1·2주 응시) */
const ATTEMPTS: Record<number, { score: number; attemptedDate: string }> = {
  1: { score: 80, attemptedDate: '2026-05-12' },
  2: { score: 90, attemptedDate: '2026-05-15' },
};

export function getStudentAttempt(
  quizId: number,
): { score: number; attemptedDate: string } | null {
  return ATTEMPTS[quizId] ?? null;
}
