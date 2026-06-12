'use client';

import { useState } from 'react';
import Image from 'next/image';
import QuizFormModal from './QuizFormModal';

/**
 * "+ 퀴즈 등록" 버튼 + 등록 모달 (헤더용 client 섬).
 * 페이지(Server)는 정적으로 두고, 등록 상호작용만 이 컴포넌트가 담당.
 */
export default function QuizCreateButton({
  courses,
}: {
  courses: { courseId: number; title: string }[];
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
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
