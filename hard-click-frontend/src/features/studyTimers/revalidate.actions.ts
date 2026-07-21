'use server';

import { revalidatePath } from 'next/cache';

/**
 * 순공 타이머 종료 후 호출 — 마이페이지 "오늘 순공시간" 캐시 갱신 전용.
 * `studyTimers/actions.ts`는 'use client' 모듈(브라우저 axios 사용)이라 그 안에서
 * revalidatePath를 직접 호출할 수 없어, 이 작은 서버 액션을 별도로 둔다.
 */
export async function revalidateMypageAction(): Promise<void> {
  revalidatePath('/mypage');
}
