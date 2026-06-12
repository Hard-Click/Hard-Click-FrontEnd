'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { USE_MOCK } from '@/mocks/config';

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
