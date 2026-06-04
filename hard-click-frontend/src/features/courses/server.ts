import { serverApi } from '@/lib/api';
import type {
  CourseListItem,
  CourseListQuery,
  Subject,
  CourseListApiItem,
  CourseListApiResponse,
  SubjectApiItem,
} from './types';
import { USE_MOCK } from '@/mocks/config';
import { mockSubjects, mockCourseListResponse } from '@/mocks/courses.mock';

function toCourseListItem(item: CourseListApiItem): CourseListItem {
  return {
    courseId: item.courseId,
    title: item.title,
    instructorName: item.instructorName,
    subjectName: item.subjectName,
    price: item.price,
    thumbnailUrl: item.thumbnailUrl,
    averageRating: item.averageRating,
    reviewCount: item.reviewCount,
    studentCount: item.studentCount,
    isFree: item.priceType ? item.priceType === 'FREE' : item.price === 0,
    status: item.status ?? 'PUBLISHED',
    createdAt: item.createdAt ?? '',
    isEnrolled: false,
    hasPreview: false,
  };
}

/** 과목 목록 — 서버 조회 */
export async function getSubjectsServer(): Promise<Subject[]> {
  if (USE_MOCK) {
    return mockSubjects.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
  }
  const res = await serverApi.get<SubjectApiItem[]>('/api/subjects');
  if (!res.success || !res.data) return [];
  return res.data.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
}

/** 강의 목록 — 서버 조회 (Server Component 전용) */
export async function getCoursesServer(
  query?: CourseListQuery,
): Promise<CourseListItem[]> {
  if (USE_MOCK) {
    let courses = mockCourseListResponse.content.map(toCourseListItem);
    if (query?.instructor) {
      courses = courses.filter((c) => c.instructorName === query.instructor);
    }
    return courses;
  }

  const params = new URLSearchParams();
  params.set('page', '0');
  params.set('size', '100');
  if (query?.keyword) params.set('keyword', query.keyword);
  params.set('sort', (query?.sort ?? 'latest').toUpperCase());
  if (query?.subjectId) {
    const subjects = await getSubjectsServer();
    const matched = subjects.find((s) => s.subjectId === query.subjectId);
    if (matched) params.set('subject', matched.name);
  }

  const res = await serverApi.get<CourseListApiResponse>(
    `/api/courses?${params.toString()}`,
  );
  if (!res.success || !res.data) return [];

  let courses = res.data.content.map(toCourseListItem);
  if (query?.instructor) {
    courses = courses.filter((c) => c.instructorName === query.instructor);
  }
  return courses;
}
