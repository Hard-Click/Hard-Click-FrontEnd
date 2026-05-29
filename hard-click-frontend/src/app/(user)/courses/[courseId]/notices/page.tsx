'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getCourseDetail } from '@/features/courses/services';
import { getCourseNotices } from '@/features/notices/services';
import type { CourseNotice, CourseDetail } from '@/features/courses/types';
import type { Notice } from '@/features/notices/types';

/* ── 공지 카드 ── */
function NoticeCard({ notice, instructorName }: { notice: CourseNotice; instructorName: string }) {
  return (
    <div className="w-full box-border border border-[#E2E8F0] rounded-[20px] h-[131px] relative overflow-hidden hover:border-[#2F5DAA] transition-colors cursor-pointer">
      <div className="absolute left-[21px] top-[21px] right-[21px] bottom-[21px] flex flex-row items-start gap-4">

        {/* 중요 빨간 점 */}
        <div className="w-[10px] flex-shrink-0 pt-[7px]">
          {notice.isPinned && (
            <div className="w-[10px] h-[10px] rounded-full bg-[#EF4444]" />
          )}
        </div>

        {/* 내용 */}
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {/* 뱃지 */}
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

          {/* 제목 */}
          <p className={`text-lg font-semibold leading-7 tracking-[-0.44px] truncate ${notice.isPinned ? 'text-[#1F2937]' : 'text-[#4B5563]'}`}>
            {notice.title}
          </p>

          {/* 강사 • 날짜 */}
          <div className="flex flex-row items-center gap-4">
            <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">{instructorName}</span>
            <span className="text-sm font-medium text-[#4B5563]">•</span>
            <span className="text-sm font-medium text-[#4B5563] tracking-[-0.15px]">
              {notice.createdAt.replace(/-/g, '.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function CourseNoticesPage() {
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getCourseDetail(courseId).then((data) => {
      setCourse(data);
      setLoading(false);
    });
    // 강의 공지 목록 (GET /api/notices?type=COURSE&courseId=)
    getCourseNotices(courseId).then(setNotices);
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
      </div>
    );
  }

  const sortedNotices = [...notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredNotices = sortedNotices.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="w-full max-w-[1440px] mx-auto px-[93.5px] pt-8 pb-16">

        {/* 헤더 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-row items-center gap-3">
            {/* 벨 아이콘 */}
            <div className="w-12 h-12 rounded-[20px] bg-[#2F5DAA] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 4.67C10.32 4.67 7.33 7.65 7.33 11.33v5.25L5.25 19.83h17.5l-2.08-3.25v-5.25C20.67 7.65 17.68 4.67 14 4.67z" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M11.67 19.83c0 1.29 1.04 2.34 2.33 2.34s2.33-1.05 2.33-2.34" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round"/>
                <path d="M14 2.33v2.34" stroke="#FFFFFF" strokeWidth="2.33" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-[30px] font-bold leading-9 tracking-[0.4px] text-[#1F2937]">
              강의 공지사항 - {course.title}
            </h1>
          </div>

          <p className="text-base text-[#4B5563] tracking-[-0.31px]">
            중요한 소식과 업데이트를 확인하세요.
          </p>

          {/* 강의로 돌아가기 */}
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center gap-1.5 text-[#4B5563] font-semibold text-base hover:text-[#1F2937] transition-colors w-fit"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 5L7.5 10l5 5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            강의로 돌아가기
          </Link>
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
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#E2E8F0] rounded-[10px] h-12 pl-12 pr-4 text-base text-[#4B5563] tracking-[-0.31px] outline-none focus:border-[#2F5DAA] transition-colors"
            />
          </div>
        </div>

        {/* 공지 목록 */}
        <div className="w-full bg-white border border-[#E2E8F0] shadow-[0px_4px_10px_rgba(0,0,0,0.06)] rounded-2xl px-[33px] py-[33px]">
          {filteredNotices.length === 0 ? (
            <p className="text-center text-[#9CA3AF] py-10">공지사항이 없습니다.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredNotices.map((notice) => (
                <NoticeCard
                  key={notice.noticeId}
                  notice={notice}
                  instructorName={course.instructorName}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
