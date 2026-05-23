'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserHeader from '@/components/layout/headers/UserHeader';
import { getCourseDetail } from '@/features/courses/services';
import type { CourseDetail, Review } from '@/features/courses/types';

/* ── 별점 아이콘 ── */
function StarIcon({ filled, size = 20 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2.5L12.473 7.513L18 8.326L14 12.22L14.945 17.726L10 15.127L5.055 17.726L6 12.22L2 8.326L7.527 7.513L10 2.5Z"
        fill={filled ? '#FFB800' : '#D1D5DC'}
        stroke={filled ? '#FFB800' : '#D1D5DC'}
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StarRow({ rating, size = 20 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon key={i} filled={i <= rating} size={size} />
      ))}
    </div>
  );
}

/* ── 섹션 카드 래퍼 ── */
function SectionCard({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section
      id={id}
      className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden scroll-mt-6"
    >
      {children}
    </section>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="px-8 py-5 border-b border-[#E2E8F0]">
      <h2 className="text-[#1A1F2E] font-bold text-xl">{title}</h2>
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

function StickyNav({ activeId }: { activeId: string }) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
      {NAV_ITEMS.map(item => (
        <button
          key={item.id}
          onClick={() => scrollTo(item.id)}
          className={`w-full px-5 py-3.5 text-left text-sm font-medium transition-colors border-b border-[#F1F5F9] last:border-b-0 ${
            activeId === item.id
              ? 'text-[#2F5DAA] bg-[#EEF3FB]'
              : 'text-[#4B5563] hover:bg-gray-50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* ── 커리큘럼 아코디언 항목 ── */
function CurriculumSection({
  section,
  defaultOpen = false,
}: {
  section: CourseDetail['curriculum'][0];
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const totalMinutes = section.lessons.reduce((sum, l) => {
    const [m, s] = l.duration.split(':').map(Number);
    return sum + m + s / 60;
  }, 0);
  const totalStr = `${Math.floor(totalMinutes)}분`;

  return (
    <div className="border-b border-[#E2E8F0] last:border-b-0">
      <button
        onClick={() => setIsOpen(v => !v)}
        className="w-full flex items-center justify-between px-8 py-4 hover:bg-gray-50 transition-colors text-left"
      >
        <div>
          <span className="text-[#1A1F2E] font-semibold text-base">{section.title}</span>
          <span className="ml-3 text-[#6B7280] text-sm">
            {section.lessons.length}강 · {totalStr}
          </span>
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="#6B7280"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="bg-[#F8FAFC]">
          {section.lessons.map(lesson => (
            <div
              key={lesson.lessonId}
              className="flex items-center justify-between px-8 py-3 border-t border-[#E2E8F0]"
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#9CA3AF" strokeWidth="1.2" />
                  <path
                    d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z"
                    fill="#9CA3AF"
                  />
                </svg>
                <span className="text-[#374151] text-sm">{lesson.title}</span>
                {lesson.isPreview && (
                  <span className="px-2 py-0.5 bg-[#EEF3FB] text-[#2F5DAA] text-xs font-medium rounded-full">
                    미리보기
                  </span>
                )}
              </div>
              <span className="text-[#9CA3AF] text-sm flex-shrink-0 ml-4">{lesson.duration}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 리뷰 수정 모달 ── */
function ReviewEditModal({
  review,
  onClose,
  onSubmit,
}: {
  review: Review;
  onClose: () => void;
  onSubmit: (rating: number, content: string) => void;
}) {
  const [rating, setRating] = useState(review.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState(review.content);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl p-8 w-[400px] shadow-xl">
          <p className="text-[#1A1F2E] font-semibold text-lg text-center mb-6">
            리뷰를 수정하시겠습니까?
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 h-11 rounded-xl border border-[#D1D5DB] text-[#4B5563] font-medium text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onSubmit(rating, content)}
              className="flex-1 h-11 rounded-xl bg-[#2F5DAA] text-white font-medium text-base hover:bg-[#1D3E75] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[480px] shadow-xl overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A1F2E] font-bold text-lg">리뷰 수정</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M4 4L14 14M14 4L4 14"
                stroke="#6B7280"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
          {/* 별점 선택 */}
          <div>
            <p className="text-[#374151] font-medium text-sm mb-3">별점</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <StarIcon filled={star <= (hoverRating || rating)} size={32} />
                </button>
              ))}
              <span className="ml-2 text-[#FFB800] font-semibold text-base">
                {hoverRating || rating}.0
              </span>
            </div>
          </div>

          {/* 리뷰 내용 */}
          <div>
            <p className="text-[#374151] font-medium text-sm mb-2">내용</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={4}
              placeholder="강의에 대한 솔직한 후기를 남겨주세요."
              className="w-full px-4 py-3 border border-[#E2E8F0] rounded-xl text-sm text-[#1A1F2E] placeholder-[rgba(26,31,46,0.3)] resize-none focus:outline-none focus:border-[#2F5DAA] transition-colors"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#D1D5DB] text-[#4B5563] font-medium text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="flex-1 h-11 rounded-xl bg-[#2F5DAA] text-white font-medium text-base hover:bg-[#1D3E75] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              수정
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 토스트 ── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
      <div className="bg-[#1A1F2E] text-white text-sm font-medium px-6 py-3 rounded-2xl shadow-xl">
        {message}
      </div>
    </div>
  );
}

/* ── 메인 페이지 ── */
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('notices');

  // 액션 상태
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // 리뷰 편집
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toast, setToast] = useState('');

  // 전체보기 상태
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // 섹션 refs
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    getCourseDetail(courseId).then(data => {
      setCourse(data);
      if (data) {
        setIsEnrolled(data.isEnrolled);
        setIsWishlisted(data.isWishlisted);
        setIsInCart(data.isInCart);
        setReviews(data.reviews);
      }
      setIsLoading(false);
    });
  }, [courseId]);

  // Scroll spy
  const handleScroll = useCallback(() => {
    const offset = 100;
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

  const handleEditSubmit = (rating: number, content: string) => {
    if (!editingReview) return;
    setReviews(prev =>
      prev.map(r => (r.reviewId === editingReview.reviewId ? { ...r, rating, content } : r)
      )
    );
    setEditingReview(null);
    setToast('리뷰가 수정되었습니다');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <UserHeader />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-2 border-[#2F5DAA] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <UserHeader />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-[#6B7280] text-lg">강의를 찾을 수 없습니다.</p>
          <Link href="/courses" className="text-[#2F5DAA] font-medium hover:underline">
            강의 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const totalReviewCount = reviews.reduce((s, _) => s + 1, 0);
  const maxRatingCount = Math.max(...course.ratingDistribution.map(d => d.count), 1);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const displayedNotices = showAllNotices ? course.notices : course.notices.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <UserHeader />

      <div className="w-full max-w-[1440px] mx-auto px-[157.5px] py-10">
        {/* ── 히어로 카드 ── */}
        <div className="bg-white border border-[#D5D8DD] rounded-2xl overflow-hidden mb-6">
          <div className="flex gap-8 p-8">
            {/* 썸네일 */}
            <div className="flex-shrink-0 w-[280px] h-[190px] bg-[#EEF3FB] rounded-xl overflow-hidden relative">
              {course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="12" fill="#DDE6F5" />
                    <path
                      d="M18 16L32 24L18 32V16Z"
                      fill="#2F5DAA"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* 강의 정보 */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* 과목 뱃지 */}
              <span className="inline-flex items-center self-start px-3 py-1 bg-[#EEF3FB] text-[#2F5DAA] text-xs font-semibold rounded-full mb-3">
                {course.subjectName}
              </span>

              {/* 제목 */}
              <h1 className="text-[#1A1F2E] font-bold text-2xl leading-tight mb-2">
                {course.title}
              </h1>

              {/* 설명 */}
              <p className="text-[#6B7280] text-sm leading-relaxed mb-4 line-clamp-2">
                {course.description}
              </p>

              {/* 강사 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#2F5DAA] flex items-center justify-center text-white text-xs font-semibold">
                  {course.instructorName[0]}
                </div>
                <span className="text-[#374151] text-sm font-medium">{course.instructorName}</span>
              </div>

              {/* 별점 + 수강생 */}
              <div className="flex items-center gap-5 mb-4">
                <div className="flex items-center gap-1.5">
                  <StarRow rating={Math.round(course.averageRating)} size={18} />
                  <span className="text-[#FFB800] font-bold text-sm">{course.averageRating}</span>
                  <span className="text-[#9CA3AF] text-sm">
                    ({course.reviewCount.toLocaleString()}개)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#6B7280] text-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="5.5" r="2.5" stroke="#9CA3AF" strokeWidth="1.2" />
                    <path
                      d="M2.5 13.5C2.5 11.015 5.015 9 8 9C10.985 9 13.5 11.015 13.5 13.5"
                      stroke="#9CA3AF"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span>{course.studentCount.toLocaleString()}명 수강 중</span>
                </div>
              </div>

              {/* 가격 */}
              <div className="mt-auto">
                {course.isFree ? (
                  <span className="text-[#16A34A] font-bold text-2xl">무료</span>
                ) : (
                  <span className="text-[#1A1F2E] font-bold text-2xl">
                    ₩{course.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 액션 버튼 영역 */}
          <div className="border-t border-[#E2E8F0] px-8 py-4 flex items-center gap-3">
            {/* 수강신청 */}
            <button
              onClick={() => setIsEnrolled(v => !v)}
              className={`flex-1 h-11 rounded-xl font-semibold text-base transition-colors ${
                isEnrolled
                  ? 'bg-[#1D3E75] text-white'
                  : 'bg-[#2F5DAA] text-white hover:bg-[#1D3E75]'
              }`}
            >
              {isEnrolled ? '수강 중' : '수강신청'}
            </button>

            {/* 장바구니 */}
            <button
              onClick={() => setIsInCart(v => !v)}
              className={`h-11 px-6 rounded-xl font-semibold text-base border transition-colors ${
                isInCart
                  ? 'bg-[#EEF3FB] text-[#2F5DAA] border-[#2F5DAA]'
                  : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
              }`}
            >
              {isInCart ? '장바구니 담김' : '장바구니 담기'}
            </button>

            {/* 찜하기 */}
            <button
              onClick={() => setIsWishlisted(v => !v)}
              className={`h-11 px-5 rounded-xl font-semibold text-base border transition-colors ${
                isWishlisted
                  ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]'
                  : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 13.5C8 13.5 2 10 2 5.5C2 3.567 3.567 2 5.5 2C6.48 2 7.364 2.405 8 3.063C8.636 2.405 9.52 2 10.5 2C12.433 2 14 3.567 14 5.5C14 10 8 13.5 8 13.5Z"
                    fill={isWishlisted ? '#EF4444' : 'none'}
                    stroke={isWishlisted ? '#EF4444' : '#9CA3AF'}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                찜하기
              </span>
            </button>
          </div>
        </div>

        {/* ── 2컬럼 레이아웃 ── */}
        <div className="flex gap-5 items-start">
          {/* ── 메인 콘텐츠 ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* 공지사항 */}
            <SectionCard id="notices">
              <div className="px-8 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F2E] font-bold text-xl">공지사항</h2>
                <button
                  onClick={() => setShowAllNotices(v => !v)}
                  className="text-[#2F5DAA] text-sm font-medium hover:underline"
                >
                  {showAllNotices ? '접기' : '전체보기'}
                </button>
              </div>
              <div>
                {displayedNotices.map((notice, idx) => (
                  <div
                    key={notice.noticeId}
                    className={`flex items-center justify-between px-8 py-4 ${
                      idx < displayedNotices.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 4h12M2 8h8M2 12h5"
                            stroke="#9CA3AF"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      <span className="text-[#374151] text-sm truncate">{notice.title}</span>
                    </div>
                    <span className="flex-shrink-0 ml-4 text-[#9CA3AF] text-xs">
                      {notice.createdAt}
                    </span>
                  </div>
                ))}
                {course.notices.length === 0 && (
                  <p className="px-8 py-6 text-[#9CA3AF] text-sm text-center">
                    등록된 공지사항이 없습니다.
                  </p>
                )}
              </div>
            </SectionCard>

            {/* 강사소개 */}
            <SectionCard id="instructor">
              <SectionHeader title="강사소개" />
              <div className="px-8 py-6">
                <div className="flex items-start gap-5">
                  {/* 아바타 */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-[#2F5DAA] flex items-center justify-center text-white font-bold text-2xl">
                    {course.instructor.name[0]}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-[#1A1F2E] font-bold text-lg mb-1">
                      {course.instructor.name}
                    </h3>
                    {/* 태그 */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {course.instructor.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-[#F1F5F9] text-[#4B5563] text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[#4B5563] text-sm leading-relaxed mb-5">
                      {course.instructor.bio}
                    </p>

                    {/* 경력 */}
                    <div className="bg-[#F8FAFC] rounded-xl p-5">
                      <p className="text-[#374151] font-semibold text-sm mb-3">주요 경력</p>
                      <ul className="flex flex-col gap-2">
                        {course.instructor.career.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-[#4B5563]">
                            <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2F5DAA]" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 강의소개 */}
            <SectionCard id="intro">
              <SectionHeader title="강의소개" />
              <div className="px-8 py-6 flex flex-col gap-7">
                {/* 학습목표 */}
                <div>
                  <h3 className="text-[#1A1F2E] font-semibold text-base mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#2F5DAA] rounded-full inline-block" />
                    학습목표
                  </h3>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {course.learningGoals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          className="flex-shrink-0 mt-0.5"
                        >
                          <circle cx="9" cy="9" r="8" fill="#EEF3FB" />
                          <path
                            d="M5.5 9L7.5 11L12 6.5"
                            stroke="#2F5DAA"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-[#374151] text-sm leading-snug">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#F1F5F9]" />

                {/* 추천대상 */}
                <div>
                  <h3 className="text-[#1A1F2E] font-semibold text-base mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#2F5DAA] rounded-full inline-block" />
                    추천대상
                  </h3>
                  <ul className="flex flex-col gap-2.5">
                    {course.targetAudience.map((t, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          className="flex-shrink-0 mt-0.5"
                        >
                          <circle cx="9" cy="9" r="3" fill="#2F5DAA" />
                        </svg>
                        <span className="text-[#374151] text-sm leading-snug">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#F1F5F9]" />

                {/* 통계 + 제공자료 */}
                <div className="grid grid-cols-2 gap-6">
                  {/* 강의 통계 */}
                  <div className="bg-[#F8FAFC] rounded-xl p-5">
                    <p className="text-[#374151] font-semibold text-sm mb-4">강의 통계</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7280] text-sm">수강생</span>
                        <span className="text-[#1A1F2E] font-semibold text-sm">
                          {course.studentCount.toLocaleString()}명
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7280] text-sm">총 강의 수</span>
                        <span className="text-[#1A1F2E] font-semibold text-sm">
                          {course.totalLessons}강
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7280] text-sm">총 강의 시간</span>
                        <span className="text-[#1A1F2E] font-semibold text-sm">
                          {course.totalDuration}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6B7280] text-sm">평균 별점</span>
                        <span className="text-[#1A1F2E] font-semibold text-sm">
                          ⭐ {course.averageRating}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 제공자료 */}
                  <div className="bg-[#F8FAFC] rounded-xl p-5">
                    <p className="text-[#374151] font-semibold text-sm mb-4">제공자료</p>
                    <div className="flex flex-col gap-2.5">
                      {course.techTags.map((tag, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect width="14" height="14" rx="3" fill="#EEF3FB" />
                            <path
                              d="M4 7L6 9L10 5"
                              stroke="#2F5DAA"
                              strokeWidth="1.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <span className="text-[#374151] text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 커리큘럼 */}
            <SectionCard id="curriculum">
              <div className="px-8 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F2E] font-bold text-xl">강의 커리큘럼</h2>
                <span className="text-[#6B7280] text-sm">
                  총 {course.totalLessons}강 · {course.totalDuration}
                </span>
              </div>
              {course.curriculum.map((section, idx) => (
                <CurriculumSection key={section.sectionId} section={section} defaultOpen={idx === 0} />
              ))}
            </SectionCard>

            {/* 수강평 */}
            <SectionCard id="reviews">
              <div className="px-8 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F2E] font-bold text-xl">수강평</h2>
                <span className="text-[#6B7280] text-sm">{totalReviewCount}개</span>
              </div>

              {/* 별점 요약 */}
              <div className="px-8 py-6 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-10">
                  {/* 평균 별점 */}
                  <div className="flex flex-col items-center gap-1.5">
                    <span className="text-[#1A1F2E] font-bold text-5xl leading-none">
                      {course.averageRating}
                    </span>
                    <StarRow rating={Math.round(course.averageRating)} size={22} />
                    <span className="text-[#9CA3AF] text-xs">
                      {course.reviewCount.toLocaleString()}개 리뷰
                    </span>
                  </div>

                  {/* 분포 바 */}
                  <div className="flex-1 flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map(star => {
                      const dist = course.ratingDistribution.find(d => d.stars === star);
                      const count = dist?.count ?? 0;
                      const pct = Math.round((count / maxRatingCount) * 100);
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="w-3 text-[#6B7280] text-xs text-right">{star}</span>
                          <StarIcon filled size={14} />
                          <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#FFB800] rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-[#9CA3AF] text-xs">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 리뷰 목록 */}
              <div>
                {displayedReviews.map((review, idx) => (
                  <div
                    key={review.reviewId}
                    className={`px-8 py-5 ${idx < displayedReviews.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {/* 아바타 */}
                        <div className="w-9 h-9 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#4B5563] font-semibold text-sm flex-shrink-0">
                          {review.studentName[0]}
                        </div>
                        <div>
                          <p className="text-[#1A1F2E] font-semibold text-sm">
                            {review.studentName}
                          </p>
                          <p className="text-[#9CA3AF] text-xs">{review.createdAt}</p>
                        </div>
                      </div>
                      {/* 우측 버튼 */}
                      <div className="flex items-center gap-2">
                        {review.isMine && (
                          <button
                            onClick={() => setEditingReview(review)}
                            className="px-3 py-1 text-xs font-medium text-[#2F5DAA] border border-[#2F5DAA] rounded-lg hover:bg-[#EEF3FB] transition-colors"
                          >
                            수정
                          </button>
                        )}
                        {!review.isMine && (
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M7 2C4.24 2 2 4.24 2 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm.5 7.5h-1v-4h1v4zm0-5h-1V3.5h1V4.5z"
                                fill="#EF4444"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 별점 */}
                    <div className="flex items-center gap-1.5 mt-3">
                      <StarRow rating={review.rating} size={16} />
                      <span className="text-[#FFB800] font-semibold text-sm">{review.rating}.0</span>
                    </div>

                    {/* 리뷰 내용 */}
                    <p className="mt-2 text-[#374151] text-sm leading-relaxed">{review.content}</p>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <p className="px-8 py-8 text-[#9CA3AF] text-sm text-center">
                    아직 수강평이 없습니다.
                  </p>
                )}

                {/* 전체보기 */}
                {reviews.length > 3 && (
                  <div className="border-t border-[#F1F5F9] px-8 py-4 flex justify-center">
                    <button
                      onClick={() => setShowAllReviews(v => !v)}
                      className="flex items-center gap-1.5 text-[#2F5DAA] text-sm font-medium hover:underline"
                    >
                      {showAllReviews ? '접기' : `전체 리뷰 보기 (${reviews.length}개)`}
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        className={`transition-transform ${showAllReviews ? 'rotate-180' : ''}`}
                      >
                        <path
                          d="M3 5L7 9L11 5"
                          stroke="#2F5DAA"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          {/* ── 사이드 네비게이션 ── */}
          <aside className="w-[168px] flex-shrink-0">
            <div className="sticky top-6">
              <StickyNav activeId={activeSection} />
            </div>
          </aside>
        </div>
      </div>

      {/* ── 학습 시작 플로팅 버튼 ── */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6A10] text-white font-bold text-base rounded-2xl shadow-lg transition-colors"
          style={{ width: 167, height: 60 }}
        >
          <span className="w-full text-center flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 3.5L14.5 9L5 14.5V3.5Z" fill="white" />
            </svg>
            학습 시작
          </span>
        </button>
      </div>

      {/* ── 리뷰 수정 모달 ── */}
      {editingReview && (
        <ReviewEditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* ── 토스트 ── */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  );
}
