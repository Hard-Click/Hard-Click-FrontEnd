/**
 * 수강 도메인 목 데이터 — 실제 백엔드 코드(enrollment_management) DTO 기준.
 * GET /api/enrollments/me → List<MyEnrollmentResponse> (배열 직접, 페이징 아님)
 *
 * ⚠️ 노션 명세(content/totalPages·progressRate·instructorName)와 다름 — 실제 코드 기준.
 */

export type EnrollmentStatus =
  | 'ENROLLED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'EXPIRED'
  | 'REFUNDED';

export interface MyEnrollmentApiItem {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  status: EnrollmentStatus;
  enrolledAt: string; // Instant
  expiredAt: string; // LocalDateTime
  progressPercent: number;
}

export const mockMyEnrollments: MyEnrollmentApiItem[] = [
  {
    enrollmentId: 301,
    courseId: 1,
    courseTitle: '2026 수능 국어 완성반',
    status: 'IN_PROGRESS',
    enrolledAt: '2026-03-02T10:00:00Z',
    expiredAt: '2026-11-10T23:59:59',
    progressPercent: 45,
  },
  {
    enrollmentId: 302,
    courseId: 3,
    courseTitle: '2026 수능 수학 개념완성',
    status: 'COMPLETED',
    enrolledAt: '2026-02-15T09:00:00Z',
    expiredAt: '2026-10-01T23:59:59',
    progressPercent: 100,
  },
];
