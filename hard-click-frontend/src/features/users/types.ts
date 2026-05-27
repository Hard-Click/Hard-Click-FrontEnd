/** 사용자(users) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 내 프로필 조회 (GET /api/users/me) ───── */
export interface MyProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

/* ───── 내 프로필 수정 (PATCH /api/users/me) ───── */
export interface UpdateProfileRequest {
  nickname?: string;
  currentPassword?: string;
  newPassword?: string;
  /** multipart/form-data 모드에서만 사용 */
  profileImage?: File;
}

export interface UpdateProfileResponse {
  userId: number;
  nickname: string;
  profileImageUrl: string;
}

/* ───── 내 수강 강의 목록 (GET /api/users/me/courses) ───── */
export type MyCourseSort = 'recent' | 'progress';

export interface MyCourse {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  instructorName: string;
  progressRate: number;
  lastVideoId: number;
  lastPositionSeconds: number;
  lastStudiedAt: string; // ISO 8601
}

/* ───── 완료 강의 목록 (GET /api/users/me/courses/completed) ───── */
export interface MyCompletedCourse {
  courseId: number;
  courseTitle: string;
  completedAt: string; // ISO 8601
  progressRate: number;
  hasReview: boolean;
}
