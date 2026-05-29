import { api } from '@/services/api';
import type {
  BoardType,
  PostListResponse,
  PostDetail,
  CommentsResponse,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from './types';

export async function getPosts(boardType: BoardType = 'ALL', page = 0) {
  return api.get<PostListResponse>(
    `/api/boards/${boardType}/posts?page=${page}`,
  );
}

export async function getPostDetail(postId: number) {
  return api.get<PostDetail>(`/api/posts/${postId}`);
}

export async function createPost(body: CreatePostRequest) {
  return api.post<{ postId: number }>('/api/posts', body);
}

export async function updatePost(postId: number, body: UpdatePostRequest) {
  return api.patch<{ postId: number }>(`/api/posts/${postId}`, body);
}

export async function deletePost(postId: number) {
  return api.delete<void>(`/api/posts/${postId}`);
}

export async function getComments(postId: number) {
  return api.get<CommentsResponse>(`/api/posts/${postId}/comments`);
}

export async function createComment(body: CreateCommentRequest) {
  return api.post<{ commentId: number }>('/api/comments', body);
}

export async function updateComment(
  commentId: number,
  body: UpdateCommentRequest,
) {
  return api.patch<{ commentId: number }>(`/api/comments/${commentId}`, body);
}

export async function deleteComment(commentId: number) {
  return api.delete<void>(`/api/comments/${commentId}`);
}

export async function acceptComment(commentId: number) {
  return api.post<{ isAccepted: boolean }>(
    `/api/comments/${commentId}/accept`,
    {},
  );
}
