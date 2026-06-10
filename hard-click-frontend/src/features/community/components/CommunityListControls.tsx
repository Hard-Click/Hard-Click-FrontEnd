'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { TAB_TO_BOARD_TYPE } from '../types';
import type { SubjectItem } from '../types';

const FILTERS = Object.keys(TAB_TO_BOARD_TYPE);
const SORT_OPTIONS = ['최신순', '조회순', '댓글순'];

interface CommunityListControlsProps {
  activeTab: string;
  sortType: string;
  keyword: string;
  subject: string;      
  subjects: SubjectItem[];
}

/**
 * 목록 필터/정렬/검색 컨트롤 — **Client Component(잎사귀)**.
 *
 * 직접 데이터를 가져오지 않는다. 상태를 **URL searchParams**로 밀어넣으면,
 * 서버 컴포넌트(page.tsx)가 다시 렌더되며 새 목록을 가져온다.
 */
export default function CommunityListControls({
  activeTab,
  sortType,
  keyword,
  subject, 
  subjects
}: CommunityListControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(keyword);

  function pushWith(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete('page'); // 필터/검색 변경 시 첫 페이지로
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      {/* filter tabs */}
      <div className="overflow-hidden rounded-[16px] border border-[#E2E8F0] bg-white p-1 shadow-sm">
        <div className="grid grid-cols-4 gap-1">
          {FILTERS.map((filter) => {
            const isActive = activeTab === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => pushWith({ tab: filter })}
                className={`h-11 rounded-[20px] text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#2F5DAA] text-white shadow-sm'
                    : 'bg-white text-[#4B5563] hover:bg-[#F8FAFC]'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* toolbar: search + sort */}
<div className="mt-6 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
  {/* 윗줄: 검색 + (질문/스터디일 때 과목 필터 + 초기화) */}
  <div className="flex items-center gap-2">
    <div className="flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
      <Image
        src="/icons/commuSearch.svg"
        alt="search"
        width={18}
        height={18}
      />
      <input
        type="text"
        placeholder="게시글 검색"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && pushWith({ keyword: search })}
        className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
      />
    </div>
    <button
      type="button"
      onClick={() => pushWith({ keyword: search })}
      className="h-11 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:opacity-90"
    >
      검색
    </button>

    {(activeTab === '질문게시판' || activeTab === '스터디게시판') && (
      <>
        <select
          value={subject}
          onChange={(e) => pushWith({ subject: e.target.value || undefined })}
          className="h-11 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#4B5563] outline-none"
        >
          <option value="">전체 과목</option>
          {subjects.map((s) => (
            <option key={s.subjectId} value={String(s.subjectId)}>
              {s.subjectName}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            setSearch('');
            pushWith({ keyword: undefined, subject: undefined });
          }}
          className="flex h-11 items-center gap-1 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm text-[#4B5563] transition hover:bg-[#F8FAFC]"
        >
          초기화
        </button>
      </>
    )}
  </div>

  {/* 아랫줄: 정렬 */}
  <div className="mt-3 flex items-center gap-2">
    {SORT_OPTIONS.map((option) => {
      const isActive = sortType === option;
      return (
        <button
          key={option}
          type="button"
          onClick={() => pushWith({ sort: option })}
          className={`h-10 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition ${
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
    </>
  );
}
