'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteCourse, publishCourse } from '@/features/instructor/services';
import type {
  CourseDetail,
  Review,
  CurriculumLesson,
} from '@/features/courses/types';
import { StarRow, StarIcon } from '@/components/common/RatingStars';
import { CurriculumAccordion } from '@/features/instructor/components/InstructorCurriculumSection';
import PreviewVideoModal from '@/features/learning/components/PreviewVideoModal';

/* ── 강의 에러 화면 공통 컴포넌트 ── */
function CourseErrorScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-[157.5px] py-6">
      <div className="bg-white border border-[#D5D8DD] rounded-2xl flex flex-col items-center justify-center py-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
        <p className="text-[#1A1F2E] font-bold text-xl mt-[41px] mb-[26.5px]">
          {title}
        </p>
        <p className="text-[#6B7280] text-sm">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── 사이드 네비게이션 ── */
const NAV_ITEMS = [
  { id: 'notices', label: '공지사항' },
  { id: 'instructor', label: '강사소개' },
  { id: 'intro', label: '강의소개' },
  { id: 'curriculum', label: '커리큘럼' },
  { id: 'reviews', label: '수강평' },
];

function SideNav({
  activeId,
  onNav,
}: {
  activeId: string;
  onNav: (id: string) => void;
}) {
  const scrollTo = (id: string) => {
    onNav(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className="bg-white border border-[#D9DDE3] rounded-[14px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-4px_rgba(0,0,0,0.1)]"
      style={{ width: 106, padding: '13px 13px 13px' }}
    >
      {/* Figma: Navigation container — flex-col, gap: 8px, width 80px */}
      <div className="flex flex-col gap-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className={`w-20 h-10 flex items-center justify-center rounded-2xl text-sm font-medium transition-colors ${
              activeId === item.id
                ? 'bg-[#2F5DAA] text-white'
                : 'text-[#5B6678] hover:bg-[#F0F2F5]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── 메인 페이지 ── */
export default function InstructorCourseDetailContent({
  initialCourse,
}: {
  initialCourse: CourseDetail | null;
}) {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseid);

  const [course, setCourse] = useState<CourseDetail | null>(initialCourse);
  const [activeSection, setActiveSection] = useState('notices');
  const [previewLesson, setPreviewLesson] = useState<CurriculumLesson | null>(
    null
  );

  /* 강사 액션 상태 */
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [reviews] = useState<Review[]>(initialCourse?.reviews ?? []);
  const [reviewPage, setReviewPage] = useState(1);

  /* 케밥 메뉴 외부 클릭 닫기 */
  useEffect(() => {
    if (!isMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isMenuOpen]);

  const handleScroll = () => {
    const offset = 120;
    for (const { id } of [...NAV_ITEMS].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        setActiveSection(id);
        return;
      }
    }
    setActiveSection('notices');
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── 강사 액션 ── */
  const handleEditClick = () => {
    setIsMenuOpen(false);
    router.push(`/instructor/courses/${courseId}/edit`);
  };

  const handleToggleStatusConfirm = async () => {
    if (!course) return;
    setIsMutating(true);
    const nextPublished = course.status !== 'PUBLISHED';
    const res = await publishCourse(courseId, nextPublished);
    setIsMutating(false);
    if (!res.success) {
      toast.error(res.message || '상태 전환에 실패했습니다.');
      return;
    }
    setCourse({ ...course, status: nextPublished ? 'PUBLISHED' : 'DRAFT' });
    setIsStatusModalOpen(false);
    toast.success(res.message);
  };

  const handleDeleteConfirm = async () => {
    setIsMutating(true);
    const res = await deleteCourse(courseId);
    setIsMutating(false);
    if (!res.success) {
      toast.error(res.message || '강의 삭제에 실패했습니다.');
      return;
    }
    setIsDeleteModalOpen(false);
    toast.success(res.message || '강의가 삭제되었습니다.');
    router.push('/instructor/courses');
  };

  const isPublished = course?.status === 'PUBLISHED';

  // UA-P0-104: 강의 없음 / 삭제 / 접근불가 에러 처리
  if (!course) {
    return (
      <CourseErrorScreen
        title="존재하지 않는 강의입니다."
        subtitle="강의 목록에서 다른 강의를 확인해보세요."
      />
    );
  }
  if (course.status === 'DELETED') {
    return (
      <CourseErrorScreen
        title="삭제된 강의입니다."
        subtitle="강의 목록에서 다른 강의를 확인해보세요."
      />
    );
  }
  if (course.status === 'HIDDEN') {
    return (
      <CourseErrorScreen
        title="현재 접근할 수 없는 강의입니다."
        subtitle="강의 정보를 다시 확인해주세요."
      />
    );
  }

  const REVIEWS_PER_PAGE = 5;
  const maxRatingCount = Math.max(
    ...course.ratingDistribution.map((d) => d.count),
    1
  );
  const totalReviewPages = Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  const displayedReviews = reviews.slice(
    (reviewPage - 1) * REVIEWS_PER_PAGE,
    reviewPage * REVIEWS_PER_PAGE
  );
  // 공지 고정 맨 위, 나머지 최신순 정렬
  const sortedNotices = [...course.notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const displayedNotices = sortedNotices.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 토스트는 sonner Toaster가 layout.tsx에서 처리 */}

      {/* 외부 패딩 */}
      <div className="w-full max-w-[1440px] mx-auto px-[157.5px]">
        {/* 내부 패딩 */}
        <div className="pt-10 px-8 pb-0 flex flex-col gap-8">
          {/* ── 히어로 카드 ── */}
          <div
            className="bg-white border border-[#D5D8DD] relative"
            style={{ padding: '33px 33px 1px' }}
          >
            <div className="flex flex-col gap-6">
              {/* Row 1: 썸네일 + 강의 정보 */}
              <div className="flex gap-6">
                {/* 썸네일 */}
                <div className="flex-shrink-0 self-start w-[282px] h-[262px] bg-[#1A1F2E] rounded-2xl overflow-hidden relative">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        width="56"
                        height="56"
                        viewBox="0 0 56 56"
                        fill="none"
                      >
                        <path
                          d="M16 12L44 28L16 44V12Z"
                          fill="rgba(255,255,255,0.4)"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* 강의 정보 */}
                <div className="w-[588px] flex flex-col gap-3">
                  {/* 제목 */}
                  <h1 className="text-[30px] font-semibold leading-9 text-[#1A1F2E]">
                    {course.title}
                  </h1>

                  {/* 설명 */}
                  <p className="text-base font-normal text-[#1A1F2E] leading-[26px]">
                    {course.description}
                  </p>

                  {/* 강사 */}
                  <p className="text-sm text-[#1A1F2E]">
                    강사:{' '}
                    <span className="text-base font-medium text-[#1A1F2E]">
                      {course.instructorName}
                    </span>
                  </p>

                  {/* 별점 */}
                  <div className="flex items-center gap-2">
                    <StarRow rating={course.averageRating} size={20} />
                    <span className="text-lg font-semibold text-[#1A1F2E]">
                      {course.averageRating}
                    </span>
                    <span className="text-base text-[#1A1F2E]">
                      ({course.reviewCount.toLocaleString()}개 리뷰)
                    </span>
                  </div>

                  {/* 통계 행: 수강생 수 · 총 강의시간 · 난이도 */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/studentsIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                      />
                      <span className="text-sm text-[#1A1F2E]">
                        {course.studentCount.toLocaleString()}명 수강
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/clockGrayIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                      />
                      <span className="text-sm text-[#1A1F2E]">
                        {course.totalDuration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/trendUpIcon.svg"
                        width={16}
                        height={16}
                        alt=""
                      />
                      <span className="text-sm text-[#1A1F2E]">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div>
                    {course.isFree ? (
                      <span className="text-[30px] font-bold text-[#16A34A]">
                        무료
                      </span>
                    ) : (
                      <span className="text-[30px] font-bold text-[#2F5DAA]">
                        ₩{course.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 강사 케밥 메뉴 (우측 상단) */}
              <div ref={menuRef} className="absolute top-[33px] right-[33px]">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((v) => !v)}
                  aria-label="강의 관리 메뉴"
                  className="w-6 h-6 flex items-center justify-center text-[#1A1F2E] hover:bg-[#F3F4F6] rounded transition-colors"
                >
                  <svg width="5" height="19" viewBox="0 0 5 19" fill="none">
                    <circle cx="2.5" cy="2.5" r="2.5" fill="#1A1F2E" />
                    <circle cx="2.5" cy="9.5" r="2.5" fill="#1A1F2E" />
                    <circle cx="2.5" cy="16.5" r="2.5" fill="#1A1F2E" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 w-[136px] bg-white border border-[#E2E8F0] rounded-[14px] shadow-md overflow-hidden z-20">
                    <button
                      type="button"
                      onClick={handleEditClick}
                      className="w-full h-[34px] text-base text-[#67798D] hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors"
                    >
                      강의 수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsDeleteModalOpen(true);
                      }}
                      className="w-full h-[34px] text-base text-[#67798D] hover:bg-[#F8FAFC] border-b border-[#E2E8F0] transition-colors"
                    >
                      강의 삭제
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsStatusModalOpen(true);
                      }}
                      className="w-full h-[34px] text-base text-[#67798D] hover:bg-[#F8FAFC] transition-colors"
                    >
                      {isPublished ? '강의 비공개' : '강의 공개'}
                    </button>
                  </div>
                )}
              </div>

              {/* Row 2: 강의 상태 표시 (읽기 전용 — 변경은 케밥 메뉴에서) */}
              <div className="border-t border-[#D5D8DD] pt-6 pb-8">
                <div
                  className={`w-full h-14 rounded-[10px] font-semibold text-base border flex items-center justify-center cursor-default ${
                    isPublished
                      ? 'bg-[rgba(22,163,74,0.1)] border-[rgba(22,163,74,0.2)] text-[#1F2937]'
                      : 'bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)] text-[#1F2937]'
                  }`}
                >
                  {isPublished ? '공개' : '비공개'}
                </div>
              </div>
            </div>
          </div>

          {/* ── 메인 콘텐츠 (풀 너비) ── */}
          <div className="flex flex-col gap-8">
            {/* ── 공지사항 ── */}
            <section id="notices" className="scroll-mt-6">
              <div
                className="bg-white border border-[#E2E8F0] shadow-[0_4px_10px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col gap-6"
                style={{ padding: '33px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/bellBlueIcon.svg"
                      width={20}
                      height={20}
                      alt=""
                    />
                    <h2 className="text-xl font-bold text-[#1F2937]">
                      강의 공지사항
                    </h2>
                  </div>
                  <Link
                    href={`/instructor/courses/${courseId}/notices`}
                    className="w-20 h-10 border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#4B5563] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
                  >
                    전체보기
                  </Link>
                </div>

                {course.notices.length === 0 ? (
                  <p className="text-sm text-[#9CA3AF] text-center py-4">
                    공지사항이 없습니다.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {displayedNotices.map((notice) => (
                      <Link
                        key={notice.noticeId}
                        href={`/instructor/courses/${courseId}/notices/${notice.noticeId}`}
                        className={`rounded-[20px] h-[89px] overflow-hidden flex flex-col hover:opacity-80 transition-opacity ${
                          notice.isPinned
                            ? 'bg-[rgba(47,93,170,0.05)] border border-[#2F5DAA]'
                            : 'bg-white border border-[#E2E8F0]'
                        }`}
                        style={{ padding: '17px 17px 1px' }}
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
                                style={{ filter: 'brightness(0) invert(1)' }}
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

            {/* ── 강사소개 ── */}
            <section id="instructor" className="scroll-mt-6">
              <div
                className="bg-white border border-[#D5D8DD]"
                style={{ padding: '33px 33px 1px' }}
              >
                <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">
                  강사소개
                </h2>

                <div className="flex items-start gap-6 pb-8">
                  <div className="flex-shrink-0 w-28 h-28 rounded-full border-2 border-[#D5D8DD] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/image/Image (박지훈).svg"
                      width={112}
                      height={112}
                      alt="박지훈"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-semibold text-[#1A1F2E] mb-0.5">
                      {course.instructor.name}
                    </p>
                    <p className="text-base text-[#1A1F2E] mb-3">
                      {course.instructor.subtitle}
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/studentsBlueIcon.svg"
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span className="text-sm text-[#1A1F2E]">
                          수강생{' '}
                          {course.instructor.instructorStudentCount.toLocaleString()}
                          명
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/bookIcon.svg"
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span className="text-sm text-[#1A1F2E]">
                          강의 {course.instructor.instructorCourseCount}개
                        </span>
                      </div>
                      <div className="flex-1 flex items-center gap-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/icons/starFilledIcon.svg"
                          width={16}
                          height={16}
                          alt=""
                        />
                        <span className="text-sm text-[#1A1F2E]">
                          평점 {course.instructor.instructorRating}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm leading-[23px] text-[#1A1F2E] mb-4">
                      {course.instructor.bio}
                    </p>

                    {/* 경력 */}
                    <p className="text-sm font-semibold text-[#1A1F2E] mb-2">
                      경력
                    </p>
                    <div className="flex flex-col gap-1 mb-4">
                      {course.instructor.career.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">
                            •
                          </span>
                          <span className="text-sm leading-[20px] text-[#1A1F2E]">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* 태그 — Figma: 하단 배치 */}
                    <div className="flex flex-wrap gap-2">
                      {course.instructor.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-[rgba(47,93,170,0.1)] rounded-full text-xs font-medium text-[#2F5DAA]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 강의소개 ── */}
            <section id="intro" className="scroll-mt-6">
              <div
                className="bg-white border border-[#D5D8DD]"
                style={{ padding: '33px 33px 1px' }}
              >
                <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">
                  강의소개
                </h2>

                <div className="flex flex-col gap-8 pb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/targetIcon.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                      <h3 className="text-lg font-semibold text-[#1A1F2E]">
                        학습목표
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-[10px]">
                      {course.learningGoals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/checkDarkIcon.svg"
                            width={20}
                            height={20}
                            alt=""
                            className="flex-shrink-0 mt-0.5"
                          />
                          <span className="text-sm leading-[23px] text-[#1A1F2E]">
                            {goal}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/studentsBlueIcon.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                      <h3 className="text-lg font-semibold text-[#1A1F2E]">
                        추천대상
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-[10px]">
                      {course.targetAudience.map((t, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">
                            •
                          </span>
                          <span className="text-sm leading-[23px] text-[#1A1F2E]">
                            {t}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/icons/bookIcon.svg"
                        width={20}
                        height={20}
                        alt=""
                      />
                      <h3 className="text-lg font-semibold text-[#1A1F2E]">
                        사용기술
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {course.techTags.map((tag, i) => (
                        <span
                          key={i}
                          className="h-9 px-4 flex items-center bg-[rgba(47,93,170,0.1)] rounded-2xl text-sm font-medium text-[#2F5DAA]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-6">
                    {[
                      {
                        icon: '/icons/clockBlueIcon.svg',
                        label: '예상 학습 시간',
                        value: course.totalDuration,
                      },
                      {
                        icon: '/icons/trendUpBlueIcon.svg',
                        label: '난이도',
                        value: course.level,
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="flex-1 flex items-start gap-3"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={stat.icon}
                          width={20}
                          height={20}
                          alt=""
                          className="flex-shrink-0 mt-0.5"
                        />
                        <div className="flex flex-col gap-1">
                          <span
                            className="text-xs text-[#1A1F2E]"
                            style={{ lineHeight: '16px' }}
                          >
                            {stat.label}
                          </span>
                          <span
                            className="text-base font-semibold text-[#1A1F2E]"
                            style={{
                              lineHeight: '24px',
                              letterSpacing: '-0.3125px',
                            }}
                          >
                            {stat.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-3">
                      {course.materialsProvided.map((item, i) => (
                        <div
                          key={i}
                          className="bg-[#E8EAED] rounded-2xl flex items-center gap-3"
                          style={{ padding: '12px 16px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/checkDarkIcon.svg"
                            width={16}
                            height={16}
                            alt=""
                            className="flex-shrink-0"
                          />
                          <span className="text-sm text-[#1A1F2E]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 커리큘럼 ── */}
            <section id="curriculum" className="scroll-mt-6">
              <div
                className="bg-white border border-[#D5D8DD]"
                style={{ padding: '33px 33px 1px' }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-[#1A1F2E]">
                    강의 커리큘럼
                  </h2>
                  <span className="text-sm text-[#4B5563]">
                    총 {course.totalLessons}강 · {course.totalDuration}
                  </span>
                </div>
                <div className="flex flex-col gap-3 pb-8">
                  {course.curriculum.map((section, idx) => (
                    <CurriculumAccordion
                      key={section.sectionId}
                      section={section}
                      defaultOpen={idx === 0}
                      onPreviewClick={setPreviewLesson}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ── 수강평 ── */}
            <section id="reviews" className="scroll-mt-6 mb-10">
              <div
                className="bg-white border border-[#D5D8DD]"
                style={{ padding: '33px 33px 1px' }}
              >
                <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">
                  수강평
                </h2>

                {reviews.length === 0 ? (
                  <div className="flex flex-col items-center justify-center pt-10 pb-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/icons/emptyStateIcon.svg"
                      width={80}
                      height={80}
                      alt=""
                    />
                    <p className="text-base font-semibold text-[#1A1F2E] mt-[41px] mb-[26.5px]">
                      아직 등록된 수강평이 없습니다.
                    </p>
                    <p className="text-sm text-[#9CA3AF]">
                      강의를 수강하고 리뷰를 작성해보세요.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* 별점 요약 */}
                    <div className="flex items-center gap-6 pb-8 border-b border-[#D5D8DD] mb-8">
                      <div
                        className="flex flex-col items-center justify-center gap-2 bg-[#E8EAED] rounded-2xl flex-shrink-0"
                        style={{ width: 431, height: 160 }}
                      >
                        <span className="text-[48px] font-bold text-[#1A1F2E] leading-none">
                          {course.averageRating}
                        </span>
                        <StarRow rating={course.averageRating} size={24} />
                        <span className="text-sm text-[#1A1F2E]">
                          총 {course.reviewCount.toLocaleString()}개 리뷰
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const dist = course.ratingDistribution.find(
                            (d) => d.stars === star
                          );
                          const count = dist?.count ?? 0;
                          const pct = Math.round(
                            (count / maxRatingCount) * 100
                          );
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-20 flex-shrink-0">
                                <StarIcon filled size={16} />
                                <span className="text-sm font-medium text-[#1A1F2E]">
                                  {star}
                                </span>
                              </div>
                              <div className="flex-1 h-[10px] bg-[#E8EAED] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#FFB800] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="text-sm text-[#1A1F2E] w-16 text-right flex-shrink-0">
                                {count}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 리뷰 목록 */}
                    <div className="flex flex-col gap-4">
                      {displayedReviews.map((review) => (
                        <div
                          key={review.reviewId}
                          className="border border-[#D5D8DD] rounded-2xl"
                          style={{ padding: '21px 21px 1px' }}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-[rgba(47,93,170,0.1)] flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-semibold text-[#2F5DAA]">
                                  {review.studentName[0]}
                                </span>
                              </div>
                              <div>
                                <p className="text-base font-medium text-[#1A1F2E]">
                                  {review.studentName}
                                </p>
                                <p className="text-xs text-[#1A1F2E]">
                                  {review.createdAt}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <StarRow rating={review.rating} size={16} />
                                <span className="text-sm font-semibold text-[#FFB800]">
                                  {review.rating}
                                </span>
                              </div>
                              {/* 강사는 리뷰 신고만 가능 (수정/삭제는 학생 권한) */}
                              <button
                                className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-red-50 transition-colors"
                                title="신고"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/icons/reportFlagIcon.svg"
                                  width={14}
                                  height={14}
                                  alt=""
                                />
                              </button>
                            </div>
                          </div>
                          <p className="text-sm leading-[23px] text-[#1A1F2E] pb-5">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 페이지네이션 */}
                    {totalReviewPages > 1 && (
                      <div className="flex justify-center items-center gap-1 pt-4 pb-6">
                        {/* 이전 버튼 */}
                        <button
                          onClick={() =>
                            setReviewPage((p) => Math.max(1, p - 1))
                          }
                          disabled={reviewPage === 1}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M10 4L6 8l4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        {/* 페이지 번호 */}
                        {Array.from(
                          { length: totalReviewPages },
                          (_, i) => i + 1
                        ).map((page) => (
                          <button
                            key={page}
                            onClick={() => setReviewPage(page)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                              reviewPage === page
                                ? 'bg-[#2F5DAA] text-white'
                                : 'text-[#4B5563] hover:bg-[#F0F2F5]'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        {/* 다음 버튼 */}
                        <button
                          onClick={() =>
                            setReviewPage((p) =>
                              Math.min(totalReviewPages, p + 1)
                            )
                          }
                          disabled={reviewPage === totalReviewPages}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                          >
                            <path
                              d="M6 4l4 4-4 4"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── 오른쪽 여백 고정 사이드 네비 ── */}
      <div
        className="fixed z-30"
        style={{
          right: 'max(26px, calc((100vw - 1440px) / 2 + 26px))',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <SideNav activeId={activeSection} onNav={setActiveSection} />
      </div>

      {/* 공개/비공개 전환 확인 모달 */}
      {isStatusModalOpen && (
        <ConfirmModal
          icon={isPublished ? 'check' : 'warning'}
          title={isPublished ? '강의 비공개' : '강의 공개'}
          description={
            isPublished
              ? '해당 강의를 비공개로 전환하시겠습니까?'
              : '해당 강의를 공개로 전환하시겠습니까?'
          }
          confirmText={isMutating ? '처리 중...' : '확인'}
          onCancel={() => setIsStatusModalOpen(false)}
          onConfirm={handleToggleStatusConfirm}
          disabled={isMutating}
        />
      )}

      {/* 강의 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <ConfirmModal
          icon="warning"
          title="삭제하기"
          description="해당 강의를 삭제하시겠습니까?"
          confirmText={isMutating ? '처리 중...' : '확인'}
          onCancel={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          disabled={isMutating}
        />
      )}

      {/* 미리보기 영상 모달 (학생 강의상세와 동일) */}
      {previewLesson && (
        <PreviewVideoModal
          lessonId={previewLesson.lessonId}
          title={previewLesson.title}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </div>
  );
}

/* ── 공통 컨펌 모달 ── */
function ConfirmModal({
  icon,
  title,
  description,
  confirmText,
  onCancel,
  onConfirm,
  disabled,
}: {
  icon: 'check' | 'warning';
  title: string;
  description: string;
  confirmText: string;
  onCancel: () => void;
  onConfirm: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-[400px] bg-white rounded-2xl"
        style={{ padding: '32px' }}
      >
        {/* 아이콘 */}
        <div className="mb-4 flex justify-center">
          {icon === 'check' ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(22,163,74,0.1)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#16A34A"
                  strokeWidth="2"
                />
                <path
                  d="M8 12l3 3 5-6"
                  stroke="#16A34A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(220,38,38,0.1)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#DC2626"
                  strokeWidth="2"
                />
                <path
                  d="M12 8v4M12 16h.01"
                  stroke="#DC2626"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
        <h2 className="text-center text-xl font-bold leading-8 text-[#1F2937]">
          {title}
        </h2>
        <p className="mt-2 text-center text-sm leading-5 text-[#6B7280]">
          {description}
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            className="h-12 flex-1 rounded-[10px] bg-[#2F5DAA] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors disabled:opacity-50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
