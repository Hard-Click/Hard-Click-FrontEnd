'use client';

import { useState } from 'react';
import Image from 'next/image';
import QuizFormModal from './QuizFormModal';

export default function QuizCreateButton({
  courses,
  takenWeeksByCourse,
  presetCourseId,
  withInstructorSelect = false,
}: {
  courses: { courseId: number; title: string; instructor?: string }[];
  takenWeeksByCourse: Record<number, number[]>;
  presetCourseId?: number;
  withInstructorSelect?: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 items-center gap-1.5 rounded-[10px] bg-[#2F5DAA] px-5 text-base font-semibold text-white transition hover:bg-[#274C8B]"
      >
        <Image src="/icons/plus.svg" alt="" width={20} height={20} />
        퀴즈 등록
      </button>

      {open && (
        <QuizFormModal
          mode="create"
          courses={courses}
          takenWeeksByCourse={takenWeeksByCourse}
          presetCourseId={presetCourseId}
          withInstructorSelect={withInstructorSelect}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
