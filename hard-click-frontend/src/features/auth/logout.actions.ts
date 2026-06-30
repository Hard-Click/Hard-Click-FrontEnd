'use server';

import { cookies } from 'next/headers';
import { serverApi } from '@/lib/api';

/** 로그아웃 — BE POST /api/auth/logout은 refreshToken @NotBlank를 body에 요구. httpOnly 쿠키에서 읽어 주입. */
export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value ?? '';
  return serverApi.post<Record<string, never>>('/api/auth/logout', { refreshToken });
}
