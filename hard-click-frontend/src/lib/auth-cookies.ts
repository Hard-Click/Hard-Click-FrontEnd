/**
 * 인증 쿠키 정책 단일 소스.
 * 백엔드 토큰 정책: Access Token 15분 / Refresh Token 14일.
 * 로그인·세션·BFF 프록시·serverApi가 모두 여기서 import해 drift를 막는다.
 */
export const ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15분
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 14; // 14일

/**
 * httpOnly 쿠키 공통 옵션 (JS 접근 불가 → XSS 안전).
 * 프로덕션(HTTPS)에선 secure: true로 HTTPS 전송만 허용. (로컬 http 개발은 false)
 */
export const AUTH_COOKIE_BASE = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: process.env.NODE_ENV === 'production',
};

/** 인증 관련 쿠키 이름 (로그아웃/세션 만료 시 일괄 정리용) */
export const AUTH_COOKIE_NAMES = [
  'accessToken',
  'refreshToken',
  'memberId',
  'role',
] as const;
