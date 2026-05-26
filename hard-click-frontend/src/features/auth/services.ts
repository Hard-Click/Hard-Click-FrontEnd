import type {
  DuplicateCheckResponse,
  EmailVerificationResponse,
  RegisterRequest,
} from './types';
import { api } from '@/services/api';

const USE_MOCK = false;

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
