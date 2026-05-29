import type { Notice, NoticeDetail, NoticeWriteRequest } from './types';
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

/** 공지 목록 조회 (GET /api/notices) — type 필수, page 0-based */
export async function getNotices(params: {
  type: 'GLOBAL' | 'COURSE';
  courseId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}) {
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
export async function createCourseNotice(courseId: number, body: NoticeWriteRequest) {
  return api.post<{ noticeId: number }>(`/api/courses/${courseId}/notices`, body);
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
    await new Promise(resolve => setTimeout(resolve, 0));
    return MOCK_NOTICES.filter(n => n.isPinned);
  }

  // 노션 명세: GET /api/notices?type=GLOBAL&page=0&size=20
  const response = await api.get<NoticeApiResponse>('/api/notices?type=GLOBAL&page=0&size=20');

  if (!response.success || !response.data) {
    return [];
  }

  return response.data.content
    .filter(n => n.isPinned)
    .map(toNotice);
}
