import type {
  SubjectApiItem,
  CourseListApiResponse,
  CourseDetailApiResponse,
} from '@/features/courses/types';

/**
 * 강의 도메인 목 데이터 — 백엔드 응답 명세(노션 API 목록) 그대로.
 */

/** GET /api/subjects */
export const mockSubjects: SubjectApiItem[] = [
  { subjectId: 1, subjectName: '국어', courseCount: 24 },
  { subjectId: 2, subjectName: '수학', courseCount: 18 },
  { subjectId: 3, subjectName: '영어', courseCount: 12 },
  { subjectId: 4, subjectName: '생명과학Ⅰ', courseCount: 5 },
];

/** GET /api/courses (목록) */
export const mockCourseListResponse: CourseListApiResponse = {
  content: [
    {
      courseId: 1,
      title: '2026 수능 국어 완성반',
      instructorName: '김강사',
      subjectName: '국어',
      price: 99000,
      averageRating: 4.5,
      reviewCount: 128,
    },
    {
      courseId: 3,
      title: '2026 수능 수학 개념완성',
      instructorName: '박강사',
      subjectName: '수학',
      price: 89000,
      averageRating: 4.8,
      reviewCount: 256,
    },
    {
      courseId: 5,
      title: '영어 빈칸추론 집중 훈련',
      instructorName: '이강사',
      subjectName: '영어',
      price: 0,
      averageRating: 4.6,
      reviewCount: 88,
    },
  ],
  totalPages: 3,
};

/** GET /api/courses/{courseId} (상세) — curriculum은 평면 챕터 배열 */
export const mockCourseDetailResponse: CourseDetailApiResponse = {
  courseId: 1,
  title: '2026 수능 국어 완성반',
  description: '수능 국어를 완벽히 대비하는 종합 강의입니다.',
  instructorId: 10,
  instructorName: '김강사',
  subjectName: '국어',
  price: 99000,
  thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
  averageRating: 4.5,
  reviewCount: 128,
  curriculum: [
    { order: 1, title: '문학 독해 기초', durationMinutes: 45 },
    { order: 2, title: '비문학 독해 전략', durationMinutes: 60 },
    { order: 3, title: '실전 모의고사 해설', durationMinutes: 90 },
  ],
  createdAt: '2026-03-01T09:00:00',
};
