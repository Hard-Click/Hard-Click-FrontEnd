import { serverApi } from '@/lib/api';
import type {
  MyCourse,
  CompletedCourse,
  MyProfile,
  MyProfileApi,
  AdminUser,
  AdminUserListApiResponse,
} from './types';
import { toAdminUser } from './types';
import { normalizeProfileImageUrl } from './utils';
import { USE_MOCK, isMock } from '@/mocks/config';
import {
  mockMyEnrolledCourses,
  mockMyCompletedCourses,
  mockMyProfile,
} from '@/mocks/mypage.mock';
import { mockAdminUserList } from '@/mocks/users.mock';

/** 내 프로필 — 서버 조회 (Server Component 전용). 백엔드 memberId → userId 매핑. */
export async function getMyProfileServer(): Promise<MyProfile | null> {
  if (isMock('mypage')) {
    return {
      userId: mockMyProfile.memberId,
      name: mockMyProfile.name,
      email: mockMyProfile.email,
      profileImageUrl: mockMyProfile.profileImageUrl,
    };
  }
  const res = await serverApi.get<MyProfileApi>('/api/members/me');
  if (!res.success || !res.data) return null;
  return {
    userId: res.data.memberId,
    name: res.data.name,
    email: res.data.email,
    profileImageUrl: normalizeProfileImageUrl(res.data.profileImageUrl),
  };
}

/** 내 수강 강의 목록 — 서버 조회 (GET /api/members/me/courses) */
export async function getMyCoursesServer(): Promise<MyCourse[]> {
  if (isMock('mypage')) return mockMyEnrolledCourses;
  const res = await serverApi.get<MyCourse[]>('/api/members/me/courses');
  return res.success && res.data ? res.data : [];
}

/** 완료 강의 목록 — 서버 조회 (GET /api/members/me/courses/completed) */
export async function getMyCompletedCoursesServer(): Promise<CompletedCourse[]> {
  if (isMock('mypage')) return mockMyCompletedCourses;
  const res = await serverApi.get<CompletedCourse[]>(
    '/api/members/me/courses/completed',
  );
  return res.success && res.data ? res.data : [];
}

/** 사용자 관리 — 전체 회원 목록 서버 조회 (GET /api/admin/members, 관리자)
 * ⚠️ BE 기본 size=3이라 명시적으로 최대치(size=100) 요청. 100명 초과 시 서버 페이지네이션 연동 필요. */
export async function getAdminUsersServer(): Promise<AdminUser[]> {
  const res = await serverApi.get<AdminUserListApiResponse>(
    '/api/admin/members?page=0&size=100',
  );
  if (res.success && res.data) return res.data.content.map(toAdminUser);
  if (USE_MOCK) return mockAdminUserList.content.map(toAdminUser);
  return [];
}
