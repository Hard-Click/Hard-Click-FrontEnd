'use client';

import { useRouter } from 'next/navigation';
import SelectDropdown from '@/components/ui/SelectDropdown';

/**
 * 수강생 퀴즈 — 과목 선택 필터 (상호작용 leaf).
 * 과목 바꾸면 해당 강의 퀴즈 페이지로 이동(server 재조회).
 */
export default function StudentQuizCourseFilter({
  courses,
  courseId,
}: {
  courses: { courseId: number; title: string }[];
  courseId: number;
}) {
  const router = useRouter();

  return (
    <SelectDropdown
      placeholder="강의 선택"
      value={String(courseId)}
      options={courses.map((c) => ({
        label: c.title,
        value: String(c.courseId),
      }))}
      onChange={(v) => router.push(`/quizzes/${v}`)}
      fullWidth
      className="w-[384px] max-w-full"
    />
  );
}
