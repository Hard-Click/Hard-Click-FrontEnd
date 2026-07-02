import { serverApi } from '@/lib/api';
import { isMock } from '@/mocks/config';
import { subjectLabel } from '@/features/courses/subjects';
import { mockInstructorCourses } from '@/mocks/instructor.mock';
import type {
  CourseListApiItem,
  CourseListApiResponse,
} from '@/features/courses/types';
import type { InstructorCourseItem } from './services';

/** 백엔드 CourseListItemResponse → 강사 화면 InstructorCourseItem (studentCount→enrollmentCount) */
function toInstructorCourseItem(c: CourseListApiItem): InstructorCourseItem {
  return {
    courseId: c.courseId,
    title: c.title,
    subjectName: subjectLabel(c.subjectName), // BE raw enum(MATH_1 등) → 한글 라벨 (학생 목록과 동일)
    price: c.price,
    status: c.status,
    thumbnailUrl: c.thumbnailUrl,
    averageRating: c.averageRating,
    reviewCount: c.reviewCount,
    enrollmentCount: c.studentCount,
    createdAt: c.createdAt,
  };
}

/** 강사 내 강의 목록 — 서버 조회 (Server Component 전용).
 * GET /api/instructor/courses — 라이브 검증됨(2026-06-24, demo_instructor 200, CourseListApiResponse shape 일치).
 * isMock('instructor')=false(config)면 실서버. ⚠️ 강사 토큰 필요(학생 토큰은 403). */
export async function getInstructorCoursesServer(
  page = 0,
  size = 20,
): Promise<{ content: InstructorCourseItem[]; totalPages: number }> {
  if (isMock('instructor')) {
    return {
      content: mockInstructorCourses.content.map(toInstructorCourseItem),
      totalPages: mockInstructorCourses.totalPages,
    };
  }
  const res = await serverApi.get<CourseListApiResponse>(
    `/api/instructor/courses?page=${page}&size=${size}`,
  );
  if (res.success && res.data) {
    return {
      content: res.data.content.map(toInstructorCourseItem),
      totalPages: res.data.totalPages,
    };
  }
  return { content: [], totalPages: 0 };
}

/** 강사 대시보드 통계 (전체/공개/숨김 강의·수강생 수·퀴즈 수) */
export interface InstructorDashboardStats {
  totalCourses: number;
  publishedCourses: number;
  hiddenCourses: number;
  totalStudents: number;
  quizCount: number;
}

/** 강사 대시보드 통계 — 서버 조회 (Server Component 전용).
 * GET /api/instructor/dashboard. ⚠️ 강사 토큰 필요. quizCount는 BE도 현재 고정값(퀴즈 mock).
 * 조회 실패 시 0으로 폴백해 대시보드가 깨지지 않게 한다. */
export async function getInstructorDashboardServer(): Promise<InstructorDashboardStats> {
  if (isMock('instructor')) {
    return { totalCourses: 12, publishedCourses: 9, hiddenCourses: 3, totalStudents: 245, quizCount: 36 };
  }
  const res = await serverApi.get<InstructorDashboardStats>(
    '/api/instructor/dashboard',
  );
  if (res.success && res.data) return res.data;
  return { totalCourses: 0, publishedCourses: 0, hiddenCourses: 0, totalStudents: 0, quizCount: 0 };
}
