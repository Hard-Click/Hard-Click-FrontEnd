import { api } from '@/services/api';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  DeleteReviewResponse,
} from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockReviewListResponse } from '@/mocks/reviews.mock';

/* ───── 수강 리뷰 작성 (POST /api/courses/{courseId}/reviews) ─────
 * 권한: 수강 완료(COMPLETED) 상태인 수강생
 * body: { rating, content } → response: { reviewId } (201)
 * 400: 비속어/글자수/별점 단위 오류 | 403: 미완료 | 409: 중복 작성 */
export async function createReview(courseId: number, body: CreateReviewRequest) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 201,
      message: '리뷰가 등록되었습니다',
      data: {
        reviewId: Date.now(),
      } as CreateReviewResponse,
    };
  }
  return api.post<CreateReviewResponse>(`/api/courses/${courseId}/reviews`, body);
}

/* ───── 본인 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) ─────
 * body: { rating, content } → response: { reviewId } (200)
 * 400: 비속어/글자수 | 403: 작성자 본인이 아님 | 404: 없는 리뷰 */
export async function updateReview(
  courseId: number,
  reviewId: number,
  body: UpdateReviewRequest,
) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '리뷰가 수정되었습니다',
      data: { reviewId } as UpdateReviewResponse,
    };
  }
  return api.patch<UpdateReviewResponse>(
    `/api/courses/${courseId}/reviews/${reviewId}`,
    body,
  );
}

/* ───── 리뷰 목록 조회 (GET /api/courses/{courseId}/reviews) ─────
 * 비로그인 공개. sort: 'latest' | 'rating' (백엔드 ReviewSortType 소문자), page 0-based(백엔드 기준)
 * 응답: { avgRating, totalCount, ratingStats:[{rating,count}], reviews:[...], currentPage, totalPages } */
export interface ReviewListItemApi {
  reviewId: number;
  authorName: string;
  authorInitial: string;
  rating: number;
  content: string;
  createdDate: string;
  isMyReview: boolean;
}
export interface ReviewListApiResponse {
  avgRating: number | null;
  totalCount: number;
  ratingStats: Array<{ rating: number; count: number }>;
  reviews: ReviewListItemApi[];
  currentPage: number;
  totalPages: number;
}
export async function getReviews(
  courseId: number,
  sort: 'latest' | 'rating' = 'latest',
  page = 0,
) {
  if (USE_MOCK) {
    const PER_PAGE = 5;
    const sorted = [...mockReviewListResponse.reviews].sort((a, b) =>
      sort === 'rating'
        ? b.rating - a.rating
        : b.createdDate.localeCompare(a.createdDate),
    );
    const start = Math.max(0, page - 1) * PER_PAGE; // 컴포넌트가 1-based page 전달
    return {
      success: true,
      httpStatus: 200,
      message: '',
      data: {
        ...mockReviewListResponse,
        reviews: sorted.slice(start, start + PER_PAGE),
        totalCount: sorted.length,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(sorted.length / PER_PAGE)),
      },
    };
  }
  return api.get<ReviewListApiResponse>(
    `/api/courses/${courseId}/reviews?sort=${sort}&page=${page}`,
  );
}

/* ───── 본인 리뷰 삭제 (DELETE /api/courses/{courseId}/reviews/{reviewId}) ─────
 * body 없음 → response body 없음 (200)
 * 403: 작성자 본인이 아님 | 404: 없는 리뷰 */
export async function deleteReview(courseId: number, reviewId: number) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '리뷰가 삭제되었습니다',
      data: null as DeleteReviewResponse,
    };
  }
  return api.delete<DeleteReviewResponse>(`/api/courses/${courseId}/reviews/${reviewId}`);
}
