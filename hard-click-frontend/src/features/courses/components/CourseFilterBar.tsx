'use client';

import type { CourseSortType, Subject } from '../types';

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

const chevronDown =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='rgba(26,31,46,0.5)' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")";

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
  return (
    <div className="flex items-center justify-between">
      {/* 드롭다운 */}
      <div className="flex items-center gap-3">
        <select
          value={selectedSubjectId ?? ''}
          onChange={e => onSubjectChange(e.target.value ? Number(e.target.value) : undefined)}
          className="h-10 pl-4 pr-8 border border-[#E2E8F0] rounded-2xl text-base text-[rgba(26,31,46,0.5)] outline-none bg-white cursor-pointer appearance-none"
          style={{
            backgroundImage: chevronDown,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 4px center',
          }}
        >
          <option value="">전체</option>
          {subjects.map(s => (
            <option key={s.subjectId} value={s.subjectId}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedInstructor}
          onChange={e => onInstructorChange(e.target.value)}
          className="h-10 pl-4 pr-8 border border-[#E2E8F0] rounded-2xl text-base text-[rgba(26,31,46,0.5)] outline-none bg-white cursor-pointer appearance-none"
          style={{
            backgroundImage: chevronDown,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 4px center',
          }}
        >
          <option value="">전체</option>
          {instructors.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* 정렬 + 초기화 */}
      <div className="flex items-center gap-[22px]">
        {SORT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onSortChange(opt.value)}
            className={`h-10 px-4 font-semibold text-base rounded-2xl transition-colors ${
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
          className="h-10 px-4 font-semibold text-base text-[#4B5563] border border-[#E2E8F0] rounded-2xl hover:bg-gray-50 transition-colors"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
