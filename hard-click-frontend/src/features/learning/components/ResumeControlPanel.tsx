'use client';

import Link from 'next/link';
import type { VideoProgressItem } from '@/features/learning/types';

interface ResumeControlPanelProps {
  videos: VideoProgressItem[];
  currentVideoId: number;
  routePrefix?: string;
}

/**
 * 비디오 하단 이전 강의 / 다음 강의 버튼 패널.
 *
 * 다크 배경 (#111827) + top border (#374151).
 */
export default function ResumeControlPanel({
  videos,
  currentVideoId,
  routePrefix = '/learning/videos',
}: ResumeControlPanelProps) {
  const idx = videos.findIndex((v) => v.videoId === currentVideoId);
  const prev = idx > 0 ? videos[idx - 1] : null;
  const next = idx >= 0 && idx < videos.length - 1 ? videos[idx + 1] : null;

  return (
    <div className="bg-[#111827] border-t border-[#374151] px-4 py-[27px]">
      <div className="flex items-center justify-between">
        {prev ? (
          <Link
            href={`${routePrefix}/${prev.videoId}`}
            className="flex items-center justify-center gap-1 w-[119.3px] h-10 bg-[#1F2937] rounded-[10px] text-white text-base font-semibold hover:bg-[#374151] transition-colors"
          >
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 15L7.5 10L12.5 5" />
            </svg>
            <span>이전 강의</span>
          </Link>
        ) : (
          <div className="w-[119.3px] h-10 bg-[#1F2937] opacity-50 rounded-[10px] flex items-center justify-center gap-1 text-white text-base font-semibold cursor-not-allowed">
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.5 15L7.5 10L12.5 5" />
            </svg>
            <span>이전 강의</span>
          </div>
        )}

        {next ? (
          <Link
            href={`${routePrefix}/${next.videoId}`}
            className="flex items-center justify-center gap-1 w-[119.3px] h-10 bg-[#1F2937] rounded-[10px] text-white text-base font-semibold hover:bg-[#374151] transition-colors"
          >
            <span>다음 강의</span>
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 5L12.5 10L7.5 15" />
            </svg>
          </Link>
        ) : (
          <div className="w-[119.3px] h-10 bg-[#1F2937] opacity-50 rounded-[10px] flex items-center justify-center gap-1 text-white text-base font-semibold cursor-not-allowed">
            <span>다음 강의</span>
            <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.5 5L12.5 10L7.5 15" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
