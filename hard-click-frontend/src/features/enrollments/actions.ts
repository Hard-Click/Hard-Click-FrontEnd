import { enroll, getMyEnrollments } from './services';
import type { EnrollmentStatusFilter, PaymentType } from './types';

/** 수강신청 액션 — 무료/유료 구분해서 호출 */
export async function enrollCourseAction(courseId: number, paymentType: PaymentType = 'FREE') {
  if (!courseId) {
    return {
      success: false,
      message: '강의 ID가 없습니다',
    };
  }
  return enroll({ courseId, paymentType });
}

/** 내 수강 목록 조회 액션 */
export async function getMyEnrollmentsAction(status: EnrollmentStatusFilter = 'ALL') {
  return getMyEnrollments(status);
}
