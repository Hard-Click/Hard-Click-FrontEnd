'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';

export interface NotiReadResult {
  success: boolean;
}

/**
 * 알림 읽음 처리 (Server Action · BFF). PATCH /api/notifications/{notiId}/read.
 * 라이브 검증(2026-06-25, 200). gate isMock('notifications').
 * 드롭다운에서 알림 클릭 시 호출 — 배지/목록의 낙관적 갱신은 NotificationProvider가 담당.
 */
export async function markNotificationReadAction(
  notiId: number,
): Promise<NotiReadResult> {
  if (!Number.isInteger(notiId) || notiId <= 0) {
    return { success: false };
  }

  if (isMock('notifications')) {
    return { success: true };
  }

  try {
    const res = await serverApi.patch<null>(
      `/api/notifications/${notiId}/read`,
    );
    return { success: res.success };
  } catch {
    return { success: false };
  }
}
