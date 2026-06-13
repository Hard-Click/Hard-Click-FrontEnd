'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import type { QuizSubmitResult } from './types';

export interface QuizSubmitState {
  success: boolean;
  message?: string;
  result?: QuizSubmitResult;
}

/**
 * 퀴즈 제출 + 채점 (Server Action · BFF).
 * answers = { [questionId]: 선택한 보기 인덱스(0~3) }.
 * 격리막: 채점은 서버에서만(정답 비교) → 클라이언트는 점수만 받는다.
 * USE_MOCK 시 mockQuizzes 정답으로 채점, 실서버는 제출 후 채점 결과를 받는다.
 */
export async function submitQuizAction(
  courseId: number,
  quizId: number,
  answers: Record<number, number>,
): Promise<QuizSubmitState> {
  // 입력 검증 — 양의 정수만
  if (
    !Number.isInteger(courseId) ||
    courseId <= 0 ||
    !Number.isInteger(quizId) ||
    quizId <= 0
  ) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  // Server Action 경계 — answers 런타임 방어
  if (!answers || typeof answers !== 'object') {
    return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
  }

  if (USE_MOCK) {
    const quiz = mockQuizzes.find(
      (q) => q.courseId === courseId && q.quizId === quizId,
    );
    if (!quiz) return { success: false, message: '퀴즈를 찾을 수 없습니다.' };
    const totalCount = quiz.questions.length;
    const correctCount = quiz.questions.filter(
      (q) => answers[q.questionId] === q.answerIndex,
    ).length;
    const score = totalCount
      ? Math.round((correctCount / totalCount) * 100)
      : 0;
    return { success: true, result: { score, correctCount, totalCount } };
  }

  try {
    const res = await serverApi.post<QuizSubmitResult>(
      `/api/student/courses/${courseId}/quizzes/${quizId}/submit`,
      { answers },
    );
    if (!res.success || !res.data) {
      return { success: false, message: res.message ?? '제출에 실패했습니다.' };
    }
    revalidatePath(`/quizzes/${courseId}`); // 목록 응시상태 갱신
    return { success: true, result: res.data };
  } catch {
    return { success: false, message: '제출에 실패했습니다.' };
  }
}
