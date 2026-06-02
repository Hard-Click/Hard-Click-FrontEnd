import { api } from '@/services/api';
import type {
  EnrollRequest,
  EnrollResponseData,
  EnrollmentStatusFilter,
  MyEnrollment,
} from './types';

const USE_MOCK = true;

/**
 * 수강신청 (POST /api/enrollments)
 * Headers: Authorization, X-Member-Id (axios interceptor에서 자동 첨부)
 */
export async function enroll(payload: EnrollRequest) {
  if (USE_MOCK) {
    console.log('[MOCK] 수강신청:', payload);
    return {
      success: true,
      httpStatus: 201,
      data: { enrollmentId: 1 },
      message: '수강신청이 완료되었습니다.',
    };
  }
  return api.post<EnrollResponseData>('/api/enrollments', payload);
}

/**
 * 내 수강 목록 조회 (GET /api/enrollments/me?status=ALL|IN_PROGRESS|COMPLETED|...)
 * Headers: Authorization, X-Member-Id (axios interceptor에서 자동 첨부)
 */
export async function getMyEnrollments(status: EnrollmentStatusFilter = 'ALL') {
  if (USE_MOCK) {
    console.log('[MOCK] 내 수강 목록 조회:', status);
    return {
      success: true,
      httpStatus: 200,
      data: [] as MyEnrollment[],
      message: '내 수강 목록 조회 성공',
    };
  }
  return api.get<MyEnrollment[]>(`/api/enrollments/me?status=${status}`);
}
