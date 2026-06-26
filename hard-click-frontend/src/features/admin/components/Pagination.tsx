'use client';

interface PaginationProps {
  /** 현재 페이지 (1-based) */
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const GROUP_SIZE = 3;

/**
 * 공용 페이지네이션 — 페이지 번호를 3개씩 묶어 표시(1 2 3 → 4 5 6)하고
 * ‹ › 화살표로 이전/다음 페이지로 이동한다. 페이지가 1개 이하면 렌더하지 않는다.
 */
export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const groupStart = Math.floor((currentPage - 1) / GROUP_SIZE) * GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + GROUP_SIZE - 1, totalPages);
  const pages: number[] = [];
  for (let p = groupStart; p <= groupEnd; p += 1) pages.push(p);

  const arrowClass =
    'flex h-9 w-9 items-center justify-center rounded-xl text-[#94A3B8] transition hover:bg-[#F1F5F9] disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white py-4">
      <button
        type="button"
        aria-label="이전 페이지 그룹"
        disabled={groupStart === 1}
        onClick={() => onPageChange(groupStart - 1)}
        className={arrowClass}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition ${
              isActive
                ? 'bg-[#2F5DAA] text-white'
                : 'text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        aria-label="다음 페이지 그룹"
        disabled={groupEnd === totalPages}
        onClick={() => onPageChange(groupEnd + 1)}
        className={arrowClass}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
