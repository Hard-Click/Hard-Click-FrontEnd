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
  content: string;
  isPinned: boolean;
  isPublished: boolean;
  courseTitle?: string;
}

export const mockAdminNotices: AdminNoticeRow[] = [
  {
    id: 1,
    type: 'SYSTEM',
    title: '시스템 점검 안내 (2026년 5월 15일)',
    content:
      '5월 15일 02:00~04:00 시스템 점검이 진행됩니다. 해당 시간 동안 서비스 이용이 제한됩니다.',
    createdAt: '2026.05.10',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 2,
    type: 'SYSTEM',
    title: '신규 강의 오픈 이벤트 안내',
    content:
      '신규 강의 오픈 기념 할인 이벤트를 진행합니다. 자세한 내용은 이벤트 페이지를 확인해주세요.',
    createdAt: '2026.05.08',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 3,
    type: 'SYSTEM',
    title: '개인정보 처리방침 변경 안내',
    content:
      '개인정보 처리방침이 일부 변경되었습니다. 변경 사항을 확인해주시기 바랍니다.',
    createdAt: '2026.05.05',
    isPinned: false,
    isPublished: false,
  },
  {
    id: 4,
    type: 'COURSE',
    title: '수1 뿌시기 - 5주차 과제 안내',
    content:
      '5주차 과제를 업로드했습니다. 제출 기한은 다음 주 일요일까지입니다.',
    createdAt: '2026.05.11',
    isPinned: true,
    isPublished: true,
    courseTitle: '수1 뿌시기',
  },
  {
    id: 5,
    type: 'COURSE',
    title: '국어 머시기 - 보강 일정 공지',
    content: '이번 주 보강은 토요일 오후 2시에 진행됩니다. 참고 부탁드립니다.',
    createdAt: '2026.05.09',
    isPinned: false,
    isPublished: true,
    courseTitle: '국어 머시기',
  },
  {
    id: 6,
    type: 'COURSE',
    title: '미적분 머시기 - 자료 업로드',
    content: '강의 자료를 업로드했습니다. 학습 자료실에서 다운로드 가능합니다.',
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

// --- 강의 관리 ---
export type AdminCourseStatus = 'PUBLISHED' | 'HIDDEN' | 'DELETED';

export interface AdminCourseManageRow {
  id: number;
  title: string;
  subject: string;
  instructor: string;
  studentCount: number;
  rating: number;
  reviewCount: number;
  price: number;
  isFree: boolean;
  status: AdminCourseStatus;
  createdAt: string;
}

export const mockAdminCourseManage: AdminCourseManageRow[] = [
  {
    id: 1,
    title: 'React 완벽 가이드',
    subject: 'React',
    instructor: '김강사',
    studentCount: 89,
    rating: 4.8,
    reviewCount: 45,
    price: 99000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.05.10',
  },
  {
    id: 2,
    title: 'TypeScript 심화',
    subject: 'TypeScript',
    instructor: '이강사',
    studentCount: 67,
    rating: 4.7,
    reviewCount: 32,
    price: 89000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.05.08',
  },
  {
    id: 3,
    title: 'Node.js 백엔드 개발',
    subject: 'Node.js',
    instructor: '박강사',
    studentCount: 45,
    rating: 4.6,
    reviewCount: 28,
    price: 0,
    isFree: true,
    status: 'HIDDEN',
    createdAt: '2026.05.05',
  },
];
