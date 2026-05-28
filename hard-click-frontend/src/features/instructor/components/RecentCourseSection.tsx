import RecentCourseCard from './RecentCourseCard';

export default function RecentCourseSection() {
  // 나중에 연동하면 지우기!!!
  const recentCourses = [
    {
      id: 1,
      title: 'React 완벽 가이드',
      isPublic: true,
      students: 89,
      createdAt: '2026.05.10',
    },
    {
      id: 2,
      title: 'TypeScript 심화',
      isPublic: true,
      students: 67,
      createdAt: '2026.05.08',
    },
    {
      id: 3,
      title: 'Node.js 백엔드',
      isPublic: false,
      students: 45,
      createdAt: '2026.05.05',
    },
  ];

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1E293B]">최근 등록 강의</h2>

        <button
          type="button"
          className="text-base font-semibold text-[#2F5DAA]"
        >
          전체보기
        </button>
      </div>

      {/* list */}
      <div className="space-y-4">
        {recentCourses.map((course) => (
          <RecentCourseCard
            key={course.id}
            courseId={course.id}
            title={course.title}
            isPublic={course.isPublic}
            students={course.students}
            createdAt={course.createdAt}
          />
        ))}
      </div>
    </section>
  );
}
