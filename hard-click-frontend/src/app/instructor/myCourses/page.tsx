'use client';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import MyCourseCard from '../../../features/instructor/components/MyCourseCard';
import MyCoursesFilterBar from '@/features/instructor/components/MyCoursesFilterBar';
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

/* useSearchParams는 Suspense 안에서만 안전하게 쓸 수 있음 */
function HighlightScroller({ cardRefs }: { cardRefs: React.MutableRefObject<Map<number, HTMLDivElement>> }) {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('courseId') ? Number(searchParams.get('courseId')) : null;

  useEffect(() => {
    if (!highlightId) return;
    const el = cardRefs.current.get(highlightId);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }, [highlightId, cardRefs]);

  return null;
}

export default function MyCoursesPage() {
  const toastShown = useRef(false);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');
  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);

  /* 필터/검색어 바뀔 때마다 courses 갱신 */
  useEffect(() => {
    setCourses(
      allCourses.filter((c) => {
        const matchFilter =
          filter === 'ALL' ||
          (filter === 'PUBLIC' && c.isPublic) ||
          (filter === 'PRIVATE' && !c.isPublic);
        const matchKeyword =
          !submittedKeyword ||
          c.title.toLowerCase().includes(submittedKeyword.toLowerCase());
        return matchFilter && matchKeyword;
      }),
    );
  }, [allCourses, filter, submittedKeyword]);

  /* 강사 강의 목록 API */
  useEffect(() => {
    getInstructorCourses().then((res) => {
      if (!res.success || !res.data) {
        const savedCourses = JSON.parse(localStorage.getItem('myCourses') || '[]');
        setAllCourses(savedCourses);
        return;
      }
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
      setAllCourses(mapped);
    });
  }, []);

  /* 등록/수정 완료 토스트 */
  useEffect(() => {
    const toastType = sessionStorage.getItem('courseToastType');
    if (toastType && !toastShown.current) {
      toast.success(
        toastType === 'edit' ? '강의 수정이 완료되었습니다.' : '강의 등록이 완료되었습니다.',
        { duration: 2000, className: '!flex !items-center !justify-center !text-center' },
      );
      toastShown.current = true;
      sessionStorage.removeItem('courseToastType');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      {/* Suspense로 useSearchParams 분리 */}
      <Suspense fallback={null}>
        <HighlightScroller cardRefs={cardRefs} />
      </Suspense>

      {/* header */}
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
        filter={filter}
        keyword={keyword}
        onFilterChange={setFilter}
        onKeywordChange={setKeyword}
        onSearch={() => setSubmittedKeyword(keyword.trim())}
      />

      {/* list */}
      <div className="space-y-5">
        {courses.map((course) => (
          <div
            key={course.id}
            ref={(el) => { if (el) cardRefs.current.set(course.id, el); }}
          >
            <MyCourseCard
              {...course}
              highlighted={false}
              onStatusChange={(id, isPublic) =>
                setAllCourses((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, isPublic } : c)),
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}
