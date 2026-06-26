'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  getPosts,
  getSubjects,
  getPostDetail,
  deletePost,
  getComments,
  updateComment,
  deleteComment,
  acceptComment,
} from './services';
import type {
  BoardType,
  UpdateCommentRequest,
} from './types';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

async function getAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function getPostsAction(
  boardType: BoardType = 'ALL',
  page = 0,
  keyword?: string,
  sort?: string
) {
  return getPosts(boardType, page, keyword, sort);
}

export async function getSubjectsAction() {
  return getSubjects();
}

export async function getPostDetailAction(postId: number) {
  return getPostDetail(postId);
}

export async function createPostAction(formData: FormData) {
  const rawData = formData.get('data') as string;
  if (!rawData) return { success: false, message: '데이터가 없습니다.' };

  const backendForm = new FormData();
  backendForm.append('data', new Blob([rawData], { type: 'application/json' }));
  const files = formData.getAll('files');
  files.forEach((f) => backendForm.append('files', f as Blob));

  try {
    const res = await fetch(`${BACKEND}/api/posts`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: backendForm,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.httpStatus >= 400) {
      return { success: false, message: json?.message ?? '게시글 등록에 실패했습니다.' };
    }
    revalidatePath('/community');
    return { success: true, data: json.data };
  } catch {
    return { success: false, message: '게시글 등록 중 오류가 발생했습니다.' };
  }
}

export async function updatePostAction(postId: number, formData: FormData) {
  const rawData = formData.get('data') as string;
  if (!rawData) return { success: false, message: '데이터가 없습니다.' };

  const backendForm = new FormData();
  backendForm.append('data', new Blob([rawData], { type: 'application/json' }));
  const files = formData.getAll('files');
  files.forEach((f) => backendForm.append('files', f as Blob));

  try {
    const res = await fetch(`${BACKEND}/api/posts/${postId}`, {
      method: 'PATCH',
      headers: await getAuthHeader(),
      body: backendForm,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.httpStatus >= 400) {
      return { success: false, message: json?.message ?? '게시글 수정에 실패했습니다.' };
    }
    revalidatePath('/community');
    revalidatePath(`/community/${postId}`);
    return { success: true, data: json.data };
  } catch {
    return { success: false, message: '게시글 수정 중 오류가 발생했습니다.' };
  }
}

export async function deletePostAction(postId: number) {
  const result = await deletePost(postId);
  if (result.success) revalidatePath('/community');
  return result;
}

export async function getCommentsAction(postId: number) {
  return getComments(postId);
}

export async function createCommentAction(formData: FormData) {
  const postId = Number(formData.get('postId'));
  const content = formData.get('content') as string;
  const parentIdRaw = formData.get('parentId');
  const parentId = parentIdRaw ? Number(parentIdRaw) : undefined;
  const image = formData.get('image') as File | null;

  const backendForm = new FormData();
  const body = { postId, content, ...(parentId !== undefined ? { parentId } : {}) };
  backendForm.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  if (image && image.size > 0) backendForm.append('file', image);

  try {
    const res = await fetch(`${BACKEND}/api/comments`, {
      method: 'POST',
      headers: await getAuthHeader(),
      body: backendForm,
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.httpStatus >= 400) {
      return { success: false, message: json?.message ?? '댓글 등록에 실패했습니다.' };
    }
    return { success: true, data: json.data };
  } catch {
    return { success: false, message: '댓글 등록 중 오류가 발생했습니다.' };
  }
}

export async function updateCommentAction(
  commentId: number,
  body: UpdateCommentRequest
) {
  return updateComment(commentId, body);
}

export async function deleteCommentAction(commentId: number) {
  return deleteComment(commentId);
}

export async function acceptCommentAction(commentId: number) {
  return acceptComment(commentId);
}
