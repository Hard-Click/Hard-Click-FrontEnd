/** 페이지 이동 화살표 */
const ChevronLeft = (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const ChevronRight = (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/**
 * 문항 바로가기 — pageSize개씩 페이징(‹ ›) + 칸 클릭 점프.
 * 색: 현재=파랑 / 응시=초록 / 미응시=흰색. 표시용 leaf(상태·핸들러는 props).
 */
export default function QuizNavigator({
  total,
  current,
  isAnswered,
  navPage,
  pageSize,
  onJump,
  onPrevPage,
  onNextPage,
}: {
  total: number;
  current: number; // 0-based
  isAnswered: (index: number) => boolean;
  navPage: number; // 0-based
  pageSize: number;
  onJump: (index: number) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}) {
  const pageCount = Math.ceil(total / pageSize);
  const start = navPage * pageSize;
  const paged = pageCount > 1;

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-[0_4px_10px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#1F2937]">문항 바로가기</h3>
        {paged && (
          <span className="text-sm text-[#64748B]">
            {navPage + 1} / {pageCount} 페이지
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        {paged && (
          <button
            type="button"
            onClick={onPrevPage}
            disabled={navPage === 0}
            aria-label="이전 문항 페이지"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border-2 border-[#E2E8F0] text-[#4B5563] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ChevronLeft}
          </button>
        )}

        <div className="grid flex-1 grid-cols-5 gap-3">
          {Array.from({ length: pageSize }, (_, k) => {
            const i = start + k;
            // 문항 없는 칸은 비워 둠 — 마지막 페이지 버튼이 늘어나지 않게 5칸 크기 유지
            if (i >= total) return <div key={`empty-${k}`} aria-hidden="true" />;
            const isCurrent = i === current;
            const answered = isAnswered(i);
            const style = isCurrent
              ? 'bg-[#2F5DAA] text-white'
              : answered
                ? 'border-2 border-[#16A34A] bg-[#16A34A1a] text-[#16A34A]'
                : 'border-2 border-[#E2E8F0] bg-white text-[#4B5563]';
            return (
              <button
                key={i}
                type="button"
                onClick={() => onJump(i)}
                aria-label={`${i + 1}번 문항${answered ? ' (응시 완료)' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
                className={`h-12 rounded-[10px] text-base font-semibold transition ${style}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {paged && (
          <button
            type="button"
            onClick={onNextPage}
            disabled={navPage >= pageCount - 1}
            aria-label="다음 문항 페이지"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border-2 border-[#E2E8F0] text-[#4B5563] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {ChevronRight}
          </button>
        )}
      </div>
    </section>
  );
}
