import Link from 'next/link';
import type { Notice } from '../types';

/** 공지 카드 — 표시 전용 Server Component (Link로 상세 이동) */
export default function NoticeCard({ notice }: { notice: Notice }) {
  return (
    <Link
      href={`/notices/${notice.noticeId}`}
      className="block w-full text-left box-border border border-[#E2E8F0] rounded-[20px] p-[21px] hover:border-[#2F5DAA] transition-colors"
    >
      <div className="flex flex-row items-start gap-4">
        <div className="w-[10px] flex-shrink-0 pt-[7px]">
          {notice.isPinned && (
            <div className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-row items-center gap-2">
            {notice.isPinned && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(239,68,68,0.1)] rounded-2xl flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/pinIcon.svg" width={14} height={14} alt="" />
                <span className="text-xs font-semibold text-[#EF4444]">중요</span>
              </span>
            )}
            <span className="px-3 py-1 bg-[rgba(47,93,170,0.1)] rounded-2xl text-xs font-semibold text-[#2F5DAA] flex-shrink-0">
              전체 공지
            </span>
          </div>
          <p
            className={`text-lg font-semibold leading-7 tracking-[-0.44px] truncate ${
              notice.isPinned ? 'text-[#1F2937]' : 'text-[#4B5563]'
            }`}
          >
            {notice.title}
          </p>
          <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">
            {notice.createdAt.replace(/-/g, '.')}
          </span>
        </div>
      </div>
    </Link>
  );
}
