import type { NoticeApiResponse } from '@/features/notices/types';

/**
 * 공지 목록 목 데이터 — 백엔드 GET /api/notices 응답 명세(shape) 그대로.
 * UI `Notice`가 아니라 `NoticeApiItem` 형태이므로, 서비스의 `toNotice` 매핑을
 * 실제 API와 동일하게 거친다.
 */
export const mockNoticesResponse: NoticeApiResponse = {
  content: [
    {
      noticeId: 1,
      noticeType: 'GLOBAL',
      courseName: null,
      title: '⚠️ 서버 점검 안내 (5월 10일 02:00~04:00)',
      isPinned: true,
      isRead: false,
      createdAt: '2026-05-01T09:00:00',
    },
    {
      noticeId: 2,
      noticeType: 'GLOBAL',
      courseName: null,
      title: '2027 수능 D-197 특별 할인 이벤트 안내',
      isPinned: true,
      isRead: false,
      createdAt: '2026-05-10T09:00:00',
    },
    {
      noticeId: 3,
      noticeType: 'GLOBAL',
      courseName: null,
      title: '5월 신규 강의 업데이트 안내',
      isPinned: false,
      isRead: true,
      createdAt: '2026-05-08T09:00:00',
    },
  ],
  totalPages: 1,
};
