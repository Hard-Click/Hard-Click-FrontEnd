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
