import axios from 'axios';

export interface ApiResponse<T = unknown> {
  httpStatus: number;
  message: string;
  data: T;
  /** httpStatus < 400 이면 true. 컴포넌트 호환용 derived 필드 */
  success: boolean;
  /** 백엔드 ErrorResponse.errorCode (예: USER_NOT_FOUND) — 에러 응답에만 존재 */
  errorCode?: string;
  /** 백엔드 @Valid 실패 시 필드별 에러 */
  details?: Record<string, unknown>;
}

/**
 * 클라이언트 axios — 동일 출처 `/api/*` 로 요청한다.
 *
 * 인증 토큰을 클라가 직접 붙이지 않는다(=localStorage 사용 안 함):
 * 브라우저가 httpOnly 쿠키를 자동 전송하고, `app/api/[...path]/route.ts`(BFF 프록시)가
 * 쿠키를 읽어 Authorization 헤더를 주입해 백엔드로 중계한다.
 */
const axiosInstance = axios.create({ baseURL: '' });

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
      // FormData면 Content-Type을 지정하지 않는다 → 브라우저가 boundary 포함해 자동 설정
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
      // BFF 프록시가 refresh까지 시도했는데도 401 → 세션 만료/차단.
      // 토큰은 프록시에서 정리되므로 클라는 로그인 페이지로 이동한다. (로그인 페이지 제외)
      // 단, AUTH_009(현재 비밀번호 불일치)는 비번변경·회원탈퇴의 '본인 확인' 실패라 세션 만료가 아니다.
      // 이때 로그인으로 튕기면 비번 한 번 틀렸다고 로그아웃되므로, 호출자(모달)에 그대로 돌려줘
      // "비밀번호가 일치하지 않습니다"를 띄우게 한다.
      if (
        error.response.status === 401 &&
        body?.errorCode !== 'AUTH_009' &&
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/auth')
      ) {
        window.location.href = '/auth/login';
        // 페이지가 로그인으로 이동 중 — 호출자가 에러 UI를 그리지 않도록 보류
        // (네비게이션 완료 시까지 resolve하지 않음)
        return new Promise<never>(() => {});
      }
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
