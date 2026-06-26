import type { QuizReviewQuestion } from '../types';

/**
 * 오답노트 1문제 — 틀린 문제만. 정답(초록 배지)·내 답(빨강 배지) 강조 + 해설.
 * 표시용 leaf(전부 props).
 */
export default function QuizWrongNoteCard({
  number,
  question,
}: {
  number: number; // 문항 번호 (1-based, 원래 위치)
  question: QuizReviewQuestion;
}) {
  return (
    <div className="rounded-[20px] border border-[#FCA5A5] bg-[#FEF2F2] p-6">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#B91C1C] text-base font-bold text-white">
          {number}
        </span>
        <h3 className="mt-0.5 text-lg font-bold text-[#1F2937]">
          {question.content}
        </h3>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {question.options.map((opt, i) => {
          const isAnswer = i === question.answerIndex;
          const isMine = i === question.selectedIndex && !isAnswer;
          const box = isAnswer
            ? 'border-2 border-[#16A34A] bg-[#16A34A1a]'
            : isMine
              ? 'border-2 border-[#B91C1C] bg-[#B91C1C1a]'
              : 'border border-[#E2E8F0] bg-white';
          const text = isAnswer
            ? 'font-semibold text-[#16A34A]'
            : isMine
              ? 'font-semibold text-[#B91C1C]'
              : 'text-[#4B5563]';
          return (
            <div
              key={i}
              className={`flex items-center gap-3 rounded-2xl px-[18px] py-4 ${box}`}
            >
              <span className="text-sm font-semibold text-[#9CA3AF]">{i + 1}.</span>
              <span className={`flex-1 text-base ${text}`}>{opt}</span>
              {isAnswer && (
                <span className="shrink-0 rounded-2xl bg-[#16A34A] px-3 py-0.5 text-xs font-semibold text-white">
                  정답
                </span>
              )}
              {isMine && (
                <span className="shrink-0 rounded-2xl bg-[#B91C1C] px-3 py-0.5 text-xs font-semibold text-white">
                  내 답
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-2xl border-l-4 border-[#2F5DAA] bg-white p-4 pl-5">
        <p className="text-sm font-semibold text-[#2F5DAA]">해설</p>
        <p className="mt-1 text-sm leading-relaxed text-[#4B5563]">
          {question.explanation}
        </p>
      </div>
    </div>
  );
}
