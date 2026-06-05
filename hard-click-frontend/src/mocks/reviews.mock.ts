/**
 * 리뷰 도메인 목 데이터 — 실제 백엔드 코드(community ReviewListResponse) DTO 기준.
 * GET /api/courses/{courseId}/reviews
 *   { avgRating, totalCount, ratingStats[], reviews[], currentPage, totalPages }
 *
 * ⚠️ 노션 명세({content,totalPages}·isMine·createdAt)와 다름 — 실제 코드 기준.
 *    (실서비스 타입은 features/reviews/services.ts 의 ReviewListApiResponse 와 동일)
 */

export interface ReviewItemApi {
  reviewId: number;
  authorName: string;
  authorInitial: string;
  rating: number;
  content: string;
  createdDate: string; // LocalDate (yyyy-MM-dd)
  isMyReview: boolean;
}

export interface ReviewListApiResponse {
  avgRating: number | null;
  totalCount: number;
  ratingStats: Array<{ rating: number; count: number }>;
  reviews: ReviewItemApi[];
  currentPage: number;
  totalPages: number;
}

export const mockReviewListResponse: ReviewListApiResponse = {
  avgRating: 4.6,
  totalCount: 2,
  ratingStats: [
    { rating: 5, count: 1 },
    { rating: 4, count: 1 },
    { rating: 3, count: 0 },
    { rating: 2, count: 0 },
    { rating: 1, count: 0 },
  ],
  reviews: [
    {
      reviewId: 150,
      authorName: '이태연',
      authorInitial: '이',
      rating: 5,
      content: '기초부터 탄탄하게 잡아주는 최고의 강의입니다!',
      createdDate: '2026-05-10',
      isMyReview: true,
    },
    {
      reviewId: 142,
      authorName: '김민수',
      authorInitial: '김',
      rating: 4,
      content: '이해하기 쉽고 설명이 명확해요.',
      createdDate: '2026-05-09',
      isMyReview: false,
    },
  ],
  currentPage: 0,
  totalPages: 5,
};
