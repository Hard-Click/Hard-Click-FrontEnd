'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import ReviewFormModal from '@/features/reviews/components/ReviewFormModal';
import { createReview } from '@/features/reviews/services';
import { getMyCourses } from '@/features/users/services';
import type { MyCourse } from '@/features/users/types';

/** ISO 날짜 → YYYY.MM.DD */
function formatDisplayDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/* mock 리뷰 storage (mypage/page.tsx와 공유) */
const REVIEW_STORAGE_KEY = 'mock_my_reviews';
type StoredReview = { courseId: number; rating: number; content: string };

function loadStoredReviews(): Record<number, StoredReview> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(REVIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredReview(courseId: number, rating: number, content: string) {
  if (typeof window === 'undefined') return;
  const map = loadStoredReviews();
  map[courseId] = { courseId, rating, content };
  window.localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(map));
}

export default function CompletedCoursesPage() {
  const router = useRouter();
  const [reviewMap, setReviewMap] = useState<Record<number, StoredReview>>({});
  const [reviewTargetId, setReviewTargetId] = useState<number | null>(null);
  const [completed, setCompleted] = useState<MyCourse[]>([]);

  useEffect(() => {
    setReviewMap(loadStoredReviews());
    getMyCourses().then((res) => {
      if (res.success) {
        // 백엔드 통합 endpoint — 수강 완료 강의만 필터링
        setCompleted(res.data.filter((c) => c.progressRate === 100));
      }
    });
  }, []);

  const reviewTarget = completed.find((c) => c.courseId === reviewTargetId);

  const handleReviewSubmit = async (rating: number, content: string) => {
    if (reviewTargetId === null) return;
    const res = await createReview(reviewTargetId, { rating, content });
    if (!res.success) {
      toast.error(res.message || '수강평 등록에 실패했습니다.');
      return;
    }
    saveStoredReview(reviewTargetId, rating, content);
    setReviewMap((prev) => ({
      ...prev,
      [reviewTargetId]: { courseId: reviewTargetId, rating, content },
    }));
    setReviewTargetId(null);
    toast.success(res.message || '수강평이 등록되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      <div className="w-full">
        <div className="max-w-[1280px] mx-auto px-8 pt-9 pb-32">
          {/* 페이지 히어로 */}
          <div className="flex items-center gap-4 mb-8">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="뒤로가기"
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
            </button>

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
                // 백엔드 통합 endpoint에는 hasReview 없음 — 클라이언트 localStorage 기준으로 판단
                const hasReview = !!reviewMap[course.courseId];
                return (
                  <article
                    key={course.courseId}
                    className="border border-[#E2E8F0] rounded-[20px] p-5 flex gap-5 items-center"
                  >
                    {/* 트로피 박스 */}
                    <div className="w-40 h-[140px] bg-[#F8FAFC] rounded-2xl flex items-center justify-center flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="/icons/trophyIcon.svg" width={48} height={48} alt="" />
                    </div>

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
                          완료일: {formatDisplayDate(course.lastStudiedAt)}
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
