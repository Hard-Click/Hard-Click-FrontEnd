export const dynamic = 'force-dynamic';

import AdminNoticeManage from '@/features/admin/components/AdminNoticeManage';
import type { AdminNoticeRow, AdminCourseRow } from '@/mocks/admin.mock';
import { serverApi } from '@/lib/api';
import { SUBJECTS } from '@/features/courses/subjects';
import type { NoticeApiItem, NoticeApiResponse } from '@/features/notices/types';
import type { CourseListApiItem, CourseListApiResponse } from '@/features/courses/types';

function toAdminNoticeRow(item: NoticeApiItem): AdminNoticeRow {
  return {
    id: item.noticeId,
    type: item.noticeType === 'GLOBAL' ? 'SYSTEM' : 'COURSE',
    title: item.title,
    createdAt: item.createdAt.split('T')[0] ?? item.createdAt,
    content: '',
    isPinned: item.isPinned,
    isPublished: true,
    courseTitle: item.courseName ?? undefined,
  };
}

function toAdminCourseRow(item: CourseListApiItem): AdminCourseRow {
  const subjectLabel =
    SUBJECTS.find((s) => s.value === item.subjectName)?.name ?? item.subjectName;
  return {
    id: item.courseId,
    title: item.title,
    subject: subjectLabel,
    instructor: item.instructorName,
  };
}

export default async function AdminNoticesPage() {
  const [globalRes, courseRes, coursesRes] = await Promise.all([
    serverApi.get<NoticeApiResponse>('/api/notices?type=GLOBAL&page=0&size=100'),
    serverApi.get<NoticeApiResponse>('/api/notices?type=COURSE&page=0&size=100'),
    serverApi.get<CourseListApiResponse>('/api/courses?page=0&size=100'),
  ]);

  const globalNotices =
    globalRes.success && globalRes.data
      ? globalRes.data.content.map(toAdminNoticeRow)
      : [];

  const courseNotices =
    courseRes.success && courseRes.data
      ? courseRes.data.content.map(toAdminNoticeRow)
      : [];

  const notices = [...globalNotices, ...courseNotices];

  const courses =
    coursesRes.success && coursesRes.data
      ? coursesRes.data.content.map(toAdminCourseRow)
      : [];

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <AdminNoticeManage notices={notices} courses={courses} />
      </div>
    </div>
  );
}
