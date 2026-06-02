/** 리뷰(reviews) 도메인 타입 — 백엔드 RestAPI 명세 매칭 */

/* ───── 수강 리뷰 작성 (POST /api/courses/{courseId}/reviews) ─────
 * rating: 0.5 단위 (0.5~5.0), content: 10~300자
 * 응답: { reviewId } (201 Created) */
export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface CreateReviewResponse {
  reviewId: number;
}

/* ───── 본인 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) ─────
 * 응답: { reviewId } (200 OK) */
export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewResponse {
  reviewId: number;
}

/* ───── 본인 리뷰 삭제 (DELETE /api/courses/{courseId}/reviews/{reviewId}) ─────
 * 응답 body 없음 (200 OK) */
export type DeleteReviewResponse = null;
