import type { CourseListItem, Subject, CourseListQuery } from './types';

export const MOCK_SUBJECTS: Subject[] = [
  { subjectId: 1, name: '국어' },
  { subjectId: 2, name: '수학Ⅰ' },
  { subjectId: 3, name: '수학Ⅱ' },
  { subjectId: 4, name: '영어' },
  { subjectId: 5, name: '한국사' },
  { subjectId: 6, name: '물리학Ⅰ' },
  { subjectId: 7, name: '화학Ⅰ' },
  { subjectId: 8, name: '생명과학Ⅰ' },
  { subjectId: 9, name: '지구과학Ⅰ' },
  { subjectId: 10, name: '사회문화' },
  { subjectId: 11, name: '생활과 윤리' },
  { subjectId: 12, name: '한국지리' },
  { subjectId: 13, name: '세계지리' },
  { subjectId: 14, name: '정치와 법' },
  { subjectId: 15, name: '경제' },
];

export const MOCK_COURSES: CourseListItem[] = [
  {
    courseId: 1,
    title: '2027 수능 수학Ⅱ 미적분 실전 킬러 특강',
    instructorName: '박지훈',
    subjectName: '수학Ⅱ',
    price: 89000,
    averageRating: 4.8,
    reviewCount: 1234,
    studentCount: 12543,
    status: 'PUBLISHED',
    createdAt: '2026-01-15',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture1.svg',
  },
  {
    courseId: 2,
    title: '국어 독서 지문 분석과 빈칸 추론 완성',
    instructorName: '김민정',
    subjectName: '국어',
    price: 75000,
    averageRating: 4.9,
    reviewCount: 856,
    studentCount: 8932,
    status: 'PUBLISHED',
    createdAt: '2026-02-01',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture2.svg',
  },
  {
    courseId: 3,
    title: '생명과학Ⅰ 유전 킬러 정복 + 실전 모의고사',
    instructorName: '최현우',
    subjectName: '생명과학Ⅰ',
    price: 0,
    averageRating: 4.7,
    reviewCount: 643,
    studentCount: 6721,
    status: 'PUBLISHED',
    createdAt: '2026-01-20',
    isFree: true,
    isEnrolled: false,
    hasPreview: false,
    thumbnailUrl: '/image/lecture3.svg',
  },
  {
    courseId: 4,
    title: '영어 빈칸추론 집중 훈련 - 1등급 완성',
    instructorName: '이서연',
    subjectName: '영어',
    price: 79000,
    averageRating: 4.6,
    reviewCount: 1523,
    studentCount: 15234,
    status: 'PUBLISHED',
    createdAt: '2026-02-10',
    isFree: false,
    isEnrolled: false,
    hasPreview: true,
    thumbnailUrl: '/image/lecture4.svg',
  },
];

export async function getCourses(query?: CourseListQuery): Promise<CourseListItem[]> {
  // TODO: Replace with real API — GET /api/courses
  await new Promise(resolve => setTimeout(resolve, 200));

  let courses = MOCK_COURSES.filter(c => c.status === 'PUBLISHED');

  if (query?.keyword) {
    const kw = query.keyword.toLowerCase();
    courses = courses.filter(c => c.title.toLowerCase().includes(kw));
  }

  if (query?.subjectId) {
    const subject = MOCK_SUBJECTS.find(s => s.subjectId === query.subjectId);
    if (subject) courses = courses.filter(c => c.subjectName === subject.name);
  }

  if (query?.instructor) {
    courses = courses.filter(c => c.instructorName === query.instructor);
  }

  const sort = query?.sort ?? 'latest';
  const sorted = [...courses];
  if (sort === 'latest') {
    sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === 'popular') {
    sorted.sort((a, b) => b.studentCount - a.studentCount);
  } else if (sort === 'rating') {
    sorted.sort((a, b) => b.averageRating - a.averageRating);
  }

  return sorted;
}

export async function getSubjects(): Promise<Subject[]> {
  // TODO: Replace with real API — GET /api/subjects
  return MOCK_SUBJECTS;
}

export function getInstructors(): string[] {
  return Array.from(
    new Set(MOCK_COURSES.filter(c => c.status === 'PUBLISHED').map(c => c.instructorName))
  ).sort();
}
