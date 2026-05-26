import type {
  DuplicateCheckResponse,
  EmailVerificationResponse,
  RegisterRequest,
} from './types';
import { api } from '@/services/api';

const USE_MOCK = true;

export async function checkUsername(username: string) {
  if (USE_MOCK) {
    console.log('[MOCK] 아이디 중복 확인:', username);

    return {
      success: true,
      data: {
        exists: false,
      },
      message: '사용 가능한 아이디입니다',
    };
  }

  return api.get<DuplicateCheckResponse>(
    `/api/auth/usernames/exists?username=${encodeURIComponent(username)}`,
  );
}

export async function checkEmail(email: string) {
  if (USE_MOCK) {
    console.log('[MOCK] 이메일 중복 확인:', email);

    return {
      success: true,
      data: {
        exists: false,
      },
      message: '사용 가능한 이메일입니다',
    };
  }

  return api.get<DuplicateCheckResponse>(
    `/api/auth/emails/exists?email=${encodeURIComponent(email)}`,
  );
}

export async function sendEmailVerification(email: string) {
  if (USE_MOCK) {
    console.log('[MOCK] 이메일 인증번호 발송:', email);

    return {
      success: true,
      data: null,
      message: '인증번호가 발송되었습니다',
    };
  }

  return api.post<null>('/api/auth/email-verifications', { email });
}

export async function verifyEmailCode(email: string, code: string) {
  if (USE_MOCK) {
    console.log('[MOCK] 이메일 인증번호 확인:', email, code);

    return {
      success: true,
      data: {
        verified: true,
      },
      message: '이메일 인증이 완료되었습니다',
    };
  }

  return api.post<EmailVerificationResponse>(
    '/api/auth/email-verifications/verify',
    { email, code },
  );
}

export async function register(payload: RegisterRequest) {
  if (USE_MOCK) {
    console.log('[MOCK] 회원가입 요청:', payload);

    return {
      success: true,
      data: null,
      message: '회원가입이 완료되었습니다',
    };
  }

  return api.post<null>('/api/auth/signup', payload);
}
