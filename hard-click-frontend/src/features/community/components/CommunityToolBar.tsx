'use client';

import { useState } from 'react';
import Image from 'next/image';

const SUBJECTS = [
  '국어', '화법과 작문', '언어와 매체', '수학', '확률과 통계', '미적분', '기하', '영어', '한국사',
  '생활과 윤리', '윤리와 사상', '한국지리', '세계지리', '동아시아사', '세계사', '경제', '정치와 법',
  '사회문화', '물리학I', '물리학II', '화학I', '화학II', '생명과학I', '생명과학II', '지구과학I',
  '지구과학II', '농업 기초 기술', '공업 일반', '상업 경제', '수산·해운 산업 기초', '인간 발달',
  '독일어I', '프랑스어I', '스페인어I', '중국어I', '일본어I', '러시아어I', '아랍어I', '베트남어I', '한문I',
];

const SORT_FILTERS = ['최신순', '조회순', '댓글순'];

interface CommunityToolBarProps {
  sortType: string;
  onSortChange: (sort: string) => void;
  boardType?: string;
  selectedSubject?: string;
  onSubjectChange?: (subject: string) => void;
  onReset?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export default function CommunityToolBar({
  sortType,
  onSortChange,
  boardType,
  selectedSubject = '',
  onSubjectChange,
  onReset,
  searchValue = '',
  onSearchChange,
}: CommunityToolBarProps) {
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const isQuestion = boardType === '질문게시판' || boardType === '전체';

  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
      {/* 상단: 검색창 + 검색 버튼 */}
      <div className="flex items-center gap-2">
        <div className="flex h-11 flex-1 items-center rounded-xl border border-[#E2E8F0] px-4">
          <Image src="/icons/commuSearch.svg" alt="search" width={18} height={18} />
          <input
            type="text"
            placeholder="게시글 검색"
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-[#9CA3AF]"
          />
        </div>
        <button
          type="button"
          className="h-11 rounded-xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          검색
        </button>
      </div>

      {/* 하단: 과목 드롭다운(질문게시판) + 정렬 + 초기화 */}
      <div className="mt-3 flex items-center justify-between">
        {/* 왼쪽: 과목 드롭다운 (질문게시판만) */}
        <div className="flex items-center gap-2">
          {isQuestion && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsSubjectOpen((prev) => !prev)}
                className="flex h-9 w-[200px] items-center justify-between gap-2 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#374151]"
              >
                <span>{selectedSubject || '과목'}</span>
                <Image
                  src="/icons/chevronDownIcon.svg"
                  alt="down"
                  width={14}
                  height={14}
                  className={`transition-transform ${isSubjectOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isSubjectOpen && (
                <div className="absolute left-0 z-10 mt-1 max-h-60 w-[160px] overflow-y-auto rounded-xl border border-[#E2E8F0] bg-white shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      onSubjectChange?.('');
                      setIsSubjectOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC] ${
                      !selectedSubject ? 'font-semibold text-[#2F5DAA]' : 'text-[#374151]'
                    }`}
                  >
                    전체 과목
                  </button>
                  {SUBJECTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        onSubjectChange?.(s);
                        setIsSubjectOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-[#F8FAFC] ${
                        selectedSubject === s ? 'font-semibold text-[#2F5DAA]' : 'text-[#374151]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 오른쪽: 정렬 버튼 + 초기화 */}
        <div className="flex items-center gap-2">
          {SORT_FILTERS.map((filter) => {
            const isActive = sortType === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => onSortChange(filter)}
                className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${
                  isActive ? 'bg-[#2F5DAA] text-white' : 'bg-[#F8FAFC] text-[#4B5563]'
                }`}
              >
                {filter}
              </button>
            );
          })}
          {isQuestion && (
            <button
              type="button"
              onClick={onReset}
              className="h-9 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition"
            >
              초기화
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
