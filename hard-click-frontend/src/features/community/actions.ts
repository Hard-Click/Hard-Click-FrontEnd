'use server';

import { revalidatePath } from 'next/cache';
import {
  getPosts,
  getSubjects,
  getPostDetail,
  createPost,
  updatePost,
  deletePost,
  getComments,
  createComment,
  updateComment,
  deleteComment,
  acceptComment,
} from './services';
import type {
  BoardType,
  CreatePostRequest,
  UpdatePostRequest,
  CreateCommentRequest,
  UpdateCommentRequest,
} from './types';

export async function getPostsAction(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string,
) {
  return getPosts(boardType, page, keyword, sort);
}

export async function getSubjectsAction() {
  return getSubjects();
}

export async function getPostDetailAction(postId: number) {
  return getPostDetail(postId);
}

export async function createPostAction(body: CreatePostRequest, files?: File[]) {
  const result = await createPost(body, files);
  if (result.success) revalidatePath('/community');
  return result;
}

export async function updatePostAction(
  postId: number,
  body: UpdatePostRequest,
  files?: File[],
) {
  const result = await updatePost(postId, body, files);
  if (result.success) {
    revalidatePath('/community');
    revalidatePath(`/community/${postId}`);
  }
  return result;
}

export async function deletePostAction(postId: number) {
  const result = await deletePost(postId);
  if (result.success) revalidatePath('/community');
  return result;
}

export async function getCommentsAction(postId: number) {
  return getComments(postId);
}

export async function createCommentAction(body: CreateCommentRequest) {
  return createComment(body);
}

export async function updateCommentAction(
  commentId: number,
  body: UpdateCommentRequest,
) {
  return updateComment(commentId, body);
}

export async function deleteCommentAction(commentId: number) {
  return deleteComment(commentId);
}

export async function acceptCommentAction(commentId: number) {
  return acceptComment(commentId);
}
