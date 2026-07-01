import Link from 'next/link';
import RecentCourseCard from './RecentCourseCard';

export interface RecentCourse {
  id: number;
  title: string;
  isPublic: boolean;
  students: number;
  createdAt: string;
}

// Server-First: 데이터는 서버(대시보드 페이지)에서 조회해 props로 받는다. (useEffect 클라 페칭 제거)
export default function RecentCourseSection({
  courses,
}: {
  courses: RecentCourse[];
}) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1E293B]">최근 등록 강의</h2>
        <Link
          href="/instructor/myCourses"
          className="text-base font-semibold text-[#2F5DAA]"
        >
          전체보기
        </Link>
      </div>

      {/* list */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <p className="text-sm text-center text-[#9CA3AF] py-6">
            등록된 강의가 없습니다.
          </p>
        ) : (
          courses.map((course) => (
            <RecentCourseCard
              key={course.id}
              courseId={course.id}
              title={course.title}
              isPublic={course.isPublic}
              students={course.students}
              createdAt={course.createdAt}
            />
          ))
        )}
      </div>
    </section>
  );
}
