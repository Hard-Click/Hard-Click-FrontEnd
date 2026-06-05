import type {
  SubjectApiItem,
  CourseListApiResponse,
  CourseDetailApiResponse,
} from '@/features/courses/types';

/**
 * 강의 도메인 목 데이터 — 실제 백엔드 코드(cource) DTO 기준.
 * GET /api/subjects, GET /api/courses, GET /api/courses/{courseId}
 *
 * ⚠️ 노션 명세(courseCount, 평면 curriculum 등)와 다름 — 실제 코드 기준으로 정렬함.
 */

/** GET /api/subjects → SubjectResponse[] */
export const mockSubjects: SubjectApiItem[] = [
  { subjectId: 1, subjectName: '국어' },
  { subjectId: 2, subjectName: '수학' },
  { subjectId: 3, subjectName: '영어' },
  { subjectId: 4, subjectName: '생명과학Ⅰ' },
];

/** GET /api/courses → CourseListResponse */
export const mockCourseListResponse: CourseListApiResponse = {
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
      courseId: 3,
      title: '2026 수능 수학 개념완성',
      subjectName: '수학',
      thumbnailUrl: 'https://cdn.example.com/courses/3/thumbnail.jpg',
      priceLabel: '89,000원',
      priceType: 'PAID',
      price: 89000,
      instructorName: '박강사',
      averageRating: 4.8,
      reviewCount: 256,
      studentCount: 540,
      createdAt: '2026-02-20T09:00:00Z',
      status: 'PUBLISHED',
    },
    {
      courseId: 5,
      title: '영어 빈칸추론 집중 훈련',
      subjectName: '영어',
      thumbnailUrl: 'https://cdn.example.com/courses/5/thumbnail.jpg',
      priceLabel: '무료',
      priceType: 'FREE',
      price: 0,
      instructorName: '이강사',
      averageRating: 4.6,
      reviewCount: 88,
      studentCount: 1200,
      createdAt: '2026-04-10T09:00:00Z',
      status: 'PUBLISHED',
    },
  ],
  currentPage: 0,
  totalPages: 3,
  totalCount: 27,
};

/** GET /api/courses/{courseId} → CourseDetailResponse (sections → lessons) */
export const mockCourseDetailResponse: CourseDetailApiResponse = {
  courseId: 1,
  title: '2026 수능 국어 완성반',
  subjectName: '국어',
  description: '수능 국어를 완벽히 대비하는 종합 강의입니다.',
  thumbnailUrl: 'https://cdn.example.com/courses/1/thumbnail.jpg',
  priceType: 'PAID',
  price: 99000,
  priceLabel: '99,000원',
  status: 'PUBLISHED',
  instructorName: '김강사',
  averageRating: 4.5,
  reviewCount: 128,
  studentCount: 342,
  sections: [
    {
      sectionId: 1,
      title: '섹션 1: 문학 독해',
      orderIndex: 0,
      lessons: [
        {
          lessonId: 1,
          title: 'OT 및 학습 방향',
          description: '강의 전체 구성과 학습 방향을 안내합니다.',
          orderIndex: 0,
          durationSeconds: 323,
          isPreview: true,
        },
        {
          lessonId: 2,
          title: '문학 독해 기초',
          description: '운문·산문 독해의 기본기를 다집니다.',
          orderIndex: 1,
          durationSeconds: 2700,
          isPreview: false,
        },
      ],
    },
    {
      sectionId: 2,
      title: '섹션 2: 비문학 독해',
      orderIndex: 1,
      lessons: [
        {
          lessonId: 3,
          title: '비문학 독해 전략',
          description: '지문 구조를 빠르게 파악하는 전략.',
          orderIndex: 0,
          durationSeconds: 3600,
          isPreview: false,
        },
      ],
    },
  ],
  learningObjectives: ['수능 국어 전 영역 출제 유형을 파악한다', '실전 시간 배분 전략을 익힌다'],
  targetAudience: ['수능 국어 3~4등급 수험생', '내신 국어를 보완하려는 학생'],
  techTags: ['문학', '비문학', '화법과작문'],
  level: '중급~고급',
  instructorStudentCount: 42800,
  instructorCourseCount: 7,
  instructorRating: 4.9,
};
