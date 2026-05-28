'use client';

import Link from 'next/link';

interface CourseProgressSummaryProps {
  courseTitle: string;
  videoTitle: string;
  instructorName: string;
  progressRate: number;
  completedVideoCount: number;
  totalVideoCount: number;
  /** 강의 상세로 돌아가기 링크 */
  backHref: string;
}

export default function CourseProgressSummary({
  courseTitle,
  videoTitle,
  instructorName,
  progressRate,
  completedVideoCount,
  totalVideoCount,
  backHref,
}: CourseProgressSummaryProps) {
  const rounded = Math.round(progressRate);
  return (
    <div className="bg-[#111827] border-b border-[#374151] px-6 pt-4 pb-px">
      <div className="flex flex-col gap-4 w-full">
        {/* 첫 줄: 뒤로 + 제목 + 진도율 박스 */}
        <div className="flex items-center justify-between gap-4 h-12">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={backHref}
              aria-label="뒤로가기"
              className="w-6 h-6 flex items-center justify-center text-white"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </Link>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold leading-7 text-white truncate">{courseTitle}</h1>
              <p className="text-sm leading-5 text-[#9CA3AF] truncate">
                {videoTitle} · {instructorName}
              </p>
            </div>
          </div>

          {/* 진도율 박스 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-[#1F2937] rounded-2xl">
            <span className="text-sm text-[#9CA3AF]">진도율</span>
            <span className="text-base font-semibold text-white">{rounded}%</span>
          </div>
        </div>

        {/* 둘째 줄: 완료 + 진행바 */}
        <div className="flex flex-col gap-2">
          <div className="text-sm text-[#9CA3AF]">완료: {completedVideoCount} / {totalVideoCount}개</div>
          <div className="h-2 w-full bg-[#374151] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#2F5DAA] rounded-full transition-[width] duration-300"
              style={{ width: `${rounded}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
