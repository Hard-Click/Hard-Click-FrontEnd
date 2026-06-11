import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';
import InstructorCourseDetailContent from './InstructorCourseDetailContent';

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseid: string }>;
}) {
  const { courseid } = await params;
  // 강의 상세 + 강의 공지를 서버에서 병렬 조회 (공지는 별도 /api/notices 엔드포인트)
  const [course, courseNotices] = await Promise.all([
    getCourseDetailServer(Number(courseid)),
    getCourseNoticesServer(Number(courseid), { page: 0 }),
  ]);

  // 강의 상세 응답엔 notices가 없어 별도 조회분을 합쳐 전달 (없음/삭제/비공개 화면은 Content가 처리)
  const initialCourse = course
    ? { ...course, notices: courseNotices.notices }
    : course;

  return <InstructorCourseDetailContent initialCourse={initialCourse} />;
}
