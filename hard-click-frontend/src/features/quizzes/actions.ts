'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  getCourseSectionsServer,
  getInstructorQuizDetailServer,
  getAdminQuizDetailServer,
  getQuizFormMetaServer,
} from './server';
import type { QuizFormPayload, Quiz } from './types';

export interface QuizActionState {
  success: boolean;
  message?: string;
}

/* ─────────────────────────────────────────────────────────────────────────
 * 강사 퀴즈 쓰기(등록·수정·삭제) — 실서버 연동. gate=isMock('quizzes')(=false 라이브).
 * BE(QuizController) 실구현 확인(2026-07-09 코드 검증). 등록/수정 요청 = sectionId(진짜)·correctOptionNumber(1~4)·optionText:
 *   - "주차 → sectionId"는 resolveSectionId가 GET /api/courses/{id} 섹션 orderIndex(=목록 weekNumber와 동일 스킴)로 해석.
 *   - correctOptionNumber = answerIndex+1, 보기는 optionText만(옵션 id는 BE가 부여).
 * ───────────────────────────────────────────────────────────────────────── */

/** BE 강사 퀴즈 등록/수정 요청 DTO (BE 확정 — QuizController.InstructorQuizRequest). */
interface InstructorQuizRequest {
  quizTitle: string;
  courseId: number;
  sectionId: number;
  questions: {
    questionText: string;
    explanation: string;
    difficulty: number; // 난이도 1=하/2=중/3=상 (BE @NotNull — 필수)
    correctOptionNumber: number; // 정답 보기 번호 1~4 (= answerIndex + 1)
    options: { optionText: string }[]; // BE는 보기 텍스트만 받음(optionId는 BE가 부여)
  }[];
}

/**
 * FE 폼(QuizFormPayload — 주차·정답index) → BE InstructorQuizRequest 매퍼.
 * sectionId는 호출부에서 resolveSectionId로 "주차 → 진짜 sectionId" 해석해 넘겨받는다.
 */
function toInstructorQuizRequest(
  payload: QuizFormPayload,
  sectionId: number,
): InstructorQuizRequest {
  return {
    quizTitle: payload.title,
    courseId: payload.courseId,
    sectionId,
    questions: payload.questions.map((q) => ({
      questionText: q.content,
      explanation: q.explanation,
      difficulty: q.difficulty,
      correctOptionNumber: q.answerIndex + 1,
      options: q.options.map((optionText) => ({ optionText })),
    })),
  };
}

/** 폼의 주차 → 강의 실제 sectionId 해석 (BE 등록/수정은 sectionId 요구). 매칭 섹션 없으면 null. */
async function resolveSectionId(
  payload: QuizFormPayload,
): Promise<number | null> {
  const sections = await getCourseSectionsServer(payload.courseId);
  return sections.find((s) => s.week === payload.week)?.sectionId ?? null;
}

/** ① 수정 모달용 — 강사 퀴즈 상세(문항 포함) 조회. 클라(QuizListContent)가 편집 클릭 시 호출.
 *  목록엔 문항이 없어 수정 시 실제 문항을 이걸로 채운다. */
export async function getInstructorQuizDetailAction(
  quizId: number,
): Promise<Quiz | null> {
  if (!Number.isInteger(quizId) || quizId <= 0) return null;
  return getInstructorQuizDetailServer(quizId);
}

/** ① 관리자 수정 모달용 — 관리자 퀴즈 상세 조회(admin 패밀리). 관리자 페이지가 detailAction으로 명시 전달. */
export async function getAdminQuizDetailAction(
  quizId: number,
): Promise<Quiz | null> {
  if (!Number.isInteger(quizId) || quizId <= 0) return null;
  return getAdminQuizDetailServer(quizId);
}

/** ②③ 등록 폼 메타 — 선택 강의의 실제 주차(섹션) + 이미 퀴즈 있는 주차. 클라가 강의 선택 시 호출. */
export async function getQuizFormMetaAction(
  courseId: number,
): Promise<{ weeks: number[]; takenWeeks: number[] }> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return { weeks: [], takenWeeks: [] };
  }
  return getQuizFormMetaServer(courseId);
}

