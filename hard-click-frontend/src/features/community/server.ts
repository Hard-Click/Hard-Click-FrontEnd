import { serverApi } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import type { BoardType, PostListResponse, PostListApiResponse } from './types';
// 커뮤니티 도메인만 실서버 연동 (다른 도메인은 전역 USE_MOCK 유지)
import { USE_MOCK_COMMUNITY as USE_MOCK } from '@/mocks/config';
import { mockPostListResponse } from '@/mocks/community.mock';
import { toPostListResponse, mapOk } from './services';
import { mockSubjects } from '@/mocks/community.mock';
import type { SubjectItem } from './types';
import { SUBJECT_NAME, SUBJECTS as CONST_SUBJECTS } from '@/constants/subjects';

export async function getSubjects(): Promise<ApiResponse<SubjectItem[]>> {
  if (USE_MOCK) {
    return { success: true, httpStatus: 200, message: '', data: mockSubjects };
  }
  // /api/subjects 엔드포인트 없음 → FE 상수에서 생성
  return {
    success: true,
    httpStatus: 200,
    message: '',
    data: CONST_SUBJECTS.map((s) => ({ code: s.code, name: s.name })),
  };
}

export async function getCommunityPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
  subjectCode?: string
): Promise<ApiResponse<PostListResponse>> {
  if (USE_MOCK) {
    // mock도 posts/items 둘 다 수용 (live와 동일 토글 유지)
    const mockPosts =
      mockPostListResponse.posts ?? mockPostListResponse.items ?? [];
    let filtered =
      boardType === 'ALL'
        ? mockPosts
        : mockPosts.filter((p) => p.boardType === boardType);
    if (subjectCode) {
      const subjectName = SUBJECT_NAME[subjectCode];
      filtered = filtered.filter((p) => p.subjectName === subjectName);
    }
    const PAGE_SIZE = 10;
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(Math.max(page, 0), totalPages - 1);
    const paged = filtered.slice(
      safePage * PAGE_SIZE,
      (safePage + 1) * PAGE_SIZE
    );
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: toPostListResponse({
        ...mockPostListResponse,
        posts: paged,
        totalPages,
      }),
    };
  }

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);
  if (subjectCode) params.set('subjectCode', subjectCode);

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return mapOk(
    await serverApi.get<PostListApiResponse>(url),
    toPostListResponse
  );
}
