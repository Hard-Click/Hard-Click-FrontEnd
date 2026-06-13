import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';
import AdminCourseDetailContent from '@/features/admin/components/AdminCourseDetailContent';

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  // 강의 상세 + 강의 공지를 서버에서 병렬 조회
  const [course, courseNotices] = await Promise.all([
    getCourseDetailServer(Number(courseId)),
    getCourseNoticesServer(Number(courseId), { page: 0 }),
  ]);

  const initialCourse = course
    ? { ...course, notices: courseNotices.notices }
    : course;

  return <AdminCourseDetailContent initialCourse={initialCourse} courseId={Number(courseId)} />;
}
