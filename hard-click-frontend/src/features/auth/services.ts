import type {
  ApiResponse,
  DuplicateCheckResponse,
  EmailVerificationResponse,
  RegisterRequest,
} from './types';

const USE_MOCK = true;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers ?? {}),
      },
    });

    let body: ApiResponse<T>;

    try {
      body = await response.json();
    } catch {
      body = {
        success: response.ok,
        message: response.ok
          ? '요청이 완료되었습니다'
          : '요청 처리 중 오류가 발생했습니다',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        message: body.message ?? '요청 처리 중 오류가 발생했습니다',
        errorCode: body.errorCode,
      };
    }

    return body;
  } catch {
    return {
      success: false,
      message: '서버와 연결할 수 없습니다',
    };
  }
}

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

  return request<DuplicateCheckResponse>(
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

  return request<DuplicateCheckResponse>(
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

  return request<null>('/api/auth/email-verifications', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
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

  return request<EmailVerificationResponse>(
    '/api/auth/email-verifications/verify',
    {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    },
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

  return request<null>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
