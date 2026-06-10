/**
 * 리뷰 도메인 목 데이터 — 실제 백엔드 코드(community ReviewListResponse) DTO 기준.
 * GET /api/courses/{courseId}/reviews
 *   { avgRating, totalCount, ratingStats[], reviews[], currentPage, totalPages }
 *
 * ⚠️ 노션 명세({content,totalPages}·isMine·createdAt)와 다름 — 실제 코드 기준.
 *    (실서비스 타입은 features/reviews/services.ts 의 ReviewListApiResponse 와 동일)
 *
 * 페이징 시각 확인용으로 리뷰 13개 구성 — getReviews mock 분기가 page별로 잘라서 준다.
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
  avgRating: 4.3,
  totalCount: 13,
  ratingStats: [
    { rating: 5, count: 6 },
    { rating: 4, count: 5 },
    { rating: 3, count: 2 },
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
    {
      reviewId: 141,
      authorName: '박지훈',
      authorInitial: '박',
      rating: 5,
      content: '강의 구성이 체계적이라 따라가기 좋았어요.',
      createdDate: '2026-05-08',
      isMyReview: false,
    },
    {
      reviewId: 140,
      authorName: '최서연',
      authorInitial: '최',
      rating: 5,
      content: '예제가 풍부해서 실전 감각을 익히기 좋습니다.',
      createdDate: '2026-05-07',
      isMyReview: false,
    },
    {
      reviewId: 139,
      authorName: '정우성',
      authorInitial: '정',
      rating: 4,
      content: '전반적으로 만족스럽지만 후반부가 조금 빠릅니다.',
      createdDate: '2026-05-06',
      isMyReview: false,
    },
    {
      reviewId: 138,
      authorName: '한가람',
      authorInitial: '한',
      rating: 3,
      content: '내용은 좋은데 난이도가 생각보다 높네요.',
      createdDate: '2026-05-05',
      isMyReview: false,
    },
    {
      reviewId: 137,
      authorName: '윤서진',
      authorInitial: '윤',
      rating: 5,
      content: '선생님 설명이 귀에 쏙쏙 들어옵니다.',
      createdDate: '2026-05-04',
      isMyReview: false,
    },
    {
      reviewId: 136,
      authorName: '오현우',
      authorInitial: '오',
      rating: 4,
      content: '복습 자료가 잘 정리되어 있어 좋아요.',
      createdDate: '2026-05-03',
      isMyReview: false,
    },
    {
      reviewId: 135,
      authorName: '강민아',
      authorInitial: '강',
      rating: 5,
      content: '입문자에게 강력 추천합니다!',
      createdDate: '2026-05-02',
      isMyReview: false,
    },
    {
      reviewId: 134,
      authorName: '임채원',
      authorInitial: '임',
      rating: 4,
      content: '가격 대비 정말 알찬 강의예요.',
      createdDate: '2026-05-01',
      isMyReview: false,
    },
    {
      reviewId: 133,
      authorName: '송지호',
      authorInitial: '송',
      rating: 3,
      content: '기대보다는 평범했지만 무난합니다.',
      createdDate: '2026-04-30',
      isMyReview: false,
    },
    {
      reviewId: 132,
      authorName: '배수빈',
      authorInitial: '배',
      rating: 5,
      content: '여러 번 돌려봐도 좋은 강의입니다.',
      createdDate: '2026-04-29',
      isMyReview: false,
    },
    {
      reviewId: 131,
      authorName: '신동훈',
      authorInitial: '신',
      rating: 4,
      content: '실전 문제 풀이가 특히 도움됐어요.',
      createdDate: '2026-04-28',
      isMyReview: false,
    },
  ],
  currentPage: 0,
  totalPages: 3,
};
