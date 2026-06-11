import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import type { Quiz } from './types';

/**
 * 강의별 퀴즈 목록 — 서버 조회 (Server Component 전용).
 * API 연동 시: 아래 실서버 분기 + (필요 시) toQuiz 매퍼만 수정하면 됨.
 */
export async function getQuizzesServer(courseId: number): Promise<Quiz[]> {
  if (USE_MOCK) {
    return mockQuizzes
      .filter((q) => q.courseId === courseId)
      .sort((a, b) => a.week - b.week);
  }

  // TODO(API 연동): 실제 엔드포인트·응답 shape 확정 후 매핑 적용
  const res = await serverApi.get<Quiz[]>(
    `/api/instructor/courses/${courseId}/quizzes`,
  );
  return res.success && res.data ? res.data : [];
}
