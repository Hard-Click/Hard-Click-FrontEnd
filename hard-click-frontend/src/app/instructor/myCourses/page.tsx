'use client';
import Link from 'next/link';

import MyCourseCard from '../../../features/instructor/components/MyCourseCard';
import MyCoursesFilterBar from '@/features/instructor/components/MyCoursesFilterBar';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface Course {
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

export default function MyCoursesPage() {
  const toastShown = useRef(false);

  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    const savedCourses = JSON.parse(localStorage.getItem('myCourses') || '[]');

    setCourses(savedCourses);
  }, []);

  useEffect(() => {
    const toastType = sessionStorage.getItem('courseToastType');

    if (toastType && !toastShown.current) {
      toast.success(
        toastType === 'edit'
          ? '강의 수정이 완료되었습니다.'
          : '강의 등록이 완료되었습니다.',
        {
          duration: 2000,
          className: '!flex !items-center !justify-center !text-center',
        }
      );

      toastShown.current = true;

      sessionStorage.removeItem('courseToastType');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#1E293B]">
            내 강의 관리
          </h1>

          <p className="text-base text-[#64748B]">
            등록한 강의를 관리해보세요.
          </p>
        </div>

        <Link
          href="/instructor/courses/new"
          className="rounded-xl bg-[#2F5DAA] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
        >
          + 강의 등록
        </Link>
      </div>

      <MyCoursesFilterBar />

      {/* list */}
      <div className="space-y-5">
        {courses.map((course) => (
          <MyCourseCard key={course.id} {...course} />
        ))}
      </div>
    </div>
  );
}
