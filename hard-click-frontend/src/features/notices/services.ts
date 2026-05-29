import type { Notice, NoticeDetail } from './types';
import { api } from '@/services/api';

const USE_MOCK = false;

const MOCK_NOTICES: Notice[] = [
  {
    noticeId: 1,
    title: '⚠️ 서버 점검 안내 (5월 10일 02:00~04:00)',
    content: '서버 점검으로 인해 서비스 이용이 일시 중단됩니다.',
    isPinned: true,
    createdAt: '2026-05-01',
  },
  {
    noticeId: 2,
    title: '2027 수능 D-197 특별 할인 이벤트 안내',
    content: '수능까지 197일! 전 강의 20% 할인 이벤트를 진행합니다.',
    isPinned: true,
    createdAt: '2026-05-10',
  },
];

/** 백엔드 공지사항 응답 item (노션 명세) */
interface NoticeApiItem {
  noticeId: number;
  noticeType: 'GLOBAL' | 'COURSE';
  courseName: string | null;
  title: string;
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
}

interface NoticeApiResponse {
  content: NoticeApiItem[];
  totalPages: number;
}

function toNotice(api: NoticeApiItem): Notice {
  return {
    noticeId: api.noticeId,
    title: api.title,
    content: '',                  // 백엔드 미제공 — 상세 조회 시 받음
    isPinned: api.isPinned,
    createdAt: api.createdAt.split('T')[0] ?? api.createdAt,
  };
}

export async function getNoticeDetail(noticeId: number) {
  return api.get<NoticeDetail>(`/api/notices/${noticeId}`);
}

export async function deleteNotice(noticeId: number) {
  return api.delete<void>(`/api/notices/${noticeId}`);
}

export async function getPinnedNotices(): Promise<Notice[]> {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 0));
    return MOCK_NOTICES.filter(n => n.isPinned);
  }

  // 노션 명세: GET /api/notices?page=0&size=10
  const response = await api.get<NoticeApiResponse>('/api/notices?page=0&size=20');

  if (!response.success || !response.data) {
    return [];
  }

  return response.data.content
    .filter(n => n.isPinned)
    .map(toNotice);
}
