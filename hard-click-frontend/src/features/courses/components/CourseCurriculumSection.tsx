'use client';

import { useState } from 'react';
import type { CourseDetail, CurriculumLesson } from '../types';

/* ── 커리큘럼 아코디언 (학생 강의 상세) ── */
export function CurriculumAccordion({
  section,
  defaultOpen = false,
  onPreviewClick,
}: {
  section: CourseDetail['curriculum'][0];
  defaultOpen?: boolean;
  onPreviewClick: (lesson: CurriculumLesson) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const totalSecs = section.lessons.reduce((sum, l) => {
    const parts = l.duration.split(':').map(Number);
    return sum + (parts[0] || 0) * 60 + (parts[1] || 0);
  }, 0);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const totalStr = h > 0 ? `${h}시간 ${m}분` : m > 0 ? `${m}분` : totalSecs > 0 ? `${s}초` : '0분';

  return (
    <div className="border border-[#D5D8DD] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/chevronDownIcon.svg"
          width={20}
          height={20}
          alt=""
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
        <span className="flex-1 text-base font-medium text-[#1A1F2E] text-left">{section.title}</span>
        <span className="text-sm text-[#4B5563] flex-shrink-0 w-[100px] text-right">
          {section.lessons.length}강 · {totalStr}
        </span>
      </button>

      {isOpen && (
        <div>
          {section.lessons.map(lesson => {
            const rowClass = "flex items-center justify-between px-5 py-[14px] border-t border-[#D5D8DD] bg-white transition-colors";
            const inner = (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  {lesson.isPreview
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/playIcon.svg" width={16} height={16} alt="" className="flex-shrink-0" />
                    : /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/checkDarkIcon.svg" width={16} height={16} alt="" className="flex-shrink-0" />
                  }
                  <span className="text-sm text-[#374151] truncate">{lesson.title}</span>
                  {lesson.isPreview && (
                    <span className="flex-shrink-0 px-3 py-0.5 bg-[rgba(47,93,170,0.1)] text-[#2F5DAA] text-xs font-medium rounded-[14px]">
                      미리보기
                    </span>
                  )}
                </div>
                <span className="text-sm text-[#4B5563] flex-shrink-0 ml-4">{lesson.duration}</span>
              </>
            );
            return lesson.isPreview ? (
              <button
                key={lesson.lessonId}
                type="button"
                onClick={() => onPreviewClick(lesson)}
                className={`${rowClass} hover:bg-[#F0F4FB] cursor-pointer w-full text-left`}
              >
                {inner}
              </button>
            ) : (
              <div key={lesson.lessonId} className={rowClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
