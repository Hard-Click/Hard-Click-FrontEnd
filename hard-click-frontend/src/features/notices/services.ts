import type {
  Notice,
  NoticeDetail,
  NoticeWriteRequest,
  NoticeApiItem,
  NoticeApiResponse,
} from './types';
import { api } from '@/services/api';
import { USE_MOCK_NOTICES as USE_MOCK } from '@/mocks/config';
import { mockNoticesResponse } from '@/mocks/notices.mock';

function toNotice(item: NoticeApiItem): Notice {
  return {
    noticeId: item.noticeId,
    title: item.title,
    content: '', // 백엔드 미제공 — 상세 조회 시 받음
    isPinned: item.isPinned,
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
  };
}

export async function getNoticeDetail(noticeId: number) {
  if (USE_MOCK) {
    const found = mockNoticesResponse.content.find(
      (n) => n.noticeId === noticeId
    );
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: {
        noticeId,
        title: found?.title ?? '공지 제목',
        content:
          '안녕하세요. 공지사항 내용입니다.\n\n해당 일정 동안 서비스 이용에 참고 부탁드립니다.',
        isPinned: found?.isPinned ?? false,
        createdAt: found?.createdAt ?? '2026-05-10T09:00:00',
      } as NoticeDetail,
    };
  }
  return api.get<NoticeDetail>(`/api/notices/${noticeId}`);
}

export async function deleteNotice(noticeId: number) {
  return api.delete<void>(`/api/notices/${noticeId}`);
}

/** 공지 목록 조회 (GET /api/notices) — type 필수, page 0-based */
export async function getNotices(params: {
  type: 'GLOBAL' | 'COURSE';
  courseId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: mockNoticesResponse,
    };
  }
  const q = new URLSearchParams();
  q.set('type', params.type);
  if (params.courseId != null) q.set('courseId', String(params.courseId));
  if (params.keyword) q.set('keyword', params.keyword);
  q.set('page', String(params.page ?? 0));
  q.set('size', String(params.size ?? 100));
  return api.get<NoticeApiResponse>(`/api/notices?${q.toString()}`);
}

/** 강의 공지 목록 (GET /api/notices?type=COURSE&courseId=) → Notice[] 매핑 */
export async function getCourseNotices(courseId: number): Promise<Notice[]> {
  const res = await getNotices({ type: 'COURSE', courseId, size: 100 });
  if (!res.success || !res.data) return [];
  return res.data.content.map(toNotice);
}

/** 강의 공지 작성 (POST /api/courses/{courseId}/notices) */
export async function createCourseNotice(
  courseId: number,
  body: NoticeWriteRequest
) {
  return api.post<{ noticeId: number }>(
    `/api/courses/${courseId}/notices`,
    body
  );
}

/** 전역 공지 작성 (POST /api/notices) */
export async function createGlobalNotice(body: NoticeWriteRequest) {
  return api.post<{ noticeId: number }>(`/api/notices`, body);
}

/** 공지 수정 (PATCH /api/notices/{noticeId}) */
export async function updateNotice(noticeId: number, body: NoticeWriteRequest) {
  return api.patch<void>(`/api/notices/${noticeId}`, body);
}

export async function getPinnedNotices(): Promise<Notice[]> {
  if (USE_MOCK) {
    return mockNoticesResponse.content.filter((n) => n.isPinned).map(toNotice);
  }

  // 노션 명세: GET /api/notices?type=GLOBAL&page=0&size=20
  const response = await api.get<NoticeApiResponse>(
    '/api/notices?type=GLOBAL&page=0&size=20'
  );
  if (!response.success || !response.data) return [];
  return response.data.content.filter((n) => n.isPinned).map(toNotice);
}
