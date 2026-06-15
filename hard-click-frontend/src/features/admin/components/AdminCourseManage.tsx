'use client';

import { useState, useMemo, useCallback } from 'react';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminCourseCard from './AdminCourseCard';
import Pagination from './Pagination';
import SelectDropdown from '@/components/ui/SelectDropdown';
import type {
  AdminCourseManageRow,
  AdminCourseStatus,
} from '@/mocks/admin.mock';
import {
  mockAdminSubjectOptions,
  mockAdminInstructorOptions,
} from '@/mocks/admin.mock';

type FilterTab = 'ALL' | 'PUBLISHED' | 'HIDDEN';

const PAGE_SIZE = 10;

const COURSE_TABS = [
  { key: 'ALL', label: '전체' },
  { key: 'PUBLISHED', label: '공개' },
  { key: 'HIDDEN', label: '비공개' },
];

interface Props {
  initialCourses: AdminCourseManageRow[];
}

export default function AdminCourseManage({ initialCourses }: Props) {
  const [courses, setCourses] =
    useState<AdminCourseManageRow[]>(initialCourses);
  const [keyword, setKeyword] = useState('');
  const [tab, setTab] = useState<FilterTab>('ALL');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchTab = tab === 'ALL' || c.status === tab;
      const matchKeyword = keyword
        ? c.title.includes(keyword) || c.instructor.includes(keyword)
        : true;
      return matchTab && matchKeyword;
    });
  }, [courses, keyword, tab]);

  // 탭/검색 변경 시 1페이지로 리셋
  const handleKeywordChange = (next: string) => {
    setKeyword(next);
    setPage(1);
  };
  const handleTabChange = (next: FilterTab) => {
    setTab(next);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCourses = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleStatusChange = useCallback(
    (id: number, next: AdminCourseStatus) => {
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: next } : c))
      );
    },
    []
  );

  const handleDelete = useCallback((id: number) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <AdminNoticeFilterBar
        keyword={keyword}
        placeholder="강의 검색"
        onKeywordChange={handleKeywordChange}
        tabs={COURSE_TABS}
        activeTab={tab}
        onTabChange={(key) => handleTabChange(key as FilterTab)}
      >
        <SelectDropdown
          placeholder="과목"
          value=""
          options={mockAdminSubjectOptions}
          onChange={() => {}}
        />
        <SelectDropdown
          placeholder="강사"
          value=""
          options={mockAdminInstructorOptions}
          onChange={() => {}}
        />
      </AdminNoticeFilterBar>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white py-16 text-center text-sm text-[#94A3B8]">
            해당하는 강의가 없습니다.
          </div>
        ) : (
          pagedCourses.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
