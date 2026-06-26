'use client';

import Image from 'next/image';

const SORT_OPTIONS = ['최신순', '조회순', '댓글순'];

interface CommunityToolBarProps {
  sortType: string;
  onSortChange: (sort: string) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
}

export default function CommunityToolBar({
  sortType,
  onSortChange,
  searchValue = '',
  onSearchChange,
  onSearch,
}: CommunityToolBarProps) {
  return (
    <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      {/* search */}
      <div className="flex h-11 w-full max-w-[870px] items-center rounded-xl border border-[#E2E8F0] px-4">
        <button type="button" onClick={onSearch}>
          <Image
            src="/icons/commuSearch.svg"
            alt="search"
            width={18}
            height={18}
          />
        </button>
        <input
          type="text"
          placeholder="게시글 검색"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
          className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
        />
      </div>

      {/* sort filters */}
      <div className="ml-4 flex items-center gap-2">
        {SORT_OPTIONS.map((option) => {
          const isActive = sortType === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSortChange(option)}
              className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                isActive
                  ? 'bg-[#2F5DAA] text-white'
                  : 'bg-[#F8FAFC] text-[#4B5563]'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
