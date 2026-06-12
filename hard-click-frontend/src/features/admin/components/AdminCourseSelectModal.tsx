'use client';

import { useState } from 'react';
import type { AdminCourseRow } from '@/mocks/admin.mock';

interface AdminCourseSelectModalProps {
  courses: AdminCourseRow[];
  onConfirm: (course: AdminCourseRow) => void;
  onClose: () => void;
}

export default function AdminCourseSelectModal({
  courses,
  onConfirm,
  onClose,
}: AdminCourseSelectModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [instructor, setInstructor] = useState('');

  const filtered = courses.filter(
    (c) =>
      (subject === '' || c.subject === subject) &&
      (instructor === '' || c.instructor === instructor)
  );

  const subjects = [...new Set(courses.map((c) => c.subject))];
  const instructors = [...new Set(courses.map((c) => c.instructor))];

  const handleConfirm = () => {
    const course = courses.find((c) => c.id === selectedId);
    if (course) onConfirm(course);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-xl">
        <h2 className="text-center text-xl font-bold text-[#1F2937]">
          강의 선택
        </h2>
        <p className="mt-2 text-center text-sm text-[#64748B]">
          강의를 선택해주세요
        </p>

        {/* 과목/강사 필터 */}
        <div className="mt-5 flex items-center gap-2">
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#4B5563] outline-none"
          >
            <option value="">과목</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#4B5563] outline-none"
          >
            <option value="">강사</option>
            {instructors.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {/* 강의 리스트 */}
        <div className="mt-4 max-h-60 overflow-y-auto rounded-xl border border-[#E2E8F0]">
          {filtered.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#94A3B8]">
              해당하는 강의가 없습니다.
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
                  selectedId === c.id
                    ? 'bg-[#EFF6FF] font-semibold text-[#2F5DAA]'
                    : 'text-[#374151] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{c.title}</span>
                <span className="text-[#94A3B8]">-</span>
                <span>{c.instructor}</span>
              </button>
            ))
          )}
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-12 flex-1 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#4B5563] hover:bg-[#F8FAFC]"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedId === null}
            className={`h-12 flex-1 rounded-xl text-sm font-semibold text-white transition ${
              selectedId !== null
                ? 'bg-[#2F5DAA] hover:bg-[#1D3E75]'
                : 'bg-[#2F5DAA] opacity-50 cursor-not-allowed'
            }`}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
