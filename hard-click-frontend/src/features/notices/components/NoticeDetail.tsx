import Image from 'next/image';
import Link from 'next/link';
import NoticeBackButton from './NoticeBackButton';
import type { NoticeDetail as NoticeDetailType } from '../types';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

/**
 * 공지 상세 화면 — 표시 전용 Server Component.
 * 학생(`/notices`)과 강사(`/instructor/notices/global`)가 공유한다.
 * '목록으로 돌아가기'·이전 공지 링크 경로는 `backHref`로 주입해 사용처 레이아웃(헤더)을 유지한다.
 */
export default function NoticeDetail({
  notice,
  backHref = '/notices',
}: {
  notice: NoticeDetailType | null;
  backHref?: string;
}) {
  if (!notice) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
        <div className="mx-auto w-full max-w-[760px]">
          <div className="py-20 text-center text-[#64748B]">
            공지사항을 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FB] px-8 py-10">
      <div className="mx-auto w-full max-w-[760px]">
        {/* 뒤로가기 — 실제 이전 페이지(강의 상세 등)로 복귀, 없으면 backHref */}
        <NoticeBackButton fallbackHref={backHref} />

        {/* 공지 카드 */}
        <div className="rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
          {/* 뱃지 */}
          <div className="mb-4 flex items-center gap-2">
            {notice.isPinned && (
              <span className="flex items-center gap-1 rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-semibold text-[#B91C1C]">
                <Image
                  src="/icons/noticePin.svg"
                  alt="pin"
                  width={12}
                  height={12}
                />
                중요
              </span>
            )}
            <span className="rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#2F5DAA]">
              {notice.noticeType === 'GLOBAL' ? '전체 공지' : '강의 공지'}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="mb-4 text-2xl font-bold text-[#1E293B]">
            {notice.title}
          </h1>

          {/* 작성자 · 날짜 */}
          <div className="mb-6 flex items-center gap-2 text-sm text-[#64748B]">
            <span>{notice.courseName ?? '관리자'}</span>
            <span>•</span>
            <span>{formatDate(notice.createdAt)}</span>
          </div>

          {/* 구분선 */}
          <div className="mb-6 h-px bg-[#E2E8F0]" />

          {/* 본문 */}
          <p className="whitespace-pre-line text-sm leading-7 text-[#374151]">
            {notice.content}
          </p>
        </div>

        {/* 이전 공지 네비게이션 (백엔드 previousNotice 연결) */}
        {notice.previousNotice && (
          <Link
            href={`${backHref}/${notice.previousNotice.noticeId}`}
            replace
            className="mt-4 block w-full rounded-2xl border border-[#E2E8F0] bg-white px-6 py-4 text-left shadow-sm transition-colors hover:border-[#2F5DAA]"
          >
            <p className="mb-1 text-xs text-[#94A3B8]">&gt; 이전 공지</p>
            <p className="text-sm font-semibold text-[#1E293B]">
              {notice.previousNotice.title}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
