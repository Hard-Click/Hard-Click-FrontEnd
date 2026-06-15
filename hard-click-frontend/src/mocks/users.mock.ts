/**
 * 사용자 관리(관리자) 도메인 목 데이터 — 백엔드 명세 기준(연동 대비 영문 enum).
 * GET /api/admin/members (관리자: 전체 회원 목록 조회)
 *
 * ⚠️ 백엔드 API 확정 시 필드명/enum 정렬 필요.
 *   - role: 회원 권한 (수강생 STUDENT / 강사 INSTRUCTOR)
 *   - status: 계정 상태 (활성 ACTIVE / 잠김 LOCKED)
 *   - reportCount: 해당 회원이 누적으로 신고당한 횟수
 */

export type AdminUserRole = 'STUDENT' | 'INSTRUCTOR';
export type AdminUserStatus = 'ACTIVE' | 'LOCKED';

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

export const mockAdminUserList: AdminUserListApiResponse = {
  content: [
    {
      memberId: 1,
      name: '김철수',
      loginId: 'chulsoo',
      email: 'chulsoo@example.com',
      role: 'STUDENT',
      status: 'ACTIVE',
      joinedAt: '2026.03.15',
      lastLoginAt: '2026.05.12 14:30',
      reportCount: 3,
    },
    {
      memberId: 2,
      name: '최수진',
      loginId: 'sujin',
      email: 'sujin@example.com',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      joinedAt: '2026.01.10',
      lastLoginAt: '2026.05.12 13:15',
      reportCount: 0,
    },
    {
      memberId: 3,
      name: '박민수',
      loginId: 'minsu',
      email: 'minsu@example.com',
      role: 'STUDENT',
      status: 'LOCKED',
      joinedAt: '2026.04.20',
      lastLoginAt: '2026.05.10 10:20',
      reportCount: 3,
    },
    {
      memberId: 4,
      name: '정수정',
      loginId: 'sujung',
      email: 'sujung@example.com',
      role: 'STUDENT',
      status: 'LOCKED',
      joinedAt: '2026.02.05',
      lastLoginAt: '2026.04.01 18:40',
      reportCount: 3,
    },
    {
      memberId: 5,
      name: '김민수',
      loginId: 'instructor_kim',
      email: 'kim@example.com',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      joinedAt: '2026.01.20',
      lastLoginAt: '2026.05.12 09:10',
      reportCount: 0,
    },
    {
      memberId: 6,
      name: '신사임당',
      loginId: '50000won',
      email: '50000@flown.com',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      joinedAt: '2025.12.01',
      lastLoginAt: '2026.05.12 15:00',
      reportCount: 0,
    },
  ],
  totalPages: 1,
};
