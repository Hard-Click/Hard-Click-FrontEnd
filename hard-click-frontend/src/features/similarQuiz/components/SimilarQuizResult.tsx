import Link from 'next/link';
import QuizWrongNoteCard from '@/features/quizzes/components/QuizWrongNoteCard';
import QuizReviewCard from '@/features/quizzes/components/QuizReviewCard';
import type { SimilarQuizSubmitResult } from '../types';

const BookIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const CalendarIcon = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);
const CheckStat = (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </svg>
);
const XStat = (
  <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6M9 9l6 6" />
  </svg>
);

/**
 * 유사퀴즈 결과(해설) 화면 — 제출 응답으로 바로 렌더(같은 화면 상태전환).
 * 기존 퀴즈 리뷰와 달리 **향상도(직전 주차 비교)·비교 메시지 없음** → 점수 + 정답/오답만.
 * 오답노트·전체문항은 기존 퀴즈 표시용 컴포넌트를 그대로 재사용(순수 표시).
 * 상호작용 없음(Link 2개) — client 부모(SimilarQuizClient) 아래라 directive 불필요.
 */
export default function SimilarQuizResult({
  courseId,
  courseTitle,
  title,
  result,
}: {
  courseId: number;
  courseTitle: string;
  title: string;
  result: SimilarQuizSubmitResult;
}) {
  const { score, correctCount, totalCount, questions } = result;
  const wrongCount = totalCount - correctCount;

  // 오답노트 — 틀린 문항 (원래 번호 유지)
  const wrong = questions
    .map((q, i) => ({ q, number: i + 1 }))
    .filter((x) => !x.q.correct);

  return (
    <div className="mx-auto max-w-[1024px] px-8 py-12">
      {/* 헤더 */}
      <header>
        <p className="text-sm text-[#4B5563]">{courseTitle}</p>
        <h1 className="mt-1 text-3xl font-bold text-[#1F2937]">{title}</h1>
      </header>

      {/* 점수 카드 (향상도 없음 — 점수 + 정답/오답만) */}
      <section className="mt-8 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col items-center">
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#2F5DAA1a]">
            <span className="text-5xl font-bold text-[#2F5DAA]">{score}</span>
          </div>
          <h2 className="mt-6 text-2xl font-bold text-[#1F2937]">총점</h2>
          <p className="mt-2 text-base text-[#4B5563]">
            {correctCount} / {totalCount} 정답
          </p>
        </div>

        <div className="mt-6 border-t border-[#E2E8F0] pt-6">
          {/* 향상도 제거로 stat 2개 → 양끝 벌어짐 방지: 구분선은 전체폭, stat은 좁은 폭 가운데 정렬 */}
          <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16A34A1a] text-[#16A34A]">
                {CheckStat}
              </span>
              <p className="mt-3 text-sm text-[#4B5563]">정답</p>
              <p className="mt-1 text-2xl font-bold text-[#16A34A]">
                {correctCount}개
              </p>
            </div>
            <div className="flex flex-col items-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#B91C1C1a] text-[#B91C1C]">
                {XStat}
              </span>
              <p className="mt-3 text-sm text-[#4B5563]">오답</p>
              <p className="mt-1 text-2xl font-bold text-[#B91C1C]">
                {wrongCount}개
              </p>
            </div>
          </div>
        </div>
      </section>

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
          {questions.map((q, i) => (
            <QuizReviewCard key={q.questionId} number={i + 1} question={q} />
          ))}
        </div>
      </section>

      {/* 푸터 — 다시 학습하기 / 캘린더로 가기 */}
      <div className="mt-8 flex gap-4">
        <Link
          href={`/learning/${courseId}`}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white transition hover:bg-[#274C8B]"
        >
          {BookIcon} 다시 학습하기
        </Link>
        {/* 캘린더 경로는 곽시윤 #876 진입점 확정 시 조정(현재 /schedule). */}
        <Link
          href="/schedule"
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-[10px] border-2 border-[#E2E8F0] text-base font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          {CalendarIcon} 캘린더로 가기
        </Link>
      </div>
    </div>
  );
}
