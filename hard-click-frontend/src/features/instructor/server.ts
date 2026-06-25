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
