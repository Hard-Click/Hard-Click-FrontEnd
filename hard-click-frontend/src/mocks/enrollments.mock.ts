/**
 * 수강 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/enrollments/me
 */

export interface EnrollmentApiItem {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  instructorName: string;
  progressRate: number; // 0~100
  status: 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  expiredAt: string;
}

export interface EnrollmentListApiResponse {
  content: EnrollmentApiItem[];
  totalPages: number;
}

export const mockEnrollmentListResponse: EnrollmentListApiResponse = {
  content: [
    {
      enrollmentId: 301,
      courseId: 1,
      courseTitle: '2026 수능 국어 완성반',
      instructorName: '김강사',
      progressRate: 45,
      status: 'IN_PROGRESS',
      expiredAt: '2026-11-10T23:59:59',
    },
    {
      enrollmentId: 302,
      courseId: 3,
      courseTitle: '2026 수능 수학 개념완성',
      instructorName: '박강사',
      progressRate: 100,
      status: 'COMPLETED',
      expiredAt: '2026-10-01T23:59:59',
    },
  ],
  totalPages: 2,
};
