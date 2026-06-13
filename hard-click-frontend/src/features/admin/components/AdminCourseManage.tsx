'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminCourseCard from './AdminCourseCard';
import type {
  AdminCourseManageRow,
  AdminCourseStatus,
} from '@/mocks/admin.mock';

type FilterTab = 'ALL' | 'PUBLISHED' | 'HIDDEN';

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

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchTab = tab === 'ALL' || c.status === tab;
      const matchKeyword = keyword
        ? c.title.includes(keyword) || c.instructor.includes(keyword)
        : true;
      return matchTab && matchKeyword;
    });
  }, [courses, keyword, tab]);

  const handleStatusChange = (id: number, next: AdminCourseStatus) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: next } : c))
    );
  };

  const handleDelete = (id: number) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: 'DELETED' as AdminCourseStatus } : c
      )
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <AdminNoticeFilterBar
        keyword={keyword}
        placeholder="강의 검색"
        onKeywordChange={setKeyword}
        tabs={COURSE_TABS}
        activeTab={tab}
        onTabChange={(key) => setTab(key as FilterTab)}
      >
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#475569]"
        >
          과목
          <Image src="/icons/AdminDropDown.svg" alt="" width={14} height={14} />
        </button>
        <button
          type="button"
          className="flex h-9 items-center gap-2 rounded-xl border border-[#E2E8F0] px-4 text-sm text-[#475569]"
        >
          강사
          <Image src="/icons/AdminDropDown.svg" alt="" width={14} height={14} />
        </button>
      </AdminNoticeFilterBar>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E2E8F0] bg-white py-16 text-center text-sm text-[#94A3B8]">
            해당하는 강의가 없습니다.
          </div>
        ) : (
          filtered.map((course) => (
            <AdminCourseCard
              key={course.id}
              course={course}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
