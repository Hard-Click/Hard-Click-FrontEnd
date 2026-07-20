export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
  isRead: boolean;
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

/* ───── 백엔드 응답 명세 (GET /api/notices) ───── */
export interface NoticeApiItem {
  noticeId: number;
  noticeType: 'GLOBAL' | 'COURSE';
  courseName: string | null;
  title: string;
  isPinned: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface NoticeApiResponse {
  content: NoticeApiItem[];
  totalPages: number;
}
