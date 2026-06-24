'use server';

import axios from 'axios';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
// 인증 도메인만 실서버 연동 (실토큰 발급 → 다른 실연동 도메인이 동작)
import { USE_MOCK_AUTH as USE_MOCK } from '@/mocks/config';
import { mockLoginData } from '@/mocks/auth.mock';
import {
  ACCESS_TOKEN_MAX_AGE,
  REFRESH_TOKEN_MAX_AGE,
  AUTH_COOKIE_BASE,
} from '@/lib/auth-cookies';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export interface LoginActionState {
  success: boolean;
  message?: string;
  /** 423: 5회 실패로 계정 잠금 → 계정 보호 인증 필요 */
  isLocked?: boolean;
}

/**
 * 로그인 Server Action (수업 자료 BFF/Server Action 패턴).
 *
 * 서버에서 백엔드 로그인을 호출하고, 받은 토큰을 **httpOnly 쿠키**로 저장한다.
 * → 토큰이 클라이언트(JS)에 닿지 않는다. 성공 시 역할별 페이지로 redirect.
 */
export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = ((formData.get('username') as string) ?? '').trim();
  const password = ((formData.get('password') as string) ?? '').trim();

  if (!username || !password) {
    return { success: false, message: '아이디와 비밀번호를 모두 입력해주세요' };
  }

  // ── MOCK ──────────────────────────────────────────────────────────────────
  if (USE_MOCK) {
    if (username !== 'test' || password !== 'test1234') {
      return { success: false, message: '아이디 또는 비밀번호가 올바르지 않습니다' };
    }
    const cookieStore = await cookies();
    const base = AUTH_COOKIE_BASE;
    cookieStore.set('accessToken', mockLoginData.accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE });
    cookieStore.set('refreshToken', mockLoginData.refreshToken, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
    cookieStore.set('memberId', String(mockLoginData.memberId), { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
    cookieStore.set('role', mockLoginData.role, { ...base, maxAge: REFRESH_TOKEN_MAX_AGE });
    const mockRole = mockLoginData.role;
    redirect(
      mockRole === 'ADMIN'
        ? '/admin/dashboard'
        : mockRole === 'INSTRUCTOR'
          ? '/instructor/dashboard'
          : '/courses',
    );
  }
  // ──────────────────────────────────────────────────────────────────────────

  let role = '';
  try {
    const res = await axios.post(`${BACKEND}/api/auth/login`, {
      username,
      password,
    });
    const data = res.data?.data as {
      accessToken?: string;
      refreshToken?: string;
      memberId?: number;
      role?: string;
    } | null;

    if (!data?.accessToken || !data.refreshToken) {
      return {
        success: false,
        message: res.data?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다',
      };
    }

    const cookieStore = await cookies();
    const base = AUTH_COOKIE_BASE;
    cookieStore.set('accessToken', data.accessToken, { ...base, maxAge: ACCESS_TOKEN_MAX_AGE });
    cookieStore.set('refreshToken', data.refreshToken, {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    cookieStore.set('memberId', String(data.memberId ?? ''), {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    cookieStore.set('role', data.role ?? '', {
      ...base,
      maxAge: REFRESH_TOKEN_MAX_AGE,
    });
    role = data.role ?? '';
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const body = error.response.data as { message?: string };
      if (status === 423) {
        return {
          success: false,
          isLocked: true,
          message:
            body?.message ??
            '로그인 5회 실패로 계정이 잠겼습니다. 계정 보호 인증을 진행해주세요.',
        };
      }
      return {
        success: false,
        message: body?.message ?? '아이디 또는 비밀번호가 올바르지 않습니다',
      };
    }
    return { success: false, message: '서버와 연결할 수 없습니다' };
  }

  // 성공 → 역할별 이동 (redirect는 try/catch 밖에서: 내부적으로 NEXT_REDIRECT 에러를 던짐)
  redirect(
    role === 'ADMIN'
      ? '/admin/dashboard'
      : role === 'INSTRUCTOR'
        ? '/instructor/dashboard'
        : '/courses',
  );
}
