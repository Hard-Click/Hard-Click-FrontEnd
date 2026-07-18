// 인증 도메인만 실서버 연동 (실토큰 발급 → 다른 실연동 도메인이 동작)
import { USE_MOCK_AUTH as USE_MOCK } from '@/mocks/config';
import axios from 'axios';
import type {
  AuthToken,
  DuplicateCheckResponse,
  EmailVerificationResponse,
  LoginRequest,
  LoginResult,
  RegisterRequest,
} from './types';
import { api } from '@/services/api';

export async function checkUsername(username: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { exists: false },
      message: '사용 가능한 아이디입니다',
    };
  }

  return api.get<DuplicateCheckResponse>(
    `/api/auth/check-username?username=${encodeURIComponent(username)}`,
  );
}

export async function checkEmail(email: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { exists: false },
      message: '사용 가능한 이메일입니다',
    };
  }

  return api.get<DuplicateCheckResponse>(
    `/api/auth/check-email?email=${encodeURIComponent(email)}`,
  );
}

export async function sendEmailVerification(email: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '인증번호가 발송되었습니다',
    };
  }

  return api.post<Record<string, never>>('/api/auth/email/send', { email });
}

export async function verifyEmailCode(email: string, code: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { emailVerificationToken: 'MOCK_TOKEN' },
      message: '이메일 인증이 완료되었습니다',
    };
  }

  return api.post<EmailVerificationResponse>('/api/auth/email/verify', {
    email,
    code,
  });
}

export async function register(payload: RegisterRequest) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 201,
      data: { memberId: 1 },
      message: '회원가입이 완료되었습니다',
    };
  }

  return api.post<{ memberId: number }>('/api/auth/signup', payload);
}

/**
 * 가입 전 프로필 이미지 업로드 (로그인 불필요) — BE b안(2026-07-18 계약).
 *   POST /api/auth/profile-image (multipart, field `profileImage`, jpg/png ≤5MB)
 *   → { key, previewUrl }. 응답 `key`를 signup의 profileImageUrl로, `previewUrl`을 폼 미리보기로 사용.
 *   (previewUrl 아니라 key를 signup에 넣어야 함 — 서버가 조회 시 key→URL 변환)
 * ⚠️ BE PR 머지·배포 후 라이브 검증 필요 — 현재 계약 기준 구현(미배포 시 404).
 */
export async function uploadProfileImage(file: File) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { key: 'profiles/mock.png', previewUrl: URL.createObjectURL(file) },
      message: '',
    };
  }
  const form = new FormData();
  form.append('profileImage', file);
  // multipart는 Content-Type(boundary) 수동 지정 금지 — FormData 그대로 전달
  return api.post<{ key: string; previewUrl: string }>(
    '/api/auth/profile-image',
    form,
  );
}

/**
 * 로그인 (노션 API 명세 매칭)
 * 응답: { httpStatus, message, data: { accessToken, refreshToken, memberId, role } }
 */
