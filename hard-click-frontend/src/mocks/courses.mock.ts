import type {
  SubjectApiItem,
  CourseListApiResponse,
  CourseDetailApiResponse,
} from '@/features/courses/types';

/**
 * 강의 도메인 목 데이터 — 백엔드 응답 명세(shape) 그대로.
 * 서비스의 `toCourseListItem` / `toCourseDetail` 매핑을 실제 API와 동일하게 거친다.
 */

/** GET /api/subjects */
export const mockSubjects: SubjectApiItem[] = [
  { subjectId: 1, subjectName: '국어', courseCount: 12 },
  { subjectId: 2, subjectName: '수학Ⅰ', courseCount: 8 },
  { subjectId: 3, subjectName: '수학Ⅱ', courseCount: 10 },
  { subjectId: 4, subjectName: '영어', courseCount: 9 },
  { subjectId: 5, subjectName: '한국사', courseCount: 4 },
  { subjectId: 6, subjectName: '물리학Ⅰ', courseCount: 3 },
  { subjectId: 7, subjectName: '화학Ⅰ', courseCount: 3 },
  { subjectId: 8, subjectName: '생명과학Ⅰ', courseCount: 5 },
];

/** GET /api/courses */
export const mockCourseListResponse: CourseListApiResponse = {
  content: [
    {
      courseId: 1,
      title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강',
      instructorName: '박지훈',
      subjectName: '수학Ⅱ',
      price: 89000,
      priceType: 'PAID',
      thumbnailUrl: '/image/lecture1.svg',
      averageRating: 4.8,
      reviewCount: 1234,
      studentCount: 12543,
      status: 'PUBLISHED',
      createdAt: '2026-01-15',
    },
    {
      courseId: 2,
      title: '국어 독서 지문 분석과 빈칸 추론 완성',
      instructorName: '김민정',
      subjectName: '국어',
      price: 75000,
      priceType: 'PAID',
      thumbnailUrl: '/image/lecture2.svg',
      averageRating: 4.9,
      reviewCount: 856,
      studentCount: 8932,
      status: 'PUBLISHED',
      createdAt: '2026-02-01',
    },
    {
      courseId: 3,
      title: '생명과학Ⅰ 유전 킬러 정복 + 실전 모의고사',
      instructorName: '최현우',
      subjectName: '생명과학Ⅰ',
      price: 0,
      priceType: 'FREE',
      thumbnailUrl: '/image/lecture3.svg',
      averageRating: 4.7,
      reviewCount: 643,
      studentCount: 6721,
      status: 'PUBLISHED',
      createdAt: '2026-01-20',
    },
    {
      courseId: 4,
      title: '영어 빈칸추론 집중 훈련 - 1등급 완성',
      instructorName: '이서연',
      subjectName: '영어',
      price: 79000,
      priceType: 'PAID',
      thumbnailUrl: '/image/lecture4.svg',
      averageRating: 4.6,
      reviewCount: 1523,
      studentCount: 15234,
      status: 'PUBLISHED',
      createdAt: '2026-02-10',
    },
    {
      courseId: 5,
      title: '2027 수능 수학Ⅱ 확률과 통계 집중 특강',
      instructorName: '박지훈',
      subjectName: '수학Ⅱ',
      price: 65000,
      priceType: 'PAID',
      thumbnailUrl: '/image/lecture5.svg',
      averageRating: 4.7,
      reviewCount: 892,
      studentCount: 9234,
      status: 'PUBLISHED',
      createdAt: '2026-03-01',
    },
    {
      courseId: 6,
      title: '수학Ⅰ 수열과 극한 완전 정복',
      instructorName: '박지훈',
      subjectName: '수학Ⅰ',
      price: 55000,
      priceType: 'PAID',
      thumbnailUrl: '/image/lecture6.svg',
      averageRating: 4.9,
      reviewCount: 1102,
      studentCount: 11320,
      status: 'PUBLISHED',
      createdAt: '2026-03-15',
    },
  ],
  currentPage: 0,
  totalPages: 1,
  totalCount: 6,
};

/** GET /api/courses/{courseId} */
export const mockCourseDetailResponse: CourseDetailApiResponse = {
  courseId: 1,
  title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강',
  description:
    '수능 수학Ⅱ 미적분 단원의 킬러 문제를 완전 정복하는 실전 특강입니다. 함수의 극한부터 미분·적분 심화 문제까지 체계적으로 학습합니다.',
  instructorName: '박지훈',
  instructorId: 1,
  subjectName: '수학Ⅱ',
  price: 89000,
  priceType: 'PAID',
  status: 'PUBLISHED',
  thumbnailUrl: '/image/lecture1.svg',
  averageRating: 4.8,
  reviewCount: 1234,
  studentCount: 12543,
  learningObjectives: [
    '미분·적분 킬러 문제 유형을 완전히 파악하고 풀이할 수 있다',
    '함수의 극한과 연속 개념을 실전에 적용할 수 있다',
    '수능 수학Ⅱ 1등급을 위한 실전 감각을 기를 수 있다',
  ],
  targetAudience: [
    '수능 수학Ⅱ에서 3~4등급이며 1등급을 목표로 하는 수험생',
    '미적분 킬러 문제에서 자꾸 막히는 학생',
  ],
  techTags: ['함수의 극한', '연속함수', '미분법', '적분법'],
  level: '중급~고급',
  sections: [
    {
      sectionId: 1,
      title: '섹션 1: 함수의 극한',
      orderIndex: 1,
      lessons: [
        { lessonId: 1, title: 'OT 및 학습 방향', durationSeconds: 323, isPreview: true },
        { lessonId: 2, title: '함수의 극한 개념 정리', durationSeconds: 765, isPreview: false },
        { lessonId: 3, title: '극한값 계산 문제풀이', durationSeconds: 1110, isPreview: false },
      ],
    },
    {
      sectionId: 2,
      title: '섹션 2: 미분법',
      orderIndex: 2,
      lessons: [
        { lessonId: 4, title: '미분계수와 도함수 기초', durationSeconds: 2400, isPreview: false },
        { lessonId: 5, title: '합성함수·역함수 미분', durationSeconds: 2670, isPreview: false },
      ],
    },
    {
      sectionId: 3,
      title: '섹션 3: 적분법',
      orderIndex: 3,
      lessons: [
        { lessonId: 6, title: '부정적분과 정적분 완전 정복', durationSeconds: 2700, isPreview: false },
        { lessonId: 7, title: '실전 모의고사 해설 특강', durationSeconds: 5400, isPreview: false },
      ],
    },
  ],
  createdAt: '2026-01-15',
};
