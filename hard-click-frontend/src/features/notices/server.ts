import { serverApi } from '@/lib/api';
import type { Notice, NoticeApiItem, NoticeApiResponse } from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockNoticesResponse } from '@/mocks/notices.mock';

function toNotice(item: NoticeApiItem): Notice {
  return {
    noticeId: item.noticeId,
    title: item.title,
    content: '',
    isPinned: item.isPinned,
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
  };
}

/** 상단 고정 전역 공지 — 서버에서 조회 (Server Component 전용) */
export async function getPinnedNoticesServer(): Promise<Notice[]> {
  if (USE_MOCK) {
    return mockNoticesResponse.content.filter((n) => n.isPinned).map(toNotice);
  }
  const res = await serverApi.get<NoticeApiResponse>(
    '/api/notices?type=GLOBAL&page=0&size=20',
  );
  if (!res.success || !res.data) return [];
  return res.data.content.filter((n) => n.isPinned).map(toNotice);
}

/** 전체 공지 목록(GLOBAL) — 서버에서 검색/페이징 조회 (Server Component 전용) */
export async function getGlobalNoticesServer(params: {
  page?: number;
  keyword?: string;
}): Promise<{ notices: Notice[]; totalPages: number }> {
  if (USE_MOCK) {
    return {
      notices: mockNoticesResponse.content.map(toNotice),
      totalPages: mockNoticesResponse.totalPages,
    };
  }
  const q = new URLSearchParams();
  q.set('type', 'GLOBAL');
  q.set('page', String(params.page ?? 0));
  q.set('size', '10');
  if (params.keyword) q.set('keyword', params.keyword);

  const res = await serverApi.get<NoticeApiResponse>(
    `/api/notices?${q.toString()}`,
  );
  if (!res.success || !res.data) return { notices: [], totalPages: 1 };

  return {
    notices: res.data.content.map(toNotice),
    totalPages: Math.max(1, res.data.totalPages ?? 1),
  };
}
