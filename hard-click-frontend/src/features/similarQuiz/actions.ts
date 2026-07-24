'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { gradeSimilarQuizMock } from '@/mocks/similarQuiz.mock';
import type { QuizReviewQuestion } from '@/features/quizzes/types';
import { pickTimeSpentSeconds } from '@/features/quizzes/timeSpent';
import type { SimilarQuizSubmitResult } from './types';

export interface SimilarQuizSubmitState {
  success: boolean;
  message?: string;
  result?: SimilarQuizSubmitResult;
}

/**
 * 캐시 무효화는 best-effort — 제출은 이미 BE에 저장됐으므로, revalidate 실패가 제출 성공을
 * 실패(success:false)로 뒤집어 재제출/중복을 유발하지 않게 예외를 삼킨다(§0.1④: 진짜 성공을 실패로 위장 안 함).
 */
function revalidateScheduleBestEffort() {
  try {
    revalidatePath('/schedule');
  } catch {
    // no-op — 캐시 갱신 실패는 제출 결과에 영향 주지 않는다.
  }
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
 * timeSpentByQuestion = { [questionId]: 문제별 머문 시간(초) } — AI 복습 추천용(BE 요청).
 *   미측정은 0이 아니라 **null**로 보낸다. 0을 보내면 "0초에 순식간에 풀었다"와 "시간을 못 쟀다"가
 *   같은 값이 돼, 풀이시간 중앙값으로 판정하는 추천 로직이 0에 깔려 신호가 꺼진다(정규 퀴즈와 동일 계약).
 * 격리막: 채점은 서버에서만. 제출 응답에 해설 전부 → 같은 화면에서 바로 해설 렌더(목록 이동 없음).
 *
 * ⚠️ 상태(§0.1④): config.similarQuiz=false → **라이브**(mock 아님) — 아래 라이브 분기가 실행됨.
 *   BE 코드 검증(2026-07-22, origin/main): SimilarQuizSubmitRequest.Answer에 timeSpentSeconds(nullable)
 *   존재 · SimilarQuizSubmissionService가 @Transactional로 submissionRepository.save 수행 → 제출·풀이시간
 *   모두 영속화된다(이전 "prod 미배포" 상태 해소).
 *   응답 shape은 BE 계약 기준(생성은 라이브 검증, 제출 응답은 라이브 미검증 §0.1①).
 *   mock으로 되돌리면 가짜 채점을 진짜처럼 렌더(§0.1②)라 지양.
 */
export async function submitSimilarQuizAction(
  similarQuizId: number,
  answers: Record<number, number>,
  timeSpentByQuestion: Record<number, number> = {},
): Promise<SimilarQuizSubmitState> {
  if (!Number.isInteger(similarQuizId) || similarQuizId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  if (!answers || typeof answers !== 'object') {
    return { success: false, message: '제출 데이터가 올바르지 않습니다.' };
  }

  // Server Action 입력은 불신(§5) — mock/live 분기 전에 답안을 검증(questionId 양의 정수·selectedIndex 0~3).
  // BE 계약: answers=[{questionId, selectedIndex, timeSpentSeconds}]. Record → 검증하며 배열로 변환.
  const answerList: {
    questionId: number;
    selectedIndex: number;
    timeSpentSeconds: number | null;
  }[] = [];
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
    // 정규화(미측정→null · INT32 범위 방어)는 정규 퀴즈와 공용 유틸을 쓴다.
    const timeSpentSeconds = pickTimeSpentSeconds(timeSpentByQuestion, questionId);
    answerList.push({ questionId, selectedIndex: idx, timeSpentSeconds });
  }

  if (isMock('similarQuiz')) {
    const result = gradeSimilarQuizMock(similarQuizId, answers);
    if (!result) {
      return { success: false, message: '유사 문제를 찾을 수 없습니다.' };
    }
    // ⚠️ mock 채점(gradeSimilarQuizMock)은 스케줄의 REVIEW due를 갱신하지 않으므로, mock에서는 복귀해도
    // 그 복습이 목록에 그대로 남는다(mock 한계, §0.1④). 라이브 계약(BE가 due 전진 → 목록 제거)에 맞춰
    // 캐시만 미리 무효화해 둔다(best-effort).
    revalidateScheduleBestEffort();
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
    // 제출 성공 = BE가 해당 복습(REVIEW)의 due를 전진시켜 완료 처리(A안, BE #682) → 캘린더 복귀 시
    // 그 REVIEW 항목이 목록에서 빠져 보이게 스케줄 경로 캐시 무효화(best-effort).
    revalidateScheduleBestEffort();
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
