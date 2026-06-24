import { mockReportList, type ReportApiItem } from './reports.mock';
import type { AdminRecentReport, AdminRecentNotice } from '@/features/admin/types';

export type { AdminRecentReport, AdminRecentNotice } from '@/features/admin/types';

// 신고 대상/상태 → 표시 라벨
const REPORT_TYPE_LABEL: Record<ReportApiItem['targetType'], string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
};
const REPORT_STATUS_LABEL: Record<ReportApiItem['status'], string> = {
  PENDING: '대기 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려',
};

// 대시보드 '최근 신고'는 신고 관리탭과 동일한 중앙 mock에서 파생 → 딥링크 키 정합성 유지
export const mockRecentReports: AdminRecentReport[] = mockReportList.content
  .slice(0, 3)
  .map((r, idx) => ({
    id: idx + 1,
    type: REPORT_TYPE_LABEL[r.targetType],
    status: REPORT_STATUS_LABEL[r.status],
    title: r.reasonStats[0]?.reason ?? '-',
    date: r.createdAt,
    reportKey: `${r.targetType}-${r.targetId}`,
  }));

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
  courseSubject?: string;
  courseInstructor?: string;
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
    courseSubject: '수학Ⅰ',
    courseInstructor: '김강사',
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
    courseSubject: '독서',
    courseInstructor: '안강사',
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
    courseSubject: '미적분',
    courseInstructor: '김강사',
  },
  {
    id: 7,
    type: 'SYSTEM',
    title: '결제 시스템 점검 안내',
    content: '결제 시스템 점검으로 일시적으로 결제가 제한될 수 있습니다.',
    createdAt: '2026.05.04',
    isPinned: false,
    isPublished: true,
  },
  {
    id: 8,
    type: 'SYSTEM',
    title: '신규 기능 업데이트 안내',
    content: '학습 통계 기능이 추가되었습니다. 마이페이지에서 확인하세요.',
    createdAt: '2026.05.03',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 9,
    type: 'SYSTEM',
    title: '비밀번호 보안 정책 변경',
    content: '비밀번호는 8자 이상, 특수문자를 포함해야 합니다.',
    createdAt: '2026.05.02',
    isPinned: false,
    isPublished: true,
  },
  {
    id: 10,
    type: 'SYSTEM',
    title: '모바일 앱 출시 안내',
    content: 'FLOWN 모바일 앱이 출시되었습니다. 지금 다운로드하세요.',
    createdAt: '2026.05.01',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 11,
    type: 'SYSTEM',
    title: '커뮤니티 이용 수칙 안내',
    content: '건전한 커뮤니티 문화를 위한 이용 수칙을 안내드립니다.',
    createdAt: '2026.04.29',
    isPinned: false,
    isPublished: true,
  },
  {
    id: 12,
    type: 'SYSTEM',
    title: '환불 정책 변경 안내',
    content: '수강 7일 이내 환불 정책이 일부 변경되었습니다.',
    createdAt: '2026.04.27',
    isPinned: false,
    isPublished: false,
  },
  {
    id: 13,
    type: 'SYSTEM',
    title: '설 연휴 고객센터 운영 안내',
    content: '설 연휴 기간 고객센터 운영 일정을 안내드립니다.',
    createdAt: '2026.04.25',
    isPinned: false,
    isPublished: true,
  },
  {
    id: 14,
    type: 'SYSTEM',
    title: '쿠폰 이벤트 종료 안내',
    content: '신규 가입 쿠폰 이벤트가 곧 종료됩니다.',
    createdAt: '2026.04.23',
    isPinned: false,
    isPublished: true,
  },
  {
    id: 15,
    type: 'SYSTEM',
    title: '서비스 약관 개정 안내',
    content: '서비스 이용 약관이 개정되어 안내드립니다.',
    createdAt: '2026.04.20',
    isPinned: true,
    isPublished: true,
  },
  {
    id: 16,
    type: 'COURSE',
    title: '수1 뿌시기 - 6주차 과제 안내',
    content: '6주차 과제를 업로드했습니다. 기한을 확인해주세요.',
    createdAt: '2026.05.06',
    isPinned: false,
    isPublished: true,
    courseTitle: '수1 뿌시기',
    courseSubject: '수학Ⅰ',
    courseInstructor: '김강사',
  },
  {
    id: 17,
    type: 'COURSE',
    title: '국어 머시기 - 모의고사 일정',
    content: '이번 주 모의고사 일정을 공지합니다.',
    createdAt: '2026.05.05',
    isPinned: true,
    isPublished: true,
    courseTitle: '국어 머시기',
    courseSubject: '독서',
    courseInstructor: '안강사',
  },
  {
    id: 18,
    type: 'COURSE',
    title: '미적분 머시기 - 질문 답변 안내',
    content: '자주 묻는 질문에 대한 답변을 정리했습니다.',
    createdAt: '2026.05.04',
    isPinned: false,
    isPublished: true,
    courseTitle: '미적분 머시기',
    courseSubject: '미적분',
    courseInstructor: '김강사',
  },
  {
    id: 19,
    type: 'COURSE',
    title: '사회문화 머시기 - 보충 자료',
    content: '보충 학습 자료를 추가했습니다.',
    createdAt: '2026.05.03',
    isPinned: false,
    isPublished: false,
    courseTitle: '사회문화 머시기',
    courseSubject: '사회·문화',
    courseInstructor: '박강사',
  },
  {
    id: 20,
    type: 'COURSE',
    title: '수1 뿌시기 - 중간 점검 안내',
    content: '중간 점검 테스트가 진행됩니다.',
    createdAt: '2026.05.01',
    isPinned: false,
    isPublished: true,
    courseTitle: '수1 뿌시기',
    courseSubject: '수학Ⅰ',
    courseInstructor: '김강사',
  },
  {
    id: 21,
    type: 'COURSE',
    title: '국어 머시기 - 첨삭 일정 안내',
    content: '첨삭 일정을 공지합니다.',
    createdAt: '2026.04.28',
    isPinned: false,
    isPublished: true,
    courseTitle: '국어 머시기',
    courseSubject: '독서',
    courseInstructor: '안강사',
  },
  {
    id: 22,
    type: 'COURSE',
    title: '미적분 머시기 - 보강 안내',
    content: '보강 일정을 안내드립니다.',
    createdAt: '2026.04.26',
    isPinned: true,
    isPublished: true,
    courseTitle: '미적분 머시기',
    courseSubject: '미적분',
    courseInstructor: '김강사',
  },
  {
    id: 23,
    type: 'COURSE',
    title: '사회문화 머시기 - 과제 마감 임박',
    content: '과제 제출 마감이 임박했습니다.',
    createdAt: '2026.04.24',
    isPinned: false,
    isPublished: true,
    courseTitle: '사회문화 머시기',
    courseSubject: '사회·문화',
    courseInstructor: '박강사',
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
  description?: string;
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
  {
    id: 4,
    title: 'Next.js 실전 프로젝트',
    subject: 'Next.js',
    instructor: '김강사',
    studentCount: 120,
    rating: 4.9,
    reviewCount: 60,
    price: 120000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.05.03',
  },
  {
    id: 5,
    title: 'CSS 레이아웃 마스터',
    subject: 'CSS',
    instructor: '이강사',
    studentCount: 78,
    rating: 4.5,
    reviewCount: 40,
    price: 55000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.05.01',
  },
  {
    id: 6,
    title: 'JavaScript 기초 완성',
    subject: 'JavaScript',
    instructor: '박강사',
    studentCount: 230,
    rating: 4.8,
    reviewCount: 95,
    price: 0,
    isFree: true,
    status: 'PUBLISHED',
    createdAt: '2026.04.28',
  },
  {
    id: 7,
    title: 'React 상태관리 심화',
    subject: 'React',
    instructor: '김강사',
    studentCount: 56,
    rating: 4.7,
    reviewCount: 30,
    price: 89000,
    isFree: false,
    status: 'HIDDEN',
    createdAt: '2026.04.25',
  },
  {
    id: 8,
    title: 'HTML 시맨틱 마크업',
    subject: 'HTML',
    instructor: '이강사',
    studentCount: 142,
    rating: 4.4,
    reviewCount: 50,
    price: 0,
    isFree: true,
    status: 'PUBLISHED',
    createdAt: '2026.04.22',
  },
  {
    id: 9,
    title: 'TypeScript 제네릭 정복',
    subject: 'TypeScript',
    instructor: '최강사',
    studentCount: 38,
    rating: 4.6,
    reviewCount: 18,
    price: 99000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.04.20',
  },
  {
    id: 10,
    title: 'Spring Boot 입문',
    subject: 'Spring',
    instructor: '박강사',
    studentCount: 67,
    rating: 4.5,
    reviewCount: 33,
    price: 110000,
    isFree: false,
    status: 'HIDDEN',
    createdAt: '2026.04.18',
  },
  {
    id: 11,
    title: '데이터베이스 설계 기초',
    subject: 'Database',
    instructor: '최강사',
    studentCount: 49,
    rating: 4.3,
    reviewCount: 22,
    price: 75000,
    isFree: false,
    status: 'PUBLISHED',
    createdAt: '2026.04.15',
  },
  {
    id: 12,
    title: 'Git & GitHub 협업',
    subject: 'Git',
    instructor: '김강사',
    studentCount: 188,
    rating: 4.9,
    reviewCount: 80,
    price: 0,
    isFree: true,
    status: 'PUBLISHED',
    createdAt: '2026.04.12',
  },
  {
    id: 13,
    title: 'Vue.js 기초부터 실전까지',
    subject: 'Vue',
    instructor: '이강사',
    studentCount: 41,
    rating: 4.4,
    reviewCount: 19,
    price: 85000,
    isFree: false,
    status: 'HIDDEN',
    createdAt: '2026.04.10',
  },
];

import { SUBJECTS } from '@/constants/subjects';

export const mockAdminSubjectOptions = [
  { label: '전체', value: '' },
  ...SUBJECTS.map((s) => ({ label: s.name, value: s.name })),
];

export const mockAdminInstructorOptions = [
  { label: '전체', value: '' },
  { label: '김강사', value: '김강사' },
  { label: '안강사', value: '안강사' },
  { label: '이강사', value: '이강사' },
  { label: '박강사', value: '박강사' },
  { label: '최강사', value: '최강사' },
];
