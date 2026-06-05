/**
 * 알림 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/notifications
 */

export interface NotificationApiItem {
  notiId: number;
  type: string; // COMMENT, NOTICE 등 ENUM
  message: string;
  isRead: boolean;
  referenceId: number; // 연결된 타겟 데이터 ID
  createdAt: string;
}

export interface NotificationListApiResponse {
  content: NotificationApiItem[];
}

export const mockNotificationListResponse: NotificationListApiResponse = {
  content: [
    {
      notiId: 55,
      type: 'COMMENT',
      message: '내 질문에 새로운 댓글이 달렸습니다.',
      isRead: false,
      referenceId: 889,
      createdAt: '2026-05-10T16:00:00',
    },
    {
      notiId: 54,
      type: 'NOTICE',
      message: '새로운 공지사항이 등록되었습니다.',
      isRead: true,
      referenceId: 10,
      createdAt: '2026-05-09T09:00:00',
    },
  ],
};
