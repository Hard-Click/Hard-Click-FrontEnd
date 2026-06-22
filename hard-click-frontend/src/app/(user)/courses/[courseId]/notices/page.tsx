import CourseNoticeList from '@/features/notices/components/CourseNoticeList';
import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';

export default async function CourseNoticesPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ page?: string; keyword?: string }>;
}) {
  const { courseId: courseIdStr } = await params;
  const sp = await searchParams;
  const courseId = Number(courseIdStr);
  const page = Math.max(0, Number(sp.page ?? '0') || 0);
  const keyword = sp.keyword ?? '';

  if (Number.isNaN(courseId)) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  // 서버에서 강의 정보 + 강의 공지(검색/페이징) 동시 확보
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
      noticeBasePath="/notices"
      backHref={`/courses/${courseId}`}
    />
  );
}
