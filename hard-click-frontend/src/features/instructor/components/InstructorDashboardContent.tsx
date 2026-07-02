import Image from 'next/image';
import RecentCourseSection, { type RecentCourse } from './RecentCourseSection';
import InstructorStatsCard from './InstructorStatsCard';
import {
  getInstructorCoursesServer,
  getInstructorDashboardServer,
} from '../server';

// Server Component: 통계·최근 등록 강의를 서버에서 조회해 props로 전달 (useEffect 클라 페칭 제거)
export default async function InstructorDashboardContent() {
  const [{ content }, stats] = await Promise.all([
    getInstructorCoursesServer(0, 3),
    getInstructorDashboardServer(),
  ]);
  const recentCourses: RecentCourse[] = content
    .filter((c) => c.status !== 'DELETED')
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 3)
    .map((c) => ({
      id: c.courseId,
      title: c.title,
      isPublic: c.status === 'PUBLISHED',
      students: c.enrollmentCount,
      createdAt: c.createdAt.split('T')[0].replaceAll('-', '.'),
    }));

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        {/* 헤더 */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <Image
              src="/icons/dashboardIcon.svg"
              alt="dashboard"
              width={36}
              height={36}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#1E293B]">강사 대시보드</h1>
            <p className="mt-1 text-sm text-[#64748B]">
              강의와 수강생을 한눈에 관리하세요.
            </p>
          </div>
        </div>

        {/* 스탯 카드 */}
        <div className="mb-8">
          <InstructorStatsCard stats={stats} />
        </div>

        {/* 최근 등록 강의 */}
        <RecentCourseSection courses={recentCourses} />
      </div>
    </div>
  );
}
