'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Notice } from '@/features/notices/types';

/**
 * 상단 고정 공지 배너 (캐러셀) — Client 잎사귀(index 상태).
 * 배너 전체를 클릭하면 전체 공지사항(`/notices`)으로 이동. (강의 공지가 아니라 전역 공지)
 * 캐러셀 화살표/점만 예외로 동작(이동 대신 항목 전환).
 */
export default function CourseNoticeBanner({ notices }: { notices: Notice[] }) {
  const [noticeIndex, setNoticeIndex] = useState(0);

  if (notices.length === 0) return null;

  return (
    <div className="relative w-full bg-[#FEF3E2] border-b border-[#F5D9A8] transition-colors hover:bg-[#FDECCB]">
      {/* 배너 전체 클릭 영역 → 전체 공지사항. 화살표보다 아래 레이어 */}
      <Link
        href="/notices"
        className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F97316]"
        aria-label="전체 공지사항 보기"
      />
      {/* 내용: 클릭은 아래 Link로 통과(pointer-events-none), 캐러셀만 예외(pointer-events-auto) */}
      <div className="pointer-events-none relative z-10 w-full max-w-[1440px] mx-auto px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Image
            src="/icons/notice.svg"
            alt="공지"
            width={20}
            height={20}
            className="flex-shrink-0"
          />
          <span className="truncate text-[#1F2937] font-medium text-sm">
            {notices[noticeIndex].title}
          </span>
        </div>
        {notices.length > 1 && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setNoticeIndex((i) => (i - 1 + notices.length) % notices.length)
              }
              aria-label="이전 공지"
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
                  type="button"
                  onClick={() => setNoticeIndex(i)}
                  aria-label={`공지 ${i + 1}`}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{
                    background:
                      i === noticeIndex ? '#F97316' : 'rgba(75,85,99,0.3)',
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setNoticeIndex((i) => (i + 1) % notices.length)}
              aria-label="다음 공지"
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
