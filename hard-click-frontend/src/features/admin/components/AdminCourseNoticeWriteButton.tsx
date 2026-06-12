'use client';

import { useState } from 'react';
import AdminNoticeFormModal from './AdminNoticeFormModal';

export default function AdminCourseNoticeWriteButton({
  courseTitle,
}: {
  courseTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
      >
        + 공지 작성
      </button>

      {isOpen && (
        <AdminNoticeFormModal
          mode="create"
          courseTitle={courseTitle}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
