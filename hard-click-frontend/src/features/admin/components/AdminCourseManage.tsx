'use client';

import { useState, useMemo } from 'react';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminCourseCard from './AdminCourseCard';
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
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchTab = tab === 'ALL' || c.status === tab;
      const matchKeyword = keyword
        ? c.title.includes(keyword) || c.instructor.includes(keyword)
        : true;
      const matchSubject = subject ? c.subject === subject : true;
      const matchInstructor = instructor ? c.instructor === instructor : true;
      return matchTab && matchKeyword && matchSubject && matchInstructor;
    });
  }, [courses, keyword, tab, subject, instructor]);

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
        <SelectDropdown
          placeholder="과목"
          value={subject}
          options={mockAdminSubjectOptions}
          onChange={setSubject}
        />
        <SelectDropdown
          placeholder="강사"
          value={instructor}
          options={mockAdminInstructorOptions}
          onChange={setInstructor}
        />
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
