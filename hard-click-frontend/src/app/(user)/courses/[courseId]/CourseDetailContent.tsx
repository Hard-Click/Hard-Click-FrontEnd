'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CourseNoticeSection from '@/features/courses/components/CourseNoticeSection';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/AuthProvider';
// TODO: 수강신청 모달 — 팀원 결제 모달 확인 후 연결
// TODO: 리뷰 삭제 확인 모달 — 팀원 모달 확인 후 연결
import {
  enrollCourse,
  addToCart,
  removeFromCart,
} from '@/features/courses/actions';
import {
  addWishlistAction,
  removeWishlistAction,
} from '@/features/wishlist/actions';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import CourseInstructorSection from '@/features/courses/components/CourseInstructorSection';
import CourseIntroSection from '@/features/courses/components/CourseIntroSection';
import {
  getReviews,
  updateReview,
  deleteReview,
} from '@/features/reviews/services';
import type {
  CourseDetail,
  Review,
  CurriculumLesson,
} from '@/features/courses/types';
import { StarRow, StarIcon } from '@/components/common/RatingStars';
import { CurriculumAccordion } from '@/features/courses/components/CourseCurriculumSection';

// 무거운 모달은 코드 스플리팅 — 열기 전엔 청크 다운로드 안 함 (수업자료 §1-5)
const ReviewFormModal = dynamic(
  () => import('@/features/reviews/components/ReviewFormModal'),
);
const PreviewVideoModal = dynamic(
  () => import('@/features/learning/components/PreviewVideoModal'),
);
const ReportModal = dynamic(
  () => import('@/features/reports/components/ReportModal'),
);

