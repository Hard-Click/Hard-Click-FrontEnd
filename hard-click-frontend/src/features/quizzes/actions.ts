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
  if (USE_MOCK) {
    return { success: true, message: '퀴즈가 삭제되었습니다.' };
  }

  try {
    await serverApi.delete(`/api/instructor/quizzes/${quizId}`);
    revalidatePath(`/instructor/quizzes/${courseId}`);
    return { success: true, message: '퀴즈가 삭제되었습니다.' };
  } catch {
    return { success: false, message: '삭제에 실패했습니다.' };
  }
}
