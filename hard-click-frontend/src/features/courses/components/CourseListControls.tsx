'use client';

import { useEffect, useRef, useState } from 'react';
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 디바운스 콜백이 늦게 실행돼도 항상 최신 searchParams로 push한다.
  // (대기 중 과목·정렬 등 다른 필터가 바뀌어도 이전 상태로 덮어쓰지 않게)
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  // 언마운트 시 대기 중 디바운스 타이머 정리
  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  function pushWith(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    // scroll:false — 필터/검색 시 URL만 갱신하고 스크롤 위치 유지(기본값은 맨 위로 튐)
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  /** 키워드 검색 적용 (특수문자만이면 무시) */
  function searchKeyword(raw: string) {
    const trimmed = raw.trim();
    if (trimmed && /^[^\w가-힣]+$/u.test(trimmed)) return;
    pushWith({ keyword: trimmed || undefined });
  }

  /** 타이핑 → 150ms 디바운스 후 자동 검색 (거의 즉각 반영, 키 입력마다 서버호출은 방지) */
  function handleKeywordChange(value: string) {
    setKeywordInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchKeyword(value), 150);
  }

  /** 검색 버튼/Enter → 즉시 검색 (대기 중 디바운스 취소) */
  function handleSearchNow() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchKeyword(keywordInput);
  }

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-4 md:p-6 mb-8 flex flex-col gap-4">
      <CourseSearchBar
        value={keywordInput}
        onChange={handleKeywordChange}
        onSearch={handleSearchNow}
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
        onReset={() => {
          // 대기 중 디바운스 취소 + 입력 초기화 — 안 하면 리셋 후 타이머가 이전 키워드를 재적용
          if (debounceRef.current) clearTimeout(debounceRef.current);
          setKeywordInput('');
          router.push(pathname, { scroll: false });
        }}
      />
    </div>
  );
}
