'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { getNoticeDetail } from './services';
import type { NoticeWriteRequest } from './types';

type ActionResult<T = unknown> = { success: boolean; message?: string; data?: T };

function validateBody(body: NoticeWriteRequest): string | null {
  if (!body.title?.trim()) return '제목을 입력해주세요.';
  if (!body.content?.trim()) return '내용을 입력해주세요.';
  return null;
}

export async function getNoticeDetailAction(noticeId: number) {
  return getNoticeDetail(noticeId);
}

/**
 * 공지 삭제. Server Action은 Node 서버에서 실행되므로 브라우저 전용 axios(`services.ts`의
 * `deleteNotice`, baseURL:'' — window.location 기준 상대경로 해석)를 쓰면 origin이 없어
 * 연결 자체가 실패한다("서버와 연결할 수 없습니다"). 다른 액션들처럼 serverApi로 직접 호출.
 */
export async function deleteNoticeAction(noticeId: number): Promise<ActionResult<void>> {
  const res = await serverApi.delete<void>(`/api/notices/${noticeId}`);
  if (res.success) {
    revalidatePath('/admin/notices');
    revalidatePath('/instructor/notices');
    revalidatePath('/admin/dashboard');
  }
  return res;
}

export async function createGlobalNoticeAction(
  body: NoticeWriteRequest,
): Promise<ActionResult<{ noticeId: number }>> {
  const err = validateBody(body);
  if (err) return { success: false, message: err };

  const sanitized: NoticeWriteRequest = {
    title: body.title.trim(),
    content: body.content.trim(),
    isPinned: body.isPinned,
  };

  const res = await serverApi.post<{ noticeId: number }>('/api/notices', sanitized);
  if (res.success) {
    revalidatePath('/admin/notices');
    revalidatePath('/admin/dashboard');
  }
  return res;
}

export async function createCourseNoticeAction(
  courseId: number,
  body: NoticeWriteRequest,
): Promise<ActionResult<{ noticeId: number }>> {
  if (!Number.isFinite(courseId) || courseId <= 0)
    return { success: false, message: '유효하지 않은 강의입니다.' };
  const err = validateBody(body);
  if (err) return { success: false, message: err };

  const sanitized: NoticeWriteRequest = {
    title: body.title.trim(),
    content: body.content.trim(),
    isPinned: body.isPinned,
  };

  const res = await serverApi.post<{ noticeId: number }>(
    `/api/courses/${courseId}/notices`,
    sanitized,
  );
  if (res.success) {
    revalidatePath(`/admin/courses/manage/${courseId}/notices`);
    revalidatePath('/admin/dashboard');
  }
  return res;
}

export async function updateNoticeAction(
  noticeId: number,
  body: NoticeWriteRequest,
): Promise<ActionResult<void>> {
  if (!Number.isFinite(noticeId) || noticeId <= 0)
    return { success: false, message: '유효하지 않은 공지사항입니다.' };
  const err = validateBody(body);
  if (err) return { success: false, message: err };

  const sanitized: NoticeWriteRequest = {
    title: body.title.trim(),
    content: body.content.trim(),
    isPinned: body.isPinned,
  };

  const res = await serverApi.patch<void>(`/api/notices/${noticeId}`, sanitized);
  if (res.success) {
    revalidatePath('/admin/notices');
    revalidatePath('/admin/dashboard');
  }
  return res;
}
