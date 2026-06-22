import Image from 'next/image';
import Link from 'next/link';
import NoticeCard from './NoticeCard';
import NoticeSearchBar from './NoticeSearchBar';
import type { Notice } from '../types';

/**
 * 전체(전역) 공지 목록 화면 — 표시 전용 Server Component.
 * 학생(`/notices`)과 강사(`/instructor/notices/global`)가 동일 화면을 공유한다.
 * 검색·페이지네이션·카드 상세 링크 경로는 `basePath`로 주입해 사용처 레이아웃(헤더)을 유지한다.
 */
export default function GlobalNoticeList({
  notices,
  totalPages,
  page,
  keyword,
  basePath = '/notices',
  backHref,
}: {
  notices: Notice[];
  totalPages: number;
  page: number;
  keyword: string;
  basePath?: string;
  backHref?: string;
}) {
  // 고정 공지 우선 정렬
  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (p > 0) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-[1440px] mx-auto px-[93.5px] pt-8 pb-16">
        {/* 헤더 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-[20px] bg-[#2F5DAA] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path
                  d="M14 4.67C10.32 4.67 7.33 7.65 7.33 11.33v5.25L5.25 19.83h17.5l-2.08-3.25v-5.25C20.67 7.65 17.68 4.67 14 4.67z"
                  stroke="#FFFFFF"
                  strokeWidth="2.33"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.67 19.83c0 1.29 1.04 2.34 2.33 2.34s2.33-1.05 2.33-2.34"
                  stroke="#FFFFFF"
                  strokeWidth="2.33"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h1 className="text-[30px] font-bold leading-9 tracking-[0.4px] text-[#1F2937]">
              공지사항
            </h1>
          </div>
          <p className="text-base text-[#4B5563] tracking-[-0.31px]">
            중요한 소식과 업데이트를 확인하세요.
          </p>

          {/* 뒤로가기 (사용처에서 backHref 주입 시) — 설명문 아래 */}
          {backHref && (
            <Link
              href={backHref}
              className="flex w-fit items-center gap-2 text-sm font-medium text-[#4B5563] hover:text-[#1E293B]"
            >
              <Image src="/icons/back.svg" alt="back" width={16} height={16} />
              뒤로가기
            </Link>
          )}
        </div>

        {/* 검색바 (client 잎사귀, usePathname 기반이라 경로 무관) */}
        <NoticeSearchBar keyword={keyword} />

        {/* 목록 (server) */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[33px] py-[33px]">
          {sorted.length === 0 ? (
            <p className="text-center text-[#9CA3AF] py-10">
              공지사항이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((notice) => (
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  basePath={basePath}
                />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 (Link 기반) */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page === 0 ? (
              <span className="h-9 px-3 flex items-center rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] opacity-40">
                이전
              </span>
            ) : (
              <Link
                href={pageHref(page - 1)}
                className="h-9 px-3 flex items-center rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] hover:bg-[#F1F5F9] transition-colors"
              >
                이전
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm transition-colors ${
                  page === p
                    ? 'bg-[#2F5DAA] text-white'
                    : 'border border-[#E2E8F0] text-[#4B5563] hover:bg-[#F1F5F9]'
                }`}
              >
                {p + 1}
              </Link>
            ))}
            {page >= totalPages - 1 ? (
              <span className="h-9 px-3 flex items-center rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] opacity-40">
                다음
              </span>
            ) : (
              <Link
                href={pageHref(page + 1)}
                className="h-9 px-3 flex items-center rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] hover:bg-[#F1F5F9] transition-colors"
              >
                다음
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
