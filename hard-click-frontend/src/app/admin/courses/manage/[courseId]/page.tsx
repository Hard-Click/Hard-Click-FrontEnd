import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';
import AdminCourseDetailContent from '@/features/admin/components/AdminCourseDetailContent';

export default async function AdminCourseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{
    from?: string;
    reportKey?: string;
    tab?: string;
    highlightReview?: string;
  }>;
}) {
  const { courseId } = await params;
  const { from, reportKey, tab, highlightReview } = await searchParams;

  const [course, courseNotices] = await Promise.all([
    getCourseDetailServer(Number(courseId)),
    getCourseNoticesServer(Number(courseId), { page: 0 }),
  ]);

  const initialCourse = course
    ? { ...course, notices: courseNotices.notices }
    : course;

  const fromReport = from === 'report';

  return (
    <AdminCourseDetailContent
      initialCourse={initialCourse}
      courseId={Number(courseId)}
      initialTab={tab === 'reviews' ? 'reviews' : undefined}
      backToReportKey={fromReport ? reportKey ?? '' : undefined}
      readOnly={fromReport}
      highlightReviewId={
        highlightReview && !Number.isNaN(Number(highlightReview))
          ? Number(highlightReview)
          : undefined
      }
    />
  );
}
