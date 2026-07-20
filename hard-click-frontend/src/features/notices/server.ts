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
    isRead: item.isRead,
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
  };
}

/** 상단 배너용 최신 전역 공지 — 서버에서 조회 (Server Component 전용). 중요 여부와 무관하게 최신순 상위 N개. */
export async function getRecentNoticesServer(limit = 5): Promise<Notice[]> {
  const sortByLatest = (content: NoticeApiItem[]) =>
    [...content]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
      .map(toNotice);

  if (USE_MOCK) {
    return sortByLatest(mockNoticesResponse.content);
  }
  const res = await serverApi.get<NoticeApiResponse>(
    '/api/notices?type=GLOBAL&page=0&size=20',
  );
  if (!res.success || !res.data) return [];
  return sortByLatest(res.data.content);
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

/**
 * 강의 상세 미리보기용 공지 — 목록 + 상위 N개 본문(content) 보강.
 *
 * 공지 "목록"(`GET /api/notices`) 응답엔 **content가 없다**(상세에만 존재).
 * 그래서 강의 상세 카드의 본문이 비어 보였음 → 표시할 상위 N개만 상세를 조회해 content를 채운다.
 * (정렬은 CourseDetailContent와 동일: 고정 맨 위 → 최신순. N개 한정이라 N+1 비용 허용)
 */
export async function getCourseNoticePreviewServer(
  courseId: number,
  limit = 3,
): Promise<Notice[]> {
  // 미리보기 용도 — 상세 병렬 조회 폭주 방지를 위해 1~10으로 클램프
  const safeLimit = Math.min(10, Math.max(1, Math.trunc(limit) || 1));
  const { notices } = await getCourseNoticesServer(courseId, { page: 0 });
  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const top = sorted.slice(0, safeLimit);
  // 상세 조회 실패해도 카드 자체는 노출(빈 본문 유지)
  return Promise.all(
    top.map(async (n) => {
      const detail = await getNoticeDetailServer(n.noticeId).catch(() => null);
      return { ...n, content: detail?.content ?? '' };
    }),
  );
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
