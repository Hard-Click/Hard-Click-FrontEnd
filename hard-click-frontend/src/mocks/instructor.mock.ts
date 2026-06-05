import type { CourseListApiResponse } from '@/features/courses/types';

/**
 * 강사 대시보드 도메인 목 데이터 — 실제 백엔드 코드 기준.
 * GET /api/instructor/courses → CourseListResponse (공개 강의 목록과 동일 shape)
 *   { content: CourseListItemResponse[], currentPage, totalPages, totalCount }
 *
 * ⚠️ 노션 기준의 enrollmentCount/DRAFT|PUBLISHED 전용 shape은 실제와 달라 폐기.
 *    실제는 일반 강의목록 DTO(CourseListResponse)를 그대로 재사용한다.
 */
export const mockInstructorCourses: CourseListApiResponse = {
  content: [
    {
      courseId: 1,
      title: '2026 수능 국어 완성반',
      subjectName: '국어',
      thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
      priceLabel: '99,000원',
      priceType: 'PAID',
      price: 99000,
      instructorName: '김강사',
      averageRating: 4.5,
      reviewCount: 128,
      studentCount: 342,
      createdAt: '2026-03-01T09:00:00Z',
      status: 'PUBLISHED',
    },
    {
      courseId: 8,
      title: '국어 비문학 심화 (준비중)',
      subjectName: '국어',
      thumbnailUrl: 'https://cdn.example.com/courses/8/thumbnail.jpg',
      priceLabel: '79,000원',
      priceType: 'PAID',
      price: 79000,
      instructorName: '김강사',
      averageRating: 0,
      reviewCount: 0,
      studentCount: 0,
      createdAt: '2026-05-15T13:20:00Z',
      status: 'DRAFT',
    },
  ],
  currentPage: 0,
  totalPages: 2,
  totalCount: 12,
};
