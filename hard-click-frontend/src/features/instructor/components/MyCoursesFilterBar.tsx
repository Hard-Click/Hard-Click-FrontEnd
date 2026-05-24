'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function MyCoursesFilterBar() {
  const [selectedFilter, setSelectedFilter] = useState<
    'ALL' | 'PUBLIC' | 'PRIVATE'
  >('ALL');

  const [keyword, setKeyword] = useState('');

  return (
    <div className="mb-8 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        {/* filters */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedFilter('ALL')}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              selectedFilter === 'ALL'
                ? 'bg-[#2F5DAA] text-white'
                : 'bg-[#F1F5F9] text-[#475569]'
            }`}
          >
            전체
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('PUBLIC')}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              selectedFilter === 'PUBLIC'
                ? 'bg-[#2F5DAA] text-white'
                : 'bg-[#F1F5F9] text-[#475569]'
            }`}
          >
            공개
          </button>

          <button
            type="button"
            onClick={() => setSelectedFilter('PRIVATE')}
            className={`rounded-xl px-5 py-2 text-sm font-semibold transition ${
              selectedFilter === 'PRIVATE'
                ? 'bg-[#2F5DAA] text-white'
                : 'bg-[#F1F5F9] text-[#475569]'
            }`}
          >
            비공개
          </button>
        </div>

        {/* search */}
        <div className="ml-4 flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/search.svg" alt="search" width={18} height={18} />

          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="강의 검색"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>
    </div>
  );
}
