'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import type { QuizFormPayload } from './types';

export interface QuizActionState {
  success: boolean;
  message?: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 * 강사 퀴즈 쓰기(등록·수정·삭제) — 실 엔드포인트로 배선 완료. gate=isMock('quizzes')(=false 라이브).
 * ⚠️ BE 쓰기가 아직 **stub**(비즈니스 로직 대기 — 201/200만 반환, 저장 안 됨). BE 로직이 오면:
 *    - 삭제: 그대로 자동 동작 (엔드포인트 DELETE /api/instructor/quizzes/{id}, 바디 없음 — 검증된 계약).
 *    - 등록/수정: 아래 toInstructorQuizRequest의 **가정 2개**(sectionId·correctOptionId)를 검증/조정해야 함.
 * ───────────────────────────────────────────────────────────────────────── */

/** BE 강사 퀴즈 등록/수정 요청 DTO (격리막 — 매퍼 출력 형태 명시, §3). BE 계약 확정 시 여기서 조정. */
interface InstructorQuizRequest {
  quizTitle: string;
  courseId: number;
  sectionId: number;
  questions: {
    questionText: string;
    explanation: string;
    correctOptionId: number;
    options: { optionId: number; optionText: string }[];
  }[];
}

/**
 * FE 폼(QuizFormPayload — 주차·정답index 기반) → BE InstructorQuizRequest(섹션·correctOptionId 기반) 매퍼.
 * ⚠️ BE 쓰기 stub이라 아래 2개는 **가정(§0.1)** — BE 비즈니스 로직 오면 반드시 검증:
 *   (가정1) sectionId ← week: BE는 sectionId를 요구하나 FE 폼은 "주차"만 받음 → 주차를 그대로 보냄.
 *           실제 강의 섹션ID와 주차가 다르면 폼을 "섹션 선택"으로 개편 필요할 수 있음.
 *   (가정2) correctOptionId ← answerIndex+1 / optionId ← i+1: ⚠️ **라이브 read가 이 가정을 반박함** —
 *           GET /api/instructor/quizzes/{id}를 보면 optionId는 **전역 DB id**(문제2 옵션은 5~8, 1~4 아님),
 *           문제별 1-based는 optionNumber이고 correctOptionId는 그 전역 optionId를 가리킴(+ 옵션마다 correct:boolean).
 *           즉 신규 작성은 optionId/correctOptionId를 FE가 못 만드니, 실제 생성 계약은 correct:boolean 또는
 *           optionNumber 기반일 가능성이 큼. BE 생성 DTO 확정 시 이 매퍼를 그 형태로 교체할 것.
 */
function toInstructorQuizRequest(
  payload: QuizFormPayload,
): InstructorQuizRequest {
  return {
    quizTitle: payload.title,
    courseId: payload.courseId,
    sectionId: payload.week, // 가정1
    questions: payload.questions.map((q) => ({
      questionText: q.content,
      explanation: q.explanation,
      correctOptionId: q.answerIndex + 1, // 가정2
      options: q.options.map((optionText, i) => ({
        optionId: i + 1, // 임시 id (신규 옵션)
        optionText,
      })),
    })),
  };
}

/**
 * 퀴즈 삭제 (Server Action · BFF). DELETE /api/instructor/quizzes/{quizId}.
 * ✅ 계약 검증됨(바디 없음) — BE 로직 오면 자동으로 실삭제. 현재는 BE stub이라 성공만 반환.
 */
export async function deleteQuizAction(
  quizId: number,
  courseId: number,
): Promise<QuizActionState> {
  if (
    !Number.isInteger(quizId) ||
    quizId <= 0 ||
    !Number.isInteger(courseId) ||
    courseId <= 0
  ) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (isMock('quizzes')) {
    return { success: true, message: '퀴즈가 삭제되었습니다.' };
  }

  try {
    const res = await serverApi.delete<null>(
      `/api/instructor/quizzes/${quizId}`,
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '삭제에 실패했습니다.' };
    }
    revalidatePath(`/instructor/quizzes/${courseId}`);
    return { success: true, message: '퀴즈가 삭제되었습니다.' };
  } catch {
    return { success: false, message: '삭제에 실패했습니다.' };
  }
}

/** 등록/수정 폼 payload 공통 검증 (서버측 방어). */
function validatePayload(payload: QuizFormPayload): string | null {
  // Server Action 경계 — 런타임 타입 보장 안 되므로 typeof로 먼저 방어 (.trim() throw 방지)
  if (typeof payload?.title !== 'string' || !payload.title.trim()) {
    return '퀴즈 제목을 입력해주세요.';
  }
  if (!Number.isInteger(payload.courseId) || payload.courseId <= 0) {
    return '연결 강의를 선택해주세요.';
  }
  if (!Number.isInteger(payload.week) || payload.week <= 0) {
    return '연결 주차를 선택해주세요.';
  }
  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    return '문제를 1개 이상 추가해주세요.';
  }
  for (const q of payload.questions) {
    if (!q || typeof q !== 'object') return '문제 형식이 올바르지 않습니다.';
    if (typeof q.content !== 'string' || !q.content.trim()) {
      return '문제 내용을 입력해주세요.';
    }
    if (
      !Array.isArray(q.options) ||
      q.options.length !== 4 ||
      q.options.some((o) => typeof o !== 'string' || !o.trim())
    ) {
      return '보기 4개를 모두 입력해주세요.';
    }
    if (
      !Number.isInteger(q.answerIndex) ||
      q.answerIndex < 0 ||
      q.answerIndex > 3
    ) {
      return '정답을 선택해주세요.';
    }
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) {
      return '해설을 입력해주세요.';
    }
  }
  return null;
}

/**
 * 퀴즈 등록 (Server Action · BFF). POST /api/instructor/quizzes (body=InstructorQuizRequest).
 * ⚠️ BE stub + 가정 매퍼(sectionId·correctOptionId) — BE 로직 오면 가정 검증 후 동작.
 */
export async function createQuizAction(
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (isMock('quizzes')) {
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  }

  try {
    const res = await serverApi.post<null>(
      '/api/instructor/quizzes',
      toInstructorQuizRequest(payload),
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '등록에 실패했습니다.' };
    }
    revalidatePath(`/instructor/quizzes/${payload.courseId}`);
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  } catch {
    return { success: false, message: '등록에 실패했습니다.' };
  }
}

/**
 * 퀴즈 수정 (Server Action · BFF). PUT /api/instructor/quizzes/{quizId} (body=InstructorQuizRequest).
 * ⚠️ BE stub + 가정 매퍼 — BE 로직 오면 가정 검증(특히 기존 문항/옵션 id 처리) 후 동작.
 */
export async function updateQuizAction(
  quizId: number,
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  if (!Number.isInteger(quizId) || quizId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (isMock('quizzes')) {
    return { success: true, message: '퀴즈가 수정되었습니다.' };
  }

  try {
    const res = await serverApi.put<null>(
      `/api/instructor/quizzes/${quizId}`,
      toInstructorQuizRequest(payload),
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '수정에 실패했습니다.' };
    }
    revalidatePath(`/instructor/quizzes/${payload.courseId}`);
    return { success: true, message: '퀴즈가 수정되었습니다.' };
  } catch {
    return { success: false, message: '수정에 실패했습니다.' };
  }
}
