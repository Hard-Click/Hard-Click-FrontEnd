import axios from 'axios';
import { cookies } from 'next/headers';
import { ACCESS_TOKEN_MAX_AGE, AUTH_COOKIE_BASE } from '@/lib/auth-cookies';
import type { ApiResponse } from '@/services/api';

/**
 * 서버 전용 axios 인스턴스 (BFF 패턴).
 *
 * - 브라우저가 아니라 **Next.js 서버**에서 백엔드(Spring Boot)를 직접 호출한다. (서버-서버)
 * - 토큰은 **httpOnly 쿠키**에서 읽는다. (localStorage 사용 안 함 → XSS 안전)
 * - next/headers의 `cookies()`를 사용하므로 이 모듈은 **서버에서만 import** 가능하다.
 *   (Server Component / Server Action에서만 사용. 클라이언트 컴포넌트에서 import 금지)
 *
 * 반환 형태는 기존 `@/services/api`의 `ApiResponse<T>`와 동일해 컴포넌트 호환성을 유지한다.
 */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

const serverAxios = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// 요청 인터셉터: 쿠키의 accessToken을 Authorization 헤더로 자동 첨부
serverAxios.interceptors.request.use(async (config) => {
  const cookieStore = await cookies();

  const token = cookieStore.get('accessToken')?.value;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const memberId = cookieStore.get('memberId')?.value;
  if (memberId) {
    config.headers['X-Member-Id'] = memberId;
  }

  return config;
});

function withSuccess<T>(body: Omit<ApiResponse<T>, 'success'>): ApiResponse<T> {
  return { ...body, success: body.httpStatus < 400 };
}

function toErrorResponse<T>(error: unknown): ApiResponse<T> {
  if (axios.isAxiosError(error) && error.response) {
    const body = error.response.data as {
      httpStatus?: number;
      message?: string;
      data?: T;
      errorCode?: string;
      details?: Record<string, unknown>;
    };
    return withSuccess({
      httpStatus: body?.httpStatus ?? error.response.status,
      message: body?.message ?? '요청 처리 중 오류가 발생했습니다',
      data: body?.data as T,
      errorCode: body?.errorCode,
      details: body?.details,
    });
  }
  return withSuccess({
    httpStatus: 500,
    message: '서버와 연결할 수 없습니다',
    data: undefined as T,
  });
}

/**
 * Refresh Token으로 Access Token 재발급. 정책상 응답은 accessToken만 반환하므로
 * Access Token만 교체한다. RSC 렌더 중엔 쿠키 set이 막혀 throw → best-effort로 무시하고
 * 재발급된 토큰을 반환해 in-memory 재시도에 사용한다. (Refresh Token은 유지)
 */
async function refreshAccessTokenServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;
  if (!refreshToken) return null;
  try {
    const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
    const newToken = res.data?.data?.accessToken as string | undefined;
    if (!newToken) return null;
    try {
      cookieStore.set('accessToken', newToken, {
        ...AUTH_COOKIE_BASE,
        maxAge: ACCESS_TOKEN_MAX_AGE,
      });
    } catch {
      // RSC 렌더 컨텍스트: 쿠키 persist 불가 (Server Action/route에서만 가능)
    }
    return newToken;
  } catch {
    return null;
  }
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: unknown,
  extraHeaders?: Record<string, string>,
): Promise<ApiResponse<T>> {
  const baseHeaders =
    data instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  // 추가 헤더(예: 결제 Idempotency-Key) 병합. FormData면 Content-Type은 axios가 자동 설정.
  const headers = { ...baseHeaders, ...extraHeaders };
  try {
    const response = await serverAxios.request<Omit<ApiResponse<T>, 'success'>>({
      method,
      url,
      data,
      // ⭐ multipart(FormData)면 Content-Type을 지정하지 않는다 → boundary 자동 설정
      headers,
    });
    return withSuccess(response.data);
  } catch (error) {
    // Access Token 만료(401) → refresh로 재발급 후 1회 재시도 (refresh/login 자체는 제외)
    const isAuthEndpoint =
      url.startsWith('/api/auth/refresh') || url.startsWith('/api/auth/login');
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      !isAuthEndpoint
    ) {
      const newToken = await refreshAccessTokenServer();
      if (newToken) {
        try {
          // 인터셉터의 쿠키 토큰 대신 새 토큰을 명시적으로 사용
          const retry = await axios.request<Omit<ApiResponse<T>, 'success'>>({
            method,
            url,
            baseURL: BASE_URL,
            data,
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
          });
          return withSuccess(retry.data);
        } catch (retryError) {
          return toErrorResponse<T>(retryError);
        }
      }
    }
    return toErrorResponse<T>(error);
  }
}

/** 서버 컴포넌트 / Server Action 전용 API 클라이언트 */
export const serverApi = {
  get: <T>(url: string, extraHeaders?: Record<string, string>) =>
    request<T>('GET', url, undefined, extraHeaders),
  post: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('POST', url, body, extraHeaders),
  put: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('PUT', url, body, extraHeaders),
  patch: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('PATCH', url, body, extraHeaders),
  delete: <T>(url: string, body?: unknown, extraHeaders?: Record<string, string>) =>
    request<T>('DELETE', url, body, extraHeaders),
};
