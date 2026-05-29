import axios from 'axios';
import { api } from '@/services/api';
import { authStore } from '@/store/auth.store';
import type {
  MyProfile,
  MyProfileApi,
  UpdateProfileImageResponse,
  ChangePasswordRequest,
  MyCourse,
} from './types';

const USE_MOCK = false;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

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
      data: { profileImageUrl: '' } as UpdateProfileImageResponse,
    };
  }

  const formData = new FormData();
  formData.append('profileImage', profileImage);

  try {
    const token = authStore.getAccessToken();
    const memberId = authStore.getMemberId();
    const response = await axios.patch(
      `${BASE_URL}/api/members/me/profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(memberId ? { 'X-Member-Id': String(memberId) } : {}),
        },
      },
    );
    return {
      success: true,
      httpStatus: response.data?.httpStatus ?? response.status,
      message: response.data?.message ?? '프로필 이미지가 변경되었습니다.',
      data: response.data?.data as UpdateProfileImageResponse,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as {
        httpStatus?: number;
        message?: string;
      };
      return {
        success: false,
        httpStatus: body?.httpStatus ?? error.response.status,
        message: body?.message ?? '프로필 이미지 변경에 실패했습니다.',
        data: undefined as unknown as UpdateProfileImageResponse,
      };
    }
    return {
      success: false,
      httpStatus: 500,
      message: '서버와 연결할 수 없습니다',
      data: undefined as unknown as UpdateProfileImageResponse,
    };
  }
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
 * 백엔드 통합 endpoint (MyEnrolledCourseController) — query 파라미터 없이 전체 수강 강의 반환.
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
