'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthProvider';
// TODO: 수강신청 모달 — 팀원 결제 모달 확인 후 연결
// TODO: 리뷰 삭제 확인 모달 — 팀원 모달 확인 후 연결
import {
  enrollCourse,
  addToCart,
  removeFromCart,
} from '@/features/courses/actions';
import ReviewFormModal from '@/features/reviews/components/ReviewFormModal';
import PreviewVideoModal from '@/features/learning/components/PreviewVideoModal';
import { getReviews, updateReview, deleteReview } from '@/features/reviews/services';
import type { CourseDetail, Review, CurriculumLesson } from '@/features/courses/types';

// TODO: 리뷰 신고 모달 — 팀원 컴포넌트 완성 후 아래 import 연결
// import ReviewReportModal from '@/components/ui/reviewReportModal';

/* ── 별점 아이콘 (정수 1~5) ── */
function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  /* eslint-disable-next-line @next/next/no-img-element */
  return filled
    ? <img src="/icons/starFilledIcon.svg" width={size} height={size} alt="" />
    : <img src="/icons/starEmptyIcon.svg" width={size} height={size} alt="" />;
}

/* 정수 별점(1~5) StarRow */
function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
  const rounded = Math.floor(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} filled={i <= rounded} size={size} />
      ))}
    </div>
  );
}

