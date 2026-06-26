import { serverApi } from '@/lib/api';
import { SUBJECTS } from '@/features/courses/subjects';
import type { AdminRecentReport, AdminRecentNotice } from './types';
import type { AdminNoticeRow, AdminCourseRow, AdminCourseManageRow } from '@/mocks/admin.mock';
import type { NoticeApiItem, NoticeApiResponse } from '@/features/notices/types';
import type { CourseListApiItem, CourseListApiResponse } from '@/features/courses/types';
import { REASON_LABEL } from '@/features/reports/types';

const REPORT_TYPE_LABEL: Record<string, string> = {
  POST: '게시글',
  COMMENT: '댓글',
  REVIEW: '리뷰',
};
const REPORT_STATUS_LABEL: Record<string, string> = {
  PENDING: '대기 중',
  COMPLETED: '처리 완료',
  REJECTED: '반려',
};

interface AdminDashboardApiResponse {
  totalMemberCount: number;
  pendingReportCount: number;
  totalCourseCount: number;
  totalNoticeCount: number;
  recentReports: {
    reportId: number;
    targetType: string;
    targetTitle: string | null;
    reason: string | null;
    status: string;
    reportedAt: string;
  }[];
  recentNotices: {
    noticeId: number;
    title: string;
    isImportant: boolean;
    createdAt: string;
  }[];
}

export interface DashboardStats {
  totalMemberCount: number;
  pendingReportCount: number;
  totalCourseCount: number;
  totalNoticeCount: number;
}

export async function getDashboardData(): Promise<{
  stats: DashboardStats;
  recentReports: AdminRecentReport[];
  recentNotices: AdminRecentNotice[];
}> {
  const res = await serverApi.get<AdminDashboardApiResponse>('/api/admin/dashboard');

  if (!res.success || !res.data) throw new Error(res.message ?? '대시보드 조회에 실패했습니다.');

  const d = res.data;

  const stats: DashboardStats = {
    totalMemberCount: d.totalMemberCount,
    pendingReportCount: d.pendingReportCount,
    totalCourseCount: d.totalCourseCount,
    totalNoticeCount: d.totalNoticeCount,
  };

  const recentReports: AdminRecentReport[] = d.recentReports.map((r) => ({
    id: r.reportId,
    type: REPORT_TYPE_LABEL[r.targetType] ?? r.targetType,
    status: REPORT_STATUS_LABEL[r.status] ?? r.status,
    title: (r.reason ? (REASON_LABEL[r.reason] ?? r.reason) : null) ?? r.targetTitle?.slice(0, 20) ?? '',
    date: r.reportedAt?.replace('T', ' ').slice(0, 16) ?? '',
    reportKey: `${r.targetType}-${r.reportId}`,
  }));

  const recentNotices: AdminRecentNotice[] = d.recentNotices.map((n) => ({
    id: n.noticeId,
    badge: n.isImportant ? '중요' : '일반',
    title: n.title,
    date: n.createdAt?.split('T')[0] ?? n.createdAt,
  }));

  return { stats, recentReports, recentNotices };
}

function toCourseManageRow(item: CourseListApiItem): AdminCourseManageRow {
  return {
    id: item.courseId,
    title: item.title,
    subject: SUBJECTS.find((s) => s.value === item.subjectName)?.name ?? item.subjectName,
    instructor: item.instructorName,
    studentCount: item.studentCount,
    rating: item.averageRating,
    reviewCount: item.reviewCount,
    price: item.price,
    isFree: item.priceType === 'FREE',
    status: item.status === 'PUBLISHED' ? 'PUBLISHED' : 'HIDDEN',
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
  };
}

/** 전체 강의 목록 조회 (페이지네이션 루프) — 관리자 공통 */
export async function fetchAllAdminCourses(): Promise<AdminCourseManageRow[]> {
  const all: AdminCourseManageRow[] = [];
  let page = 0;
  while (true) {
    const res = await serverApi.get<CourseListApiResponse>(
      `/api/courses?page=${page}&size=50`,
    );
    if (!res.success || !res.data?.content.length) break;
    all.push(...res.data.content.map(toCourseManageRow));
    if (page + 1 >= (res.data.totalPages ?? 1)) break;
    page++;
  }
  return all;
}

function toAdminNoticeRow(
  item: NoticeApiItem,
  courseMetaMap: Map<string, { subject: string; instructor: string }>,
): AdminNoticeRow {
  const meta = item.courseName ? courseMetaMap.get(item.courseName) : undefined;
  return {
    id: item.noticeId,
    type: item.noticeType === 'GLOBAL' ? 'SYSTEM' : 'COURSE',
    title: item.title,
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
    content: '',
    isPinned: item.isPinned,
    isPublished: true,
    courseTitle: item.courseName ?? undefined,
    courseSubject: meta?.subject,
    courseInstructor: meta?.instructor,
  };
}

function toCourseRow(item: CourseListApiItem): AdminCourseRow {
  return {
    id: item.courseId,
    title: item.title,
    subject: SUBJECTS.find((s) => s.value === item.subjectName)?.name ?? item.subjectName,
    instructor: item.instructorName,
  };
}

export async function getAdminNoticesPageData(): Promise<{
  notices: AdminNoticeRow[];
  courses: AdminCourseRow[];
}> {
  const [globalRes, courseRes, coursesRes] = await Promise.all([
    serverApi.get<NoticeApiResponse>('/api/notices?type=GLOBAL&page=0&size=100'),
    serverApi.get<NoticeApiResponse>('/api/notices?type=COURSE&page=0&size=100'),
    serverApi.get<CourseListApiResponse>('/api/courses?page=0&size=100'),
  ]);

  if (!globalRes.success) throw new Error(globalRes.message ?? '전체 공지 조회에 실패했습니다.');

  const courseItems = coursesRes.success && coursesRes.data ? coursesRes.data.content : [];
  const courseMetaMap = new Map(
    courseItems.map((c) => [
      c.title,
      {
        subject: SUBJECTS.find((s) => s.value === c.subjectName)?.name ?? c.subjectName,
        instructor: c.instructorName,
      },
    ]),
  );

  const globalNotices = globalRes.data
    ? globalRes.data.content.map((n) => toAdminNoticeRow(n, courseMetaMap))
    : [];
  const courseNoticeRows = courseRes.data
    ? courseRes.data.content.map((n) => toAdminNoticeRow(n, courseMetaMap))
    : [];
  const notices = [...globalNotices, ...courseNoticeRows];

  const courses = courseItems.map(toCourseRow);

  return { notices, courses };
}
