export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface NoticeDetail {
  noticeId: number;
  noticeType: 'GLOBAL' | 'COURSE';
  courseName: string | null;
  title: string;
  content: string;
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
  previousNotice: { noticeId: number; title: string } | null;
}

/** 공지 작성/수정 요청 body (POST/PATCH 공통) */
export interface NoticeWriteRequest {
  title: string;
  content: string;
  isPinned: boolean;
}
