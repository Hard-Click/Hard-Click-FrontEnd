import axios from 'axios';
import { cookies } from 'next/headers';
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

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const response = await serverAxios.request<Omit<ApiResponse<T>, 'success'>>({
      method,
      url,
      data,
      // ⭐ multipart(FormData)면 Content-Type을 지정하지 않는다 → boundary 자동 설정
      headers:
        data instanceof FormData
          ? undefined
          : { 'Content-Type': 'application/json' },
    });
    return withSuccess(response.data);
  } catch (error) {
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
}

/** 서버 컴포넌트 / Server Action 전용 API 클라이언트 */
export const serverApi = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: <T>(url: string, body?: unknown) => request<T>('DELETE', url, body),
};
