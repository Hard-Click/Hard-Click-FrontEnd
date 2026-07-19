'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { gradeSimilarQuizMock } from '@/mocks/similarQuiz.mock';
import type { QuizReviewQuestion } from '@/features/quizzes/types';
import type { SimilarQuizSubmitResult } from './types';

export interface SimilarQuizSubmitState {
  success: boolean;
  message?: string;
  result?: SimilarQuizSubmitResult;
}

/** POST /api/similar-quizzes/{id}/submit 응답 — 가정 shape(해설 포함). */
interface ApiSimilarQuizResult {
  score: number;
  correctCount: number;
  totalCount: number;
  questions: {
    questionId: number;
    content: string;
    options: string[];
    answerIndex: number;
    selectedIndex: number | null;
    explanation: string;
    correct: boolean;
  }[];
}

/**
 * 유사퀴즈 제출 + 채점 (Server Action · BFF).
 * answers = { [questionId]: 선택 보기 인덱스(0~3) }.
 * 격리막: 채점은 서버에서만. 제출 응답에 해설 전부 → 같은 화면에서 바로 해설 렌더(목록 이동 없음).
 *
 * ⚠️ 상태(§0.1④): config.similarQuiz=false → **라이브**(mock 아님) — 아래 라이브 분기가 실행됨.
 *   제출 엔드포인트는 BE **develop엔 있으나 prod(main) 미배포** → 배포 전엔 404(정직하게 '제출 실패' 토스트,
 *   가짜 점수/해설 안 만듦). 응답 shape은 BE 계약 기준(생성은 라이브 검증, 제출은 라이브 미검증 §0.1①).
 *   BE develop→main 배포 시 작동. mock으로 되돌리면 가짜 채점을 진짜처럼 렌더(§0.1②)라 지양.
 */
export async function submitSimilarQuizAction(
  similarQuizId: number,
  answers: Record<number, number>,
): Promise<SimilarQuizSubmitState> {
  if (!Number.isInteger(similarQuizId) || similarQuizId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  if (!answers || typeof answers !== 'object') {
    return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
  }

  // Server Action 입력은 불신(§5) — mock/live 분기 전에 답안을 검증(questionId 양의 정수·selectedIndex 0~3).
  // BE 계약: answers=[{questionId, selectedIndex}]. Record → 검증하며 배열로 변환.
  const answerList: { questionId: number; selectedIndex: number }[] = [];
  for (const [qid, idx] of Object.entries(answers)) {
    const questionId = Number(qid);
    if (
      !Number.isInteger(questionId) ||
      questionId <= 0 ||
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx > 3
    ) {
      return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
    }
    answerList.push({ questionId, selectedIndex: idx });
  }

  if (isMock('similarQuiz')) {
    const result = gradeSimilarQuizMock(similarQuizId, answers);
    if (!result) {
      return { success: false, message: '유사 문제를 찾을 수 없습니다.' };
    }
    return { success: true, result };
  }

  // ── 라이브(BE 완성 후) — 가정 shape, 미검증 ──
  try {
    const res = await serverApi.post<ApiSimilarQuizResult>(
      `/api/similar-quizzes/${similarQuizId}/submit`,
      { answers: answerList },
    );
    if (!res.success || !res.data) {
      return { success: false, message: res.message ?? '제출에 실패했습니다.' };
    }
    const d = res.data;
    const questions: QuizReviewQuestion[] = d.questions.map((q) => ({
      questionId: q.questionId,
      content: q.content,
      options: q.options,
      answerIndex: q.answerIndex,
      selectedIndex: q.selectedIndex,
      explanation: q.explanation,
      correct: q.correct,
    }));
    return {
      success: true,
      result: {
        score: d.score,
        correctCount: d.correctCount,
        totalCount: d.totalCount,
        questions,
      },
    };
  } catch {
    return { success: false, message: '제출에 실패했습니다.' };
  }
}
