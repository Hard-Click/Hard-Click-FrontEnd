import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticePreviewServer } from '@/features/notices/server';
import { getInstructorCoursesServer } from '@/features/instructor/server';
import InstructorCourseDetailContent from './InstructorCourseDetailContent';

export default async function InstructorCourseDetailPage({
  params,
}: {
  params: Promise<{ courseid: string }>;
}) {
  const { courseid } = await params;
  const id = Number(courseid);
  // 강의 상세 + 강의 공지(상위 3개·본문 보강) + 내 강의 목록(소유 판별용)을 서버에서 병렬 조회.
  // 공지는 목록 API가 content를 안 줘서, 학생 상세와 동일하게 미리보기 전용(상위 N개 상세 보강) 함수 사용.
  const [course, courseNotices, owned] = await Promise.all([
    getCourseDetailServer(id),
    getCourseNoticePreviewServer(id).catch(() => []),
    getInstructorCoursesServer(0, 100),
  ]);

  // 이 강의가 로그인 강사 "본인 강의"인지 — 관리 컨트롤(케밥 메뉴·공개 상태) 노출 여부 판단.
  // (BE 상세 응답엔 소유 필드가 없어 내 강의 목록 포함 여부로 판정)
  const isOwner = owned.content.some((c) => c.courseId === id);

  // 강의 상세 응답엔 notices가 없어 별도 조회분을 합쳐 전달 (없음/삭제/비공개 화면은 Content가 처리)
  const initialCourse = course
    ? { ...course, notices: courseNotices }
    : course;

  return (
    <InstructorCourseDetailContent
      initialCourse={initialCourse}
      isOwner={isOwner}
    />
  );
}
