'use client';

import { useState } from 'react';
import Image from 'next/image';

type NoticeFilter = 'ALL' | 'PINNED' | 'NORMAL';

const FILTERS: { key: NoticeFilter; label: string }[] = [
  { key: 'ALL', label: '전체' },
  { key: 'PINNED', label: '중요' },
  { key: 'NORMAL', label: '일반' },
];

export default function AdminNoticeFilterBar() {
  const [filter, setFilter] = useState<NoticeFilter>('ALL');
  const [keyword, setKeyword] = useState('');

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm mt-6">
      <div className="flex items-center gap-3">
        {/* 검색 */}
        <div className="flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/search.svg" alt="search" width={18} height={18} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="공지 검색"
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
          />
        </div>
        {/* 검색 버튼 */}
        <button
          type="button"
          className="h-11 rounded-2xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          검색
        </button>

        {/* 중요도 필터 */}
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`h-9 w-18 whitespace-nowrap rounded-[30px] px-4 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#2F5DAA] text-white'
                    : 'bg-[#F1F5F9] text-[#475569]'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
