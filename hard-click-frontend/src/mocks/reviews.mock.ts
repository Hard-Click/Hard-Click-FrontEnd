/**
 * 리뷰 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/courses/{courseId}/reviews
 */

export interface ReviewApiItem {
  reviewId: number;
  authorName: string;
  rating: number;
  content: string;
  isMine: boolean;
  createdAt: string;
}

export interface ReviewListApiResponse {
  content: ReviewApiItem[];
  totalPages: number;
}

export const mockReviewListResponse: ReviewListApiResponse = {
  content: [
    {
      reviewId: 150,
      authorName: '이*연 (나)',
      rating: 5.0,
      content: '기초부터 탄탄하게 잡아주는 최고의 강의입니다!',
      isMine: true,
      createdAt: '2026-05-10T16:20:00',
    },
    {
      reviewId: 142,
      authorName: '김*민',
      rating: 4.5,
      content: '이해하기 쉽고 설명이 명확해요.',
      isMine: false,
      createdAt: '2026-05-09T11:15:00',
    },
  ],
  totalPages: 5,
};
