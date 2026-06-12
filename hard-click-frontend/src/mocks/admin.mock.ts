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

export interface AdminNoticeRow {
  id: number;
  type: 'SYSTEM' | 'COURSE';
  title: string;
  createdAt: string;
  isPinned: boolean;
  isPublished: boolean;
  courseTitle?: string;
}

export const mockAdminNotices: AdminNoticeRow[] = [
  // 시스템 공지
  {
    id: 1,
    type: 'SYSTEM',
    title: '시스템 점검 안내 (2026년 5월 15일)',
    createdAt: '2026.05.10',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 2,
    type: 'SYSTEM',
    title: '신규 강의 오픈 이벤트 안내',
    createdAt: '2026.05.08',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 3,
    type: 'SYSTEM',
    title: '개인정보 처리방침 변경 안내',
    createdAt: '2026.05.05',
    isPinned: false,
    isPublished: false,
  },
  // 강의 공지
  {
    id: 4,
    type: 'COURSE',
    title: '수1 뿌시기 - 5주차 과제 안내',
    createdAt: '2026.05.11',
    isPinned: true,
    isPublished: true,
    courseTitle: '수1 뿌시기',
  },
  {
    id: 5,
    type: 'COURSE',
    title: '국어 머시기 - 보강 일정 공지',
    createdAt: '2026.05.09',
    isPinned: false,
    isPublished: true,
    courseTitle: '국어 머시기',
  },
  {
    id: 6,
    type: 'COURSE',
    title: '미적분 머시기 - 자료 업로드',
    createdAt: '2026.05.07',
    isPinned: false,
    isPublished: false,
    courseTitle: '미적분 머시기',
  },
];

export interface AdminCourseRow {
  id: number;
  title: string;
  subject: string;
  instructor: string;
}

export const mockAdminCourses: AdminCourseRow[] = [
  { id: 1, title: '수1 뿌시기', subject: '수학Ⅰ', instructor: '김강사' },
  { id: 2, title: '국어 머시기', subject: '독서', instructor: '안강사' },
  { id: 3, title: '미적분 머시기', subject: '미적분', instructor: '김강사' },
  {
    id: 4,
    title: '사회문화 머시기',
    subject: '사회·문화',
    instructor: '박강사',
  },
];
