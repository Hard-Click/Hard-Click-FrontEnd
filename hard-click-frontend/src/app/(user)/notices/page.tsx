'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getNotices } from '@/features/notices/services';
import type { Notice } from '@/features/notices/types';

/* ── 공지 카드 ── */
function NoticeCard({ notice, onClick }: { notice: Notice; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left box-border border border-[#E2E8F0] rounded-[20px] p-[21px] hover:border-[#2F5DAA] transition-colors"
    >
      <div className="flex flex-row items-start gap-4">
        <div className="w-[10px] flex-shrink-0 pt-[7px]">
          {notice.isPinned && <div className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />}
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
          <p className={`text-lg font-semibold leading-7 tracking-[-0.44px] truncate ${notice.isPinned ? 'text-[#1F2937]' : 'text-[#4B5563]'}`}>
            {notice.title}
          </p>
          <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">
            {notice.createdAt.replace(/-/g, '.')}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ── 전체 공지 목록 페이지 ── */
export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    // GET /api/notices?type=GLOBAL&page=&size=10&keyword= (검색·페이징 서버 위임)
    getNotices({ type: 'GLOBAL', page, size: 10, keyword: search || undefined }).then((res) => {
      if (res.success && res.data) {
        setNotices(
          res.data.content.map((n) => ({
            noticeId: n.noticeId,
            title: n.title,
            content: '',
            isPinned: n.isPinned,
            createdAt: n.createdAt.split('T')[0] ?? n.createdAt,
          })),
        );
        setTotalPages(Math.max(1, res.data.totalPages ?? 1));
      }
      setLoading(false);
    });
  }, [page, search]);

  // 현재 페이지 내 고정 공지 우선 정렬
  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-[1440px] mx-auto px-[93.5px] pt-8 pb-16">
        {/* 헤더 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-[20px] bg-[#2F5DAA] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4.67C10.32 4.67 7.33 7.65 7.33 11.33v5.25L5.25 19.83h17.5l-2.08-3.25v-5.25C20.67 7.65 17.68 4.67 14 4.67z" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.67 19.83c0 1.29 1.04 2.34 2.33 2.34s2.33-1.05 2.33-2.34" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-[30px] font-bold leading-9 tracking-[0.4px] text-[#1F2937]">공지사항</h1>
          </div>
          <p className="text-base text-[#4B5563] tracking-[-0.31px]">중요한 소식과 업데이트를 확인하세요.</p>
        </div>

        {/* 검색바 */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[25px] py-[25px] mb-6">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="#4B5563" strokeWidth="1.67"/>
              <path d="M14.5 14.5l3 3" stroke="#4B5563" strokeWidth="1.67" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="공지사항 검색"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="w-full border border-[#E2E8F0] rounded-[10px] h-12 pl-12 pr-4 text-base text-[#4B5563] tracking-[-0.31px] outline-none focus:border-[#2F5DAA] transition-colors"
            />
          </div>
        </div>

        {/* 목록 */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[33px] py-[33px]">
          {loading ? (
            <p className="text-center text-[#9CA3AF] py-10">불러오는 중...</p>
          ) : sorted.length === 0 ? (
            <p className="text-center text-[#9CA3AF] py-10">공지사항이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sorted.map((notice) => (
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  onClick={() => router.push(`/notices/${notice.noticeId}`)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 (백엔드 totalPages 기준) */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors"
            >
              이전
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-9 w-9 rounded-lg text-sm transition-colors ${
                  page === p
                    ? 'bg-[#2F5DAA] text-white'
                    : 'border border-[#E2E8F0] text-[#4B5563] hover:bg-[#F1F5F9]'
                }`}
              >
                {p + 1}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] disabled:opacity-40 hover:bg-[#F1F5F9] transition-colors"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
