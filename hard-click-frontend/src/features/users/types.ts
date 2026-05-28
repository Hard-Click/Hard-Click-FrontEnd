/** 사용자(users) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 내 프로필 조회 (GET /api/members/me) ───── */
export interface MyProfile {
  userId: number;
  email: string;
  nickname: string;
  profileImageUrl: string;
}

/* ───── 내 프로필 수정 (PATCH /api/members/me) ─────
 * 비밀번호 변경은 별도 endpoint(/api/members/me/password) 사용 — newPassword 필드는
 * multipart 이미지 업로드와 동시 변경하는 경우에만 사용. 단독 비밀번호 변경은 changePassword. */
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

/* ───── 비밀번호 변경 (PATCH /api/members/me/password) ───── */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

/* ───── 내 수강 강의 목록 (GET /api/members/me/courses) ───── */
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

/* ───── 완료 강의 목록 (GET /api/members/me/courses/completed) ───── */
export interface MyCompletedCourse {
  courseId: number;
  courseTitle: string;
  completedAt: string; // ISO 8601
  progressRate: number;
  hasReview: boolean;
}
