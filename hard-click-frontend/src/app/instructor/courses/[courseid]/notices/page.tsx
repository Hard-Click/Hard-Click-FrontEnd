import CourseNoticeList from '@/features/notices/components/CourseNoticeList';
import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';

// 강사 레이아웃(헤더 유지) 하에서 학생과 동일한 강의별 공지 목록을 표시한다.
export default async function InstructorCourseNoticesPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseid: string }>;
  searchParams: Promise<{ page?: string; keyword?: string }>;
}) {
  const { courseid } = await params;
  const sp = await searchParams;
  const courseId = Number(courseid);
  const page = Number(sp.page ?? '0') || 0;
  const keyword = sp.keyword ?? '';

  const [course, { notices, totalPages }] = await Promise.all([
    getCourseDetailServer(courseId),
    getCourseNoticesServer(courseId, { page, keyword: keyword || undefined }),
  ]);

  if (!course) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  return (
    <CourseNoticeList
      courseTitle={course.title}
      instructorName={course.instructorName}
      notices={notices}
      totalPages={totalPages}
      page={page}
      keyword={keyword}
      noticeBasePath={`/instructor/courses/${courseId}/notices`}
      backHref={`/instructor/courses/${courseId}`}
    />
  );
}
