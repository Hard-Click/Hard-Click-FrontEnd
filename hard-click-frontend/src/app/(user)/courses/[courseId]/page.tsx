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
    // 구독 중이면 유료 강의도 결제 없이 수강(수강신청이 enroll). 조회 실패(미로그인·BE 500)는 미구독 취급.
    // ⚡최적화 대상: subscribed는 '유료·미수강·미구독'에서만 쓰여 무료·이미수강·비로그인 강의엔 불필요한
    //   /subscriptions/me+/plan 2콜이 발생한다. 다만 course 결과를 알기 전이라 여기선 무조건 호출하며,
    //   병렬이라 추가 wall-clock은 max(0, T_sub−T_course). 가드를 넣으면 정작 유료·미수강(결제 직전)에서
    //   구독 조회가 직렬화돼 오히려 느려지므로 미적용 — 단건 구독 캐시/플래그 API가 생기면 그때 정리.
    // statusKnown까지 같이 넘긴다 — 조회 실패를 '미구독'으로 확정하면 구독자가 재결제로 유도된다(§0.1④).
    getSubscriptionServer()
      .then((s) => ({ subscribed: s.subscribed, known: s.statusKnown }))
      .catch(() => ({ subscribed: false, known: false })),
  ]);

  // 강의 상세 응답엔 notices가 없어 별도 조회분을 합쳐 전달 (없음/삭제/비공개 화면은 Content가 처리)
  const initialCourse = course
    ? { ...course, notices: courseNotices }
    : course;

  return (
    <CourseDetailContent
      initialCourse={initialCourse}
      subscribed={subscribed.subscribed}
      subscriptionKnown={subscribed.known}
    />
  );
}
