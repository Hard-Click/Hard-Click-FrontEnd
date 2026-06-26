'use client';

import Image from 'next/image';

type FilterType = 'ALL' | 'PUBLIC' | 'PRIVATE';

interface MyCoursesFilterBarProps {
  selectedFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  keyword: string;
  onKeywordChange: (keyword: string) => void;
}

export default function MyCoursesFilterBar({
  selectedFilter,
  onFilterChange,
  keyword,
  onKeywordChange,
}: MyCoursesFilterBarProps) {
  return (
    <div className="mb-8 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLIC', 'PRIVATE'] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                selectedFilter === f ? 'bg-[#2F5DAA] text-white' : 'bg-[#F1F5F9] text-[#475569]'
              }`}
            >
              {f === 'ALL' ? '전체' : f === 'PUBLIC' ? '공개' : '비공개'}
            </button>
          ))}
        </div>

        <div className="ml-4 flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/search.svg" alt="search" width={18} height={18} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            placeholder="강의 검색"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>
    </div>
  );
}