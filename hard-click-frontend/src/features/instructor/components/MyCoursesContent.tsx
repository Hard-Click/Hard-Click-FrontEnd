'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import MyCourseCard from '@/features/instructor/components/MyCourseCard';
import MyCoursesFilterBar from '@/features/instructor/components/MyCoursesFilterBar';

export interface Course {
  id: number;
  category: string;
  title: string;
  isPublic: boolean;
  students: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  price: string;
  thumbnailUrl?: string;
}

export default function MyCoursesContent({ courses }: { courses: Course[] }) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('courseId') ? Number(searchParams.get('courseId')) : null;
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const toastShown = useRef(false);

  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());

  const handleDeleted = (id: number) => {
    setDeletedIds((prev) => new Set(prev).add(id));
  };

  const filteredCourses = courses.filter((c) => {
    if (deletedIds.has(c.id)) return false;
    const matchFilter =
      selectedFilter === 'ALL' ||
      (selectedFilter === 'PUBLIC' && c.isPublic) ||
      (selectedFilter === 'PRIVATE' && !c.isPublic);
    const matchKeyword = c.title.toLowerCase().includes(keyword.toLowerCase());
    return matchFilter && matchKeyword;
  });

  useEffect(() => {
    if (!highlightId || courses.length === 0) return;
    const el = cardRefs.current.get(highlightId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }, [highlightId, courses]);

  useEffect(() => {
    const toastType = sessionStorage.getItem('courseToastType');
    if (toastType && !toastShown.current) {
      toast.success(
        toastType === 'edit' ? '강의 수정이 완료되었습니다.' : '강의 등록이 완료되었습니다.',
        { duration: 2000 },
      );
      toastShown.current = true;
      sessionStorage.removeItem('courseToastType');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[1152px]">
        <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#1E293B]">내 강의 관리</h1>
          <p className="text-base text-[#64748B]">등록한 강의를 관리해보세요.</p>
        </div>
        <Link
          href="/instructor/courses/new"
          className="rounded-xl bg-[#2F5DAA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          + 강의 등록
        </Link>
      </div>

      <MyCoursesFilterBar
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        keyword={keyword}
        onKeywordChange={setKeyword}
      />

      <div className="space-y-5">
        {filteredCourses.length === 0 ? (
          <div className="py-20 text-center text-[#64748B]">해당하는 강의가 없습니다.</div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course.id} ref={(el) => { if (el) cardRefs.current.set(course.id, el); }}>
              <MyCourseCard {...course} highlighted={course.id === highlightId} onDeleted={handleDeleted} />
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}