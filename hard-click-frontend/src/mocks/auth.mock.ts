/**
 * 인증/회원 도메인 목 데이터 — 백엔드 명세(노션 "API 목록- 윤종호") 그대로.
 */

/** POST /api/auth/login — data */
export interface LoginApiData {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  role: string; // STUDENT / INSTRUCTOR / ADMIN 등
}
export const mockLoginData: LoginApiData = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  memberId: 1,
  role: 'STUDENT',
};

/** POST /api/auth/signup — data (성공 시 httpStatus 201) */
export interface SignupApiData {
  memberId: number;
}
export const mockSignupData: SignupApiData = { memberId: 1 };

/** POST /api/auth/email/verify — data (이메일 인증번호 검증) */
export interface EmailVerifyApiData {
  emailVerificationToken: string;
}
export const mockEmailVerifyData: EmailVerifyApiData = {
  emailVerificationToken: 'mock-email-verification-token',
};

/** POST /api/auth/refresh — data (Access Token 재발급) */
export interface TokenReissueApiData {
  accessToken: string;
}
export const mockTokenReissueData: TokenReissueApiData = {
  accessToken: 'mock-new-access-token',
};

/** 비밀번호 찾기 / 잠긴 계정 인증번호 검증 — data */
export interface PasswordChangeTokenApiData {
  passwordChangeToken: string;
}
export const mockPasswordChangeTokenData: PasswordChangeTokenApiData = {
  passwordChangeToken: 'mock-password-change-token',
};
