'use client';

import SelectDropdown, {
  type SelectOption,
} from '@/components/ui/SelectDropdown';

interface AdminQuizCourseFilterBarProps {
  subject: string;
  instructor: string;
  courseId: string;
  keyword: string;
  subjectOptions: SelectOption[];
  instructorOptions: SelectOption[];
  courseOptions: SelectOption[];
  onSubjectChange: (v: string) => void;
  onInstructorChange: (v: string) => void;
  onCourseChange: (v: string) => void;
  onKeywordChange: (v: string) => void;
  onReset: () => void;
}

export default function AdminQuizCourseFilterBar({
  subject,
  instructor,
  courseId,
  keyword,
  subjectOptions,
  instructorOptions,
  courseOptions,
  onSubjectChange,
  onInstructorChange,
  onCourseChange,
  onKeywordChange,
  onReset,
}: AdminQuizCourseFilterBarProps) {
  return (
    <div className="flex items-end gap-4 rounded-2xl border border-[#E2E8F0] bg-white px-6 py-5 shadow-sm">
      <div className="flex-1">
        <p className="mb-2 text-sm font-semibold text-[#374151]">과목 선택</p>
        <SelectDropdown
          className="w-full"
          buttonClassName="w-full justify-between"
          placeholder="전체"
          value={subject}
          options={subjectOptions}
          onChange={onSubjectChange}
        />
      </div>
      <div className="flex-1">
        <p className="mb-2 text-sm font-semibold text-[#374151]">강사 선택</p>
        <SelectDropdown
          className="w-full"
          buttonClassName="w-full justify-between"
          placeholder="전체"
          value={instructor}
          options={instructorOptions}
          onChange={onInstructorChange}
        />
      </div>
      <div className="flex-1">
        <p className="mb-2 text-sm font-semibold text-[#374151]">강의 선택</p>
        <SelectDropdown
          className="w-full"
          buttonClassName="w-full justify-between"
          placeholder="전체"
          value={courseId}
          options={courseOptions}
          onChange={onCourseChange}
        />
      </div>

      {/* 강의 검색 + 검색 버튼 (필터는 실시간, 버튼/엔터는 submit) */}
      <form
        className="flex flex-[1.8] items-end gap-3"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex-1">
          <p className="mb-2 text-sm font-semibold text-[#374151]">강의 검색</p>
          <div className="flex h-10 items-center rounded-2xl border border-[#E2E8F0] px-4">
            <input
              type="text"
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              placeholder="강의 검색"
              aria-label="강의 검색"
              className="w-full bg-transparent text-sm outline-none placeholder:text-[#94A3B8]"
            />
          </div>
        </div>
        <button
          type="submit"
          className="h-10 whitespace-nowrap rounded-2xl bg-[#2F5DAA] px-5 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          검색
        </button>
      </form>

      <button
        type="button"
        onClick={onReset}
        className="h-10 whitespace-nowrap rounded-2xl border border-[#E2E8F0] px-5 text-sm font-semibold text-[#4B5563] transition hover:bg-[#F8FAFC]"
      >
        초기화
      </button>
    </div>
  );
}
