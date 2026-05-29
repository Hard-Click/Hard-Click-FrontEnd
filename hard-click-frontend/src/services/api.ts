import axios from 'axios';

export interface ApiResponse<T = unknown> {
  httpStatus: number;
  message: string;
  data: T;
  /** httpStatus < 400 이면 true. 컴포넌트 호환용 derived 필드 */
  success: boolean;
  /** 백엔드 ErrorResponse.errorCode (예: USER_NOT_FOUND) — 에러 응답에만 존재 */
  errorCode?: string;
  /** 백엔드 @Valid 실패 시 필드별 에러 (예: { email: '이메일을 입력해주세요' }) */
  details?: Record<string, unknown>;
}

/**
 * baseURL은 빈 값 ('') → Next.js rewrites 프록시 경유
 * next.config.ts의 rewrites가 /api/* → BACKEND_URL/api/* 로 처리
 * 이렇게 하면 dev에서 CORS 우회 가능
 */
const axiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청마다 localStorage의 accessToken을 Authorization 헤더에 자동 첨부
 * memberId가 있으면 X-Member-Id 헤더도 같이 첨부 (백엔드 도메인 격리용)
 * 비로그인 API는 헤더가 없어도 무시되므로 안전
 */
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const memberId = localStorage.getItem('memberId');
    if (memberId) {
      config.headers['X-Member-Id'] = memberId;
    }
  }
  return config;
});

function withSuccess<T>(body: Omit<ApiResponse<T>, 'success'>): ApiResponse<T> {
  return {
    ...body,
    success: body.httpStatus < 400,
  };
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: unknown,
): Promise<ApiResponse<T>> {
  try {
    const response = await axiosInstance.request<
      Omit<ApiResponse<T>, 'success'>
    >({
      method,
      url,
      data,
    });
    return withSuccess(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // 백엔드 ErrorResponse: { errorCode, message, timestamp, path, traceId, details }
      // 백엔드 ApiResponse: { httpStatus, message, data } — 에러 시엔 ErrorResponse 형식이 옴
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

export const api = {
  get: <T>(url: string) => request<T>('GET', url),
  post: <T>(url: string, body?: unknown) => request<T>('POST', url, body),
  put: <T>(url: string, body?: unknown) => request<T>('PUT', url, body),
  patch: <T>(url: string, body?: unknown) => request<T>('PATCH', url, body),
  delete: <T>(url: string, body?: unknown) => request<T>('DELETE', url, body),
};
