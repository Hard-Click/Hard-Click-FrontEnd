import { api } from '@/services/api';
import type {
  EnrollRequest,
  EnrollResponseData,
  EnrollmentStatusFilter,
  MyEnrollment,
} from './types';
import { isMock } from '@/mocks/config';
import { mockMyEnrollments, type MyEnrollmentApiItem } from '@/mocks/enrollments.mock';

/** 백엔드 enrollment 응답(API: progressPercent/enrolledAt) → UI MyEnrollment(progressRate/createdAt) */
function toMyEnrollment(e: MyEnrollmentApiItem): MyEnrollment {
  return {
    enrollmentId: e.enrollmentId,
    courseId: e.courseId,
    courseTitle: e.courseTitle,
    status: e.status,
    progressRate: e.progressPercent,
    expiredAt: e.expiredAt,
    createdAt: e.enrolledAt,
  };
}

/**
 * 수강신청 (POST /api/enrollments)
 * 백엔드 EnrollRequest는 courseId만 사용(paymentType은 무시됨).
 */
export async function enroll(payload: EnrollRequest) {
  if (isMock('enrollments')) {
    return {
      success: true,
      httpStatus: 201,
      message: '수강신청이 완료되었습니다.',
      data: { enrollmentId: 1 } as EnrollResponseData,
    };
  }
  return api.post<EnrollResponseData>('/api/enrollments', payload);
}

/**
 * 내 수강 목록 조회 (GET /api/enrollments/me?status=ALL|IN_PROGRESS|COMPLETED|EXPIRED)
 * 백엔드는 List<MyEnrollmentResponse>(배열 직접)을 반환 → UI MyEnrollment[]로 매핑.
 */
export async function getMyEnrollments(status: EnrollmentStatusFilter = 'ALL') {
  if (isMock('enrollments')) {
    return {
      success: true,
      httpStatus: 200,
      message: '내 수강 목록 조회 성공',
      data: mockMyEnrollments.map(toMyEnrollment),
    };
  }
  const res = await api.get<MyEnrollmentApiItem[]>(`/api/enrollments/me?status=${status}`);
  if (res.success && res.data) return { ...res, data: res.data.map(toMyEnrollment) };
  return { ...res, data: [] as MyEnrollment[] };
}
