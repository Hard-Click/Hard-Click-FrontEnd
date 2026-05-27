'use client';

import { useState } from 'react';
import Image from 'next/image';

const FILTERS = ['최신순', '조회순', '댓글순'];

export default function CommunityToolBar() {
  const [activeTab, setActiveTab] = useState('최신순');
  return (
    <div className="flex items-center justify-between mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      {/* search */}

      <div className="flex h-11 w-full max-w-[1330px] items-center rounded-xl border border-[#E2E8F0] px-4">
        <Image
          src="/icons/commuSearch.svg"
          alt="search"
          width={18}
          height={18}
        />

        <input
          type="text"
          placeholder="게시글 검색"
          className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* filters */}

      <div className="ml-4 flex items-center gap-2">
        {FILTERS.map((filter) => {
          const isActive = activeTab === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveTab(filter)}
              className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F8FAFC] text-[#4B5563]'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
