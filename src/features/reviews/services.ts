import { api } from '@/services/api';
import type {
  CreateReviewRequest,
  CreateReviewResponse,
  UpdateReviewRequest,
  UpdateReviewResponse,
  DeleteReviewResponse,
} from './types';

const USE_MOCK = true;

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
