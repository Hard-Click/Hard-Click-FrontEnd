import { USE_MOCK } from '@/mocks/config';
import { mockNotificationsByRole } from '@/mocks/notifications.mock';
import {
  toNotificationItem,
  type NotificationItem,
  type NotificationRole,
} from './types';

/**
 * 알림 목록 조회.
 *
 * 헤더 종 드롭다운(Client Component)에서 동기적으로 읽는다.
 * 프로젝트 규칙상 클라이언트에서 `useEffect` 데이터 페칭은 금지(CLAUDE.md)이므로,
 * mock 데이터는 동기 반환하여 렌더 시점에 바로 사용한다.
 *
 * @param role 역할 — mock에서 역할별 목록을 고르기 위함.
 *             실연동에서는 백엔드가 로그인 사용자 기준으로 필터링하므로 사용되지 않는다.
 *
 * TODO(api): 실 연동 시 useEffect가 아니라 "데이터 조회는 서버에서"(가이드라인) 원칙에 따라
 *   상위 서버 컴포넌트에서 GET /api/notifications 를 조회해 props로 전달한다.
 */
export function getNotifications(role: NotificationRole): NotificationItem[] {
  if (USE_MOCK) {
    return mockNotificationsByRole[role].content.map(toNotificationItem);
  }
  // 실 API는 서버 컴포넌트 경유로 연결 예정. USE_MOCK=true 운영 정책상 이 분기는 도달하지 않는다.
  return [];
}

/** 읽지 않은 알림 개수 */
export function getUnreadCount(items: NotificationItem[]): number {
  return items.filter((n) => !n.isRead).length;
}
