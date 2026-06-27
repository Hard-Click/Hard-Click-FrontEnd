import { serverApi } from '@/lib/api';
import type {
  CourseListItem,
  CourseListQuery,
  CourseDetail,
  Subject,
  CourseListApiItem,
  CourseListApiResponse,
  CourseDetailApiResponse,
} from './types';
import { isMock } from '@/mocks/config';
import {
  mockSubjects,
  mockCourseListResponse,
  mockCourseDetailResponse,
} from '@/mocks/courses.mock';
import { toCourseDetail } from './services';
import { SUBJECTS, subjectLabel, subjectValueById } from './subjects';
import { getCurrentUser } from '@/features/auth/session';

/** 백엔드 목록 응답 → UI CourseListItem */
function toCourseListItem(item: CourseListApiItem): CourseListItem {
  return {
    courseId: item.courseId,
    title: item.title,
    instructorName: item.instructorName,
    subjectName: subjectLabel(item.subjectName), // BE raw enum 이름 → 한글 라벨
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

/**
 * 과목 목록 (필터 드롭다운용).
 * BE는 과목 마스터 API가 없고 SubjectType enum(38 세부과목)을 사용 → FE 상수(subjects.ts)로 제공.
 */
export async function getSubjectsServer(): Promise<Subject[]> {
  if (isMock('courses')) {
    return mockSubjects.map((s) => ({ subjectId: s.subjectId, name: s.subjectName }));
  }
  return SUBJECTS.map((s) => ({ subjectId: s.subjectId, name: s.name }));
}

/** 강의 목록 — 서버 조회 (Server Component 전용) */
export async function getCoursesServer(
  query?: CourseListQuery,
): Promise<CourseListItem[]> {
  if (isMock('courses')) {
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
    const sort = query?.sort ?? 'latest';
    courses = [...courses].sort((a, b) => {
      if (sort === 'popular') return b.studentCount - a.studentCount;
      if (sort === 'rating') return b.averageRating - a.averageRating;
      return b.createdAt.localeCompare(a.createdAt); // latest
    });
    return courses;
  }

  const params = new URLSearchParams();
  params.set('page', '0');
  params.set('size', '100');
  if (query?.keyword) params.set('keyword', query.keyword);
  params.set('sort', (query?.sort ?? 'latest').toUpperCase());

  // 과목 필터: subjectId → BE enum 이름으로 변환해 그대로 전송 (BE가 SubjectType enum으로 필터).
  if (query?.subjectId) {
    const value = subjectValueById(query.subjectId);
    if (value) params.set('subject', value);
  }

  const res = await serverApi.get<CourseListApiResponse>(
    `/api/courses?${params.toString()}`,
  );
  if (!res.success || !res.data) return [];

  let courses = res.data.content.map(toCourseListItem);
  // 강사 필터: BE가 ?instructorName= 를 honor함(라이브 확인 2026-06-27, '김민수'→4개 전부 일치).
  //   현재는 over-fetch 후 client-side 필터 유지. ⚡최적화 대상: query.instructor를 BE 파라미터로 전달.
  if (query?.instructor) {
    courses = courses.filter((c) => c.instructorName === query.instructor);
  }
  return courses;
}

/** 강의 상세 — 서버 조회 (Server Component 전용) */
export async function getCourseDetailServer(
  courseId: number,
): Promise<CourseDetail | null> {
  if (isMock('courses')) {
    return toCourseDetail({ ...mockCourseDetailResponse, courseId });
  }
  const res = await serverApi.get<CourseDetailApiResponse>(
    `/api/courses/${courseId}`,
  );
  if (!res.success || !res.data) return null;
  const detail = toCourseDetail(res.data);

  // 수강/찜/장바구니 여부 보강: 로그인 사용자만 조회한다.
  // BE 상세 응답엔 isEnrolled/isWishlisted/isInCart가 없어 목록 API로 이 강의 포함 여부를 판정한다.
  // 비로그인이면 세 API 모두 401이라 기본값(false) 유지 → 호출 자체를 생략.
  const user = await getCurrentUser();
  if (user) {
    const [enrolled, wishlist, cart] = await Promise.all([
      serverApi.get<{ courseId: number }[]>('/api/enrollments/me?status=ALL'),
      serverApi.get<{ items: { courseId: number }[] }>('/api/wishlist'),
      serverApi.get<{ items: { courseId: number }[] }>('/api/cart'),
    ]);
    if (enrolled.success && Array.isArray(enrolled.data)) {
      detail.isEnrolled = enrolled.data.some((e) => e.courseId === courseId);
    }
    if (wishlist.success && wishlist.data?.items) {
      detail.isWishlisted = wishlist.data.items.some(
        (i) => i.courseId === courseId,
      );
    }
    if (cart.success && cart.data?.items) {
      detail.isInCart = cart.data.items.some((i) => i.courseId === courseId);
    }
  }
  return detail;
}
