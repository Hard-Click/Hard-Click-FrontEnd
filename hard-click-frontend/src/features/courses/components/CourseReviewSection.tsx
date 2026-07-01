'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/lib/toast';
import {
  getReviews,
  updateReview,
  deleteReview,
} from '@/features/reviews/services';
import ReviewFormModal from '@/features/reviews/components/ReviewFormModal';
import ReportModal from '@/features/reports/components/ReportModal';
import { StarRow, StarIcon } from '@/components/common/RatingStars';
import type { Review } from '@/features/courses/types';

interface CourseReviewSectionProps {
  courseId: number;
  /** 비로그인 액션 가드 — 기본 항상 허용(강사 페이지는 항상 로그인 상태). 학생은 자기 가드 전달. */
  requireLogin?: () => boolean;
  /** 사이드네비 앵커 오프셋 — 학생 'scroll-mt-20' / 강사 'scroll-mt-6' */
  scrollMtClassName?: string;
  /** 타인 리뷰 신고 버튼 노출 여부 — 학생 true(기본) / 강사 false(강사는 리뷰 신고 불가) */
  canReport?: boolean;
  /** 신고 관리에서 특정 리뷰로 이동 시 하이라이트할 reviewId (관리자 전용) */
  highlightReviewId?: number;
}

/**
 * 강의 상세 "수강평" 섹션 — 학생·강사 페이지 공용 (라이브 로드 + 블록 페이징 + 모달 내장).
 * 리뷰는 GET /api/courses/{id}/reviews 로 직접 로드(서버 페이지네이션). 내 리뷰(isMine)는 수정/삭제,
 * 남의 리뷰는 신고(canReport=true). 강사는 canReport=false로 신고 버튼 숨김(강사는 리뷰 신고 불가).
 */
export default function CourseReviewSection({
  courseId,
  requireLogin = () => true,
  scrollMtClassName = 'scroll-mt-20',
  canReport = true,
  highlightReviewId,
}: CourseReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [ratingDist, setRatingDist] = useState<
    { stars: number; count: number }[]
  >([]);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewAvg, setReviewAvg] = useState(0);
  const [reviewTotalCount, setReviewTotalCount] = useState(0);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [deletingReview, setDeletingReview] = useState<Review | null>(null);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);

  /* 리뷰 목록 조회 — 백엔드가 내 리뷰 최상단·별점분포·평균 조립 */
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
        })),
      );
      setRatingDist(
        d.ratingStats.map((s) => ({ stars: s.rating, count: s.count })),
      );
      setReviewAvg(d.avgRating ?? 0);
      setReviewTotalCount(d.totalCount);
      setReviewTotalPages(Math.max(1, d.totalPages));
    },
    [courseId],
  );

  useEffect(() => {
    loadReviews(reviewPage);
  }, [loadReviews, reviewPage]);

  /* 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) */
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

  /* 리뷰 삭제 (DELETE /api/courses/{courseId}/reviews/{reviewId}) */
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

  const maxRatingCount = Math.max(...ratingDist.map((d) => d.count), 1);
  const totalReviewPages = reviewTotalPages;
  const displayedReviews = reviews; // 서버 페이지네이션 (getReviews page 기준)
  // 페이지 번호 — 5개 묶음(블록) 단위. < > 는 블록 이동 (1~5 → 6~10 → ...)
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
    <>
      <section id="reviews" className={`${scrollMtClassName} mb-10`}>
        <div
          className="bg-white border border-[#D5D8DD]"
          style={{ padding: '33px 33px 1px' }}
        >
          <h2 className="text-2xl font-semibold text-[#1A1F2E] mb-6">수강평</h2>

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
                    const pct = Math.round((count / maxRatingCount) * 100);
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
                    className={`rounded-2xl border ${
                      highlightReviewId === review.reviewId
                        ? 'border-[#F59E0B] shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
                        : 'border-[#D5D8DD]'
                    }`}
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
                        {/* 내 리뷰 수정/삭제 */}
                        {review.isMine && (
                          <>
                            <button
                              onClick={() => {
                                if (requireLogin()) setEditingReview(review);
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
                                if (requireLogin()) setDeletingReview(review);
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
                        {/* 타인 리뷰 신고 — 공용 ReportModal(targetType=REVIEW). 강사(canReport=false)는 숨김 */}
                        {!review.isMine && canReport && (
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

              {/* 페이지네이션 — 1페이지여도 항상 표시. < > 는 5개 블록 이동 */}
              <div className="flex justify-center items-center gap-1 pt-4 pb-6">
                <button
                  onClick={() => setReviewPage(reviewBlockStart - 1)}
                  disabled={reviewBlockStart === 1}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M10 4L6 8l4 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

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

                <button
                  onClick={() => setReviewPage(reviewBlockEnd + 1)}
                  disabled={reviewBlockEnd === totalReviewPages}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-sm text-[#9CA3AF] hover:bg-[#F0F2F5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
            </>
          )}
        </div>
      </section>

      {/* 리뷰 신고 모달 */}
      {reportingReview && (
        <ReportModal
          target={{ targetType: 'REVIEW', targetId: reportingReview.reviewId }}
          onClose={() => setReportingReview(null)}
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
    </>
  );
}
