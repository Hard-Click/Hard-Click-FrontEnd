import { mockQuizzes } from '@/mocks/quizzes.mock';

/**
 * 수강생 퀴즈 목데이터 (USE_MOCK용).
 * 퀴즈 자체는 quizzes.mock(강사 등록분) 재사용 — 여기선 "수강 중 강의 + 본인 응시(제출) 기록"만.
 */

/** 수강 중 강의 — 과목 선택 필터용 */
export const mockEnrolledCourses: { courseId: number; title: string }[] = [
  { courseId: 1, title: 'React 완벽 가이드' },
  { courseId: 2, title: 'TypeScript 심화 학습' },
  { courseId: 3, title: 'Node.js 백엔드 개발' },
];

/**
 * 본인 응시(제출) 기록 — quizId → { selected: 보기인덱스(questionId별), attemptedAt }. 없으면 미응시.
 * (course 1: 1주차 만점 / 2주차 2오답=60점)
 */
const SUBMISSIONS: Record<
  number,
  { selected: Record<number, number>; attemptedAt: string }
> = {
  // 1주차: 1오답 → 50점 (이전 주차 없음 → 향상도 비교 불가)
  1: { selected: { 1: 0, 2: 0 }, attemptedAt: '2026-05-08 14:00' },
  // 2주차: 1오답 → 80점 (이전 50점 → +30점 상승)
  2: {
    selected: { 20: 1, 21: 0, 22: 1, 23: 1, 24: 0 },
    attemptedAt: '2026-05-12 15:30',
  },
  // 3주차: 3오답 → 50점 (이전 80점 → -30점 하락)
  3: {
    selected: { 10: 0, 11: 1, 12: 1, 13: 1, 14: 0, 15: 0 },
    attemptedAt: '2026-05-19 16:00',
  },
};

/** 제출 기록 조회 (리뷰 화면용) */
export function getQuizSubmission(
  quizId: number,
): { selected: Record<number, number>; attemptedAt: string } | null {
  return SUBMISSIONS[quizId] ?? null;
}

/** 응시 결과(점수·응시일) — 제출 답안 + 정답으로 계산. 미응시면 null. */
export function getStudentAttempt(
  quizId: number,
): { score: number; attemptedDate: string } | null {
  const sub = SUBMISSIONS[quizId];
  if (!sub) return null;
  const quiz = mockQuizzes.find((q) => q.quizId === quizId);
  if (!quiz) return null;
  const total = quiz.questions.length;
  const correct = quiz.questions.filter(
    (q) => sub.selected[q.questionId] === q.answerIndex,
  ).length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  return { score, attemptedDate: sub.attemptedAt.split(' ')[0] };
}
