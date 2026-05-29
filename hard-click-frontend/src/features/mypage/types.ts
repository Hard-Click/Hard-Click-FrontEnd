/** 마이페이지 내 활동(activities) 도메인 타입 — 백엔드 MyActivityResponse 매칭
 *  GET /api/members/me/activities */

/** 게시판 유형 (백엔드 community BoardType enum) */
export type ActivityBoardType = 'QNA' | 'FREE' | 'INFO';

export const ACTIVITY_BOARD_LABEL: Record<ActivityBoardType, string> = {
  QNA: '질문답변',
  FREE: '자유게시판',
  INFO: '정보공유',
};

/* 내가 작성한 게시글 (MyPostActivityResponse) */
export interface MyPostActivity {
  postId: number;
  boardType: ActivityBoardType;
  title: string;
  viewCount: number;
  accepted: boolean;
  createdAt: string; // ISO 8601
}

/* 내가 작성한 댓글 (MyCommentActivityResponse) */
export interface MyCommentActivity {
  commentId: number;
  postId: number;
  parentId: number | null;
  content: string;
  accepted: boolean;
  createdAt: string; // ISO 8601
}

/* 내가 작성한 수강평 (MyReviewActivityResponse) — courseTitle 없음(courseId만) */
export interface MyReviewActivity {
  reviewId: number;
  courseId: number;
  rating: number; // 정수 1~5
  content: string;
  createdAt: string; // ISO 8601
}

/* 내 활동 통합 응답 (MyActivityResponse) */
export interface MyActivities {
  posts: MyPostActivity[];
  comments: MyCommentActivity[];
  reviews: MyReviewActivity[];
}
