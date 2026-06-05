import { getMyCompletedCoursesServer } from '@/features/users/server';
import { getMyActivitiesServer } from '@/features/mypage/server';
import CompletedCoursesContent from './CompletedCoursesContent';

export default async function CompletedCoursesPage() {
  // 서버에서 완료 강의 + 내 수강평(리뷰 작성 여부 판단) 동시 확보
  const [completed, activities] = await Promise.all([
    getMyCompletedCoursesServer(),
    getMyActivitiesServer(),
  ]);
  const reviewedCourseIds = activities
    ? activities.reviews.map((r) => r.courseId)
    : [];

  return (
    <CompletedCoursesContent
      completed={completed}
      reviewedCourseIds={reviewedCourseIds}
    />
  );
}
