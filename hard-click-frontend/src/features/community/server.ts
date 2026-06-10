import { serverApi } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import type { BoardType, PostListResponse, PostListApiResponse } from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockPostListResponse } from '@/mocks/community.mock';
import { toPostListResponse, mapOk } from './services';
import { mockSubjects } from '@/mocks/community.mock';
import type { SubjectItem } from './types';

/**
 * 커뮤니티 게시글 목록 — **서버에서 직접 호출**(Server Component 전용).
 * 서버 axios(쿠키)를 써서 페이지가 서버에서 데이터를 확보한 채 렌더된다.
 * 목록 조회는 공개 API라 토큰 없이도 동작한다.
 */

export async function getSubjects(): Promise<ApiResponse<SubjectItem[]>> {
  if (USE_MOCK) {
    return { success: true, httpStatus: 200, message: '', data: mockSubjects };
  }
  return serverApi.get<SubjectItem[]>('/api/subjects');
}

export async function getCommunityPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
  subjectId?: number,
): Promise<ApiResponse<PostListResponse>> {
  if (USE_MOCK) {
    let filtered = boardType === 'ALL'
      ? mockPostListResponse.posts
      : mockPostListResponse.posts.filter((p) => p.boardType === boardType);
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: toPostListResponse({ ...mockPostListResponse, posts: filtered }),
    };
  }
  

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);
  if (subjectId) params.set('subjectId', String(subjectId));

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return mapOk(await serverApi.get<PostListApiResponse>(url), toPostListResponse);
}
