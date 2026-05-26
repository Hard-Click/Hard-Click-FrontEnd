import axios from 'axios';

export interface ApiResponse<T = unknown> {
  httpStatus: number;
  message: string;
  data: T;
  /** httpStatus < 400 이면 true. 컴포넌트 호환용 derived 필드 */
  success: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
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
    const response = await axiosInstance.request<Omit<ApiResponse<T>, 'success'>>({
      method,
      url,
      data,
    });
    return withSuccess(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const body = error.response.data as Omit<ApiResponse<T>, 'success'>;
      return withSuccess({
        httpStatus: body?.httpStatus ?? error.response.status,
        message: body?.message ?? '요청 처리 중 오류가 발생했습니다',
        data: body?.data as T,
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
  delete: <T>(url: string) => request<T>('DELETE', url),
};
