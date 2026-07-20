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
 * timeSpentByQuestion = { [questionId]: 문제별 머문 시간(초) } — AI 복습 추천용(BE 요청).
 *   BE가 필드 optional(없으면 NULL)로 받으므로 값이 없으면 0으로 전송한다. 상한 처리는 서버 몫.
 * 격리막: 채점은 서버에서만 → 클라이언트는 점수만 받는다.
 * 라이브: BE는 selectedOptionId를 요구 → 응시 상세(GET /api/quizzes/{id})를 재조회해
 *   answerIndex를 optionId로 변환 후 POST /api/quizzes/{id}/submissions.
 */
export async function submitQuizAction(
  courseId: number,
  quizId: number,
  answers: Record<number, number>,
  timeSpentByQuestion: Record<number, number> = {},
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

    // 2) answerIndex → selectedOptionId. 매핑 실패는 조용히 누락하지 않고 에러 반환(부분 제출 방지).
    //    + timeSpentSeconds: 클라가 준 문제별 초. Server Action 경계라 음수·비정수·비유한 값은 0으로 방어(§5).
    const answerList: {
      questionId: number;
      selectedOptionId: number;
      timeSpentSeconds: number;
    }[] = [];
    for (const [qid, idx] of Object.entries(answers)) {
      const questionId = Number(qid);
      const opts = optionIdsByQ.get(questionId);
      if (
        !Number.isInteger(questionId) ||
        !Number.isInteger(idx) ||
        !opts ||
        opts[idx] == null
      ) {
        return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
      }
      // 맵 자체도 신뢰하지 않는다 — null/비객체가 오면 인덱싱에서 TypeError가 나 제출 전체가 실패하므로,
      // '값이 없으면 0' 계약을 지키도록 맵 유무를 먼저 가른다(Server Action 경계, §5).
      const t =
        timeSpentByQuestion && typeof timeSpentByQuestion === 'object'
          ? timeSpentByQuestion[questionId]
          : undefined;
      const timeSpentSeconds =
        typeof t === 'number' && Number.isFinite(t) && t >= 0 ? Math.round(t) : 0;
      answerList.push({ questionId, selectedOptionId: opts[idx], timeSpentSeconds });
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
