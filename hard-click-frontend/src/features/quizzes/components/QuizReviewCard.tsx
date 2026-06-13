import type { QuizReviewQuestion } from '../types';

/** 헤더 원 안 흰색 체크/엑스 */
const CheckBig = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const CrossBig = (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m18 6-12 12M6 6l12 12" />
  </svg>
);
/** 보기 옆 정답(초록)·내 답(빨강) 마크 */
const MarkCorrect = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);
const MarkWrong = (
  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
    <path d="m18 6-12 12M6 6l12 12" />
  </svg>
);

/**
 * 전체 문항 1개 — 정답=초록 테두리 / 오답=빨강 테두리. 보기 2열 그리드(정답 ✓ / 내 오답 ✗) + 해설.
 * 표시용 leaf(전부 props).
 */
export default function QuizReviewCard({
  number,
  question,
}: {
  number: number; // 1-based
  question: QuizReviewQuestion;
}) {
  const correct = question.correct;
  return (
    <div
      className={`rounded-[20px] border-2 p-6 ${
        correct ? 'border-[#16A34A] bg-[#16A34A0d]' : 'border-[#B91C1C] bg-[#B91C1C0d]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            correct ? 'bg-[#16A34A]' : 'bg-[#B91C1C]'
          }`}
        >
          {correct ? CheckBig : CrossBig}
        </span>
        <h3 className="mt-1 text-base font-bold text-[#1F2937]">
          {number}. {question.content}
        </h3>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isAnswer = i === question.answerIndex;
          const isMine = i === question.selectedIndex && !isAnswer;
          const cls = isAnswer
            ? 'bg-[#16A34A33] font-semibold text-[#16A34A]'
            : isMine
              ? 'bg-[#B91C1C33] font-semibold text-[#B91C1C]'
              : 'text-[#4B5563]';
          return (
            <div
              key={i}
              className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm ${cls}`}
            >
              <span className="flex-1">
                {i + 1}. {opt}
              </span>
              {isAnswer && MarkCorrect}
              {isMine && MarkWrong}
            </div>
          );
        })}
      </div>

      <div className="mt-4 border-t border-[#E2E8F0] pt-3">
        <p className="text-xs font-semibold text-[#2F5DAA]">해설</p>
        <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
