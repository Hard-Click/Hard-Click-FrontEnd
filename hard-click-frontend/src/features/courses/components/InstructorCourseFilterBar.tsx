'use client';

import type { CourseSortType, Subject } from '../types';
import SelectDropdown, { type SelectOption } from '@/components/ui/SelectDropdown';

/* ── InstructorCourseFilterBar ── */
interface Props {
  subjects: Subject[];
  instructors: string[];
  selectedSubjectId: number | undefined;
  selectedInstructor: string;
  sort: CourseSortType;
  myCoursesOnly: boolean;
  onSubjectChange: (id: number | undefined) => void;
  onInstructorChange: (name: string) => void;
  onSortChange: (sort: CourseSortType) => void;
  onMyCoursesToggle: () => void;
  onReset: () => void;
}

const SORT_OPTIONS: { label: string; value: CourseSortType }[] = [
  { label: '최신순', value: 'latest' },
  { label: '인기순', value: 'popular' },
  { label: '별점순', value: 'rating' },
];

export default function InstructorCourseFilterBar({
  subjects,
  instructors,
  selectedSubjectId,
  selectedInstructor,
  sort,
  myCoursesOnly,
  onSubjectChange,
  onInstructorChange,
  onSortChange,
  onMyCoursesToggle,
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
    <div className="flex items-center justify-between">
      {/* 왼쪽: 과목 + 강사 드롭다운 */}
      <div className="flex items-center gap-3">
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

      {/* 오른쪽: 정렬 + 내 강의 + 초기화 */}
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
          onClick={onMyCoursesToggle}
          className={`h-10 px-4 font-semibold text-base rounded-2xl transition-colors border ${
            myCoursesOnly
              ? 'bg-[#2F5DAA] text-white border-[#2F5DAA]'
              : 'bg-white text-[#2F5DAA] border-[rgba(47,93,170,0.8)]'
          }`}
        >
          내 강의
        </button>

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
