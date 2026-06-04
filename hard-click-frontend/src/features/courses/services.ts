import type {
  CourseListItem,
  Subject,
  CourseListQuery,
  CourseDetail,
  SubjectApiItem,
  CourseListApiItem,
  CourseListApiResponse,
  CourseDetailApiResponse,
} from './types';
import { api } from '@/services/api';
import { USE_MOCK } from '@/mocks/config';
import {
  mockSubjects,
  mockCourseListResponse,
  mockCourseDetailResponse,
} from '@/mocks/courses.mock';

function formatTotalDuration(totalSecs: number): string {
  if (totalSecs <= 0) return '0분';
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분`;
  return `${s}초`;
}

/** 백엔드 상세 응답 → UI CourseDetail */
function toCourseDetail(data: CourseDetailApiResponse): CourseDetail {
  const allLessons = (data.sections ?? []).flatMap((s) => s.lessons ?? []);
  const totalSecs = allLessons.reduce(
    (sum, l) => sum + (l.durationSeconds ?? 0),
    0,
  );

  return {
    courseId: data.courseId,
    title: data.title,
    description: data.description,
    subjectName: data.subjectName,
    instructorName: data.instructorName,
    price: data.price,
    isFree: data.priceType ? data.priceType === 'FREE' : data.price === 0,
    thumbnailUrl: data.thumbnailUrl,
    averageRating: data.averageRating,
    reviewCount: data.reviewCount,
    studentCount: data.studentCount,
    status: data.status ?? 'PUBLISHED',
    isEnrolled: false,
    isWishlisted: false,
    isInCart: false,
    learningGoals: data.learningObjectives ?? [],
    targetAudience: data.targetAudience ?? [],
    techTags: data.techTags ?? [],
    materialsProvided: [],
    level: data.level ?? '',
    totalLessons: allLessons.length,
    totalDuration: formatTotalDuration(totalSecs),
    notices: [],
    instructor: {
      instructorId: data.instructorId ?? 0,
      name: data.instructorName,
      subtitle: '',
      bio: '',
      career: [],
      tags: [],
      instructorStudentCount: 0,
      instructorCourseCount: 0,
      instructorRating: 0,
    },
    curriculum: (data.sections ?? []).map((sec) => ({
      sectionId: sec.sectionId,
      title: sec.title,
      lessons: (sec.lessons ?? []).map((l) => ({
        lessonId: l.lessonId,
        title: l.title,
        duration: l.durationSeconds
          ? `${String(Math.floor(l.durationSeconds / 60)).padStart(2, '0')}:${String(l.durationSeconds % 60).padStart(2, '0')}`
          : '00:00',
        isPreview: l.isPreview ?? false,
      })),
    })),
    reviews: [],
    ratingDistribution: [],
  };
}

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

/** UI 목록에 검색·과목·강사·정렬 적용 (목 모드 / 클라 후처리용) */
function applyCourseFilters(
  courses: CourseListItem[],
  query: CourseListQuery | undefined,
  subjects: Subject[],
): CourseListItem[] {
  let result = courses.filter((c) => c.status === 'PUBLISHED');
  if (query?.keyword) {
    const kw = query.keyword.toLowerCase();
    result = result.filter((c) => c.title.toLowerCase().includes(kw));
  }
  if (query?.subjectId) {
    const subject = subjects.find((s) => s.subjectId === query.subjectId);
    if (subject) result = result.filter((c) => c.subjectName === subject.name);
  }
  if (query?.instructor) {
    result = result.filter((c) => c.instructorName === query.instructor);
  }
  const sort = query?.sort ?? 'latest';
  const sorted = [...result];
  if (sort === 'latest')
    sorted.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  else if (sort === 'popular')
    sorted.sort((a, b) => b.studentCount - a.studentCount);
  else if (sort === 'rating')
    sorted.sort((a, b) => b.averageRating - a.averageRating);
  return sorted;
}

export async function getCourseDetail(
  courseId: number,
): Promise<CourseDetail | null> {
  if (USE_MOCK) {
    return toCourseDetail({ ...mockCourseDetailResponse, courseId });
  }
  const response = await api.get<CourseDetailApiResponse>(
    `/api/courses/${courseId}`,
  );
  if (!response.success || !response.data) return null;
  return toCourseDetail(response.data);
}

export async function getCourses(
  query?: CourseListQuery,
): Promise<CourseListItem[]> {
  if (USE_MOCK) {
    const subjects = mockSubjects.map((s) => ({
      subjectId: s.subjectId,
      name: s.subjectName,
    }));
    return applyCourseFilters(
      mockCourseListResponse.content.map(toCourseListItem),
      query,
      subjects,
    );
  }

  const params = new URLSearchParams();
  params.set('page', '0');
  params.set('size', '100');
  if (query?.keyword) params.set('keyword', query.keyword);
  // 백엔드 sort enum은 대문자
  params.set('sort', (query?.sort ?? 'latest').toUpperCase());
  if (query?.subjectId) {
    const subjects = await getSubjects();
    const matched = subjects.find((s) => s.subjectId === query.subjectId);
    if (matched) params.set('subject', matched.name);
  }

  const response = await api.get<CourseListApiResponse>(
    `/api/courses?${params.toString()}`,
  );
  if (!response.success || !response.data) return [];

  let courses = response.data.content.map(toCourseListItem);
  if (query?.instructor) {
    courses = courses.filter((c) => c.instructorName === query.instructor);
  }
  return courses;
}

export async function getSubjects(): Promise<Subject[]> {
  if (USE_MOCK) {
    return mockSubjects.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
  }
  const response = await api.get<SubjectApiItem[]>('/api/subjects');
  if (!response.success || !response.data) {
    return mockSubjects.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
  }
  return response.data.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
}

/** 강사 목록 — 백엔드 미지원, 목 강의 데이터에서 파생 */
export function getInstructors(): string[] {
  return Array.from(
    new Set(mockCourseListResponse.content.map((c) => c.instructorName)),
  ).sort();
}
