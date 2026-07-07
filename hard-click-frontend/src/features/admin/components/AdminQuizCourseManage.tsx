'use client';

import { useMemo, useState } from 'react';
import AdminQuizCourseFilterBar from './AdminQuizCourseFilterBar';
import AdminQuizCourseCard from './AdminQuizCourseCard';
import type { AdminCourseManageRow } from '@/mocks/admin.mock';

interface AdminQuizCourseManageProps {
  courses: AdminCourseManageRow[];
}

export default function AdminQuizCourseManage({
  courses,
}: AdminQuizCourseManageProps) {
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');
  const [courseId, setCourseId] = useState('');
  const [keyword, setKeyword] = useState('');

  const subjectOptions = useMemo(
    () => [
      { label: '전체', value: '' },
      ...Array.from(new Set(courses.map((c) => c.subject).filter(Boolean))).map(
        (s) => ({ label: s, value: s })
      ),
    ],
    [courses]
  );
  const instructorOptions = useMemo(
    () => [
      { label: '전체', value: '' },
      ...Array.from(
        new Set(courses.map((c) => c.instructor).filter(Boolean))
      ).map((i) => ({ label: i, value: i })),
    ],
    [courses]
  );
  const courseOptions = useMemo(
    () => [
      { label: '전체', value: '' },
      ...courses.map((c) => ({ label: c.title, value: String(c.id) })),
    ],
    [courses]
  );

  // 실시간 필터 (검색어 포함)
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return courses.filter((c) => {
      if (subject && c.subject !== subject) return false;
      if (instructor && c.instructor !== instructor) return false;
      if (courseId && String(c.id) !== courseId) return false;
      if (q && !c.title.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [courses, subject, instructor, courseId, keyword]);

  const handleReset = () => {
    setSubject('');
    setInstructor('');
    setCourseId('');
    setKeyword('');
  };

  return (
    <div className="flex flex-col gap-6">
      <AdminQuizCourseFilterBar
        subject={subject}
        instructor={instructor}
        courseId={courseId}
        keyword={keyword}
        subjectOptions={subjectOptions}
        instructorOptions={instructorOptions}
        courseOptions={courseOptions}
        onSubjectChange={setSubject}
        onInstructorChange={setInstructor}
        onCourseChange={setCourseId}
        onKeywordChange={setKeyword}
        onReset={handleReset}
      />

      <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-bold text-[#1E293B]">강의</h2>
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#94A3B8]">
            해당하는 강의가 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((course) => (
              <AdminQuizCourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
