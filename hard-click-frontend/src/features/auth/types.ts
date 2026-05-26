export type RegisterStep = 1 | 2 | 3 | 4;

export type Gender = 'MALE' | 'FEMALE' | '';

export interface RegisterFormValues {
  username: string;

  emailId: string;
  emailDomain: 'gmail.com';

  password: string;
  passwordConfirm: string;

  name: string;
  gender: Gender;
  birthDate: string;
  phoneNumber: string;
  profileImage: File | null;
  profileImagePreview: string;

  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;

  verificationCode: string;
  /** 이메일 인증 검증 성공 시 백엔드에서 받는 토큰 */
  emailVerificationToken: string;
}

/** 백엔드 SignupRequest와 1:1 매칭 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  passwordConfirm: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;        // YYYY-MM-DD
  phoneNumber: string;
  profileImageUrl?: string;
  emailVerificationToken: string;
  requiredTermsAgreed: boolean;
  optionalTermsAgreed?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
}

export interface DuplicateCheckResponse {
  exists: boolean;
}

export interface EmailVerificationResponse {
  emailVerificationToken: string;
}

/** 백엔드 LoginRequest 매칭 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 백엔드 AuthToken 응답 (ApiResponse 래핑 없이 raw로 반환됨) */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
}

/** 로그인 결과 — 컴포넌트 호환용 success 필드 포함 */
export interface LoginResult {
  success: boolean;
  message: string;
  data?: AuthToken;
  errorCode?: string;
}