/* ── 커리큘럼 아코디언 ── */
function CurriculumAccordion({
  section,
  defaultOpen = false,
  onPreviewClick,
}: {
  section: CourseDetail['curriculum'][0];
  defaultOpen?: boolean;
  onPreviewClick: (lesson: CurriculumLesson) => void;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const totalSecs = section.lessons.reduce((sum, l) => {
    const parts = l.duration.split(':').map(Number);
    return sum + (parts[0] || 0) * 60 + (parts[1] || 0);
  }, 0);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  const totalStr = h > 0 ? `${h}시간 ${m}분` : m > 0 ? `${m}분` : totalSecs > 0 ? `${s}초` : '0분';

  return (
    <div className="border border-[#D5D8DD] rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-white hover:bg-[#F8FAFC] transition-colors text-left"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/icons/chevronDownIcon.svg"
          width={20}
          height={20}
          alt=""
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
        <span className="flex-1 text-base font-medium text-[#1A1F2E] text-left">{section.title}</span>
        <span className="text-sm text-[#4B5563] flex-shrink-0 w-[100px] text-right">
          {section.lessons.length}강 · {totalStr}
        </span>
      </button>

      {isOpen && (
        <div>
          {section.lessons.map(lesson => {
            const rowClass = "flex items-center justify-between px-5 py-[14px] border-t border-[#D5D8DD] bg-white transition-colors";
            const inner = (
              <>
                <div className="flex items-center gap-3 min-w-0">
                  {lesson.isPreview
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/playIcon.svg" width={16} height={16} alt="" className="flex-shrink-0" />
                    : /* eslint-disable-next-line @next/next/no-img-element */
                      <img src="/icons/checkDarkIcon.svg" width={16} height={16} alt="" className="flex-shrink-0" />
                  }
                  <span className="text-sm text-[#374151] truncate">{lesson.title}</span>
                  {lesson.isPreview && (
                    <span className="flex-shrink-0 px-3 py-0.5 bg-[rgba(47,93,170,0.1)] text-[#2F5DAA] text-xs font-medium rounded-[14px]">
                      미리보기
                    </span>
                  )}
                </div>
                <span className="text-sm text-[#4B5563] flex-shrink-0 ml-4">{lesson.duration}</span>
              </>
            );
            return lesson.isPreview ? (
              <button
                key={lesson.lessonId}
                type="button"
                onClick={() => onPreviewClick(lesson)}
                className={`${rowClass} hover:bg-[#F0F4FB] cursor-pointer w-full text-left`}
              >
                {inner}
              </button>
            ) : (
              <div key={lesson.lessonId} className={rowClass}>
                {inner}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── 강의 에러 화면 공통 컴포넌트 ── */
function CourseErrorScreen({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="w-full max-w-[1440px] mx-auto px-[157.5px] py-6">
        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-[#6B7280] text-sm hover:text-[#374151] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          목록으로 돌아가기
        </Link>
        <div className="bg-white border border-[#D5D8DD] rounded-2xl flex flex-col items-center justify-center py-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
          <p className="text-[#1A1F2E] font-bold text-xl mt-[41px] mb-[26.5px]">{title}</p>
          <p className="text-[#6B7280] text-sm">{subtitle}</p>
        </div>
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

function SideNav({ activeId, onNav }: { activeId: string; onNav: (id: string) => void }) {
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
        {NAV_ITEMS.map(item => (
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
export default function CourseDetailContent({
  initialCourse,
}: {
  initialCourse: CourseDetail | null;
}) {
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course] = useState<CourseDetail | null>(initialCourse);
  const [activeSection, setActiveSection] = useState('notices');

  const [isEnrolled, setIsEnrolled] = useState(initialCourse?.isEnrolled ?? false);
  const [isWishlisted, setIsWishlisted] = useState(initialCourse?.isWishlisted ?? false);
  const [isInCart, setIsInCart] = useState(initialCourse?.isInCart ?? false);
  const [cartItemId, setCartItemId] = useState<number | null>(null);

  // 모달 상태
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [previewLesson, setPreviewLesson] = useState<CurriculumLesson | null>(null);
  // TODO: reportingReview — 팀원 ReviewReportModal 완성 후 활성화
  // const [reportingReview, setReportingReview] = useState<Review | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingDist, setRatingDist] = useState<{ stars: number; count: number }[]>([]);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [reviewTotalCount, setReviewTotalCount] = useState(0);

  // 인증 상태는 서버 쿠키 기반 Context에서 (localStorage 대체)
  const { isLoggedIn } = useAuth();

  /* 비로그인 액션 공통 가드 — 토스트만 표시, 페이지 이동 X */
  const requireLogin = (): boolean => {
    if (!isLoggedIn) {
      toast.error('로그인이 필요합니다');
      return false;
    }
    return true;
  };

  /* 미리보기 클릭 가드 — 비로그인 시 차단 (영상 API가 JWT 필수, 401 응답 방지) */
  const handlePreviewClick = (lesson: CurriculumLesson) => {
    if (!requireLogin()) return;
    setPreviewLesson(lesson);
  };

  /* 리뷰 목록 조회 (GET /api/courses/{courseId}/reviews) — 백엔드가 내 리뷰 최상단·별점분포·평균 조립 */
  const loadReviews = useCallback(async (page: number) => {
    const res = await getReviews(courseId, 'latest', page);
    if (!res.success || !res.data) return;
    const d = res.data;
    setReviews(
      d.reviews.map((r) => ({
        reviewId: r.reviewId,
        studentName: r.authorName,
        rating: r.rating,
        content: r.content,
        createdAt: r.createdDate,
        isMine: r.isMyReview,
      })),
    );
    setRatingDist(d.ratingStats.map((s) => ({ stars: s.rating, count: s.count })));
    setReviewAvg(d.avgRating ?? 0);
    setReviewTotalCount(d.totalCount);
    setReviewTotalPages(Math.max(1, d.totalPages));
  }, [courseId]);

  useEffect(() => {
    loadReviews(reviewPage);
  }, [loadReviews, reviewPage]);

  const handleScroll = useCallback(() => {
    const offset = 120;
    for (const { id } of [...NAV_ITEMS].reverse()) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= offset) {
        setActiveSection(id);
        return;
      }
    }
    setActiveSection('notices');
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // UA-P0-120: 무료 → POST /api/enrollments 즉시 처리
  // UA-P0-121: 유료 → 결제 모달 → POST /api/payments → enrollments 자동 생성
  const handleEnrollClick = async () => {
    if (!requireLogin()) return;
    if (course?.isFree) {
      const result = await enrollCourse(courseId, 'FREE');
      if (result.success) {
        setIsEnrolled(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      // TODO: 유료 수강신청 — 팀원 결제 모달 확인 후 연결 (UA-P0-121)
      // 결제 모달 완성 전까지는 mock에서 결제 우회하여 즉시 수강 처리
      const result = await enrollCourse(courseId, 'PAID');
      if (result.success) {
        setIsEnrolled(true);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  // UA-P0-130: POST /api/cart / DELETE /api/cart/{cartItemId}
  const handleCartClick = async () => {
    if (!requireLogin()) return;
    if (isInCart && cartItemId) {
      const result = await removeFromCart(cartItemId);
      if (result.success) {
        setIsInCart(false);
        setCartItemId(null);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await addToCart(courseId);
      if (result.success) {
        setIsInCart(true);
        if (result.cartItemId) setCartItemId(result.cartItemId);
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  /* ── 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) ── */
  const handleReviewEditSubmit = async (rating: number, content: string) => {
    if (!editingReview) return;
    const res = await updateReview(courseId, editingReview.reviewId, { rating, content });
    if (!res.success) {
      toast.error(res.message || '수강평 수정에 실패했습니다.');
      return;
    }
    setEditingReview(null);
    await loadReviews(reviewPage);
    toast.success(res.message || '수강평이 수정되었습니다.');
  };

  /* ── 리뷰 삭제 (DELETE /api/courses/{courseId}/reviews/{reviewId}) ── */
  const handleReviewDeleteConfirm = async () => {
    if (!deletingReview) return;
    const res = await deleteReview(courseId, deletingReview.reviewId);
    if (!res.success) {
      toast.error(res.message || '수강평 삭제에 실패했습니다.');
      return;
    }
    setDeletingReview(null);
    await loadReviews(reviewPage);
    toast.success(res.message || '수강평이 삭제되었습니다.');
  };

  // UA-P0-104: 강의 없음 / 삭제 / 접근불가 에러 처리
  if (!course) {
    return <CourseErrorScreen title="존재하지 않는 강의입니다." subtitle="강의 목록에서 다른 강의를 확인해보세요." />;
  }
  if (course.status === 'DELETED') {
    return <CourseErrorScreen title="삭제된 강의입니다." subtitle="강의 목록에서 다른 강의를 확인해보세요." />;
  }
  if (course.status === 'HIDDEN') {
    return <CourseErrorScreen title="현재 접근할 수 없는 강의입니다." subtitle="강의 정보를 다시 확인해주세요." />;
  }

  const maxRatingCount = Math.max(...ratingDist.map(d => d.count), 1);
  const totalReviewPages = reviewTotalPages;
  const displayedReviews = reviews; // 서버 페이지네이션 (getReviews page 기준)
  // 공지 고정 맨 위, 나머지 최신순 정렬
  const sortedNotices = [...course.notices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const displayedNotices = sortedNotices.slice(0, 3);

  // UA-P0-140: 첫 번째 강의 lessonId (학습 시작 이동 대상)
  const firstLessonId = course.curriculum[0]?.lessons[0]?.lessonId;

  return (
    <div className="min-h-screen bg-[#F0F2F5]">

      {/* 토스트는 sonner Toaster가 layout.tsx에서 처리 */}

      {/* 외부 패딩 */}
      <div className="w-full max-w-[1440px] mx-auto px-[157.5px]">
        {/* 내부 패딩 */}
        <div className="pt-10 px-8 pb-0 flex flex-col gap-8">

          {/* ── 히어로 카드 ── */}
          <div className="bg-white border border-[#D5D8DD]" style={{ padding: '33px 33px 1px' }}>
            <div className="flex flex-col gap-6">

              {/* Row 1: 썸네일 + 강의 정보 */}
              <div className="flex gap-6">
                {/* 썸네일 */}
                <div className="flex-shrink-0 self-start w-[282px] h-[262px] bg-[#1A1F2E] rounded-2xl overflow-hidden relative">
                  {course.thumbnailUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                        <path d="M16 12L44 28L16 44V12Z" fill="rgba(255,255,255,0.4)" />
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
                    강사: <span className="text-base font-medium text-[#1A1F2E]">{course.instructorName}</span>
                  </p>

                  {/* 별점 */}
                  <div className="flex items-center gap-2">
                    <StarRow rating={course.averageRating} size={20} />
                    <span className="text-lg font-semibold text-[#1A1F2E]">{course.averageRating.toFixed(1)}</span>
                    <span className="text-base text-[#1A1F2E]">
                      ({course.reviewCount.toLocaleString()}개 리뷰)
                    </span>
                  </div>

                  {/* 통계 행: 수강생 수 · 총 강의시간 · 난이도 */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/studentsIcon.svg" width={16} height={16} alt="" />
                      <span className="text-sm text-[#1A1F2E]">{course.studentCount.toLocaleString()}명 수강</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/clockGrayIcon.svg" width={16} height={16} alt="" />
                      <span className="text-sm text-[#1A1F2E]">{course.totalDuration}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/trendUpIcon.svg" width={16} height={16} alt="" />
                      <span className="text-sm text-[#1A1F2E]">{course.level}</span>
                    </div>
                  </div>

                  {/* 가격 */}
                  <div>
                    {course.isFree ? (
                      <span className="text-[30px] font-bold text-[#16A34A]">무료</span>
                    ) : (
                      <span className="text-[30px] font-bold text-[#2F5DAA]">
                        ₩{course.price.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: 액션 버튼 (border-top, Figma: padding 24px 0 0, gap 12px) */}
              <div className="border-t border-[#D5D8DD] pt-6 pb-8 flex items-center gap-3">
                {isEnrolled ? (
                  /* 수강 중 → 학습하기 (영상 페이지로 이동) */
                  <Link href={firstLessonId ? `/learning/videos/${firstLessonId}` : '#'} className="flex-1">
                    <button className="w-full h-14 rounded-[10px] bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors">
                      학습하기
                    </button>
                  </Link>
                ) : (
                  <>
                    {/* UA-P0-120: 무료 → "수강하기" / UA-P0-121: 유료 → "수강신청" */}
                    <button
                      onClick={handleEnrollClick}
                      className="flex-1 h-14 rounded-[10px] bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors"
                    >
                      {course.isFree ? '수강하기' : '수강신청'}
                    </button>
                    {/* UA-P0-130: 무료 강의는 장바구니 버튼 표시 안 함 */}
                    {!course.isFree && (
                      isInCart ? (
                        <Link
                          href="/cart"
                          className="h-14 rounded-[10px] font-semibold text-base transition-colors flex items-center justify-center gap-2 bg-[rgba(47,93,170,0.08)] text-[#2F5DAA] border-2 border-[#2F5DAA]"
                          style={{ width: '166.98px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/cartIcon.svg" width={20} height={20} alt="" />
                          장바구니로 가기
                        </Link>
                      ) : (
                        <button
                          onClick={handleCartClick}
                          className="h-14 rounded-[10px] font-semibold text-base transition-colors flex items-center justify-center gap-2 bg-white text-[#4B5563] border-2 border-[#E2E8F0] hover:border-[#CBD5E1]"
                          style={{ width: '166.98px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/cartIcon.svg" width={20} height={20} alt="" />
                          장바구니 담기
                        </button>
                      )
                    )}
                  </>
                )}
                {/* TODO: 찜 API 엔드포인트 명세에 없음 — 백엔드 확인 후 연결 */}
                <button
                  onClick={() => {
                    if (!requireLogin()) return;
                    setIsWishlisted(v => !v);
                    toast.success(isWishlisted ? '찜이 해제되었습니다.' : '찜 목록에 추가되었습니다.');
                  }}
                  className={`h-14 rounded-[10px] font-medium text-base transition-colors flex items-center justify-center gap-2 border-2 ${
                    isWishlisted
                      ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]'
                      : 'bg-white text-[#4B5563] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                  style={{ width: '121.52px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={isWishlisted ? '/icons/heartFilledIcon.svg' : '/icons/heartOutlineIcon.svg'}
                    width={20}
                    height={20}
                    alt=""
                  />
                  찜하기
                </button>
              </div>

            </div>
          </div>

          {/* ── 메인 콘텐츠 (풀 너비) ── */}
          <div className="flex flex-col gap-8">

              {/* ── 공지사항 ── */}
              <section id="notices" className="scroll-mt-6">
                <div className="bg-white border border-[#E2E8F0] shadow-[0_4px_10px_rgba(0,0,0,0.06)] rounded-2xl flex flex-col gap-6" style={{ padding: '33px' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/bellBlueIcon.svg" width={20} height={20} alt="" />
                      <h2 className="text-xl font-bold text-[#1F2937]">강의 공지사항</h2>
                    </div>
                    <Link
                      href={`/courses/${courseId}/notices`}
                      onClick={(e) => {
                        if (!requireLogin()) e.preventDefault();
                      }}
                      className="w-20 h-10 border border-[#E2E8F0] rounded-2xl text-sm font-medium text-[#4B5563] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center"
                    >
                      전체보기
                    </Link>
                  </div>

                  {course.notices.length === 0 ? (
                    <p className="text-sm text-[#9CA3AF] text-center py-4">공지사항이 없습니다.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {displayedNotices.map((notice) => (
                          <Link
                            key={notice.noticeId}
                            href={`/courses/${courseId}/notices/${notice.noticeId}`}
                            onClick={(e) => {
                              if (!requireLogin()) e.preventDefault();
                            }}
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
                                  <img src="/icons/pinIcon.svg" width={11} height={11} alt="" style={{ filter: 'brightness(0) invert(1)' }} />
                                  공지
                                </span>
                              )}
                              <p className="text-[18px] font-semibold text-[#1F2937] leading-[27px] line-clamp-1 flex-1">
                                {notice.title}
                              </p>
                              <span className="text-xs text-[#9CA3AF] flex-shrink-0">{notice.createdAt}</span>
                            </div>
                            <p className="text-sm text-[#4B5563] line-clamp-1">{notice.content}</p>
                          </Link>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>

              {/* ── 강사소개 ── */}
              <section id="instructor" className="scroll-mt-6">
                <div className="bg-white border border-[#D5D8DD]" style={{ padding: '33px 33px 1px' }}>
                  <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">강사소개</h2>

                  <div className="flex items-start gap-6 pb-8">
                    <div className="flex-shrink-0 w-28 h-28 rounded-full border-2 border-[#D5D8DD] overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/image/Image (박지훈).svg" width={112} height={112} alt="박지훈" className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xl font-semibold text-[#1A1F2E] mb-0.5">{course.instructor.name}</p>
                      <p className="text-base text-[#1A1F2E] mb-3">{course.instructor.subtitle}</p>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1 flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/studentsBlueIcon.svg" width={16} height={16} alt="" />
                          <span className="text-sm text-[#1A1F2E]">수강생 {course.instructor.instructorStudentCount.toLocaleString()}명</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/bookIcon.svg" width={16} height={16} alt="" />
                          <span className="text-sm text-[#1A1F2E]">강의 {course.instructor.instructorCourseCount}개</span>
                        </div>
                        <div className="flex-1 flex items-center gap-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src="/icons/starFilledIcon.svg" width={16} height={16} alt="" />
                          <span className="text-sm text-[#1A1F2E]">평점 {course.instructor.instructorRating}</span>
                        </div>
                      </div>

                      <p className="text-sm leading-[23px] text-[#1A1F2E] mb-4">{course.instructor.bio}</p>

                      {/* 경력 */}
                      <p className="text-sm font-semibold text-[#1A1F2E] mb-2">경력</p>
                      <div className="flex flex-col gap-1 mb-4">
                        {course.instructor.career.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">•</span>
                            <span className="text-sm leading-[20px] text-[#1A1F2E]">{item}</span>
                          </div>
                        ))}
                      </div>

                      {/* 태그 — Figma: 하단 배치 */}
                      <div className="flex flex-wrap gap-2">
                        {course.instructor.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-[rgba(47,93,170,0.1)] rounded-full text-xs font-medium text-[#2F5DAA]">
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
                <div className="bg-white border border-[#D5D8DD]" style={{ padding: '33px 33px 1px' }}>
                  <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">강의소개</h2>

                  <div className="flex flex-col gap-8 pb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/targetIcon.svg" width={20} height={20} alt="" />
                        <h3 className="text-lg font-semibold text-[#1A1F2E]">학습목표</h3>
                      </div>
                      <ul className="flex flex-col gap-[10px]">
                        {course.learningGoals.map((goal, i) => (
                          <li key={i} className="flex items-start gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icons/checkDarkIcon.svg" width={20} height={20} alt="" className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm leading-[23px] text-[#1A1F2E]">{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/studentsBlueIcon.svg" width={20} height={20} alt="" />
                        <h3 className="text-lg font-semibold text-[#1A1F2E]">추천대상</h3>
                      </div>
                      <ul className="flex flex-col gap-[10px]">
                        {course.targetAudience.map((t, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="flex-shrink-0 text-sm leading-[20px] text-[#2F5DAA] select-none">•</span>
                            <span className="text-sm leading-[23px] text-[#1A1F2E]">{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/bookIcon.svg" width={20} height={20} alt="" />
                        <h3 className="text-lg font-semibold text-[#1A1F2E]">사용기술</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {course.techTags.map((tag, i) => (
                          <span key={i} className="h-9 px-4 flex items-center bg-[rgba(47,93,170,0.1)] rounded-2xl text-sm font-medium text-[#2F5DAA]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start gap-6">
                      {[
                        { icon: '/icons/clockBlueIcon.svg', label: '예상 학습 시간', value: course.totalDuration },
                        { icon: '/icons/trendUpBlueIcon.svg', label: '난이도', value: course.level },
                        { icon: '/icons/documentIcon.svg', label: '제공 자료', value: `${course.materialsProvided.length}개` },
                      ].map(stat => (
                        <div key={stat.label} className="flex-1 flex items-start gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={stat.icon} width={20} height={20} alt="" className="flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-[#1A1F2E]" style={{ lineHeight: '16px' }}>{stat.label}</span>
                            <span className="text-base font-semibold text-[#1A1F2E]" style={{ lineHeight: '24px', letterSpacing: '-0.3125px' }}>{stat.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/icons/documentIcon.svg" width={20} height={20} alt="" />
                        <h3 className="text-lg font-semibold text-[#1A1F2E]">제공자료</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {course.materialsProvided.map((item, i) => (
                          <div key={i} className="bg-[#E8EAED] rounded-2xl flex items-center gap-3" style={{ padding: '12px 16px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/icons/checkDarkIcon.svg" width={16} height={16} alt="" className="flex-shrink-0" />
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
                <div className="bg-white border border-[#D5D8DD]" style={{ padding: '33px 33px 1px' }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-[#1A1F2E]">강의 커리큘럼</h2>
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
                        onPreviewClick={handlePreviewClick}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* ── 수강평 ── */}
              <section id="reviews" className="scroll-mt-6 mb-10">
                <div className="bg-white border border-[#D5D8DD]" style={{ padding: '33px 33px 1px' }}>
                  <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">수강평</h2>

                  {reviews.length === 0 ? (
                    <div className="flex flex-col items-center justify-center pt-10 pb-12">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
                      <p className="text-base font-semibold text-[#1A1F2E] mt-[41px] mb-[26.5px]">아직 등록된 수강평이 없습니다.</p>
                      <p className="text-sm text-[#9CA3AF]">강의를 수강하고 리뷰를 작성해보세요.</p>
                    </div>
                  ) : (
                    <>
                      {/* 별점 요약 */}
                      <div className="flex items-center gap-6 pb-8 border-b border-[#D5D8DD] mb-8">
                        <div
                          className="flex flex-col items-center justify-center gap-2 bg-[#E8EAED] rounded-2xl flex-shrink-0"
                          style={{ width: 431, height: 160 }}
                        >
                          <span className="text-[48px] font-bold text-[#1A1F2E] leading-none">{reviewAvg.toFixed(1)}</span>
                          <StarRow rating={reviewAvg} size={24} />
                          <span className="text-sm text-[#1A1F2E]">총 {reviewTotalCount.toLocaleString()}개 리뷰</span>
                        </div>

                        <div className="flex-1 flex flex-col gap-3">
                          {[5, 4, 3, 2, 1].map(star => {
                            const dist = ratingDist.find(d => d.stars === star);
                            const count = dist?.count ?? 0;
                            const pct = Math.round((count / maxRatingCount) * 100);
                            return (
                              <div key={star} className="flex items-center gap-3">
                                <div className="flex items-center gap-1 w-20 flex-shrink-0">
                                  <StarIcon filled size={16} />
                                  <span className="text-sm font-medium text-[#1A1F2E]">{star}</span>
                                </div>
                                <div className="flex-1 h-[10px] bg-[#E8EAED] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#FFB800] rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-sm text-[#1A1F2E] w-16 text-right flex-shrink-0">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* 리뷰 목록 */}
                      <div className="flex flex-col gap-4">
                        {displayedReviews.map(review => (
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
                                  <p className="text-base font-medium text-[#1A1F2E]">{review.studentName}</p>
                                  <p className="text-xs text-[#1A1F2E]">{review.createdAt}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <StarRow rating={review.rating} size={16} />
                                  <span className="text-sm font-semibold text-[#FFB800]">{review.rating}</span>
                                </div>
                                {/* UA-P1-192: 내 리뷰 수정/삭제 버튼 */}
                                {review.isMine && (
                                  <>
                                    <button
                                      onClick={() => { if (requireLogin()) setEditingReview(review); }}
                                      className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-[#EEF3FB] transition-colors"
                                      title="수정"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src="/icons/editIcon.svg" width={14} height={14} alt="" />
                                    </button>
                                    <button
                                      onClick={() => { if (requireLogin()) setDeletingReview(review); }}
                                      className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-red-50 transition-colors"
                                      title="삭제"
                                    >
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img src="/icons/trashIcon.svg" width={14} height={14} alt="" />
                                    </button>
                                  </>
                                )}
                                {/* UA-P1-197: 타인 리뷰 신고 버튼 — TODO: onClick={() => setReportingReview(review)} 팀원 ReviewReportModal 완성 후 연결 */}
                                {!review.isMine && (
                                  <button
                                    className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-red-50 transition-colors"
                                    title="신고"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src="/icons/reportFlagIcon.svg" width={14} height={14} alt="" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm leading-[23px] text-[#1A1F2E] pb-5">{review.content}</p>
                          </div>
                        ))}
                      </div>

                      {/* 페이지네이션 */}
                      {totalReviewPages > 1 && (
                        <div className="flex justify-center items-center gap-1 pt-4 pb-6">
                          {/* 이전 버튼 */}
                          <button
                            onClick={() => setReviewPage(p => Math.max(1, p - 1))}
                            disabled={reviewPage === 1}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M10 4L6 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>

                          {/* 페이지 번호 */}
                          {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map(page => (
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
                            onClick={() => setReviewPage(p => Math.min(totalReviewPages, p + 1))}
                            disabled={reviewPage === totalReviewPages}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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

      {/* ── UA-P0-140/142: 학습 시작 플로팅 버튼 — 수강자만 표시 ── */}
      {isEnrolled && firstLessonId && (
        <div className="fixed bottom-8 right-8 z-40">
          <Link href={`/learning/videos/${firstLessonId}`}>
            <button
              className="flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6A10] text-white font-semibold text-lg rounded-[20px] transition-colors shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1)]"
              style={{ width: 167, height: 60 }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M6 4L16 10L6 16V4Z" fill="white" />
              </svg>
              학습 시작
            </button>
          </Link>
        </div>
      )}

      {/* TODO: 수강신청 모달 — 팀원 결제 모달 확인 후 연결 */}
      {/* TODO: 리뷰 신고 모달 — import ReviewReportModal from '@/components/ui/reviewReportModal' 팀원 확인 후 연결 */}

      {/* 미리보기 영상 모달 */}
      {previewLesson && (
        <PreviewVideoModal
          lessonId={previewLesson.lessonId}
          title={previewLesson.title}
          onClose={() => setPreviewLesson(null)}
        />
      )}

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <ReviewFormModal
          mode="edit"
          initialRating={editingReview.rating}
          initialContent={editingReview.content}
          onCancel={() => setEditingReview(null)}
          onSubmit={handleReviewEditSubmit}
        />
      )}

      {/* 리뷰 삭제 확인 모달 */}
      {deletingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            className="w-full max-w-[448px] bg-white rounded-2xl"
            style={{
              padding: '32px',
              boxShadow:
                '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 8px 10px -6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">리뷰 삭제</h2>
            <p className="mt-3 text-center text-base leading-6 text-[#4B5563]">
              해당 리뷰를 삭제하시겠습니까?
              <br />
              삭제한 리뷰는 복구할 수 없습니다.
            </p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingReview(null)}
                className="h-12 flex-1 rounded-[10px] border border-[#E2E8F0] bg-white text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleReviewDeleteConfirm}
                className="h-12 flex-1 rounded-[10px] bg-[#DC2626] text-base font-semibold text-white hover:bg-[#B91C1C] transition-colors"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
