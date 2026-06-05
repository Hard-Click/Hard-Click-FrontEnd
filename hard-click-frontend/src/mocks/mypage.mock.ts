/**
 * 마이페이지 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/users/me (내 프로필 조회)
 * GET /api/users/me/activities (내 활동 조회)
 * GET /api/users/me/courses (내 수강 강의 목록 — 진도율·이어보기)
 * GET /api/users/me/courses/completed (완료 강의 목록 조회)
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

/**
 * GET /api/users/me/courses (내 수강 강의 목록, data는 배열 직접)
 * '이어보기'는 lastVideoId → GET /api/learning/videos/{lastVideoId}/play 로 연결.
 */
export interface MyCourseApiItem {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  instructorName: string;
  progressRate: number;
  lastVideoId: number;
  lastPositionSeconds: number;
  lastStudiedAt: string;
}

export const mockMyCourses: MyCourseApiItem[] = [
  {
    courseId: 12,
    courseTitle: 'React 완벽 가이드',
    thumbnailUrl: 'https://cdn.example.com/courses/12.png',
    instructorName: '홍길동',
    progressRate: 64.2,
    lastVideoId: 101,
    lastPositionSeconds: 420,
    lastStudiedAt: '2026-05-12T21:30:00+09:00',
  },
  {
    courseId: 1,
    courseTitle: '2026 수능 국어 완성반',
    thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
    instructorName: '김강사',
    progressRate: 100,
    lastVideoId: 140,
    lastPositionSeconds: 0,
    lastStudiedAt: '2026-05-09T10:05:00+09:00',
  },
];

/**
 * GET /api/users/me/courses/completed (완료 강의 목록, data는 배열 직접)
 * ※ /courses 와 shape이 다름: completedAt·hasReview 포함, 이어보기 필드 없음.
 */
export interface MyCompletedCourseApiItem {
  courseId: number;
  courseTitle: string;
  completedAt: string;
  progressRate: number;
  hasReview: boolean;
}

export const mockMyCompletedCourses: MyCompletedCourseApiItem[] = [
  {
    courseId: 12,
    courseTitle: '스프링 부트 실전',
    completedAt: '2026-05-01T10:00:00+09:00',
    progressRate: 100,
    hasReview: true,
  },
  {
    courseId: 3,
    courseTitle: '2026 수능 수학 개념완성',
    completedAt: '2026-04-20T09:30:00+09:00',
    progressRate: 100,
    hasReview: false,
  },
];
