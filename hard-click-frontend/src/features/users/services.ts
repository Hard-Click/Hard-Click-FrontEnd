import axios from 'axios';
import { api } from '@/services/api';
import { authStore } from '@/store/auth.store';
import type {
  MyProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  MyCourse,
  MyCourseSort,
  MyCompletedCourse,
} from './types';

const USE_MOCK = false;
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

/* ───── 내 프로필 조회 (GET /api/users/me) ───── */
export async function getMyProfile() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 프로필을 조회했습니다.',
      data: {
        userId: 7,
        email: 'hyun030514@naver.com',
        nickname: '안현',
        profileImageUrl: '',
      } as MyProfile,
    };
  }
  return api.get<MyProfile>('/api/users/me');
}

/* ───── 내 프로필 수정 (PATCH /api/users/me) ─────
 * 파일 업로드가 포함되면 multipart/form-data, 없으면 application/json */
export async function updateMyProfile(body: UpdateProfileRequest) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '회원 정보가 수정되었습니다.',
      data: {
        userId: 7,
        nickname: body.nickname ?? '안현',
        profileImageUrl: '',
      } as UpdateProfileResponse,
    };
  }

  // 파일 포함 시 multipart 별도 처리 (axios interceptor가 'Content-Type'을 덮어쓰지 않도록)
  if (body.profileImage) {
    const formData = new FormData();
    if (body.nickname !== undefined) formData.append('nickname', body.nickname);
    if (body.currentPassword !== undefined) formData.append('currentPassword', body.currentPassword);
    if (body.newPassword !== undefined) formData.append('newPassword', body.newPassword);
    formData.append('profileImage', body.profileImage);

    try {
      const token = authStore.getAccessToken();
      const memberId = authStore.getMemberId();
      const response = await axios.patch(`${BASE_URL}/api/users/me`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(memberId ? { 'X-Member-Id': String(memberId) } : {}),
        },
      });
      return {
        success: true,
        httpStatus: response.data?.httpStatus ?? response.status,
        message: response.data?.message ?? '회원 정보가 수정되었습니다.',
        data: response.data?.data as UpdateProfileResponse,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const body = error.response.data as { httpStatus?: number; message?: string };
        return {
          success: false,
          httpStatus: body?.httpStatus ?? error.response.status,
          message: body?.message ?? '회원 정보 수정에 실패했습니다.',
          data: undefined as unknown as UpdateProfileResponse,
        };
      }
      return {
        success: false,
        httpStatus: 500,
        message: '서버와 연결할 수 없습니다',
        data: undefined as unknown as UpdateProfileResponse,
      };
    }
  }

  // 파일 없으면 JSON
  const { profileImage, ...jsonBody } = body;
  return api.patch<UpdateProfileResponse>('/api/users/me', jsonBody);
}

/* ───── 회원 탈퇴 (DELETE /api/members/me) ─────
 * 401 인증 실패 / 404 회원 없음 / 409 이미 탈퇴한 회원 */
export async function withdrawAccount() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '회원 탈퇴가 완료되었습니다',
      data: {} as Record<string, never>,
    };
  }
  return api.delete<Record<string, never>>('/api/members/me');
}

/* ───── 내 수강 강의 목록 (GET /api/users/me/courses?sort=) ───── */
export async function getMyCourses(sort?: MyCourseSort) {
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
          instructorName: '신노을',
          progressRate: 65,
          lastVideoId: 101,
          lastPositionSeconds: 420,
          lastStudiedAt: '2026-05-10T21:30:00+09:00',
        },
        {
          courseId: 2,
          courseTitle: 'TypeScript 심화 학습',
          thumbnailUrl: '',
          instructorName: '신노을',
          progressRate: 40,
          lastVideoId: 102,
          lastPositionSeconds: 250,
          lastStudiedAt: '2026-05-09T18:10:00+09:00',
        },
        {
          courseId: 3,
          courseTitle: 'Node.js 백엔드 개발',
          thumbnailUrl: '',
          instructorName: '신노을',
          progressRate: 25,
          lastVideoId: 103,
          lastPositionSeconds: 90,
          lastStudiedAt: '2026-05-08T09:00:00+09:00',
        },
      ] as MyCourse[],
    };
  }
  const query = sort ? `?sort=${sort}` : '';
  return api.get<MyCourse[]>(`/api/users/me/courses${query}`);
}

/* ───── 완료 강의 목록 (GET /api/users/me/courses/completed) ───── */
export async function getMyCompletedCourses() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      message: '완료 강의 목록을 조회했습니다.',
      data: [
        {
          courseId: 1,
          courseTitle: 'JavaScript 기초',
          completedAt: '2026-04-15T00:00:00+09:00',
          progressRate: 100,
          hasReview: false,
        },
        {
          courseId: 4,
          courseTitle: 'HTML & CSS 완벽 가이드',
          completedAt: '2026-03-28T00:00:00+09:00',
          progressRate: 100,
          hasReview: false,
        },
      ] as MyCompletedCourse[],
    };
  }
  return api.get<MyCompletedCourse[]>('/api/users/me/courses/completed');
}
