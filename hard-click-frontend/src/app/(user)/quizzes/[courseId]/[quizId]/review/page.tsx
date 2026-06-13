import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getStudentQuizReviewServer } from '@/features/quizzes/studentServer';
import QuizResultSummary from '@/features/quizzes/components/QuizResultSummary';
import QuizWrongNoteCard from '@/features/quizzes/components/QuizWrongNoteCard';
import QuizReviewCard from '@/features/quizzes/components/QuizReviewCard';

const BookIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const ListIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </svg>
);

/**
 * 퀴즈 결과(해설) 화면 (Server Component) — `/quizzes/[courseId]/[quizId]/review`.
 * 점수·향상도·오답노트·전체문항 모두 표시(read-only). 응시 기록 없으면 404.
 * 상호작용 없음(Link 2개뿐) → 전부 Server Component.
 */
export default async function QuizReviewPage({
  params,
}: {
  params: Promise<{ courseId: string; quizId: string }>;
}) {
  const { courseId: cIdStr, quizId: qIdStr } = await params;
  const courseId = Number(cIdStr);
  const quizId = Number(qIdStr);
  if (!Number.isInteger(courseId) || !Number.isInteger(quizId)) notFound();

  const review = await getStudentQuizReviewServer(courseId, quizId);
  if (!review) notFound();

  // 오답노트 — 틀린 문항 (원래 번호 유지)
  const wrong = review.questions
    .map((q, i) => ({ q, number: i + 1 }))
    .filter((x) => !x.q.correct);

  return (
    <div className="mx-auto max-w-[1024px] px-8 py-12">
      {/* 헤더 */}
      <header>
        <p className="text-sm text-[#4B5563]">{review.courseTitle}</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">{review.title}</h1>
        <p className="mt-2 text-base text-[#4B5563]">
          • 응시일: {review.attemptedAt.split(' ')[0]}
        </p>
      </header>

      {/* 점수 카드 */}
      <div className="mt-8">
        <QuizResultSummary
          score={review.score}
          correctCount={review.correctCount}
          totalCount={review.totalCount}
          previousScore={review.previousScore}
          improvement={review.improvement}
        />
      </div>

      {/* 오답노트 — 틀린 게 있을 때만 */}
      {wrong.length > 0 && (
        <section className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
          <h2 className="text-2xl font-bold text-[#1F2937]">오답노트</h2>
          <div className="mt-6 flex flex-col gap-6">
            {wrong.map(({ q, number }) => (
              <QuizWrongNoteCard key={q.questionId} number={number} question={q} />
            ))}
          </div>
        </section>
      )}

      {/* 전체 문항 */}
      <section className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <h2 className="text-2xl font-bold text-[#1F2937]">전체 문항</h2>
        <div className="mt-6 flex flex-col gap-4">
          {review.questions.map((q, i) => (
            <QuizReviewCard key={q.questionId} number={i + 1} question={q} />
          ))}
        </div>
      </section>

      {/* 푸터 — 다시 학습하기(재응시) / 퀴즈 목록으로 */}
      <div className="mt-8 flex gap-4">
        <Link
          href={`/quizzes/${courseId}/${quizId}`}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
        >
          {BookIcon} 다시 학습하기
        </Link>
        <Link
          href={`/quizzes/${courseId}`}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[10px] border-2 border-[#E2E8F0] text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          {ListIcon} 퀴즈 목록으로
        </Link>
      </div>
    </div>
  );
}
