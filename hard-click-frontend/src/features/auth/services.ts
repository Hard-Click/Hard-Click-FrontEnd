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

const USE_MOCK = false;

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function checkUsername(username: string) {
  if (USE_MOCK) {
    console.log('[MOCK] 아이디 중복 확인:', username);
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
    console.log('[MOCK] 이메일 중복 확인:', email);
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
    console.log('[MOCK] 이메일 인증번호 발송:', email);
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
    console.log('[MOCK] 이메일 인증번호 확인:', email, code);
    return {
      success: true,
      httpStatus: 200,
      data: { emailVerificationToken: 'MOCK_TOKEN' },
      message: '이메일 인증이 완료되었습니다',
    };
  }

  return api.post<EmailVerificationResponse>('/api/auth/email/verify', { email, code });
}

// 비밀번호 찾기 인증번호 발송 (POST /api/auth/password-reset/email)
export async function sendPasswordResetEmail(email: string) {
  if (USE_MOCK) {
    return { success: true, httpStatus: 200, data: {}, message: '인증번호가 발송되었습니다' };
  }
  return api.post<Record<string, never>>('/api/auth/password-reset/email', { email });
}

// 잠긴 계정 인증번호 검증 (POST /api/auth/account-locks/verify)
export async function verifyAccountLockCode(email: string, code: string) {
  if (USE_MOCK) {
    return {
      success: true,
      httpStatus: 200,
      data: { passwordChangeToken: 'MOCK_PASSWORD_CHANGE_TOKEN' },
      message: '인증 완료',
    };
  }
  return api.post<{ passwordChangeToken: string }>('/api/auth/account-locks/verify', { email, code });
}

// 잠긴 계정 비밀번호 변경 (PATCH /api/auth/account-locks/password)
export async function changeLockedAccountPassword(payload: {
  passwordChangeToken: string;
  newPassword: string;
  newPasswordConfirm: string;
}) {
  if (USE_MOCK) {
    return { success: true, httpStatus: 200, data: {}, message: '비밀번호 변경 완료' };
  }
  return api.patch<Record<string, never>>('/api/auth/account-locks/password', payload);
}

export async function register(payload: RegisterRequest) {
  if (USE_MOCK) {
    console.log('[MOCK] 회원가입 요청:', payload);
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
 * 로그인
 * 백엔드 응답이 ApiResponse 래핑 없이 AuthToken({ accessToken, refreshToken })을 raw로 반환하므로
 * 공용 api 클라이언트 대신 axios를 직접 사용
 */
export async function login(payload: LoginRequest): Promise<LoginResult> {
  if (USE_MOCK) {
    console.log('[MOCK] 로그인 요청:', payload);

    // 테스트 계정: test / test1234 일 때만 성공
    const isValid = payload.username === 'test' && payload.password === 'test1234';

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
      },
    };
  }

  try {
    const response = await axios.post<AuthToken>(
      `${BASE_URL}/api/auth/login`,
      payload,
      { headers: { 'Content-Type': 'application/json' } },
    );

    return {
      success: true,
      message: '로그인되었습니다',
      data: response.data,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as { message?: string; errorCode?: string };
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
