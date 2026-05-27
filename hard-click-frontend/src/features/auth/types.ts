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

/**
 * 백엔드 SignupRequest와 매칭
 * passwordConfirm, emailVerificationToken은 백엔드 결정으로 제거됨
 * - passwordConfirm: 프론트 검증만 수행
 * - emailVerificationToken: 별도 검증 흐름으로 처리
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;        // YYYY-MM-DD
  phoneNumber: string;
  profileImageUrl?: string;
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
  username: string;  // 아이디 또는 이메일
  password: string;
}

/** 백엔드 로그인 응답 data 부분 */
export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  role: string;       // "STUDENT" | "INSTRUCTOR" | "ADMIN"
}

/** 로그인 결과 — 컴포넌트 호환용 success 필드 포함 */
export interface LoginResult {
  success: boolean;
  message: string;
  data?: AuthToken;
  errorCode?: string;
  /** 로그인 5회 실패로 계정 잠금된 경우 (HTTP 423) */
  isLocked?: boolean;
}
