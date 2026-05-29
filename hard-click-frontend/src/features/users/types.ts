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

/* ───── 내 수강 강의 목록 (GET /api/users/me/courses) ─────
 * 백엔드 통합 endpoint — query 파라미터 없음.
 * 수강 완료 강의는 클라이언트에서 progressRate === 100 으로 필터링한다. */
export interface MyCourse {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  progressRate: number; // 0~100
  lastVideoId: number | null;
  lastPositionSeconds: number | null;
  lastStudiedAt: string | null; // ISO 8601
}
