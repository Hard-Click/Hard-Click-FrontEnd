import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticePreviewServer } from '@/features/notices/server';
import { getSubscriptionServer } from '@/features/subscriptions/server';
import CourseDetailContent from './CourseDetailContent';

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  // 잘못된 courseId(비숫자 등)는 NaN을 서버 호출로 흘리지 않고 "없는 강의"로 처리
  const parsedCourseId = Number(courseId);
  if (!Number.isInteger(parsedCourseId) || parsedCourseId <= 0) {
    return <CourseDetailContent initialCourse={null} />;
  }
  // 강의 상세 + 강의 공지(상위 3개·본문 보강) + 구독 상태를 서버에서 병렬 조회
  const [course, courseNotices, subscribed] = await Promise.all([
    getCourseDetailServer(parsedCourseId),
    // 공지는 부가정보 — 조회 실패해도 강의 상세는 정상 노출되도록 빈 목록 폴백
    getCourseNoticePreviewServer(parsedCourseId).catch(() => []),
    // 구독 중이면 유료 강의도 결제 없이 학습 가능(BE VideoAccessService: enrolled||subscribed).
    // 조회 실패(미로그인·BE 500)는 미구독으로 취급 → 기존 결제 흐름 유지
    getSubscriptionServer()
      .then((s) => s.subscribed)
      .catch(() => false),
  ]);

  // 강의 상세 응답엔 notices가 없어 별도 조회분을 합쳐 전달 (없음/삭제/비공개 화면은 Content가 처리)
  const initialCourse = course
    ? { ...course, notices: courseNotices }
    : course;

  return (
    <CourseDetailContent initialCourse={initialCourse} subscribed={subscribed} />
  );
}
