'use client';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import MyCourseCard from '../../../features/instructor/components/MyCourseCard';
import MyCoursesFilterBar from '@/features/instructor/components/MyCoursesFilterBar';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getInstructorCourses } from '@/features/instructor/services';

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
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('courseId')
    ? Number(searchParams.get('courseId'))
    : null;
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // courses 로드 후 해당 카드로 스크롤
  useEffect(() => {
    if (!highlightId || courses.length === 0) return;
    const el = cardRefs.current.get(highlightId);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [highlightId, courses]);
  useEffect(() => {
    // 강사 내 강의 목록 API 호출 (GET /api/instructor/courses)
    getInstructorCourses().then((res) => {
      if (!res.success || !res.data) {
        // 실패 시 localStorage 폴백
        const savedCourses = JSON.parse(
          localStorage.getItem('myCourses') || '[]',
        );
        setCourses(savedCourses);
        return;
      }
      // API 응답을 Course 형태로 변환
      const mapped: Course[] = res.data.content.map((c) => ({
        id: c.courseId,
        category: c.subjectName,
        title: c.title,
        isPublic: c.status === 'PUBLISHED',
        students: c.enrollmentCount,
        rating: c.averageRating,
        reviewCount: c.reviewCount,
        createdAt: c.createdAt.split('T')[0] ?? c.createdAt,
        price: c.price === 0 ? '무료' : `${c.price.toLocaleString()}원`,
        thumbnailUrl: c.thumbnailUrl,
      }));
      setCourses(mapped);
    });
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
        },
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
          <div
            key={course.id}
            ref={(el) => {
              if (el) cardRefs.current.set(course.id, el);
            }}
          >
            <MyCourseCard {...course} highlighted={course.id === highlightId} />
          </div>
        ))}
      </div>
    </div>
  );
}
