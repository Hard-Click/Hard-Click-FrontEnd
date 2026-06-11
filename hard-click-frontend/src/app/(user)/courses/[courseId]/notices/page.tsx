import Link from 'next/link';
import { getCourseDetailServer } from '@/features/courses/server';
import { getCourseNoticesServer } from '@/features/notices/server';
import type { Notice } from '@/features/notices/types';
import NoticeSearchInput from './NoticeSearchInput';

/* ── 공지 카드 (순수 표시) ── */
function NoticeCard({
  notice,
  instructorName,
}: {
  notice: Notice;
  instructorName: string;
}) {
  return (
    <Link
      href={`/notices/${notice.noticeId}`}
      className="block w-full box-border border border-[#E2E8F0] rounded-[20px] h-[131px] relative overflow-hidden hover:border-[#2F5DAA] transition-colors"
    >
      <div className="absolute left-[21px] top-[21px] right-[21px] bottom-[21px] flex flex-row items-start gap-4">
        {/* 중요 빨간 점 */}
        <div className="w-[10px] flex-shrink-0 pt-[7px]">
          {notice.isPinned && (
            <div className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
          )}
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-row items-center gap-2">
            {notice.isPinned && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[rgba(239,68,68,0.1)] rounded-2xl flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icons/pinIcon.svg" width={14} height={14} alt="" />
                <span className="text-xs font-semibold text-[#EF4444]">중요</span>
              </span>
            )}
            <span className="px-3 py-1 bg-[rgba(22,163,74,0.1)] rounded-2xl text-xs font-semibold text-[#16A34A] flex-shrink-0">
              강의 공지
            </span>
          </div>

          <p
            className={`text-lg font-semibold leading-7 tracking-[-0.44px] truncate ${notice.isPinned ? 'text-[#1F2937]' : 'text-[#4B5563]'}`}
          >
            {notice.title}
          </p>

          <div className="flex flex-row items-center gap-4">
            <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">{instructorName}</span>
            <span className="text-sm font-medium text-[#4B5563]">•</span>
            <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">
              {notice.createdAt.replace(/-/g, '.')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function CourseNoticesPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ page?: string; keyword?: string }>;
}) {
  const { courseId: courseIdStr } = await params;
  const sp = await searchParams;
  const courseId = Number(courseIdStr);
  const page = Number(sp.page ?? '0') || 0;
  const keyword = sp.keyword ?? '';

  // 서버에서 강의 정보 + 강의 공지(검색/페이징) 동시 확보
  const [course, { notices, totalPages }] = await Promise.all([
    getCourseDetailServer(courseId),
    getCourseNoticesServer(courseId, { page, keyword: keyword || undefined }),
  ]);

  if (!course) {
    return <div className="min-h-screen bg-[#F8FAFC]" />;
  }

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const pageHref = (p: number) =>
    keyword ? `?page=${p}&keyword=${encodeURIComponent(keyword)}` : `?page=${p}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full max-w-[1440px] mx-auto px-[93.5px] pt-8 pb-16">
        {/* 헤더 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-row items-center gap-3">
            <div className="w-12 h-12 rounded-[20px] bg-[#2F5DAA] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4.67C10.32 4.67 7.33 7.65 7.33 11.33v5.25L5.25 19.83h17.5l-2.08-3.25v-5.25C20.67 7.65 17.68 4.67 14 4.67z" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11.67 19.83c0 1.29 1.04 2.34 2.33 2.34s2.33-1.05 2.33-2.34" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" />
                <path d="M14 2.33v2.34" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-[30px] font-bold leading-9 tracking-[0.4px] text-[#1F2937]">
              강의 공지사항 - {course.title}
            </h1>
          </div>

          <p className="text-base text-[#4B5563] tracking-[-0.31px]">
            중요한 소식과 업데이트를 확인하세요.
          </p>

          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 text-[#4B5563] font-semibold text-base hover:text-[#1F2937] transition-colors w-fit"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            강의로 돌아가기
          </Link>
        </div>

        {/* 검색바 (client 잎사귀) */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[25px] py-[25px] mb-6">
          <NoticeSearchInput initial={keyword} />
        </div>

        {/* 공지 목록 */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[33px] py-[33px]">
          {sortedNotices.length === 0 ? (
            <p className="text-center text-[#9CA3AF] py-10">공지사항이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {sortedNotices.map((notice) => (
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  instructorName={course.instructorName}
                />
              ))}
            </div>
          )}
        </div>

        {/* 페이지네이션 (백엔드 totalPages 기준, Link 기반) */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            {page > 0 ? (
              <Link
                href={pageHref(page - 1)}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] hover:bg-[#F1F5F9] transition-colors flex items-center"
              >
                이전
              </Link>
            ) : (
              <span className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] opacity-40 flex items-center">
                이전
              </span>
            )}
            {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
              <Link
                key={p}
                href={pageHref(p)}
                className={`h-9 w-9 rounded-lg text-sm transition-colors flex items-center justify-center ${
                  page === p
                    ? 'bg-[#2F5DAA] text-white'
                    : 'border border-[#E2E8F0] text-[#4B5563] hover:bg-[#F1F5F9]'
                }`}
              >
                {p + 1}
              </Link>
            ))}
            {page < totalPages - 1 ? (
              <Link
                href={pageHref(page + 1)}
                className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] hover:bg-[#F1F5F9] transition-colors flex items-center"
              >
                다음
              </Link>
            ) : (
              <span className="h-9 px-3 rounded-lg border border-[#E2E8F0] text-sm text-[#4B5563] opacity-40 flex items-center">
                다음
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
