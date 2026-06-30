'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import RecentCourseCard from './RecentCourseCard';
import { getInstructorCourses } from '../services';

interface Course {
  id: number;
  title: string;
  isPublic: boolean;
  students: number;
  createdAt: string;
}

export default function RecentCourseSection() {
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    getInstructorCourses(0, 3).then((res) => {
      if (!res.success || !res.data) return;

      const mapped: Course[] = res.data.content
        .filter((c) => c.status !== 'DELETED')
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 3)
        .map((c) => ({
          id: c.courseId,
          title: c.title,
          isPublic: c.status === 'PUBLISHED',
          students: c.enrollmentCount,
          createdAt: c.createdAt.split('T')[0].replaceAll('-', '.'),
        }));

      setCourses(mapped);
    });
  }, []);

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      {/* header */}
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1E293B]">최근 등록 강의</h2>
        <Link
          href="/instructor/myCourses"
          className="text-base font-semibold text-[#2F5DAA]"
        >
          전체보기
        </Link>
      </div>

      {/* list */}
      <div className="space-y-4">
        {courses.length === 0 ? (
          <p className="text-sm text-center text-[#9CA3AF] py-6">
            등록된 강의가 없습니다.
          </p>
        ) : (
          courses.map((course) => (
            <RecentCourseCard
              key={course.id}
              courseId={course.id}
              title={course.title}
              isPublic={course.isPublic}
              students={course.students}
              createdAt={course.createdAt}
            />
          ))
        )}
      </div>
    </section>
  );
}
