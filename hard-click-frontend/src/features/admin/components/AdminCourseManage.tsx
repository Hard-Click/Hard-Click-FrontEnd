'use client';

import { useState, useMemo, useCallback } from 'react';
import AdminNoticeFilterBar from './AdminNoticeFilterBar';
import AdminCourseCard from './AdminCourseCard';
import Pagination from './Pagination';
import SelectDropdown from '@/components/ui/SelectDropdown';
import { deleteCourse, publishCourse } from '@/features/instructor/services';
import { toast } from '@/lib/toast';
import type {
  AdminCourseManageRow,
  AdminCourseStatus,
} from '@/mocks/admin.mock';
import { mockAdminSubjectOptions } from '@/mocks/admin.mock';

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
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');
  const [page, setPage] = useState(1);

  // 강사 옵션은 고정 mock 목록 대신 실제 목록에 등장하는 강사명으로 구성한다.
  const instructorOptions = useMemo(() => {
    const names = Array.from(new Set(courses.map((c) => c.instructor))).sort();
    return [
      { label: '전체', value: '' },
      ...names.map((name) => ({ label: name, value: name })),
    ];
  }, [courses]);

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

  // 탭/검색/필터 변경 시 1페이지로 리셋
  const handleKeywordChange = (next: string) => {
    setKeyword(next);
    setPage(1);
  };
  const handleTabChange = (next: FilterTab) => {
    setTab(next);
    setPage(1);
  };
  const handleSubjectChange = (next: string) => {
    setSubject(next);
    setPage(1);
  };
  const handleInstructorChange = (next: string) => {
    setInstructor(next);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedCourses = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const handleStatusChange = useCallback(
    async (id: number, next: AdminCourseStatus): Promise<boolean> => {
      try {
        const result = await publishCourse(id, next === 'PUBLISHED');
        if (!result.success) {
          toast.error('상태 변경에 실패했습니다.');
          return false;
        }
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: next } : c))
        );
        toast.success(
          next === 'PUBLISHED' ? '강의가 공개되었습니다.' : '강의가 비공개되었습니다.'
        );
        return true;
      } catch {
        toast.error('상태 변경 중 오류가 발생했습니다.');
        return false;
      }
    },
    []
  );

  const handleDelete = useCallback(async (id: number): Promise<boolean> => {
    try {
      const result = await deleteCourse(id);
      if (!result.success) {
        toast.error('강의 삭제에 실패했습니다.');
        return false;
      }
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success('강의가 삭제되었습니다.');
      return true;
    } catch {
      toast.error('강의 삭제 중 오류가 발생했습니다.');
      return false;
    }
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
          value={subject}
          options={mockAdminSubjectOptions}
          onChange={handleSubjectChange}
        />
        <SelectDropdown
          placeholder="강사"
          value={instructor}
          options={instructorOptions}
          onChange={handleInstructorChange}
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