export async function login(payload: LoginRequest): Promise<LoginResult> {
  if (USE_MOCK) {

    // 테스트 계정: test / test1234 일 때만 성공
    const isValid =
      payload.username === 'test' && payload.password === 'test1234';

    if (!isValid) {
      return {
        success: false,
        message: '아이디 또는 비밀번호가 올바르지 않습니다',
      };
    }

    return {
      success: true,
      message: '로그인되었습니다',
      data: {
        accessToken: 'MOCK_ACCESS_TOKEN',
        refreshToken: 'MOCK_REFRESH_TOKEN',
        memberId: 1,
        role: 'STUDENT',
      },
    };
  }

  try {
    // 프록시 경유 (next.config.ts rewrites): /api/auth/login → backend
    const response = await axios.post<{
      httpStatus: number;
      message: string;
      data: AuthToken | null;
    }>('/api/auth/login', payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    const httpStatus = response.data?.httpStatus ?? response.status;
    const body = response.data;

    // 백엔드가 HTTP 200이지만 httpStatus 필드는 에러 코드로 보낼 수 있음
    // 또는 data(토큰)가 비어있으면 실패로 처리
    if (httpStatus === 423) {
      return {
        success: false,
        message:
          body?.message ??
          '로그인 5회 실패로 계정이 잠겼습니다. 이메일 인증을 진행해주세요.',
        isLocked: true,
      };
    }

    if (httpStatus >= 400 || !body?.data?.accessToken) {
      return {
        success: false,
        message: body?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다',
      };
    }

    return {
      success: true,
      message: body.message ?? '로그인되었습니다',
      data: body.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const body = error.response.data as {
        message?: string;
        errorCode?: string;
      };

      // 423 Locked → 5회 실패로 계정 잠금
      if (status === 423) {
        return {
          success: false,
          message:
            body?.message ??
            '로그인 5회 실패로 계정이 잠겼습니다. 이메일 인증을 진행해주세요.',
          errorCode: body?.errorCode,
          isLocked: true,
        };
      }

      return {
        success: false,
        message: body?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다',
        errorCode: body?.errorCode,
      };
    }
    return {
      success: false,
      message: '서버와 연결할 수 없습니다',
    };
  }
}

/* ─────────────────────────── 비밀번호 찾기 흐름 ─────────────────────────── */

/** 비밀번호 찾기 인증번호 발송 (POST /api/auth/password-reset/email) */
export async function sendPasswordResetEmail(email: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '인증번호 발송되었습니다',
    };
  }
  return api.post<Record<string, never>>('/api/auth/password-reset/email', {
    email,
  });
}

/** 비밀번호 찾기 인증번호 검증 (POST /api/auth/password-reset/verify) */
export async function verifyPasswordResetCode(email: string, code: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { passwordChangeToken: 'MOCK_PASSWORD_CHANGE_TOKEN' },
      message: '인증번호 검증 완료',
    };
  }
  return api.post<{ passwordChangeToken: string }>(
    '/api/auth/password-reset/verify',
    { email, code },
  );
}

/** 비밀번호 재설정 (PATCH /api/auth/password-reset) */
export async function resetPassword(payload: {
  email: string;
  passwordChangeToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '비밀번호 재설정 완료',
    };
  }
  return api.patch<Record<string, never>>('/api/auth/password-reset', payload);
}

/** 잠긴 계정 인증번호 발송/재발송 (POST /api/auth/account-locks/email) */
export async function sendAccountLockEmail(email: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '계정 보호 인증번호가 발송되었습니다',
    };
  }
  return api.post<Record<string, never>>('/api/auth/account-locks/email', {
    email,
  });
}

/* ─────────────────────────── 잠긴 계정 흐름 ─────────────────────────── */

/** 잠긴 계정 인증번호 검증 (POST /api/auth/account-locks/verify) */
export async function verifyAccountLockCode(email: string, code: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { passwordChangeToken: 'MOCK_LOCK_PASSWORD_CHANGE_TOKEN' },
      message: '계정 보호 인증 완료',
    };
  }
  return api.post<{ passwordChangeToken: string }>(
    '/api/auth/account-locks/verify',
    { email, code },
  );
}

/** 잠긴 계정 비밀번호 변경 (PATCH /api/auth/account-locks/password) */
export async function changeLockedAccountPassword(payload: {
  passwordChangeToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '비번 변경 및 잠금 해제 완료',
    };
  }
  return api.patch<Record<string, never>>(
    '/api/auth/account-locks/password',
    payload,
  );
}

/* ─────────────────────────── 비밀번호 변경 (로그인 상태) ─────────────────────────── */

/** 비밀번호 변경 (PATCH /api/members/me/password) — Authorization 필요 */
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '비밀번호 변경 완료',
    };
  }
  return api.patch<Record<string, never>>('/api/members/me/password', payload);
}

/** 로그아웃 (POST /api/auth/logout) */
export async function logout() {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: {},
      message: '로그아웃 완료',
    };
  }

  // refreshToken은 httpOnly 쿠키에 있고 BFF 프록시가 백엔드로 전달 → 클라가 읽지 않음
  return api.post<Record<string, never>>('/api/auth/logout', {});
}
