import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getQuizScoresServer } from '@/features/quizzes/server';
import { getInstructorCoursesServer } from '@/features/instructor/server';
import { summarizeScores } from '@/features/quizzes/scoreboard';
import QuizScoreOverview from '@/features/quizzes/components/QuizScoreOverview';
import QuizScoresTable from '@/features/quizzes/components/QuizScoresTable';

/**
 * 강사 퀴즈 점수 현황 (Server Component) — Screen 2 카드의 [조회하기] → 여기.
 * 한 퀴즈의 응시 결과. 데이터·집계는 서버에서, 표 상호작용만 client(QuizScoresTable).
 */
export default async function QuizScoresPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId: courseIdStr, quizId: quizIdStr } = await params;
  const courseId = Number(courseIdStr);
  const quizId = Number(quizIdStr);

  const [board, coursesRes] = await Promise.all([
    getQuizScoresServer(courseId, quizId),
    getInstructorCoursesServer(),
  ]);
  if (!board) return notFound();

  // 강의명은 하드코딩 X — 선택한 강의의 실제 제목
  const courseName =
    coursesRes.content.find((c) => c.courseId === courseId)?.title ?? '강의';
  const summary = summarizeScores(board.rows);

  return (
    <div className="mx-auto max-w-[1152px] px-8 py-8">
      {/* 헤더 */}
      <header className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-[#2F5DAA]">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.33"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="20" x2="12" y2="10" />
            <line x1="18" y1="20" x2="18" y2="4" />
            <line x1="6" y1="20" x2="6" y2="16" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-[0.4px] text-[#1F2937]">
          퀴즈 점수 현황
        </h1>
      </header>

      {/* 이전으로 → Screen 2 (해당 강의 퀴즈 목록) */}
      <Link
        href={`/instructor/quizzes/${courseId}`}
        className="mt-3 inline-flex items-center gap-1.5 text-base font-semibold text-[#4B5563] transition hover:text-[#1F2937]"
      >
        <Image src="/icons/arrowLeftIcon.svg" alt="" width={20} height={20} /> 이전으로
        돌아가기
      </Link>

      {/* 브레드크럼: 강의 › N주차 : 퀴즈제목 */}
      <p className="mt-6 text-sm">
        <span className="font-medium text-[#4B5563]">{courseName}</span>
        <span className="mx-2 font-semibold text-[#4B5563]">›</span>
        <span className="font-bold text-[#2F5DAA]">
          {board.week}주차 : {board.title}
        </span>
      </p>

      {/* 통계 + 점수 분포 */}
      <QuizScoreOverview summary={summary} />

      {/* 수강생 목록 (검색·정렬·응시여부 필터·표) */}
      <QuizScoresTable rows={board.rows} />
    </div>
  );
}
