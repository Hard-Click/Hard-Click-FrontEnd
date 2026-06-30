export const dynamic = 'force-dynamic';

import { getInstructorCoursesServer } from '@/features/instructor/server';
import MyCoursesContent, { type Course } from '@/features/instructor/components/MyCoursesContent';

export default async function MyCoursesPage() {
  // 서버에서 강사 내 강의 목록 확보 → 화면 표시용 Course로 변환
  const { content } = await getInstructorCoursesServer();
  const courses: Course[] = content.filter((c) => c.status !== 'DELETED').map((c) => ({
    id: c.courseId,
    category: c.subjectName,
    title: c.title,
    isPublic: c.status === 'PUBLISHED',
    students: c.enrollmentCount,
    rating: c.averageRating,
    reviewCount: c.reviewCount,
    createdAt: c.createdAt.split('T')[0] ?? c.createdAt,
    price: c.price === 0 ? '무료' : `${c.price.toLocaleString()}원`,
    thumbnailUrl: c.thumbnailUrl,
  }));

  return <MyCoursesContent courses={courses} />;
}
