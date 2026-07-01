'use client';

import { useState, useRef, useEffect } from 'react';
import type { CourseSortType, Subject } from '../types';

/* ── 공통 커스텀 드롭다운 ── */
interface SelectOption {
  label: string;
  value: string;
}

function SelectDropdown({
  placeholder,
  value,
  options,
  onChange,
}: {
  placeholder: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const displayText = value ? (options.find(o => o.value === value)?.label ?? placeholder) : placeholder;

  // 가장 긴 옵션 텍스트로 버튼 너비 고정
  const longestLabel = options.reduce(
    (max, opt) => opt.label.length > max.length ? opt.label : max,
    placeholder
  );

  return (
    <div ref={ref} className="relative w-full md:w-auto">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="relative w-full md:w-auto h-10 pl-4 pr-3 border border-[#E2E8F0] rounded-2xl text-base bg-white flex items-center justify-between md:justify-start gap-1.5 whitespace-nowrap transition-colors hover:border-[#CBD5E1]"
      >
        {/* 가장 긴 옵션 텍스트로 너비 확보 */}
        <span className="invisible select-none" aria-hidden>{longestLabel}</span>
        {/* 실제 표시 텍스트 */}
        <span className="absolute left-4 text-[rgba(26,31,46,0.5)] whitespace-nowrap">{displayText}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="rgba(26,31,46,0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+6px)] left-0 min-w-full bg-white border border-[#E2E8F0] rounded-2xl shadow-lg z-50 max-h-52 overflow-y-auto py-2">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-5 py-2.5 text-left text-base transition-colors hover:bg-gray-50 ${
                value === opt.value
                  ? 'text-[#2F5DAA] font-semibold'
                  : 'text-[rgba(26,31,46,0.8)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── CourseFilterBar ── */
interface Props {
  subjects: Subject[];
  instructors: string[];
  selectedSubjectId: number | undefined;
  selectedInstructor: string;
  sort: CourseSortType;
  onSubjectChange: (id: number | undefined) => void;
  onInstructorChange: (name: string) => void;
  onSortChange: (sort: CourseSortType) => void;
  onReset: () => void;
}

const SORT_OPTIONS: { label: string; value: CourseSortType }[] = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
];

export default function CourseFilterBar({
  subjects,
  instructors,
  selectedSubjectId,
  selectedInstructor,
  sort,
  onSubjectChange,
  onInstructorChange,
  onSortChange,
  onReset,
}: Props) {
  const subjectOptions: SelectOption[] = [
    { label: '전체', value: '' },
    ...subjects.map(s => ({ label: s.name, value: s.subjectId.toString() })),
  ];

  const instructorOptions: SelectOption[] = [
    { label: '전체', value: '' },
    ...instructors.map(name => ({ label: name, value: name })),
  ];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      {/* 드롭다운 — 모바일 2칸 grid(오와열 정렬), md+ 가로 배치 */}
      <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
        <SelectDropdown
          placeholder="과목"
          value={selectedSubjectId?.toString() ?? ''}
          options={subjectOptions}
          onChange={val => onSubjectChange(val ? Number(val) : undefined)}
        />
        <SelectDropdown
          placeholder="강사"
          value={selectedInstructor}
          options={instructorOptions}
          onChange={onInstructorChange}
        />
      </div>

      {/* 정렬 + 초기화 — 모바일은 균등폭 한 줄(오와열), md+ 자연폭 */}
      <div className="flex items-center gap-2 md:gap-[22px]">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`flex-1 md:flex-none h-10 px-2 md:px-4 font-semibold text-sm md:text-base rounded-2xl transition-colors ${
              sort === opt.value
                ? 'bg-[#2F5DAA] text-white'
                : 'bg-[#F8FAFC] text-[#4B5563] hover:bg-gray-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={onReset}
          className="flex-1 md:flex-none h-10 px-2 md:px-4 font-semibold text-sm md:text-base text-[#4B5563] border border-[#E2E8F0] rounded-2xl hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
