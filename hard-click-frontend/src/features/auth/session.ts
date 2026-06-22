'use server';

import { cookies } from 'next/headers';

interface SessionData {
  accessToken: string;
  refreshToken: string;
  memberId: number;
  role: string;
}

const COOKIE_BASE = {
  httpOnly: true, // JS로 접근 불가 → XSS 안전
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * 로그인 응답의 토큰/식별자를 **httpOnly 쿠키**로 저장한다. (Server Action — 서버에서만 실행)
 * 서버 axios(`lib/api.ts`)가 이 쿠키를 읽어 Authorization 헤더를 자동으로 채운다.
 *
 * 현재는 클라이언트의 localStorage 저장과 **병행(dual-write)** 한다.
 * 모든 도메인이 서버 호출로 전환되면 localStorage 쪽을 제거할 예정.
 */
// 백엔드 토큰 정책: Access 15분 / Refresh 14일
const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 14;

export async function establishSession(data: SessionData) {
  const cookieStore = await cookies();
  cookieStore.set('accessToken', data.accessToken, {
    ...COOKIE_BASE,
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
  cookieStore.set('refreshToken', data.refreshToken, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  // memberId·role은 세션 유지 동안 필요하므로 Refresh Token과 동일 수명
  cookieStore.set('memberId', String(data.memberId), {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
  cookieStore.set('role', data.role, {
    ...COOKIE_BASE,
    maxAge: REFRESH_TOKEN_MAX_AGE,
  });
}

/** 모든 인증 쿠키를 제거한다. (로그아웃 / 회원 탈퇴) */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('accessToken');
  cookieStore.delete('refreshToken');
  cookieStore.delete('memberId');
  cookieStore.delete('role');
}

export interface CurrentUser {
  memberId: number | null;
  role: string | null;
}

/**
 * 현재 로그인 사용자 정보 — 쿠키에서 읽는다 (서버 전용).
 * establishSession이 role·memberId를 별도 쿠키로 저장하므로 JWT 디코드 없이 조회 가능.
 * accessToken 쿠키가 없으면 비로그인(null).
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies();
  if (!cookieStore.get('accessToken')?.value) return null;
  const memberId = cookieStore.get('memberId')?.value;
  return {
    memberId: memberId ? Number(memberId) : null,
    role: cookieStore.get('role')?.value ?? null,
  };
}
