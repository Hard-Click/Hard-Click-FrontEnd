import { USE_MOCK } from '@/mocks/config';
import { mockNotificationsByRole } from '@/mocks/notifications.mock';
import { toNotificationItem, type NotificationItem } from './types';

/**
 * 알림 목록 조회.
 *
 * mock 단계에서는 동기적으로 즉시 반환한다 — 헤더 종 드롭다운(클라이언트)에서
 * 바로 사용하기 위해 api 레이어(서버 전용 `serverApi`)를 import 하지 않는다.
 *
 * @param role 역할(STUDENT/INSTRUCTOR/ADMIN) — mock에서 역할별 목록을 고르기 위함.
 *             실연동에서는 의미 없음(백엔드가 로그인 사용자 기준으로 필터링).
 *
 * TODO(api): 실제 연동 시 GET /api/notifications 로 교체하며 비동기로 전환한다.
 *   - 클라이언트: `api.get`(@/services/api)
 *   응답 `content[]`를 `toNotificationItem` 으로 매핑해 동일한 UI 타입을 반환한다.
 *   이때 role 파라미터는 더 이상 사용하지 않는다.
 */
export function getNotifications(role?: string): NotificationItem[] {
  if (USE_MOCK) {
    const res = mockNotificationsByRole[role ?? 'STUDENT'] ??
      mockNotificationsByRole.STUDENT;
    return res.content.map(toNotificationItem);
  }
  return [];
}

/** 읽지 않은 알림 개수 */
export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((n) => !n.isRead).length;
}
