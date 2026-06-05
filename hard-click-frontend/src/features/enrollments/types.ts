/** 백엔드 enrollment 도메인 명세 매칭 */

// 백엔드 EnrollmentStatus enum 기준
export type EnrollmentStatus = 'ENROLLED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
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
  progressRate: number;          // 0.00 ~ 100.00 (소수점 2자리)
  expiredAt: string | null;      // ISO 8601 또는 null
  createdAt: string;             // ISO 8601
}
