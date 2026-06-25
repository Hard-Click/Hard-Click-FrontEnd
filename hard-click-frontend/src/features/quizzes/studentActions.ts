'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
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
 * 격리막: 채점은 서버에서만 → 클라이언트는 점수만 받는다.
 * 라이브: BE는 selectedOptionId를 요구 → 응시 상세(GET /api/quizzes/{id})를 재조회해
 *   answerIndex를 optionId로 변환 후 POST /api/quizzes/{id}/submissions.
 */
export async function submitQuizAction(
  courseId: number,
  quizId: number,
  answers: Record<number, number>,
): Promise<QuizSubmitState> {
  if (
    !Number.isInteger(courseId) ||
    courseId <= 0 ||
    !Number.isInteger(quizId) ||
    quizId <= 0
  ) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  if (!answers || typeof answers !== 'object') {
    return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
  }

  if (isMock('quizzes')) {
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
    // 1) 응시 상세 재조회 → questionId별 보기 optionId 순서 확보 (answerIndex 변환용)
    const detail = await serverApi.get<{
      questions: {
        questionId: number;
        options: { optionId: number }[];
      }[];
    }>(`/api/quizzes/${quizId}`);
    if (!detail.success || !detail.data) {
      return { success: false, message: '제출에 실패했습니다.' };
    }
    const optionIdsByQ = new Map<number, number[]>();
    for (const q of detail.data.questions) {
      optionIdsByQ.set(
        q.questionId,
        q.options.map((o) => o.optionId),
      );
    }

    // 2) answerIndex → selectedOptionId
    const answerList: { questionId: number; selectedOptionId: number }[] = [];
    for (const [qid, idx] of Object.entries(answers)) {
      const opts = optionIdsByQ.get(Number(qid));
      if (opts && opts[idx] != null) {
        answerList.push({ questionId: Number(qid), selectedOptionId: opts[idx] });
      }
    }

    // 3) 제출
    const res = await serverApi.post<{
      score: number;
      correctCount: number;
      totalQuestionCount: number;
    }>(`/api/quizzes/${quizId}/submissions`, { answers: answerList });
    if (!res.success || !res.data) {
      return { success: false, message: res.message ?? '제출에 실패했습니다.' };
    }
    revalidatePath(`/quizzes/${courseId}`);
    return {
      success: true,
      result: {
        score: res.data.score,
        correctCount: res.data.correctCount,
        totalCount: res.data.totalQuestionCount,
      },
    };
  } catch {
    return { success: false, message: '제출에 실패했습니다.' };
  }
}
