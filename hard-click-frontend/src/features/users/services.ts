import { api } from '@/services/api';
import type {
  MyProfile,
  MyProfileApi,
  UpdateProfileImageResponse,
  ChangePasswordRequest,
  MyCourse,
  CompletedCourse,
} from './types';

const USE_MOCK = false;

/* ───── 내 프로필 조회 (GET /api/members/me) ─────
 * 백엔드는 memberId 필드로 내려옴 — 프론트 타입(MyProfile)에 맞게 userId로 매핑한다. */
export async function getMyProfile() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 프로필을 조회했습니다.',
      data: {
        userId: 7,
        name: '안현',
        email: 'hyun030514@naver.com',
        profileImageUrl: null,
      } as MyProfile,
    };
  }
  const res = await api.get<MyProfileApi>('/api/members/me');
  return {
    ...res,
    data: res.data
      ? ({
          userId: res.data.memberId,
          name: res.data.name,
          email: res.data.email,
          profileImageUrl: res.data.profileImageUrl,
        } as MyProfile)
      : res.data,
  };
}

/* ───── 프로필 이미지 변경 (PATCH /api/members/me/profile-image) ─────
 * multipart/form-data 로 profileImage 필드만 전송. */
export async function updateProfileImage(profileImage: File) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '프로필 이미지가 변경되었습니다.',
      data: {} as UpdateProfileImageResponse,
    };
  }

  const formData = new FormData();
  formData.append('profileImage', profileImage);
  // 인증은 BFF 프록시가 쿠키→Authorization 주입, FormData boundary는 자동 설정
  return api.patch<UpdateProfileImageResponse>(
    '/api/members/me/profile-image',
    formData,
  );
}

/* ───── 비밀번호 변경 (PATCH /api/members/me/password) ─────
 * body: { currentPassword, newPassword, newPasswordConfirm }
 * 401 인증 / 409 현재 비밀번호 불일치 / 400 newPassword·newPasswordConfirm 불일치 */
export async function changePassword(body: ChangePasswordRequest) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '비밀번호가 변경되었습니다.',
      data: {} as Record<string, never>,
    };
  }
  return api.patch<Record<string, never>>('/api/members/me/password', body);
}

/* ───── 회원 탈퇴 (DELETE /api/members/me) ─────
 * 백엔드가 body로 currentPassword 필수 요구 — 본인 확인 후 받은 비밀번호 전달.
 * 401 인증 실패 / 404 회원 없음 / 409 이미 탈퇴한 회원 */
export async function withdrawAccount(currentPassword: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '회원 탈퇴가 완료되었습니다',
      data: {} as Record<string, never>,
    };
  }
  return api.delete<Record<string, never>>('/api/members/me', {
    currentPassword,
  });
}

/* ───── 내 수강 강의 목록 (GET /api/members/me/courses) ─────
 * 백엔드 MyEnrolledCourseController(@RequestMapping("/api/members/me/courses")) — query 파라미터 없이 전체 수강 강의 반환.
 * 수강 완료 강의는 클라이언트에서 progressRate === 100 으로 필터링한다. */
export async function getMyCourses() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 수강 강의 목록을 조회했습니다.',
      data: [
        {
          courseId: 1,
          courseTitle: 'React 완벽 가이드',
          thumbnailUrl: '',
          progressRate: 65,
          lastVideoId: 101,
          lastPositionSeconds: 420,
          lastStudiedAt: '2026-05-10T21:30:00+09:00',
        },
        {
          courseId: 2,
          courseTitle: 'TypeScript 심화 학습',
          thumbnailUrl: '',
          progressRate: 40,
          lastVideoId: 102,
          lastPositionSeconds: 250,
          lastStudiedAt: '2026-05-09T18:10:00+09:00',
        },
        {
          courseId: 3,
          courseTitle: 'Node.js 백엔드 개발',
          thumbnailUrl: '',
          progressRate: 25,
          lastVideoId: 103,
          lastPositionSeconds: 90,
          lastStudiedAt: '2026-05-08T09:00:00+09:00',
        },
        {
          courseId: 4,
          courseTitle: 'HTML & CSS 완벽 가이드',
          thumbnailUrl: '',
          progressRate: 100,
          lastVideoId: 104,
          lastPositionSeconds: 0,
          lastStudiedAt: '2026-03-28T00:00:00+09:00',
        },
      ] as MyCourse[],
    };
  }
  return api.get<MyCourse[]>('/api/members/me/courses');
}

/* ───── 완료 강의 목록 (GET /api/members/me/courses/completed) ─────
 * 백엔드 MyCompletedCourseController 전용 endpoint. 완료 강의만 반환(클라 필터 불필요). */
export async function getMyCompletedCourses() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '수강 완료 강의 목록이 조회되었습니다.',
      data: [
        {
          courseId: 4,
          courseTitle: 'HTML & CSS 완벽 가이드',
          thumbnailUrl: '',
          progressRate: 100,
          completedAt: '2026-03-28T00:00:00+09:00',
        },
        {
          courseId: 5,
          courseTitle: 'Git & GitHub 입문',
          thumbnailUrl: '',
          progressRate: 100,
          completedAt: '2026-02-14T00:00:00+09:00',
        },
      ] as CompletedCourse[],
    };
  }
  return api.get<CompletedCourse[]>('/api/members/me/courses/completed');
}