/* ── 강의 에러 화면 공통 컴포넌트 ── */
function CourseErrorScreen({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <div className="w-full max-w-[1440px] mx-auto px-[157.5px] py-6">
        <Link
          href="/courses"
          className="flex items-center gap-1.5 text-[#6B7280] text-sm hover:text-[#374151] transition-colors mb-8"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M10 4L6 8l4 4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          목록으로 돌아가기
        </Link>
        <div className="bg-white border border-[#D5D8DD] rounded-2xl flex flex-col items-center justify-center py-32">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
          <p className="text-[#1A1F2E] font-bold text-xl mt-[41px] mb-[26.5px]">
            {title}
          </p>
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
export default function CourseDetailContent({
  initialCourse,
  subscribed = false,
}: {
  initialCourse: CourseDetail | null;
  /** 구독 중이면 유료 강의도 결제 없이 학습 가능(BE VideoAccessService: enrolled||subscribed) */
  subscribed?: boolean;
}) {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.courseId);

  const [course] = useState<CourseDetail | null>(initialCourse);
  const [activeSection, setActiveSection] = useState('notices');

  const [isEnrolled, setIsEnrolled] = useState(
    initialCourse?.isEnrolled ?? false
  );
  const [isWishlisted, setIsWishlisted] = useState(
    initialCourse?.isWishlisted ?? false
  );
  const [wishlistPending, setWishlistPending] = useState(false);
  const [isInCart, setIsInCart] = useState(initialCourse?.isInCart ?? false);
  const [cartItemId, setCartItemId] = useState<number | null>(null);

  // 모달 상태
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [previewLesson, setPreviewLesson] = useState<CurriculumLesson | null>(
    null
  );
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingDist, setRatingDist] = useState<
    { stars: number; count: number }[]
  >([]);
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
  const loadReviews = useCallback(
    async (page: number) => {
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
        }))
      );
      setRatingDist(
        d.ratingStats.map((s) => ({ stars: s.rating, count: s.count }))
      );
      setReviewAvg(d.avgRating ?? 0);
      setReviewTotalCount(d.totalCount);
      setReviewTotalPages(Math.max(1, d.totalPages));
    },
    [courseId]
  );

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
  // UA-P0-121: 유료(비구독) → 결제 페이지 → 승인 시 수강 등록
  // 구독 중: 유료여도 결제 없이 즉시 수강 등록(enrollment 생성) → 내 강의에 노출 + 학습 접근
  const handleEnrollClick = async () => {
    if (!requireLogin()) return;
    if (course?.isFree || subscribed) {
      // 무료 강의 또는 구독 중 → 결제 없이 즉시 수강 등록(enrollment 레코드 생성)
      const result = await enrollCourse(courseId, 'FREE');
      if (result.success) {
        setIsEnrolled(true);
        toast.success(result.message);
        // cart/찜 핸들러와 동일 — 서버 컴포넌트 재요청으로 isEnrolled 재동기화(라우터 캐시 stale 방지)
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } else {
      // UA-P0-121: 유료 → 해당 강의 단건 결제 페이지로 이동 → 토스 결제 → 승인 시 수강 등록
      router.push(`/checkout?type=course&courseId=${courseId}`);
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
        // 서버 컴포넌트 재요청 → 다시 들어와도 담김 상태 유지(라우터 캐시 stale 방지)
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } else {
      const result = await addToCart(courseId);
      if (result.success) {
        setIsInCart(true);
        if (result.cartItemId) setCartItemId(result.cartItemId);
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    }
  };

  /* ── 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) ── */
  const handleReviewEditSubmit = async (rating: number, content: string) => {
    if (!editingReview) return;
    const res = await updateReview(courseId, editingReview.reviewId, {
      rating,
      content,
    });
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

  const maxRatingCount = Math.max(...ratingDist.map((d) => d.count), 1);
  const totalReviewPages = reviewTotalPages;
  const displayedReviews = reviews; // 서버 페이지네이션 (getReviews page 기준)
  // 페이지 번호 — 5개 묶음(블록) 단위. < > 는 블록 이동 (1~5 → 6~10 → 11~15 ...)
  const REVIEW_BLOCK = 5;
  const reviewBlockStart =
    Math.floor((reviewPage - 1) / REVIEW_BLOCK) * REVIEW_BLOCK + 1;
  const reviewBlockEnd = Math.min(
    reviewBlockStart + REVIEW_BLOCK - 1,
    totalReviewPages,
  );
  const reviewPageNumbers = Array.from(
    { length: reviewBlockEnd - reviewBlockStart + 1 },
    (_, i) => reviewBlockStart + i,
  );
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      {/* 토스트는 sonner Toaster가 layout.tsx에서 처리 */}

      {/* 외부 패딩 */}
      <div className="w-full max-w-[1440px] mx-auto px-[157.5px]">
        {/* 내부 패딩 */}
        <div className="pt-10 px-8 pb-0 flex flex-col gap-8">
          {/* ── 히어로 카드 ── */}
          <div
            className="bg-white border border-[#D5D8DD]"
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
                      sizes="282px"
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

                  {/* 별점 — 리뷰 0개(새 강의)면 "평점 없음". reviewCount>0 가드가 평점 null도 방어. */}
                  <div className="flex items-center gap-2">
                    {course.reviewCount > 0 ? (
                      <>
                        <StarRow rating={course.averageRating} size={20} />
                        <span className="text-lg font-semibold text-[#1A1F2E]">
                          {course.averageRating.toFixed(1)}
                        </span>
                        <span className="text-base text-[#1A1F2E]">
                          ({course.reviewCount.toLocaleString()}개 리뷰)
                        </span>
                      </>
                    ) : (
                      <span className="text-base text-[#64748B]">평점 없음</span>
                    )}
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

              {/* Row 2: 액션 버튼 (border-top, Figma: padding 24px 0 0, gap 12px) */}
              <div className="border-t border-[#D5D8DD] pt-6 pb-8 flex items-center gap-3">
                {isEnrolled ? (
                  /* 수강 중 → 학습하기 (학습 커리큘럼/진도 홈으로 이동) */
                  <Link href={`/learning/${courseId}`} className="flex-1">
                    <button className="w-full h-14 rounded-[10px] bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors">
                      학습하기
                    </button>
                  </Link>
                ) : (
                  <>
                    {/* UA-P0-120: 무료 → "수강하기" / UA-P0-121: 유료 → "수강신청".
                        구독 중이면 유료여도 "수강신청"이 결제 없이 enroll → 내 강의 등록 후 학습하기로 전환 */}
                    <button
                      onClick={handleEnrollClick}
                      className="flex-1 h-14 rounded-[10px] bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors"
                    >
                      {course.isFree ? '수강하기' : '수강신청'}
                    </button>
                    {/* 무료·구독 중이면 장바구니 불필요(결제 없이 수강) → 비구독+유료만 노출 */}
                    {!course.isFree &&
                      !subscribed &&
                      (isInCart ? (
                        <Link
                          href="/cart"
                          className="h-14 rounded-[10px] font-semibold text-base transition-colors flex items-center justify-center gap-2 bg-[rgba(47,93,170,0.08)] text-[#2F5DAA] border-2 border-[#2F5DAA]"
                          style={{ width: '166.98px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/cartIcon.svg"
                            width={20}
                            height={20}
                            alt=""
                          />
                          장바구니로 가기
                        </Link>
                      ) : (
                        <button
                          onClick={handleCartClick}
                          className="h-14 rounded-[10px] font-semibold text-base transition-colors flex items-center justify-center gap-2 bg-white text-[#4B5563] border-2 border-[#E2E8F0] hover:border-[#CBD5E1]"
                          style={{ width: '166.98px' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/icons/cartIcon.svg"
                            width={20}
                            height={20}
                            alt=""
                          />
                          장바구니 담기
                        </button>
                      ))}
                  </>
                )}
                {/* 찜 토글 — POST/DELETE /api/wishlist 라이브 연동(초기 상태는 서버에서 보강) */}
                <button
                  onClick={async () => {
                    if (!requireLogin() || wishlistPending) return;
                    const next = !isWishlisted;
                    setWishlistPending(true);
                    setIsWishlisted(next); // 낙관적
                    try {
                      const res = next
                        ? await addWishlistAction({
                            courseId: course.courseId,
                            title: course.title,
                            instructorName: course.instructorName,
                            subjectName: course.subjectName,
                            price: course.price,
                            isFree: course.isFree,
                            averageRating: course.averageRating,
                            reviewCount: course.reviewCount,
                            studentCount: course.studentCount,
                            thumbnailUrl: course.thumbnailUrl,
                            isEnrolled,
                            isInCart,
                          })
                        : await removeWishlistAction(course.courseId);
                      if (res.success) {
                        toast.success(
                          next
                            ? '찜 목록에 추가되었습니다.'
                            : '찜이 해제되었습니다.'
                        );
                        // 다시 들어와도 찜 상태 유지(라우터 캐시 stale 방지)
                        router.refresh();
                      } else {
                        setIsWishlisted(!next); // 실패 복구
                        toast.error(res.message);
                      }
                    } finally {
                      setWishlistPending(false);
                    }
                  }}
                  disabled={wishlistPending}
                  className={`h-14 rounded-[10px] font-medium text-base transition-colors flex items-center justify-center gap-2 border-2 disabled:opacity-60 ${
                    isWishlisted
                      ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]'
                      : 'bg-white text-[#4B5563] border-[#E2E8F0] hover:border-[#CBD5E1]'
                  }`}
                  style={{ width: '121.52px' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      isWishlisted
                        ? '/icons/heartFilledIcon.svg'
                        : '/icons/heartOutlineIcon.svg'
                    }
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
            <CourseNoticeSection
              notices={course.notices}
              listHref={`/courses/${courseId}/notices`}
              noticeHref={(id) => `/notices/${id}`}
              scrollMtClassName="scroll-mt-20"
              onLinkClick={(e) => { if (!requireLogin()) e.preventDefault(); }}
            />

            {/* ── 강사소개 (공용 컴포넌트) ── */}
            <CourseInstructorSection instructor={course.instructor} />

            {/* ── 강의소개 (공용 컴포넌트) ── */}
            <CourseIntroSection
              learningGoals={course.learningGoals}
              targetAudience={course.targetAudience}
              techTags={course.techTags}
              totalDuration={course.totalDuration}
              level={course.level}
            />

            {/* ── 커리큘럼 ── */}
            <section id="curriculum" className="scroll-mt-20">
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
                      onPreviewClick={handlePreviewClick}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ── 수강평 ── */}
            <section id="reviews" className="scroll-mt-20 mb-10">
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
                          {reviewAvg.toFixed(1)}
                        </span>
                        <StarRow rating={reviewAvg} size={24} />
                        <span className="text-sm text-[#1A1F2E]">
                          총 {reviewTotalCount.toLocaleString()}개 리뷰
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const dist = ratingDist.find((d) => d.stars === star);
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
                              {/* UA-P1-192: 내 리뷰 수정/삭제 버튼 */}
                              {review.isMine && (
                                <>
                                  <button
                                    onClick={() => {
                                      if (requireLogin())
                                        setEditingReview(review);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-[#EEF3FB] transition-colors"
                                    title="수정"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src="/icons/editIcon.svg"
                                      width={14}
                                      height={14}
                                      alt=""
                                    />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (requireLogin())
                                        setDeletingReview(review);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center rounded-2xl hover:bg-red-50 transition-colors"
                                    title="삭제"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src="/icons/trashIcon.svg"
                                      width={14}
                                      height={14}
                                      alt=""
                                    />
                                  </button>
                                </>
                              )}
                              {/* UA-P1-197: 타인 리뷰 신고 — 공용 ReportModal 재사용(targetType=REVIEW) */}
                              {!review.isMine && (
                                <button
                                  onClick={() => {
                                    if (requireLogin()) setReportingReview(review);
                                  }}
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
                              )}
                            </div>
                          </div>
                          <p className="text-sm leading-[23px] text-[#1A1F2E] pb-5">
                            {review.content}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* 페이지네이션 — 1페이지여도 항상 표시 */}
                    {(
                      <div className="flex justify-center items-center gap-1 pt-4 pb-6">
                        {/* 이전 버튼 */}
                        <button
                          onClick={() => setReviewPage(reviewBlockStart - 1)}
                          disabled={reviewBlockStart === 1}
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

                        {/* 페이지 번호 — 최대 5개 윈도우(슬라이드) */}
                        {reviewPageNumbers.map((page) => (
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
                          onClick={() => setReviewPage(reviewBlockEnd + 1)}
                          disabled={reviewBlockEnd === totalReviewPages}
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

      {/* 리뷰 신고 모달 — 공용 ReportModal 재사용 (커뮤니티 신고와 동일) */}
      {reportingReview && (
        <ReportModal
          target={{ targetType: 'REVIEW', targetId: reportingReview.reviewId }}
          onClose={() => setReportingReview(null)}
        />
      )}

      {/* 미리보기 영상 모달 */}
      {previewLesson && (
        <PreviewVideoModal
          lessonId={previewLesson.videoId ?? previewLesson.lessonId}
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
            <h2 className="text-center text-2xl font-bold leading-8 text-[#1F2937]">
              리뷰 삭제
            </h2>
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
