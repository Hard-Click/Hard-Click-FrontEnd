'use server';

import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { getNotificationsServer, type NotificationsData } from './server';

export interface NotiReadResult {
  success: boolean;
}

/**
 * 알림 목록·미읽음수 재조회 (Server Action · BFF).
 * SSE 실시간 이벤트 수신 시 NotificationProvider가 호출 — push payload를 파싱하지 않고
 * **검증된 GET 엔드포인트로 권위 데이터를 다시 끌어온다**(push shape 미검증 의존 회피).
 */
export async function refreshNotificationsAction(): Promise<NotificationsData> {
  return getNotificationsServer();
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
