import { isMock } from '@/mocks/config';
import { api } from '@/services/api';
import type {
  MyProfile,
  MyProfileApi,
  UpdateProfileImageResponse,
  ChangePasswordRequest,
} from './types';

/* ───── 내 프로필 조회 (GET /api/members/me) ─────
 * 백엔드는 memberId 필드로 내려옴 — 프론트 타입(MyProfile)에 맞게 userId로 매핑한다. */
export async function getMyProfile() {
  if (isMock('mypage')) {
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
 * multipart/form-data 로 profileImage 필드만 전송.
 * ⚠️ 라이브(mypage=false)지만 BE가 현재 이 엔드포인트 500(저장 실패) → 업로드 시도 시
 *    api.ts가 success:false로 정규화 → ProfileEditModal이 실패 토스트로 노출(조용히 숨기지 않음, §0.1④).
 *    프로필 사진 '표시'는 별도 경로(GET /api/members/me의 profileImageUrl)라 영향 없음. */
export async function updateProfileImage(profileImage: File) {
  if (isMock('mypage')) {
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
 * 현재 비밀번호 불일치 = 401 AUTH_009 / 400 newPassword·newPasswordConfirm 불일치
 * ✅ 라이브(config accountDestructive:false, 2026-06-25) — 실제 비번 변경됨. 틀린 현재비번 → 401
 *    AUTH_009를 api.ts가 로그인리다이렉트에서 제외 → 모달이 "비밀번호 불일치"로 처리(Step1 복귀).
 *    ⚠️ 공유 demo 계정에선 실제로 비번이 바뀌니 데모/발표 중 주의. */
export async function changePassword(body: ChangePasswordRequest) {
  if (isMock('accountDestructive')) {
    return {
      success: true,
      httpStatus: 200,
      message: '비밀번호가 변경되었습니다.',
      data: {} as Record<string, never>,
    };
  }
  return api.patch<Record<string, never>>('/api/members/me/password', body);
}

/* ───── 본인 확인 — 현재 비밀번호 검증 (POST /api/members/me/password/verify) ─────
 * body: { currentPassword }. 비파괴(검증만, 변경 없음) — 프로필 수정 Step1 선검증용.
 * ✅ 라이브 검증(2026-06-26): 일치 → 200 / 불일치 → 401 AUTH_009("현재 비밀번호가 일치하지 않습니다.").
 *    AUTH_009는 api.ts가 로그인 리다이렉트에서 제외 → 모달이 인라인 에러로 처리(Step1 유지).
 * mock 게이트는 비번변경/탈퇴와 같은 accountDestructive 사용 — 본인확인은 파괴적 흐름의 관문이라
 *    mock/live 토글을 함께 묶어야 일관됨(verify만 실서버 때리는 비대칭 방지). */
export async function verifyMyPassword(currentPassword: string) {
  if (isMock('accountDestructive')) {
    return {
      success: true,
      httpStatus: 200,
      message: '본인 확인이 완료되었습니다.',
      data: {} as Record<string, never>,
    };
  }
  return api.post<Record<string, never>>('/api/members/me/password/verify', {
    currentPassword,
  });
}

/* ───── 회원 탈퇴 (DELETE /api/members/me) ─────
 * 백엔드가 body로 currentPassword 필수 요구 — 본인 확인 후 받은 비밀번호 전달.
 * 401 인증 실패(AUTH_009) / 404 회원 없음 / 409 이미 탈퇴한 회원
 * ✅ 라이브(config accountDestructive:false, 2026-06-25) — 실제 탈퇴됨(복구불가). 틀린 비번 → 401
 *    AUTH_009(api.ts가 로그인리다이렉트 제외 → 모달이 토스트로 처리).
 *    ⚠️ 공유 demo 계정에선 실제로 영구 삭제되니 데모/발표 중 절대 올바른 비번으로 실행 금지. */
export async function withdrawAccount(currentPassword: string) {
  if (isMock('accountDestructive')) {
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
