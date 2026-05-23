'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import UserHeader from '@/components/layout/headers/UserHeader';
import ConfirmModal from '@/components/ui/confirmModal';
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

/* ── 토스트 ── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-[#16A34A] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-lg">
        {message}
      </div>
    </div>
  );
}

/* ── 리뷰 신고 모달 ── */
const REPORT_REASONS = [
  '부적절한 언어 사용',
  '명예훼손',
  '음란',
  '스팸/광고',
  '개인정보 노출',
  '욕설 및 비하',
  '기타',
];

function ReviewReportModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (reasons: string[], detail: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const toggle = (reason: string) => {
    setSelected(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  if (showConfirm) {
    return (
      <ConfirmModal
        icon="/icons/warningIcon.svg"
        iconBgColor="#FEF3C7"
        title="신고하기"
        description="해당 리뷰를 신고하시겠습니까?"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => onSubmit(selected, detail)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[400px] shadow-xl overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-[#1A1F2E] font-bold text-lg">리뷰 신고</h3>
          <p className="text-[#6B7280] text-xs mt-1">신고 사유를 선택해주세요. (복수 선택 가능)</p>
        </div>

        <div className="px-6 flex flex-col gap-2 max-h-[320px] overflow-y-auto pb-2">
          {REPORT_REASONS.map(reason => {
            const isSelected = selected.includes(reason);
            return (
              <button
                key={reason}
                onClick={() => toggle(reason)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-colors ${
                  isSelected
                    ? 'border-[#EF4444] text-[#EF4444]'
                    : 'border-[#E2E8F0] text-[#374151] hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${
                    isSelected ? 'bg-[#EF4444] border-[#EF4444]' : 'border-[#D1D5DB]'
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                {reason}
              </button>
            );
          })}
        </div>

        <div className="px-6 pt-3 pb-5">
          <p className="text-[#374151] text-sm font-medium mb-2">
            추가 설명 <span className="text-[#9CA3AF] font-normal">(선택)</span>
          </p>
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            rows={3}
            placeholder="추가로 전달하실 내용이 있다면 작성해주세요."
            className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm text-[#1A1F2E] placeholder-[rgba(26,31,46,0.3)] resize-none focus:outline-none focus:border-[#2F5DAA] transition-colors"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#D1D5DB] text-[#4B5563] font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              disabled={selected.length === 0}
              className={`flex-1 h-11 rounded-xl font-medium text-sm transition-colors ${
                selected.length > 0
                  ? 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                  : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
              }`}
            >
              신고하기
            </button>
          </div>
        </div>
      </div>
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

  if (showConfirm) {
    return (
      <ConfirmModal
        icon="/icons/checkCircleIcon.svg"
        iconBgColor="#EEF3FB"
        title="리뷰 수정"
        description="리뷰를 수정하시겠습니까?"
        cancelText="취소"
        confirmText="확인"
        onCancel={() => setShowConfirm(false)}
        onConfirm={() => onSubmit(rating, content)}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl w-[480px] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2E8F0]">
          <h3 className="text-[#1A1F2E] font-bold text-lg">리뷰 수정</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4L14 14M14 4L4 14" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col gap-5">
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

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#D1D5DB] text-[#4B5563] font-medium text-base hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => setShowConfirm(true)}
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

/* ── 커리큘럼 아코디언 ── */
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
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          >
            <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[#1A1F2E] font-semibold text-base">{section.title}</span>
          <span className="text-[#6B7280] text-sm">
            {section.lessons.length}개 강의 · {totalStr}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="bg-[#F8FAFC]">
          {section.lessons.map(lesson => (
            <div
              key={lesson.lessonId}
              className="flex items-center justify-between px-10 py-3 border-t border-[#E2E8F0]"
            >
              <div className="flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="flex-shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#D1D5DB" strokeWidth="1.2" />
                  <path d="M6.5 5.5L10.5 8L6.5 10.5V5.5Z" fill="#9CA3AF" />
                </svg>
                <span className="text-[#374151] text-sm">{lesson.title}</span>
                {lesson.isPreview && (
                  <button className="px-2 py-0.5 bg-[#EEF3FB] text-[#2F5DAA] text-xs font-medium rounded-full hover:bg-[#D8E6F7] transition-colors">
                    미리보기
                  </button>
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
              ? 'text-[#2F5DAA] bg-[#EEF3FB] font-semibold'
              : 'text-[#6B7280] hover:bg-gray-50'
          }`}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}

/* ── 섹션 카드 ── */
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

/* ── 메인 페이지 ── */
export default function CourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('notices');

  // 수강/찜/장바구니
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 모달 상태
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  // 리뷰 & 공지
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showAllNotices, setShowAllNotices] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // 토스트
  const [toast, setToast] = useState('');

  useEffect(() => {
    getCourseDetail(courseId).then(data => {
      setCourse(data);
      if (data) {
        setIsEnrolled(data.isEnrolled);
        setIsWishlisted(data.isWishlisted);
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

  const handleEnrollConfirm = () => {
    setShowEnrollConfirm(false);
    setIsEnrolled(true);
    setToast('수강 신청되었습니다.');
  };

  const handleEditSubmit = (rating: number, content: string) => {
    if (!editingReview) return;
    setReviews(prev =>
      prev.map(r => (r.reviewId === editingReview.reviewId ? { ...r, rating, content } : r))
    );
    setEditingReview(null);
    setToast('리뷰가 수정되었습니다');
  };

  const handleReportSubmit = () => {
    setReportingReview(null);
    setToast('신고가 접수되었습니다.');
  };

  // 로딩
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

  // 강의 없음 (삭제 등)
  if (!course) {
    return (
      <div className="min-h-screen bg-[#F0F2F5]">
        <UserHeader />
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
          <div className="bg-white rounded-2xl border border-[#E2E8F0] flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-full border-2 border-[#D1D5DB] flex items-center justify-center">
              <span className="text-[#9CA3AF] font-bold text-2xl">!</span>
            </div>
            <p className="text-[#1A1F2E] font-semibold text-lg">삭제된 강의입니다.</p>
            <p className="text-[#6B7280] text-sm">강의 목록에서 다른 강의를 확인해보세요.</p>
          </div>
        </div>
      </div>
    );
  }

  const maxRatingCount = Math.max(...course.ratingDistribution.map(d => d.count), 1);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const displayedNotices = showAllNotices ? course.notices : course.notices.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <UserHeader />

      {toast && <Toast message={toast} onDone={() => setToast('')} />}

      <div className="w-full max-w-[1440px] mx-auto px-[157.5px] py-8">

        {/* ── 히어로 카드 ── */}
        <div className="bg-white border border-[#D5D8DD] rounded-2xl overflow-hidden mb-5">
          <div className="flex gap-7 p-7">
            {/* 썸네일 */}
            <div className="flex-shrink-0 w-[240px] h-[165px] bg-[#1A1F2E] rounded-xl overflow-hidden relative">
              {course.thumbnailUrl ? (
                <Image src={course.thumbnailUrl} alt={course.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M14 10L38 24L14 38V10Z" fill="rgba(255,255,255,0.4)" />
                  </svg>
                </div>
              )}
            </div>

            {/* 강의 정보 */}
            <div className="flex-1 min-w-0 flex flex-col py-1">
              <h1 className="text-[#1A1F2E] font-bold text-xl leading-snug mb-1.5">
                {course.title}
              </h1>
              <p className="text-[#6B7280] text-sm leading-relaxed mb-3 line-clamp-2">
                {course.description}
              </p>

              {/* 강사 */}
              <p className="text-[#4B5563] text-sm mb-3">
                강사: <span className="font-medium">{course.instructorName}</span>
              </p>

              {/* 별점 */}
              <div className="flex items-center gap-1.5 mb-3">
                <StarRow rating={Math.round(course.averageRating)} size={17} />
                <span className="text-[#FFB800] font-bold text-sm">{course.averageRating}</span>
                <span className="text-[#9CA3AF] text-sm">
                  ({course.reviewCount.toLocaleString()}개 리뷰)
                </span>
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-4 text-[#6B7280] text-sm mb-4">
                <div className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="5" r="2.5" stroke="#9CA3AF" strokeWidth="1.1" />
                    <path d="M2 13C2 10.79 4.46 9 7.5 9S13 10.79 13 13" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round" />
                  </svg>
                  <span>{course.studentCount.toLocaleString()}명 수강</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="7.5" r="6" stroke="#9CA3AF" strokeWidth="1.1" />
                    <path d="M7.5 4.5V7.5L9.5 9.5" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{course.totalDuration}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2 11L5.5 7L8 9.5L11 5.5L13 8" stroke="#9CA3AF" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>중급~고급</span>
                </div>
              </div>

              {/* 가격 */}
              <div className="mt-auto">
                {course.isFree ? (
                  <span className="text-[#16A34A] font-bold text-2xl">무료</span>
                ) : (
                  <span className="text-[#2F5DAA] font-bold text-2xl">
                    ₩{course.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="border-t border-[#E2E8F0] px-7 py-4 flex items-center gap-3">
            {isEnrolled ? (
              <button className="flex-1 h-11 rounded-xl bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors">
                학습하기
              </button>
            ) : (
              <>
                <button
                  onClick={() => setShowEnrollConfirm(true)}
                  className="flex-1 h-11 rounded-xl bg-[#2F5DAA] text-white font-semibold text-base hover:bg-[#1D3E75] transition-colors"
                >
                  수강 신청
                </button>
                <button className="h-11 px-5 rounded-xl font-semibold text-sm border border-[#D1D5DB] text-[#374151] bg-white hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 5.5a3 3 0 015-2.236A3 3 0 0114 5.5c0 4.5-6 8-6 8s-6-3.5-6-8z" stroke="#9CA3AF" strokeWidth="1.2" fill="none" />
                  </svg>
                  장바구니 담기
                </button>
              </>
            )}
            <button
              onClick={() => setIsWishlisted(v => !v)}
              className={`h-11 px-5 rounded-xl font-semibold text-sm border transition-colors flex items-center gap-1.5 ${
                isWishlisted
                  ? 'bg-[#FEF2F2] text-[#EF4444] border-[#EF4444]'
                  : 'bg-white text-[#374151] border-[#D1D5DB] hover:bg-gray-50'
              }`}
            >
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
            </button>
          </div>
        </div>

        {/* ── 2컬럼 ── */}
        <div className="flex gap-5 items-start">
          {/* 메인 콘텐츠 */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* 강의 공지사항 */}
            <SectionCard id="notices">
              <div className="px-7 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F2E] font-bold text-lg flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 5h12M3 9h8M3 13h5" stroke="#2F5DAA" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  강의 공지사항
                </h2>
                <button
                  onClick={() => setShowAllNotices(v => !v)}
                  className="text-[#2F5DAA] text-sm font-medium hover:underline"
                >
                  {showAllNotices ? '접기' : '전체보기'}
                </button>
              </div>

              {course.notices.length === 0 ? (
                <p className="px-7 py-6 text-[#9CA3AF] text-sm text-center">공지사항이 없습니다.</p>
              ) : (
                <div>
                  {displayedNotices.map((notice, idx) => {
                    const isFirst = idx === 0;
                    return (
                      <div
                        key={notice.noticeId}
                        className={`px-7 py-4 ${
                          isFirst ? 'bg-[#EEF3FB]' : 'border-t border-[#F1F5F9]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-2.5 min-w-0">
                            {isFirst && (
                              <span className="flex-shrink-0 mt-0.5 px-2 py-0.5 bg-[#2F5DAA] text-white text-[10px] font-semibold rounded">
                                공지
                              </span>
                            )}
                            <span
                              className={`text-sm leading-snug ${
                                isFirst
                                  ? 'text-[#1A1F2E] font-semibold'
                                  : 'text-[#374151]'
                              }`}
                            >
                              {notice.title}
                            </span>
                          </div>
                          <span className="flex-shrink-0 text-[#9CA3AF] text-xs">
                            {notice.createdAt}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* 강사소개 */}
            <SectionCard id="instructor">
              <div className="px-7 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-[#1A1F2E] font-bold text-lg">강사소개</h2>
              </div>
              <div className="px-7 py-6">
                <div className="flex items-start gap-5">
                  <div className="flex-shrink-0 w-14 h-14 rounded-full bg-[#2F5DAA] flex items-center justify-center text-white font-bold text-xl">
                    {course.instructor.name[0]}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-[#1A1F2E] font-bold text-base mb-1.5">
                      {course.instructor.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {course.instructor.tags.map(tag => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-[#F1F5F9] text-[#4B5563] text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <p className="text-[#4B5563] text-sm leading-relaxed mb-4">
                      {course.instructor.bio}
                    </p>
                    <div className="bg-[#F8FAFC] rounded-xl p-4">
                      <p className="text-[#374151] font-semibold text-sm mb-2.5">주요 경력</p>
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
              <div className="px-7 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-[#1A1F2E] font-bold text-lg">강의소개</h2>
              </div>
              <div className="px-7 py-6 flex flex-col gap-6">
                {/* 학습목표 */}
                <div>
                  <h3 className="text-[#1A1F2E] font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#2F5DAA] rounded-full" />
                    학습목표
                  </h3>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                    {course.learningGoals.map((goal, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" className="flex-shrink-0 mt-0.5">
                          <circle cx="8.5" cy="8.5" r="7.5" fill="#EEF3FB" />
                          <path d="M5 8.5L7 10.5L12 6" stroke="#2F5DAA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="text-[#374151] text-sm leading-snug">{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#F1F5F9]" />

                {/* 추천대상 */}
                <div>
                  <h3 className="text-[#1A1F2E] font-semibold text-sm mb-3 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#2F5DAA] rounded-full" />
                    추천대상
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {course.targetAudience.map((t, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-2 w-1.5 h-1.5 rounded-full bg-[#9CA3AF]" />
                        <span className="text-[#374151] text-sm">{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#F1F5F9]" />

                {/* 통계 + 제공자료 */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-[#374151] font-semibold text-sm mb-3">강의 통계</p>
                    <div className="flex flex-col gap-2.5">
                      {[
                        { label: '수강생', value: `${course.studentCount.toLocaleString()}명` },
                        { label: '총 강의 수', value: `${course.totalLessons}강` },
                        { label: '총 강의 시간', value: course.totalDuration },
                        { label: '평균 별점', value: `⭐ ${course.averageRating}` },
                      ].map(stat => (
                        <div key={stat.label} className="flex items-center justify-between">
                          <span className="text-[#6B7280] text-sm">{stat.label}</span>
                          <span className="text-[#1A1F2E] font-semibold text-sm">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-4">
                    <p className="text-[#374151] font-semibold text-sm mb-3">제공자료</p>
                    <div className="flex flex-col gap-2">
                      {course.techTags.map((tag, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect width="14" height="14" rx="3" fill="#EEF3FB" />
                            <path d="M3.5 7L5.5 9L10.5 4.5" stroke="#2F5DAA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="text-[#374151] text-sm">{tag}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* 강의 커리큘럼 */}
            <SectionCard id="curriculum">
              <div className="px-7 py-5 border-b border-[#E2E8F0] flex items-center justify-between">
                <h2 className="text-[#1A1F2E] font-bold text-lg">강의 커리큘럼</h2>
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
              <div className="px-7 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-[#1A1F2E] font-bold text-lg">수강평</h2>
              </div>

              {reviews.length === 0 ? (
                /* 빈 상태 */
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-full border-2 border-[#D1D5DB] flex items-center justify-center">
                    <span className="text-[#9CA3AF] font-bold text-2xl">!</span>
                  </div>
                  <p className="text-[#1A1F2E] font-semibold text-base">아직 등록된 수강평이 없습니다.</p>
                  <p className="text-[#9CA3AF] text-sm">강의를 수강하고 리뷰를 작성해보세요.</p>
                </div>
              ) : (
                <>
                  {/* 별점 요약 */}
                  <div className="px-7 py-6 border-b border-[#E2E8F0]">
                    <div className="flex items-center gap-10">
                      <div className="flex flex-col items-center gap-1.5 w-28 flex-shrink-0 bg-[#F8FAFC] rounded-2xl py-5">
                        <span className="text-[#1A1F2E] font-bold text-4xl leading-none">
                          {course.averageRating}
                        </span>
                        <StarRow rating={Math.round(course.averageRating)} size={18} />
                        <span className="text-[#9CA3AF] text-xs">
                          총 {course.reviewCount.toLocaleString()}개 리뷰
                        </span>
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        {[5, 4, 3, 2, 1].map(star => {
                          const dist = course.ratingDistribution.find(d => d.stars === star);
                          const count = dist?.count ?? 0;
                          const pct = Math.round((count / maxRatingCount) * 100);
                          return (
                            <div key={star} className="flex items-center gap-2.5">
                              <div className="flex items-center gap-1 w-8 justify-end">
                                <span className="text-[#6B7280] text-xs">{star}</span>
                                <StarIcon filled size={12} />
                              </div>
                              <div className="flex-1 h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#FFB800] rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-6 text-[#9CA3AF] text-xs text-right">{count}</span>
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
                        className={`px-7 py-5 ${
                          idx < displayedReviews.length - 1 ? 'border-b border-[#F1F5F9]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
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
                          {/* 아이콘 버튼들 */}
                          <div className="flex items-center gap-1.5">
                            {review.isMine && (
                              <button
                                onClick={() => setEditingReview(review)}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[#EEF3FB] transition-colors"
                                title="수정"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                  <path
                                    d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z"
                                    stroke="#2F5DAA"
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </button>
                            )}
                            {/* 신고 버튼 (내 리뷰 포함 모두 표시) */}
                            <button
                              onClick={() => !review.isMine && setReportingReview(review)}
                              className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                                review.isMine
                                  ? 'opacity-0 pointer-events-none'
                                  : 'hover:bg-red-50'
                              }`}
                              title="신고"
                            >
                              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                <path
                                  d="M2 2H8L7 5H12L9.5 8.5H4.5L3.5 12M2 2V12"
                                  stroke="#EF4444"
                                  strokeWidth="1.2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2.5">
                          <StarRow rating={review.rating} size={15} />
                          <span className="text-[#FFB800] font-semibold text-sm">{review.rating}.0</span>
                        </div>
                        <p className="mt-2 text-[#374151] text-sm leading-relaxed">{review.content}</p>
                      </div>
                    ))}

                    {reviews.length > 3 && (
                      <div className="border-t border-[#F1F5F9] px-7 py-4 flex justify-center">
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
                            <path d="M3 5L7 9L11 5" stroke="#2F5DAA" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </SectionCard>
          </div>

          {/* 사이드 네비게이션 */}
          <aside className="w-[140px] flex-shrink-0">
            <div className="sticky top-6">
              <StickyNav activeId={activeSection} />
            </div>
          </aside>
        </div>
      </div>

      {/* 학습 시작 플로팅 버튼 */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          className="flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA6A10] text-white font-bold text-base rounded-2xl shadow-lg transition-colors"
          style={{ width: 167, height: 60 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M5 3.5L14.5 9L5 14.5V3.5Z" fill="white" />
          </svg>
          학습 시작
        </button>
      </div>

      {/* 수강 신청 확인 모달 */}
      {showEnrollConfirm && (
        <ConfirmModal
          icon="/icons/checkCircleIcon.svg"
          iconBgColor="#EEF3FB"
          title="수강 신청"
          description={`결제가 필요한 강의입니다.\n결제 화면으로 이동하시겠습니까?`}
          cancelText="취소"
          confirmText="확인"
          onCancel={() => setShowEnrollConfirm(false)}
          onConfirm={handleEnrollConfirm}
        />
      )}

      {/* 리뷰 수정 모달 */}
      {editingReview && (
        <ReviewEditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* 리뷰 신고 모달 */}
      {reportingReview && (
        <ReviewReportModal
          onClose={() => setReportingReview(null)}
          onSubmit={handleReportSubmit}
        />
      )}
    </div>
  );
}
