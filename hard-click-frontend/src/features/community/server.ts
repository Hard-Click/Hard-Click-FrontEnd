import { serverApi } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import type { BoardType, PostListResponse, PostListApiResponse } from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockPostListResponse } from '@/mocks/community.mock';
import { toPostListResponse, mapOk } from './services';
import { mockSubjects } from '@/mocks/community.mock';
import type { SubjectItem } from './types';
import { SUBJECT_NAME } from '@/constants/subjects';

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
  subjectCode?: string
): Promise<ApiResponse<PostListResponse>> {
  if (USE_MOCK) {
    let filtered =
      boardType === 'ALL'
        ? mockPostListResponse.posts
        : mockPostListResponse.posts.filter((p) => p.boardType === boardType);
    if (subjectCode) {
      const subjectName = SUBJECT_NAME[subjectCode];
      filtered = filtered.filter((p) => p.subjectName === subjectName);
    }
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
