import Link from 'next/link';
import type { CourseNotice } from '@/features/courses/types';

interface CourseNoticeSectionProps {
  notices: CourseNotice[];
  /** "전체보기" 링크 — 역할별 경로 */
  listHref: string;
  /** 개별 공지 링크 생성 함수 — 역할별 경로 */
  noticeHref: (noticeId: number) => string;
  /** 사이드네비 앵커 오프셋 — 학생 'scroll-mt-20' / 강사·관리자 'scroll-mt-6' */
  scrollMtClassName?: string;
  /** 클릭 가드 — 학생은 비로그인 차단용. 기본 항상 허용 */
  onLinkClick?: (e: React.MouseEvent) => void;
}

/**
 * 강의 상세 "공지사항" 섹션 — 학생·강사·관리자 공용.
 * 최대 3개 표시(고정 맨 위 + 최신순). 전체보기·개별 링크는 역할별 prop으로 주입.
 */
export default function CourseNoticeSection({
  notices,
  listHref,
  noticeHref,
  scrollMtClassName = 'scroll-mt-6',
  onLinkClick,
}: CourseNoticeSectionProps) {
  const sorted = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const displayed = sorted.slice(0, 3);

  return (
    <section id="notices" className={scrollMtClassName}>
      <div
        className="bg-white border border-[#E2E8F0] shadow-[0_4px_10px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col gap-6 p-[33px]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/bellBlueIcon.svg" width={20} height={20} alt="" />
            <h2 className="text-xl font-bold text-[#1F2937]">강의 공지사항</h2>
          </div>
          <Link
            href={listHref}
            onClick={onLinkClick}
            className="w-20 h-10 border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#4B5563] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
          >
            전체보기
          </Link>
        </div>

        {notices.length === 0 ? (
          <p className="text-sm text-[#9CA3AF] text-center py-4">
            공지사항이 없습니다.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {displayed.map((notice) => (
              <Link
                key={notice.noticeId}
                href={noticeHref(notice.noticeId)}
                onClick={onLinkClick}
                className={`rounded-[20px] h-[89px] overflow-hidden flex flex-col hover:opacity-80 transition-opacity px-[17px] pt-[17px] pb-[1px] ${
                  notice.isPinned
                    ? 'bg-[rgba(47,93,170,0.05)] border border-[#2F5DAA]'
                    : 'bg-white border border-[#E2E8F0]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {notice.isPinned && (
                    <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 bg-[#2F5DAA] text-white text-xs font-semibold rounded-[4px]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/pinIcon.svg"
                        width={11}
                        height={11}
                        alt=""
                        className="brightness-0 invert"
                      />
                      공지
                    </span>
                  )}
                  <p className="text-[18px] font-semibold text-[#1F2937] leading-[27px] line-clamp-1 flex-1">
                    {notice.title}
                  </p>
                  <span className="text-xs text-[#9CA3AF] flex-shrink-0">
                    {notice.createdAt}
                  </span>
                </div>
                <p className="text-sm text-[#4B5563] line-clamp-1">
                  {notice.content}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
