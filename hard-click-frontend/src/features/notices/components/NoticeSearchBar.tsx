'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

/** 공지 검색 입력 — Client 잎사귀. Enter 시 ?keyword= 로 navigate (서버가 재조회) */
export default function NoticeSearchBar({ keyword }: { keyword: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(keyword);

  function submit() {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set('keyword', value.trim());
    else params.delete('keyword');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[25px] py-[25px] mb-6">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="8.5" cy="8.5" r="5.5" stroke="#4B5563" strokeWidth="1.67" />
          <path
            d="M14.5 14.5l3 3"
            stroke="#4B5563"
            strokeWidth="1.67"
            strokeLinecap="round"
          />
        </svg>
        <input
          type="text"
          placeholder="공지사항 검색"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          className="w-full border border-[#E2E8F0] rounded-[10px] h-12 pl-12 pr-4 text-base text-[#4B5563] tracking-[-0.31px] outline-none focus:border-[#2F5DAA] transition-colors"
        />
      </div>
    </div>
  );
}
