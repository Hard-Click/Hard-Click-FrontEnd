'use client';

import { useState } from 'react';
import Image from 'next/image';
import QuizFormModal from './QuizFormModal';

import type { QuizFormPayload } from '../types';
import type { QuizActionState } from '../actions';

export default function QuizCreateButton({
  courses,
  takenWeeksByCourse,
  presetCourseId,
  withInstructorSelect = false,
  adminMeta,
  createAction,
  updateAction,
}: {
  courses: { courseId: number; title: string; instructor?: string }[];
  takenWeeksByCourse: Record<number, number[]>;
  presetCourseId?: number;
  withInstructorSelect?: boolean;
  // 관리자 메타 라우팅(강사선택 UI 없이 소유자무관 takenWeeks). 미지정 시 withInstructorSelect를 따른다.
  adminMeta?: boolean;
  createAction?: (payload: QuizFormPayload) => Promise<QuizActionState>;
  updateAction?: (quizId: number, payload: QuizFormPayload) => Promise<QuizActionState>;
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
          {...(adminMeta !== undefined ? { adminMeta } : {})}
          onClose={() => setOpen(false)}
          {...(createAction ? { createAction } : {})}
          {...(updateAction ? { updateAction } : {})}
        />
      )}
    </>
  );
}
