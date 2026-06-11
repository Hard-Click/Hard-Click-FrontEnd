export interface AdminRecentReport {
  id: number;
  type: string;
  status: string;
  title: string;
  date: string;
}

export interface AdminRecentNotice {
  id: number;
  badge: string;
  title: string;
  date: string;
}

export const mockRecentReports: AdminRecentReport[] = [
  {
    id: 1,
    type: '게시글',
    status: '대기 중',
    title: '부적절한 언어 사용',
    date: '2026.05.12 14:30',
  },
  {
    id: 2,
    type: '댓글',
    status: '대기 중',
    title: '욕설 및 비방',
    date: '2026.05.12 13:15',
  },
  {
    id: 3,
    type: '리뷰',
    status: '대기 중',
    title: '스팸/광고',
    date: '2026.05.12 11:20',
  },
];

export const mockRecentNotices: AdminRecentNotice[] = [
  { id: 1, badge: '중요', title: '서버 점검 안내', date: '2026.05.11 09:00' },
  {
    id: 2,
    badge: '일반',
    title: '강의 정책 업데이트',
    date: '2026.05.10 14:00',
  },
  {
    id: 3,
    badge: '중요',
    title: '개인정보 처리방침 변경',
    date: '2026.05.08 10:30',
  },
];