/**
 * 퀴즈 삭제 (Server Action · BFF). DELETE /api/instructor/quizzes/{quizId}.
 * BE(QuizCommandService) 실삭제 — 바디 없음·success 검증. (mock이면 성공만.)
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
    if (
      !Number.isInteger(q.difficulty) ||
      q.difficulty < 1 ||
      q.difficulty > 3
    ) {
      // BE가 난이도를 @NotNull(1~3)로 요구 — 안 보내면 400. 서버 경계에서도 막는다.
      return '난이도를 선택해주세요.';
    }
    if (typeof q.explanation !== 'string' || !q.explanation.trim()) {
      return '해설을 입력해주세요.';
    }
  }
  return null;
}

/**
 * 퀴즈 등록 (Server Action · BFF). POST /api/instructor/quizzes (body=InstructorQuizRequest).
 * BE 실구현 라이브(stub 아님) — QuizCommandService.create가 소유권 검증 후 실 JPA 영속(quizRepository.save,
 * develop·main 코드 확인). 매퍼(toInstructorQuizRequest)는 BE 요청 DTO와 필드 일치: sectionId=주차→섹션
 * orderIndex 해석(resolveSectionId), correctOptionNumber=answerIndex+1, difficulty(1~3 @NotNull).
 */
export async function createQuizAction(
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (isMock('quizzes')) {
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  }

  const sectionId = await resolveSectionId(payload);
  if (sectionId === null) {
    return { success: false, message: '선택한 주차에 해당하는 섹션이 없습니다.' };
  }

  try {
    const res = await serverApi.post<null>(
      '/api/instructor/quizzes',
      toInstructorQuizRequest(payload, sectionId),
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
 * BE 실구현 라이브(stub 아님) — QuizCommandService.update가 소유권 검증 후 quiz.update→repository.update
 * (develop·main 코드 확인). 문항은 등록과 동일 InstructorQuizRequest 전체 전송(difficulty 포함); optionId는 BE가 재부여.
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

  const sectionId = await resolveSectionId(payload);
  if (sectionId === null) {
    return { success: false, message: '선택한 주차에 해당하는 섹션이 없습니다.' };
  }

  try {
    const res = await serverApi.put<null>(
      `/api/instructor/quizzes/${quizId}`,
      toInstructorQuizRequest(payload, sectionId),
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

/* ─────────────────────────────────────────────────────────────────────────
 * 관리자 퀴즈 CUD — /api/admin/quizzes/*
 * ───────────────────────────────────────────────────────────────────────── */

/** 퀴즈 등록 (관리자). POST /api/admin/quizzes. */
export async function createAdminQuizAction(
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (isMock('quizzes')) {
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  }

  const sectionId = await resolveSectionId(payload);
  if (sectionId === null) {
    return { success: false, message: '선택한 주차에 해당하는 섹션이 없습니다.' };
  }

  try {
    const res = await serverApi.post<null>(
      '/api/admin/quizzes',
      toInstructorQuizRequest(payload, sectionId),
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '등록에 실패했습니다.' };
    }
    revalidatePath(`/admin/quizzes/${payload.courseId}`);
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  } catch {
    return { success: false, message: '등록에 실패했습니다.' };
  }
}

/** 퀴즈 수정 (관리자). PUT /api/admin/quizzes/{quizId}. */
export async function updateAdminQuizAction(
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

  const sectionId = await resolveSectionId(payload);
  if (sectionId === null) {
    return { success: false, message: '선택한 주차에 해당하는 섹션이 없습니다.' };
  }

  try {
    const res = await serverApi.put<null>(
      `/api/admin/quizzes/${quizId}`,
      toInstructorQuizRequest(payload, sectionId),
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '수정에 실패했습니다.' };
    }
    revalidatePath(`/admin/quizzes/${payload.courseId}`);
    return { success: true, message: '퀴즈가 수정되었습니다.' };
  } catch {
    return { success: false, message: '수정에 실패했습니다.' };
  }
}

/** 퀴즈 삭제 (관리자). DELETE /api/admin/quizzes/{quizId}. */
export async function deleteAdminQuizAction(
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
    const res = await serverApi.delete<null>(`/api/admin/quizzes/${quizId}`);
    if (!res.success) {
      return { success: false, message: res.message ?? '삭제에 실패했습니다.' };
    }
    revalidatePath(`/admin/quizzes/${courseId}`);
    return { success: true, message: '퀴즈가 삭제되었습니다.' };
  } catch {
    return { success: false, message: '삭제에 실패했습니다.' };
  }
}
