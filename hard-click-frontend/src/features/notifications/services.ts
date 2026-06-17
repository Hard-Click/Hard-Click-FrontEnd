import { api } from '@/services/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockNotificationsByRole,
  type NotificationListApiResponse,
} from '@/mocks/notifications.mock';
import {
  toNotificationItem,
  type NotificationItem,
  type NotificationRole,
} from './types';

/**
 * 알림 목록 조회 (헤더 종 드롭다운 — Client Component용).
 *
 * Client Component에서 호출하므로 동일 출처 `/api/*`(BFF 프록시)를 쓰는
 * `@/services/api`의 `api`를 사용한다. (서버 전용 `serverApi`는 import 금지)
 *
 * @param role 역할 — mock에서 역할별 목록을 고르기 위함.
 *             실연동에서는 백엔드가 로그인 사용자 기준으로 필터링하므로 사용되지 않는다.
 */
export async function getNotifications(
  role: NotificationRole,
): Promise<NotificationItem[]> {
  if (USE_MOCK) {
    return mockNotificationsByRole[role].content.map(toNotificationItem);
  }

  const res = await api.get<NotificationListApiResponse>('/api/notifications');
  return (res.data?.content ?? []).map(toNotificationItem);
}

/** 읽지 않은 알림 개수 */
export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((n) => !n.isRead).length;
}
