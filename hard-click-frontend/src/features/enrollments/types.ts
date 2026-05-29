/** 백엔드 enrollment 도메인 명세 매칭 */

export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'REFUNDED';
export type EnrollmentStatusFilter = EnrollmentStatus | 'ALL';

export type PaymentType = 'FREE' | 'PAID';

/** 수강신청 요청 */
export interface EnrollRequest {
  courseId: number;
  paymentType: PaymentType;
}

/** 수강신청 응답 data */
export interface EnrollResponseData {
  enrollmentId: number;
}

/** 내 수강 목록 item */
export interface MyEnrollment {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  status: EnrollmentStatus;
  progressPercent: number;       // 0 ~ 100 (백엔드 progressPercent)
  expiredAt: string | null;      // ISO 8601 또는 null
  enrolledAt: string;            // ISO 8601 (백엔드 enrolledAt)
}
