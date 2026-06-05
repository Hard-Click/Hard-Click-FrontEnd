import { getCourseDetailServer } from '@/features/courses/server';
import InstructorCourseDetailContent from './InstructorCourseDetailContent';

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseid: string }>;
}) {
  const { courseid } = await params;
  // 서버에서 강의 상세 확보 (없음/삭제/비공개 화면은 Content가 처리)
  const course = await getCourseDetailServer(Number(courseid));

  return <InstructorCourseDetailContent initialCourse={course} />;
}
