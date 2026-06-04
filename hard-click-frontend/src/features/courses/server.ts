import { serverApi } from '@/lib/api';
import type {
  CourseListItem,
  CourseListQuery,
  Subject,
  CourseStatus,
} from './types';

interface CourseListApiItem {
  courseId: number;
  title: string;
  instructorName: string;
  subjectName: string;
  price: number;
  priceType?: 'FREE' | 'PAID';
  thumbnailUrl: string;
  averageRating: number;
  reviewCount: number;
  studentCount: number;
  status?: CourseStatus;
  createdAt?: string;
}
interface CourseListApiResponse {
  content: CourseListApiItem[];
}
interface SubjectApiItem {
  subjectId: number;
  subjectName: string;
  courseCount: number;
}

function toCourseListItem(api: CourseListApiItem): CourseListItem {
  return {
    courseId: api.courseId,
    title: api.title,
    instructorName: api.instructorName,
    subjectName: api.subjectName,
    price: api.price,
    thumbnailUrl: api.thumbnailUrl,
    averageRating: api.averageRating,
    reviewCount: api.reviewCount,
    studentCount: api.studentCount,
    isFree: api.priceType ? api.priceType === 'FREE' : api.price === 0,
    status: api.status ?? 'PUBLISHED',
    createdAt: api.createdAt ?? '',
    isEnrolled: false,
    hasPreview: false,
  };
}

/** 과목 목록 — 서버 조회 */
export async function getSubjectsServer(): Promise<Subject[]> {
  const res = await serverApi.get<SubjectApiItem[]>('/api/subjects');
  if (!res.success || !res.data) return [];
  return res.data.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
}

/** 강의 목록 — 서버 조회 (Server Component 전용) */
export async function getCoursesServer(
  query?: CourseListQuery,
): Promise<CourseListItem[]> {
  const params = new URLSearchParams();
  params.set('page', '0');
  params.set('size', '100');
  if (query?.keyword) params.set('keyword', query.keyword);
  // 백엔드 sort enum은 대문자
  params.set('sort', (query?.sort ?? 'latest').toUpperCase());
  // 백엔드는 과목명(subject) 문자열로 필터 → subjectId를 과목명으로 변환
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
  // 강사 필터는 백엔드 미지원 → 클라이언트 측 후처리(서버에서 수행)
  if (query?.instructor) {
    courses = courses.filter((c) => c.instructorName === query.instructor);
  }
  return courses;
}
