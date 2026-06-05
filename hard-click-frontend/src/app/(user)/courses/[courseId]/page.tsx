import { getCourseDetailServer } from '@/features/courses/server';
import CourseDetailContent from './CourseDetailContent';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  // 서버에서 강의 상세 확보 (없음/삭제/비공개 화면은 Content가 처리)
  const course = await getCourseDetailServer(Number(courseId));

  return <CourseDetailContent initialCourse={course} />;
}
