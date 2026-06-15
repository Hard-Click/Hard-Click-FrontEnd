/** 사용자(users) 도메인 타입 — 노션 RestAPI 명세 매칭 */

/* ───── 내 프로필 조회 (GET /api/members/me) ─────
 * 백엔드 응답은 memberId 필드로 내려옴 — service에서 userId로 매핑한다. */
export interface MyProfileApi {
  memberId: number;
  name: string;
  email: string;
  profileImageUrl: string | null;
}

export interface MyProfile {
  userId: number;
  name: string;
  email: string;
  profileImageUrl: string | null;
}

/* ───── 프로필 이미지 변경 (PATCH /api/members/me/profile-image) ─────
 * multipart/form-data 로 profileImage 필드만 전송. 비밀번호 변경은 별도 endpoint(/api/members/me/password). */
export interface UpdateProfileImageResponse {
  profileImageUrl: string | null;
}

/* ───── 비밀번호 변경 (PATCH /api/members/me/password) ───── */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

/* ───── 내 수강 강의 목록 (GET /api/members/me/courses) ─────
 * 백엔드 MyEnrolledCourseController — query 파라미터 없음. 진행 중만 표시(완료는 전용 endpoint). */
export interface MyCourse {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  progressRate: number; // 0~100
  lastVideoId: number | null;
  lastPositionSeconds: number | null;
  lastStudiedAt: string | null; // ISO 8601
}

/* ───── 완료 강의 목록 (GET /api/members/me/courses/completed) ─────
 * 백엔드 MyCompletedCourseController. 응답: courseId, courseTitle, thumbnailUrl, progressRate(=100), completedAt.
 * lastVideoId 없음 — 카드 클릭은 강의 상세(/courses/{id})로 이동. */
export interface CompletedCourse {
  courseId: number;
  courseTitle: string;
  thumbnailUrl: string;
  progressRate: number; // 항상 100
  completedAt: string | null; // ISO 8601
}

/* ───── 사용자 관리 (관리자) — GET /api/admin/members ─────
 * role: 수강생 STUDENT / 강사 INSTRUCTOR, status: 활성 ACTIVE / 잠김 LOCKED. */
export type AdminUserRole = 'STUDENT' | 'INSTRUCTOR';
export type AdminUserStatus = 'ACTIVE' | 'LOCKED';

/** 백엔드 응답 항목 (API 타입) */
export interface AdminUserApiItem {
  memberId: number;
  name: string;
  loginId: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string; // 가입일
  lastLoginAt: string | null; // 최근 로그인 (없으면 null)
  reportCount: number; // 누적 신고수
}

export interface AdminUserListApiResponse {
  content: AdminUserApiItem[];
  totalPages: number;
}

/** UI 표시용 사용자 타입 */
export interface AdminUser {
  memberId: number;
  name: string;
  loginId: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedAt: string;
  lastLoginAt: string | null;
  reportCount: number;
}

/** 백엔드 응답 → UI 타입 변환 */
export function toAdminUser(api: AdminUserApiItem): AdminUser {
  return {
    memberId: api.memberId,
    name: api.name,
    loginId: api.loginId,
    email: api.email,
    role: api.role,
    status: api.status,
    joinedAt: api.joinedAt,
    lastLoginAt: api.lastLoginAt,
    reportCount: api.reportCount,
  };
}
