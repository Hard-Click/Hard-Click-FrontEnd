'use client';

import Image from 'next/image';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function CourseSearchBar({ value, onChange, onSearch }: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Image
          src="/icons/search.svg"
          alt="검색"
          width={20}
          height={20}
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="강의명으로 검색"
          className="w-full h-12 pl-12 pr-4 border border-[#E2E8F0] rounded-xl text-base text-[#1A1F2E] placeholder:text-[rgba(26,31,46,0.5)] outline-none focus:border-[#2F5DAA] transition-colors"
        />
      </div>
      <button
        onClick={onSearch}
        className="h-12 px-5 bg-[#2F5DAA] text-white font-semibold text-base rounded-xl whitespace-nowrap hover:bg-[#1D3E75] transition-colors"
      >
        검색
      </button>
    </div>
  );
}
