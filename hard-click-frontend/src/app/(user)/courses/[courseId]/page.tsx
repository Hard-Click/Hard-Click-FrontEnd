import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';
import CourseDetailContent from './CourseDetailContent';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  // 강의 상세 + 강의 공지를 서버에서 병렬 조회 (공지는 별도 /api/notices 엔드포인트)
  const [course, courseNotices] = await Promise.all([
    getCourseDetailServer(Number(courseId)),
    // 공지는 부가정보 — 조회 실패해도 강의 상세는 정상 노출되도록 빈 목록 폴백
    getCourseNoticesServer(Number(courseId), { page: 0 }).catch(() => ({
      notices: [],
    })),
  ]);

  // 강의 상세 응답엔 notices가 없어 별도 조회분을 합쳐 전달 (없음/삭제/비공개 화면은 Content가 처리)
  const initialCourse = course
    ? { ...course, notices: courseNotices.notices }
    : course;

  return <CourseDetailContent initialCourse={initialCourse} />;
}
