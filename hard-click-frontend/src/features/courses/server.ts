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

/** 백엔드 목록 응답(최소 필드) → UI CourseListItem (미제공 필드 기본값) */
function toCourseListItem(item: CourseListApiItem): CourseListItem {
  return {
    courseId: item.courseId,
    title: item.title,
    instructorName: item.instructorName,
    subjectName: item.subjectName,
    price: item.price,
    thumbnailUrl: item.thumbnailUrl, // 강의 목록 조회는 썸네일 반환
    averageRating: item.averageRating,
    reviewCount: item.reviewCount,
    studentCount: 0,
    isFree: item.price === 0,
    status: 'PUBLISHED',
    createdAt: '',
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
    if (query?.subjectId) {
      const name = mockSubjects.find((s) => s.subjectId === query.subjectId)?.subjectName;
      if (name) courses = courses.filter((c) => c.subjectName === name);
    }
    if (query?.keyword) {
      const kw = query.keyword.toLowerCase();
      courses = courses.filter((c) => c.title.toLowerCase().includes(kw));
    }
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
  // 명세: subject 파라미터는 subjectId(숫자)
  if (query?.subjectId) params.set('subject', String(query.subjectId));

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
