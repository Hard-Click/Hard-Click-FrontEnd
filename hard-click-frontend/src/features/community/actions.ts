'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  getPostDetail,
  deletePost,
  updateComment,
  deleteComment,
  acceptComment,
} from './services';
import type {
  UpdateCommentRequest,
  CommentApiItem,
  CommentsResponse,
} from './types';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
// BE 지연 시 Server Action이 무한 대기하지 않도록 native fetch 타임아웃
const REQUEST_TIMEOUT_MS = 10000;

/** 클라이언트에서 넘어온 id가 양의 정수인지 검증 (문자열 값으로 BE 프록시 남용 방지) */
function isValidId(id: number): boolean {
  return Number.isInteger(id) && id > 0;
}

async function getAuthHeader(): Promise<HeadersInit> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const memberId = cookieStore.get('memberId')?.value;
  const headers: Record<string, string> = {};
  if (token) headers['authorization'] = `Bearer ${token}`;
  if (memberId) headers['x-member-id'] = memberId;
  return headers;
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

  // 스터디모집은 별도 API (/api/study) 호출
  if (body.boardType === 'STUDY') {
    try {
      const res = await fetch(`${BACKEND}/api/study`, {
        method: 'POST',
        headers: { ...(await getAuthHeader()), 'content-type': 'application/json' },
        body: JSON.stringify({
          title: body.title,
          subject: body.subject,
          content: body.content,
          ...(body.maxCount !== undefined ? { maxCount: body.maxCount } : {}),
        }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.httpStatus >= 400) {
      if (json?.errorCode === 'C010' || json?.errorCode === 'U015') {
        return { success: false, message: '커뮤니티 이용 권한이 없습니다. 계정 상태를 확인해주세요.' };
      }
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

  // keepImageUrls는 FE 전용 필드(수정 폼이 유지하기로 한 기존 이미지 URL) — 백엔드로는 안 보내고
  // 여기서 다시 fetch해 files에 재첨부한다. 안 그러면 PATCH가 신규 파일만 받아 기존 이미지가 전부
  // 사라진다(§0.1④, 이전엔 실제로 사라지는 버그였음). 서버 액션(서버 환경)에서 fetch하므로 CORS 문제 없음.
  const keepImageUrls = Array.isArray(body.keepImageUrls)
    ? (body.keepImageUrls as unknown[]).filter((u): u is string => typeof u === 'string')
    : [];
  delete body.keepImageUrls;

  const files = formData.getAll('files').filter((f) => {
    const file = f as File;
    return file.size > 0 && ALLOWED_IMAGE_TYPES.includes(file.type) && file.size <= MAX_IMAGE_SIZE;
  });

  const backendForm = new FormData();
  backendForm.append('data', new Blob([JSON.stringify(body)], { type: 'application/json' }));
  for (const url of keepImageUrls) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        // 기존 이미지 하나를 못 살리면 "이미지 없이 수정 성공"으로 조용히 넘어가지 않는다 — 보존
        // 실패를 성공으로 위장하면 사용자가 눈치 못 채는 새 그 이미지가 사라진다(§0.1②).
        return { success: false, message: '기존 이미지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' };
      }
      const blob = await res.blob();
      const name = url.split('/').pop()?.split('?')[0] || 'image.jpg';
      backendForm.append('files', blob, name);
    } catch {
      return { success: false, message: '기존 이미지를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }
  files.forEach((f) => backendForm.append('files', f as Blob));

  try {
    const res = await fetch(`${BACKEND}/api/posts/${postId}`, {
      method: 'PATCH',
      headers: await getAuthHeader(),
      body: backendForm,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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

export async function getCommentsAction(postId: number): Promise<{ success: boolean; data?: CommentsResponse; message?: string }> {
  if (!isValidId(postId)) {
    return { success: false, message: '잘못된 게시글 정보입니다.' };
  }
  try {
    const headers = await getAuthHeader();
    const res = await fetch(`${BACKEND}/api/posts/${postId}/comments`, {
      method: 'GET',
      headers,
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const json = (await res.json().catch(() => null)) as
      | { data?: unknown; message?: string }
      | null;
    if (!res.ok || !json) {
      return { success: false, message: json?.message ?? '댓글 목록 조회에 실패했습니다.' };
    }
    const raw = json.data as { totalCount: number; comments: CommentApiItem[] } | null;
    if (!raw || !Array.isArray(raw.comments)) {
      return { success: false, message: '댓글 목록 형식이 올바르지 않습니다.' };
    }
    return {
      success: true,
      data: {
        comments: raw.comments.map((c) => ({
          commentId: c.commentId,
          authorName: c.authorName,
          content: c.content,
          imageUrl: c.imageUrl,
          isAccepted: c.isAccepted,
          isMine: c.isMine,
          isDeleted: c.isDeleted,
          createdAt: c.createdAt,
          replies: (c.replies ?? []).map((r) => ({
            commentId: r.commentId,
            authorName: r.authorName,
            content: r.content,
            imageUrl: r.imageUrl,
            isMine: r.isMine,
            isDeleted: r.isDeleted,
            createdAt: r.createdAt,
          })),
        })),
      },
    };
  } catch {
    return { success: false, message: '댓글 목록 조회 중 오류가 발생했습니다.' };
  }
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
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json || json.httpStatus >= 400) {
      // C010: 커뮤니티 이용 권한 없음 (정지 계정 안전망)
      if (json?.errorCode === 'C010' || json?.errorCode === 'U015') {
        return { success: false, message: '커뮤니티 이용 권한이 없습니다. 계정 상태를 확인해주세요.' };
      }
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
  if (!isValidId(commentId)) {
    return { success: false, message: '잘못된 댓글 정보입니다.' };
  }
  const result = await updateComment(commentId, body);
  if (result.success) revalidatePath('/community', 'layout');
  return result;
}

export async function deleteCommentAction(commentId: number) {
  if (!isValidId(commentId)) {
    return { success: false, message: '잘못된 댓글 정보입니다.' };
  }
  const result = await deleteComment(commentId);
  if (result.success) revalidatePath('/community', 'layout');
  return result;
}

export async function acceptCommentAction(commentId: number) {
  if (!isValidId(commentId)) {
    return { success: false, message: '잘못된 댓글 정보입니다.' };
  }
  const result = await acceptComment(commentId);
  if (result.success) revalidatePath('/community', 'layout');
  return result;
}
