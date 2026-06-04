'use client';

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import CourseSearchBar from './CourseSearchBar';
import CourseFilterBar from './CourseFilterBar';
import type { Subject, CourseSortType } from '../types';

interface CourseListControlsProps {
  subjects: Subject[];
  instructors: string[];
  keyword: string;
  selectedSubjectId?: number;
  selectedInstructor: string;
  sort: CourseSortType;
}

/**
 * 강의 검색/필터 컨트롤 — Client 잎사귀.
 * 직접 fetch 하지 않고 상태를 URL searchParams로 밀어넣으면 서버 페이지가 다시 렌더된다.
 */
export default function CourseListControls({
  subjects,
  instructors,
  keyword,
  selectedSubjectId,
  selectedInstructor,
  sort,
}: CourseListControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keywordInput, setKeywordInput] = useState(keyword);

  function pushWith(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-6 mb-8 flex flex-col gap-4">
      <CourseSearchBar
        value={keywordInput}
        onChange={setKeywordInput}
        onSearch={() => {
          const trimmed = keywordInput.trim();
          if (trimmed && /^[^\w가-힣]+$/u.test(trimmed)) return;
          pushWith({ keyword: trimmed || undefined });
        }}
      />
      <CourseFilterBar
        subjects={subjects}
        instructors={instructors}
        selectedSubjectId={selectedSubjectId}
        selectedInstructor={selectedInstructor}
        sort={sort}
        onSubjectChange={(id) =>
          pushWith({ subjectId: id != null ? String(id) : undefined })
        }
        onInstructorChange={(name) => pushWith({ instructor: name || undefined })}
        onSortChange={(s) => pushWith({ sort: s })}
        onReset={() => router.push(pathname)}
      />
    </div>
  );
}
