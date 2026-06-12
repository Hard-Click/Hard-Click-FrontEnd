import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getEnrolledCoursesServer,
  getStudentQuizzesServer,
} from '@/features/quizzes/studentServer';
import StudentQuizCourseFilter from '@/features/quizzes/components/StudentQuizCourseFilter';
import StudentQuizListItem from '@/features/quizzes/components/StudentQuizListItem';

/** 통계 카드 아이콘 (lucide 스타일) */
const STAT_ICONS = {
  total: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F5DAA" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  done: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  ),
  avg: (
    <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
};

/**
 * 수강생 퀴즈 목록 (Server Component) — `/quizzes/[courseId]`.
 * 과목 선택 + 통계(전체·완료·평균) + 주차별 퀴즈(응시/해설보기). 데이터·집계는 서버, 필터만 client.
 */
export default async function StudentQuizzesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId: courseIdStr } = await params;
  const courseId = Number(courseIdStr);

  const [courses, quizzes] = await Promise.all([
    getEnrolledCoursesServer(),
    getStudentQuizzesServer(courseId),
  ]);
  // 수강 중이 아닌 강의면 404
  if (!courses.some((c) => c.courseId === courseId)) notFound();

  const attempted = quizzes.filter((q) => q.attempted);
  const scored = attempted
    .map((q) => q.score)
    .filter((s): s is number => s !== null);
  const average = scored.length
    ? Math.round(scored.reduce((sum, s) => sum + s, 0) / scored.length)
    : 0;

  const cards = [
    { label: '전체 퀴즈', value: `${quizzes.length}개`, bg: 'bg-[#2F5DAA1a]', icon: STAT_ICONS.total },
    { label: '완료', value: `${attempted.length}개`, bg: 'bg-[#16A34A1a]', icon: STAT_ICONS.done },
    { label: '평균 점수', value: `${average}점`, bg: 'bg-[#F59E0B1a]', icon: STAT_ICONS.avg },
  ];

  return (
    <div className="mx-auto max-w-[1152px] px-8 py-8">
      {/* 헤더 */}
      <header>
        <h1 className="text-3xl font-bold tracking-[0.4px] text-[#1F2937]">
          퀴즈
        </h1>
        <p className="mt-1 text-base text-[#4B5563]">
          주차별 퀴즈를 풀고 학습 내용을 점검해보세요
        </p>
      </header>

      {/* 과목 선택 */}
      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_5px_rgba(0,0,0,0.06)]">
        <p className="mb-2 text-sm font-semibold text-[#1F2937]">강의 선택</p>
        <StudentQuizCourseFilter courses={courses} courseId={courseId} />
      </section>

      {/* 통계 3카드 */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="flex items-center gap-4 rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-[0_4px_5px_rgba(0,0,0,0.06)]"
          >
            <span
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${c.bg}`}
            >
              {c.icon}
            </span>
            <div>
              <p className="text-sm text-[#4B5563]">{c.label}</p>
              <p className="mt-0.5 text-2xl font-bold text-[#1F2937]">
                {c.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 주차별 퀴즈 */}
      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_5px_rgba(0,0,0,0.06)]">
        <h2 className="text-lg font-bold text-[#1F2937]">주차별 퀴즈</h2>
        {quizzes.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <svg
              aria-hidden="true"
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="m9 14 2 2 4-4" />
            </svg>
            <h3 className="mt-6 text-xl font-bold text-[#1F2937]">
              아직 퀴즈가 없습니다
            </h3>
            <p className="mt-2 text-base leading-6 text-[#4B5563]">
              이 강의에는 아직 퀴즈가 등록되지 않았습니다.
              <br />
              1주차 강의를 시작하면 퀴즈가 제공됩니다.
            </p>
            <Link
              href={`/learning/${courseId}`}
              className="mt-6 inline-flex h-12 items-center rounded-[10px] bg-[#2F5DAA] px-5 text-base font-semibold text-white transition hover:bg-[#274C8B]"
            >
              강의 보러 가기
            </Link>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {quizzes.map((q) => (
              <StudentQuizListItem key={q.quizId} item={q} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
