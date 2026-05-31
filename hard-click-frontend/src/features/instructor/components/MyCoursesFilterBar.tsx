'use client';

import React from 'react';
import Image from 'next/image';

type FilterType = 'ALL' | 'PUBLIC' | 'PRIVATE';

interface Props {
  filter: FilterType;
  keyword: string;
  onFilterChange: (filter: FilterType) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
}

export default function MyCoursesFilterBar({
  filter,
  keyword,
  onFilterChange,
  onKeywordChange,
  onSearch,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="mb-8 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* filters */}
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLIC', 'PRIVATE'] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFilterChange(f)}
              className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
                filter === f
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F1F5F9] text-[#475569]'
              }`}
            >
              {f === 'ALL' ? '전체' : f === 'PUBLIC' ? '공개' : '비공개'}
            </button>
          ))}
        </div>

        {/* search */}
        <div className="ml-4 flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <button type="button" onClick={onSearch}>
            <Image src="/icons/search.svg" alt="search" width={18} height={18} />
          </button>

          <input
            type="text"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="강의 검색"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>
    </div>
  );
}
