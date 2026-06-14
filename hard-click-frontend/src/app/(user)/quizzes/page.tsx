import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getEnrolledCoursesServer } from '@/features/quizzes/studentServer';

/**
 * 퀴즈 진입점 (Server Component) — `/quizzes`.
 * 헤더 '퀴즈' 탭 등 courseId 없이 진입 시 → 첫 수강 강의 퀴즈 목록으로 redirect.
 * 수강 중인 강의가 없으면 안내 + 강의 둘러보기.
 */
export default async function QuizzesEntryPage() {
  const courses = await getEnrolledCoursesServer();

  if (courses.length > 0) {
    redirect(`/quizzes/${courses[0].courseId}`);
  }

  // 수강 중인 강의 없음 → 안내
  return (
    <div className="mx-auto max-w-[1152px] px-8 py-8">
      <header>
        <h1 className="text-3xl font-bold tracking-[0.4px] text-[#1F2937]">
          퀴즈
        </h1>
        <p className="mt-1 text-base text-[#4B5563]">
          주차별 퀴즈를 풀고 학습 내용을 점검해보세요
        </p>
      </header>

      <section className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_5px_rgba(0,0,0,0.06)]">
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
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          <h3 className="mt-6 text-xl font-bold text-[#1F2937]">
            수강 중인 강의가 없습니다
          </h3>
          <p className="mt-2 text-base leading-6 text-[#4B5563]">
            강의를 수강하면 주차별 퀴즈가 제공됩니다.
            <br />
            먼저 강의를 둘러보세요.
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex h-12 items-center rounded-[10px] bg-[#2F5DAA] px-5 text-base font-semibold text-white transition hover:bg-[#274C8B]"
          >
            강의 둘러보기
          </Link>
        </div>
      </section>
    </div>
  );
}
