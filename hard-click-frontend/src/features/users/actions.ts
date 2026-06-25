'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import type { AdminUserStatus } from './types';

interface ChangeMemberStatusResponse {
  memberId: number;
  status: string;
  memo: string | null;
}

interface ActionResult {
  success: boolean;
  message: string;
}

export async function changeUserStatusAction(
  memberId: number,
  status: AdminUserStatus,
  memo?: string,
): Promise<ActionResult> {
  try {
    const res = await serverApi.patch<ChangeMemberStatusResponse>(
      `/api/admin/members/${memberId}/status`,
      { status, ...(memo ? { memo } : {}) },
    );
    if (!res.success) {
      return { success: false, message: res.message ?? '상태 변경에 실패했습니다.' };
    }
  } catch {
    return { success: false, message: '상태 변경 중 오류가 발생했습니다.' };
  }
  revalidatePath('/admin/users');
  return {
    success: true,
    message: status === 'SUSPENDED' ? '이용제한 처리했습니다.' : '이용제한을 해제했습니다.',
  };
}
