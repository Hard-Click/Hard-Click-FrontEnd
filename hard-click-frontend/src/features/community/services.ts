import { serverApi as api } from '@/lib/api';
import type { ApiResponse } from '@/services/api';
import type {
  BoardType,
  PostListResponse,
  PostDetail,
  CommentsResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
  SubjectItem,
} from './types';
import { USE_MOCK } from '@/mocks/config';
import {
  mockPostListResponse,
  mockPostDetail,
  mockCommentsResponse,
  mockSubjects,
} from '@/mocks/community.mock';

function mockOk<T>(data: T): ApiResponse<T> {
  return { success: true, httpStatus: 200, message: '', data };
}

export async function getPosts(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
) {
  if (USE_MOCK) return mockOk(mockPostListResponse);

  const params = new URLSearchParams();
  params.set('page', String(page));
  if (keyword) params.set('keyword', keyword);
  if (sort) params.set('sort', sort);

  const url =
    boardType === 'ALL'
      ? `/api/boards/posts?${params.toString()}`
      : `/api/boards/${boardType}/posts?${params.toString()}`;

  return api.get<PostListResponse>(url);
}

export async function getSubjects() {
  if (USE_MOCK) return mockOk(mockSubjects);
  return api.get<SubjectItem[]>('/api/subjects');
}

export async function getPostDetail(postId: number) {
  if (USE_MOCK) return mockOk({ ...mockPostDetail, postId });
  return api.get<PostDetail>(`/api/posts/${postId}`);
}

export async function createPost(body: CreatePostRequest, files?: File[]) {
  if (USE_MOCK) return mockOk({ postId: 1 });
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  if (files) files.forEach((f) => form.append('files', f));
  return api.post<{ postId: number }>('/api/posts', form);
}

export async function updatePost(
  postId: number,
  body: UpdatePostRequest,
  files?: File[],
) {
  if (USE_MOCK) return mockOk({ postId });
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  if (files) files.forEach((f) => form.append('files', f));
  return api.patch<{ postId: number }>(`/api/posts/${postId}`, form);
}

export async function deletePost(postId: number) {
  if (USE_MOCK) return mockOk<void>(undefined as void);
  return api.delete<void>(`/api/posts/${postId}`);
}

export async function getComments(postId: number) {
  if (USE_MOCK) return mockOk(mockCommentsResponse);
  return api.get<CommentsResponse>(`/api/posts/${postId}/comments`);
}

export async function createComment(body: CreateCommentRequest) {
  if (USE_MOCK) return mockOk({ commentId: 1 });
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  return api.post<{ commentId: number }>('/api/comments', form);
}

export async function updateComment(
  commentId: number,
  body: UpdateCommentRequest,
) {
  if (USE_MOCK) return mockOk({ commentId });
  const form = new FormData();
  form.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  return api.patch<{ commentId: number }>(`/api/comments/${commentId}`, form);
}

export async function deleteComment(commentId: number) {
  if (USE_MOCK) return mockOk<void>(undefined as void);
  return api.delete<void>(`/api/comments/${commentId}`);
}

export async function acceptComment(commentId: number) {
  if (USE_MOCK) return mockOk({ isAccepted: true });
  return api.post<{ isAccepted: boolean }>(
    `/api/comments/${commentId}/accept`,
    {},
  );
}
