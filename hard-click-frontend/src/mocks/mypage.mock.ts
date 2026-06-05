/**
 * 마이페이지 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/users/me (내 프로필 조회)
 * GET /api/users/me/activities (내 활동 조회)
 */

export interface MyProfileApiResponse {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

export interface MyActivityReview {
  reviewId: number;
  courseTitle: string;
  rating: number;
  createdAt: string;
}

export interface MyActivityPost {
  postId: number;
  title: string;
  viewCount: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface MyActivityComment {
  commentId: number;
  content: string;
  createdAt: string;
  isDeleted: boolean;
}

export interface MyActivityApiResponse {
  reviews: MyActivityReview[];
  posts: MyActivityPost[];
  comments: MyActivityComment[];
}

export const mockMyProfile: MyProfileApiResponse = {
  userId: 7,
  email: 'user@example.com',
  nickname: 'studygrass',
  profileImageUrl: 'https://cdn.example.com/profiles/7.png',
};

export const mockMyActivity: MyActivityApiResponse = {
  reviews: [
    {
      reviewId: 1,
      courseTitle: 'React 완벽 가이드',
      rating: 5.0,
      createdAt: '2026-05-10T12:00:00+09:00',
    },
  ],
  posts: [
    {
      postId: 10,
      title: '스터디 모집합니다',
      viewCount: 120,
      createdAt: '2026-05-09T18:30:00+09:00',
      isDeleted: false,
    },
  ],
  comments: [
    {
      commentId: 30,
      content: '좋은 자료 감사합니다.',
      createdAt: '2026-05-08T14:20:00+09:00',
      isDeleted: false,
    },
  ],
};
