import { getNoticeDetail, deleteNotice } from './services';

export async function getNoticeDetailAction(noticeId: number) {
  return getNoticeDetail(noticeId);
}

export async function deleteNoticeAction(noticeId: number) {
  return deleteNotice(noticeId);
}
