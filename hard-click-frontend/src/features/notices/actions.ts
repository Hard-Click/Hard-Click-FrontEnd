'use server';

import { revalidatePath } from 'next/cache';
import { serverApi } from '@/lib/api';
import { getNoticeDetail, deleteNotice } from './services';
import type { NoticeWriteRequest } from './types';

export async function getNoticeDetailAction(noticeId: number) {
  return getNoticeDetail(noticeId);
}

export async function deleteNoticeAction(noticeId: number) {
  return deleteNotice(noticeId);
}

export async function createGlobalNoticeAction(body: NoticeWriteRequest) {
  const res = await serverApi.post<{ noticeId: number }>('/api/notices', body);
  if (res.success) revalidatePath('/admin/notices');
  return res;
}

export async function createCourseNoticeAction(
  courseId: number,
  body: NoticeWriteRequest,
) {
  const res = await serverApi.post<{ noticeId: number }>(
    `/api/courses/${courseId}/notices`,
    body,
  );
  if (res.success)
    revalidatePath(`/admin/courses/manage/${courseId}/notices`);
  return res;
}

export async function updateNoticeAction(
  noticeId: number,
  body: NoticeWriteRequest,
) {
  const res = await serverApi.patch<void>(`/api/notices/${noticeId}`, body);
  if (res.success) {
    revalidatePath('/admin/notices');
    revalidatePath('/admin/dashboard');
  }
  return res;
}
