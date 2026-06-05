/**
 * 강사 대시보드 도메인 목 데이터 — 백엔드 명세(노션 API 목록) 그대로.
 * GET /api/instructor/courses (강사 내 강의 목록 + 통계)
 */

export interface InstructorCourseApiItem {
  courseId: number;
  title: string;
  subjectName: string;
  price: number;
  status: 'DRAFT' | 'PUBLISHED';
  thumbnailUrl: string;
  averageRating: number;
  reviewCount: number;
  enrollmentCount: number;
  createdAt: string; // yyyy-MM-dd'T'HH:mm:ss
}

export interface InstructorCourseListApiResponse {
  content: InstructorCourseApiItem[];
  totalPages: number;
}

export const mockInstructorCourses: InstructorCourseListApiResponse = {
  content: [
    {
      courseId: 1,
      title: '2026 수능 국어 완성반',
      subjectName: '국어',
      price: 99000,
      status: 'PUBLISHED',
      thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
      averageRating: 4.5,
      reviewCount: 128,
      enrollmentCount: 342,
      createdAt: '2026-03-01T09:00:00',
    },
    {
      courseId: 8,
      title: '국어 비문학 심화 (준비중)',
      subjectName: '국어',
      price: 79000,
      status: 'DRAFT',
      thumbnailUrl: 'https://cdn.example.com/courses/8/thumbnail.jpg',
      averageRating: 0,
      reviewCount: 0,
      enrollmentCount: 0,
      createdAt: '2026-05-15T13:20:00',
    },
  ],
  totalPages: 2,
};
