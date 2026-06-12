'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';
import type { QuizFormPayload } from './types';

export interface QuizActionState {
  success: boolean;
  message?: string;
}

/**
 * 퀴즈 삭제 (Server Action · BFF).
 * USE_MOCK 시: mock은 정적이라 서버 삭제·revalidate 없이 성공만 반환
 * (목록에서 사라지는 건 클라이언트가 낙관적 제거). API 연동 시 실삭제 + revalidate 동작.
 */
export async function deleteQuizAction(
  quizId: number,
  courseId: number,
): Promise<QuizActionState> {
  // 입력 검증 — 양의 정수만 허용 (잘못된 ID 조기 차단)
  if (
    !Number.isInteger(quizId) ||
    quizId <= 0 ||
    !Number.isInteger(courseId) ||
    courseId <= 0
  ) {
    return { success: false, message: '잘못된 요청입니다.' };
  }

  if (USE_MOCK) {
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
  if (!payload.title.trim()) return '퀴즈 제목을 입력해주세요.';
  if (!Number.isInteger(payload.courseId) || payload.courseId <= 0) {
    return '연결 강의를 선택해주세요.';
  }
  if (!Number.isInteger(payload.week) || payload.week <= 0) {
    return '연결 주차를 선택해주세요.';
  }
  if (payload.questions.length === 0) return '문제를 1개 이상 추가해주세요.';
  return null;
}

/** 퀴즈 등록 (Server Action · BFF). */
export async function createQuizAction(
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (USE_MOCK) {
    return { success: true, message: '퀴즈가 등록되었습니다.' };
  }

  try {
    const res = await serverApi.post<null>(
      `/api/instructor/courses/${payload.courseId}/quizzes`,
      payload,
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

/** 퀴즈 수정 (Server Action · BFF). */
export async function updateQuizAction(
  quizId: number,
  payload: QuizFormPayload,
): Promise<QuizActionState> {
  if (!Number.isInteger(quizId) || quizId <= 0) {
    return { success: false, message: '잘못된 요청입니다.' };
  }
  const invalid = validatePayload(payload);
  if (invalid) return { success: false, message: invalid };

  if (USE_MOCK) {
    return { success: true, message: '퀴즈가 수정되었습니다.' };
  }

  try {
    const res = await serverApi.put<null>(
      `/api/instructor/quizzes/${quizId}`,
      payload,
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
