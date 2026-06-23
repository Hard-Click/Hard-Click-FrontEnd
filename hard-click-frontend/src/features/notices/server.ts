import { serverApi } from '@/lib/api';
import type {
  Notice,
  NoticeDetail,
  NoticeApiItem,
  NoticeApiResponse,
} from './types';
// 공지 도메인만 실서버 연동 (다른 도메인은 전역 USE_MOCK 유지)
import { USE_MOCK_NOTICES as USE_MOCK } from '@/mocks/config';
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

/** 강의 공지 목록(COURSE) — 서버에서 검색/페이징 조회 (Server Component 전용) */
export async function getCourseNoticesServer(
  courseId: number,
  params: { page?: number; keyword?: string },
): Promise<{ notices: Notice[]; totalPages: number }> {
  if (USE_MOCK) {
    return {
      notices: mockNoticesResponse.content.map(toNotice),
      totalPages: mockNoticesResponse.totalPages,
    };
  }
  const q = new URLSearchParams();
  q.set('type', 'COURSE');
  q.set('courseId', String(courseId));
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

/** 공지 상세 — 서버에서 조회 (Server Component 전용) */
export async function getNoticeDetailServer(
  noticeId: number,
): Promise<NoticeDetail | null> {
  if (USE_MOCK) {
    const item =
      mockNoticesResponse.content.find((n) => n.noticeId === noticeId) ??
      mockNoticesResponse.content[0];
    if (!item) return null;
    return {
      noticeId: item.noticeId,
      noticeType: item.noticeType,
      courseName: item.courseName,
      title: item.title,
      content: '공지 본문입니다. (목 데이터)',
      isPinned: item.isPinned,
      isRead: item.isRead,
      createdAt: item.createdAt,
      previousNotice: null,
    };
  }
  const res = await serverApi.get<NoticeDetail>(`/api/notices/${noticeId}`);
  if (!res.success || !res.data) return null;
  return res.data;
}
