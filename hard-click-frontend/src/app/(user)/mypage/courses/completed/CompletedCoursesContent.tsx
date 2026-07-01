'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from '@/lib/toast';
import ReviewFormModal from '@/features/reviews/components/ReviewFormModal';
import { createReview } from '@/features/reviews/services';
import BackButton from '@/components/common/BackButton';
import type { CompletedCourse } from '@/features/users/types';

/** ISO 날짜 → YYYY.MM.DD */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 완료 강의 화면의 client 잎사귀 — 데이터는 서버 페이지에서 props로 받고,
 * 리뷰 모달/작성 상호작용만 client에서 처리한다.
 */
export default function CompletedCoursesContent({
  completed,
  reviewedCourseIds,
}: {
  completed: CompletedCourse[];
  reviewedCourseIds: number[];
}) {
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(
    new Set(reviewedCourseIds),
  );
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);

  const reviewTarget = completed.find((c) => c.courseId === reviewTargetId);

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (reviewTargetId === null) return;
    const res = await createReview(reviewTargetId, { rating, content });
    if (!res.success) {
      toast.error(res.message || '수강평 등록에 실패했습니다.');
      return;
    }
    setReviewedIds((prev) => new Set(prev).add(reviewTargetId));
    setReviewTargetId(null);
    toast.success(res.message || '수강평이 등록되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-8 pt-9 pb-32">
          {/* 페이지 히어로 */}
          <div className="flex items-center gap-4 mb-8">
            <BackButton
              ariaLabel="뒤로가기"
              className="w-6 h-6 flex items-center justify-center text-[#4B5563] hover:text-[#1F2937]"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </BackButton>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#2F5DAA] rounded-[20px] flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/icons/bookIcon.svg"
                    width={28}
                    height={28}
                    alt=""
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <h1 className="text-[30px] font-bold leading-9 text-[#1F2937] tracking-[0.4px]">
                  수강 완료 강의
                </h1>
              </div>
              <p className="text-base text-[#4B5563]">완료한 강의를 확인하고 리뷰를 남겨보세요.</p>
            </div>
          </div>

          {/* 강의 카드 컨테이너 */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-[0_4px_10px_rgba(0,0,0,0.06)] p-[33px] flex flex-col gap-5">
            {completed.length === 0 ? (
              <EmptyState />
            ) : (
              completed.map((course) => {
                // 완료강의 응답엔 리뷰여부 없음 → activities(내 수강평)로 판단
                const hasReview = reviewedIds.has(course.courseId);
                return (
                  <article
                    key={course.courseId}
                    className="border border-[#E2E8F0] rounded-[20px] p-5 flex gap-5 items-center"
                  >
                    {/* 트로피 박스 — 강의 상세로 (완료 API엔 lastVideoId 없음) */}
                    <Link
                      href={`/courses/${course.courseId}`}
                      className="w-40 h-[140px] bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0 hover:bg-[#EEF2F7] transition-colors"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/trophyIcon.svg" width={48} height={48} alt="" />
                    </Link>

                    {/* 우측 컨텐츠 */}
                    <div className="flex-1 flex flex-col gap-[15px]">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-lg font-semibold leading-7 text-[#1F2937]">
                          {course.courseTitle}
                        </h3>
                        <span className="flex-shrink-0 px-4 py-2 bg-[rgba(22,163,74,0.1)] text-[#16A34A] text-sm font-semibold rounded-2xl">
                          수강 완료
                        </span>
                      </div>

                      {/* 진도바 100% */}
                      <div className="w-full h-2.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#16A34A] rounded-full" style={{ width: '100%' }} />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#4B5563]">
                          완료일: {formatDisplayDate(course.completedAt)}
                        </span>
                        {hasReview ? (
                          <Link
                            href={`/courses/${course.courseId}#reviews`}
                            className="w-[115px] h-10 flex items-center justify-center bg-[#2F5DAA] rounded-[10px] text-base font-semibold text-white hover:bg-[#1D3E75] transition-colors"
                          >
                            내 리뷰 확인
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setReviewTargetId(course.courseId)}
                            className="w-[115px] h-10 border border-[#E2E8F0] rounded-[10px] text-base font-semibold text-[#4B5563] hover:bg-[#F8FAFC] transition-colors"
                          >
                            리뷰 작성하기
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 리뷰 작성 모달 */}
      {reviewTarget && (
        <ReviewFormModal
          courseTitle={reviewTarget.courseTitle}
          onCancel={() => setReviewTargetId(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/emptyStateIcon.svg" width={80} height={80} alt="" />
      <p className="text-xl font-bold text-[#1F2937]">아직 완료한 강의가 없습니다.</p>
      <p className="text-sm text-[#4B5563]">학습을 완료하고 리뷰를 작성해보세요.</p>
    </div>
  );
}
