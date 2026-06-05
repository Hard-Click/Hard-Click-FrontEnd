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

/** 초 → "MM:SS" */
function formatLessonDuration(seconds: number | null): string {
  const total = seconds ?? 0;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** 백엔드 상세 응답(sections/lessons) → UI CourseDetail */
export function toCourseDetail(data: CourseDetailApiResponse): CourseDetail {
  const sections = data.sections ?? [];
  const allLessons = sections.flatMap((s) => s.lessons);
  const totalSeconds = allLessons.reduce((sum, l) => sum + (l.durationSeconds ?? 0), 0);

  return {
    courseId: data.courseId,
    title: data.title,
    description: data.description,
    subjectName: data.subjectName,
    instructorName: data.instructorName,
    price: data.price,
    isFree: data.priceType === 'FREE',
    thumbnailUrl: data.thumbnailUrl,
    averageRating: data.averageRating,
    reviewCount: data.reviewCount,
    studentCount: data.studentCount,
    status: data.status,
    isEnrolled: false, // 별도 권한 확인 API
    isWishlisted: false,
    isInCart: false,
    learningGoals: data.learningObjectives ?? [],
    targetAudience: data.targetAudience ?? [],
    techTags: data.techTags ?? [],
    materialsProvided: [], // 백엔드 상세 응답 미제공
    level: data.level,
    totalLessons: allLessons.length,
    totalDuration: formatTotalDuration(totalSeconds),
    notices: [], // 별도 API: 강의 공지 목록
    instructor: {
      instructorId: 0, // 상세 응답에 instructorId 없음(강사명만 제공)
      name: data.instructorName,
      subtitle: '',
      bio: '',
      career: [],
      tags: data.techTags ?? [],
      instructorStudentCount: data.instructorStudentCount,
      instructorCourseCount: data.instructorCourseCount,
      instructorRating: data.instructorRating,
    },
    curriculum: sections.map((s) => ({
      sectionId: s.sectionId,
      title: s.title,
      lessons: s.lessons.map((l) => ({
        lessonId: l.lessonId,
        title: l.title,
        duration: formatLessonDuration(l.durationSeconds),
        isPreview: l.isPreview,
      })),
    })),
    reviews: [], // 별도 API: 리뷰 목록
    ratingDistribution: [],
  };
}

/** 백엔드 목록 응답 → UI CourseListItem */
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
    isFree: item.priceType === 'FREE',
    status: item.status,
    createdAt: item.createdAt,
    isEnrolled: false,
    hasPreview: false,
  };
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

  const response = await api.get<CourseListApiResponse>(
    `/api/courses?${params.toString()}`,
  );
  if (!response.success || !response.data) return [];

  let courses = response.data.content.map(toCourseListItem);
  // 강사 필터는 백엔드 미지원 → 클라 후처리
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
