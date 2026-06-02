export interface Notice {
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface NoticeDetail {
  noticeId: number;
  title: string;
  content: string;
  authorName: string;
  noticeType: 'GLOBAL' | 'COURSE';
  isPinned: boolean;
  createdAt: string;
}
