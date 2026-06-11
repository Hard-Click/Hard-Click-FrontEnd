import RecentCourseCard from '@/features/instructor/components/RecentCourseCard';
import { getInstructorCoursesServer } from '@/features/instructor/server';

/**
 * 강사 퀴즈 관리 — 강의 목록 페이지 (Server Component).
 * 헤더 "퀴즈" 진입 시 본인 강의 목록을 보여주고, 각 강의 [조회]로
 * 강의별 퀴즈 목록(/instructor/quizzes/[courseId], 후속 이슈)으로 이동한다.
 * 데이터는 서버에서 조회(Server-First) — useEffect 페칭 X.
 */
export default async function InstructorQuizzesPage() {
  const { content } = await getInstructorCoursesServer();

  const courses = content.map((c) => ({
    courseId: c.courseId,
    title: c.title,
    isPublic: c.status === 'PUBLISHED',
    students: c.enrollmentCount,
    createdAt: c.createdAt.split('T')[0].replaceAll('-', '.'),
  }));

  return (
    <div className="mx-auto max-w-[1253px] px-8 py-8">
      {/* 헤더 */}
      <header className="mb-8 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-[26px] bg-[#2F5DAA]">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="M9 12h6M9 16h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-[0.4px] text-[#1F2937]">
              퀴즈 관리
            </h1>
            <p className="mt-1 text-base text-[#4B5563]">
              본인 강의의 퀴즈를 등록하고 관리하세요.
            </p>
          </div>
        </div>

        {/* TODO: 등록 모달 연결 — 후속 이슈(퀴즈 등록) */}
        <button
          type="button"
          className="flex h-12 items-center gap-1.5 rounded-[10px] bg-[#2F5DAA] px-5 text-base font-semibold text-white transition hover:bg-[#274C8B]"
        >
          <span className="text-lg leading-none">+</span> 퀴즈 등록
        </button>
      </header>

      {/* 내 강의 목록 */}
      <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <h2 className="mb-6 text-xl font-bold text-[#1F2937]">내 강의</h2>

        {courses.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#9CA3AF]">
            등록된 강의가 없습니다.
          </p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <RecentCourseCard
                key={course.courseId}
                courseId={course.courseId}
                title={course.title}
                isPublic={course.isPublic}
                students={course.students}
                createdAt={course.createdAt}
                actionLabel="조회"
                actionHref={`/instructor/quizzes/${course.courseId}`}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
