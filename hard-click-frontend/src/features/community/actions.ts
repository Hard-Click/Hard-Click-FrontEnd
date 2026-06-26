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

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

async function getAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const memberId = cookieStore.get('memberId')?.value;
  const headers: Record<string, string> = {};
  if (token) headers['authorization'] = `Bearer ${token}`;
  if (memberId) headers['x-member-id'] = memberId;
  return headers;
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

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawData);
  } catch {
    return { success: false, message: '잘못된 요청 데이터입니다.' };
  }

  if (!body.title || typeof body.title !== 'string' || !(body.title as string).trim()) {
    return { success: false, message: '제목을 입력해주세요.' };
  }
  if (!body.content || typeof body.content !== 'string' || !(body.content as string).trim()) {
    return { success: false, message: '내용을 입력해주세요.' };
  }

  // 스터디모집은 별도 API (/api/studies) 호출
  if (body.boardType === 'STUDY') {
    try {
      const res = await fetch(`${BACKEND}/api/studies`, {
        method: 'POST',
        headers: { ...(await getAuthHeader()), 'content-type': 'application/json' },
        body: JSON.stringify({
          title: body.title,
          subject: body.subject,
          content: body.content,
          ...(body.maxCount !== undefined ? { maxCount: body.maxCount } : {}),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json || json.httpStatus >= 400) {
        return { success: false, message: json?.message ?? '스터디 등록에 실패했습니다.' };
      }
      revalidatePath('/community');
      return { success: true, data: json.data };
    } catch {
      return { success: false, message: '스터디 등록 중 오류가 발생했습니다.' };
    }
  }

  const files = formData.getAll('files').filter((f) => {
    const file = f as File;
    return file.size > 0 && ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
  });

  const backendForm = new FormData();
  backendForm.append('data', new Blob([rawData], { type: 'application/json' }));
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

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawData);
  } catch {
    return { success: false, message: '잘못된 요청 데이터입니다.' };
  }

  if (!body.title || typeof body.title !== 'string' || !(body.title as string).trim()) {
    return { success: false, message: '제목을 입력해주세요.' };
  }
  if (!body.content || typeof body.content !== 'string' || !(body.content as string).trim()) {
    return { success: false, message: '내용을 입력해주세요.' };
  }

  const files = formData.getAll('files').filter((f) => {
    const file = f as File;
    return file.size > 0 && ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
  });

  const backendForm = new FormData();
  backendForm.append('data', new Blob([rawData], { type: 'application/json' }));
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
  const content = (formData.get('content') as string | null)?.trim() ?? '';
  const parentIdRaw = formData.get('parentId');
  const parentId = parentIdRaw ? Number(parentIdRaw) : undefined;
  const image = formData.get('image') as File | null;

  if (!Number.isFinite(postId) || postId <= 0) {
    return { success: false, message: '잘못된 게시글 정보입니다.' };
  }
  if (!content) {
    return { success: false, message: '댓글 내용을 입력해주세요.' };
  }

  const validImage =
    image && image.size > 0 && ALLOWED_IMAGE_TYPES.includes(image.type) && image.size <= MAX_IMAGE_SIZE
      ? image
      : null;

  const backendForm = new FormData();
  const body = { postId, content, ...(parentId !== undefined ? { parentId } : {}) };
  backendForm.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  if (validImage) backendForm.append('file', validImage);

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
    revalidatePath(`/community/${postId}`);
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
