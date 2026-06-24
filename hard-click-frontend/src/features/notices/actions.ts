'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { getNoticeDetail, deleteNotice } from './services';
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

export async function deleteNoticeAction(noticeId: number) {
  return deleteNotice(noticeId);
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
  if (res.success) revalidatePath('/admin/notices');
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
  if (res.success) revalidatePath(`/admin/courses/manage/${courseId}/notices`);
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
