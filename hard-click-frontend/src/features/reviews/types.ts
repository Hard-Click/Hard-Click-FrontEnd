/** 리뷰(reviews) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 수강 리뷰 작성 (POST /api/courses/{courseId}/reviews) ─────
 * rating: 0.5 단위 (0.5~5.0), content: 10~300자 */
export interface CreateReviewRequest {
  rating: number;
  content: string;
}

export interface CreateReviewResponse {
  reviewId: number;
  memberName?: string;
  createdAt?: string;
}

/* ───── 본인 리뷰 수정 (PATCH /api/courses/{courseId}/reviews/{reviewId}) ───── */
export interface UpdateReviewRequest {
  rating: number;
  content: string;
}

export interface UpdateReviewResponse {
  reviewId: number;
}

/* ───── 본인 리뷰 삭제 (DELETE /api/courses/{courseId}/reviews/{reviewId}) ─────
 * 응답 data는 null */
export type DeleteReviewResponse = null;
