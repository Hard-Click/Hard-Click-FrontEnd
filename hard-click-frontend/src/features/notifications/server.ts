import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import {
  mockNotificationsByRole,
  type NotificationApiItem,
  type NotificationListApiResponse,
} from '@/mocks/notifications.mock';
import { toNotificationItem, type NotificationItem } from './types';

export interface NotificationsData {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
 * 헤더 알림(종) 데이터 — 서버 조회 (루트 layout에서 호출 → NotificationProvider로 전달).
 * §12 "useEffect 데이터 페칭 금지" → AuthProvider처럼 서버에서 받아 Context로 내려준다.
 *
 * GET /api/notifications (목록) + GET /api/notifications/unread-count (미읽음수) 병렬.
 * 라이브 검증(2026-06-25, demo_student 200):
 *   - 목록 data = { content: [{notiId,type,message,isRead,redirectUrl,createdAt}], hasNext }
 *   - 미읽음 data = { unreadCount: number }
 * 비로그인/에러 시 빈 데이터(헤더가 깨지지 않게). gate isMock('notifications').
 */
export async function getNotificationsServer(): Promise<NotificationsData> {
  if (isMock('notifications')) {
    const items =
      mockNotificationsByRole.STUDENT.content.map(toNotificationItem);
    return {
      notifications: items,
      unreadCount: items.filter((n) => !n.isRead).length,
    };
  }

  try {
    const [listRes, countRes] = await Promise.all([
      // BE는 cursor 기반(cursorId)이라 page/size를 무시 → 죽은 파라미터 제거. 첫 페이지 조회.
      serverApi.get<NotificationListApiResponse>('/api/notifications'),
      serverApi.get<{ unreadCount: number }>(
        '/api/notifications/unread-count',
      ),
    ]);

    // 목록 실패 시 배지만 떠서 "배지는 있는데 목록 빈" 불일치가 생기지 않게 둘 다 빈 상태로.
    if (!listRes.success || !listRes.data) {
      return { notifications: [], unreadCount: 0 };
    }
    const content: NotificationApiItem[] = listRes.data.content;
    const notifications = content.map(toNotificationItem);

    // 미읽음수는 별도 엔드포인트 우선, 실패 시 목록에서 계산(폴백).
    const unreadCount =
      countRes.success && countRes.data
        ? countRes.data.unreadCount
        : notifications.filter((n) => !n.isRead).length;

    return { notifications, unreadCount };
  } catch {
    // 비로그인(401)·BE 장애 → 빈 종 (조용히 숨김 아님: 알림 0건은 정상 상태)
    return { notifications: [], unreadCount: 0 };
  }
}
