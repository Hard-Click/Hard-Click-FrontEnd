'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Notice } from '@/features/notices/types';

/** 상단 고정 공지 배너 (캐러셀) — Client 잎사귀 (index 상태만 보유) */
export default function CourseNoticeBanner({ notices }: { notices: Notice[] }) {
  const [noticeIndex, setNoticeIndex] = useState(0);

  if (notices.length === 0) return null;

  return (
    <div className="w-full bg-[#FEF3E2] border-b border-[#F5D9A8]">
      <div className="w-full max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src="/icons/notice.svg"
            alt="공지"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          <span className="text-[#1F2937] font-medium text-sm">
            {notices[noticeIndex].title}
          </span>
        </div>
        {notices.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setNoticeIndex((i) => (i - 1 + notices.length) % notices.length)
              }
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M10 4L6 8l4 4"
                  stroke="#4B5563"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="flex items-center gap-1.5">
              {notices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setNoticeIndex(i)}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    background:
                      i === noticeIndex ? '#F97316' : 'rgba(75,85,99,0.3)',
                  }}
                />
              ))}
            </div>
            <button
              onClick={() => setNoticeIndex((i) => (i + 1) % notices.length)}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 4l4 4-4 4"
                  stroke="#4B5563"
                  strokeWidth="1.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
