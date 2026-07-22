'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { mockQuizzes } from '@/mocks/quizzes.mock';
import { pickTimeSpentSeconds } from './timeSpent';
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
 *   ⚠️ 미측정은 0이 아니라 **null**로 보낸다(BE 요청 2026-07-21). 0을 보내면 "0초에 순식간에 풀었다"와
 *   "시간을 못 쟀다"가 같은 값이 돼, 풀이시간 중앙값으로 '오래 걸림'을 판정하는 추천 로직이
 *   0에 깔려 신호가 꺼진다. BE는 null을 '미측정'으로 처리한다(배포 순서 무관).
 *   측정된 값이 0으로 반올림된 경우(찍고 바로 넘김)는 진짜 0이므로 그대로 0을 보낸다.
 *   비즈니스 상한(1시간 초과 → null)은 서버 몫이라 걸지 않는다. 단, BE DTO가 32비트 Integer라
 *   그 범위 밖 값만 null로 막는다(계약이 표현 못 하는 값 — 안 막으면 역직렬화 400).
 *   BE 코드 검증(2026-07-21): main·develop 모두 QuizSubmissionAnswer.normalizeTimeSpent가
 *   null·음수·3600초 초과를 null로 정규화한다.
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
    //    + timeSpentSeconds: 클라가 준 문제별 초. Server Action 경계라 음수·비정수·비유한 값은 null로 방어(§5).
    //      방어 결과가 null인 것은 '측정 실패'라 미측정과 같은 의미 — 가짜 0을 만들지 않는다(§0.1②).
    const answerList: {
      questionId: number;
      selectedOptionId: number;
      timeSpentSeconds: number | null;
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
      // 정규화(미측정→null · INT32 범위 방어)는 유사퀴즈와 공용 유틸을 쓴다.
      const timeSpentSeconds = pickTimeSpentSeconds(timeSpentByQuestion, questionId);
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
