import type { StudentQuizQuestion } from '../types';

/** 선택된 보기 — 파란 원 안 흰색 체크 */
const CheckIcon = (
  <svg
    aria-hidden="true"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

/**
 * 퀴즈 1문항 카드 — 문제 N 배지 + 질문 + 4지선다.
 * 표시용 leaf(선택값·핸들러는 props). client 부모(QuizTakeClient) 아래라 directive 불필요.
 */
export default function QuizQuestionCard({
  index,
  question,
  selectedIndex,
  onSelect,
}: {
  index: number; // 0-based
  question: StudentQuizQuestion;
  selectedIndex: number | undefined;
  onSelect: (optionIndex: number) => void;
}) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <span className="inline-flex items-center rounded-xl bg-[#2F5DAA1a] px-3 py-1.5 text-sm font-semibold text-[#2F5DAA]">
        문제 {index + 1}
      </span>
      <h2 className="mt-3 text-xl font-bold leading-snug text-[#1F2937]">
        {question.content}
      </h2>

      <div className="mt-4 flex flex-col gap-2.5">
        {question.options.map((opt, i) => {
          const selected = selectedIndex === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(i)}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-3.5 text-left transition-colors ${
                selected
                  ? 'border-[#2F5DAA] bg-[rgba(47,93,170,0.05)]'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                  selected
                    ? 'border-[#2F5DAA] bg-[#2F5DAA]'
                    : 'border-[#E2E8F0] bg-white'
                }`}
              >
                {selected && CheckIcon}
              </span>
              <span className="text-base font-semibold text-[#1F2937]">
                {i + 1}. {opt}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
