/**
 * 마이페이지/회원 도메인 목 데이터 — 실제 백엔드 코드 기준.
 * GET /api/members/me                  → MyProfileView      (※ /users 아님)
 * GET /api/members/me/activities       → MyActivityResponse
 * GET /api/members/me/courses          → List<MyEnrolledCourseResponse> (배열)
 * GET /api/members/me/courses/completed→ List<MyCompletedCourseResponse> (배열)
 *
 * ⚠️ 노션 명세(/api/users/me, nickname, isDeleted, hasReview, instructorName 등)와
 *    다름 — 실제 코드 기준으로 정렬함.
 */

export type BoardType = 'FREE' | 'QUESTION';

/** GET /api/members/me */
export interface MyProfileApiResponse {
  memberId: number;
  name: string;
  email: string;
  profileImageUrl: string;
}

export const mockMyProfile: MyProfileApiResponse = {
  memberId: 7,
  name: '홍길동',
  email: 'user@example.com',
  profileImageUrl: 'https://cdn.example.com/profiles/7.png',
};

/** GET /api/members/me/activities */
export interface MyPostActivity {
  postId: number;
  boardType: BoardType;
  title: string;
  viewCount: number;
  accepted: boolean;
  createdAt: string;
}

export interface MyCommentActivity {
  commentId: number;
  postId: number;
  parentId: number | null;
  content: string;
  accepted: boolean;
  createdAt: string;
}

export interface MyReviewActivity {
  reviewId: number;
  courseId: number;
  rating: number;
  content: string;
  createdAt: string;
}

export interface MyActivityApiResponse {
  posts: MyPostActivity[];
  comments: MyCommentActivity[];
  reviews: MyReviewActivity[];
}

export const mockMyActivity: MyActivityApiResponse = {
  posts: [
    {
      postId: 100,
      boardType: 'QUESTION',
      title: 'Spring 질문입니다',
      viewCount: 12,
      accepted: false,
      createdAt: '2026-05-28T10:30:00',
    },
  ],
  comments: [
    {
      commentId: 200,
      postId: 100,
      parentId: null,
      content: '저도 같은 문제가 있었습니다.',
      accepted: true,
      createdAt: '2026-05-28T11:00:00',
    },
  ],
  reviews: [
    {
      reviewId: 300,
      courseId: 20,
      rating: 5,
      content: '강의가 이해하기 쉬웠습니다.',
      createdAt: '2026-05-28T12:00:00',
    },
  ],
};

/**
 * GET /api/members/me/courses (내 수강 강의, 배열 직접)
 * '이어보기'는 lastVideoId → GET /api/learning/videos/{lastVideoId}/play 로 연결.
 */
export interface MyEnrolledCourseApiItem {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  progressRate: number;
  lastVideoId: number;
  lastPositionSeconds: number;
  lastStudiedAt: string;
}

export const mockMyEnrolledCourses: MyEnrolledCourseApiItem[] = [
  {
    courseId: 12,
    courseTitle: 'React 완벽 가이드',
    thumbnailUrl: 'https://cdn.example.com/courses/12.png',
    progressRate: 64.2,
    lastVideoId: 101,
    lastPositionSeconds: 420,
    lastStudiedAt: '2026-05-12T21:30:00',
  },
];

/** GET /api/members/me/courses/completed (완료 강의, 배열 직접) */
export interface MyCompletedCourseApiItem {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  progressRate: number;
  completedAt: string;
}

export const mockMyCompletedCourses: MyCompletedCourseApiItem[] = [
  {
    courseId: 3,
    courseTitle: '2026 수능 수학 개념완성',
    thumbnailUrl: 'https://cdn.example.com/courses/3/thumbnail.jpg',
    progressRate: 100,
    completedAt: '2026-04-20T09:30:00',
  },
];
