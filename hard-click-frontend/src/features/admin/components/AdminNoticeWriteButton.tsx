'use client';

import { useState } from 'react';
import type { NoticeTab } from './AdminNoticeTabs';
import type { AdminCourseRow } from '@/mocks/admin.mock';
import AdminCourseSelectModal from './AdminCourseSelectModal';
import AdminNoticeFormModal from './AdminNoticeFormModal';

interface AdminNoticeWriteButtonProps {
  activeTab: NoticeTab;
  courses: AdminCourseRow[];
  autoOpen?: boolean;
}

export default function AdminNoticeWriteButton({
  activeTab,
  courses,
  autoOpen = false,
}: AdminNoticeWriteButtonProps) {
  const [step, setStep] = useState<'none' | 'selectCourse' | 'form'>(
    autoOpen ? 'form' : 'none'
  );
  const [selectedCourse, setSelectedCourse] = useState<AdminCourseRow | null>(
    null
  );

  const handleClick = () => {
    if (activeTab === 'COURSE') {
      setStep('selectCourse'); // 강의 공지 → 강의 선택 먼저
    } else {
      setSelectedCourse(null);
      setStep('form'); // 시스템 공지 → 바로 작성
    }
  };

  const handleCourseConfirm = (course: AdminCourseRow) => {
    setSelectedCourse(course);
    setStep('form');
  };

  const handleClose = () => {
    setStep('none');
    setSelectedCourse(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className="rounded-xl bg-[#2F5DAA] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1D3E75]"
      >
        + 공지 작성
      </button>

      {step === 'selectCourse' && (
        <AdminCourseSelectModal
          courses={courses}
          onConfirm={handleCourseConfirm}
          onClose={handleClose}
        />
      )}

      {step === 'form' && (
        <AdminNoticeFormModal
          mode="create"
          courseTitle={selectedCourse?.title}
          onClose={handleClose}
        />
      )}
    </>
  );
}
