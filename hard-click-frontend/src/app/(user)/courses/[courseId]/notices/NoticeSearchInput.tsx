'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/** 공지 검색 입력(잎사귀) — 제출 시 ?keyword= 로 URL 이동 → 서버에서 재조회 */
export default function NoticeSearchInput({ initial }: { initial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initial);

  const submit = () => {
    const kw = value.trim();
    router.push(kw ? `${pathname}?keyword=${encodeURIComponent(kw)}` : pathname);
  };

  return (
    <div className="relative">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <circle cx="8.5" cy="8.5" r="5.5" stroke="#4B5563" strokeWidth="1.67" />
        <path d="M14.5 14.5l3 3" stroke="#4B5563" strokeWidth="1.67" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        placeholder="공지사항 검색 (Enter)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        className="w-full border border-[#E2E8F0] rounded-[10px] h-12 pl-12 pr-4 text-base text-[#4B5563] tracking-[-0.31px] outline-none focus:border-[#2F5DAA] transition-colors"
      />
    </div>
  );
}
